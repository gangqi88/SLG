import React, { useMemo, useSyncExternalStore } from 'react';
import styles from './GameShell.module.css';
import { PlayerResources } from '@/shared/logic/PlayerResources';

type BottomItem = {
  key: string;
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  dot?: boolean;
  badge?: number;
};

type TopAction = {
  key: string;
  label: string;
  icon: string;
  onClick: () => void;
};

const formatNumber = (v: number) => {
  const n = Math.floor(v);
  if (n >= 1_000_000) return `${Math.floor(n / 10_000) / 100}M`;
  if (n >= 10_000) return `${Math.floor(n / 10) / 100}W`;
  return String(n);
};

export const GameShell: React.FC<{
  title: string;
  canGoBack: boolean;
  onBack: () => void;
  onHome: () => void;
  topActions: TopAction[];
  bottomItems: BottomItem[];
  onResourceClick?: (key: 'coin' | 'gem' | 'food' | 'wood' | 'ore' | 'bun') => void;
  children: React.ReactNode;
}> = ({ title, canGoBack, onBack, onHome, topActions, bottomItems, onResourceClick, children }) => {
  const resources = useSyncExternalStore(
    (listener) => PlayerResources.subscribe(listener),
    () => PlayerResources.getSnapshot(),
  );

  const resourceItems = useMemo(
    () => [
      { key: 'coin', label: '金币', value: resources.coin },
      { key: 'gem', label: '元宝', value: resources.gem },
      { key: 'food', label: '粮食', value: resources.food },
      { key: 'wood', label: '木材', value: resources.wood },
      { key: 'ore', label: '矿石', value: resources.ore },
      { key: 'bun', label: '包子', value: resources.bun },
    ],
    [resources],
  );

  return (
    <div className={`${styles.shell} ${styles.topSafe}`}>
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <button
            type="button"
            className={`${styles.iconBtn} ${!canGoBack ? styles.disabled : ''}`}
            onClick={onBack}
            aria-label="返回"
            title={canGoBack ? '返回' : '已在主界面'}
          >
            ←
          </button>
          <button type="button" className={styles.iconBtn} onClick={onHome} aria-label="主页">
            ⌂
          </button>
        </div>

        <div className={styles.topCenter}>
          <h1 className={styles.title}>{title}</h1>
        </div>

        <div className={styles.topRight}>
          {topActions.map((a) => (
            <button
              key={a.key}
              type="button"
              className={styles.iconBtn}
              onClick={a.onClick}
              aria-label={a.label}
              title={a.label}
            >
              {a.icon}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.resourceBar}>
        {resourceItems.map((r) => (
          <button
            key={r.key}
            type="button"
            className={styles.resourceItem}
            onClick={() => onResourceClick?.(r.key as 'coin' | 'gem' | 'food' | 'wood' | 'ore' | 'bun')}
            title={`${r.label}：${r.value}`}
          >
            <div className={styles.resourceLabel}>{r.label}</div>
            <div className={styles.resourceValue}>{formatNumber(r.value)}</div>
          </button>
        ))}
      </div>

      <div className={styles.content}>{children}</div>

      <div className={`${styles.bottomBarWrap} ${styles.bottomSafe}`}>
        <div className={styles.bottomBar}>
          {bottomItems.map((i) => (
            <button
              key={i.key}
              type="button"
              className={`${styles.bottomItem} ${i.disabled ? styles.disabled : ''}`}
              onClick={i.onClick}
              aria-label={i.label}
              title={i.disabled ? '未开放' : i.label}
            >
              {i.badge && i.badge > 0 ? (
                <span className={styles.badge}>{i.badge > 99 ? '99+' : i.badge}</span>
              ) : i.dot ? (
                <span className={styles.dot} />
              ) : null}
              <div>{i.icon}</div>
              <div className={styles.bottomLabel}>{i.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
