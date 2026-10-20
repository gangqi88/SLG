import fs from 'node:fs';
import path from 'node:path';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ts from 'typescript';

/**
 * AC-08 · 路由挂载 smoke
 *
 * ═══ Header 三要素 ═══════════════════════════════════════════════════════
 *
 * 【1】为什么 Phaser 路由不在这里：失败发生在**收集阶段**，不是用例失败。
 *   jsdom 无法 `import` Phaser：`CanvasFeatures.js:112` 是 `module.exports = init()`，
 *   `require('phaser')` 当场执行 init；`:72` `canvas.getContext('2d')` 由 jsdom 返回 null，
 *   `:74` `context.fillStyle = ...` 抛 TypeError。
 *   实测原文：`Not implemented: HTMLCanvasElement's getContext() method: without installing
 *   the canvas package` + `TypeError: Cannot set properties of null (setting 'fillStyle')`
 *   at `CanvasFeatures.js:74`。表现为 `Tests no tests`（用例一行都没执行）。
 *   **所以任何断言或豁免都无法表达这个状态**，只能移出覆盖范围。
 *   不要再试图加豁免：豁免宣称「跑起来了、只有已知错」，事实是根本没跑起来。
 *
 * 【2】覆盖声明：AC-08 覆盖 **9 条非 Phaser 路由**（含 `/reports`、`/alliance`，
 *   即历史上真实崩过的那两条）；6 条 Phaser 路由归浏览器层（AC-09）。
 *
 * 【3】陷阱：**未使用的静态 import 会被 esbuild 消除**。
 *   有人为了取类型/常量 `import` 了某路由模块、绑定没用上 → 模块根本不会求值 →
 *   测试「不崩」**不能证明「没 import」**。所以本文件禁止任何路由的静态 import。
 *
 * ═══ 一个被实测推翻的假设（别再按它写判据）═══════════════════════════════
 * 原以为「路由抛错 → React 卸载整棵树 → 容器变空 → 用空容器当崩溃签名」。
 * 阴性对照实测：**容器里有 5 个元素**，React Router v7 的内置 ErrorBoundary
 * 渲染出了 `Unexpected Application Error!` 错误页。
 * 所以崩溃签名是**错误页文本 + console.error**，不是空容器；
 * 「容器非空」只作为「什么都没渲染」的弱形状断言保留。
 *
 * ═══ 能力边界 ═══════════════════════════════════════════════════════════
 * jsdom 无真实布局 / CSS / 画布 / 导航。本文件只回答「渲染期会不会崩、有没有报错」，
 * 挡不住「点了没反应」「样式错位」「数据没渲染出来」——那些必须浏览器层验。
 *
 * ═══ 关于零用例自检 ═════════════════════════════════════════════════════
 * **不要加 `afterAll` 做自检**：收集阶段崩时一个 hook 都不会跑（实测 marker 不生成），
 * 它防不住那种崩溃。有效的是测试体内的 `expect(enumerated.length).toBeGreaterThan(0)`
 * ——收集成功才会执行到它。
 */

const SRC_ROOT = path.resolve(process.cwd(), 'src');
const ROUTER_FILE = path.join(SRC_ROOT, 'router.tsx');

/**
 * Phaser 路由的「缺陷豁免」表：**保持为空**。
 * 6 条 Phaser 路由是「移出判据」，不是「豁免」——两者在报告里都像"有一条已知问题"，
 * 但一个是覆盖到位、一个是零覆盖。与 A6 的驱动日志排除（按来源排噪音）也分开管。
 */
const PHASER_EXEMPT: Record<string, string> = {};

const DRIVER_NOISE = [
  /GL Driver Message/i,
  /GPU stall due to ReadPixels/i,
  /Automatic fallback to software WebGL/i,
];
const isDriverNoise = (line: string) => DRIVER_NOISE.some((re) => re.test(line));

// ────────────────────────── 说明符分类（含 other 计数） ──────────────────────────

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
    // 形如 `~/x`、`#/x`、`$/x` 的未知别名前缀：必须冒出来，不能被静默归为第三方
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
  visited: number;
  unresolved: string[];
  nonLiteralDynamic: boolean;
  counts: SpecCounts;
};

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
  return { phaser, visited: seen.size, unresolved, nonLiteralDynamic, counts };
};

// ─────────────────────── 路由枚举 + path→模块（不手写列表） ───────────────────────

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

/** 在 element 里找第一个属于 lazyMap 的组件：既认 JSX 标签，也认 `Component={X}` 传参。 */
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

// ─────────────── 分类：**唯一真源**，两处消费（分类测试 / 挂载测试） ───────────────

type Kind = 'phaser' | 'plain' | 'uncertain';
type Classified = { path: string; kind: Kind; reason?: string };

