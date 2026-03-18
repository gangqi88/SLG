import React, { useMemo, useSyncExternalStore } from 'react';
import { useModal } from '@/shared/components/ModalProvider';
import { BattleHistory } from '@/shared/logic/battleHistory';
import type { BattleResult, HeroBattleStats } from '@/shared/logic/battleResult';
import { BattleReportView, createBattleReportFromResult } from '@/shared/logic/battleReports';
import styles from './BattleReportsView.module.css';

const modeLabel = (mode: string) => {
  if (mode === 'siege') return '攻城战';
  if (mode === 'pve') return '试炼';
  if (mode === 'pvp') return '演武';
  return '战斗';
};

const outcomeLabel = (w: BattleResult['winner']) => {
  if (w === 'attacker') return '胜利';
  if (w === 'defender') return '失败';
  return '平局';
};

const outcomeColor = (w: BattleResult['winner']) => {
  if (w === 'attacker') return '#4caf50';
  if (w === 'defender') return '#f44336';
  return '#ffc107';
};

const sortByDamage = (a: HeroBattleStats, b: HeroBattleStats) => b.damage - a.damage;
const sortByHeal = (a: HeroBattleStats, b: HeroBattleStats) => b.heal - a.heal;

export const BattleReportsView: React.FC = () => {
  const modal = useModal();
  const items = useSyncExternalStore(
    (listener) => BattleHistory.subscribe(listener),
    () => BattleHistory.getSnapshot(),
  );

  const openDetail = (r: BattleResult) => {
    const report = createBattleReportFromResult(r);
    const heroes = (r.heroes ?? []).slice();
    const topDamage = heroes.slice().sort(sortByDamage).slice(0, 5);
    const topHeal = heroes.slice().sort(sortByHeal).slice(0, 5);

    modal.openModal({
      title: '战报',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <BattleReportView report={report} />
          <div>
            <div style={{ color: 'var(--game-title)', fontWeight: 900, marginBottom: 8 }}>输出排行</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {topDamage.map((h) => (
                <div key={`d-${h.heroId}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{h.name}</span>
                  <span style={{ fontFamily: 'var(--game-font-mono)', color: 'var(--game-title)' }}>
                    {h.damage}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--game-title)', fontWeight: 900, marginBottom: 8 }}>治疗排行</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {topHeal.map((h) => (
                <div key={`h-${h.heroId}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{h.name}</span>
                  <span style={{ fontFamily: 'var(--game-font-mono)', color: 'var(--game-title)' }}>
                    {h.heal}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      actions: [{ key: 'close', label: '关闭', variant: 'primary', onClick: () => modal.close() }],
    });
  };

  const rows = useMemo(() => {
    return items.map((r) => {
      const time = r.endedAtMs ? new Date(r.endedAtMs).toLocaleString() : '—';
      const left = r.attacker.names.slice(0, 2).join('、') || '—';
      const right = r.defender.names.slice(0, 2).join('、') || '—';
      const city = r.targetCityName || r.targetCityId;
      const subtitle = city ? `${city} · ${left}  vs  ${right}` : `${left}  vs  ${right}`;
      return { r, time, subtitle };
    });
  }, [items]);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>战报列表</h2>
        <button type="button" className={styles.btn} onClick={() => BattleHistory.clear()}>
          清空
        </button>
      </div>

      <div className={styles.list}>
        {rows.map(({ r, time, subtitle }) => (
          <button key={r.battleId} type="button" className={styles.row} onClick={() => openDetail(r)}>
            <span className={styles.badge} style={{ background: outcomeColor(r.winner) }}>
              {outcomeLabel(r.winner)}
            </span>
            <span className={styles.main}>
              <span className={styles.line1}>
                <span className={styles.mode}>{modeLabel(r.mode)}</span>
                <span className={styles.time}>{time}</span>
              </span>
              <span className={styles.line2}>{subtitle}</span>
            </span>
            <span className={styles.right}>
              <span>耗时 {r.durationSec}s</span>
              <span>伤害 {r.stats.attacker.damage}</span>
            </span>
          </button>
        ))}
        {rows.length === 0 && <div className={styles.empty}>暂无战报（进行一次战斗/攻城后会自动记录）</div>}
      </div>
    </div>
  );
};

export default BattleReportsView;
