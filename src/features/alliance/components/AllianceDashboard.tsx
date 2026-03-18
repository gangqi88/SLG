import React, { useEffect, useState } from 'react';
import { useAlliance } from '@/features/alliance/hooks/useAlliance';
import { AllianceInfoPanel } from './AllianceInfoPanel';
import { AllianceMemberList } from './AllianceMemberList';
import { AllianceCheckIn } from './AllianceCheckIn';
import { AllianceChat } from './AllianceChat';
import { AllianceShop } from './AllianceShop';
import { AllianceTrade } from './AllianceTrade';
import { AllianceTech } from './AllianceTech';
import { AllianceWar } from './AllianceWar';
import { AllianceAd } from './AllianceAd';
import { AllianceWorldMap } from './AllianceWorldMap';
import styles from './AllianceDashboard.module.css';
import { useModal } from '@/shared/components/ModalProvider';
import { useNavigate } from 'react-router-dom';
import { formatRemaining } from '@/shared/logic/time';
import { Team } from '@/shared/logic/Team';
import { TeamEditor } from '@/shared/components/TeamEditor';
import { WorldMap } from '@/features/alliance/logic/WorldMap';

type TabType = 'info' | 'members' | 'checkin' | 'chat' | 'shop' | 'trade' | 'tech' | 'war' | 'ad';

