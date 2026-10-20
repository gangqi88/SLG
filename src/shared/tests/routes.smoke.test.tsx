import fs from 'node:fs';
import path from 'node:path';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ts from 'typescript';

/**
 * AC-08 · 路由挂载 smoke（判据已冻结）
 *
 * ═══ Header 六条 ═══════════════════════════════════════════════════════
 *
 * 【1】jsdom 无法 `import` Phaser：`CanvasFeatures.checkInverseAlpha` 调用
 *   `getContext('2d')`，jsdom 返回 null → `null.fillStyle` 抛 TypeError。
 *
 * 【2】失败位置有两种：顶部静态 import 时是**收集阶段**（整文件 `0 test`）；
 *   测试体内动态 import 时是**懒加载 chunk 求值期**（这条可以 try/catch）。
 *   本文件一律测试体内动态 import。
 *
 * 【3】覆盖声明：AC-08 覆盖 **9 条 plain 路由**（含 `/reports`、`/alliance`，
 *   历史真实崩过的那两条）；6 条 PHASER 归浏览器层（AC-09）。
 *
 * 【4】**未使用的静态 import 会被 esbuild 消除** —— 所以「没崩」不能证明「没 import」。
 *   这条解释了为什么本文件禁止任何路由的静态 import。
 *
 * 【5】锚点是**形状断言**：若某路由合法地不渲染内容，正确处置是把它收窄成断言
 *   该路由的已知锚点，**不是删掉整条断言**。
 *
 * 【6】升级口：将来若要覆盖 Phaser，评估 `vi.mock('phaser')`，并接受「被测对象改变」
 *   （验的是 React 层对上假 Phaser）的代价；**不要在豁免表里留空槽**。
 *
 * ═══ 两条类别排除（不是缺陷豁免）═══════════════════════════════════════
 * 这两个模式**只在测试环境出现**（生产没有 `act`）。排除它们不是「容忍产品缺陷」，
 * 是「排除只在测试驱动下产生的一类输出」：
 *   - `An update to ... was not wrapped in act(...)`（组件定时器每 tick 一条，不收敛）
 *   - `A suspended resource finished loading inside a test ...`（懒加载在 act 退出后 resolve）
 * **`excluded_*` 计数仅用于人工审计与趋势观察，不得作为断言** ——
 * 它们取决于挂载时长与机器速度，任何阈值断言都会漂移成 flaky。
 * 若将来要观察趋势，载体是提交的快照对比（变了就提示评审），不是阈值。
 */

const SRC_ROOT = path.resolve(process.cwd(), 'src');
const ROUTER_FILE = path.join(SRC_ROOT, 'router.tsx');

/**
 * PHASER 路由的「缺陷豁免」表：**保持为空**。
 * 6 条 PHASER 路由是「移出判据」，不是「豁免」——豁免宣称跑起来了只有已知错，
 * 而事实是根本没跑起来（import 阶段就崩）。
 */
const PHASER_EXEMPT: Record<string, string> = {};

/** 锚点表：领域词，必须在 [data-testid="route-content"] 内命中，且不能是导航栏文案。 */
const ANCHORS: Record<string, string> = {
  '/': 'NO_ANCHOR', // 该路由内容与导航同构（入口磁贴即导航项），无独立内容锚点
  '/heroes': '武将',
  '/main-city': '城堡',
  '/tasks': '任务系统',
  '/gacha': '英雄召唤',
  '/lootbox': 'Resources & Fragments',
  '/reports': '战报列表',
  '/alliance': '加入或创建联盟',
  '/style-guide': 'Game UI Tokens',
};

