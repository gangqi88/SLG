/**
 * 攻城小游戏得分的口径（纯函数，无副作用、无依赖）。
 *
 * 设计约束（口径 v7）：
 *   1. **额外扣减 = 伤害扣减的 20%–30%**（即占总扣减 **16.7%–23.1%**）
 *      —— 括号里那句必须留着：按字面"占总额 20%–30%"复核会认为实现少了 3–7 个百分点。
 *   2. 前段线性；1500 分以上系数 ×0.5（边际收益减半）
 *   3. 硬顶：贡献 ≤ 城防上限 × 10%
 *   4. 取用即置空：跨城不泄漏、同城同场只生效一次
 *
 * ── 区分度上限的推导（调参前必读，否则会把"这个数怎么来的"重新推一遍）──────
 * 记 dmgBase = 由伤害决定的那部分扣减，cap = floor(max × 10%)（c3 当前 = 76）：
 *
 *   dmgBase < 253        → 低分 0.2×d、高分 0.3×d 都没撞顶 ⇒ 差 = 0.1×dmgBase，随 d 线性上升
 *   253 ≤ dmgBase < 380  → 高分侧撞顶、低分侧未撞顶   ⇒ 差 = cap − 0.2×dmgBase，随 d 线性下降
 *   dmgBase ≥ 380        → 两侧都撞顶                 ⇒ 差 = 0（打得好与打得差完全无差别）
 *
 * **所以"会玩 vs 练满"的区分度上限是 25 点**（在 dmgBase≈253 处取到），
 * 对 c3 的 760 点上限而言是 3.3% —— 在血条上几乎看不出来。
 * 这是三条约束联立的必然结果，不是实现偏差；调整它属于**平衡决定**，需要单独定。
 *
 * 另需知道：`score 0 → 0`，但**只要有分（哪怕 1 分）rate 就已经是 20%** ——
 * 即"打一下"与"不打"之间的跳变是 0.2×dmgBase（可达 cap 的 76 点），
 * 比"打得差 vs 打得好"的 25 点还大。这个不对称是当前口径的固有形状。
 *
 * 第 4 条为什么要放在这里而不是散在组件里：
 *   「忘记清」和「忘记消费」如果是两个动作，就一定会有一处漏。
 *   做成一个 take 函数后，读和清是同一次调用，结构上不可能只做一半。
 */

/** 线性段的满分：达到后边际收益减半 */
export const SIEGE_SCORE_LINEAR_CAP = 1500;
/** 贡献占「本次扣减中由伤害决定的那部分」的比例下限 / 上限 */
export const SIEGE_SCORE_RATE_MIN = 0.2;
export const SIEGE_SCORE_RATE_MAX = 0.3;
/** 硬顶：贡献不得超过城防上限的这个比例 */
export const SIEGE_SCORE_CAP_RATIO = 0.1;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * 1500 分以上系数 ×0.5：
 *   1500 → 1500；2500 → 1500 + 1000×0.5 = 2000；3000 → 2250
 */
export const effectiveSiegeScore = (score: number) => {
  const s = Number.isFinite(score) && score > 0 ? score : 0;
  return s <= SIEGE_SCORE_LINEAR_CAP
    ? s
    : SIEGE_SCORE_LINEAR_CAP + (s - SIEGE_SCORE_LINEAR_CAP) * 0.5;
};

/** 归一到 0..1（满分即 1） */
export const siegeScoreNorm = (score: number) =>
  clamp01(effectiveSiegeScore(score) / SIEGE_SCORE_LINEAR_CAP);

/** 贡献比例：得分 0 → 20%，满分及以上 → 30% */
export const siegeScoreRate = (score: number) =>
  SIEGE_SCORE_RATE_MIN + (SIEGE_SCORE_RATE_MAX - SIEGE_SCORE_RATE_MIN) * siegeScoreNorm(score);

/**
 * 本次结算的「得分贡献」（城防扣减单位）。
 *
 * @param score    小游戏得分（0 表示没打或没接通）
 * @param dmgBase  由伤害决定的那部分扣减（已经过既有 clamp，本函数不改它）
 * @param max      城防上限
 * @returns        追加的扣减量，∈ [0, floor(max × 10%)]
 */
export const computeSiegeContribution = (args: { score: number; dmgBase: number; max: number }) => {
  const { score, dmgBase, max } = args;
  if (!(score > 0) || !(dmgBase > 0) || !(max > 0)) return 0;
  const raw = Math.round(dmgBase * siegeScoreRate(score));
  const cap = Math.floor(max * SIEGE_SCORE_CAP_RATIO);
  return Math.max(0, Math.min(raw, cap));
};

export type PendingSiegeScore = { cityId: string | null; score: number };

/** 可被 useRef 满足的最小结构（只要求 current） */
export type PendingSiegeScoreRef = { current: PendingSiegeScore | null };

/**
 * 取用并**立即置空**。
 *
 * 无论城池是否匹配都会清空 —— 这是刻意的：
 *   · 匹配 → 正常消费，清空用于「同城连续两场只有第一场生效」
 *   · 不匹配 → 视为 0，但仍然清空，防止它留到后面某一场被误用
 * 若只在匹配时清，A 城的得分会一直挂在容器里，等到某次 cityId 恰好对上就泄漏。
 */
export const takeSiegeScore = (ref: PendingSiegeScoreRef, cityId: string | null): number => {
  const pending = ref.current;
  ref.current = null;
  if (!pending || !cityId || pending.cityId !== cityId) return 0;
  return pending.score;
};
