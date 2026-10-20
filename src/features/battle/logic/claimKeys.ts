/**
 * 战斗结算的「领奖键」派生。
 *
 * ── 为什么必须派生，不能用 newClaimKey() ────────────────────────────────
 * `newClaimKey()` 每次调用生成随机 UUID。原来的写法是
 * `useRef(newClaimKey('siege'))` —— 于是**每次挂载**都得到一把全新的钥匙：
 * 离开页面再回来、React 双挂载、路由重进，都会重新变成"没领过"。
 * ledger 里留下的是 N 条互不相干的记录，它拦不住任何东西。
 *
 * 派生键的语义：**同一个逻辑结算单元只发一次奖励**。
 *   攻城：war（哪场战争）+ city（哪座城）
 *   常规战：mode（模式）+ 双方阵容
 *
 * ── 与 battleId 的区别（重要）────────────────────────────────────────────
 * battleId 标识**一次具体的战斗实例**，用于战报去重与场景内事件关联，
 * 必须是每场战斗唯一的。本模块派生的 key 标识**结算单元**，跨挂载稳定。
 * 两者不能合并：合并会让"同一城池打两场"的两份战报因为 battleId 相同而被去重掉。
 */

/** 归一化：去空白、转小写。避免 'c3' / 'C3 ' / 'c3' 被当成三个不同的城。 */
const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();

/** 阵容身份按**集合**算：同一批英雄换个站位，不该被当成一次新的结算。 */
const lineup = (ids: readonly string[]) => ids.map(norm).filter(Boolean).sort().join('+') || 'none';

/**
 * 攻城：war + city。
 * 没有进行中的战争时用 'no-war' 占位 —— 仍然是稳定的，
 * 不会因为"这次没读战争"就退化成随机键。
 */
export const deriveSiegeClaimKey = (args: { warId?: string | null; cityId?: string | null }) =>
  `siege:${norm(args.warId) || 'no-war'}:${norm(args.cityId) || 'unknown-city'}`;

/**
 * 常规战：mode + 双方阵容。
 *
 * ⚠️ 规格里写的是"battle + round"，但**代码里没有 round 这个概念**：
 * BattleRoute 只从 URL 取 `?mode=`，一场战斗就是一次挂载。
 * 所以这里用「模式 + 双方阵容」作为可用的稳定身份。
 * 后果：同一模式、同一阵容的第二次战斗不再发奖（首次之后即视为已领取）。
 * 若将来引入关卡/回合，应把那个维度加进来，而不是改回随机键。
 */
export const deriveBattleClaimKey = (args: {
  mode: string;
  attackerHeroIds: readonly string[];
  defenderHeroIds: readonly string[];
}) => `battle:${norm(args.mode)}:${lineup(args.attackerHeroIds)}:${lineup(args.defenderHeroIds)}`;
