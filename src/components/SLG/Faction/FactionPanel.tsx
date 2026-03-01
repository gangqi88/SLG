import React, { useState } from 'react';
import { FactionType } from '../../../types/slg/hero.types';
import { factionSystem } from '../../../systems/FactionSystem';
import './FactionPanel.css';

interface FactionPanelProps {
  onSelectFaction?: (faction: FactionType) => void;
  selectedFaction?: FactionType;
  onClose?: () => void;
  mode?: 'select' | 'view';
}

export const FactionPanel: React.FC<FactionPanelProps> = ({
  onSelectFaction,
  selectedFaction,
  onClose,
  mode = 'view'
}) => {
  const [hoveredFaction, setHoveredFaction] = useState<FactionType | null>(null);

  const factions: FactionType[] = ['human', 'angel', 'demon'];

  const getFactionName = (faction: FactionType): string => {
    switch (faction) {
      case 'human': return '人族';
      case 'angel': return '天使';
      case 'demon': return '恶魔';
      default: return '未知';
    }
  };

  const getFactionDescription = (faction: FactionType): string => {
    switch (faction) {
      case 'human': return '均衡的战士，拥有强大的纪律和策略能力';
      case 'angel': return '神圣的存在，拥有强大的魔法能力';
      case 'demon': return '凶猛的战士，拥有压倒性的物理力量';
      default: return '';
    }
  };

  const getFactionIcon = (faction: FactionType): string => {
    switch (faction) {
      case 'human': return '⚔️';
      case 'angel': return '✨';
      case 'demon': return '🔥';
      default: return '❓';
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

  const getCounterRelation = (faction: FactionType): { counteredBy: FactionType; counters: FactionType } => {
    return {
      counteredBy: factionSystem.getCounteredBy(faction),
      counters: factionSystem.getCounters(faction)
    };
  };

  const handleFactionClick = (faction: FactionType) => {
    if (mode === 'select' && onSelectFaction) {
      onSelectFaction(faction);
    }
  };

  const renderFactionCard = (faction: FactionType) => {
    const info = factionSystem.getFactionInfo(faction);
    const relation = getCounterRelation(faction);
    const isSelected = selectedFaction === faction;
    const isHovered = hoveredFaction === faction;

    return (
      <div
        key={faction}
        className={`faction-card ${getFactionClass(faction)} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
        onClick={() => handleFactionClick(faction)}
        onMouseEnter={() => setHoveredFaction(faction)}
        onMouseLeave={() => setHoveredFaction(null)}
      >
        <div className="faction-icon">
          <span className="faction-emoji">{getFactionIcon(faction)}</span>
        </div>
        
        <h3 className="faction-name">{getFactionName(faction)}</h3>
        <p className="faction-desc">{getFactionDescription(faction)}</p>

        <div className="faction-attributes">
          <div className="attr-row">
            <span className="attr-label">主属性:</span>
            <span className="attr-value">{info.attributes.primary}</span>
            <span className="attr-bonus">+{info.attributes.bonus * 100}%</span>
          </div>
          <div className="attr-row">
            <span className="attr-label">副属性:</span>
            <span className="attr-value">{info.attributes.secondary}</span>
          </div>
        </div>

        <div className="faction-relations">
          <div className="relation-row advantage">
            <span className="relation-label">克制:</span>
            <span className="relation-faction">{getFactionIcon(relation.counters)} {getFactionName(relation.counters)}</span>
          </div>
          <div className="relation-row disadvantage">
            <span className="relation-label">被克:</span>
            <span className="relation-faction">{getFactionIcon(relation.counteredBy)} {getFactionName(relation.counteredBy)}</span>
          </div>
        </div>

        <div className="faction-strengths">
          <h4>优势</h4>
          <ul>
            {info.strengths.map((strength, idx) => (
              <li key={idx}>{strength}</li>
            ))}
          </ul>
        </div>

        <div className="faction-weaknesses">
          <h4>劣势</h4>
          <ul>
            {info.weaknesses.map((weakness, idx) => (
              <li key={idx}>{weakness}</li>
            ))}
          </ul>
        </div>

        <div className="faction-roles">
          <h4>推荐定位</h4>
          <div className="role-tags">
            {info.recommendedRoles.map((role, idx) => (
              <span key={idx} className="role-tag">{role}</span>
            ))}
          </div>
        </div>

        {mode === 'select' && (
          <button className={`select-btn ${isSelected ? 'selected' : ''}`}>
            {isSelected ? '已选择' : '选择'}
          </button>
        )}
      </div>
    );
  };

  const renderCounterChart = () => (
    <div className="counter-chart">
      <h3>阵营克制关系</h3>
      <div className="counter-flow">
        <div className="counter-item demon">
          <span className="counter-icon">🔥</span>
          <span className="counter-name">恶魔</span>
          <span className="counter-bonus">+25%</span>
          <span className="counter-arrow">→</span>
          <span className="counter-target">人族</span>
        </div>
        <div className="counter-item human">
          <span className="counter-icon">⚔️</span>
          <span className="counter-name">人族</span>
          <span className="counter-bonus">+20%</span>
          <span className="counter-arrow">→</span>
          <span className="counter-target">天使</span>
        </div>
        <div className="counter-item angel">
          <span className="counter-icon">✨</span>
          <span className="counter-name">天使</span>
          <span className="counter-bonus">+30%</span>
          <span className="counter-arrow">→</span>
          <span className="counter-target">恶魔</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="faction-panel-overlay" onClick={onClose}>
      <div className="faction-panel" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="faction-header">
          <h2>阵营选择</h2>
          <p>选择你的阵营，了解阵营特性和克制关系</p>
        </div>

        <div className="faction-cards-container">
          {factions.map(renderFactionCard)}
        </div>

        {renderCounterChart()}

        {mode === 'select' && selectedFaction && (
          <div className="faction-confirm">
            <p>已选择阵营: <strong>{getFactionName(selectedFaction)}</strong></p>
            <button 
              className="confirm-btn"
              onClick={() => onSelectFaction?.(selectedFaction)}
            >
              确认选择
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactionPanel;
