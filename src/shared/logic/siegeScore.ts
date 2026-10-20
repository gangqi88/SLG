/**
 * 攻城小游戏得分的口径（纯函数，无副作用、无依赖）。
 *
 * ── 当前口径（形状 B：0 → cap 线性）────────────────────────────────────
 *   cap          = floor(max × 10%)                        （硬顶，不变）
 *   effective    = score ≤ 1500 ? score : 1500 + (score−1500)×0.5
 *   contribution = round(cap × min(1, effective / 1500))
 *
 * 性质：
 *   · score = 0        → 0        （**无基线**：不打小游戏完全不改扣减）
 *   · score = 1        → 0 或 1   （连续，**不是阶跃**）
 *   · score = 750      → cap/2    （中段线性可感）
 *   · score ≥ 1500     → cap      （饱和；1500 以上边际收益 ×0.5）
 *
 * ── 形状 A 已作废：⚠️ 历史教训（别改回"率线性"）───────────────────────
 * 曾按「rate 从 20% 到 30%」实现（`贡献 = dmgBase × rate`）。它的副作用是
 * **一条 20% 的基线**：score 0 → 0，但 score 1 立刻拿到 0.2×dmgBase（最高直接撞 cap）。
 *
 * 于是：
 *   · "随便点一下" ≈ "认真打满" —— 激励方向是反的，设计在奖励错误行为；
 *   · 技能区分度只剩 0.1×dmgBase（c3 上最多 25 点，3.3% of max）；
 *   · dmgBase > 380 时两侧双撞顶，"打多好"完全无差别。
 *
 * 设计意图是"让会玩的和练满的拉开差距"，只有**无基线**的形状才成立 ——
 * 不是"把 20% 调小"，是"不能有基线"。
 *
 * **判据**：`score = 0` 与 `score = 1` 的贡献必须连续（差 ≤ cap/1000）。
 * 这条由 `siegeScore.test.ts` 的 **G** 断言守着；把它改回阶跃，G 会立刻红。
 * （另：断言 A 是"端点相等"，**它区分不了线性与阶跃** —— 阶跃下 0 与 2500 的差
 *   同样等于 cap。真正承重的是 G（零点）与 A2（中段）。）
 *
 * ── 一段已作废的推导（保留仅为说明"为什么换了曲线"）─────────────────────
 * 形状 A 下曾算过：dmgBase < 253 差值 0.1×d、253–380 差值 cap−0.2×d（斜坡）、
 * ≥380 差值为 0。那套三段式**只对形状 A 成立**，形状 B 下不再适用，勿据此调参。
 *
 * ── 一处必须知道的后果 ────────────────────────────────────────────────
 * 形状 B 的贡献**与伤害无关**：一次很弱的攻击和一次很强的攻击，
 * 拿到的绝对加成都一样（对弱攻击而言相对占比更大）。
 * 这是"0 → cap 线性"的直接结果；若将来要让它随伤害缩放，
 * 必须先决定"cap 是绝对值还是比例"，那是一次口径变更，不是调参。
 *
 * ── 取用即置空 ──────────────────────────────────────────────────────
 * 跨城不泄漏、同城同场只生效一次。
 * 「忘记清」和「忘记消费」如果是两个动作，就一定会有一处漏；
 * 做成一个 take 函数后，读和清是同一次调用，结构上不可能只做一半。
 */

/** 线性段的满分：达到后边际收益减半 */
export const SIEGE_SCORE_LINEAR_CAP = 1500;
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

/** 本次结算的硬顶（城防扣减单位） */
export const siegeScoreCap = (max: number) => Math.floor(max * SIEGE_SCORE_CAP_RATIO);

/**
 * 本次结算的「得分贡献」（城防扣减单位）。
 *
 * 注意签名里**没有 dmgBase** —— 这是刻意的：形状 B 的贡献只由得分与城防上限决定。
 * 若把伤害塞回来，就会退回"有基线"的形状 A，见文件头注释。
 *
 * @param score 小游戏得分（0 = 没打，贡献为 0）
 * @param max   城防上限
 * @returns     ∈ [0, floor(max × 10%)]
 */
export const computeSiegeContribution = (args: { score: number; max: number }) => {
  const { score, max } = args;
  if (!(max > 0)) return 0;
  return Math.round(siegeScoreCap(max) * siegeScoreNorm(score));
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
