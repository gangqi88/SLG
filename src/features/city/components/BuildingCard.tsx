import React, { useState, useEffect } from 'react';
import { Building } from '@/features/city/types/MainCity';
import { BuildingUpgrade } from './BuildingUpgrade';
import { useMainCity } from '@/features/city/hooks/useMainCity';
import styles from './BuildingCard.module.css';

interface BuildingCardProps {
  building: Building;
}

export const BuildingCard: React.FC<BuildingCardProps> = ({ building }) => {
  const { getUpgradeCost, startUpgrade, currentResources } = useMainCity();
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
      alert('Building is at max level!');
      return;
    }
    setShowUpgradeModal(true);
  };

  const handleUpgradeConfirm = async () => {
    const success = await startUpgrade(building.id);
    if (success) {
      setShowUpgradeModal(false);
    } else {
      alert('Failed to start upgrade. Make sure you have enough resources.');
    }
  };

  const handleUpgradeCancel = () => {
    setShowUpgradeModal(false);
  };

  const getBuildingName = (type: string): string => {
    const names: Record<string, string> = {
      castle: 'Castle',
      warehouse: 'Warehouse',
      wall: 'Wall',
      lumber: 'Lumber Mill',
      quarry: 'Quarry',
      farm: 'Farm',
      market: 'Market',
      barracks: 'Barracks',
      stable: 'Stable',
      range: 'Range',
      hospital: 'Hospital',
      alliance_hall: 'Alliance Hall',
      hero_hall: 'Hero Hall',
      bazaar: 'Bazaar',
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
            Level {building.level} / {building.maxLevel}
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
          {building.level >= building.maxLevel ? 'Maxed' : 'Upgrade'}
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
