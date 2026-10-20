#!/usr/bin/env node
/**
 * AC-09-2 自验：证明门禁本身"会红、会绿、会拒判"，而不是只会打印。
 *
 * 四类样本（team-lead 指定）+ 四条边界（我认为缺了就会静默失效）：
 *
 *   S1 超阈            → exit 1
 *   S2 不超阈          → exit 0
 *   S3 恰等于阈值      → exit 0（边界包含关系必须是 ≤，不是 <）
 *   S4 **C2 反例夹具** → 字节从 entry 挪进启动期 chunk，**收益必须算作 ≈0**
 *   S5 无运行时数据    → exit 2（端到端：entry 404，真的一个资产都没拿到）
 *   S6 账本不自洽      → exit 2（threshold ≠ baseline + Σallowed）
 *   S7 favicon 断言    → a) 越界 exit 1  b) 空集必须警告而非静默通过  c) 真实 dist 采集通路
 *   S8 单位双轴        → 102400 必须同时给出 100.00 KiB 与 102.40 kB
 *   S9 被测路径不是 /  → exit 2（换了路径就换了含义）
 *   S10 传 --path      → exit 2（门禁拒绝该参数，不静默忽略）
 *
 * 其中 S5 是**端到端**的（真起 preview、真跑 Chrome、真取退出码），
 * S1–S3 / S6–S8 / S9 是纯判定层的（喂合成 measurement）。
 * 为什么不全做端到端：要造出"恰好超 1 字节"的真实构建不现实；
 * 而全做纯判定又证明不了"CLI 真的把判定码变成退出码"——
 * 所以用 S5 把 CLI 的 code→exit 映射钉住，其余打判定层。
 *
 * S7 为何拆三段：实测发现 headless Chrome 对**简页**不发起 favicon 请求，
 * 而对真实 dist 会发起（应用会改 document.title）。在夹具上做 favicon 端到端
 * 会得出"断言坏掉了"的错误结论 —— 真正的坑是"集合为空时断言空转"，
 * 故 b) 把空集钉成警告，c) 在真实 dist 上验证采集通路。
 */

import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { BUDGET, EXIT, evaluate, formatUnits } from './budget.mjs';

const FIXTURE_ROOT = 'node_modules/.cache/ac09-fixtures';
const CLI = 'scripts/perf/first-load-budget.mjs';

