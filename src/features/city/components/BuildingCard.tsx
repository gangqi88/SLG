import React, { useEffect, useState } from 'react';
import { Building } from '@/features/city/types/MainCity';
import { BuildingUpgrade } from './BuildingUpgrade';
import { useMainCity } from '@/features/city/hooks/useMainCity';
import styles from './BuildingCard.module.css';
import { useModal } from '@/shared/components/ModalProvider';
import { useNavigate } from 'react-router-dom';
import { openResourceWays } from '@/shared/logic/openResourceWays';
import { pickMostDeficient } from '@/shared/logic/resourceDeficit';

interface BuildingCardProps {
  building: Building;
}

export const BuildingCard: React.FC<BuildingCardProps> = ({ building }) => {
  const { getUpgradeCost, startUpgrade, currentResources } = useMainCity();
  const modal = useModal();
  const navigate = useNavigate();
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
    modal.openModal({
      title: '建筑升级',
      content: (
        <BuildingUpgrade
          building={building}
          upgradeCost={upgradeCost}
          currentResources={currentResources}
          onOpenWays={({ resourceKey, title, needAmount, haveAmount }) => {
            modal.close();
            openResourceWays({ modal, navigate, resourceKey, title, needAmount, haveAmount });
          }}
        />
      ),
      actions: [
        { key: 'cancel', label: '取消', variant: 'secondary', onClick: () => modal.close() },
        {
          key: 'upgrade',
          label: '升级',
          variant: 'primary',
          onClick: async () => {
            const success = await startUpgrade(building.id);
            if (success) {
              modal.close();
              return;
            }
            const primary = pickMostDeficient([
              { key: 'wood', need: upgradeCost.wood, have: currentResources.wood },
              { key: 'ore', need: upgradeCost.stone, have: currentResources.stone },
              { key: 'coin', need: upgradeCost.gold, have: currentResources.gold },
            ]);
            if (primary) {
              let title = '金币不足';
              if (primary.key === 'wood') title = '木材不足';
              else if (primary.key === 'ore') title = '矿石不足';
              const needAmount =
                primary.key === 'wood'
                  ? upgradeCost.wood
                  : primary.key === 'ore'
                    ? upgradeCost.stone
                    : upgradeCost.gold;
              const haveAmount =
                primary.key === 'wood'
                  ? currentResources.wood
                  : primary.key === 'ore'
                    ? currentResources.stone
                    : currentResources.gold;
              modal.close();
              openResourceWays({
                modal,
                navigate,
                resourceKey: primary.key,
                title,
                needAmount,
                haveAmount,
              });
              return;
            }
            modal.openAlert({ title: '升级失败', message: '当前无法升级，请稍后再试。' });
          },
        },
      ],
    });
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
  );
};
