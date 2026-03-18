import React from 'react';
import { Building, BuildingUpgradeCost } from '@/features/city/types/MainCity';
import styles from './BuildingUpgrade.module.css';
import { useModal } from '@/shared/components/ModalProvider';
import { useNavigate } from 'react-router-dom';
import { openResourceWays } from '@/shared/logic/openResourceWays';

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
  const modal = useModal();
  const navigate = useNavigate();
  const canAfford =
    currentResources.wood >= upgradeCost.wood &&
    currentResources.stone >= upgradeCost.stone &&
    currentResources.gold >= upgradeCost.gold;

  const needWood = currentResources.wood < upgradeCost.wood;
  const needStone = currentResources.stone < upgradeCost.stone;
  const needGold = currentResources.gold < upgradeCost.gold;

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}小时 ${minutes}分`;
    }
    return `${minutes}分`;
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
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h3 className={styles.title}>
          升级 {getBuildingName(building.type)} 至 {building.level + 1} 级
        </h3>

        <div className={styles.cost}>
          <div className={styles.costItem}>
            <span>木材:</span>
            <span
              className={
                currentResources.wood >= upgradeCost.wood ? styles.affordable : styles.expensive
              }
            >
              {upgradeCost.wood}
            </span>
            {needWood ? (
              <button
                type="button"
                className={styles.wayButton}
                onClick={() => openResourceWays({ modal, navigate, resourceKey: 'wood', title: '木材不足' })}
              >
                获取
              </button>
            ) : (
              <span />
            )}
          </div>
          <div className={styles.costItem}>
            <span>矿石:</span>
            <span
              className={
                currentResources.stone >= upgradeCost.stone ? styles.affordable : styles.expensive
              }
            >
              {upgradeCost.stone}
            </span>
            {needStone ? (
              <button
                type="button"
                className={styles.wayButton}
                onClick={() => openResourceWays({ modal, navigate, resourceKey: 'ore', title: '矿石不足' })}
              >
                获取
              </button>
            ) : (
              <span />
            )}
          </div>
          <div className={styles.costItem}>
            <span>金币:</span>
            <span
              className={
                currentResources.gold >= upgradeCost.gold ? styles.affordable : styles.expensive
              }
            >
              {upgradeCost.gold}
            </span>
            {needGold ? (
              <button
                type="button"
                className={styles.wayButton}
                onClick={() => openResourceWays({ modal, navigate, resourceKey: 'coin', title: '金币不足' })}
              >
                获取
              </button>
            ) : (
              <span />
            )}
          </div>
          <div className={styles.costItem}>
            <span>耗时:</span>
            <span>{formatTime(upgradeCost.time)}</span>
            <span />
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.upgradeButton} onClick={onUpgrade} disabled={!canAfford}>
            升级
          </button>
          <button className={styles.cancelButton} onClick={onCancel}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
};
