import React, { useSyncExternalStore } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * #5 P0 组件级回归守卫 —— useSyncExternalStore 挂载不得无限重渲
 *
 * 这条测试直接复现原始故障机制：store 的 getSnapshot() 若在状态未变时返回新引用，
 * React 的 checkIfSnapshotChanged 会判定「快照变了」并强制重渲 → 死循环，
 * 最终抛 "Maximum update depth exceeded"，整条路由落到 ErrorBoundary。
 *
 * 与 store 级单测的区别：那几条验「契约」，这条验「React 真的不炸」。
 * 浏览器路由冒烟（V-1/V-2）仍不可替代，但这条能在 CI 里 40ms 抓住同类回归。
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

const mount = async (props: ProbeProps) => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  renderCount = 0;
  await act(async () => {
    root.render(<Probe {...props} />);
  });
  // 给足时间让「额外重渲」发生；正常情况下次数应收敛
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 60));
  });
  return { host, root };
};

const unmount = async (host: HTMLElement, root: ReturnType<typeof createRoot>) => {
  await act(async () => {
    root.unmount();
  });
  host.remove();
};

describe('useSyncExternalStore 挂载契约', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
    // React 19 需要显式声明测试环境，否则 act 警告/行为不一致
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('WorldMap 挂载后渲染次数收敛（旧实现在此会抛 Maximum update depth exceeded）', async () => {
    const { WorldMap } = await import('@/features/alliance/logic/WorldMap');
    const props: ProbeProps = {
      subscribe: (l) => WorldMap.subscribe(l),
      getSnapshot: () => WorldMap.getSnapshot(),
    };

    const { host, root } = await mount(props);
    try {
      expect(host.textContent).toBe('6');
      // 正常应为 1~2 次（StrictMode 未启用时 1 次）；10 是宽松上限，
      // 真正要挡的是「成百上千次」那种死循环。
      expect(renderCount).toBeLessThanOrEqual(10);
    } finally {
      await unmount(host, root);
    }
  });

  it('BattleHistory 挂载后渲染次数收敛', async () => {
    const { BattleHistory } = await import('@/shared/logic/battleHistory');
    BattleHistory.add({
      battleId: 'probe-1',
      targetCityId: 'c1',
      endedAtMs: 1_000,
      heroes: [],
    } as never);

    const props: ProbeProps = {
      subscribe: (l) => BattleHistory.subscribe(l),
      getSnapshot: () => BattleHistory.getSnapshot(),
    };

    const { host, root } = await mount(props);
    try {
      expect(host.textContent).toBe('1');
      expect(renderCount).toBeLessThanOrEqual(10);
    } finally {
      await unmount(host, root);
    }
  });
});
