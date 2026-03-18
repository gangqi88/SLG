import React from 'react';
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

export const createMockBattleReport = (args: { title: string; attacker: string; defender: string }) => {
  const now = new Date();
  const win = Math.random() > 0.45;
  const rewardCoin = 300 + Math.floor(Math.random() * 400);
  const rewardExp = 80 + Math.floor(Math.random() * 120);
  return {
    title: args.title,
    entries: [
      { label: '时间', value: now.toLocaleString() },
      { label: '我方', value: args.attacker },
      { label: '敌方', value: args.defender },
      { label: '结果', value: win ? '胜利' : '失败', tone: win ? 'good' : 'bad' },
      { label: '战功', value: `${win ? 12 : 6}` },
      { label: '经验', value: `+${rewardExp}`, tone: 'good' },
      { label: '金币', value: `+${rewardCoin}`, tone: 'good' },
    ],
  } satisfies BattleReport;
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
      ...(hasCity ? ([{ label: '目标城池', value: result.targetCityName || result.targetCityId || '—' }] as const) : []),
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

export const BattleReportView: React.FC<{ report: BattleReport }> = ({ report }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ color: 'var(--game-text-muted)', marginBottom: 6 }}>{report.title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {report.entries.map((e) => (
          <div
            key={e.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 12,
              border: '1px solid rgba(58,58,90,0.7)',
              background: 'rgba(0,0,0,0.16)',
            }}
          >
            <span style={{ color: 'var(--game-text-muted)' }}>{e.label}</span>
            <span
              style={{
                fontFamily: 'var(--game-font-mono)',
                color:
                  e.tone === 'good'
                    ? 'var(--game-btn-confirm)'
                    : e.tone === 'bad'
                      ? 'var(--game-btn-battle)'
                      : 'var(--game-text)',
              }}
            >
              {e.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
