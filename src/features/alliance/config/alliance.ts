import { ALLIANCE_LEVEL_CONFIG } from '../types/Alliance';

export const getUpgradeCost = (currentLevel: number): number => {
  const config = ALLIANCE_LEVEL_CONFIG[currentLevel + 1];
  return config ? config.upgradeCost : 0;
};

export const getMaxMembers = (level: number): number => {
  return ALLIANCE_LEVEL_CONFIG[level]?.maxMembers || 10;
};

export const STORAGE_KEY = 'alliance_data';
