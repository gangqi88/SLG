import React, { useState, useEffect } from 'react';
import { Building } from '@/features/city/types/MainCity';
import { BuildingUpgrade } from './BuildingUpgrade';
import { useMainCity } from '@/features/city/hooks/useMainCity';
import styles from './BuildingCard.module.css';
import { useModal } from '@/shared/components/ModalProvider';

interface BuildingCardProps {
  building: Building;
}

export const BuildingCard: React.FC<BuildingCardProps> = ({ building }) => {
  const { getUpgradeCost, startUpgrade, currentResources } = useMainCity();
  const modal = useModal();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [countdown, setCountdown] = useState<string>('');

  const upgradeCost = getUpgradeCost(building.type, building.level);

  useEffect(() => {
    if (!building.isUpgrading || building.upgradeEndTime === 0) {
      setCountdown('');
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const remaining = Math.max(0, building.upgradeEndTime - now);

      if (remaining <= 0) {
        setCountdown('Completed!');
        return;
      }

      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);

      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [building.isUpgrading, building.upgradeEndTime]);

  const handleUpgradeClick = () => {
    if (building.isUpgrading) {
      return;
    }
    if (building.level >= building.maxLevel) {
      modal.openAlert({ title: '提示', message: '已达到最高等级。' });
      return;
    }
    setShowUpgradeModal(true);
  };

  const handleUpgradeConfirm = async () => {
    const success = await startUpgrade(building.id);
    if (success) {
      setShowUpgradeModal(false);
    } else {
      modal.openAlert({
        title: '资源不足',
        message: '资源不足，无法开始升级。请前往采集/任务/活动获取。',
      });
    }
  };

  const handleUpgradeCancel = () => {
    setShowUpgradeModal(false);
  };

  const getBuildingName = (type: string): string => {
    const names: Record<string, string> = {
      castle: '城堡',
      warehouse: '仓库',
      wall: '城墙',
      lumber: '伐木场',
      quarry: '采石场',
      farm: '农田',
      market: '集市',
      barracks: '兵营',
      stable: '马厩',
      range: '弓兵营',
      hospital: '医馆',
      alliance_hall: '联盟大厅',
      hero_hall: '武将府',
      bazaar: '集市坊',
    };
    return names[type] || type;
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.icon}>{building.type.charAt(0).toUpperCase()}</div>
        <div className={styles.info}>
          <h3 className={styles.name}>{getBuildingName(building.type)}</h3>
          <p className={styles.level}>
            等级 {building.level} / {building.maxLevel}
          </p>
          {building.isUpgrading ? (
            <div className={styles.upgrading}>{countdown || 'Upgrading...'}</div>
          ) : building.level >= building.maxLevel ? (
            <div className={styles.maxLevel}>MAX</div>
          ) : null}
        </div>
        <button
          className={styles.upgradeButton}
          onClick={handleUpgradeClick}
          disabled={building.isUpgrading || building.level >= building.maxLevel}
        >
          {building.level >= building.maxLevel ? '已满级' : '升级'}
        </button>
      </div>

      {showUpgradeModal && (
        <BuildingUpgrade
          building={building}
          upgradeCost={upgradeCost}
          currentResources={currentResources}
          onUpgrade={handleUpgradeConfirm}
          onCancel={handleUpgradeCancel}
        />
      )}
    </>
  );
};
