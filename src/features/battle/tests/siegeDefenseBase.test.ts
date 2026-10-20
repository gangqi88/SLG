import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * A4 · 攻城结算的防御基数必须与「战斗实际采用的值」一致
 *
 * 缺陷（已实测）：
 *   SiegeView.tsx:44-48 的 getCityById 被 useMemo(…, [targetCityId]) 冻结成页面常量，
 *   战斗用的是 cur(T0)；而结算（WorldMap.applySiegeOutcome）内部又按 currentSec() 重算，
 *   用的是 cur(T1)。城池在战斗中持续修复，于是 T1 的 cur 恒大于 T0。
 *
 * 本条断言的形态刻意**不复制伤害公式**：
 *   同一个冻结基数下，「立刻结算」与「延迟 60s 再结算」必须得到同一个结果。
 *   如果结算自己按墙钟重算，延迟那一次的结果必然更大 —— 这就是要抓的东西。
 *
 * 为什么不用「after === frozen - dmg」：
 *   那会把 production 的伤害公式抄进测试，公式一改测试就假红/假绿，
 *   而它真正要守的不变量是「结算与结算延迟无关」。
 */

const STORAGE_KEY = 'slg_world_map_v1';
const T0 = new Date('2026-01-01T00:00:00.000Z');
/** 先制造修复中状态，再让修复推进到这个时刻取「战斗开始时采用的 cur」 */
const FROZEN_AT_MS = 120_000;

const loadWorldMap = async () => (await import('@/features/alliance/logic/WorldMap')).WorldMap;

/**
 * 跑一次攻城结算，返回结算后的城防值。
 * @param delayMs 战斗持续时长（冻结时刻 → 结算时刻）
 */
const settleWithDelay = async (delayMs: number) => {
  localStorage.clear();
  vi.resetModules();
  vi.setSystemTime(T0);
  const WorldMap = await loadWorldMap();

  // 1) 守方胜一次 → 城池进入「修复中」，cur 低于 max
  WorldMap.applySiegeOutcome({
    cityId: 'c3',
    winner: 'defender',
    attackerDamage: 500,
    defenseBeforeCur: WorldMap.getCityById('c3')?.defenseState.cur ?? 0,
  });

  // 2) 修复推进到冻结时刻：这是战斗开始时采用的值（useMemo 冻结的那个）
  vi.setSystemTime(new Date(T0.getTime() + FROZEN_AT_MS));
  const frozen = WorldMap.getCityById('c3')?.defenseState.cur ?? -1;

  // 3) 战斗持续 delayMs，结算发生在 T1；基数一律用冻结值
  vi.setSystemTime(new Date(T0.getTime() + FROZEN_AT_MS + delayMs));
  WorldMap.applySiegeOutcome({
    cityId: 'c3',
    winner: 'defender',
    attackerDamage: 500,
    defenseBeforeCur: frozen,
  });

  return { frozen, after: WorldMap.getCityById('c3')?.defenseState.cur ?? -1 };
};

describe('A4 攻城结算的防御基数', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it('前提：城池在战斗中确实会修复，T1 的 cur 严格大于冻结值', async () => {
    localStorage.clear();
    vi.resetModules();
    vi.setSystemTime(T0);
    const WorldMap = await loadWorldMap();

    WorldMap.applySiegeOutcome({
      cityId: 'c3',
      winner: 'defender',
      attackerDamage: 500,
      defenseBeforeCur: WorldMap.getCityById('c3')?.defenseState.cur ?? 0,
    });
    vi.setSystemTime(new Date(T0.getTime() + FROZEN_AT_MS));
    const frozen = WorldMap.getCityById('c3')?.defenseState.cur ?? -1;
    vi.setSystemTime(new Date(T0.getTime() + FROZEN_AT_MS + 60_000));
    const atSettlement = WorldMap.getCityById('c3')?.defenseState.cur ?? -1;

    // 前提不成立（两者相等）时，下面的分叉断言就没有意义 —— 先钉住前提。
    expect(atSettlement, '前提失效：战斗中城池没有修复，本用例无法区分两种基数').toBeGreaterThan(
      frozen,
    );
  });

  it('A：结算结果必须与结算延迟无关（基数只能是战斗采用的冻结值）', async () => {
    const immediate = await settleWithDelay(0); // 冻结后立刻结算
    const delayed = await settleWithDelay(60_000); // 战斗打 60s 后才结算

    expect(delayed.frozen).toBe(immediate.frozen); // 同一冻结时刻，基数相同

    // 核心断言：延迟 60s 不该让城防多留血。
    // 若结算按 T1 重算，delayed.after 会明显大于 immediate.after。
    expect(delayed.after, '结算跟着墙钟走：延迟 60s 后城防多留了血').toBe(immediate.after);
  });
});
