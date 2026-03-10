export enum AllianceRole {
  LEADER = 'leader',
  OFFICER = 'officer',
  MEMBER = 'member',
}

export enum AllianceRank {
  RANK_1 = 1,
  RANK_2 = 2,
  RANK_3 = 3,
  RANK_4 = 4,
  RANK_5 = 5,
  RANK_6 = 6,
  RANK_7 = 7,
  RANK_8 = 8,
}

export interface ResourceAmount {
  wood: number;
  stone: number;
  food: number;
  gold: number;
}

export interface Alliance {
  id: string;
  name: string;
  level: number;
  announcement: string;
  leaderId: string;
  memberCount: number;
  maxMembers: number;
  createdAt: number;
  adSpace: AdSpace | null;
  techLevel: Record<string, number>;
  requiredContribution: number;
}

export interface AllianceMember {
  id: string;
  address: string;
  name: string;
  role: AllianceRole;
  contribution: number;
  lastCheckIn: number;
  joinedAt: number;
  weeklyContribution: number;
  contributionHistory: number[];
}

export interface AllianceTech {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  currentLevel: number;
  costPerLevel: number;
  upgradeTime: number;
  effectType: 'resource' | 'training' | 'defense' | 'attack' | 'gathering';
  effectValue: number;
}

export interface AdSpace {
  allianceId: string;
  allianceName: string;
  message: string;
  expiresAt: number;
}

export interface AdBid {
  allianceId: string;
  allianceName: string;
  amount: number;
  timestamp: number;
  refunded: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  type: 'normal' | 'system' | 'announcement';
}

export interface TradeRequest {
  id: string;
  creatorId: string;
  creatorName: string;
  offerType: 'resource' | 'hero';
  offerAmount: number;
  offerResourceType?: 'wood' | 'stone' | 'food' | 'gold';
  requestType: 'resource' | 'hero';
  requestAmount: number;
  requestResourceType?: 'wood' | 'stone' | 'food' | 'gold';
  status: 'open' | 'accepted' | 'cancelled' | 'completed';
  createdAt: number;
  completedAt?: number;
}

export interface AllianceWar {
  id: string;
  attackerId: string;
  attackerName: string;
  defenderId: string;
  defenderName: string;
  startTime: number;
  endTime: number;
  attackerScore: number;
  defenderScore: number;
  status: 'preparing' | 'active' | 'finished';
  winnerId: string | null;
  attackerDeposit: number;
  defenderDeposit: number;
  reward: number;
}

export interface AllianceApplication {
  id: string;
  playerId: string;
  playerName: string;
  allianceId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
  processedAt?: number;
}

export interface AllianceState {
  currentAlliance: Alliance | null;
  playerAllianceId: string | null;
  playerRole: AllianceRole | null;
  members: AllianceMember[];
  chatMessages: ChatMessage[];
  tradeRequests: TradeRequest[];
  shopItems: ShopItem[];
  pendingBids: AdBid[];
  activeWar: AllianceWar | null;
  applications: AllianceApplication[];
  playerContribution: number;
  playerLastCheckIn: number;
  checkInStreak: number;
}

export interface ShopItem {
  id: string;
  nameKey: string;
  descriptionKey: string;
  type: 'hero' | 'resource' | 'speedup' | 'bundle';
  price: number;
  priceType: 'contribution' | 'token';
  weeklyLimit: number;
  soldThisWeek: number;
  imageUrl: string;
  discount?: number;
  items?: {
    type: string;
    id: string;
    amount: number;
  }[];
}

export const ALLIANCE_LEVEL_CONFIG: Record<number, { maxMembers: number; upgradeCost: number; unlockFeatures: string[] }> = {
  1: { maxMembers: 10, upgradeCost: 0, unlockFeatures: ['chat'] },
  2: { maxMembers: 15, upgradeCost: 50000, unlockFeatures: ['checkin', 'trade'] },
  3: { maxMembers: 20, upgradeCost: 150000, unlockFeatures: ['shop'] },
  4: { maxMembers: 30, upgradeCost: 400000, unlockFeatures: ['tech_lv1'] },
  5: { maxMembers: 50, upgradeCost: 1000000, unlockFeatures: ['war', 'tech_lv2'] },
  6: { maxMembers: 80, upgradeCost: 2500000, unlockFeatures: ['tech_lv2'] },
  7: { maxMembers: 100, upgradeCost: 5000000, unlockFeatures: ['tech_lv3'] },
  8: { maxMembers: 150, upgradeCost: 10000000, unlockFeatures: ['war_advanced', 'tech_lv3'] },
};

