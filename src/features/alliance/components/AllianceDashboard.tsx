import React, { useState } from 'react';
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
  } = useAlliance();

  const modal = useModal();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [createName, setCreateName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

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

          <div className={styles.content}>{renderContent()}</div>
        </div>

        <AllianceWorldMap
          onDeclareWar={async () => {
            if ((alliance?.level || 0) < 5) {
              modal.openAlert({ title: '未解锁', message: '联盟等级达到 Lv.5 解锁攻城战。' });
              return;
            }
            modal.openConfirm({
              title: '宣战',
              message: '宣战将消耗联盟押金并进入倒计时，确认继续？',
              primaryText: '确认',
              secondaryText: '取消',
              onConfirm: async () => {
                await declareWar('mock_target_alliance');
              },
            });
          }}
        />
      </div>
    </div>
  );
};

export default AllianceDashboard;
