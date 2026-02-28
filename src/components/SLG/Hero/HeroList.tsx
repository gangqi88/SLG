import React, { useState, useEffect } from 'react';
import { Hero, HeroFilterOptions, HeroSortOptions } from '../../../types/slg/hero.types';
import { HeroSystem } from '../../../systems/HeroSystem';
import './HeroCard.css';
import './HeroList.css';

interface HeroListProps {
  heroSystem: HeroSystem;
  onHeroSelect?: (hero: Hero) => void;
  onHeroUpgrade?: (heroId: string) => void;
  onHeroEvolve?: (heroId: string) => void;
}

export const HeroList: React.FC<HeroListProps> = ({ 
  heroSystem, 
  onHeroSelect, 
  onHeroUpgrade, 
  onHeroEvolve 
}) => {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [filteredHeroes, setFilteredHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

  // 筛选和排序状态
  const [filters, setFilters] = useState<HeroFilterOptions>({
    factions: [],
    qualities: [],
    stars: [],
    levels: [1, 80],
    powers: [0, 10000],
    tags: [],
    hasBond: false,
    isNFT: false,
    searchText: ''
  });

  const [sortOptions, setSortOptions] = useState<HeroSortOptions>({
    field: 'power',
    order: 'desc'
  });

  // 加载英雄数据
  useEffect(() => {
    const loadHeroes = async () => {
      try {
        setLoading(true);
        const playerHeroes = heroSystem.getPlayerHeroes();
        setHeroes(playerHeroes);
        
        // 应用筛选和排序
        let result = heroSystem.filterHeroes(playerHeroes, filters);
        result = heroSystem.sortHeroes(result, sortOptions);
        setFilteredHeroes(result);
      } catch (error) {
        console.error('加载英雄列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHeroes();
  }, [heroSystem]);

  // 当筛选或排序变化时更新显示
  useEffect(() => {
    let result = heroSystem.filterHeroes(heroes, filters);
    result = heroSystem.sortHeroes(result, sortOptions);
    setFilteredHeroes(result);
  }, [heroes, filters, sortOptions, heroSystem]);

  // 处理英雄选择
  const handleHeroSelect = (hero: Hero) => {
    setSelectedHero(hero);
    onHeroSelect?.(hero);
  };

  // 处理筛选变化
  const handleFilterChange = (newFilters: Partial<HeroFilterOptions>) => {
    setFilters((prev: HeroFilterOptions) => ({ ...prev, ...newFilters }));
  };

  // 处理排序变化
  const handleSortChange = (field: HeroSortOptions['field']) => {
    setSortOptions((prev: HeroSortOptions) => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
    }));
  };

  // 获取品质颜色
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'purple': return '#9b59b6';
      case 'orange': return '#e67e22';
      case 'red': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  // 获取阵营图标
  const getFactionIcon = (faction: string) => {
    switch (faction) {
      case 'human': return '👥';
      case 'angel': return '👼';
      case 'demon': return '👹';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="hero-list-container loading">
        <div className="loading-spinner">加载中...</div>
      </div>
    );
  }

  return (
    <div className="hero-list-container">
      {/* 筛选栏 */}
      <div className="hero-filters">
        <div className="filter-section">
          <h3>阵营筛选</h3>
          <div className="filter-options">
            <label>
              <input 
                type="checkbox" 
                checked={filters.factions.includes('human')}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleFilterChange({ factions: [...filters.factions, 'human'] });
                  } else {
                    handleFilterChange({ factions: filters.factions.filter((f: string) => f !== 'human') });
                  }
                }}
              />
              👥 人族
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={filters.factions.includes('angel')}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleFilterChange({ factions: [...filters.factions, 'angel'] });
                  } else {
                    handleFilterChange({ factions: filters.factions.filter((f: string) => f !== 'angel') });
                  }
                }}
              />
              👼 天使
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={filters.factions.includes('demon')}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleFilterChange({ factions: [...filters.factions, 'demon'] });
                  } else {
                    handleFilterChange({ factions: filters.factions.filter((f: string) => f !== 'demon') });
                  }
                }}
              />
              👹 恶魔
            </label>
          </div>
        </div>

        <div className="filter-section">
          <h3>品质筛选</h3>
          <div className="filter-options">
            <label>
              <input 
                type="checkbox" 
                checked={filters.qualities.includes('purple')}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleFilterChange({ qualities: [...filters.qualities, 'purple'] });
                  } else {
                    handleFilterChange({ qualities: filters.qualities.filter((q: string) => q !== 'purple') });
                  }
                }}
              />
              紫将
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={filters.qualities.includes('orange')}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleFilterChange({ qualities: [...filters.qualities, 'orange'] });
                  } else {
                    handleFilterChange({ qualities: filters.qualities.filter((q: string) => q !== 'orange') });
                  }
                }}
              />
              橙将
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={filters.qualities.includes('red')}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleFilterChange({ qualities: [...filters.qualities, 'red'] });
                  } else {
                    handleFilterChange({ qualities: filters.qualities.filter((q: string) => q !== 'red') });
                  }
                }}
              />
              红将
            </label>
          </div>
        </div>

        <div className="filter-section">
          <h3>搜索</h3>
          <input 
            type="text" 
            placeholder="搜索英雄名称..."
            value={filters.searchText}
            onChange={(e) => handleFilterChange({ searchText: e.target.value })}
            className="search-input"
          />
        </div>
      </div>

      {/* 排序栏 */}
      <div className="hero-sort">
        <button 
          className={`sort-btn ${sortOptions.field === 'power' ? 'active' : ''}`}
          onClick={() => handleSortChange('power')}
        >
          战斗力 {sortOptions.field === 'power' && (sortOptions.order === 'asc' ? '↑' : '↓')}
        </button>
        <button 
          className={`sort-btn ${sortOptions.field === 'level' ? 'active' : ''}`}
          onClick={() => handleSortChange('level')}
        >
          等级 {sortOptions.field === 'level' && (sortOptions.order === 'asc' ? '↑' : '↓')}
        </button>
        <button 
          className={`sort-btn ${sortOptions.field === 'quality' ? 'active' : ''}`}
          onClick={() => handleSortChange('quality')}
        >
          品质 {sortOptions.field === 'quality' && (sortOptions.order === 'asc' ? '↑' : '↓')}
        </button>
        <button 
          className={`sort-btn ${sortOptions.field === 'stars' ? 'active' : ''}`}
          onClick={() => handleSortChange('stars')}
        >
          星级 {sortOptions.field === 'stars' && (sortOptions.order === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* 英雄列表 */}
      <div className="hero-grid">
        {filteredHeroes.map(hero => (
          <div 
            key={hero.id}
            className={`hero-card ${selectedHero?.id === hero.id ? 'selected' : ''}`}
            onClick={() => handleHeroSelect(hero)}
          >
            <div className="hero-header">
              <div className="hero-avatar">
                <img src={hero.avatar} alt={hero.name} />
                {hero.isNFT && <div className="nft-badge">NFT</div>}
              </div>
              <div className="hero-info">
                <h3 className="hero-name">{hero.name}</h3>
                <div className="hero-meta">
                  <span 
                    className="hero-quality" 
                    style={{ color: getQualityColor(hero.quality) }}
                  >
                    {hero.quality === 'purple' ? '紫' : hero.quality === 'orange' ? '橙' : '红'}将
                  </span>
                  <span className="hero-faction">
                    {getFactionIcon(hero.faction)}
                  </span>
                  <span className="hero-stars">
                    {'⭐'.repeat(hero.stars)}
                  </span>
                </div>
              </div>
            </div>

            <div className="hero-stats">
              <div className="stat-row">
                <span className="stat-label">等级:</span>
                <span className="stat-value">{hero.level}/80</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">战斗力:</span>
                <span className="stat-value">{heroSystem.calculateHeroPower(hero)}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">统御:</span>
                <span className="stat-value">{hero.attributes.command}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">武力:</span>
                <span className="stat-value">{hero.attributes.strength}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">谋略:</span>
                <span className="stat-value">{hero.attributes.strategy}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">防御:</span>
                <span className="stat-value">{hero.attributes.defense}</span>
              </div>
            </div>

            <div className="hero-skills">
              <div className="skill">
                <img src={hero.activeSkill.icon} alt={hero.activeSkill.name} />
                <span>{hero.activeSkill.name}</span>
              </div>
              <div className="skill">
                <img src={hero.passiveSkill.icon} alt={hero.passiveSkill.name} />
                <span>{hero.passiveSkill.name}</span>
              </div>
            </div>

            {hero.bondActive && (
              <div className="hero-bond">羁绊激活</div>
            )}

            <div className="hero-actions">
              <button 
                className="action-btn upgrade"
                onClick={(e) => {
                  e.stopPropagation();
                  onHeroUpgrade?.(hero.id);
                }}
                disabled={hero.level >= 80}
              >
                升级
              </button>
              <button 
                className="action-btn evolve"
                onClick={(e) => {
                  e.stopPropagation();
                  onHeroEvolve?.(hero.id);
                }}
                disabled={
                  (hero.quality === 'purple' && hero.stars < 3) ||
                  (hero.quality === 'orange' && hero.stars < 4)
                }
              >
                进化
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredHeroes.length === 0 && (
        <div className="no-heroes">
          <p>没有找到符合条件的英雄</p>
        </div>
      )}
    </div>
  );
};

export default HeroList;