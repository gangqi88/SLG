export type MatchStatus = 'searching' | 'matched' | 'battle' | 'completed' | 'cancelled';
export type BattleMode = 'pvp' | 'pve' | 'siege' | 'tournament';
export type PlayerStatus = 'online' | 'offline' | 'in_battle' | 'in_matchmaking';

export interface Player {
  id: string;
  name: string;
  level: number;
  power: number;
  faction: string;
  avatar?: string;
  status: PlayerStatus;
  rank: number;
  rating: number;
  winCount: number;
  loseCount: number;
  lastActiveTime: number;
}

export interface MatchRequest {
  id: string;
  playerId: string;
  mode: BattleMode;
  requestedAt: number;
  status: MatchStatus;
  preferredFactions?: string[];
}

export interface Match {
  id: string;
  mode: BattleMode;
  status: MatchStatus;
  teams: MatchTeam[];
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  duration?: number;
  winnerTeamId?: string;
}

export interface MatchTeam {
  teamId: string;
  players: string[];
  faction: string;
  power: number;
  averageRating: number;
}

export interface PVPRating {
  playerId: string;
  rating: number;
  rank: number;
  tier: RankTier;
  stars: number;
  winStreak: number;
  maxWinStreak: number;
  seasonWins: number;
  seasonLosses: number;
}

export type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'king' | 'legend';

export const RANK_TIERS: Record<RankTier, { name: string; minRating: number; maxRating: number; color: string }> = {
  bronze: { name: '青铜', minRating: 0, maxRating: 999, color: '#cd7f32' },
  silver: { name: '白银', minRating: 1000, maxRating: 1999, color: '#c0c0c0' },
  gold: { name: '黄金', minRating: 2000, maxRating: 2999, color: '#ffd700' },
  platinum: { name: '铂金', minRating: 3000, maxRating: 3999, color: '#e5e4e2' },
  diamond: { name: '钻石', minRating: 4000, maxRating: 4999, color: '#b9f2ff' },
  master: { name: '大师', minRating: 5000, maxRating: 5999, color: '#9b59b6' },
  king: { name: '王者', minRating: 6000, maxRating: 6999, color: '#e74c3c' },
  legend: { name: '传奇', minRating: 7000, maxRating: 99999, color: '#f39c12' },
};

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  faction: string;
  power: number;
  rating: number;
  tier: RankTier;
  winRate: number;
  wins: number;
}

export interface Season {
  id: string;
  number: number;
  name: string;
  startTime: number;
  endTime: number;
  status: 'upcoming' | 'active' | 'completed';
  rewards: SeasonReward[];
}

export interface SeasonReward {
  tier: RankTier;
  rankMin: number;
  rankMax: number;
  rewards: {
    gold?: number;
    diamonds?: number;
    items?: string[];
  };
}

export const SEASON_DURATION = 30 * 24 * 60 * 60 * 1000;

export interface Alliance {
  id: string;
  name: string;
  tag: string;
  leaderId: string;
  members: AllianceMember[];
  level: number;
  exp: number;
  notice: string;
  faction: string;
  createdAt: number;
  totalPower: number;
  memberLimit: number;
}

export interface AllianceMember {
  playerId: string;
  playerName: string;
  role: AllianceRole;
  contribution: number;
  weeklyContribution: number;
  joinTime: number;
  lastActiveTime: number;
}

export type AllianceRole = 'leader' | 'vice_leader' | 'elder' | 'member';

export interface AllianceApplication {
  id: string;
  playerId: string;
  playerName: string;
  power: number;
  message?: string;
  appliedAt: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface AllianceBuilding {
  type: AllianceBuildingType;
  level: number;
  maxLevel: number;
  upgradeCost: { gold: number; materials: Record<string, number> };
}

export type AllianceBuildingType = 
  | 'headquarters'
  | 'warehouse'
  | 'training_hall'
  | 'market'
  | 'workshop'
  | 'embassy';

export const ALLIANCE_CONSTANTS = {
  MAX_MEMBERS: 50,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 12,
  MIN_TAG_LENGTH: 2,
  MAX_TAG_LENGTH: 5,
  
  ROLES: {
    leader: { name: '盟主', permissions: ['all'] },
    vice_leader: { name: '副盟主', permissions: ['kick', 'approve', 'edit_notice'] },
    elder: { name: '长老', permissions: ['approve'] },
    member: { name: '成员', permissions: [] },
  },
  
  BUILDING_INFO: {
    headquarters: { name: '联盟总部', maxLevel: 10 },
    warehouse: { name: '联盟仓库', maxLevel: 10 },
    training_hall: { name: '训练馆', maxLevel: 10 },
    market: { name: '联盟市场', maxLevel: 10 },
    workshop: { name: '工坊', maxLevel: 10 },
    embassy: { name: '大使馆', maxLevel: 5 },
  },
};
