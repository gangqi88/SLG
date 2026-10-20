import { describe, it, expect, beforeEach } from 'vitest';
import { deriveBattleClaimKey, deriveSiegeClaimKey } from '@/features/battle/logic/claimKeys';
import { hasClaimed, markClaimed } from '@/shared/logic/claimLedger';

/**
 * 幂等批 · 领奖键派生
 *
 * 缺陷：领奖键原来是 `useRef(newClaimKey('siege'))` —— 每次挂载一个随机 UUID。
 * 卸载再挂载就得到一把新钥匙，"同一场战争、同一座城"的奖励可以被反复领取。
 *
 * 本组断言的形态：
 *   A  同一组稳定输入 → 键必须相等（这是"跨挂载幂等"的机制前提）
 *   B  任一输入变化   → 键必须不等（否则会把不同的结算单元合并掉，变成"少发"）
 * A 与 B 必须同时成立：只测 A，一个"常量键"就能全绿；只测 B，随机键也能全绿。
 */

describe('deriveSiegeClaimKey', () => {
  it('A: 同一 (war, city) 两次派生必须相等 —— 这是跨挂载幂等的前提', () => {
    const a = deriveSiegeClaimKey({ warId: 'war_100', cityId: 'c3' });
    const b = deriveSiegeClaimKey({ warId: 'war_100', cityId: 'c3' });
    expect(a).toBe(b);
  });

  it('B: 换城池必须不等（不得把两座城合并成一次结算）', () => {
    expect(deriveSiegeClaimKey({ warId: 'war_100', cityId: 'c3' })).not.toBe(
      deriveSiegeClaimKey({ warId: 'war_100', cityId: 'c5' }),
    );
  });

  it('B: 换战争必须不等（新一场战争应当可以重新领奖）', () => {
    expect(deriveSiegeClaimKey({ warId: 'war_100', cityId: 'c3' })).not.toBe(
      deriveSiegeClaimKey({ warId: 'war_200', cityId: 'c3' }),
    );
  });

  it('无战争时仍然稳定，且与"有战争"不同', () => {
    const a = deriveSiegeClaimKey({ warId: null, cityId: 'c3' });
    const b = deriveSiegeClaimKey({ cityId: 'c3' });
    expect(a).toBe(b);
    expect(a).not.toBe(deriveSiegeClaimKey({ warId: 'war_100', cityId: 'c3' }));
  });

  it('空白与大小写归一化：` C3 ` 与 `c3` 是同一座城', () => {
    expect(deriveSiegeClaimKey({ warId: 'WAR_100', cityId: ' C3 ' })).toBe(
      deriveSiegeClaimKey({ warId: 'war_100', cityId: 'c3' }),
    );
  });
});

describe('deriveBattleClaimKey', () => {
  const args = {
    mode: 'normal',
    attackerHeroIds: ['h1', 'h2', 'h3'],
    defenderHeroIds: ['d1', 'd2'],
  };

  it('A: 同一模式同一阵容两次派生必须相等', () => {
    expect(deriveBattleClaimKey(args)).toBe(deriveBattleClaimKey({ ...args }));
  });

  it('B: 换模式必须不等', () => {
    expect(deriveBattleClaimKey(args)).not.toBe(deriveBattleClaimKey({ ...args, mode: 'tower' }));
  });

  it('B: 换阵容必须不等', () => {
    expect(deriveBattleClaimKey(args)).not.toBe(
      deriveBattleClaimKey({ ...args, attackerHeroIds: ['h1', 'h2', 'h9'] }),
    );
  });

  it('阵容按集合算：换站位不产生新结算单元', () => {
    expect(deriveBattleClaimKey({ ...args, attackerHeroIds: ['h3', 'h1', 'h2'] })).toBe(
      deriveBattleClaimKey(args),
    );
  });
});

describe('端到端：派生键 + ledger 必须拦住第二次领奖', () => {
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

  it('跨挂载（重新派生）后第二次领奖被拦下，且只发一次货', () => {
    let grants = 0;
    const grant = () => {
      grants += 1;
    };

    // 第一次挂载
    const key1 = deriveSiegeClaimKey({ warId: 'war_100', cityId: 'c3' });
    expect(attemptClaim(key1, grant)).toBe(true);

    // 同一挂载内重复点击
    expect(attemptClaim(key1, grant)).toBe(false);

    // 卸载再挂载：键是重新派生出来的，不是从内存里取的
    const key2 = deriveSiegeClaimKey({ warId: 'war_100', cityId: 'c3' });
    expect(attemptClaim(key2, grant)).toBe(false);

    expect(grants).toBe(1);
  });

  it('对照：换一座城仍可领取（证明上面拦下的是"重复"而不是"全部"）', () => {
    let grants = 0;
    const grant = () => {
      grants += 1;
    };

    expect(attemptClaim(deriveSiegeClaimKey({ warId: 'war_100', cityId: 'c3' }), grant)).toBe(true);
    expect(attemptClaim(deriveSiegeClaimKey({ warId: 'war_100', cityId: 'c5' }), grant)).toBe(true);

    expect(grants).toBe(2);
  });
});
