// 装备NFT系统类型定义

import type { HeroAttributes, NFTRarity, EquipmentType } from './hero.types';

// ============================================
// 装备基础类型
// ============================================

// 装备稀有度 (对应游戏品质)
export type EquipmentQuality = 'common' | 'rare' | 'epic' | 'legendary';

// 装备子类型
export type WeaponType = 'sword' | 'spear' | 'bow' | 'staff' | 'fan';
export type ArmorType = 'helmet' | 'chest' | 'gloves' | 'boots';
export type AccessoryType = 'ring' | 'necklace' | 'badge' | 'amulet';
export type MountType = 'horse' | 'beast' | 'vehicle';

// 装备稀有度对应
export const EQUIPMENT_QUALITY_RARITY: Record<EquipmentQuality, NFTRarity> = {
  common: 'common',
  rare: 'rare',
  epic: 'epic',
  legendary: 'legendary',
};

// ============================================
// 符文类型
// ============================================

export interface RuneAttributes {
  attack?: number;
  defense?: number;
  health?: number;
  crit?: number;
  dodge?: number;
  speed?: number;
}

// 符文NFT
export interface RuneNFT {
  id: string;
  templateId: number;
  owner: string;
  
  // 符文属性
  type: keyof RuneAttributes;
  level: number;           // 1-10
  bonus: number;          // 效果数值
  
  // 套装
  setBonus?: {
    setId: number;
    count: number;
    effect: string;
  };
  
  // 来源
  source: 'drop' | 'craft' | 'event';
  
  // 历史
  transferCount: number;
  createdAt: number;
}

// ============================================
// 器灵类型 (武器特有)
// ============================================

export interface Spirit {
  name: string;
  level: number;
  bonus: number;
  bonusType: keyof RuneAttributes;
}

// ============================================
// 装备NFT接口
// ============================================

export interface EquipmentNFT {
  id: string;
  templateId: number;
  owner: string;
  
  // 基础信息
  type: EquipmentType;
  subType: WeaponType | ArmorType | AccessoryType | MountType;
  quality: EquipmentQuality;
  rarity: NFTRarity;
  
  // 强化
  level: number;                    // 强化等级 0-15
  enhancementBonus: number;         // 强化加成
  
  // 属性
  baseAttributes: HeroAttributes;
  enhancedAttributes: HeroAttributes;
  
  // 符文槽 (3个)
  runeSlots: [string | null, string | null, string | null];  // RuneNFT ID
  
  // 器灵 (武器特有)
  spirit?: Spirit;
  
  // 外观
  appearance?: string;              // 时装NFT ID
  
  // 耐久度 (战斗损耗)
  durability: number;
  maxDurability: number;
  
  // 历史
  transferCount: number;
  previousOwners: string[];
  createdAt: number;
  lastEnhanced?: number;
}

// ============================================
// 装备模板 (静态配置)
// ============================================

export interface EquipmentTemplate {
  id: number;
  name: string;
  type: EquipmentType;
  subType: string;
  quality: EquipmentQuality;
  
  // 基础属性
  baseAttributes: HeroAttributes;
  
  // 特殊效果
  specialEffect?: {
    name: string;
    description: string;
    trigger: string;
  };
  
  // 套装ID
  setId?: number;
  
  // 图标
  icon: string;
  model?: string;
}

// ============================================
// 套装效果
// ============================================

export interface SetBonus {
  id: number;
  name: string;
  equipmentTypes: EquipmentType[];
  
  // 2件套
  twoPiece: {
    attribute: keyof HeroAttributes;
    bonus: number;
  };
  
  // 4件套
  fourPiece?: {
    attribute: keyof HeroAttributes;
    bonus: number;
    specialEffect?: string;
  };
}

// ============================================
// 装备操作
// ============================================

export interface EquipmentEnhanceRequest {
  equipmentId: string;
  materials?: string[];  // 材料NFT ID
}

export interface EquipmentEnhanceResult {
  success: boolean;
  newLevel?: number;
  bonus?: number;
  broken?: boolean;     // 强化失败破碎
  error?: string;
}

export interface EquipmentRepairRequest {
  equipmentId: string;
  cost: number;
}

export interface EquipmentRepairResult {
  success: boolean;
  newDurability?: number;
  cost?: number;
}

export interface EquipRuneRequest {
  equipmentId: string;
  runeId: string;
  slot: 0 | 1 | 2;
}

export interface UnequipRuneRequest {
  equipmentId: string;
  slot: 0 | 1 | 2;
}

// ============================================
// 常量
// ============================================

export const EQUIPMENT_CONSTANTS = {
  MAX_ENHANCE_LEVEL: 15,
  
  ENHANCE_SUCCESS_RATES: {
    0: 1.00, 1: 0.95, 2: 0.90, 3: 0.85, 4: 0.80,
    5: 0.75, 6: 0.70, 7: 0.65, 8: 0.60, 9: 0.55,
    10: 0.50, 11: 0.45, 12: 0.40, 13: 0.35, 14: 0.30, 15: 0.25,
  },
  
  RUNE_SLOTS: 3,
  
  DURABILITY_LOSS_PER_BATTLE: 10,
  
  REPAIR_COST_PER_DURABILITY: 1,
  
  WEAPON_TYPES: ['sword', 'spear', 'bow', 'staff', 'fan'] as const,
  ARMOR_TYPES: ['helmet', 'chest', 'gloves', 'boots'] as const,
  ACCESSORY_TYPES: ['ring', 'necklace', 'badge', 'amulet'] as const,
  
  QUALITY_COLORS: {
    common: '#9ca3af',
    rare: '#22c55e',
    epic: '#a855f7',
    legendary: '#f59e0b',
  },
} as const;

// ============================================
// 辅助函数
// ============================================

export function calculateEquipmentPower(equipment: EquipmentNFT): number {
  const attrSum = 
    equipment.enhancedAttributes.command +
    equipment.enhancedAttributes.strength +
    equipment.enhancedAttributes.strategy +
    equipment.enhancedAttributes.defense;
  
  const levelBonus = 1 + equipment.level * 0.1;
  const qualityBonus = {
    common: 1,
    rare: 1.2,
    epic: 1.5,
    legendary: 2,
  }[equipment.quality];
  
  return Math.floor(attrSum * levelBonus * qualityBonus);
}

export function calculateEnhanceCost(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level));
}

export function calculateRepairCost(durabilityLost: number, quality: EquipmentQuality): number {
  const baseCost = 10;
  const qualityMultiplier = {
    common: 1,
    rare: 1.5,
    epic: 2,
    legendary: 3,
  }[quality];
  
  return Math.floor(baseCost * qualityMultiplier * durabilityLost);
}

export const __EQUIPMENT_NFT_MODULE__ = true as const;
