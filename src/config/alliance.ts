import { 
  ALLIANCE_LEVEL_CONFIG, 
  DEFAULT_TECH_LIST, 
  DEFAULT_SHOP_ITEMS,
  CREATE_ALLIANCE_COST,
  CHECK_IN_REWARD,
  LEAVE_PENALTY_RATE,
  WAR_DECLARE_REQUIRED_LEVEL,
  WAR_DECLARE_DEPOSIT,
  WAR_DURATION 
} from '../types/Alliance';

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

export const allianceConfig: AllianceConfig = {
  createAllianceCost: CREATE_ALLIANCE_COST,
  checkInReward: CHECK_IN_REWARD,
  leavePenaltyRate: LEAVE_PENALTY_RATE,
  warDeclareRequiredLevel: WAR_DECLARE_REQUIRED_LEVEL,
  warDeclareDeposit: WAR_DECLARE_DEPOSIT,
  warDuration: WAR_DURATION,
  maxChatMessages: 100,
  maxTradeRequests: 50,
  techList: DEFAULT_TECH_LIST,
  shopItems: DEFAULT_SHOP_ITEMS,
};

export const getAllianceLevelConfig = (level: number) => {
  return ALLIANCE_LEVEL_CONFIG[level] || null;
};

export const getUpgradeCost = (currentLevel: number): number => {
  const config = ALLIANCE_LEVEL_CONFIG[currentLevel + 1];
  return config ? config.upgradeCost : 0;
};

export const getMaxMembers = (level: number): number => {
  return ALLIANCE_LEVEL_CONFIG[level]?.maxMembers || 10;
};

export const getTechEffect = (techId: string, level: number): number => {
  const tech = DEFAULT_TECH_LIST.find(t => t.id === techId);
  if (!tech) return 0;
  return tech.effectValue * level;
};

export const getTechUpgradeCost = (techId: string, currentLevel: number): number => {
  const tech = DEFAULT_TECH_LIST.find(t => t.id === techId);
  if (!tech || currentLevel >= tech.maxLevel) return 0;
  return tech.costPerLevel;
};

export const getTechUpgradeTime = (techId: string): number => {
  const tech = DEFAULT_TECH_LIST.find(t => t.id === techId);
  return tech?.upgradeTime || 0;
};

export const getAllTechList = () => {
  return DEFAULT_TECH_LIST;
};

export const getAllShopItems = () => {
  return DEFAULT_SHOP_ITEMS;
};

export const getShopItem = (itemId: string) => {
  return DEFAULT_SHOP_ITEMS.find(item => item.id === itemId);
};

export const STORAGE_KEY = 'alliance_data';

export const CHAT_EVENT = 'alliance:chat';
export const CONTRIBUTION_EVENT = 'alliance:contribution';
export const WAR_EVENT = 'alliance:war';
export const SHOP_EVENT = 'alliance:shop';
export const TECH_EVENT = 'alliance:tech';
