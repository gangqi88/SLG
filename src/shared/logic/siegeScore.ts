/**
 * 攻城小游戏得分的口径（纯函数，无副作用、无依赖）。
 *
 * 设计约束（口径 v7）：
 *   1. 得分只影响「守方胜」时的城防扣减，占比 20%–30%
 *   2. 前段线性；1500 分以上系数 ×0.5（边际收益减半）
 *   3. 硬顶：贡献 ≤ 城防上限 × 10%
 *   4. 取用即置空：跨城不泄漏、同城同场只生效一次
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