/** 类别排除：按**来源**排除测试环境噪声，不按现象。 */
const EXCLUDED_BY_SOURCE: Array<{ name: string; re: RegExp }> = [
  { name: 'excluded_act', re: /An update to .* was not wrapped in act\(/ },
  { name: 'excluded_suspend', re: /A suspended resource finished loading inside a test/ },
];

const FALLBACK_TEXT = 'Loading...';
const ERROR_PAGE_MARKERS = ['Unexpected Application Error!', 'Error handled by React Router'];
const CONTENT_SELECTOR = '[data-testid="route-content"]';
const STABLE_TIMEOUT_MS = 8000;

// ──────────────────────────── 说明符分类 ────────────────────────────

type SpecCounts = {
  relative: number;
  aliasAtSlash: number;
  nodeBuiltin: number;
  bare: number;
  other: number;
  otherSamples: string[];
};

const emptyCounts = (): SpecCounts => ({
  relative: 0,
  aliasAtSlash: 0,
  nodeBuiltin: 0,
  bare: 0,
  other: 0,
  otherSamples: [],
});

const classifySpec = (spec: string, counts: SpecCounts) => {
  if (spec.startsWith('.')) counts.relative += 1;
  else if (spec.startsWith('@/')) counts.aliasAtSlash += 1;
  else if (spec.startsWith('node:')) counts.nodeBuiltin += 1;
  else if (/^[@a-zA-Z0-9]/.test(spec)) counts.bare += 1;
  else {
    counts.other += 1;
    if (counts.otherSamples.length < 5) counts.otherSamples.push(spec);
  }
};

const resolveSpec = (fromFile: string, spec: string): string | null => {
  let base: string;
  if (spec.startsWith('@/')) base = path.join(SRC_ROOT, spec.slice(2));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(fromFile), spec);
  else return null;
  for (const cand of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
  ]) {
    if (fs.existsSync(cand) && fs.statSync(cand).isFile()) return cand;
  }
  return null;
};

const isLocal = (spec: string) => spec.startsWith('.') || spec.startsWith('@/');

const scanFile = (file: string) => {
  const text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const statics: string[] = [];
  const dynamics: string[] = [];
  let nonLiteralDynamic = false;

  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      statics.push(node.moduleSpecifier.text);
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteral(arg)) dynamics.push(arg.text);
      else nonLiteralDynamic = true;
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return { statics, dynamics, nonLiteralDynamic };
};

type GraphResult = {
  phaser: boolean;
  unresolved: string[];
  nonLiteralDynamic: boolean;
  counts: SpecCounts;
};

/** 静态 import 闭包内是否有顶层 `import phaser`。 */
const walkGraph = (entry: string, followDynamic: boolean): GraphResult => {
  const seen = new Set<string>();
  const unresolved: string[] = [];
  const counts = emptyCounts();
  const queue = [entry];
  let phaser = false;
  let nonLiteralDynamic = false;

  while (queue.length > 0) {
    const file = queue.shift() as string;
    if (seen.has(file)) continue;
    seen.add(file);

    const { statics, dynamics, nonLiteralDynamic: hasNonLiteral } = scanFile(file);
    if (hasNonLiteral) nonLiteralDynamic = true;

    const specs = followDynamic ? [...statics, ...dynamics] : statics;
    if (specs.includes('phaser')) phaser = true;

    for (const spec of specs) {
      classifySpec(spec, counts);
      if (!isLocal(spec)) continue;
      const resolved = resolveSpec(file, spec);
      if (resolved) queue.push(resolved);
      else unresolved.push(`${path.relative(SRC_ROOT, file)} -> ${spec}`);
    }
  }
  return { phaser, unresolved, nonLiteralDynamic, counts };
};

// ───────────────────── 路由枚举 + path → lazy 目标 ─────────────────────

