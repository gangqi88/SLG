import React from 'react';
import styles from './SceneHUD.module.css';

export type SceneHudStat = { label: string; value: string };

export type SceneHudAction = {
  key: string;
  label: string;
  variant?: 'default' | 'primary';
  onClick: () => void;
};

export const SceneHUD: React.FC<{
  title: string;
  left?: SceneHudStat[];
  right?: SceneHudStat[];
  actions?: SceneHudAction[];
  onExit: () => void;
}> = ({ title, left = [], right = [], actions = [], onExit }) => {
  return (
    <div className={styles.hud} aria-hidden={false}>
      <div className={styles.top}>
        <div className={styles.panel}>
          <div className={styles.title}>{title}</div>
          {left.map((s) => (
            <div key={s.label} className={styles.stat}>
              {s.label}:{s.value}
            </div>
          ))}
        </div>

        <div className={styles.panel}>
          {right.map((s) => (
            <div key={s.label} className={styles.stat}>
              {s.label}:{s.value}
            </div>
          ))}
        </div>

        <button type="button" className={styles.exitBtn} onClick={onExit} aria-label="退出">
          退
        </button>
      </div>

      {actions.length > 0 && (
        <div className={styles.bottom}>
          {actions.map((a) => (
            <button
              key={a.key}
              type="button"
              className={`${styles.btn} ${a.variant === 'primary' ? styles.btnPrimary : ''}`}
              onClick={a.onClick}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

