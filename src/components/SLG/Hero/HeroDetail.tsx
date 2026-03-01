import React, { useState } from 'react';
import { Hero, HeroQuality, FactionType } from '../../../types/slg/hero.types';
import './HeroDetail.css';

interface HeroDetailProps {
  hero: Hero;
  onClose?: () => void;
  onUpgrade?: (heroId: string) => void;
  onEvolve?: (heroId: string) => void;
  onAddToTeam?: (heroId: string) => void;
}

export const HeroDetail: React.FC<HeroDetailProps> = ({
  hero,
  onClose,
  onUpgrade,
  onEvolve,
  onAddToTeam
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'skills' | 'bonds' | 'lore'>('stats');

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

  const getFactionClass = (faction: FactionType): string => {
    switch (faction) {
      case 'human': return 'faction-human';
      case 'angel': return 'faction-angel';
      case 'demon': return 'faction-demon';
      default: return '';
    }
  };

  return (
    <div className="hero-detail-overlay" onClick={onClose}>
      <div className={`hero-detail ${getFactionClass(hero.faction)}`} onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="hero-header-section">
          <div className="hero-portrait">
            <img src={hero.fullImage || hero.avatar} alt={hero.name} />
            <div className="quality-badge" style={{ backgroundColor: getQualityColor(hero.quality) }}>
              {getQualityName(hero.quality)}
            </div>
            <div className="stars-display">
              {'★'.repeat(hero.stars)}{'☆'.repeat(5 - hero.stars)}
            </div>
          </div>
          
          <div className="hero-basic-info">
            <h2 className="hero-name">{hero.name}</h2>
            <div className="faction-badge">{getFactionName(hero.faction)}</div>
            <div className="level-info">
              <span>等级 {hero.level}</span>
              <span className="exp-bar">
                <span className="exp-fill" style={{ width: `${(hero.experience / hero.getExperience) * 100}%` }} />
              </span>
            </div>
            <div className="hero-status">
              <span className={hero.status}>{hero.status}</span>
              {hero.isNFT && <span className="nft-tag">NFT</span>}
            </div>
          </div>
        </div>

        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            属性
          </button>
          <button 
            className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            技能
          </button>
          <button 
            className={`tab-btn ${activeTab === 'bonds' ? 'active' : ''}`}
            onClick={() => setActiveTab('bonds')}
          >
            羁绊
          </button>
          <button 
            className={`tab-btn ${activeTab === 'lore' ? 'active' : ''}`}
            onClick={() => setActiveTab('lore')}
          >
            故事
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'stats' && (
            <div className="stats-tab">
              <div className="attributes-section">
                <h3>基础属性</h3>
                <div className="attributes-grid">
                  <div className="attribute-item">
                    <span className="attr-name">统御</span>
                    <span className="attr-value">{hero.attributes.command}</span>
                    <span className="attr-growth">+{hero.growthRates.command}</span>
                  </div>
                  <div className="attribute-item">
                    <span className="attr-name">武力</span>
                    <span className="attr-value">{hero.attributes.strength}</span>
                    <span className="attr-growth">+{hero.growthRates.strength}</span>
                  </div>
                  <div className="attribute-item">
                    <span className="attr-name">谋略</span>
                    <span className="attr-value">{hero.attributes.strategy}</span>
                    <span className="attr-growth">+{hero.growthRates.strategy}</span>
                  </div>
                  <div className="attribute-item">
                    <span className="attr-name">防御</span>
                    <span className="attr-value">{hero.attributes.defense}</span>
                    <span className="attr-growth">+{hero.growthRates.defense}</span>
                  </div>
                </div>
              </div>

              <div className="battle-stats-section">
                <h3>战斗数据</h3>
                <div className="battle-stats-grid">
                  <div className="battle-stat">
                    <span className="stat-label">胜利</span>
                    <span className="stat-value win">{hero.battleStats.battlesWon}</span>
                  </div>
                  <div className="battle-stat">
                    <span className="stat-label">失败</span>
                    <span className="stat-value lose">{hero.battleStats.battlesLost}</span>
                  </div>
                  <div className="battle-stat">
                    <span className="stat-label">总伤害</span>
                    <span className="stat-value">{hero.battleStats.totalDamage}</span>
                  </div>
                  <div className="battle-stat">
                    <span className="stat-label">总治疗</span>
                    <span className="stat-value">{hero.battleStats.totalHealing}</span>
                  </div>
                  <div className="battle-stat">
                    <span className="stat-label">暴击</span>
                    <span className="stat-value">{hero.battleStats.criticalHits}</span>
                  </div>
                  <div className="battle-stat">
                    <span className="stat-label">闪避</span>
                    <span className="stat-value">{hero.battleStats.dodges}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="skills-tab">
              <div className="skill-card active-skill">
                <div className="skill-header">
                  <h3>主动技能</h3>
                  <span className="cooldown">冷却: {hero.activeSkill.cooldown}秒</span>
                </div>
                <div className="skill-icon">
                  <img src={hero.activeSkill.icon} alt={hero.activeSkill.name} />
                </div>
                <h4>{hero.activeSkill.name}</h4>
                <p className="skill-desc">{hero.activeSkill.description}</p>
                <div className="skill-tags">
                  {hero.activeSkill.tags.map(tag => (
                    <span key={tag} className="skill-tag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="skill-card passive-skill">
                <div className="skill-header">
                  <h3>被动技能</h3>
                </div>
                <div className="skill-icon">
                  <img src={hero.passiveSkill.icon} alt={hero.passiveSkill.name} />
                </div>
                <h4>{hero.passiveSkill.name}</h4>
                <p className="skill-desc">{hero.passiveSkill.description}</p>
              </div>

              <div className="skill-card talent-skill">
                <div className="skill-header">
                  <h3>天赋</h3>
                </div>
                <div className="skill-icon">
                  <img src={hero.talent.icon} alt={hero.talent.name} />
                </div>
                <h4>{hero.talent.name}</h4>
                <p className="skill-desc">{hero.talent.description}</p>
              </div>
            </div>
          )}

          {activeTab === 'bonds' && (
            <div className="bonds-tab">
              <h3>羁绊关系</h3>
              {hero.bonds.map(bond => (
                <div key={bond.id} className={`bond-card ${hero.bondActive ? 'active' : ''}`}>
                  <div className="bond-header">
                    <h4>{bond.name}</h4>
                    {hero.bondActive && <span className="active-tag">已激活</span>}
                  </div>
                  <p className="bond-desc">{bond.description}</p>
                  <div className="bond-heroes">
                    {bond.heroes.map(heroId => (
                      <span key={heroId} className="bond-hero">{heroId}</span>
                    ))}
                  </div>
                  <div className="bond-effects">
                    {bond.effects.map((effect, idx) => (
                      <span key={idx} className="bond-effect">
                        {effect.attribute} +{effect.bonus}%
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'lore' && (
            <div className="lore-tab">
              <h3>背景故事</h3>
              <p className="lore-text">{hero.lore}</p>
              
              <h3>英雄台词</h3>
              <div className="quotes-list">
                {hero.quotes.map((quote, idx) => (
                  <blockquote key={idx} className="quote">
                    "{quote}"
                  </blockquote>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button 
            className="action-btn upgrade"
            onClick={() => onUpgrade?.(hero.id)}
            disabled={hero.level >= 80}
          >
            升级
          </button>
          <button 
            className="action-btn evolve"
            onClick={() => onEvolve?.(hero.id)}
            disabled={
              (hero.quality === 'purple' && hero.stars < 3) ||
              (hero.quality === 'orange' && hero.stars < 4)
            }
          >
            进化
          </button>
          <button 
            className="action-btn team"
            onClick={() => onAddToTeam?.(hero.id)}
          >
            编入队伍
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroDetail;
