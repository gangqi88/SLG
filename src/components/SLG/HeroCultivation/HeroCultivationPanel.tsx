import React, { useState } from 'react';
import { Hero, HeroQuality, FactionType, HERO_CONSTANTS } from '../../../types/slg/hero.types';
import { HeroSystem } from '../../../systems/HeroSystem';
import './HeroCultivationPanel.css';

const heroSystem = new HeroSystem();

interface HeroCultivationPanelProps {
  hero: Hero;
  playerGold: number;
  playerDiamonds: number;
  onClose?: () => void;
  onUpdate?: (hero: Hero) => void;
}

export const HeroCultivationPanel: React.FC<HeroCultivationPanelProps> = ({
  hero,
  playerGold,
  playerDiamonds,
  onClose,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'upgrade' | 'evolve' | 'skill' | 'equipment' | 'promote'>('upgrade');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

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

  const getFactionName = (faction: FactionType): string => {
    switch (faction) {
      case 'human': return '人族';
      case 'angel': return '天使';
      case 'demon': return '恶魔';
      default: return '未知';
    }
  };

  const handleUpgrade = () => {
    const expCost = 1000;
    if (playerGold < expCost) {
      showMessage('error', '金币不足');
      return;
    }

    const result = heroSystem.upgradeHero(hero.id, expCost);
    if (result.success) {
      showMessage('success', `升级成功！当前等级: ${result.newLevel}`);
      onUpdate?.(heroSystem.getHero(hero.id)!);
    } else {
      showMessage('error', result.error || '升级失败');
    }
  };

  const handleEvolve = () => {
    const result = heroSystem.evolveHero(hero.id);
    if (result.success) {
      showMessage('success', `进化成功！品质: ${getQualityName(result.newQuality!)}`);
      onUpdate?.(heroSystem.getHero(hero.id)!);
    } else {
      showMessage('error', result.error || '进化失败');
    }
  };

  const handleSkillUpgrade = (skillType: 'activeSkill' | 'passiveSkill' | 'talent') => {
    const result = heroSystem.upgradeSkill(hero.id, skillType);
    if (result.success) {
      showMessage('success', `技能升级成功！当前等级: ${result.newLevel}`);
      onUpdate?.(heroSystem.getHero(hero.id)!);
    } else {
      showMessage('error', result.error || '技能升级失败');
    }
  };

  const handleEquipmentEnhance = (slot: 'weapon' | 'armor' | 'accessory') => {
    const result = heroSystem.enhanceEquipment(hero.id, slot);
    if (result.success) {
      showMessage('success', `装备强化成功！当前等级: ${result.newLevel}`);
      onUpdate?.(heroSystem.getHero(hero.id)!);
    } else {
      showMessage('error', result.error || '装备强化失败');
    }
  };

  const handleStarPromote = () => {
    const result = heroSystem.promoteStar(hero.id);
    if (result.success) {
      showMessage('success', `升星成功！当前星级: ${result.newStars}星`);
      onUpdate?.(heroSystem.getHero(hero.id)!);
    } else {
      showMessage('error', result.error || '升星失败');
    }
  };

  const canEvolve = () => {
    if (hero.quality === 'purple' && hero.stars >= 3) return true;
    if (hero.quality === 'orange' && hero.stars >= 4) return true;
    return false;
  };

  const canPromote = () => {
    return hero.stars < HERO_CONSTANTS.MAX_STARS;
  };

  const renderUpgradeTab = () => (
    <div className="cultivation-tab">
      <h3>英雄升级</h3>
      <div className="current-stats">
        <div className="stat-row">
          <span className="stat-label">当前等级</span>
          <span className="stat-value">{hero.level} / {HERO_CONSTANTS.MAX_LEVEL}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">当前经验</span>
          <span className="stat-value">{hero.experience} / {hero.getExperience}</span>
        </div>
      </div>
      
      <div className="exp-bar-container">
        <div className="exp-bar">
          <div 
            className="exp-fill" 
            style={{ width: `${(hero.experience / hero.getExperience) * 100}%` }}
          />
        </div>
      </div>

      <div className="upgrade-info">
        <p>消耗 1000 金币获得经验</p>
      </div>

      <button 
        className="action-btn upgrade"
        onClick={handleUpgrade}
        disabled={hero.level >= HERO_CONSTANTS.MAX_LEVEL || playerGold < 1000}
      >
        升级
      </button>
    </div>
  );

  const renderEvolveTab = () => (
    <div className="cultivation-tab">
      <h3>英雄进化</h3>
      <div className="current-quality">
        <span className="quality-label">当前品质</span>
        <span 
          className="quality-value"
          style={{ color: getQualityColor(hero.quality) }}
        >
          {getQualityName(hero.quality)}
        </span>
      </div>

      <div className="evolve-progress">
        <div className="progress-item">
          <span>星级要求</span>
          <span>{hero.stars} / {hero.quality === 'purple' ? 3 : 4}</span>
        </div>
      </div>

      <div className="evolve-info">
        {hero.quality === 'purple' && (
          <p>进化至橙将需要 3 星 + 800 英雄之魂</p>
        )}
        {hero.quality === 'orange' && (
          <p>进化至红将需要 4 星 + 2000 英雄之魂 + 100 阵营核心</p>
        )}
        {hero.quality === 'red' && (
          <p>已达最高品质</p>
        )}
      </div>

      <button 
        className="action-btn evolve"
        onClick={handleEvolve}
        disabled={!canEvolve()}
      >
        进化
      </button>
    </div>
  );

  const renderSkillTab = () => (
    <div className="cultivation-tab">
      <h3>技能升级</h3>
      <div className="skills-list">
        {(['activeSkill', 'passiveSkill', 'talent'] as const).map((skillType) => {
          const skill = hero[skillType] as { name: string; description: string } | undefined;
          if (!skill) return null;
          
          return (
            <div key={skillType} className="skill-item">
              <div className="skill-header">
                <span className="skill-name">{skill.name}</span>
                <span className="skill-type">
                  {skillType === 'activeSkill' ? '主动' : skillType === 'passiveSkill' ? '被动' : '天赋'}
                </span>
              </div>
              <p className="skill-desc">{skill.description}</p>
              <div className="skill-actions">
                <button 
                  className="skill-upgrade-btn"
                  onClick={() => handleSkillUpgrade(skillType)}
                >
                  升级
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderEquipmentTab = () => (
    <div className="cultivation-tab">
      <h3>装备强化</h3>
      <div className="equipment-slots">
        {(['weapon', 'armor', 'accessory'] as const).map(slot => {
          const equipment = hero.equipment?.[slot];
          return (
            <div key={slot} className="equipment-slot">
              <div className="slot-header">
                <span className="slot-name">
                  {slot === 'weapon' ? '武器' : slot === 'armor' ? '护甲' : '饰品'}
                </span>
                {equipment && (
                  <span className="slot-level">+{equipment.level}</span>
                )}
              </div>
              {equipment ? (
                <>
                  <p className="equipment-name">{equipment.name}</p>
                  <div className="equipment-attrs">
                    {Object.entries(equipment.enhancements).map(([attr, value]) => (
                      value > 0 && (
                        <span key={attr} className="attr-badge">
                          {attr}: +{value}
                        </span>
                      )
                    ))}
                  </div>
                  <button 
                    className="enhance-btn"
                    onClick={() => handleEquipmentEnhance(slot)}
                    disabled={equipment.level >= equipment.maxLevel}
                  >
                    {equipment.level >= equipment.maxLevel ? '满级' : '强化'}
                  </button>
                </>
              ) : (
                <p className="no-equipment">未装备</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPromoteTab = () => (
    <div className="cultivation-tab">
      <h3>升星突破</h3>
      <div className="current-stars">
        <span className="stars-label">当前星级</span>
        <div className="stars-display">
          {'★'.repeat(hero.stars)}{'☆'.repeat(HERO_CONSTANTS.MAX_STARS - hero.stars)}
        </div>
      </div>

      <div className="star-cost">
        <p>升星消耗：{800 * Math.pow(2, hero.stars)} 英雄之魂</p>
      </div>

      <button 
        className="action-btn promote"
        onClick={handleStarPromote}
        disabled={!canPromote()}
      >
        突破
      </button>
    </div>
  );

  return (
    <div className="cultivation-panel-overlay" onClick={onClose}>
      <div className="cultivation-panel" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="hero-header">
          <img src={hero.avatar} alt={hero.name} className="hero-avatar" />
          <div className="hero-info">
            <h2>{hero.name}</h2>
            <div className="hero-tags">
              <span className="faction-tag">{getFactionName(hero.faction)}</span>
              <span 
                className="quality-tag"
                style={{ backgroundColor: getQualityColor(hero.quality) }}
              >
                {getQualityName(hero.quality)}
              </span>
              <span className="stars-tag">
                {'★'.repeat(hero.stars)}{'☆'.repeat(HERO_CONSTANTS.MAX_STARS - hero.stars)}
              </span>
            </div>
          </div>
        </div>

        <div className="player-resources">
          <span className="resource">💰 {playerGold}</span>
          <span className="resource">💎 {playerDiamonds}</span>
        </div>

        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'upgrade' ? 'active' : ''}`}
            onClick={() => setActiveTab('upgrade')}
          >
            升级
          </button>
          <button 
            className={`tab-btn ${activeTab === 'evolve' ? 'active' : ''}`}
            onClick={() => setActiveTab('evolve')}
          >
            进化
          </button>
          <button 
            className={`tab-btn ${activeTab === 'skill' ? 'active' : ''}`}
            onClick={() => setActiveTab('skill')}
          >
            技能
          </button>
          <button 
            className={`tab-btn ${activeTab === 'equipment' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipment')}
          >
            装备
          </button>
          <button 
            className={`tab-btn ${activeTab === 'promote' ? 'active' : ''}`}
            onClick={() => setActiveTab('promote')}
          >
            升星
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'upgrade' && renderUpgradeTab()}
          {activeTab === 'evolve' && renderEvolveTab()}
          {activeTab === 'skill' && renderSkillTab()}
          {activeTab === 'equipment' && renderEquipmentTab()}
          {activeTab === 'promote' && renderPromoteTab()}
        </div>
      </div>
    </div>
  );
};

export default HeroCultivationPanel;
