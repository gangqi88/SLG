import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * #5 P0 回归守卫 —— BattleHistory 快照引用稳定性
 *
 * 背景：/reports 冷启动直达即崩（Maximum update depth exceeded）。
 * 根因：getSnapshot() 每次 JSON.parse 后重新 sort，返回新数组；
 *       交给 useSyncExternalStore 后快照永不相等 → 无限重渲。
 *
 * 两条断言必须成对存在（互为反向对照）：
 *   A. 同刻两次调用 → Object.is 相等   抓「引用不稳」（当前 P0）
 *   B. 写入后调用   → 不相等           抓「缓存永不失效」
 * 只有 A 单条时，一个「永远返回新对象」的退化实现能通过；只有 B 单条时，
 * 一个「永远返回同一对象」的退化实现也能通过。两条同时绿才夹住不变量。
 */

const STORAGE_KEY = 'slg_battle_history_v1';

const loadStore = async () => (await import('@/shared/logic/battleHistory')).BattleHistory;

const sampleResult = (battleId: string) =>
  ({
    battleId,
    targetCityId: 'c1',
    endedAtMs: 1_000,
    winner: 'attacker',
    heroes: [],
  }) as unknown as Parameters<Awaited<ReturnType<typeof loadStore>>['add']>[0];

describe('BattleHistory.getSnapshot 契约', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // A —— 抓「引用不稳」。当前未修复代码上必红。
  it('A: 同一时刻连续两次 getSnapshot() 必须 Object.is 相等', async () => {
    const BattleHistory = await loadStore();
    BattleHistory.add(sampleResult('b-1'));

    const first = BattleHistory.getSnapshot();
    const second = BattleHistory.getSnapshot();

    expect(Object.is(first, second)).toBe(true);
  });

  // B —— 抓「缓存永不失效」。当前未修复代码上本来就是绿的（每次都新数组），
  //      它的价值来自与 A 成对：只做永久缓存的错误修法会让它变红。
  it('B: add() 之后 getSnapshot() 必须返回与调用前不同的快照', async () => {
    const BattleHistory = await loadStore();
    const before = BattleHistory.getSnapshot();

    BattleHistory.add(sampleResult('b-2'));

    const after = BattleHistory.getSnapshot();
    expect(after).not.toBe(before);
    expect(after.some((r) => r.battleId === 'b-2')).toBe(true);
  });

  it('B2: clear() 之后 getSnapshot() 必须返回与调用前不同的快照', async () => {
    const BattleHistory = await loadStore();
    BattleHistory.add(sampleResult('b-3'));
    const before = BattleHistory.getSnapshot();

    BattleHistory.clear();

    const after = BattleHistory.getSnapshot();
    expect(after).not.toBe(before);
    expect(after).toHaveLength(0);
  });

  // B3 —— 字段更新必须与落盘解耦。
  // save() 顶部有 `if (typeof localStorage === 'undefined') return;` 早退守卫；
  // 若实现把「更新字段」写在 save() 内部（守卫之后），无 localStorage 时就不会更新
  // → 本条必红。正确实现应「先更新 items，再 save()」。
  it('B3: localStorage 不可用时 clear() 仍须让快照变空', async () => {
    const BattleHistory = await loadStore();
    BattleHistory.add(sampleResult('b-5'));
    expect(BattleHistory.getSnapshot()).toHaveLength(1);

    vi.stubGlobal('localStorage', undefined);

    expect(() => BattleHistory.clear()).not.toThrow();
    expect(BattleHistory.getSnapshot()).toHaveLength(0);

    vi.unstubAllGlobals();
  });

  // C —— 值语义：排序与去重仍然正确（防止为了「引用稳定」把逻辑改坏）
  it('C: 快照按 endedAtMs 倒序，且重复 battleId 不入库', async () => {
    const BattleHistory = await loadStore();
    const base = { targetCityId: 'c1', winner: 'attacker', heroes: [] };
    BattleHistory.add({ ...base, battleId: 'old', endedAtMs: 1_000 } as never);
    BattleHistory.add({ ...base, battleId: 'new', endedAtMs: 2_000 } as never);
    BattleHistory.add({ ...base, battleId: 'new', endedAtMs: 2_000 } as never);

    const snap = BattleHistory.getSnapshot();
    expect(snap.map((r) => r.battleId)).toEqual(['new', 'old']);
  });

  // F —— 容量上限：满 50 条后被挤出的必须是最旧的。
  // 只断言「能读到新条目」会漏掉截断逻辑坏掉的情况。
  it('F: 超过 50 条时保留最新 50 条，最旧的被挤出', async () => {
    const BattleHistory = await loadStore();
    const base = { targetCityId: 'c1', winner: 'attacker', heroes: [] };
    for (let i = 0; i < 55; i += 1) {
      BattleHistory.add({ ...base, battleId: `cap-${i}`, endedAtMs: i } as never);
    }

    const snap = BattleHistory.getSnapshot();
    expect(snap).toHaveLength(50);
    expect(snap[0].battleId).toBe('cap-54');
    expect(snap.some((r) => r.battleId === 'cap-4')).toBe(false);
    expect(snap.some((r) => r.battleId === 'cap-5')).toBe(true);
  });

  // D —— 存储不可用时不抛错（原有容错行为不得回归）
  it('D: localStorage 不可用时 add/getSnapshot 均不抛错', async () => {
    const BattleHistory = await loadStore();
    vi.stubGlobal('localStorage', undefined);

    expect(() => BattleHistory.add(sampleResult('b-4'))).not.toThrow();
    expect(() => BattleHistory.getSnapshot()).not.toThrow();

    vi.unstubAllGlobals();
  });

  it('E: 构造后首次读取即可见已持久化数据（load-once 语义）', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ battleId: 'persisted', targetCityId: 'c1', endedAtMs: 9_000, heroes: [] }]),
    );
    const BattleHistory = await loadStore();

    expect(BattleHistory.getSnapshot().map((r) => r.battleId)).toEqual(['persisted']);
  });
});
