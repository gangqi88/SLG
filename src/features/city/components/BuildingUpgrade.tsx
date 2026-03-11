import React from 'react';
import { Building, BuildingUpgradeCost } from '@/features/city/types/MainCity';
import styles from './BuildingUpgrade.module.css';

interface BuildingUpgradeProps {
  building: Building;
  upgradeCost: BuildingUpgradeCost;
  currentResources: { wood: number; stone: number; gold: number };
  onUpgrade: () => void;
  onCancel: () => void;
}

export const BuildingUpgrade: React.FC<BuildingUpgradeProps> = ({
  building,
  upgradeCost,
  currentResources,
  onUpgrade,
  onCancel,
}) => {
  const canAfford =
    currentResources.wood >= upgradeCost.wood &&
    currentResources.stone >= upgradeCost.stone &&
    currentResources.gold >= upgradeCost.gold;

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h3 className={styles.title}>
          Upgrade {getBuildingName(building.type)} to Level {building.level + 1}
        </h3>

        <div className={styles.cost}>
          <div className={styles.costItem}>
            <span>Wood:</span>
            <span
              className={
                currentResources.wood >= upgradeCost.wood ? styles.affordable : styles.expensive
              }
            >
              {upgradeCost.wood}
            </span>
          </div>
          <div className={styles.costItem}>
            <span>Stone:</span>
            <span
              className={
                currentResources.stone >= upgradeCost.stone ? styles.affordable : styles.expensive
              }
            >
              {upgradeCost.stone}
            </span>
          </div>
          <div className={styles.costItem}>
            <span>Gold:</span>
            <span
              className={
                currentResources.gold >= upgradeCost.gold ? styles.affordable : styles.expensive
              }
            >
              {upgradeCost.gold}
            </span>
          </div>
          <div className={styles.costItem}>
            <span>Time:</span>
            <span>{formatTime(upgradeCost.time)}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.upgradeButton} onClick={onUpgrade} disabled={!canAfford}>
            Upgrade
          </button>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
