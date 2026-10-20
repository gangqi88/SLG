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
 * ═══ 能力边界（AC-08 不能替代浏览器层冒烟）═══════════════════════════════
 * 运行环境是 jsdom：没有真实布局、没有 CSS 计算、没有画布、没有导航历史。
 * 因此本文件只回答一个问题：**路由在渲染期会不会崩 / 会不会打出错误**。
 * 它挡不住「点了没反应」「样式错位」「数据没渲染出来」—— 那些必须浏览器层验。
 *
 * ═══ 为什么 Phaser 路由不在覆盖范围内（不是"暂不支持"，是"无法表达"）═══
 * jsdom 无法 `import` Phaser：`CanvasFeatures.checkInverseAlpha` 在**模块求值阶段**
 * 调用 `getContext('2d')`，jsdom 未安装 `canvas` 包 → 返回 null →
 * `TypeError: Cannot set properties of null (setting 'fillStyle')`。
 * 该错误发生在**测试文件收集阶段**，表现为 `0 test`（用例一行都没跑），
 * 所以它**无法用断言或豁免表达**，只能移出本文件覆盖范围。
 * 这 6 条 Phaser 路由由浏览器层冒烟负责。
 * 佐证：`grep -rl "from 'phaser'" --include=*.test.ts*` 为空 —— 仓库里没有任何
 * 测试敢碰 Phaser，本文件是第一个尝试，并在探针阶段撞到上述墙。
 *
 * ═══ 空集保护 ═══════════════════════════════════════════════════════════
 * `enumerated.length > 0` 是**断言**不是注释：零个路由上的"全部通过"是"跳过"的静默版。
 * 每次运行都打印 enumerated / covered / skipped 三个数，只打一个看不出覆盖缺口。
 */

const SRC_ROOT = path.resolve(process.cwd(), 'src');
const ROUTER_FILE = path.join(SRC_ROOT, 'router.tsx');

/**
 * Phaser 路由的「缺陷豁免」表：当前为空。
 * 与 A6 的驱动日志排除不同 —— 这里只允许登记「已知缺陷」，且必须绑定 path。
 * 现在没有任何条目，是因为 Phaser 路由整体移出了覆盖范围（见文件头），
 * 不是因为放宽了判据。
 */
const PHASER_EXEMPT: Record<string, string> = {};

// ────────────────────────────── 模块图分类（A2） ──────────────────────────────

type GraphResult = {
  phaser: boolean;
  visited: number;
  unresolved: string[];
  nonLiteralDynamic: boolean;
};

const resolveSpec = (fromFile: string, spec: string): string | null => {
  let base: string;
  if (spec.startsWith('@/')) base = path.join(SRC_ROOT, spec.slice(2));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(fromFile), spec);
  else return null; // 第三方包：不跟进，由 spec === 'phaser' 单独判定
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

/** BFS 模块图。followDynamic=false 只看静态 import；true 时把 `import()` 目标也算进来。 */
const walkGraph = (entry: string, followDynamic: boolean): GraphResult => {
  const seen = new Set<string>();
  const unresolved: string[] = [];
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
      if (!isLocal(spec)) continue;
      const resolved = resolveSpec(file, spec);
      if (resolved) queue.push(resolved);
      else unresolved.push(`${path.relative(SRC_ROOT, file)} -> ${spec}`);
    }
  }
  return { phaser, visited: seen.size, unresolved, nonLiteralDynamic };
};

// ─────────────────────── 路由枚举 + path→模块 映射（A1） ───────────────────────

/** 从 router.tsx 的 AST 取 `const X = React.lazy(() => import('spec'))` 映射。 */
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

/** 在 element 表达式里找第一个属于 lazyMap 的组件：既认 JSX 标签，也认 `Component={X}` 传参。 */
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
      // <WithExit Component={CityView} /> 这类：组件是属性值，不是标签名
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

/** 从 router.tsx 的 AST 取 path → lazy 目标模块。 */
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

// ───────────────────────────── 挂载探针（A3） ─────────────────────────────

type MountResult = { thrown: unknown; errors: string[]; warns: string[] };

/**
 * 驱动日志：按**来源**排除（chromium 的 GL 后端等），不是按现象排除。
 * 与「缺陷豁免」分开管：这里排除的是无关噪音源，不是把已知缺陷藏起来。
 */
const DRIVER_NOISE = [
  /GL Driver Message/i,
  /GPU stall due to ReadPixels/i,
  /Automatic fallback to software WebGL/i,
];
const isDriverNoise = (line: string) => DRIVER_NOISE.some((re) => re.test(line));

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
    // 给 lazy 路由与异步 effect 一点时间落地
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 80));
    });
  } catch (e) {
    thrown = e;
  }

  errSpy.mockRestore();
  warnSpy.mockRestore();

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
  };
};

