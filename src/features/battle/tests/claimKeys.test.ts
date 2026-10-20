import { describe, it, expect, beforeEach } from 'vitest';
import { deriveBattleClaimKey, deriveSiegeClaimKey } from '@/features/battle/logic/claimKeys';
import { hasClaimed, markClaimed } from '@/shared/logic/claimLedger';

/**
 * 幂等批 · 领奖键派生
 *
 * 身份 = **战报自身的 battleId**（每场唯一、随战报持久化）。规则只有一条：
 *   一场战斗 = 一个领奖单元。
 *
 * ── 断言成对存在的理由 ─────────────────────────────────────────────────
 *   A 同一 battleId → 键相等   只测这条：一个常量键就全绿
 *   B 不同 battleId → 键不等   只测这条：随机键也全绿
 *   C 同模式同阵容的两场不同战斗 → 两个键都必须可领
 *     —— 这条是**玩法没被改**的判据。曾经用 `mode + 阵容` 派生，C 会直接红：
 *        那等于把"一场一领"变成"一阵容一领"。
 */

describe('deriveClaimKey', () => {
  it('A: 同一 battleId 两次派生必须相等 —— 跨挂载幂等的前提', () => {
    expect(deriveSiegeClaimKey('siege_abc')).toBe(deriveSiegeClaimKey('siege_abc'));
    expect(deriveBattleClaimKey('battle_abc')).toBe(deriveBattleClaimKey('battle_abc'));
  });

  it('B: 不同 battleId 必须不等（否则两场战斗会互相顶掉奖励）', () => {
    expect(deriveSiegeClaimKey('siege_abc')).not.toBe(deriveSiegeClaimKey('siege_xyz'));
    expect(deriveBattleClaimKey('battle_abc')).not.toBe(deriveBattleClaimKey('battle_xyz'));
  });

  it('C: 同一模式同一阵容的两场战斗，键必须不同（玩法不被改变）', () => {
    // 两场战斗的"内容"完全一样：同样的玩家、同样的阵容、同样的模式。
    // 唯一区别是 battleId —— 而身份就该只由它决定。
    expect(deriveBattleClaimKey('battle_run_1')).not.toBe(deriveBattleClaimKey('battle_run_2'));
  });

  it('攻城与常规战不得共用命名空间（同一 id 也不能撞）', () => {
    expect(deriveSiegeClaimKey('same_id')).not.toBe(deriveBattleClaimKey('same_id'));
  });

  it('空白与大小写归一化：` SIEGE_ABC ` 与 `siege_abc` 是同一场', () => {
    expect(deriveSiegeClaimKey(' SIEGE_ABC ')).toBe(deriveSiegeClaimKey('siege_abc'));
  });

  it('空 battleId 必须抛错，不得静默合并成同一个键', () => {
    // 静默返回 'siege:' 会让所有"没有 id 的战斗"共用一把钥匙，
    // 把彼此奖励顶掉 —— 那是从"多发"变成"少发"，更难被发现。
    expect(() => deriveSiegeClaimKey('')).toThrow(/battleId 为空/);
    expect(() => deriveBattleClaimKey('   ')).toThrow(/battleId 为空/);
  });
});

describe('端到端：派生键 + ledger 的领奖流程', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /** 复刻组件里的领奖流程：先查 ledger，未领过才发货并记账。 */
  const attemptClaim = (key: string, grant: () => void) => {
    if (hasClaimed(key)) return false;
    grant();
    markClaimed(key);
    return true;
  };

  it('同一场战斗重复领奖被拦下，且只发一次货', () => {
    let grants = 0;
    const grant = () => {
      grants += 1;
    };

    const key = deriveSiegeClaimKey('siege_battle_1');
    expect(attemptClaim(key, grant)).toBe(true); // 首次领取
    expect(attemptClaim(key, grant)).toBe(false); // 同一挂载内重复点击
    expect(attemptClaim(deriveSiegeClaimKey('siege_battle_1'), grant)).toBe(false); // 重新派生（模拟重挂载）

    expect(grants).toBe(1);
  });

  it('C 的端到端对照：同阵容的第二场战斗仍然可领', () => {
    let grants = 0;
    const grant = () => {
      grants += 1;
    };

    expect(attemptClaim(deriveBattleClaimKey('battle_run_1'), grant)).toBe(true);
    // 内容完全相同的第二场：只有 battleId 不同，必须可领
    expect(attemptClaim(deriveBattleClaimKey('battle_run_2'), grant)).toBe(true);

    expect(grants).toBe(2);
  });
});
