import type { BattleResult } from '@/shared/logic/battleResult';

/**
 * 攻城结算 → 战报的城池字段。
 *
 * 从 SiegeView 抽出来是为了**可测**：原来的写法在组件事件回调里，
 * 而 SiegeView 依赖 Phaser，jsdom 起不来，这段逻辑等于没有断言覆盖。
 *
 * 核心约束：`cityDefenseBefore` 必须来自 `frozen`（战斗开始时冻结的快照），
 * **不能**来自结算瞬间重新读到的城池 —— 城池在战斗中持续修复，
 * 重读会让「战前值」变成「战后时刻的值」，与战斗实际采用的值脱钩。
 */
export type SiegeCitySnapshot = {
  defenseState: { cur: number };
  name: string;
  ownerAllianceName: string | null;
};

export const buildSiegeCityFields = (args: {
  frozen: SiegeCitySnapshot | null;
  after: SiegeCitySnapshot | null;
}): Pick<
  BattleResult,
  'targetCityName' | 'cityDefenseBefore' | 'cityDefenseAfter' | 'cityOwnerBefore' | 'cityOwnerAfter'
> => ({
  targetCityName: args.after?.name ?? null,
  // 战前值只认冻结快照。
  cityDefenseBefore: args.frozen?.defenseState.cur ?? null,
  cityDefenseAfter: args.after?.defenseState.cur ?? null,
  cityOwnerBefore: args.frozen?.ownerAllianceName ?? null,
  cityOwnerAfter: args.after?.ownerAllianceName ?? null,
});
