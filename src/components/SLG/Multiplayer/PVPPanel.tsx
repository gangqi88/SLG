import React, { useState } from 'react';
import { matchSystem } from '../../../systems/MatchSystem';
import { RANK_TIERS, RankTier, LeaderboardEntry } from '../../../types/slg/multiplayer.types';
import './PVPPanel.css';

interface PVPPanelProps {
  playerId: string;
  onClose?: () => void;
}

export const PVPPanel: React.FC<PVPPanelProps> = ({ playerId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'match' | 'leaderboard'>('match');
  const [matchMode, setMatchMode] = useState<'pvp' | 'pve' | 'siege'>('pvp');
  const [isSearching, setIsSearching] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const rating = matchSystem.getRating(playerId);
  const playerRank = matchSystem.getPlayerRank(playerId);

  const getTierColor = (tier: RankTier): string => {
    return RANK_TIERS[tier]?.color || '#888';
  };

  const handleStartMatch = () => {
    setIsSearching(true);
    const request = matchSystem.createMatchRequest(playerId, matchMode);
    
    setTimeout(() => {
      setIsSearching(false);
      if (request) {
        alert('匹配成功！即将开始战斗');
      }
    }, 2000);
  };

  const handleCancelMatch = () => {
    matchSystem.cancelMatchRequest(playerId);
    setIsSearching(false);
  };

  const handleViewLeaderboard = () => {
    const entries = matchSystem.getLeaderboard(1, 50);
    setLeaderboard(entries);
  };

  const renderMatchTab = () => (
    <div className="match-tab">
      <div className="player-rank-card">
        <div className="rank-badge" style={{ backgroundColor: getTierColor(rating?.tier || 'bronze') }}>
          <span className="tier-name">{RANK_TIERS[rating?.tier || 'bronze']?.name}</span>
          <span className="tier-rating">{rating?.rating || 1000}</span>
        </div>
        <div className="rank-info">
          <div className="rank-stat">
            <span className="stat-label">排名</span>
            <span className="stat-value">#{playerRank || '-'}</span>
          </div>
          <div className="rank-stat">
            <span className="stat-label">连胜</span>
            <span className="stat-value">{rating?.winStreak || 0}</span>
          </div>
          <div className="rank-stat">
            <span className="stat-label">胜率</span>
            <span className="stat-value">
              {rating?.seasonWins && rating?.seasonLosses 
                ? Math.round((rating.seasonWins / (rating.seasonWins + rating.seasonLosses)) * 100) 
                : 0}%
            </span>
          </div>
        </div>
      </div>

      <div className="mode-selection">
        <h3>选择战斗模式</h3>
        <div className="mode-buttons">
          <button 
            className={`mode-btn ${matchMode === 'pvp' ? 'active' : ''}`}
            onClick={() => setMatchMode('pvp')}
          >
            <span className="mode-icon">⚔️</span>
            <span className="mode-name">PVP</span>
            <span className="mode-desc">玩家对战</span>
          </button>
          <button 
            className={`mode-btn ${matchMode === 'pve' ? 'active' : ''}`}
            onClick={() => setMatchMode('pve')}
          >
            <span className="mode-icon">🤖</span>
            <span className="mode-name">PVE</span>
            <span className="mode-desc">人机对战</span>
          </button>
          <button 
            className={`mode-btn ${matchMode === 'siege' ? 'active' : ''}`}
            onClick={() => setMatchMode('siege')}
          >
            <span className="mode-icon">🏰</span>
            <span className="mode-name">攻城</span>
            <span className="mode-desc">联盟攻城战</span>
          </button>
        </div>
      </div>

      <div className="match-actions">
        {isSearching ? (
          <button className="match-btn cancel" onClick={handleCancelMatch}>
            取消匹配
          </button>
        ) : (
          <button className="match-btn start" onClick={handleStartMatch}>
            开始匹配
          </button>
        )}
      </div>

      {isSearching && (
        <div className="searching-animation">
          <div className="searching-spinner"></div>
          <p>正在匹配对手...</p>
        </div>
      )}
    </div>
  );

  const renderLeaderboardTab = () => (
    <div className="leaderboard-tab">
      <div className="leaderboard-header">
        <h3>排行榜</h3>
        <button className="refresh-btn" onClick={handleViewLeaderboard}>
          刷新
        </button>
      </div>
      
      <div className="leaderboard-list">
        {leaderboard.length === 0 ? (
          <p className="no-data">暂无数据</p>
        ) : (
          leaderboard.map((entry: LeaderboardEntry) => (
            <div 
              key={entry.playerId} 
              className={`leaderboard-row ${entry.playerId === playerId ? 'current-player' : ''}`}
            >
              <div className="rank-cell">
                {entry.rank <= 3 ? (
                  <span className="top-rank medal">{entry.rank}</span>
                ) : (
                  <span className="rank-num">#{entry.rank}</span>
                )}
              </div>
              <div className="player-cell">
                <span className="player-name">{entry.playerName}</span>
                <span 
                  className="player-tier"
                  style={{ color: getTierColor(entry.tier) }}
                >
                  {RANK_TIERS[entry.tier]?.name}
                </span>
              </div>
              <div className="stats-cell">
                <span className="rating">{entry.rating}</span>
                <span className="win-rate">{entry.winRate}%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="pvp-panel-overlay" onClick={onClose}>
      <div className="pvp-panel" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="pvp-header">
          <h2>多人对战</h2>
        </div>

        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'match' ? 'active' : ''}`}
            onClick={() => setActiveTab('match')}
          >
            匹配对战
          </button>
          <button 
            className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('leaderboard');
              handleViewLeaderboard();
            }}
          >
            排行榜
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'match' && renderMatchTab()}
          {activeTab === 'leaderboard' && renderLeaderboardTab()}
        </div>
      </div>
    </div>
  );
};

export default PVPPanel;
