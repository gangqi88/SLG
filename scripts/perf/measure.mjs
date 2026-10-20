/**
 * 首屏体积测量引擎（被 measure-first-load.mjs 与 first-load-budget.mjs 共用）
 *
 * 口径写死在这里，两个 CLI 只负责展示与判定，避免"同一把尺子"漂移。
 *
 * 关键概念：
 *   runtime       = 页面实际请求并成功拿到的 script/stylesheet/font（本地 gzip level 6 后求和）
 *   static        = runtime 中，URL 出现在 dist/index.html 静态声明里的那部分
 *   启动期 chunk  = runtime − static（差集，**算出来，不手写维护**）
 *
 * 恒等式：runtime === static + Σ(启动期 chunk)
 * 这条恒等式不是"顺便成立"，而是三者由同一次测量切分出来的必然结果；
 * 它真正的用途是抓"测量本身错乱"（比如 static 集合解析错、或某资产被重复计数）。
 */

import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright-core';

export const COUNTED_TYPES = new Set(['script', 'stylesheet', 'font']);
export const GZIP_LEVEL = 6;
export const HOST = '127.0.0.1';

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

/** 缺浏览器时，报错必须一眼看出是环境问题，而不是门禁判错。 */
export class EnvironmentError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

export const resolveChrome = () => {
  for (const candidate of CHROME_CANDIDATES) {
    if (existsSync(candidate)) return candidate;
  }
  throw new EnvironmentError(
    [
      '未找到可用的 Chrome 可执行文件。',
      '这是环境问题（缺少浏览器），不是体积门禁的判定结果。',
      '请安装 Chrome，或用 CHROME_PATH 环境变量指向可执行文件。',
      `已尝试：${CHROME_CANDIDATES.join(' | ')}`,
    ].join('\n'),
  );
};

/**
 * 从 index.html 提取"计入体积预算的静态声明"集合（URL 路径）。
 *
 * 只认三类，且必须按元素+rel 判断，**不能无差别抓所有 src/href**：
 *   <script src>                          → script
 *   <link rel="modulepreload" href>       → script（Vite 的 vendor 预加载）
 *   <link rel="stylesheet" href>          → stylesheet
 *
 * 反例（已踩）：`<link rel="icon" href="/favicon.svg">` 也会被 href 抓到，
 * 但 favicon 不属于 script/stylesheet/font，永远不会出现在 runtime 集合里，
 * 于是被误判成"声明了但没请求到" → 门禁直接 exit 2。
 */
export const parseStaticAssets = (html) => {
  const urls = new Set();
  for (const m of html.matchAll(/<script\b[^>]*\bsrc\s*=\s*"([^"]+)"/g)) {
    if (m[1].startsWith('/')) urls.add(m[1]);
  }
  for (const m of html.matchAll(/<link\b[^>]*>/g)) {
    const tag = m[0];
    const rel = /\brel\s*=\s*"([^"]+)"/.exec(tag)?.[1];
    const href = /\bhref\s*=\s*"([^"]+)"/.exec(tag)?.[1];
    if (!rel || !href || !href.startsWith('/')) continue;
    if (rel === 'stylesheet' || rel === 'modulepreload' || rel === 'preload') urls.add(href);
  }
  return urls;
};

const waitForServer = async (baseUrl, timeoutMs) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(baseUrl, { method: 'GET' });
      if (res.ok) return;
    } catch {
      // 还没起来
    }
    await delay(300);
  }
  throw new EnvironmentError(`vite preview 未在 ${timeoutMs}ms 内就绪：${baseUrl}`);
};

