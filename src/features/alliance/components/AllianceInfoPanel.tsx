import React, { useState } from 'react';
import { useAlliance } from '@/features/alliance/hooks/useAlliance';
import styles from './AllianceInfoPanel.module.css';

export const AllianceInfoPanel: React.FC = () => {
  const { alliance, playerRole, upgradeAlliance, updateAnnouncement } = useAlliance();
  const [isEditing, setIsEditing] = useState(false);
  const [announcement, setAnnouncement] = useState(alliance?.announcement || '');
  const [upgradeCost, setUpgradeCost] = useState(0);

  React.useEffect(() => {
    if (alliance) {
      const costs = [0, 50000, 150000, 400000, 1000000, 2500000, 5000000, 10000000];
      setUpgradeCost(costs[alliance.level] || 0);
    }
  }, [alliance]);

  const handleSaveAnnouncement = async () => {
    await updateAnnouncement(announcement);
    setIsEditing(false);
  };

  const handleUpgrade = async () => {
    await upgradeAlliance();
  };

  if (!alliance) return null;

  const getFeatures = () => {
    const features: Record<number, string[]> = {
      1: ['基础聊天'],
      2: ['签到', '交易'],
      3: ['联盟商店'],
      4: ['联盟科技 Lv.1'],
      5: ['攻城战', '科技 Lv.2'],
      6: ['科技 Lv.2'],
      7: ['科技 Lv.3'],
      8: ['高级攻城', '科技 Lv.3'],
    };
    return features[alliance.level] || [];
  };

  return (
    <div className={styles.infoPanel}>
      <div className={styles.basicInfo}>
        <div className={styles.logo}>
          <span>{alliance.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className={styles.details}>
          <h3>{alliance.name}</h3>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.label}>等级</span>
              <span className={styles.value}>{alliance.level}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.label}>人数</span>
              <span className={styles.value}>
                {alliance.memberCount}/{alliance.maxMembers}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.label}>创建</span>
              <span className={styles.value}>
                {new Date(alliance.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {playerRole === 'leader' && alliance.level < 8 && (
        <div className={styles.upgradeSection}>
          <button className={styles.upgradeButton} onClick={handleUpgrade}>
            升级联盟（消耗：{upgradeCost.toLocaleString()} 金币）
          </button>
        </div>
      )}

      <div className={styles.features}>
        <h4>已解锁功能</h4>
        <div className={styles.featureList}>
          {getFeatures().map((feature, index) => (
            <span key={index} className={styles.feature}>
              {feature}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.announcement}>
        <div className={styles.announcementHeader}>
          <h4>联盟公告</h4>
          {playerRole === 'leader' && (
            <button
              className={styles.editButton}
              onClick={() => (isEditing ? handleSaveAnnouncement() : setIsEditing(true))}
            >
              {isEditing ? '保存' : '编辑'}
            </button>
          )}
        </div>
        {isEditing ? (
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className={styles.textarea}
            rows={3}
          />
        ) : (
          <p className={styles.announcementText}>{alliance.announcement}</p>
        )}
      </div>
    </div>
  );
};
