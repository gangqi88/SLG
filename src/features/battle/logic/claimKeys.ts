/**
 * 战斗结算的「领奖键」派生。
 *
 * ── 身份用谁 ──────────────────────────────────────────────────────────
 * 用**战报自身的 `battleId`**（`BattleResult.battleId`，必填字段）。
 *
 * 它就是「一场战斗」的持久化身份：
 *   · 每场唯一 —— 每次结算生成一个，写进战报，battleHistory.add 以它去重
 *   · 跨挂载稳定 —— 它随战报被持久化，重新读到的是同一场战斗
 *
 * 所以派生规则只有一条：**一场战斗 = 一个领奖单元**。
 *
 * ── 为什么不用 mode / 阵容 / 城池派生（曾经写错，勿回退）──────────────
 * 曾用 `battle:${mode}:${阵容}` 作为身份。那是**玩法变更**，不是幂等修复：
 * 同一模式同一阵容的第二场战斗会拿不到奖励 —— 从「一场一领」变成「一阵容一领」。
 * `round` 这个维度在代码里不存在；这里缺的不是"更粗的粒度"，而是"这一场的实例标识"，
 * 而实例标识已经有了，就是 battleId。
 *
 * ── 与"每次挂载随机"的区别 ────────────────────────────────────────────
 * 原来的写法把 key 绑在一个**组件内的可变 ref** 上（claimKeyRef，在 effect 里赋值）。
 * 本模块把它改成**从已产生的战报派生**：key 由数据决定，不由"组件这一刻的状态"决定。
 * 少了这条 ref，就不存在"ref 还没赋值 / 被重新赋值 / effect 顺序变了"这一类漂移。
 */

const norm = (s: string) => s.trim().toLowerCase();

const derive = (scope: 'siege' | 'battle', battleId: string) => {
  const id = norm(battleId);
  if (!id) {
    // 空 id 会让所有"没有 id 的战斗"共用同一个键 —— 那会把奖励互相顶掉。
    // 宁可炸，也不静默地把多场战斗合并成一次结算。
    throw new Error(`${scope} 的 battleId 为空：领奖键无法派生（空 id 会让多场战斗共用一个键）`);
  }
  return `${scope}:${id}`;
};

export const deriveSiegeClaimKey = (battleId: string) => derive('siege', battleId);
export const deriveBattleClaimKey = (battleId: string) => derive('battle', battleId);
