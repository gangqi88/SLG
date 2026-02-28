import React, { useState } from 'react';
import { GachaPool, GachaResult } from '../../../systems/GachaSystem';
import { Hero, HeroQuality } from '../../../types/slg/hero.types';
import './GachaPanel.css';

interface GachaPanelProps {
  pools: GachaPool[];
  onDraw: (poolId: string, currency: number) => GachaResult | null;
  playerGold: number;
  playerDiamond: number;
  onClose?: () => void;
}

export const GachaPanel: React.FC<GachaPanelProps> = ({
  pools,
  onDraw,
  playerGold,
  playerDiamond,
  onClose
}) => {
  const [selectedPool, setSelectedPool] = useState<GachaPool | null>(null);
  const [drawResult, setDrawResult] = useState<GachaResult | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const getQualityColor = (quality: HeroQuality): string => {
    switch (quality) {
      case 'purple': return '#9b59b6';
      case 'orange': return '#e67e22';
      case 'red': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getQualityName = (quality: HeroQuality): string => {
    switch (quality) {
      case 'purple': return '紫将';
      case 'orange': return '橙将';
      case 'red': return '红将';
      default: return '未知';
    }
  };

  const handleDraw = async () => {
    if (!selectedPool) return;

    const currency = selectedPool.currency === 'gold' ? playerGold : playerDiamond;
    if (currency < selectedPool.cost) {
      alert('货币不足！');
      return;
    }

    setIsDrawing(true);
    setShowResult(false);

    setTimeout(() => {
      const result = onDraw(selectedPool.id, currency);
      setDrawResult(result);
      setShowResult(true);
      setIsDrawing(false);
    }, 1500);
  };

  const getPoolIcon = (poolId: string): string => {
    switch (poolId) {
      case 'normal': return '🎴';
      case 'advanced': return '💎';
      case 'limited': return '⭐';
      case 'multi_normal': return '🎴x10';
      case 'multi_advanced': return '💎x10';
      default: return '🎴';
    }
  };

  return (
    <div className="gacha-panel-overlay" onClick={onClose}>
      <div className="gacha-panel" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="gacha-header">
          <h2>招募英雄</h2>
          <div className="currency-display">
            <span className="gold">
              <span className="currency-icon">💰</span>
              {playerGold.toLocaleString()}
            </span>
            <span className="diamond">
              <span className="currency-icon">💎</span>
              {playerDiamond.toLocaleString()}
            </span>
          </div>
        </div>

        {!showResult ? (
          <>
            <div className="pool-list">
              {pools.map(pool => (
                <div 
                  key={pool.id}
                  className={`pool-card ${selectedPool?.id === pool.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPool(pool)}
                >
                  <div className="pool-icon">{getPoolIcon(pool.id)}</div>
                  <div className="pool-info">
                    <h3>{pool.name}</h3>
                    <p>{pool.description}</p>
                    {pool.guaranteedQuality && (
                      <span className="guaranteed-badge">
                        保底{pool.guaranteedPull}抽必出{getQualityName(pool.guaranteedQuality)}
                      </span>
                    )}
                  </div>
                  <div className="pool-cost">
                    <span className={pool.currency}>
                      {pool.currency === 'gold' ? '💰' : '💎'}
                      {pool.cost.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {selectedPool && (
              <div className="draw-section">
                <div className="probability-info">
                  <h4>抽取概率</h4>
                  <div className="probability-bars">
                    <div className="prob-item">
                      <span className="prob-label" style={{ color: '#9b59b6' }}>紫将</span>
                      <div className="prob-bar">
                        <div className="prob-fill purple" style={{ width: '60%' }} />
                      </div>
                      <span className="prob-value">60%</span>
                    </div>
                    <div className="prob-item">
                      <span className="prob-label" style={{ color: '#e67e22' }}>橙将</span>
                      <div className="prob-bar">
                        <div className="prob-fill orange" style={{ width: '35%' }} />
                      </div>
                      <span className="prob-value">35%</span>
                    </div>
                    <div className="prob-item">
                      <span className="prob-label" style={{ color: '#e74c3c' }}>红将</span>
                      <div className="prob-bar">
                        <div className="prob-fill red" style={{ width: '5%' }} />
                      </div>
                      <span className="prob-value">5%</span>
                    </div>
                  </div>
                </div>

                <button 
                  className={`draw-btn ${isDrawing ? 'drawing' : ''}`}
                  onClick={handleDraw}
                  disabled={isDrawing || (selectedPool.currency === 'gold' ? playerGold : playerDiamond) < selectedPool.cost}
                >
                  {isDrawing ? '抽取中...' : `消耗 ${selectedPool.currency === 'gold' ? '💰' : '💎'} ${selectedPool.cost} 抽取`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="draw-result">
            <div className="result-header">
              <h3>恭喜获得</h3>
              {drawResult?.isGuaranteed && <span className="guaranteed-tag">保底触发！</span>}
            </div>

            <div className="heroes-showcase">
              {drawResult?.heroes.map((hero, idx) => (
                <div 
                  key={idx} 
                  className="result-hero-card"
                  style={{ borderColor: getQualityColor(hero.quality) }}
                >
                  <div className="hero-image">
                    <img src={hero.avatar} alt={hero.name} />
                  </div>
                  <div className="hero-quality-badge" style={{ backgroundColor: getQualityColor(hero.quality) }}>
                    {getQualityName(hero.quality)}
                  </div>
                  <h4>{hero.name}</h4>
                  <div className="hero-stars">
                    {'★'.repeat(hero.stars)}{'☆'.repeat(5 - hero.stars)}
                  </div>
                  <div className="faction-tag">{hero.faction}</div>
                </div>
              ))}
            </div>

            <div className="result-actions">
              <button className="continue-btn" onClick={() => setShowResult(false)}>
                继续抽取
              </button>
              <button className="close-result-btn" onClick={onClose}>
                关闭
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GachaPanel;