const results = [];
const record = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '  ✅' : '  ❌'} ${name}${detail ? `  —— ${detail}` : ''}`);
};

/** 合成 measurement：默认各项自洽且通过所有"能判吗"的前置检查。 */
const synthetic = (over = {}) => {
  const base = {
    path: '/',
    finalPath: '/',
    assetCount: 2,
    staticBytes: 1000,
    startupBytes: 200,
    runtimeBytes: 1200,
    declaredButMissing: [],
    faviconRequests: ['/favicon.svg'],
    staticAssets: [],
    startupChunks: [],
  };
  return { ...base, ...over };
};

/** 确定性伪随机十六进制串：gzip 后仍有可观体积（不像重复字符会被压没）。 */
const makePayload = (chars) => {
  let seed = 123456789;
  let out = '';
  const hex = '0123456789abcdef';
  for (let i = 0; i < chars; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    out += hex[seed % 16];
  }
  return out;
};

const PAYLOAD = makePayload(40_000);
const PAYLOAD_GZIP = gzipSync(PAYLOAD, { level: 6 }).length;

const writeFixture = (name, files) => {
  const dir = resolve(FIXTURE_ROOT, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const [file, content] of Object.entries(files)) {
    writeFileSync(join(dir, file), content);
  }
  return dir;
};

const html = ({ entry = '/entry.js', icon = '/favicon.svg' } = {}) =>
  `<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="${icon}">` +
  `<title>fixture</title></head><body><script type="module" src="${entry}"></script></body></html>`;

const runCli = (dist, port) => {
  const res = spawnSync(process.execPath, [CLI, '--dist', dist, '--port', String(port), '--json'], {
    encoding: 'utf8',
    timeout: 180_000,
  });
  let parsed = null;
  try {
    parsed = JSON.parse(res.stdout);
  } catch {
    parsed = null;
  }
  return { code: res.status, stdout: res.stdout, stderr: res.stderr, json: parsed };
};

const main = () => {
  const threshold = BUDGET.thresholdBytes;

  console.log('AC-09-2 自验（门禁本身会红/会绿/会拒判）\n');
  console.log(
    `阈值 = ${threshold} B（baseline ${BUDGET.baselineBytes} + 账本 ${threshold - BUDGET.baselineBytes} B）\n`,
  );

  console.log('— 判定层 —');

  // S1 超阈
  {
    const m = synthetic({ runtimeBytes: threshold + 1, staticBytes: threshold + 1 - 200 });
    const v = evaluate(m);
    record('S1 超阈 1 字节', v.code === EXIT.OVER, `code=${v.code}（期望 1）`);
  }

  // S2 不超阈
  {
    const m = synthetic({ runtimeBytes: threshold - 1, staticBytes: threshold - 1 - 200 });
    const v = evaluate(m);
    record('S2 低于阈值 1 字节', v.code === EXIT.PASS, `code=${v.code}（期望 0）`);
  }

  // S3 恰等
  {
    const m = synthetic({ runtimeBytes: threshold, staticBytes: threshold - 200 });
    const v = evaluate(m);
    record('S3 恰等于阈值', v.code === EXIT.PASS, `code=${v.code}（期望 0，边界须含等号）`);
  }

  // S6 账本不自洽
  {
    const broken = { ...BUDGET, thresholdBytes: BUDGET.thresholdBytes + 1 };
    const v = evaluate(synthetic(), broken);
    record('S6 账本不自洽', v.code === EXIT.UNDECIDABLE, `code=${v.code}（期望 2）`);
  }

  // S8 单位双轴
  {
    const u = formatUnits(102_400);
    const ok = u.kib === '100.00 KiB' && u.kb === '102.40 kB';
    record('S8 单位双轴 102400', ok, `${u.kib} / ${u.kb}（期望 100.00 KiB / 102.40 kB）`);
  }

  // S9 路径不是 /
  {
    const v = evaluate(synthetic({ finalPath: '/reports' }));
    record('S9 被测路径不是 /', v.code === EXIT.UNDECIDABLE, `code=${v.code}（期望 2）`);
  }

  // 恒等式被破坏 → 2（测量错乱必须拒判，不能当成红）
  {
    const v = evaluate(synthetic({ runtimeBytes: 1201 }));
    record('恒等式被破坏', v.code === EXIT.UNDECIDABLE, `code=${v.code}（期望 2）`);
  }

  console.log('\n— 端到端（真起 preview + 真跑 Chrome + 真取退出码）—');

  // 夹具 A：payload 在 entry 里（对照）
  const dirA = writeFixture('a-inline', {
    'index.html': html(),
    'entry.js': `window.__pad = "${PAYLOAD}";`,
  });
  // 夹具 B：同一份 payload 挪进启动期 chunk（C2 反例）
  const dirB = writeFixture('b-chunk', {
    'index.html': html({ entry: '/entry.js' }),
    'entry.js': `import('./chunk.js').then(() => { window.__ready = 1; });`,
    'chunk.js': `export const pad = "${PAYLOAD}";`,
  });
  // 夹具 D：声明的 entry 不存在 → 拿不到任何资产 → 必须 exit 2
  const dirD = writeFixture('d-missing', {
    'index.html': html({ entry: '/nope.js' }),
  });

  const a = runCli(dirA, 4181);
  const b = runCli(dirB, 4182);
  const d = runCli(dirD, 4184);

  record('E2E 正常夹具 exit 0', a.code === EXIT.PASS, `exit=${a.code}（期望 0）`);

  // S4 / C2 反例：static 会"以为赚了"，runtime 必须看穿
  {
    const okShape = Boolean(a.json && b.json);
    const staticA = a.json?.identity?.staticBytes ?? 0;
    const staticB = b.json?.identity?.staticBytes ?? 0;
    const runtimeA = a.json?.identity?.runtimeBytes ?? 0;
    const runtimeB = b.json?.identity?.runtimeBytes ?? 0;
    const staticDrop = staticA - staticB;
    const runtimeDrift = Math.abs(runtimeB - runtimeA);
    const staticFools = staticDrop > PAYLOAD_GZIP * 0.5;
    const runtimeHolds = runtimeDrift <= 256;
    record(
      'S4 C2 反例：字节 entry→启动期 chunk，收益须≈0',
      okShape && staticFools && runtimeHolds,
      `static ${staticA}→${staticB}（-${staticDrop}，对照：payload gzip ${PAYLOAD_GZIP} B）` +
        `；runtime ${runtimeA}→${runtimeB}（漂移 ${runtimeDrift} B，须 ≤256）`,
    );
    record(
      'S4b C2 反例：启动期 chunk 被正确识别',
      (b.json?.startupChunks?.length ?? 0) === 1,
      `startupChunks=${b.json?.startupChunks?.length ?? 'null'}（期望 1）`,
    );
  }

  record(
    'S7a favicon 越界 → exit 1（判定层）',
    evaluate(synthetic({ faviconRequests: ['/favicon.ico'] })).code === EXIT.OVER,
    `code=${evaluate(synthetic({ faviconRequests: ['/favicon.ico'] })).code}（期望 1）`,
  );
  record(
    'S7b favicon 集合为空 → 警告而非静默通过（判定层）',
    (() => {
      const v = evaluate(synthetic({ faviconRequests: [] }));
      return v.code === EXIT.PASS && v.warnings.some((w) => w.includes('空转'));
    })(),
    '期望 code=0 且带"空转"警告',
  );

  // S7c 端到端：真实 dist 上浏览器确实发起了 favicon 请求（证明采集通路是通的）。
  // 不在夹具上做，因为实测：简页 headless Chrome 不取 favicon（夹具 C 集合为空），
  // 真实 dist 会取（应用会改 document.title）。夹具上做这项会得出错误结论。
  {
    const real = runCli('dist', 4185);
    const set = real.json?.faviconRequests ?? [];
    record(
      'S7c favicon 采集通路（真实 dist）',
      set.length > 0 && set.every((u) => BUDGET.allowedFavicon.includes(u)),
      `集合=${JSON.stringify(set)}，exit=${real.code}`,
    );
  }
  record('S5 无运行时数据 exit 2', d.code === EXIT.UNDECIDABLE, `exit=${d.code}（期望 2）`);

  // S10：门禁拒绝 --path。不静默忽略 —— 静默忽略会给出"看起来对、其实测了 /"的数。
  {
    const res = spawnSync(
      process.execPath,
      [CLI, '--dist', dirA, '--port', '4186', '--path', '/reports'],
      {
        encoding: 'utf8',
        timeout: 180_000,
      },
    );
    record(
      'S10 传 --path 时拒判 exit 2',
      res.status === EXIT.UNDECIDABLE,
      `exit=${res.status}（期望 2）`,
    );
  }

  const failed = results.filter((r) => !r.ok);
  console.log('');
  console.log(
    `合计 ${results.length} 项，通过 ${results.length - failed.length}，失败 ${failed.length}`,
  );
  if (failed.length > 0) {
    console.log('失败项：');
    for (const f of failed) console.log(`  - ${f.name}（${f.detail}）`);
    process.exit(1);
  }
  console.log('全部通过。');
};

try {
  main();
} finally {
  rmSync(resolve(FIXTURE_ROOT), { recursive: true, force: true });
}
