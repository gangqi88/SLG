/**
 * AC-09-1 · 首屏体积基线测量（只输出数字，不做阈值判断）
 *
 * 口径定义（写死在这里，避免"同一把尺子"漂移）：
 *   - 起服：`vite preview`（服务 dist/，不压缩，原始体积即构建产物）
 *   - 采样：Playwright 冷启动（全新 context = 空 HTTP 缓存），`goto('/')`
 *   - 窗口：load 事件 → networkidle（上限 WAIT_NETWORK_IDLE_MS）→ 再静置 SETTLE_MS
 *   - 计数：resourceType ∈ {script, stylesheet, font} 且 HTTP 200 的响应
 *   - 压缩：本地 zlib.gzipSync(body, { level: 6 }) 重压后取长度
 *     （为什么不用 Content-Length：preview 不压缩，拿到的永远是原始大小；
 *      本地重压才能得到"实际传输字节"的可比数字）
 *   - 单位：同一数字给出 字节 / KiB（1024）/ kB（1000）三种表达
 *
 * 用法：
 *   node scripts/perf/measure-first-load.mjs
 *   node scripts/perf/measure-first-load.mjs --json
 *   CHROME_PATH=/path/to/chrome node scripts/perf/measure-first-load.mjs
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright-core';

const PORT = Number(process.env.PREVIEW_PORT || 4173);
// 显式绑 127.0.0.1：vite preview 默认绑 `localhost`，在部分环境会只监听 ::1，
// 导致 http://127.0.0.1 拿不到（本机实测 502）。绑定写死可让 URL 与监听地址一致。
const HOST = '127.0.0.1';
const BASE_URL = `http://${HOST}:${PORT}/`;
const READY_TIMEOUT_MS = Number(process.env.PREVIEW_READY_TIMEOUT_MS || 60_000);
const WAIT_NETWORK_IDLE_MS = Number(process.env.WAIT_NETWORK_IDLE_MS || 10_000);
const SETTLE_MS = Number(process.env.SETTLE_MS || 1000);
const GZIP_LEVEL = 6;
const COUNTED_TYPES = new Set(['script', 'stylesheet', 'font']);

const jsonMode = process.argv.includes('--json');

/** 系统 Chrome 的候选位置。playwright-core 不带浏览器，必须显式指定可执行文件。 */
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const resolveChrome = () => {
  for (const candidate of CHROME_CANDIDATES) {
    if (existsSync(candidate)) return candidate;
  }
  // 环境缺浏览器时，报错要一眼看出是"环境问题"而不是"门禁算错"。
  throw new Error(
    [
      '未找到可用的 Chrome 可执行文件。',
      '这是环境问题，不是体积门禁的判定结果。',
      '请安装 Chrome，或用 CHROME_PATH 环境变量指向可执行文件。',
      `已尝试：${CHROME_CANDIDATES.join(' | ')}`,
    ].join('\n'),
  );
};

const waitForServer = async () => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < READY_TIMEOUT_MS) {
    try {
      const res = await fetch(BASE_URL, { method: 'GET' });
      if (res.ok) return;
    } catch {
      // 服务还没起来，继续等
    }
    await delay(300);
  }
  throw new Error(`vite preview 未在 ${READY_TIMEOUT_MS}ms 内就绪：${BASE_URL}`);
};

/** 起服失败时用来附上原始输出，避免只报"未就绪"。 */
let previewStderrTail = '';
let previewStdoutTail = '';

/**
 * 直接以 node 启动 vite（不经 npm / shell）。
 * 为什么不用 `npm run preview`：npm 会多套一层 cmd.exe，`child.kill()` 只杀掉外壳，
 * vite 进程残留并继续占住继承的 stdout 管道，导致父进程迟迟不退出。
 * 直连 node 后是单进程，kill 立即生效，且 stderr 可直接收集。
 */