export const AllianceDashboard: React.FC = () => {
  const {
    alliance,
    hasAlliance,
    isLoading,
    createAlliance,
    joinAlliance,
    leaveAlliance,
    members,
    playerRole,
    playerContribution,
    declareWar,
    activeWar,
  } = useAlliance();

  const modal = useModal();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [createName, setCreateName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [tick, setTick] = useState(0);

  const handleCreate = async () => {
    if (!createName.trim()) return;
    await createAlliance(createName);
    setShowCreateModal(false);
    setCreateName('');
  };

  const handleJoin = async () => {
    if (!joinId.trim()) return;
    await joinAlliance(joinId);
    setShowJoinModal(false);
    setJoinId('');
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>加载联盟数据...</p>
      </div>
    );
  }

  if (!hasAlliance) {
    return (
      <div className={styles.noAlliance}>
        <h2>联盟</h2>
        <p>加入或创建联盟，参与攻城与联盟玩法。</p>

        <div className={styles.actions}>
          <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
            创建联盟
          </button>
          <button className={styles.joinButton} onClick={() => setShowJoinModal(true)}>
            加入联盟
          </button>
        </div>

        {showCreateModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>创建联盟</h3>
              <input
                type="text"
                placeholder="联盟名称"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className={styles.input}
              />
              <p className={styles.cost}>消耗：10,000 金币</p>
              <div className={styles.modalActions}>
                <button onClick={handleCreate} className={styles.confirmButton}>
                  创建
                </button>
                <button onClick={() => setShowCreateModal(false)} className={styles.cancelButton}>
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {showJoinModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>加入联盟</h3>
              <input
                type="text"
                placeholder="联盟 ID"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                className={styles.input}
              />
              <div className={styles.modalActions}>
                <button onClick={handleJoin} className={styles.confirmButton}>
                  申请
                </button>
                <button onClick={() => setShowJoinModal(false)} className={styles.cancelButton}>
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const tabs: { key: TabType; label: string; requiresLevel?: number }[] = [
    { key: 'info', label: '公告' },
    { key: 'members', label: '成员' },
    { key: 'checkin', label: '签到' },
    { key: 'chat', label: '聊天' },
    { key: 'shop', label: '商店' },
    { key: 'trade', label: '交易' },
    { key: 'tech', label: '科技', requiresLevel: 4 },
    { key: 'war', label: '攻城战', requiresLevel: 5 },
    { key: 'ad', label: '广告位' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return <AllianceInfoPanel />;
      case 'members':
        return <AllianceMemberList />;
      case 'checkin':
        return <AllianceCheckIn />;
      case 'chat':
        return <AllianceChat />;
      case 'shop':
        return <AllianceShop />;
      case 'trade':
        return <AllianceTrade />;
      case 'tech':
        return <AllianceTech />;
      case 'war':
        return <AllianceWar />;
      case 'ad':
        return <AllianceAd />;
      default:
        return <AllianceInfoPanel />;
    }
  };

  const isTabEnabled = (tab: (typeof tabs)[0]) => {
    if (!tab.requiresLevel) return true;
    return (alliance?.level || 0) >= tab.requiresLevel;
  };

  const leaderName = members.find((m) => m.id === alliance?.leaderId)?.name || '—';
  const totalPower = members.reduce((sum, m) => sum + (m.weeklyContribution || 0), 0);

  const openTab = (key: TabType) => {
    const tab = tabs.find((t) => t.key === key);
    if (!tab) return;
    if (!isTabEnabled(tab)) {
      modal.openAlert({
        title: '未解锁',
        message: `联盟等级达到 Lv.${tab.requiresLevel} 解锁：${tab.label}`,
      });
      return;
    }
    setActiveTab(key);
  };

  const handleLeave = () => {
    const isLeader = playerRole === 'leader';
    modal.openConfirm({
      title: isLeader ? '解散联盟' : '退出联盟',
      message: isLeader ? '盟主退出将解散联盟，确认继续？' : '确认退出当前联盟？',
      primaryText: '确认',
      secondaryText: '取消',
      onConfirm: async () => {
        await leaveAlliance();
      },
    });
  };

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const openRally = (targetCityId?: string | null) => {
    modal.openModal({
      title: '集结队伍',
      content: (
        <div>
          <TeamEditor />
        </div>
      ),
      actions: [
        { key: 'close', label: '关闭', variant: 'secondary', onClick: () => modal.close() },
        {
          key: 'go',
          label: '前往攻城战',
          variant: 'primary',
          onClick: () => {
            modal.close();
            navigate(targetCityId ? `/siege?cityId=${encodeURIComponent(targetCityId)}` : '/siege');
          },
        },
      ],
    });
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.topGrid}>
        <div className={styles.infoCard}>
          <div className={styles.infoHeader}>
            <div className={styles.nameRow}>
              <div className={styles.name}>{alliance?.name}</div>
              <div className={styles.level}>Lv.{alliance?.level}</div>
            </div>
            <div className={styles.metaRow}>
              <div className={styles.metaItem}>人数 {alliance?.memberCount}/{alliance?.maxMembers}</div>
              <div className={styles.metaItem}>盟主 {leaderName}</div>
              <div className={styles.metaItem}>贡献 {playerContribution}</div>
              <div className={styles.metaItem}>战力 {totalPower}</div>
            </div>
          </div>

          <div className={styles.entryGrid}>
            <button type="button" className={styles.entryBtn} onClick={() => openTab('members')}>
              成员管理
            </button>
            <button type="button" className={styles.entryBtn} onClick={() => openTab('info')}>
              联盟公告
            </button>
            <button type="button" className={styles.entryBtn} onClick={() => openTab('tech')}>
              联盟科技
            </button>
            <button type="button" className={styles.entryBtn} onClick={() => openTab('shop')}>
              联盟商店
            </button>
            <button type="button" className={styles.entryBtn} onClick={() => openTab('war')}>
              攻城战
            </button>
            <button type="button" className={styles.entryBtnDanger} onClick={handleLeave}>
              {playerRole === 'leader' ? '解散联盟' : '退出联盟'}
            </button>
          </div>

          {activeWar && (
            <div style={{ marginTop: 12 }}>
              <div style={{ color: 'var(--game-title)', fontWeight: 900, marginBottom: 8 }}>
                宣战状态
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <div className={styles.metaItem}>
                  目标：{activeWar.targetCityName ? `${activeWar.targetCityName} · ` : ''}
                  {activeWar.defenderName}
                </div>
                <div className={styles.metaItem}>
                  倒计时：{formatRemaining(activeWar.endTime - Date.now())}
                </div>
                <div className={styles.metaItem}>
                  阶段：{activeWar.status === 'active' ? '攻城中' : activeWar.status === 'preparing' ? '宣战中' : '已结束'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className={styles.entryBtn}
                  onClick={() => openRally(activeWar.targetCityId)}
                >
                  集结队伍
                </button>
                <button
                  type="button"
                  className={styles.entryBtn}
                  onClick={() => {
                    if (activeWar.status !== 'active') {
                      modal.openAlert({ title: '未开始', message: '宣战倒计时结束后才能开始攻城。' });
                      return;
                    }
                    navigate(activeWar.targetCityId ? `/siege?cityId=${encodeURIComponent(activeWar.targetCityId)}` : '/siege');
                  }}
                >
                  前往攻城
                </button>
              </div>
            </div>
          )}

          <div className={styles.content}>{renderContent()}</div>
        </div>

        <AllianceWorldMap
          currentAllianceId={alliance?.id ?? null}
          activeWar={activeWar}
          onDeclareWar={async (cityId) => {
            if ((alliance?.level || 0) < 5) {
              modal.openAlert({ title: '未解锁', message: '联盟等级达到 Lv.5 解锁攻城战。' });
              return;
            }
            const city = WorldMap.getCityById(cityId);
            if (!city) {
              modal.openAlert({ title: '宣战失败', message: '未找到目标城池。' });
              return;
            }
            if (city.ownerAllianceId === alliance?.id) {
              modal.openAlert({ title: '提示', message: '无法对己方城池宣战。' });
              return;
            }
            const targetAllianceId = city.ownerAllianceId ?? 'neutral';
            const defenderName = city.ownerAllianceName ?? (city.ownerAllianceId ? '敌方联盟' : '无主城池');
            modal.openConfirm({
              title: '宣战',
              message: `目标：${city.name}。宣战将消耗联盟押金并进入倒计时，确认继续？`,
              primaryText: '确认',
              secondaryText: '取消',
              onConfirm: async () => {
                const war = await declareWar(targetAllianceId, city.id, city.name, defenderName);
                if (war) {
                  modal.openModal({
                    title: '宣战成功',
                    content: (
                      <div>
                        <div style={{ marginBottom: 8 }}>已对敌方联盟发起宣战。</div>
                        <div style={{ color: 'var(--game-text-muted)' }}>
                          剩余时间：{formatRemaining(war.endTime - Date.now())}
                        </div>
                      </div>
                    ),
                    actions: [
                      { key: 'close', label: '关闭', variant: 'secondary', onClick: () => modal.close() },
                      {
                        key: 'rally',
                        label: '集结队伍',
                        variant: 'primary',
                        onClick: () => {
                          modal.close();
                          openRally(war.targetCityId);
                        },
                      },
                    ],
                  });
                } else {
                  modal.openAlert({ title: '宣战失败', message: '当前无法宣战，请稍后再试。' });
                }
              },
            });
          }}
        />
      </div>
    </div>
  );
};

export default AllianceDashboard;
