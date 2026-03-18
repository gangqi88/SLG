import React, { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Hero } from '@/features/hero/types/Hero';
import { HeroLogic } from '@/features/hero/logic/HeroLogic';
import InventoryManager from '@/features/resource/logic/InventoryManager';
import { InventoryItem } from '@/features/gacha/types/LootBox';
import { useModal } from '@/shared/components/ModalProvider';
import { openResourceWays } from '@/shared/logic/openResourceWays';
import { useNavigate } from 'react-router-dom';
import { PlayerResources } from '@/shared/logic/PlayerResources';

interface HeroDevelopmentViewProps {
  hero: Hero;
  onUpdate: () => void; // Callback to refresh parent view
}

const HeroDevelopmentView: React.FC<HeroDevelopmentViewProps> = ({ hero, onUpdate }) => {
  const modal = useModal();
  const navigate = useNavigate();
  const resources = useSyncExternalStore(
    (listener) => PlayerResources.subscribe(listener),
    () => PlayerResources.getSnapshot(),
  );
  const [stats, setStats] = useState(HeroLogic.getStats(hero));
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);

  const updateData = useCallback(() => {
    setStats(HeroLogic.getStats(hero));
    setInventory(InventoryManager.getItems());
  }, [hero]);

  useEffect(() => {
    updateData();
    const unsubscribe = InventoryManager.subscribe(updateData);
    return unsubscribe;
  }, [updateData]);

  const handleLevelUp = () => {
    if (HeroLogic.levelUp(hero)) {
      updateData();
      onUpdate();
      setLastSuccess('升级成功');
      setTimeout(() => setLastSuccess(null), 900);
    } else {
      openResourceWays({
        modal,
        navigate,
        resourceKey: 'bun',
        title: '包子不足',
        needAmount: levelUpCost,
        haveAmount: resources.bun,
      });
    }
  };

  const handleStarUp = () => {
    if (HeroLogic.starUp(hero)) {
      updateData();
      onUpdate();
      setLastSuccess('升星成功');
      setTimeout(() => setLastSuccess(null), 900);
    } else {
      openResourceWays({
        modal,
        navigate,
        resourceKey: 'fragment',
        title: '碎片不足',
        needAmount: starUpCost,
        haveAmount: fragItem?.quantity || 0,
      });
    }
  };

  const fragItem = inventory.find((i) => i.item.id === 'item_hero_fragment');

  const levelUpCost = HeroLogic.getLevelUpCost(hero.level);
  const starUpCost = HeroLogic.getStarUpCost(hero.starRating);
  const canLevelUp = resources.bun >= levelUpCost;
  const canStarUp = (fragItem?.quantity || 0) >= starUpCost && hero.starRating < 5;

  return (
    <div>
      <div style={{ marginBottom: 14, color: lastSuccess ? 'var(--game-btn-confirm)' : 'var(--game-text-muted)' }}>
        {lastSuccess ? lastSuccess : '养成会消耗资源并提升属性'}
      </div>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <h3>Level: {hero.level}</h3>
            <div style={{ color: '#aaa', fontSize: '0.9em' }}>
              下一级消耗：{levelUpCost} 包子
            </div>
            <div
              style={{
                color: canLevelUp ? '#4caf50' : '#f44336',
                fontSize: '0.8em',
                marginBottom: '10px',
              }}
            >
              当前拥有：{resources.bun} 包子
            </div>
            <button
              onClick={handleLevelUp}
              disabled={!canLevelUp}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: canLevelUp ? 'var(--game-btn-confirm)' : '#555',
                color: '#fff',
                cursor: canLevelUp ? 'pointer' : 'not-allowed',
              }}
            >
              升级
            </button>
          </div>

          <div style={{ flex: 1 }}>
            <h3>
              Star Rating: {'★'.repeat(hero.starRating)}
              {'☆'.repeat(5 - hero.starRating)}
            </h3>
            {hero.starRating < 5 ? (
              <>
                <div style={{ color: '#aaa', fontSize: '0.9em' }}>
                  下一星消耗：{starUpCost} 碎片
                </div>
                <div
                  style={{
                    color: canStarUp ? '#4caf50' : '#f44336',
                    fontSize: '0.8em',
                    marginBottom: '10px',
                  }}
                >
                  当前拥有：{fragItem?.quantity || 0} 碎片
                </div>
                <button
                  onClick={handleStarUp}
                  disabled={!canStarUp}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: canStarUp ? 'var(--game-btn-reward)' : '#555',
                    color: '#fff',
                    cursor: canStarUp ? 'pointer' : 'not-allowed',
                  }}
                >
                  升星
                </button>
              </>
            ) : (
              <div style={{ color: '#ffd700', marginTop: '10px' }}>已满星</div>
            )}
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(0,0,0,0.25)',
            padding: '15px',
            borderRadius: '12px',
            border: '1px solid var(--game-border)',
          }}
        >
          <h3>当前属性</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              统御: <span style={{ color: '#4caf50' }}>{stats.command}</span>
            </div>
            <div>
              武力: <span style={{ color: '#f44336' }}>{stats.strength}</span>
            </div>
            <div>
              谋略: <span style={{ color: '#2196f3' }}>{stats.strategy}</span>
            </div>
            <div>
              防御: <span style={{ color: '#ff9800' }}>{stats.defense}</span>
            </div>
          </div>
        </div>
    </div>
  );
};

export default HeroDevelopmentView;