const startPreview = (outDir, port) => {
  const child = spawn(
    process.execPath,
    [
      'node_modules/vite/bin/vite.js',
      'preview',
      '--port',
      String(port),
      '--strictPort',
      '--host',
      HOST,
      '--outDir',
      outDir,
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const tail = { stdout: '', stderr: '' };
  const collect = (key) => (chunk) => {
    tail[key] = (tail[key] + chunk.toString()).slice(-4000);
  };
  child.stdout?.on('data', collect('stdout'));
  child.stderr?.on('data', collect('stderr'));
  return { child, tail };
};

/**
 * @param {object} opts
 * @param {string} opts.dist      构建产物目录（默认 dist）
 * @param {string} opts.path      被测路径（默认 '/'，门禁钉死为 '/'）
 * @param {number} opts.port      preview 端口
 * @param {number} opts.networkIdleMs
 * @param {number} opts.settleMs
 */
export const measureFirstLoad = async (opts = {}) => {
  const dist = opts.dist ?? 'dist';
  const routePath = opts.path ?? '/';
  const port = opts.port ?? 4173;
  const networkIdleMs = opts.networkIdleMs ?? 10_000;
  const settleMs = opts.settleMs ?? 1000;
  const readyTimeoutMs = opts.readyTimeoutMs ?? 60_000;
  const baseUrl = `http://${HOST}:${port}`;

  const indexPath = resolve(dist, 'index.html');
  if (!existsSync(indexPath)) {
    throw new Error(`${indexPath} 不存在。请先执行 \`npm run build\`（本工具不负责构建）。`);
  }
  const staticSet = parseStaticAssets(readFileSync(indexPath, 'utf8'));
  const chromePath = resolveChrome();

  const { child, tail } = startPreview(dist, port);
  let browser;
  try {
    await waitForServer(`${baseUrl}/`, readyTimeoutMs);
    browser = await chromium.launch({ executablePath: chromePath, headless: true });
    const context = await browser.newContext(); // 全新 context ⇒ 冷缓存
    const page = await context.newPage();

    const responses = [];
    page.on('response', (res) => {
      if (!COUNTED_TYPES.has(res.request().resourceType())) return;
      responses.push(
        (async () => {
          try {
            const body = await res.body();
            return {
              url: new URL(res.url()).pathname,
              type: res.request().resourceType(),
              status: res.status(),
              bytes: gzipSync(body, { level: GZIP_LEVEL }).length,
            };
          } catch {
            return null;
          }
        })(),
      );
    });

    // favicon 相关请求全部收集（**不过滤状态码**：404 的 /favicon.ico 正是要抓的东西）
    const faviconRequests = new Set();
    page.on('request', (req) => {
      const pathname = new URL(req.url()).pathname;
      if (/favicon/i.test(pathname)) faviconRequests.add(pathname);
    });

    const windowStart = Date.now();
    await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle', { timeout: networkIdleMs }).catch(() => {});
    await delay(settleMs);
    const windowMs = Date.now() - windowStart;
    const finalPath = new URL(page.url()).pathname;

    const assets = (await Promise.all(responses))
      .filter((a) => a && a.status === 200)
      .sort((a, b) => b.bytes - a.bytes);

    const runtimeAssets = assets.map((a) => ({
      ...a,
      origin: staticSet.has(a.url)
        ? /** @type {const} */ ('static')
        : /** @type {const} */ ('startup'),
    }));
    const staticAssets = runtimeAssets.filter((a) => a.origin === 'static');
    const startupChunks = runtimeAssets.filter((a) => a.origin === 'startup');

    const sum = (list) => list.reduce((acc, a) => acc + a.bytes, 0);

    return {
      path: routePath,
      finalPath,
      dist,
      chromePath,
      gzipLevel: GZIP_LEVEL,
      window: { readyTimeoutMs, networkIdleMs, settleMs, measuredMs: windowMs },
      declaredStatic: [...staticSet].sort(),
      runtimeAssets,
      staticAssets,
      startupChunks,
      staticBytes: sum(staticAssets),
      startupBytes: sum(startupChunks),
      runtimeBytes: sum(runtimeAssets),
      assetCount: runtimeAssets.length,
      faviconRequests: [...faviconRequests].sort(),
      // 声明了却没拿到的静态资产：属于测量异常，调用方应据此判 exit 2
      declaredButMissing: [...staticSet].filter((u) => !runtimeAssets.some((a) => a.url === u)),
    };
  } catch (err) {
    if (err instanceof EnvironmentError) throw err;
    const detail = [tail.stdout, tail.stderr].filter(Boolean).join('\n');
    const wrapped = new Error(
      detail
        ? `${err instanceof Error ? err.message : err}\n--- vite preview ---\n${detail}`
        : String(err),
    );
    throw wrapped;
  } finally {
    if (browser) await browser.close().catch(() => {});
    child.kill();
  }
};
