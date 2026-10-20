import type { BattleResult } from '@/shared/logic/battleResult';

export type BattleReportEntry = {
  label: string;
  value: string;
  tone?: 'normal' | 'good' | 'bad';
};

export type BattleReport = {
  title: string;
  entries: BattleReportEntry[];
};

export const createBattleReportFromResult = (result: BattleResult) => {
  const win = result.winner === 'attacker';
  const lose = result.winner === 'defender';
  const outcome = win ? '胜利' : lose ? '失败' : '平局';
  const hasCity = Boolean(result.targetCityId || result.targetCityName);
  const before = typeof result.cityDefenseBefore === 'number' ? result.cityDefenseBefore : null;
  const after = typeof result.cityDefenseAfter === 'number' ? result.cityDefenseAfter : null;
  const showDefense = before !== null || after !== null;
  return {
    title: result.mode,
    entries: [
      ...(hasCity
        ? ([
            { label: '目标城池', value: result.targetCityName || result.targetCityId || '—' },
          ] as const)
        : []),
      { label: '我方', value: result.attacker.names.join('、') || '—' },
      { label: '敌方', value: result.defender.names.join('、') || '—' },
      { label: '结果', value: outcome, tone: win ? 'good' : lose ? 'bad' : 'normal' },
      { label: '耗时', value: `${result.durationSec}s` },
      ...(showDefense
        ? ([
            {
              label: '城防耐久',
              value: `${before ?? '—'} → ${after ?? '—'}`,
              tone: win ? 'good' : lose ? 'bad' : 'normal',
            },
          ] as const)
        : []),
      ...(hasCity
        ? ([
            {
              label: '归属变化',
              value: `${result.cityOwnerBefore ?? '—'} → ${result.cityOwnerAfter ?? '—'}`,
              tone: win ? 'good' : 'normal',
            },
          ] as const)
        : []),
      { label: '我方伤害', value: String(result.stats.attacker.damage), tone: 'good' },
      { label: '我方治疗', value: String(result.stats.attacker.heal), tone: 'good' },
      { label: '我方阵亡', value: String(result.stats.attacker.deaths), tone: 'bad' },
      { label: '敌方伤害', value: String(result.stats.defender.damage), tone: 'bad' },
      { label: '敌方治疗', value: String(result.stats.defender.heal), tone: 'bad' },
      { label: '敌方阵亡', value: String(result.stats.defender.deaths), tone: 'good' },
    ],
  } satisfies BattleReport;
};
