import React, { useState, useEffect, useCallback } from 'react';
import { Hero } from '@/features/hero/types/Hero';
import { HeroLogic } from '@/features/hero/logic/HeroLogic';
import InventoryManager from '@/features/resource/logic/InventoryManager';
import { InventoryItem } from '@/features/gacha/types/LootBox';

interface HeroDevelopmentViewProps {
  hero: Hero;
  onClose: () => void;
  onUpdate: () => void; // Callback to refresh parent view
}

const HeroDevelopmentView: React.FC<HeroDevelopmentViewProps> = ({ hero, onClose, onUpdate }) => {
  const [stats, setStats] = useState(HeroLogic.getStats(hero));
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const updateData = useCallback(() => {
    setStats(HeroLogic.getStats(hero));
    setInventory(InventoryManager.getItems());
  }, [hero]);

  const handleOverlayKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClose();
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    updateData();
    const unsubscribe = InventoryManager.subscribe(updateData);
    return unsubscribe;
  }, [updateData]);

  const handleLevelUp = () => {
    if (HeroLogic.levelUp(hero)) {
      updateData();
      onUpdate();
    } else {
      alert('Not enough Hero XP!');
    }
  };

  const handleStarUp = () => {
    if (HeroLogic.starUp(hero)) {
      updateData();
      onUpdate();
    } else {
      alert('Not enough Hero Fragments!');
    }
  };

  const expItem = inventory.find((i) => i.item.id === 'item_hero_exp');
  const fragItem = inventory.find((i) => i.item.id === 'item_hero_fragment');

  const levelUpCost = HeroLogic.getLevelUpCost(hero.level);
  const starUpCost = HeroLogic.getStarUpCost(hero.starRating);
  const canLevelUp = (expItem?.quantity || 0) >= levelUpCost;
  const canStarUp = (fragItem?.quantity || 0) >= starUpCost && hero.starRating < 5;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1100,
      }}
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Close hero development"
    >
      <div
        style={{
          backgroundColor: '#333',
          padding: '24px',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '90%',
          color: '#fff',
          border: '1px solid #555',
          boxShadow: '0 0 20px rgba(0,0,0,0.8)',
        }}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>{hero.name} Development</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <h3>Level: {hero.level}</h3>
            <div style={{ color: '#aaa', fontSize: '0.9em' }}>
              Next Level Cost: {levelUpCost} XP
            </div>
            <div
              style={{
                color: canLevelUp ? '#4caf50' : '#f44336',
                fontSize: '0.8em',
                marginBottom: '10px',
              }}
            >
              Have: {expItem?.quantity || 0} XP
            </div>
            <button
              onClick={handleLevelUp}
              disabled={!canLevelUp}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: canLevelUp ? '#2196f3' : '#555',
                color: '#fff',
                cursor: canLevelUp ? 'pointer' : 'not-allowed',
              }}
            >
              Level Up
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
                  Next Star Cost: {starUpCost} Fragments
                </div>
                <div
                  style={{
                    color: canStarUp ? '#4caf50' : '#f44336',
                    fontSize: '0.8em',
                    marginBottom: '10px',
                  }}
                >
                  Have: {fragItem?.quantity || 0} Fragments
                </div>
                <button
                  onClick={handleStarUp}
                  disabled={!canStarUp}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: canStarUp ? '#ff9800' : '#555',
                    color: '#fff',
                    cursor: canStarUp ? 'pointer' : 'not-allowed',
                  }}
                >
                  Star Up
                </button>
              </>
            ) : (
              <div style={{ color: '#ffd700', marginTop: '10px' }}>Max Stars Reached</div>
            )}
          </div>
        </div>

        <div style={{ backgroundColor: '#222', padding: '15px', borderRadius: '8px' }}>
          <h3>Current Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              Command: <span style={{ color: '#4caf50' }}>{stats.command}</span>
            </div>
            <div>
              Strength: <span style={{ color: '#f44336' }}>{stats.strength}</span>
            </div>
            <div>
              Strategy: <span style={{ color: '#2196f3' }}>{stats.strategy}</span>
            </div>
            <div>
              Defense: <span style={{ color: '#ff9800' }}>{stats.defense}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDevelopmentView;
