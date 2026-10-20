import { ALLIANCE_LEVEL_CONFIG, DEFAULT_TECH_LIST, DEFAULT_SHOP_ITEMS } from '../types/Alliance';

export interface AllianceConfig {
  createAllianceCost: number;
  checkInReward: number;
  leavePenaltyRate: number;
  warDeclareRequiredLevel: number;
  warDeclareDeposit: number;
  warDuration: number;
  maxChatMessages: number;
  maxTradeRequests: number;
  techList: typeof DEFAULT_TECH_LIST;
  shopItems: typeof DEFAULT_SHOP_ITEMS;
}

export const getUpgradeCost = (currentLevel: number): number => {
  const config = ALLIANCE_LEVEL_CONFIG[currentLevel + 1];
  return config ? config.upgradeCost : 0;
};

export const getMaxMembers = (level: number): number => {
  return ALLIANCE_LEVEL_CONFIG[level]?.maxMembers || 10;
};

export const STORAGE_KEY = 'alliance_data';
