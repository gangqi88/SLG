import React, { Suspense, useMemo, useState, useSyncExternalStore } from 'react';
import { Outlet, useLocation, useMatches, useNavigate } from 'react-router-dom';
import { GameShell } from '@/shared/components/GameShell';
import { ModalProvider, useModal } from '@/shared/components/ModalProvider';
import type { WalletAccount } from '@/shared/utils/web3';
import { UINotifications } from '@/shared/logic/UINotifications';
import { openResourceWays } from '@/shared/logic/openResourceWays';
import { useLocale } from '@/shared/locale/LocaleProvider';
import type { StringKey } from '@/shared/locale/strings';

const WalletConnect = React.lazy(() => import('@/shared/components/WalletConnect'));

const LayoutInner: React.FC = () => {
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [showWalletPanel, setShowWalletPanel] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMatches();
  const modal = useModal();
  const { t } = useLocale();
  const ui = useSyncExternalStore(
    (listener) => UINotifications.subscribe(listener),
    () => UINotifications.getSnapshot(),
  );

  const title = useMemo(() => {
    for (let i = matches.length - 1; i >= 0; i -= 1) {
      const handle = matches[i].handle as { titleKey?: StringKey } | undefined;
      if (handle?.titleKey) return t(handle.titleKey);
    }
    return t('appName');
  }, [matches, t]);

  const canGoBack = location.pathname !== '/';

  return (
    <GameShell
      title={title}
      canGoBack={canGoBack}
      onBack={() => (canGoBack ? navigate(-1) : navigate('/'))}
      onHome={() => navigate('/')}
      onResourceClick={(key) => {
        openResourceWays({ modal, navigate, resourceKey: key, title: '资源获取途径' });
      }}
      topActions={[
        {
          key: 'settings',
          label: t('topSettings'),
          icon: '⚙',
          onClick: () => navigate('/style-guide'),
        },
        { key: 'reports', label: t('topReports'), icon: '📜', onClick: () => navigate('/reports') },
        {
          key: 'mail',
          label: t('topMail'),
          icon: '✉',
          onClick: () =>
            modal.openAlert({
              title: '邮件',
              message: '邮件系统界面待接入。',
              primaryText: '知道了',
            }),
        },
        { key: 'welfare', label: t('topWelfare'), icon: '🎁', onClick: () => navigate('/tasks') },
        {
          key: 'avatar',
          label: t('topAvatar'),
          icon: '🙂',
          onClick: () =>
            modal.openAlert({
              title: '角色信息',
              message: '角色信息面板待接入。',
              primaryText: '知道了',
            }),
        },
        {
          key: 'recharge',
          label: t('topRecharge'),
          icon: '＋',
          onClick: () =>
            modal.openAlert({
              title: '充值',
              message: '充值与商店系统待接入。',
              primaryText: '知道了',
            }),
        },
        {
          key: 'wallet',
          label: t('topWallet'),
          icon: '🔗',
          onClick: () => setShowWalletPanel((v) => !v),
        },
      ]}
      bottomItems={[
        {
          key: 'bag',
          label: t('bottomBag'),
          icon: '🎒',
          badge: ui.lootBoxCount,
          onClick: () => navigate('/lootbox'),
        },
        {
          key: 'mail',
          label: t('bottomMail'),
          icon: '✉',
          badge: ui.mailUnreadCount,
          onClick: () => modal.openAlert({ title: '邮件', message: '邮件系统界面待接入。' }),
          disabled: true,
        },
        {
          key: 'friend',
          label: t('bottomFriend'),
          icon: '👥',
          onClick: () => modal.openAlert({ title: '好友', message: '好友系统界面待接入。' }),
          disabled: true,
        },
        {
          key: 'welfare',
          label: t('bottomWelfare'),
          icon: '🎁',
          badge: ui.taskClaimableCount,
          onClick: () => navigate('/tasks'),
        },
        {
          key: 'activity',
          label: t('bottomActivity'),
          icon: '🎉',
          onClick: () => modal.openAlert({ title: '活动', message: '活动系统界面待接入。' }),
          disabled: true,
        },
      ]}
    >
      {showWalletPanel && (
        <Suspense
          fallback={
            <div
              style={{
                padding: '10px',
                backgroundColor: 'var(--game-panel)',
                borderRadius: 'var(--game-radius-panel)',
                border: '1px solid var(--game-border)',
                minHeight: '58px',
                marginBottom: 'var(--spacing-16)',
              }}
            />
          }
        >
          <WalletConnect onConnect={(acc) => setWallet(acc)} onDisconnect={() => setWallet(null)} />
        </Suspense>
      )}

      <div key={location.pathname} className="animate-route-fade">
        <Outlet context={{ wallet }} />
      </div>
    </GameShell>
  );
};

const Layout: React.FC = () => {
  return (
    <ModalProvider>
      <LayoutInner />
    </ModalProvider>
  );
};

export default Layout;
