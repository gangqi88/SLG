import React, { useState } from 'react';
import { Team, Hero, FactionType } from '../../../types/slg/hero.types';
import { RecommendedFormation } from '../../../systems/TeamSystem';
import './TeamPanel.css';

interface TeamPanelProps {
  teams: Team[];
  heroes: Hero[];
  selectedTeamId: string;
  recommendedFormations: RecommendedFormation[];
  onSelectTeam: (teamId: string) => void;
  onAddHero: (teamId: string, heroId: string, position: 'main' | 'sub1' | 'sub2') => void;
  onRemoveHero: (teamId: string, heroId: string) => void;
  onCreateTeam?: (name: string, faction: FactionType) => void;
  onClose?: () => void;
}

export const TeamPanel: React.FC<TeamPanelProps> = ({
  teams,
  heroes,
  selectedTeamId,
  recommendedFormations,
  onSelectTeam,
  onAddHero,
  onRemoveHero,
  onCreateTeam: _onCreateTeam,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'heroes' | 'formations'>('teams');
  const [showAddHero, setShowAddHero] = useState(false);

  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const availableHeroes = heroes.filter(h => !teams.some(t => t.members.some(m => m.heroId === h.id)));

  const getQualityColor = (quality: string): string => {
    switch (quality) {
      case 'purple': return '#9b59b6';
      case 'orange': return '#e67e22';
      case 'red': return '#e74c3c';
      default: return '#95a5a6';
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

  const getTeamHero = (_team: Team, heroId: string): Hero | undefined => {
    return heroes.find(h => h.id === heroId);
  };

  const handleAddHero = (heroId: string, position: 'main' | 'sub1' | 'sub2') => {
    if (selectedTeamId) {
      onAddHero(selectedTeamId, heroId, position);
      setShowAddHero(false);
    }
  };

  return (
    <div className="team-panel-overlay" onClick={onClose}>
      <div className="team-panel" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="team-header">
          <h2>队伍配置</h2>
        </div>

        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            队伍
          </button>
          <button 
            className={`tab-btn ${activeTab === 'heroes' ? 'active' : ''}`}
            onClick={() => setActiveTab('heroes')}
          >
            待选英雄
          </button>
          <button 
            className={`tab-btn ${activeTab === 'formations' ? 'active' : ''}`}
            onClick={() => setActiveTab('formations')}
          >
            阵容推荐
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'teams' && (
            <div className="teams-tab">
              <div className="team-list">
                {teams.map(team => (
                  <div 
                    key={team.id}
                    className={`team-card ${selectedTeamId === team.id ? 'selected' : ''}`}
                    onClick={() => onSelectTeam(team.id)}
                  >
                    <div className="team-info">
                      <h3>{team.name}</h3>
                      <span className="team-faction">{getFactionName(team.faction)}</span>
                    </div>
                    <div className="team-power">
                      <span className="power-label">战力</span>
                      <span className="power-value">{team.power}</span>
                    </div>
                    <div className="team-members">
                      {[0, 1, 2].map(idx => {
                        const member = team.members[idx];
                        const hero = member ? getTeamHero(team, member.heroId) : null;
                        return (
                          <div 
                            key={idx} 
                            className={`member-slot ${member ? 'filled' : 'empty'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (member) onRemoveHero(team.id, member.heroId);
                            }}
                          >
                            {hero ? (
                              <>
                                <img src={hero.avatar} alt={hero.name} />
                                <span 
                                  className="position-badge"
                                  style={{ backgroundColor: idx === 0 ? '#e74c3c' : '#3498db' }}
                                >
                                  {idx === 0 ? '主' : '副'}
                                </span>
                              </>
                            ) : (
                              <span className="slot-placeholder">{idx === 0 ? '主将' : '副将'}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {selectedTeam && selectedTeam.members.length < 3 && (
                <button 
                  className="add-hero-btn"
                  onClick={() => setShowAddHero(true)}
                >
                  + 添加英雄
                </button>
              )}

              {showAddHero && (
                <div className="add-hero-modal">
                  <h4>选择英雄</h4>
                  <div className="hero-selection-grid">
                    {availableHeroes.map(hero => (
                      <div 
                        key={hero.id}
                        className="selectable-hero"
                        onClick={() => handleAddHero(hero.id, (selectedTeam?.members.length ?? 0) === 0 ? 'main' : 'sub1')}
                      >
                        <img src={hero.avatar} alt={hero.name} />
                        <span className="hero-name">{hero.name}</span>
                        <span 
                          className="hero-quality"
                          style={{ color: getQualityColor(hero.quality) }}
                        >
                          {hero.quality === 'purple' ? '紫' : hero.quality === 'orange' ? '橙' : '红'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="cancel-btn" onClick={() => setShowAddHero(false)}>
                    取消
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'heroes' && (
            <div className="heroes-tab">
              <h3>可用英雄</h3>
              <div className="available-heroes-grid">
                {availableHeroes.map(hero => (
                  <div key={hero.id} className="available-hero-card">
                    <img src={hero.avatar} alt={hero.name} />
                    <div className="hero-info">
                      <h4>{hero.name}</h4>
                      <span className="hero-quality" style={{ color: getQualityColor(hero.quality) }}>
                        {getQualityName(hero.quality)}
                      </span>
                      <span className="hero-faction">{getFactionName(hero.faction)}</span>
                    </div>
                  </div>
                ))}
                {availableHeroes.length === 0 && (
                  <p className="no-heroes">所有英雄已在队伍中</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'formations' && (
            <div className="formations-tab">
              <h3>推荐阵容</h3>
              <div className="formations-list">
                {recommendedFormations.map(formation => (
                  <div key={formation.name} className="formation-card">
                    <div className="formation-header">
                      <h4>{formation.name}</h4>
                      <p className="formation-desc">{formation.description}</p>
                    </div>
                    
                    <div className="formation-bonuses">
                      {formation.bonuses.map((bonus, idx) => (
                        <span key={idx} className="bonus-tag">
                          {bonus.description}
                        </span>
                      ))}
                    </div>

                    <div className="formation-heroes">
                      <div className="main-hero">
                        <span className="label">主将</span>
                        <span className="hero-name">{formation.mainHero}</span>
                      </div>
                      <div className="sub-heroes">
                        <span className="label">副将</span>
                        <div className="sub-list">
                          {formation.subHeroes.map((heroId, idx) => (
                            <span key={idx}>{heroId}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="formation-strengths">
                      <span className="strength">优势: {formation.strengths.join('、')}</span>
                      <span className="weakness">劣势: {formation.weaknesses.join('、')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function getQualityName(quality: string): string {
  switch (quality) {
    case 'purple': return '紫将';
    case 'orange': return '橙将';
    case 'red': return '红将';
    default: return '未知';
  }
}

export default TeamPanel;
