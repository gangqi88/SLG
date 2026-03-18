import React, { useMemo, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '@/shared/components/ModalProvider';
import { UINotifications } from '@/shared/logic/UINotifications';
import styles from './GameMain.module.css';

type Entry = {
  key: string;
  title: string;
  path: string;
  iconUrl: string;
  locked?: boolean;
  unlockTip?: string;
  badge?: number;
  dot?: boolean;
};

const GameMain: React.FC = () => {
  const navigate = useNavigate();
  const modal = useModal();
  const ui = useSyncExternalStore(
    (listener) => UINotifications.subscribe(listener),
    () => UINotifications.getSnapshot(),
  );

  const entries = useMemo<Entry[]>(
    () => [
      {
        key: 'heroes',
        title: '武将',
        path: '/heroes',
        iconUrl: '/game-assets/character/hero_avatar_demo.svg',
      },
      {
        key: 'main-city',
        title: '主城',
        path: '/main-city',
        iconUrl: '/game-assets/ui/ui_btn_primary.svg',
      },
      {
        key: 'world',
        title: '世界地图',
        path: '/world',
        iconUrl: '/game-assets/ui/ui_badge_siege.svg',
        locked: true,
        unlockTip: '通关第 3 章解锁',
      },
      {
        key: 'gathering',
        title: '资源采集',
        path: '/gathering',
        iconUrl: '/game-assets/ui/ui_badge_pve.svg',
      },
      {
        key: 'tasks',
        title: '任务',
        path: '/tasks',
        iconUrl: '/game-assets/ui/ui_btn_primary.svg',
        badge: ui.taskClaimableCount || undefined,
      },
      {
        key: 'gacha',
        title: '招募',
        path: '/gacha',
        iconUrl: '/game-assets/ui/ui_badge_pvp.svg',
      },
      {
        key: 'lootbox',
        title: '宝箱',
        path: '/lootbox',
        iconUrl: '/game-assets/ui/ui_btn_primary.svg',
        badge: ui.lootBoxCount || undefined,
      },
      {
        key: 'tower-defense',
        title: '守桥',
        path: '/tower-defense',
        iconUrl: '/game-assets/ui/ui_badge_pve.svg',
      },
      {
        key: 'cooking',
        title: '厨神大赛',
        path: '/cooking',
        iconUrl: '/game-assets/ui/ui_badge_pvp.svg',
      },
      {
        key: 'siege',
        title: '攻城战',
        path: '/siege',
        iconUrl: '/game-assets/ui/ui_badge_siege.svg',
      },
      {
        key: 'battle',
        title: '试炼/战斗',
        path: '/battle',
        iconUrl: '/game-assets/ui/ui_badge_pve.svg',
      },
      {
        key: 'alliance',
        title: '联盟',
        path: '/alliance',
        iconUrl: '/game-assets/ui/ui_btn_primary.svg',
      },
    ],
    [ui.lootBoxCount, ui.taskClaimableCount],
  );

  return (
    <div className={styles.root}>
      <div className={styles.backdrop} aria-hidden />

      <div className={styles.content}>
        <div className={styles.grid} role="navigation" aria-label="主界面入口">
          {entries.map((e) => (
            <button
              key={e.key}
              type="button"
              className={`${styles.entry} ${e.locked ? styles.locked : ''}`}
              onClick={() => {
                if (e.locked) {
                  modal.openAlert({
                    title: '未解锁',
                    message: e.unlockTip || '暂未解锁',
                  });
                  return;
                }
                navigate(e.path);
              }}
              aria-disabled={e.locked ? true : undefined}
              title={e.locked && e.unlockTip ? e.unlockTip : e.title}
            >
              {e.badge && e.badge > 0 ? (
                <span className={styles.badge}>{e.badge > 99 ? '99+' : e.badge}</span>
              ) : e.dot ? (
                <span className={styles.dot} />
              ) : null}
              <img className={styles.entryIcon} src={e.iconUrl} alt="" aria-hidden />
              <div className={styles.entryTitle}>{e.title}</div>
              {e.locked && <div className={styles.unlockTip}>{e.unlockTip || '未解锁'}</div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameMain;
