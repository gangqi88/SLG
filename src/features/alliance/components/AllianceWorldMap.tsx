import React, { useMemo, useRef, useState } from 'react';
import styles from './AllianceWorldMap.module.css';
import { useModal } from '@/shared/components/ModalProvider';
import { BattleReportView, createMockBattleReport } from '@/shared/logic/battleReports';

type CityStatus = 'friendly' | 'neutral' | 'enemy';

type CityNode = {
  id: string;
  name: string;
  x: number;
  y: number;
  status: CityStatus;
};

const statusColor = (s: CityStatus) => {
  if (s === 'friendly') return '#4caf50';
  if (s === 'neutral') return '#ffc107';
  return '#f44336';
};

export const AllianceWorldMap: React.FC<{
  onDeclareWar?: (cityId: string) => void;
}> = ({ onDeclareWar }) => {
  const modal = useModal();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const cities = useMemo<CityNode[]>(
    () => [
      { id: 'c1', name: '许昌', x: 160, y: 120, status: 'friendly' },
      { id: 'c2', name: '洛阳', x: 320, y: 200, status: 'neutral' },
      { id: 'c3', name: '长安', x: 520, y: 160, status: 'enemy' },
      { id: 'c4', name: '襄阳', x: 260, y: 360, status: 'neutral' },
      { id: 'c5', name: '建业', x: 520, y: 360, status: 'friendly' },
      { id: 'c6', name: '成都', x: 120, y: 520, status: 'enemy' },
    ],
    [],
  );

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

  const openCity = (c: CityNode) => {
    const statusLabel = c.status === 'friendly' ? '己方' : c.status === 'neutral' ? '可宣战' : '敌方';
    modal.openModal({
      title: `城池：${c.name}`,
      content: (
        <div>
          <div style={{ color: 'var(--game-text-muted)', marginBottom: 10 }}>
            状态：{statusLabel}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div>驻军：—</div>
            <div>资源产出：—</div>
            <div>防御等级：—</div>
          </div>
        </div>
      ),
      actions: [
        {
          key: 'report',
          label: '战报',
          variant: 'secondary',
          onClick: () => {
            modal.openModal({
              title: '战报',
              content: (
                <BattleReportView
                  report={createMockBattleReport({ title: c.name, attacker: '本盟', defender: '敌盟' })}
                />
              ),
              actions: [{ key: 'close', label: '关闭', variant: 'primary', onClick: () => modal.close() }],
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
          label: '宣战',
          variant: c.status === 'neutral' ? 'primary' : 'danger',
          onClick: () => {
            modal.close();
            onDeclareWar?.(c.id);
          },
        },
      ],
    });
  };

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
          {cities.map((c) => (
            <div
              key={c.id}
              className={styles.city}
              style={{
                left: c.x,
                top: c.y,
                background: statusColor(c.status),
              }}
              role="button"
              tabIndex={0}
              onClick={() => openCity(c)}
            >
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
          <span className={styles.dot} style={{ background: '#f44336' }} />
          敌方
        </div>
      </div>
    </div>
  );
};
