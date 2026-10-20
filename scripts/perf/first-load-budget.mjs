#!/usr/bin/env node
/**
 * AC-09-2 · 首屏体积预算门禁
 *
 * 用法：
 *   node scripts/perf/first-load-budget.mjs            # 判定并退出 0/1/2
 *   node scripts/perf/first-load-budget.mjs --json     # 机读输出
 *   node scripts/perf/first-load-budget.mjs --dist <dir> --port 4174
 *
 * 退出码语义见 budget.mjs 顶部（1 = 代码问题，2 = 无法判定/环境问题）。
 *
 * 每次运行都会打印三件本可以省略、但省略后就无法追责的东西：
 *   1. index.html 解析出的静态清单（正则解析的结果，不盲信）
 *   2. 启动期 chunk 差集（runtime − static，**算出来的，不手写维护**）
 *   3. 恒等式 runtime = static + Σ启动期chunk 的实测三项
 */

import { measureFirstLoad, EnvironmentError } from './measure.mjs';
import { BUDGET, EXIT, evaluate, formatUnits } from './budget.mjs';

const hasFlag = (name) => process.argv.includes(name);
const getOption = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const jsonMode = hasFlag('--json');
const dist = getOption('--dist', 'dist');
const port = Number(getOption('--port', '4173'));
const routePath = getOption('--path', BUDGET.path);

const main = async () => {
  let measurement;
  try {
    measurement = await measureFirstLoad({ dist, port, path: routePath });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (err instanceof EnvironmentError) {
      // 环境问题 → 2，避免与"体积超标"混成同一个红
      console.error(`[AC-09-2] 无法判定（环境问题）：\n${message}`);
      process.exit(EXIT.UNDECIDABLE);
    }
    console.error(`[AC-09-2] 无法判定（测量失败）：\n${message}`);
    process.exit(EXIT.UNDECIDABLE);
  }

  const verdict = evaluate(measurement, BUDGET);
  const runtime = formatUnits(measurement.runtimeBytes);
  const staticUnits = formatUnits(measurement.staticBytes);
  const startupUnits = formatUnits(measurement.startupBytes);

  if (jsonMode) {
    console.log(
      JSON.stringify(
        {
          verdict: { code: verdict.code, reasons: verdict.reasons, warnings: verdict.warnings },
          budget: {
            path: BUDGET.path,
            baselineBytes: BUDGET.baselineBytes,
            thresholdBytes: BUDGET.thresholdBytes,
            allowed: BUDGET.allowed,
            allowedFavicon: BUDGET.allowedFavicon,
          },
          identity: {
            runtimeBytes: measurement.runtimeBytes,
            staticBytes: measurement.staticBytes,
            startupBytes: measurement.startupBytes,
            holds: measurement.staticBytes + measurement.startupBytes === measurement.runtimeBytes,
          },
          declaredStatic: measurement.declaredStatic,
          startupChunks: measurement.startupChunks,
          faviconRequests: measurement.faviconRequests,
          unitTriplet: { runtime, static: staticUnits, startup: startupUnits },
          measurement,
        },
        null,
        2,
      ),
    );
    process.exit(verdict.code);
  }

  console.log('[AC-09-2] 首屏体积预算门禁');
  console.log(`  被测路径：${measurement.path}（实测落点 ${measurement.finalPath}）`);
  console.log(
    `  采样窗口：load → networkidle → 静置 ${measurement.window.settleMs}ms，实测 ${measurement.window.measuredMs}ms`,
  );
  console.log(
    `  压缩口径：本地 gzip level ${measurement.gzipLevel}；Chrome：${measurement.chromePath}`,
  );
  console.log('');

  console.log('  ① index.html 静态声明（解析结果，逐个列出）：');
  for (const u of measurement.declaredStatic) console.log(`      ${u}`);
  console.log('');

  console.log('  ② 启动期 chunk 差集（runtime − static，算出来的）：');
  if (measurement.startupChunks.length === 0) {
    console.log('      （空集：本次首屏没有超出静态清单的请求）');
  } else {
    for (const a of measurement.startupChunks) {
      console.log(`      +${String(a.bytes).padStart(7)} B  ${a.type.padEnd(10)} ${a.url}`);
    }
  }
  console.log('');

  console.log('  ③ 恒等式 runtime = static + Σ启动期chunk：');
  console.log(
    `      runtime  ${String(runtime.bytes).padStart(7)} B  / ${runtime.kib} / ${runtime.kb}`,
  );
  console.log(
    `      static   ${String(staticUnits.bytes).padStart(7)} B  / ${staticUnits.kib}  (${measurement.staticAssets.length} 条)`,
  );
  console.log(
    `      startup  ${String(startupUnits.bytes).padStart(7)} B  / ${startupUnits.kib}  (${measurement.startupChunks.length} 条)`,
  );
  console.log('');
  console.log(
    `  favicon 请求集合：{${measurement.faviconRequests.join(', ')}} ⊆ {${BUDGET.allowedFavicon.join(', ')}}`,
  );
  console.log('');
  console.log(
    `  预算：baseline ${BUDGET.baselineBytes} B + Σallowed ${BUDGET.allowed.reduce((a, e) => a + e.deltaBytes, 0)} B = threshold ${BUDGET.thresholdBytes} B`,
  );
  console.log('');

  for (const w of verdict.warnings) console.log(`  · ${w}`);
  if (verdict.code === EXIT.PASS) {
    console.log('  ✅ 通过');
  } else {
    console.log('  ❌ 未通过：');
    for (const r of verdict.reasons) console.log(`      - ${r}`);
  }
  process.exit(verdict.code);
};

main().catch((err) => {
  console.error('[AC-09-2] 无法判定（未预期异常）：');
  console.error(err instanceof Error ? err.stack : err);
  process.exit(EXIT.UNDECIDABLE);
});
