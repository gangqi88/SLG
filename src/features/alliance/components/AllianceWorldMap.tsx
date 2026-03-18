import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import styles from './AllianceWorldMap.module.css';
import { useModal } from '@/shared/components/ModalProvider';
import type { AllianceWar } from '@/features/alliance/types/Alliance';
import { WorldMap } from '@/features/alliance/logic/WorldMap';
import { formatRemaining } from '@/shared/logic/time';
import { useNavigate } from 'react-router-dom';
import { BattleHistory } from '@/shared/logic/battleHistory';
import { BattleReportView, createBattleReportFromResult } from '@/shared/logic/battleReports';

type CityStatus = 'friendly' | 'neutral' | 'enemy' | 'war';

const statusColor = (s: CityStatus) => {
  if (s === 'friendly') return '#4caf50';
  if (s === 'neutral') return '#ffc107';
  if (s === 'war') return '#8e24aa';
  return '#f44336';
};

const cityTypeLabel = (t: string) => {
  if (t === 'capital') return '州府';
  if (t === 'county') return '郡县';
  if (t === 'fort') return '要塞';
  return t;
};

export const AllianceWorldMap: React.FC<{
  onDeclareWar?: (cityId: string) => void;
  currentAllianceId?: string | null;
  activeWar?: AllianceWar | null;
}> = ({ onDeclareWar, currentAllianceId, activeWar }) => {
  const modal = useModal();
  const navigate = useNavigate();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [, forceTick] = useState(0);

  const cities = useSyncExternalStore(
    (listener) => WorldMap.subscribe(listener),
    () => WorldMap.getSnapshot(),
  );

  useEffect(() => {
    const t = setInterval(() => {
      forceTick((v) => (v + 1) % 100000);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const next = clamp(scale + (e.deltaY > 0 ? -0.08 : 0.08), 0.7, 1.8);
    setScale(next);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    draggingRef.current = true;
    lastRef.current = { x: e.clientX, y: e.clientY };
    viewportRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || !lastRef.current) return;
    const dx = e.clientX - lastRef.current.x;
    const dy = e.clientY - lastRef.current.y;
    lastRef.current = { x: e.clientX, y: e.clientY };
    setOffset((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    lastRef.current = null;
    viewportRef.current?.releasePointerCapture(e.pointerId);
  };

  const openCity = (c: (typeof cities)[number]) => {
    const owner = c.ownerAllianceName || (c.ownerAllianceId ? '未知联盟' : '无主');
    const isSelf = Boolean(currentAllianceId && c.ownerAllianceId === currentAllianceId);
    const isNeutral = !c.ownerAllianceId;
    const isWarTarget = Boolean(activeWar && activeWar.status !== 'finished' && activeWar.targetCityId === c.id);
    const statusLabel = isSelf ? '己方' : isNeutral ? '无主' : '敌方';
    modal.openModal({
      title: `城池：${c.name}`,
      content: (
        <div>
          <div style={{ color: 'var(--game-text-muted)', marginBottom: 10 }}>
            状态：{statusLabel}{isWarTarget ? ` · ${activeWar?.status === 'active' ? '攻城中' : '宣战中'}` : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div>归属：{owner}</div>
            <div>
              类型：{cityTypeLabel(c.cityType)} · Lv.{c.level}
            </div>
            <div>
              城防耐久：{c.defenseState.cur}/{c.defenseState.max}
              {c.defenseState.repairToMs && Date.now() < c.defenseState.repairToMs
                ? ` · 修复中 ${formatRemaining(c.defenseState.repairToMs - Date.now())}`
                : ''}
            </div>
            <div>
              产出：木 {c.production.woodPerMin}/分 · 矿 {c.production.orePerMin}/分 · 金 {c.production.coinPerMin}/分
            </div>
          </div>
        </div>
      ),
      actions: [
        {
          key: 'siege',
          label: '前往攻城',
          variant: 'primary',
          onClick: () => {
            if (!isWarTarget || activeWar?.status !== 'active') {
              modal.openAlert({ title: '未开始', message: '该城池尚未进入攻城阶段。' });
              return;
            }
            modal.close();
            navigate(`/siege?cityId=${encodeURIComponent(c.id)}`);
          },
        },
        {
          key: 'report',
          label: '查看战报',
          variant: 'secondary',
          onClick: () => {
            const latest = BattleHistory.getLatestByCityId(c.id);
            if (!latest) {
              modal.openAlert({ title: '战报', message: '暂无该城池战报。' });
              return;
            }
            modal.openModal({
              title: '战报',
              content: <BattleReportView report={createBattleReportFromResult(latest)} />,
              actions: [
                { key: 'close', label: '关闭', variant: 'secondary', onClick: () => modal.close() },
                {
                  key: 'all',
                  label: '查看全部',
                  variant: 'primary',
                  onClick: () => {
                    modal.close();
                    navigate(`/reports?cityId=${encodeURIComponent(c.id)}`);
                  },
                },
              ],
            });
          },
        },
        {
          key: 'assist',
          label: '协防',
          variant: 'secondary',
          onClick: () => {
            modal.openAlert({ title: '协防', message: '协防流程待接入。' });
          },
        },
        {
          key: 'war',
          label: isWarTarget ? '已宣战' : '宣战',
          variant: isNeutral ? 'primary' : 'danger',
          onClick: () => {
            if (isSelf) {
              modal.openAlert({ title: '提示', message: '无法对己方城池宣战。' });
              return;
            }
            if (isWarTarget) {
              modal.openAlert({ title: '提示', message: '该城池已处于宣战/攻城状态。' });
              return;
            }
            modal.close();
            onDeclareWar?.(c.id);
          },
        },
      ],
    });
  };

  const cityNodes = useMemo(() => {
    return cities.map((c) => {
      const isSelf = Boolean(currentAllianceId && c.ownerAllianceId === currentAllianceId);
      const isNeutral = !c.ownerAllianceId;
      const isWarTarget = Boolean(activeWar && activeWar.status !== 'finished' && activeWar.targetCityId === c.id);
      const status: CityStatus = isWarTarget ? 'war' : isSelf ? 'friendly' : isNeutral ? 'neutral' : 'enemy';
      const max = c.defenseState.max || 1;
      const cur = c.defenseState.cur ?? max;
      const ratio = Math.max(0, Math.min(1, cur / max));
      const repairing = Boolean(c.defenseState.repairToMs && Date.now() < c.defenseState.repairToMs);
      return { c, status, ratio, repairing };
    });
  }, [activeWar, cities, currentAllianceId]);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3 className={styles.title}>世界城池地图</h3>
        <div className={styles.hint}>拖拽移动 · 滚轮缩放</div>
      </div>

      <div
        className={styles.viewport}
        ref={viewportRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div
          className={styles.canvas}
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
        >
          {cityNodes.map(({ c, status, ratio, repairing }) => (
            <div
              key={c.id}
              className={`${styles.city} ${repairing ? styles.cityRepairing : ''}`}
              style={{
                left: c.x,
                top: c.y,
                background: statusColor(status),
              }}
              role="button"
              tabIndex={0}
              onClick={() => openCity(c)}
            >
              <div className={styles.defenseBar} aria-label="城防耐久">
                <div className={styles.defenseFill} style={{ width: `${Math.round(ratio * 100)}%` }} />
              </div>
              <span className={styles.cityName}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.dot} style={{ background: '#4caf50' }} />
          己方
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dot} style={{ background: '#ffc107' }} />
          可宣战
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dot} style={{ background: '#8e24aa' }} />
          宣战中
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dot} style={{ background: '#f44336' }} />
          敌方
        </div>
      </div>
    </div>
  );
};
