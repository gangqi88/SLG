#!/usr/bin/env node
/**
 * AC-09-1 · 首屏体积基线测量（只输出数字，不做阈值判断）
 *
 * 测量引擎在 measure.mjs（与 first-load-budget.mjs 共用同一套口径）。
 * 本文件只是展示层：把数字按"字节 / KiB / kB"三标签打出来。
 *
 * 用法：
 *   node scripts/perf/measure-first-load.mjs
 *   node scripts/perf/measure-first-load.mjs --json
 *   CHROME_PATH=/path/to/chrome node scripts/perf/measure-first-load.mjs
 *
 * 口径（改动会影响历史可比性，务必同步 measure.mjs 顶部注释）：
 *   - 起服：vite preview 直连 dist/（不压缩，故 Content-Length 是原始大小，不能直接用）
 *   - 采样：Playwright 全新 context ⇒ 空 HTTP 缓存（冷启动）
 *   - 窗口：load → networkidle(上限 10s) → 静置 1s
 *   - 计数：resourceType ∈ {script, stylesheet, font} 且 HTTP 200
 *   - 压缩：本地 zlib.gzipSync(body, { level: 6 }) 重压后取长度
 */

import { measureFirstLoad } from './measure.mjs';
import { formatUnits } from './budget.mjs';

const hasFlag = (name) => process.argv.includes(name);
const getOption = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const jsonMode = hasFlag('--json');
const dist = getOption('--dist', 'dist');
const routePath = getOption('--path', '/');

const main = async () => {
  const m = await measureFirstLoad({ dist, path: routePath });
  const runtime = formatUnits(m.runtimeBytes);
  const rawTotal = m.runtimeAssets.reduce((sum, a) => sum + a.bytes, 0);

  if (jsonMode) {
    console.log(
      JSON.stringify(
        {
          path: m.path,
          window: m.window,
          gzipLevel: m.gzipLevel,
          chromePath: m.chromePath,
          assetCount: m.assetCount,
          raw: formatUnits(rawTotal),
          runtime,
          declaredStatic: m.declaredStatic,
          startupChunks: m.startupChunks,
          assets: m.runtimeAssets,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log('[AC-09-1] 首屏体积基线（只报数，不做阈值判断）');
  console.log(
    `  采样窗口：load → networkidle(${m.window.networkIdleMs}ms) → 静置 ${m.window.settleMs}ms，实测 ${m.window.measuredMs}ms`,
  );
  console.log(`  压缩口径：本地 gzip level ${m.gzipLevel}；计数类型：script / stylesheet / font`);
  console.log(`  Chrome：${m.chromePath}`);
  console.log('');
  console.log('  逐项（按 gzip 后降序）：');
  for (const a of m.runtimeAssets) {
    console.log(
      `    ${String(a.bytes).padStart(8)} B  ${(a.bytes / 1024).toFixed(2).padStart(8)} KiB  ${a.type.padEnd(10)} ${a.url}`,
    );
  }
  console.log('');
  console.log(
    `  原始合计(raw)   : ${rawTotal} B  /  ${(rawTotal / 1024).toFixed(2)} KiB  /  ${(rawTotal / 1000).toFixed(2)} kB`,
  );
  console.log(`  [runtime] 体积  : ${runtime.bytes} B  /  ${runtime.kib}  /  ${runtime.kb}`);
  console.log(`  资产条目数      : ${m.assetCount}`);
};

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
