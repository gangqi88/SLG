import React, { useMemo, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '@/shared/components/ModalProvider';
import { UINotifications } from '@/shared/logic/UINotifications';
import { MAIN_ENTRIES } from '@/shared/config/mainEntries';
import { useLocale } from '@/shared/locale/LocaleProvider';
import styles from './GameMain.module.css';

const GameMain: React.FC = () => {
  const navigate = useNavigate();
  const modal = useModal();
  const { t } = useLocale();
  const ui = useSyncExternalStore(
    (listener) => UINotifications.subscribe(listener),
    () => UINotifications.getSnapshot(),
  );

  const entries = useMemo(() => {
    const badgeByKey = {
      taskClaimableCount: ui.taskClaimableCount,
      lootBoxCount: ui.lootBoxCount,
    } as const;
    return MAIN_ENTRIES.map((e) => ({
      ...e,
      title: t(e.titleKey),
      badge: e.badgeKey ? badgeByKey[e.badgeKey] || undefined : undefined,
    }));
  }, [t, ui.lootBoxCount, ui.taskClaimableCount]);

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
                    title: t('commonLocked'),
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