// ─────────────────────────────── 守卫存在性 ───────────────────────────────

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

  it('路由枚举非空，且分类表每次可见', async () => {
    const { router } = await import('@/router');
    const children = (router.routes[0]?.children ?? []) as Array<{
      path?: string;
      index?: boolean;
    }>;
    const enumerated = children.map((c) => (c.index ? '/' : `/${c.path ?? ''}`));

    process.stdout.write(`\n[AC-08] enumerated: ${enumerated.length}\n`);
    enumerated.forEach((p) => process.stdout.write(`  - ${p}\n`));

    // 空集保护：零个路由上的「全部通过」= 跳过的静默版
    expect(
      enumerated.length,
      '路由枚举结果为空：import @/router 失败，或 router.routes[0].children 结构已变',
    ).toBeGreaterThan(0);
  });

  it('Ast 分类与冲突规则自洽（PHASER / non-PHASER）', async () => {
    const { router } = await import('@/router');
    const children = (router.routes[0]?.children ?? []) as Array<{
      path?: string;
      index?: boolean;
    }>;
    const enumerated = children.map((c) => (c.index ? '/' : `/${c.path ?? ''}`));

    const { map: pathToSpec, nonLiteralLazy } = collectPathTargets(ROUTER_FILE);

    expect(nonLiteralLazy, 'U1：router.tsx 里存在非字面量的 lazy import()，无法静态分类').toBe(
      false,
    );

    const rows: string[] = [];
    const phaser: string[] = [];
    const plain: string[] = [];
    const uncertain: string[] = [];

    for (const routePath of enumerated) {
      const spec = pathToSpec.get(routePath);
      if (!spec) {
        uncertain.push(`${routePath} (U1: router.tsx 里找不到对应 lazy 目标)`);
        continue;
      }
      const entry = resolveSpec(ROUTER_FILE, spec);
      if (!entry) {
        uncertain.push(`${routePath} (U2: 无法解析入口 ${spec})`);
        continue;
      }
      const staticOnly = walkGraph(entry, false);
      const withDynamic = walkGraph(entry, true);

      if (staticOnly.unresolved.length > 0 || withDynamic.unresolved.length > 0) {
        uncertain.push(
          `${routePath} (U2: unresolved ${[...staticOnly.unresolved, ...withDynamic.unresolved][0]})`,
        );
        continue;
      }
      if (withDynamic.nonLiteralDynamic) {
        uncertain.push(`${routePath} (U3: 存在非字面量动态 import())`);
        continue;
      }
      if (staticOnly.phaser !== withDynamic.phaser) {
        uncertain.push(
          `${routePath} (U4: 静态=${staticOnly.phaser} 含动态=${withDynamic.phaser}，两遍不一致)`,
        );
        continue;
      }

      if (staticOnly.phaser) {
        phaser.push(routePath);
        rows.push(`${routePath.padEnd(18)} PHASER   SKIPPED(jsdom 无法 import)`);
      } else {
        plain.push(routePath);
        rows.push(`${routePath.padEnd(18)} non      covered`);
      }
    }

    process.stdout.write(
      `\n[AC-08] 分类表\n${rows.join('\n')}\n[AC-08] enumerated: ${enumerated.length}  covered: ${plain.length}  skipped: ${phaser.length}\n`,
    );
    if (uncertain.length > 0)
      process.stdout.write(`[AC-08] uncertain:\n  ${uncertain.join('\n  ')}\n`);

    // 分类不确定时不默认归类，直接 fail 并打印
    expect(uncertain, `分类不确定的路由（U1–U4）：\n${uncertain.join('\n')}`).toEqual([]);

    // A5 冲突规则：豁免表当前为空；两条规则为「将来有人加豁免」时保留。
    // 空表时循环体不执行 —— 这是设计意图（现在没有任何豁免），不是死代码：
    // 一旦表非空，下面两句分别防「漏撤销」与「路由已删但豁免没删」。
    for (const p of Object.keys(PHASER_EXEMPT)) {
      expect(phaser, `A5-a：${p} 在豁免表里但分类为 non-PHASER，豁免漏了撤销`).toContain(p);
      expect(enumerated, `A5-b：${p} 在豁免表里但路由已不存在，豁免没跟着删`).toContain(p);
    }
  });

  it('非 Phaser 路由挂载：error / warn / 抛错均为 0', async () => {
    const { router } = await import('@/router');
    const routes = router.routes;
    const children = (routes[0]?.children ?? []) as Array<{ path?: string; index?: boolean }>;
    const enumerated = children.map((c) => (c.index ? '/' : `/${c.path ?? ''}`));

    const { map: pathToSpec } = collectPathTargets(ROUTER_FILE);
    const targets: string[] = [];
    for (const routePath of enumerated) {
      const spec = pathToSpec.get(routePath);
      const entry = spec ? resolveSpec(ROUTER_FILE, spec) : null;
      if (entry && !walkGraph(entry, false).phaser) targets.push(routePath);
    }

    process.stdout.write(`\n[AC-08] 逐个挂载 ${targets.length} 条非 Phaser 路由\n`);

    const failures: string[] = [];
    for (const routePath of targets) {
      const { thrown, errors, warns } = await mountRoute(routes, routePath);
      if (thrown) failures.push(`${routePath} 抛错: ${String(thrown).slice(0, 300)}`);
      errors.forEach((e) => failures.push(`${routePath} console.error: ${e.slice(0, 300)}`));
      warns.forEach((w) => failures.push(`${routePath} console.warn: ${w.slice(0, 300)}`));
    }

    expect(failures, `非 Phaser 路由挂载出现异常：\n${failures.join('\n')}`).toEqual([]);
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