const classifyAll = (routePaths: string[], pathToSpec: Map<string, string>) => {
  const classified: Classified[] = [];
  const counts = emptyCounts();

  for (const routePath of routePaths) {
    const spec = pathToSpec.get(routePath);
    if (!spec) {
      classified.push({
        path: routePath,
        kind: 'uncertain',
        reason: 'U1: router.tsx 找不到 lazy 目标',
      });
      continue;
    }
    const entry = resolveSpec(ROUTER_FILE, spec);
    if (!entry) {
      // 不能静默丢弃：既不 covered 也不 skipped 会让三个数对不上
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

// ────────────────────────────── 挂载探针 ──────────────────────────────

type MountResult = {
  thrown: unknown;
  errors: string[];
  warns: string[];
  childCount: number;
  hasErrorPage: boolean;
};

/**
 * React Router v7 内置 ErrorBoundary 的错误页标志文本。
 *
 * 实测（阴性对照）：路由渲染抛错时，容器**不会变空**，而是渲染出
 * "Unexpected Application Error!" 错误页（5 个元素）。
 * **所以「容器为空」不是崩溃的签名** —— 用它当判据会漏掉所有抛错路由；
 * 真正的签名是这段文本 + console.error。
 */
const ERROR_PAGE_MARKER = 'Unexpected Application Error';

const mountRoute = async (
  routes: Parameters<typeof createMemoryRouter>[0],
  routePath: string,
): Promise<MountResult> => {
  const router = createMemoryRouter(routes, { initialEntries: [routePath] });
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  const errors: string[] = [];
  const warns: string[] = [];
  const errSpy = vi.spyOn(console, 'error').mockImplementation((...a: unknown[]) => {
    errors.push(a.map(String).join(' '));
  });
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation((...a: unknown[]) => {
    warns.push(a.map(String).join(' '));
  });

  let thrown: unknown = null;
  try {
    const { LocaleProvider } = await import('@/shared/locale/LocaleProvider');
    await act(async () => {
      root.render(
        <LocaleProvider>
          <RouterProvider router={router} />
        </LocaleProvider>,
      );
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 80));
    });
  } catch (e) {
    thrown = e;
  }

  errSpy.mockRestore();
  warnSpy.mockRestore();

  // 必须在 unmount 之前取样
  const childCount = host.childElementCount;
  const hasErrorPage = host.innerHTML.includes(ERROR_PAGE_MARKER);

  try {
    await act(async () => {
      root.unmount();
    });
  } catch {
    /* unmount 失败不影响结论 */
  }
  host.remove();

  return {
    thrown,
    errors: errors.filter((l) => !isDriverNoise(l)),
    warns: warns.filter((l) => !isDriverNoise(l)),
    childCount,
    hasErrorPage,
  };
};

// ─────────────────────────── 守卫存在性（防删） ───────────────────────────

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

  it('路由枚举非空（空集保护）', async () => {
    const { paths } = await enumeratePaths();
    process.stdout.write(
      `\n[AC-08] enumerated: ${paths.length}\n${paths.map((p) => `  - ${p}`).join('\n')}\n`,
    );

    expect(
      paths.length,
      '路由枚举结果为空：import @/router 失败，或 router.routes[0].children 结构已变',
    ).toBeGreaterThan(0);
  });

  it('分类：无 uncertain、说明符分类别计数、三数自洽', async () => {
    const { paths } = await enumeratePaths();
    const { map } = collectPathTargets(ROUTER_FILE);
    const { classified, counts } = classifyAll(paths, map);

    const phaser = classified.filter((c) => c.kind === 'phaser');
    const plain = classified.filter((c) => c.kind === 'plain');
    const uncertain = classified.filter((c) => c.kind === 'uncertain');

    const rows = classified.map(
      (c) =>
        `${c.path.padEnd(18)} ${c.kind.padEnd(9)} ${
          c.kind === 'phaser'
            ? 'SKIPPED(jsdom 无法 import)'
            : c.kind === 'plain'
              ? 'covered'
              : `REASON ${c.reason}`
        }`,
    );

    process.stdout.write(
      `\n[AC-08] 分类表\n${rows.join('\n')}\n` +
        `[AC-08] enumerated: ${paths.length}  covered: ${plain.length}  skipped: ${phaser.length}  uncertain: ${uncertain.length}\n` +
        `[AC-08] specifiers: relative=${counts.relative}  alias@/=${counts.aliasAtSlash}  node:=${counts.nodeBuiltin}  bare=${counts.bare}  other=${counts.other}\n`,
    );

    // 分类不确定时不默认归类
    expect(
      uncertain,
      `分类不确定的路由（U1–U4）：\n${uncertain.map((c) => `${c.path} ${c.reason}`).join('\n')}`,
    ).toEqual([]);

    // 三数自洽：否则 covered+skipped 对不上 enumerated，而没人会发现
    expect(
      plain.length + phaser.length + uncertain.length,
      `三数不自洽：enumerated=${paths.length} covered=${plain.length} skipped=${phaser.length} uncertain=${uncertain.length}`,
    ).toBe(paths.length);

    // 未知说明符前缀必须冒出来（显示 0 才有对照物）
    expect(counts.other, `发现未知说明符前缀（other>0）：${counts.otherSamples.join(', ')}`).toBe(
      0,
    );

    // A5 冲突规则：豁免表为空；非空时两条规则分别防「漏撤销」与「路由已删」
    for (const p of Object.keys(PHASER_EXEMPT)) {
      expect(
        phaser.map((c) => c.path),
        `A5-a：${p} 在豁免表里但分类为 non-PHASER`,
      ).toContain(p);
      expect(paths, `A5-b：${p} 在豁免表里但路由已不存在`).toContain(p);
    }
  });

  it('非 Phaser 路由挂载：不落 ErrorBoundary、容器非空、error / warn / 抛错均为 0', async () => {
    const { routes, paths } = await enumeratePaths();
    const { map } = collectPathTargets(ROUTER_FILE);
    const { classified } = classifyAll(paths, map);
    // 只消费分类结果，不再重算 —— 双真源会造假红
    const targets = classified.filter((c) => c.kind === 'plain').map((c) => c.path);

    expect(targets.length, '没有可挂载的非 Phaser 路由：分类可能整体失效').toBeGreaterThan(0);
    process.stdout.write(`\n[AC-08] 逐个挂载 ${targets.length} 条非 Phaser 路由\n`);

    const failures: string[] = [];
    for (const routePath of targets) {
      const { thrown, errors, warns, childCount, hasErrorPage } = await mountRoute(
        routes,
        routePath,
      );

      // 主判据：落到 Router 内置 ErrorBoundary = 渲染期崩了。
      // 这条**先于**「无错误」类负向断言 —— 否则错误页上的 DOM 会让形状断言平凡通过。
      if (hasErrorPage) {
        failures.push(`${routePath} 渲染落到 ErrorBoundary（Unexpected Application Error）`);
      }
      // 形状断言：完全没渲染出元素也不正常（不是崩溃签名，但值得报）。
      // 若某路由合法地不渲染任何元素（纯数据路由 / Portal-only），这条会假红 ——
      // 正确处置是把它收窄成断言该路由的已知锚点，**不是删掉它**。
      if (childCount === 0) {
        failures.push(`${routePath} 挂载后容器为空：该路由没有渲染出任何元素`);
      }
      if (thrown) failures.push(`${routePath} 抛错: ${String(thrown).slice(0, 300)}`);
      errors.forEach((e) => failures.push(`${routePath} console.error: ${e.slice(0, 300)}`));
      warns.forEach((w) => failures.push(`${routePath} console.warn: ${w.slice(0, 300)}`));
    }

    expect(failures, `非 Phaser 路由挂载出现异常：\n${failures.join('\n')}`).toEqual([]);
  });

  it('阴性对照：抛错路由会落到 ErrorBoundary，且容器并不为空', async () => {
    // 这条是本文件的「测量仪器校验」，它推翻了一个原本被当成常识的假设：
    //   「报错后 React 会把整棵树卸载 → 容器为空 → 用容器空当崩溃签名」
    // 实测结果相反：React Router v7 内置 ErrorBoundary 渲染出错误页，
    // 容器里有 5 个元素，childCount > 0。**所以空容器不是崩溃签名。**
    // 真正的签名是错误页文本（+ console.error）。
    const Boom = () => {
      throw new Error('boom');
    };
    const result = await mountRoute([{ path: '/', element: <Boom /> }], '/');

    expect(result.hasErrorPage, '阴性对照失效：抛错组件没有渲染出 Router 错误页').toBe(true);
    expect(
      result.childCount,
      '阴性对照失效：抛错后容器为空 —— 若真如此，说明 Router 行为变了，本文件对「容器非空」的取舍要重评',
    ).toBeGreaterThan(0);
    expect(
      result.errors.length,
      '阴性对照失效：抛错没有进 console.error 通道（那 A4 的错误通道就有洞）',
    ).toBeGreaterThan(0);
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
    expect(
      missing,
      `有人删了 store 级守卫 —— snapshot.mount.test.tsx 的 B-half 已失效（它只防不死循环，不防缓存永不失效）：\n${missing.join('\n')}`,
    ).toEqual([]);
  });
});
