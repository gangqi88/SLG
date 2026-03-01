import React, { useState } from 'react';
import { Hero, FactionType } from '../../../types/slg/hero.types';
import { City, CityBuildingType, GOVERNMENT_POSITIONS, getFactionStyle, getFactionColor } from '../../../types/slg/city.types';
import { citySystem } from '../../../systems/CitySystem';
import './CityPanel.css';

interface CityPanelProps {
  city: City;
  availableHeroes?: Hero[];
  onClose?: () => void;
}

export const CityPanel: React.FC<CityPanelProps> = ({ city, availableHeroes = [], onClose }) => {
  const [activeTab, setActiveTab] = useState<'buildings' | 'defense' | 'resources' | 'government'>('buildings');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const factionStyle = getFactionStyle(city.faction);
  const factionColor = getFactionColor(city.faction);

  const getFactionName = (faction: FactionType): string => {
    switch (faction) {
      case 'human': return '人族';
      case 'angel': return '天使';
      case 'demon': return '恶魔';
      default: return '未知';
    }
  };

  const handleUpgrade = (type: CityBuildingType) => {
    const result = citySystem.upgradeBuilding(city.id, type);
    if (result.success) {
      showMessage('success', '升级成功');
    } else {
      showMessage('error', result.error || '升级失败');
    }
  };

  const handleRepair = () => {
    const result = citySystem.repairWall(city.id);
    if (result.success) {
      showMessage('success', '修复成功');
    } else {
      showMessage('error', result.error || '修复失败');
    }
  };

  const totalProduction = citySystem.calculateTotalProduction(city);
  const cityDefense = citySystem.calculateCityDefense(city);
  const cityPower = citySystem.calculateCityPower(city);

  const renderBuildingsTab = () => (
    <div className="buildings-tab">
      {city.buildings.map(building => {
        const canUpgrade = building.level < building.maxLevel;
        return (
          <div key={building.id} className="building-card">
            <div className="building-header">
              <span className="building-name">{building.name}</span>
              <span className="building-level">Lv.{building.level}</span>
            </div>
            <div className="building-production">
              {building.production.food > 0 && <span>🍎 {building.production.food}</span>}
              {building.production.wood > 0 && <span>🪵 {building.production.wood}</span>}
              {building.production.steel > 0 && <span>⛓️ {building.production.steel}</span>}
              {building.production.gold > 0 && <span>💰 {building.production.gold}</span>}
            </div>
            {canUpgrade && (
              <button 
                className="upgrade-btn"
                onClick={() => handleUpgrade(building.type)}
              >
                升级
              </button>
            )}
            {!canUpgrade && <span className="max-level">满级</span>}
          </div>
        );
      })}
    </div>
  );

  const renderDefenseTab = () => (
    <div className="defense-tab">
      <div className="defense-overview">
        <div className="defense-item">
          <span className="defense-label">城墙耐久</span>
          <div className="defense-bar">
            <div 
              className="defense-fill"
              style={{ width: `${(city.defense.wallHealth / city.defense.maxWallHealth) * 100}%` }}
            />
          </div>
          <span className="defense-value">
            {city.defense.wallHealth} / {city.defense.maxWallHealth}
          </span>
        </div>
      </div>

      <div className="defense-stats">
        <div className="stat-card">
          <span className="stat-value">{city.defense.towerCount}</span>
          <span className="stat-label">箭塔</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{city.defense.defenders}</span>
          <span className="stat-label">守军</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{cityDefense}</span>
          <span className="stat-label">总防御</span>
        </div>
      </div>

      <button className="repair-btn" onClick={handleRepair}>
        修复城墙
      </button>
    </div>
  );

  const renderResourcesTab = () => (
    <div className="resources-tab">
      <div className="resources-capacity">
        <span>仓库容量</span>
        <div className="capacity-bar">
          <div 
            className="capacity-fill"
            style={{ 
              width: `${((city.resources.food + city.resources.wood + city.resources.steel) / city.resources.maxCapacity) * 100}%` 
            }}
          />
        </div>
        <span className="capacity-text">
          {city.resources.food + city.resources.wood + city.resources.steel} / {city.resources.maxCapacity}
        </span>
      </div>

      <div className="resources-grid">
        <div className="resource-card food">
          <span className="resource-icon">🍎</span>
          <span className="resource-value">{city.resources.food}</span>
          <span className="resource-rate">+{totalProduction.food}/h</span>
        </div>
        <div className="resource-card wood">
          <span className="resource-icon">🪵</span>
          <span className="resource-value">{city.resources.wood}</span>
          <span className="resource-rate">+{totalProduction.wood}/h</span>
        </div>
        <div className="resource-card steel">
          <span className="resource-icon">⛓️</span>
          <span className="resource-value">{city.resources.steel}</span>
          <span className="resource-rate">+{totalProduction.steel}/h</span>
        </div>
        <div className="resource-card gold">
          <span className="resource-icon">💰</span>
          <span className="resource-value">{city.resources.gold}</span>
          <span className="resource-rate">+{totalProduction.gold}/h</span>
        </div>
      </div>
    </div>
  );

  const renderGovernmentTab = () => {
    const governmentHeroes = citySystem.getGovernmentHeroes(city.id);
    const availablePositions = citySystem.getAvailablePositions(city.id);
    const governmentBonus = citySystem.calculateGovernmentBonus(city);

    const getHeroById = (heroId: string) => availableHeroes.find(h => h.id === heroId);

    return (
      <div className="government-tab">
        <div className="government-bonus">
          <h4>内政加成</h4>
          <div className="bonus-grid">
            {governmentBonus.food > 0 && <span className="bonus-item">🍎 食物 +{governmentBonus.food}%</span>}
            {governmentBonus.wood > 0 && <span className="bonus-item">🪵 木材 +{governmentBonus.wood}%</span>}
            {governmentBonus.steel > 0 && <span className="bonus-item">⛓️ 钢铁 +{governmentBonus.steel}%</span>}
            {governmentBonus.gold > 0 && <span className="bonus-item">💰 金币 +{governmentBonus.gold}%</span>}
            {governmentBonus.defense > 0 && <span className="bonus-item">🛡️ 防御 +{governmentBonus.defense}%</span>}
            {governmentBonus.training > 0 && <span className="bonus-item">⚔️ 训练 +{governmentBonus.training}%</span>}
            {governmentBonus.research > 0 && <span className="bonus-item">🔬 研究 +{governmentBonus.research}%</span>}
          </div>
        </div>

        <div className="current-officials">
          <h4>在任官员</h4>
          {governmentHeroes.length === 0 ? (
            <p className="no-officials">暂无官员任职</p>
          ) : (
            <div className="official-list">
              {governmentHeroes.map(hero => {
                const heroData = getHeroById(hero.heroId);
                const positionInfo = GOVERNMENT_POSITIONS[hero.position];
                return (
                  <div key={hero.heroId} className="official-card">
                    <div className="official-info">
                      <span className="official-name">{heroData?.name || '未知英雄'}</span>
                      <span className="official-position">{positionInfo.name}</span>
                    </div>
                    <p className="official-desc">{positionInfo.description}</p>
                    <button 
                      className="remove-btn"
                      onClick={() => {
                        const result = citySystem.removeGovernmentHero(city.id, hero.heroId);
                        if (result.success) {
                          showMessage('success', '解除职位成功');
                        } else {
                          showMessage('error', result.error || '解除失败');
                        }
                      }}
                    >
                      解除
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {availableHeroes.length > 0 && availablePositions.length > 0 && (
          <div className="assign-hero">
            <h4>任命英雄</h4>
            <div className="position-select">
              {availablePositions.map(position => {
                const positionInfo = GOVERNMENT_POSITIONS[position];
                return (
                  <button 
                    key={position}
                    className="position-btn"
                    onClick={() => {
                      const heroId = availableHeroes[0]?.id;
                      if (heroId) {
                        const result = citySystem.assignGovernmentHero(city.id, heroId, position);
                        if (result.success) {
                          showMessage('success', `任命成功：${positionInfo.name}`);
                        } else {
                          showMessage('error', result.error || '任命失败');
                        }
                      }
                    }}
                  >
                    <span className="position-name">{positionInfo.name}</span>
                    <span className="position-desc">{positionInfo.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="city-panel-overlay" onClick={onClose}>
      <div 
        className="city-panel" 
        onClick={e => e.stopPropagation()}
        style={{ 
          background: `linear-gradient(135deg, ${factionStyle.primary} 0%, ${factionStyle.secondary} 100%)`,
          borderColor: factionColor 
        }}
      >
        <button className="close-btn" onClick={onClose}>×</button>
        
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="city-header">
          <h2>{city.name}</h2>
          <div className="city-tags">
            <span 
              className="faction-tag"
              style={{ backgroundColor: factionColor }}
            >
              {getFactionName(city.faction)}
            </span>
            <span className="level-tag">Lv.{city.level}</span>
          </div>
        </div>

        <div className="city-power">
          <span>城市战力</span>
          <span className="power-value">{cityPower}</span>
        </div>

        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'buildings' ? 'active' : ''}`}
            onClick={() => setActiveTab('buildings')}
          >
            建筑
          </button>
          <button 
            className={`tab-btn ${activeTab === 'defense' ? 'active' : ''}`}
            onClick={() => setActiveTab('defense')}
          >
            防御
          </button>
          <button 
            className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            资源
          </button>
          <button 
            className={`tab-btn ${activeTab === 'government' ? 'active' : ''}`}
            onClick={() => setActiveTab('government')}
          >
            内政
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'buildings' && renderBuildingsTab()}
          {activeTab === 'defense' && renderDefenseTab()}
          {activeTab === 'resources' && renderResourcesTab()}
          {activeTab === 'government' && renderGovernmentTab()}
        </div>
      </div>
    </div>
  );
};

export default CityPanel;
