import { describe, it, expect } from 'vitest';
import { buildSiegeCityFields, type SiegeCitySnapshot } from '@/features/battle/logic/siegeReport';

/**
 * A4 的第二半：战报里的「城防耐久 before」必须取战斗开始时冻结的值。
 *
 * 用的是 A4 实测出来的具体数字（c3 洛阳，Δt=120s）：
 *   冻结值 688（战斗实际采用），结算瞬间重算值 719。
 * 若 before 取到 719，战报就会显示「719 → xxx」，而战斗是按 688 打的。
 */

const snap = (cur: number, name = '洛阳', owner: string | null = null): SiegeCitySnapshot => ({
  defenseState: { cur },
  name,
  ownerAllianceName: owner,
});

describe('buildSiegeCityFields', () => {
  it('before 取冻结值，不取结算瞬间重算值', () => {
    const frozen = snap(688);
    const after = snap(700);

    const f = buildSiegeCityFields({ frozen, after });

    expect(f.cityDefenseBefore).toBe(688);
    expect(f.cityDefenseAfter).toBe(700);
    // 反向对照：两个值确实不同，否则本用例无法区分两种来源
    expect(f.cityDefenseBefore).not.toBe(after.defenseState.cur);
  });

  it('即使 after 的 cur 远大于 frozen，before 仍不得被污染', () => {
    const f = buildSiegeCityFields({ frozen: snap(688), after: snap(719) });
    expect(f.cityDefenseBefore).toBe(688);
  });

  it('归属变化同样取 before 的冻结快照', () => {
    const f = buildSiegeCityFields({
      frozen: snap(688, '洛阳', '黄巾'),
      after: snap(760, '洛阳', '本盟'),
    });
    expect(f.cityOwnerBefore).toBe('黄巾');
    expect(f.cityOwnerAfter).toBe('本盟');
  });

  it('城池不存在时各字段为 null，不伪造数值', () => {
    const f = buildSiegeCityFields({ frozen: null, after: null });
    expect(f.cityDefenseBefore).toBeNull();
    expect(f.cityDefenseAfter).toBeNull();
    expect(f.targetCityName).toBeNull();
  });
});
