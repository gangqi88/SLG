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
import styles from './AllianceDashboard.module.css';

type TabType = 'info' | 'members' | 'checkin' | 'chat' | 'shop' | 'trade' | 'tech' | 'war' | 'ad';

export const AllianceDashboard: React.FC = () => {
  const { 
    alliance, 
    hasAlliance, 
    isLoading,
    createAlliance,
    joinAlliance,
    playerRole,
    playerContribution
  } = useAlliance();
  
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
        <p>Loading alliance data...</p>
      </div>
    );
  }

  if (!hasAlliance) {
    return (
      <div className={styles.noAlliance}>
        <h2>Alliance System</h2>
        <p>Join or create an alliance to enjoy exclusive benefits!</p>
        
        <div className={styles.actions}>
          <button 
            className={styles.createButton}
            onClick={() => setShowCreateModal(true)}
          >
            Create Alliance
          </button>
          <button 
            className={styles.joinButton}
            onClick={() => setShowJoinModal(true)}
          >
            Join Alliance
          </button>
        </div>

        {showCreateModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Create Alliance</h3>
              <input
                type="text"
                placeholder="Alliance Name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className={styles.input}
              />
              <p className={styles.cost}>Cost: 10,000 Gold</p>
              <div className={styles.modalActions}>
                <button onClick={handleCreate} className={styles.confirmButton}>
                  Create
                </button>
                <button onClick={() => setShowCreateModal(false)} className={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showJoinModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Join Alliance</h3>
              <input
                type="text"
                placeholder="Alliance ID"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                className={styles.input}
              />
              <div className={styles.modalActions}>
                <button onClick={handleJoin} className={styles.confirmButton}>
                  Apply
                </button>
                <button onClick={() => setShowJoinModal(false)} className={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const tabs: { key: TabType; label: string; requiresLevel?: number }[] = [
    { key: 'info', label: 'Info' },
    { key: 'members', label: 'Members' },
    { key: 'checkin', label: 'Check-in' },
    { key: 'chat', label: 'Chat' },
    { key: 'shop', label: 'Shop' },
    { key: 'trade', label: 'Trade' },
    { key: 'tech', label: 'Tech', requiresLevel: 4 },
    { key: 'war', label: 'War', requiresLevel: 5 },
    { key: 'ad', label: 'Ad' },
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

  const isTabEnabled = (tab: typeof tabs[0]) => {
    if (!tab.requiresLevel) return true;
    return (alliance?.level || 0) >= tab.requiresLevel;
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2>{alliance?.name}</h2>
        <div className={styles.headerInfo}>
          <span className={styles.level}>Level {alliance?.level}</span>
          <span className={styles.contribution}>
            Contribution: {playerContribution}
          </span>
          {(playerRole === 'leader' || playerRole === 'officer') && (
            <span className={styles.role}>{playerRole}</span>
          )}
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''} ${!isTabEnabled(tab) ? styles.disabledTab : ''}`}
            onClick={() => isTabEnabled(tab) && setActiveTab(tab.key)}
            disabled={!isTabEnabled(tab)}
          >
            {tab.label}
            {!isTabEnabled(tab) && <span className={styles.locked}>🔒 Lv.{tab.requiresLevel}</span>}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
};

export default AllianceDashboard;
