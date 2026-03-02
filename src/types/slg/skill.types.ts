// 技能NFT系统类型定义

import type { SkillType, EffectType, TargetType, NFTRarity } from './hero.types';

// ============================================
// 技能基础类型
// ============================================

// 技能分类
export type SkillCategory = 
  | 'attack'     // 攻击
  | 'defense'    // 防御
  | 'heal'       // 治疗
  | 'buff'       // 增益
  | 'debuff'     // 减益
  | 'control'    // 控制
  | 'support'    // 辅助
  | 'special';   // 特殊

// 技能来源
export type SkillSource = 'drop' | 'craft' | 'event' | 'ugc' | 'task';

// 技能稀有度颜色
export const SKILL_RARITY_COLORS: Record<NFTRarity, string> = {
  common: '#9ca3af',   // 普通 - 白色
  rare: '#22c55e',    // 稀有 - 绿色
  epic: '#3b82f6',    // 史诗 - 蓝色
  legendary: '#a855f7', // 传说 - 紫色
  mythic: '#f59e0b',  // 神话 - 金色
};

// ============================================
// 技能效果
// ============================================

export interface SkillEffectDefinition {
  type: EffectType;
  value: number;           // 效果数值
  target: TargetType;
  duration?: number;       // 持续时间(秒)
  condition?: string;      // 触发条件
}

// ============================================
// 技能NFT接口
// ============================================

export interface SkillNFT {
  id: string;
  templateId: number;
  owner: string;
  
  // 技能信息
  name: string;
  description: string;
  type: SkillType;
  category: SkillCategory;
  
  // 效果
  effects: SkillEffectDefinition[];
  
  // 属性
  cooldown: number;         // 冷却时间(秒)
  manaCost?: number;        // 魔力消耗
  range?: number;          // 施法范围
  
  // 稀有度
  rarity: NFTRarity;
  rarityValue: number;     // 1-100 数值
  
  // 效果倍率
  effectMultiplier: number; // 基于稀有度的效果加成
  
  // 来源
  source: SkillSource;
  
  // UGC审核 (仅UGC来源)
  ugcVerified?: boolean;
  creator?: string;
  
  // 历史
  transferCount: number;
  equipCount: number;      // 被装备次数
  createdAt: number;
}

// ============================================
// 技能模板 (静态配置)
// ============================================

export interface SkillTemplate {
  id: number;
  name: string;
  description: string;
  type: SkillType;
  category: SkillCategory;
  
  // 基础效果 (稀有度1.0x)
  baseEffects: SkillEffectDefinition[];
  
  // 冷却时间
  baseCooldown: number;
  manaCost?: number;
  range?: number;
  
  // 稀有度对应效果倍率
  rarityMultipliers: Record<NFTRarity, number>;
  
  // 标签
  tags: string[];
  
  // 图标
  icon: string;
  effectIcon?: string;
}

// ============================================
// 技能插槽
// ============================================

export interface SkillSlot {
  type: 'active' | 'passive1' | 'passive2' | 'talent';
  unlocked: boolean;
  unlockedLevel: number;   // 解锁所需等级
  skillId?: string;        // 已装备的SkillNFT ID
}

// 英雄技能槽配置
export const SKILL_SLOT_CONFIG: SkillSlot[] = [
  { type: 'active', unlocked: true, unlockedLevel: 1 },
  { type: 'passive1', unlocked: true, unlockedLevel: 1 },
  { type: 'passive2', unlocked: false, unlockedLevel: 20 },
  { type: 'talent', unlocked: false, unlockedLevel: 40 },
];

// ============================================
// 技能组合效果
// ============================================

export interface SkillSetBonus {
  id: number;
  name: string;
  skills: number[];         // 技能模板ID
  bonus: {
    attribute: string;
    value: number;
    description: string;
  };
}

// 预定义技能组合
export const SKILL_SET_BONUSES: SkillSetBonus[] = [
  {
    id: 1,
    name: '火焰大师',
    skills: [101, 102, 103], // 假设火焰技能ID
    bonus: {
      attribute: 'fireDamage',
      value: 0.30,
      description: '火焰伤害+30%',
    },
  },
];

// ============================================
// 技能操作
// ============================================

export interface EquipSkillRequest {
  heroId: string;
  skillId: string;
  slot: 'active' | 'passive1' | 'passive2' | 'talent';
}

export interface EquipSkillResult {
  success: boolean;
  previousSkillId?: string;
  error?: string;
}

export interface UnequipSkillRequest {
  heroId: string;
  slot: 'active' | 'passive1' | 'passive2' | 'talent';
}

export interface SkillLearnRequest {
  skillTemplateId: number;
  payment?: number;
}

export interface SkillLearnResult {
  success: boolean;
  skillId?: string;
  error?: string;
}

// ============================================
// 技能掉落配置
// ============================================

export interface SkillDropConfig {
  source: string;           // 来源 (副本/竞技场/活动)
  skillTemplateId: number;
  rarity: NFTRarity;
  dropRate: number;         // 掉落概率 0-1
}

// ============================================
// 常量
// ============================================

export const SKILL_CONSTANTS = {
  MAX_LEVEL: 80,
  MAX_STARS: 5,
  
  SLOTS: {
    active: { index: 0, unlockedLevel: 1 },
    passive1: { index: 1, unlockedLevel: 1 },
    passive2: { index: 2, unlockedLevel: 20 },
    talent: { index: 3, unlockedLevel: 40 },
  },
  
  COOLDOWN_BY_QUALITY: {
    purple: { min: 15, max: 20 },
    orange: { min: 12, max: 18 },
    red: { min: 8, max: 15 },
  },
  
  RARITY_MULTIPLIERS: {
    common: 1.0,
    rare: 1.2,
    epic: 1.5,
    legendary: 2.0,
    mythic: 3.0,
  },
  
  SKILL_CATEGORIES: [
    'attack', 'defense', 'heal', 'buff', 'debuff', 'control', 'support', 'special'
  ] as const,
  
  SOURCES: ['drop', 'craft', 'event', 'ugc', 'task'] as const,
} as const;

// ============================================
// 辅助函数
// ============================================

export function calculateSkillPower(skill: SkillNFT): number {
  const effectSum = skill.effects.reduce((sum, effect) => sum + Math.abs(effect.value), 0);
  const rarityMultiplier = SKILL_CONSTANTS.RARITY_MULTIPLIERS[skill.rarity];
  const cooldownFactor = Math.max(1, 20 / skill.cooldown); // 冷却越短越强
  
  return Math.floor(effectSum * rarityMultiplier * cooldownFactor);
}

export function getSkillRarity(rarityValue: number): NFTRarity {
  if (rarityValue >= 90) return 'mythic';
  if (rarityValue >= 70) return 'legendary';
  if (rarityValue >= 50) return 'epic';
  if (rarityValue >= 30) return 'rare';
  return 'common';
}

export function canEquipSkill(heroLevel: number, slotType: 'active' | 'passive1' | 'passive2' | 'talent'): boolean {
  const requiredLevel = SKILL_CONSTANTS.SLOTS[slotType].unlockedLevel;
  return heroLevel >= requiredLevel;
}

export const __SKILL_NFT_MODULE__ = true as const;