const startPreview = () => {
  const child = spawn(
    process.execPath,
    [
      'node_modules/vite/bin/vite.js',
      'preview',
      '--port',
      String(PORT),
      '--strictPort',
      '--host',
      HOST,
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );
  child.stdout?.on('data', (chunk) => {
    previewStdoutTail = (previewStdoutTail + chunk.toString()).slice(-4000);
  });
  child.stderr?.on('data', (chunk) => {
    previewStderrTail = (previewStderrTail + chunk.toString()).slice(-4000);
  });
  return child;
};

const collectAssets = async (page, records) => {
  page.on('response', (response) => {
    const type = response.request().resourceType();
    if (!COUNTED_TYPES.has(type)) return;
    // 交给后面的统一 await，这里只登记 promise，避免阻塞事件循环。
    records.push(
      (async () => {
        try {
          const body = await response.body();
          const rawBytes = body.length;
          const gzipBytes = gzipSync(body, { level: GZIP_LEVEL }).length;
          return {
            url: new URL(response.url()).pathname,
            type,
            status: response.status(),
            rawBytes,
            gzipBytes,
          };
        } catch (err) {
          return {
            url: new URL(response.url()).pathname,
            type,
            status: response.status(),
            error: err instanceof Error ? err.message : String(err),
          };
        }
      })(),
    );
  });
};

const formatUnits = (bytes) => ({
  bytes,
  kib: `${(bytes / 1024).toFixed(2)} KiB`,
  kb: `${(bytes / 1000).toFixed(2)} kB`,
});

const main = async () => {
  if (!existsSync('dist/index.html')) {
    throw new Error('dist/index.html 不存在。请先执行 `npm run build`（本脚本不负责构建）。');
  }

  const chromePath = resolveChrome();
  const preview = startPreview();
  let browser;
  try {
    await waitForServer();
    browser = await chromium.launch({ executablePath: chromePath, headless: true });
    const context = await browser.newContext(); // 全新 context ⇒ 冷缓存
    const page = await context.newPage();

    const records = [];
    await collectAssets(page, records);

    const windowStart = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle', { timeout: WAIT_NETWORK_IDLE_MS }).catch(() => {
      // 超时不算失败：静态站点可能有长连接；窗口时长会如实打印，便于判断是否被截断。
    });
    await delay(SETTLE_MS);
    const windowMs = Date.now() - windowStart;

    const assets = (await Promise.all(records))
      .filter((a) => a.status === 200 && typeof a.gzipBytes === 'number')
      .sort((a, b) => b.gzipBytes - a.gzipBytes);

    const totalRaw = assets.reduce((sum, a) => sum + a.rawBytes, 0);
    const totalGzip = assets.reduce((sum, a) => sum + a.gzipBytes, 0);
    const runtime = formatUnits(totalGzip);

    if (jsonMode) {
      console.log(
        JSON.stringify(
          {
            window: {
              readyTimeoutMs: READY_TIMEOUT_MS,
              networkIdleMs: WAIT_NETWORK_IDLE_MS,
              settleMs: SETTLE_MS,
              measuredMs: windowMs,
            },
            gzipLevel: GZIP_LEVEL,
            chromePath,
            countedTypes: [...COUNTED_TYPES],
            assetCount: assets.length,
            raw: formatUnits(totalRaw),
            runtime,
            assets,
          },
          null,
          2,
        ),
      );
      return;
    }

    console.log('[AC-09-1] 首屏体积基线（只报数，不做阈值判断）');
    console.log(
      `  采样窗口：load → networkidle(${WAIT_NETWORK_IDLE_MS}ms) → 静置 ${SETTLE_MS}ms，实测 ${windowMs}ms`,
    );
    console.log(
      `  压缩口径：本地 gzip level ${GZIP_LEVEL}；计数类型：${[...COUNTED_TYPES].join(' / ')}`,
    );
    console.log(`  Chrome：${chromePath}`);
    console.log('');
    console.log('  逐项（按 gzip 后降序）：');
    for (const a of assets) {
      console.log(
        `    ${String(a.gzipBytes).padStart(8)} B  ${(a.gzipBytes / 1024).toFixed(2).padStart(8)} KiB  ${a.type.padEnd(10)} ${a.url}`,
      );
    }
    console.log('');
    console.log(
      `  原始合计(raw)   : ${totalRaw} B  /  ${(totalRaw / 1024).toFixed(2)} KiB  /  ${(totalRaw / 1000).toFixed(2)} kB`,
    );
    console.log(`  [runtime] 体积  : ${runtime.bytes} B  /  ${runtime.kib}  /  ${runtime.kb}`);
    console.log(`  资产条目数      : ${assets.length}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
    preview.kill();
  }
};

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  // 起服失败时把 preview 自己的输出一并打出来，否则只看到"未就绪"会绕远路排查。
  if (previewStdoutTail) {
    console.error('\n--- vite preview stdout ---');
    console.error(previewStdoutTail);
  }
  if (previewStderrTail) {
    console.error('\n--- vite preview stderr ---');
    console.error(previewStderrTail);
  }
  process.exit(1);
});
