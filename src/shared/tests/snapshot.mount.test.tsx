import React, { useSyncExternalStore } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * 组件级挂载守卫 —— useSyncExternalStore 的 getSnapshot 引用稳定性
 *
 * 复现的故障机制：store 的 getSnapshot() 若在状态未变时返回新引用，React 的
 * checkIfSnapshotChanged 会判定「快照变了」并强制重渲 → 死循环，最终抛
 * "Maximum update depth exceeded"，整条路由落到 ErrorBoundary。
 *
 * ── 两条耦合关系（不写下来，下一个人会删错东西）────────────────────────
 *
 * 1) 下面的 FIRST 断言【不能单独存在】。
 *    React 的 warn-once 是「模块级静态标志」—— 每进程只警告一次。
 *    一旦在别的用例里消耗掉，后续违规用例在坏实现上也会通过。
 *    所以 FIRST 必须与 SECOND（抛错）和 renderCount 一起看；单靠它会漏。
 *
 * 2) 本文件【只防「不死循环」，不防「缓存永不失效」】。
 *    后者的守卫在 store 级测试里：
 *      · battleHistory.snapshot.test.ts 的 B / B2 / B3
 *      · WorldMap.snapshot.test.ts 的 B1 / B2 / B3 / E / G
 *    删掉那些 B 组断言 = 把那个洞重新打开，本文件补不上。
 *
 * 与浏览器冒烟（V-1/V-2）的区别：这条不验路由、不验 ErrorBoundary，
 * 只验「React 挂载不炸」，能在 CI 里 ~40ms 抓住同类回归。
 */

type ProbeProps = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => readonly unknown[];
};

let renderCount = 0;

const Probe: React.FC<ProbeProps> = ({ subscribe, getSnapshot }) => {
  renderCount += 1;
  const items = useSyncExternalStore(subscribe, getSnapshot);
  return <div data-testid="count">{items.length}</div>;
};

type MountProbeResult = {
  host: HTMLElement;
  root: ReturnType<typeof createRoot>;
  thrown: unknown;
  consoleErrorText: string;
  spy: ReturnType<typeof vi.spyOn>;
};

/**
 * 挂载并按「故障可见」的方式收集三样东西：抛出的异常、React 的 console.error 文案、
 * 渲染次数。
 *
 * 这里的 try/catch 【不是吞错，是为了让断言能够被求值】：
 * 若裸调用 root.render()，坏实现会在渲染期直接抛出 Maximum update depth，
 * 测试在那一行就结束 —— 后面 FIRST / renderCount 两条断言根本没机会运行，
 * 于是「断言存在」变成了「断言从未执行」（我们已经在 renderCount 上吃过一次）。
 * catch 下来存进 thrown，由 SECOND 断言显式判它是否为 null。
 */
const mountProbe = async (props: ProbeProps): Promise<MountProbeResult> => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  renderCount = 0;

  let thrown: unknown = null;
  try {
    await act(async () => {
      root.render(<Probe {...props} />);
    });
  } catch (error) {
    thrown = error;
  }

  const consoleErrorText = spy.mock.calls.map((call) => String(call[0])).join('\n');
  return { host, root, thrown, consoleErrorText, spy };
};

const unmountProbe = async ({ host, root, spy }: MountProbeResult) => {
  spy.mockRestore();
  await act(async () => {
    root.unmount();
  });
  host.remove();
};

describe('useSyncExternalStore 挂载契约', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
    // React 19 需要显式声明测试环境，否则 act 行为不一致
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('WorldMap 挂载不会无限重渲（旧实现会抛 Maximum update depth）', async () => {
    const { WorldMap } = await import('@/features/alliance/logic/WorldMap');
    const probe = await mountProbe({
      subscribe: (listener) => WorldMap.subscribe(listener),
      getSnapshot: () => WorldMap.getSnapshot(),
    });

    try {
      // FIRST：抓「慢泄漏」——每秒多渲几次但还没到抛错的程度。
      // React 的原生文案不指名 getSnapshot，所以这里换成病因级消息。
      expect(
        probe.consoleErrorText,
        'getSnapshot 在状态未变时返回了新引用：React 已报 should be cached',
      ).not.toContain('The result of getSnapshot should be cached');

      // SECOND：抓「确定性崩溃」。
      expect(
        probe.thrown,
        '挂载抛错（Maximum update depth）通常意味 getSnapshot 返回新引用，应缓存同一引用',
      ).toBeNull();

      // 第三条：抓「没抛错、也没 warn，但渲了很多次」。
      // 已修 = 1；原始实现约 54。
      // #3 机制前提：renderCount 为 0 时 `<= 2` 恒真（根本没渲染也算"收敛"）。
      expect(renderCount, '一次都没渲染：收敛断言对它没有意义').toBeGreaterThan(0);
      expect(renderCount, `挂载渲染了 ${renderCount} 次，超出收敛上限 2 次`).toBeLessThanOrEqual(2);

      // 值断言从 store 派生，不写死 6 —— 否则 baseCities 一变就误红。
      // #4 机制前提：store 为空时 "0" === "0" 也会通过，那是空集恒真。
      expect(
        WorldMap.getSnapshot().length,
        'store 为空：textContent 与长度的比较会变成 "0"==="0"',
      ).toBeGreaterThan(0);
      expect(probe.host.textContent).toBe(String(WorldMap.getSnapshot().length));
    } finally {
      await unmountProbe(probe);
    }
  });

  it('BattleHistory 挂载不会无限重渲', async () => {
    const { BattleHistory } = await import('@/shared/logic/battleHistory');
    BattleHistory.add({
      battleId: 'probe-1',
      targetCityId: 'c1',
      endedAtMs: 1_000,
      heroes: [],
    } as never);

    const probe = await mountProbe({
      subscribe: (listener) => BattleHistory.subscribe(listener),
      getSnapshot: () => BattleHistory.getSnapshot(),
    });

    try {
      expect(
        probe.consoleErrorText,
        'getSnapshot 在状态未变时返回了新引用：React 已报 should be cached',
      ).not.toContain('The result of getSnapshot should be cached');

      expect(
        probe.thrown,
        '挂载抛错（Maximum update depth）通常意味 getSnapshot 返回新引用，应缓存同一引用',
      ).toBeNull();

      // #3 机制前提：同上，0 次渲染时 `<= 2` 恒真。
      expect(renderCount, '一次都没渲染：收敛断言对它没有意义').toBeGreaterThan(0);
      expect(renderCount, `挂载渲染了 ${renderCount} 次，超出收敛上限 2 次`).toBeLessThanOrEqual(2);

      // #4 机制前提：同上，store 为空时 "0" === "0" 也会通过。
      expect(
        BattleHistory.getSnapshot().length,
        'store 为空：textContent 与长度的比较会变成 "0"==="0"',
      ).toBeGreaterThan(0);
      expect(probe.host.textContent).toBe(String(BattleHistory.getSnapshot().length));
    } finally {
      await unmountProbe(probe);
    }
  });
});