export const DEFAULT_TECH_LIST: Omit<AllianceTech, 'currentLevel'>[] = [
  {
    id: 'resource_boost',
    name: 'Resource Boost',
    description: 'Increases all resource production by 5% per level',
    maxLevel: 5,
    costPerLevel: 500,
    upgradeTime: 3600,
    effectType: 'resource',
    effectValue: 5,
  },
  {
    id: 'training_speed',
    name: 'Training Speed',
    description: 'Increases troop training speed by 8% per level',
    maxLevel: 5,
    costPerLevel: 800,
    upgradeTime: 7200,
    effectType: 'training',
    effectValue: 8,
  },
  {
    id: 'defense_boost',
    name: 'Defense Boost',
    description: 'Increases city defense by 10% per level',
    maxLevel: 5,
    costPerLevel: 1000,
    upgradeTime: 10800,
    effectType: 'defense',
    effectValue: 10,
  },
  {
    id: 'attack_boost',
    name: 'Attack Boost',
    description: 'Increases field battle damage by 8% per level',
    maxLevel: 5,
    costPerLevel: 1000,
    upgradeTime: 10800,
    effectType: 'attack',
    effectValue: 8,
  },
  {
    id: 'gathering_boost',
    name: 'Gathering Boost',
    description: 'Increases gathering speed by 15% per level',
    maxLevel: 3,
    costPerLevel: 1500,
    upgradeTime: 21600,
    effectType: 'gathering',
    effectValue: 15,
  },
];

export const DEFAULT_SHOP_ITEMS: Omit<ShopItem, 'soldThisWeek'>[] = [
  {
    id: 'hero_purple',
    nameKey: 'shop.hero_purple',
    descriptionKey: 'shop.hero_purple.desc',
    type: 'hero',
    price: 500,
    priceType: 'contribution',
    weeklyLimit: 20,
    imageUrl: '',
    items: [{ type: 'hero', id: 'purple', amount: 100 }],
  },
  {
    id: 'hero_orange',
    nameKey: 'shop.hero_orange',
    descriptionKey: 'shop.hero_orange.desc',
    type: 'hero',
    price: 2000,
    priceType: 'contribution',
    weeklyLimit: 5,
    imageUrl: '',
    items: [{ type: 'hero', id: 'orange', amount: 100 }],
  },
  {
    id: 'resource_wood',
    nameKey: 'shop.resource_wood',
    descriptionKey: 'shop.resource_wood.desc',
    type: 'resource',
    price: 100,
    priceType: 'contribution',
    weeklyLimit: 100,
    imageUrl: '',
    items: [{ type: 'resource', id: 'wood', amount: 10000 }],
  },
  {
    id: 'resource_stone',
    nameKey: 'shop.resource_stone',
    descriptionKey: 'shop.resource_stone.desc',
    type: 'resource',
    price: 100,
    priceType: 'contribution',
    weeklyLimit: 100,
    imageUrl: '',
    items: [{ type: 'resource', id: 'stone', amount: 10000 }],
  },
  {
    id: 'resource_food',
    nameKey: 'shop.resource_food',
    descriptionKey: 'shop.resource_food.desc',
    type: 'resource',
    price: 100,
    priceType: 'contribution',
    weeklyLimit: 100,
    imageUrl: '',
    items: [{ type: 'resource', id: 'food', amount: 10000 }],
  },
  {
    id: 'resource_gold',
    nameKey: 'shop.resource_gold',
    descriptionKey: 'shop.resource_gold.desc',
    type: 'resource',
    price: 200,
    priceType: 'contribution',
    weeklyLimit: 50,
    imageUrl: '',
    items: [{ type: 'resource', id: 'gold', amount: 1000 }],
  },
  {
    id: 'speedup_1h',
    nameKey: 'shop.speedup_1h',
    descriptionKey: 'shop.speedup_1h.desc',
    type: 'speedup',
    price: 300,
    priceType: 'contribution',
    weeklyLimit: 30,
    imageUrl: '',
    items: [{ type: 'speedup', id: '1h', amount: 1 }],
  },
  {
    id: 'speedup_24h',
    nameKey: 'shop.speedup_24h',
    descriptionKey: 'shop.speedup_24h.desc',
    type: 'speedup',
    price: 5000,
    priceType: 'contribution',
    weeklyLimit: 5,
    imageUrl: '',
    items: [{ type: 'speedup', id: '24h', amount: 1 }],
  },
];

export const CREATE_ALLIANCE_COST = 10000;
export const CHECK_IN_REWARD = 50;
export const LEAVE_PENALTY_RATE = 0.5;
export const WAR_DECLARE_REQUIRED_LEVEL = 5;
export const WAR_DECLARE_DEPOSIT = 50000;
export const WAR_DURATION = 24 * 60 * 60 * 1000;