const collectLazyMap = (routerFile: string) => {
  const text = fs.readFileSync(routerFile, 'utf8');
  const sf = ts.createSourceFile(routerFile, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const lazy = new Map<string, string>();
  let nonLiteralLazy = false;

  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const init = node.initializer;
      if (ts.isCallExpression(init) && ts.isPropertyAccessExpression(init.expression)) {
        if (init.expression.name.text === 'lazy') {
          const arg = init.arguments[0];
          const body = arg && ts.isArrowFunction(arg) ? arg.body : undefined;
          if (
            body &&
            ts.isCallExpression(body) &&
            body.expression.kind === ts.SyntaxKind.ImportKeyword
          ) {
            const specArg = body.arguments[0];
            if (specArg && ts.isStringLiteral(specArg)) lazy.set(node.name.text, specArg.text);
            else nonLiteralLazy = true;
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return { lazy, nonLiteralLazy };
};

/** 既认 JSX 标签名，也认 `<WithExit Component={X} />` 这种属性传参。 */
const findLazyTag = (node: ts.Node, lazy: Map<string, string>): string | null => {
  let found: string | null = null;
  const fromExpression = (expr: ts.Expression | undefined): string | null => {
    if (!expr) return null;
    if (ts.isIdentifier(expr) && lazy.has(expr.text)) return expr.text;
    if (ts.isJsxExpression(expr) && expr.expression && ts.isIdentifier(expr.expression)) {
      return lazy.has(expr.expression.text) ? expr.expression.text : null;
    }
    return null;
  };
  const visit = (n: ts.Node) => {
    if (found) return;
    if (ts.isJsxSelfClosingElement(n) || ts.isJsxOpeningElement(n)) {
      const tag = n.tagName;
      if (ts.isIdentifier(tag) && lazy.has(tag.text)) {
        found = tag.text;
        return;
      }
      for (const attr of n.attributes.properties) {
        if (!ts.isJsxAttribute(attr)) continue;
        const name = fromExpression(attr.initializer);
        if (name) {
          found = name;
          return;
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return found;
};

const collectPathTargets = (routerFile: string) => {
  const { lazy, nonLiteralLazy } = collectLazyMap(routerFile);
  const text = fs.readFileSync(routerFile, 'utf8');
  const sf = ts.createSourceFile(routerFile, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const map = new Map<string, string>();

  const visit = (node: ts.Node) => {
    if (ts.isObjectLiteralExpression(node)) {
      let routePath: string | null = null;
      let isIndex = false;
      let element: ts.Expression | null = null;
      for (const prop of node.properties) {
        if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) continue;
        const name = prop.name.text;
        if (name === 'path' && ts.isStringLiteral(prop.initializer))
          routePath = prop.initializer.text;
        if (name === 'index' && prop.initializer.kind === ts.SyntaxKind.TrueKeyword) isIndex = true;
        if (name === 'element') element = prop.initializer;
      }
      if (element && (routePath !== null || isIndex)) {
        const tag = findLazyTag(element, lazy);
        if (tag) map.set(isIndex ? '/' : `/${routePath}`, lazy.get(tag) as string);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return { map, nonLiteralLazy };
};

// ───────────── 分类：唯一真源，两处消费（分类测试 / 挂载测试） ─────────────

type Kind = 'phaser' | 'plain' | 'uncertain';
type Classified = { path: string; kind: Kind; reason?: string };

const classifyAll = (routePaths: string[], pathToSpec: Map<string, string>) => {
  const classified: Classified[] = [];
  const counts = emptyCounts();

  for (const routePath of routePaths) {
    const spec = pathToSpec.get(routePath);
    if (!spec) {
      classified.push({ path: routePath, kind: 'uncertain', reason: 'U1: 找不到 lazy 目标' });
      continue;
    }
    const entry = resolveSpec(ROUTER_FILE, spec);
    if (!entry) {
      classified.push({ path: routePath, kind: 'uncertain', reason: `U2: 入口解析失败 ${spec}` });
      continue;
    }
    const staticOnly = walkGraph(entry, false);
    const withDynamic = walkGraph(entry, true);

    counts.relative += withDynamic.counts.relative;
    counts.aliasAtSlash += withDynamic.counts.aliasAtSlash;
    counts.nodeBuiltin += withDynamic.counts.nodeBuiltin;
    counts.bare += withDynamic.counts.bare;
    counts.other += withDynamic.counts.other;
    if (counts.otherSamples.length < 5) {
      counts.otherSamples.push(
        ...withDynamic.counts.otherSamples.slice(0, 5 - counts.otherSamples.length),
      );
    }

    if (staticOnly.unresolved.length > 0 || withDynamic.unresolved.length > 0) {
      const first = [...staticOnly.unresolved, ...withDynamic.unresolved][0];
      classified.push({ path: routePath, kind: 'uncertain', reason: `U2: unresolved ${first}` });
      continue;
    }
    if (withDynamic.nonLiteralDynamic) {
      classified.push({ path: routePath, kind: 'uncertain', reason: 'U3: 非字面量动态 import()' });
      continue;
    }
    if (staticOnly.phaser !== withDynamic.phaser) {
      classified.push({
        path: routePath,
        kind: 'uncertain',
        reason: `U4: 静态=${staticOnly.phaser} 含动态=${withDynamic.phaser}`,
      });
      continue;
    }
    classified.push({ path: routePath, kind: staticOnly.phaser ? 'phaser' : 'plain' });
  }

  return { classified, counts };
};

// ──────────────────────────── 挂载与观测 ────────────────────────────

type Observed = {
  status: 'PASS' | 'FAIL' | 'UNDETERMINED';
  reasons: string[];
  firstFrame: string;
  stableText: string;
  errorCount: number;
  excludedAct: number;
  excludedSuspend: number;
  suggestsSync: boolean;
};

const mountAndJudge = async (
  routes: Parameters<typeof createMemoryRouter>[0],
  routePath: string,
  anchor: string,
): Promise<Observed> => {
  const router = createMemoryRouter(routes, { initialEntries: [routePath] });
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  const errors: string[] = [];
  const errSpy = vi.spyOn(console, 'error').mockImplementation((...a: unknown[]) => {
    errors.push(a.map(String).join(' '));
  });

  try {
    const { LocaleProvider } = await import('@/shared/locale/LocaleProvider');
    await act(async () => {
      root.render(
        <LocaleProvider>
          <RouterProvider router={router} />
        </LocaleProvider>,
      );
    });
  } catch {
    /* 抛错不单独作判据：Router ErrorBoundary 会接住，错误体现在 ②b / ④ */
  }

  const scopeText = () => (host.querySelector(CONTENT_SELECTOR)?.textContent ?? '').trim();
  const firstFrame = scopeText();

  // 轮询至「不再是 fallback」；act 之外的懒加载 chunk 会在这段时间 resolve
  const deadline = Date.now() + STABLE_TIMEOUT_MS;
  let stableText = firstFrame;
  while (Date.now() < deadline) {
    const text = scopeText();
    if (text.length > 0 && text !== FALLBACK_TEXT) {
      stableText = text;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const scope = host.querySelector(CONTENT_SELECTOR);
  const hostText = host.textContent ?? '';

  errSpy.mockRestore();

  // 类别排除（只打印计数，不断言）
  let excludedAct = 0;
  let excludedSuspend = 0;
  const remaining: string[] = [];
  for (const line of errors) {
    const hit = EXCLUDED_BY_SOURCE.find((e) => e.re.test(line));
    if (hit?.name === 'excluded_act') excludedAct += 1;
    else if (hit?.name === 'excluded_suspend') excludedSuspend += 1;
    else remaining.push(line);
  }

  const reasons: string[] = [];

  // ②a 非空 —— 在 scope 上测
  if (!scope) reasons.push('内容容器不存在：GameShell 结构变了或错误页替换了整棵树');
  else if (scope.childElementCount === 0) reasons.push('内容容器为空：没有渲染出任何元素');

  // ②b 错误页 —— 在 host 上测（错误页会替换整棵树）
  for (const marker of ERROR_PAGE_MARKERS) {
    if (hostText.includes(marker)) reasons.push(`渲染落到 ErrorBoundary（含 "${marker}"）`);
  }

  // ⑦ 已离开加载态 + 锚点命中 —— 在 scope 上测
  if (stableText === FALLBACK_TEXT) {
    reasons.push(`未离开加载态：${STABLE_TIMEOUT_MS}ms 后正文仍是 "${FALLBACK_TEXT}"`);
  } else if (anchor === 'NO_ANCHOR') {
    if (stableText.length === 0) reasons.push('无法判定：正文为空，既非 fallback 也无内容');
  } else if (!stableText.includes(anchor)) {
    reasons.push(`稳定态未命中锚点 "${anchor}"`);
  }

  // ④ error = 0（排除测试环境噪声后）
  if (remaining.length > 0) reasons.push(`console.error ${remaining.length} 条（排除噪声后）`);

  try {
    await act(async () => {
      root.unmount();
    });
  } catch {
    /* ignore */
  }
  host.remove();

  const status: Observed['status'] =
    reasons.length === 0 ? 'PASS' : stableText === '' && !scope ? 'UNDETERMINED' : 'FAIL';

  return {
    status,
    reasons,
    firstFrame,
    stableText,
    errorCount: remaining.length,
    excludedAct,
    excludedSuspend,
    suggestsSync: firstFrame !== '' && firstFrame === stableText,
  };
};

// ─────────────── 守卫存在性（防删：mount test 的 B-half 依赖） ───────────────

const STORE_GUARDS: Array<{ file: string; cases: string[] }> = [
  {
    file: 'src/shared/tests/battleHistory.snapshot.test.ts',
    cases: ["'A:", "'B:", "'B2:", "'B3:"],
  },
  {
    file: 'src/features/alliance/tests/WorldMap.snapshot.test.ts',
    cases: ["'A:", "'B1:", "'B2:", "'B3:", "'E:", "'G:"],
  },
];

const enumeratePaths = async () => {
  const { router } = await import('@/router');
  const children = (router.routes[0]?.children ?? []) as Array<{ path?: string; index?: boolean }>;
  return {
    routes: router.routes,
    paths: children.map((c) => (c.index ? '/' : `/${c.path ?? ''}`)),
  };
};

// ──────────────────────────────── 用例 ────────────────────────────────

describe('AC-08 路由挂载 smoke', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('A · 枚举非空（空集保护）', async () => {
    const { paths } = await enumeratePaths();
    process.stdout.write(
      `\n[AC-08] enumerated: ${paths.length}\n${paths.map((p) => `  - ${p}`).join('\n')}\n`,
    );
    expect(paths.length, '路由枚举结果为空：import @/router 失败或结构已变').toBeGreaterThan(0);
  });

  it('B · 分类自洽（无 uncertain、分类别计数、三数相等）', async () => {
    const { paths } = await enumeratePaths();
    const { map } = collectPathTargets(ROUTER_FILE);
    const { classified, counts } = classifyAll(paths, map);

    const phaser = classified.filter((c) => c.kind === 'phaser');
    const plain = classified.filter((c) => c.kind === 'plain');
    const uncertain = classified.filter((c) => c.kind === 'uncertain');

    const rows = classified.map(
      (c) =>
        `${c.path.padEnd(18)} ${
          c.kind === 'phaser'
            ? 'PHASER(SKIPPED: jsdom 无法 import)'
            : c.kind === 'plain'
              ? 'plain'
              : `uncertain  ${c.reason}`
        }`,
    );
    process.stdout.write(
      `\n[AC-08] 分类表\n${rows.join('\n')}\n` +
        `[AC-08] enumerated: ${paths.length}  covered: ${plain.length}  skipped: ${phaser.length}  uncertain: ${uncertain.length}\n` +
        `[AC-08] specifiers: relative=${counts.relative}  alias@/=${counts.aliasAtSlash}  node:=${counts.nodeBuiltin}  bare=${counts.bare}  other=${counts.other}\n`,
    );

    expect(
      uncertain,
      `分类不确定（U1–U4）：\n${uncertain.map((c) => `${c.path} ${c.reason}`).join('\n')}`,
    ).toEqual([]);
    expect(
      plain.length + phaser.length + uncertain.length,
      `三数不自洽：enumerated=${paths.length} covered=${plain.length} skipped=${phaser.length} uncertain=${uncertain.length}`,
    ).toBe(paths.length);
    expect(counts.other, `未知说明符前缀：${counts.otherSamples.join(', ')}`).toBe(0);

    // A5 冲突规则（豁免表为空；非空时两条规则分别防漏撤销 / 路由已删）
    for (const p of Object.keys(PHASER_EXEMPT)) {
      expect(
        phaser.map((c) => c.path),
        `A5-a：${p} 在豁免表但分类为 plain`,
      ).toContain(p);
      expect(paths, `A5-b：${p} 在豁免表但路由已不存在`).toContain(p);
    }
  });

  it('E · 锚点表与 covered 集合相等（双向）', async () => {
    const { paths } = await enumeratePaths();
    const { map } = collectPathTargets(ROUTER_FILE);
    const { classified } = classifyAll(paths, map);
    const covered = classified.filter((c) => c.kind === 'plain').map((c) => c.path);

    const missing = covered.filter((p) => !(p in ANCHORS));
    const extra = Object.keys(ANCHORS).filter((p) => !covered.includes(p));

    expect(missing, `锚点缺失（⑦ 对它们将是空的）：\n${missing.join('\n')}`).toEqual([]);
    expect(extra, `锚点多余（路由已删但锚点还在）：\n${extra.join('\n')}`).toEqual([]);
  });

  it('D · 每条 covered 路由：②a 非空 / ②b 无错误页 / ⑦ 稳定态含锚点 / ④ error=0', async () => {
    const { routes, paths } = await enumeratePaths();
    const { map } = collectPathTargets(ROUTER_FILE);
    const { classified } = classifyAll(paths, map);
    const targets = classified.filter((c) => c.kind === 'plain').map((c) => c.path);

    expect(targets.length, '没有可挂载的 plain 路由：分类可能整体失效').toBeGreaterThan(0);

    const failures: string[] = [];
    const undetermined: string[] = [];
    const rows: string[] = [];

    for (const routePath of targets) {
      const anchor = ANCHORS[routePath] ?? 'NO_ANCHOR';
      const r = await mountAndJudge(routes, routePath, anchor);

      rows.push(
        `${routePath.padEnd(14)} ${r.status.padEnd(13)} anchor=${anchor.padEnd(22)} ` +
          `first=${JSON.stringify(r.firstFrame.slice(0, 18))} ` +
          `err=${r.errorCount} excluded_act=${r.excludedAct} excluded_suspend=${r.excludedSuspend}` +
          `${r.suggestsSync ? ' 诊断:首帧=稳定态(无加载态)' : ''}` +
          `${r.reasons.length ? `\n                 └ ${r.reasons.join(' | ')}` : ''}`,
      );

      if (r.status === 'FAIL') failures.push(`${routePath}: ${r.reasons.join(' | ')}`);
      if (r.status === 'UNDETERMINED') undetermined.push(`${routePath}: ${r.reasons.join(' | ')}`);
    }

    process.stdout.write(`\n[AC-08] 挂载判定（${targets.length} 条 plain）\n${rows.join('\n')}\n`);

    // UNDETERMINED 必须让 verify 非 0 —— 不阻塞的第三态等于第二态
    expect(undetermined, `无法判定（确定性观测失败）：\n${undetermined.join('\n')}`).toEqual([]);
    expect(failures, `判据未通过：\n${failures.join('\n')}`).toEqual([]);
    // 显式超时：9 条路由 × 每条最多 STABLE_TIMEOUT_MS 轮询，默认 5s 在并行跑全套时不够。
    // 这里放宽的是**测试超时**，不是判据窗口（判据窗口固定 8s，见 STABLE_TIMEOUT_MS）。
  }, 90000);

  it('阴性对照：抛错路由会落到 ErrorBoundary（校准 ②b 通道）', async () => {
    // 校准测量仪器：确认「错误页」这条通道真的能观测到。
    const Boom = () => {
      throw new Error('boom');
    };
    const { LocaleProvider } = await import('@/shared/locale/LocaleProvider');
    const router = createMemoryRouter([{ path: '/', element: <Boom /> }], {
      initialEntries: ['/'],
    });
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      await act(async () => {
        root.render(
          <LocaleProvider>
            <RouterProvider router={router} />
          </LocaleProvider>,
        );
      });
    } catch {
      /* 错误由 Router ErrorBoundary 接住 */
    }

    const hostText = host.textContent ?? '';
    errSpy.mockRestore();
    try {
      await act(async () => {
        root.unmount();
      });
    } catch {
      /* ignore */
    }
    host.remove();

    expect(hostText, '阴性对照失效：抛错组件没有渲染出 Router 错误页').toContain(
      'Unexpected Application Error!',
    );
  });

  it('store 级守卫仍然存在（mount test 的 B-half 依赖它们）', () => {
    const missing: string[] = [];
    for (const { file, cases } of STORE_GUARDS) {
      const full = path.resolve(process.cwd(), file);
      const text = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
      for (const caseName of cases) {
        if (!text.includes(`it(${caseName}`)) missing.push(`${file} 缺少 ${caseName}*`);
      }
    }
    expect(missing, `有人删了 store 级守卫：\n${missing.join('\n')}`).toEqual([]);
  });
});
