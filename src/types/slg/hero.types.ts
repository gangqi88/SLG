// SLG英雄系统类型定义

// ============================================
// 基础类型定义
// ============================================

// 阵营类型
export type FactionType = 'human' | 'angel' | 'demon';

// 英雄品质 (原系统)
export type HeroQuality = 'purple' | 'orange' | 'red';

// Web3稀有度 (新系统)
export type NFTRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

// 英雄稀有度数值 (1-100)
export type RarityValue = number;

// 英雄状态
export type HeroStatus = 'idle' | 'deployed' | 'injured' | 'training' | 'captured';

// 技能类型
export type SkillType = 'active' | 'passive' | 'talent';

// 效果类型
export type EffectType = 'damage' | 'heal' | 'buff' | 'debuff' | 'special' | 'shield' | 'defense' | 'attack' | 'movement' | 'morale' | 'resource' | 'training' | 'plunder' | 'stealth' | 'skill' | 'crit' | 'critDamage' | 'dodge' | 'healBoost' | 'wounded' | 'casualty' | 'trap' | 'building' | 'trade' | 'gold' | 'fire' | 'burn' | 'control' | 'aoe';

// 目标类型
export type TargetType = 'self' | 'ally' | 'enemy' | 'all';

// 队伍位置
export type TeamPosition = 'main' | 'sub';

// ============================================
// Web3新增类型
// ============================================

// 英雄类型 (SLG专属)
export type HeroType = 'commander' | 'strategist' | 'diplomat' | 'administrator';

// NFT协议类型
export type NFTProtocol = 'brc20' | 'runes' | 'rgb++';

// 铸造类型
export type MintType = 'inscription' | 'game_mint' | 'breeding' | 'event';

// 装备类型
export type EquipmentType = 'weapon' | 'armor' | 'accessory' | 'mount';

// 符文类型
export type RuneType = 'attack' | 'defense' | 'health' | 'crit' | 'dodge' | 'speed';

// VIP等级
export type VIPLevel = 0 | 1 | 2 | 3 | 4 | 5;

// 市场类型
export type MarketType = 'p2p' | 'auction' | 'bundle' | 'rental';

// ============================================
// 英雄属性接口
// ============================================

// 英雄属性接口
export interface HeroAttributes {
  command: number;   // 统御：20-100
  strength: number;  // 武力：20-100
  strategy: number;  // 谋略：20-100
  defense: number;   // 防御：20-100
}

// 成长率接口
export interface GrowthRates {
  command: number;   // 统御成长率
  strength: number;  // 武力成长率
  strategy: number;  // 谋略成长率
  defense: number;   // 防御成长率
}

// 战斗属性 (实时计算)
export interface BattleAttributes {
  attack: number;      // 攻击力
  defense: number;     // 防御力
  health: number;      // 生命值
  speed: number;      // 速度
  crit: number;       // 暴击率
  critDamage: number;  // 暴击伤害
  dodge: number;      // 闪避率
}

// 技能效果接口
export interface SkillEffect {
  type: EffectType;
  value: number;             // 效果数值
  target: TargetType;
  condition?: string;        // 触发条件
  duration?: number;         // 持续时间（秒）
}

// 技能等级接口
export interface SkillLevel {
  level: number;
  effect: string;
  description: string;
  cooldown?: number;         // 冷却时间
  manaCost?: number;         // 魔力消耗
}

// 技能接口
export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  
  // 技能效果
  effects: SkillEffect[];
  
  // 技能属性
  cooldown?: number;         // 冷却时间（秒）
  manaCost?: number;         // 魔力消耗
  range?: number;            // 施法范围
  duration?: number;         // 持续时间
  
  // 升级效果
  levels: SkillLevel[];
  
  // 特殊标签
  tags: string[];            // 技能标签
  icon: string;              // 技能图标
}

// 羁绊效果接口
export interface BondEffect {
  attribute: keyof HeroAttributes;
  bonus: number;             // 加成百分比
  condition?: string;        // 触发条件
}

// 羁绊接口
export interface Bond {
  id: string;
  name: string;
  description: string;
  
  // 羁绊成员
  heroes: string[];          // 英雄ID列表
  
  // 羁绊效果
  effects: BondEffect[];
  
  // 激活条件
  activationCondition: {
    requiredStars: number;   // 所需总星级
    requiredLevel: number;   // 所需最低等级
  };
  
  icon: string;              // 羁绊图标
}

// 装备接口
export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  quality: 'common' | 'rare' | 'epic' | 'legendary';
  
  // 装备属性
  attributes: Partial<HeroAttributes>;
  
  // 装备效果
  effects: SkillEffect[];
  
  // 装备等级
  level: number;
  maxLevel: number;
  
  // 强化属性
  enhancements: Partial<HeroAttributes>;
  
  icon: string;              // 装备图标
}

// 英雄接口
export interface Hero {
  id: string;                // 唯一标识
  name: string;              // 英雄名称
  faction: FactionType;      // 阵营
  quality: HeroQuality;      // 品质
  rarity: number;            // 稀有度 1-100
  stars: number;             // 星级 1-5
  
  // 基础属性
  attributes: HeroAttributes;
  
  // 成长属性
  growthRates: GrowthRates;
  
  // 满级属性（80级）
  maxLevelAttributes: HeroAttributes;
  
  // 技能系统
  activeSkill: Skill;        // 主动技能
  passiveSkill: Skill;       // 被动技能
  talent: Skill;             // 天赋技能
  
  // 羁绊系统
  bonds: Bond[];             // 羁绊关系
  bondActive: boolean;       // 羁绊是否激活
  
  // 装备系统
  equipment: {
    weapon?: Equipment;      // 武器
    armor?: Equipment;       // 护甲
    accessory?: Equipment;   // 饰品
  };
  
  // NFT属性
  nftId?: string;            // NFT ID（如果为NFT英雄）
  tokenId?: string;          // 代币ID
  isNFT: boolean;            // 是否为NFT英雄
  
  // 游戏状态
  level: number;             // 当前等级（1-80）
  experience: number;       // 经验值
  assignedTeam?: string;     // 分配的队伍ID
  position?: TeamPosition;  // 主将或副将位置
  status: HeroStatus;        // 状态
  
  // 战斗数据
  battleStats: {
    battlesWon: number;
    battlesLost: number;
    totalDamage: number;
    totalHealing: number;
    criticalHits: number;
    dodges: number;
  };
  
  // 获取经验
  getExperience: number;    // 当前等级所需经验
  lastBattleTime?: number;   // 最后战斗时间
  
  // 视觉资源
  avatar: string;            // 头像
  fullImage: string;         // 全身像
  icon: string;              // 小图标
  
  // 背景故事
  lore: string;              // 背景故事
  quotes: string[];          // 语音/台词
}

// 队伍成员接口
export interface TeamMember {
  heroId: string;
  position: TeamPosition;   // 主将或副将
  isActive: boolean;         // 是否出战
  currentHealth: number;     // 当前生命值
  maxHealth: number;         // 最大生命值
  mana: number;              // 当前魔力
  maxMana: number;           // 最大魔力
  buffs: Buff[];             // 增益效果
  debuffs: Debuff[];         // 减益效果
}

// 增益效果接口
export interface Buff {
  id: string;
  name: string;
  type: string;
  value: number;
  duration: number;         // 剩余时间（秒）
  source: string;            // 来源英雄
  icon: string;              // 效果图标
}

// 减益效果接口
export interface Debuff {
  id: string;
  name: string;
  type: string;
  value: number;
  duration: number;         // 剩余时间（秒）
  source: string;            // 来源英雄
  icon: string;              // 效果图标
}

// 队伍接口
export interface Team {
  id: string;
  name: string;
  owner: string;              // 所有者ID
  
  // 队伍成员（最多3人）
  members: TeamMember[];
  
  // 队伍属性
  faction: FactionType;
  power: number;              // 战斗力
  morale: number;             // 士气值
  
  // 队伍加成
  bonuses: {
    factionBonus: number;     // 阵营加成
    bondBonus: number;        // 羁绊加成
    equipmentBonus: number;   // 装备加成
  };
  
  // 队伍状态
  status: 'idle' | 'battle' | 'training' | 'marching';
  
  // 队伍历史
  history: {
    battlesWon: number;
    battlesLost: number;
    winRate: number;
  };
}

// 英雄升级结果接口
export interface HeroUpgradeResult {
  success: boolean;
  newLevel?: number;
  newAttributes?: HeroAttributes;
  consumedExperience?: number;
  remainingExperience?: number;
  error?: string;
}

// 英雄进化结果接口
export interface HeroEvolveResult {
  success: boolean;
  newQuality?: HeroQuality;
  newStars?: number;
  consumedMaterials?: {
    heroSoul: number;
    factionCore: number;
    duplicateCards: number;
  };
  error?: string;
}

// 英雄列表查询参数
export interface HeroListQuery {
  faction?: FactionType;
  quality?: HeroQuality;
  stars?: number;
  status?: HeroStatus;
  assignedTeam?: string;
  isNFT?: boolean;
  page?: number;
  limit?: number;
}

// 英雄统计数据接口
export interface HeroStatistics {
  totalHeroes: number;
  byFaction: Record<FactionType, number>;
  byQuality: Record<HeroQuality, number>;
  byStars: Record<string, number>;
  averageLevel: number;
  averagePower: number;
  nftHeroes: number;
  deployedHeroes: number;
}

// 英雄筛选选项接口
export interface HeroFilterOptions {
  factions: FactionType[];
  qualities: HeroQuality[];
  stars: number[];
  levels: [number, number];
  powers: [number, number];
  tags: string[];
  hasBond: boolean;
  isNFT: boolean;
  searchText: string;
}

// 英雄排序选项接口
export interface HeroSortOptions {
  field: 'level' | 'power' | 'quality' | 'stars' | 'rarity';
  order: 'asc' | 'desc';
}

// ============================================
// Web3 游戏系统类型
// ============================================

// 忠诚度状态
export interface LoyaltyStatus {
  loyalty: number;      // 忠诚度 0-100
  fatigue: number;     // 疲劳度 0-100
  lastUpdate: number;   // 上次更新时间
}

// 俘虏状态
export interface CapturedStatus {
  isCaptured: boolean;
  captor?: string;      // 俘虏者地址
  captureTime?: number; // 俘虏时间
  ransomAmount?: number;// 赎金
}

// 觉醒状态
export interface AwakeningStatus {
  level: number;        // 觉醒等级 0-3
  materials: number[];  // 已消耗材料
}

// 繁育记录
export interface BreedingRecord {
  parent1: string;     // 父母英雄ID
  parent2: string;     // 父母英雄ID
  child?: string;      // 子代英雄ID
  timestamp: number;   // 繁育时间
  txHash?: string;    // 交易哈希
}

// 血统
export interface Bloodline {
  id: number;
  name: string;
  bonus: {
    attribute: keyof HeroAttributes;
    value: number;
  }[];
}

// VIP等级配置
export interface VIPConfig {
  level: VIPLevel;
  dailyFreeDraw: number;      // 每日免费抽
  upgradeSpeedMultiplier: number; // 升级速度倍率
  equipmentBonus: number;     // 装备强化成功率加成
  bagCapacity: number;        // 背包容量
  marketFee: number;          // 市场手续费
  hasExclusiveSupport: boolean;
  hasExclusiveAppearance: boolean;
  hasEarlyAccess: boolean;
}

// 市场列表
export interface MarketListing {
  id: string;
  assetType: 'hero' | 'equipment' | 'skill' | 'rune' | 'material';
  assetId: string;
  seller: string;
  price: number;
  paymentToken: 'BTC' | 'FB' | 'BRC20';
  marketType: MarketType;
  listedAt: number;
  expiresAt: number;
}

// 战斗历史 (链上记录)
export interface BattleRecord {
  id: string;
  heroId: string;
  opponentId: string;
  result: 'win' | 'lose';
  timestamp: number;
  txHash?: string;
  experienceGained: number;
  loot?: {
    type: string;
    itemId: string;
  }[];
}

// 成就徽章 (链上NFT)
export interface AchievementBadge {
  id: string;
  heroId: string;
  type: string;
  name: string;
  description: string;
  timestamp: number;
  txHash: string;
}

// ============================================
// 常量定义
// ============================================

export const HERO_CONSTANTS = {
  // 等级相关
  MAX_LEVEL: 80,
  MAX_STARS: 5,
  
  // 属性范围
  ATTRIBUTE_MIN: 20,
  ATTRIBUTE_MAX: 100,
  
  // 稀有度范围
  RARITY_MIN: 1,
  RARITY_MAX: 100,
  
  // 队伍相关
  MAX_TEAM_SIZE: 3,
  MAX_TEAMS: 5,
  
  // 战斗相关
  MAX_MANA: 100,
  MAX_MORALE: 100,
  MIN_MORALE: 30,
  
  // 经验相关
  LEVEL_UP_BASE_EXP: 1000,
  LEVEL_UP_MULTIPLIER: 1.15,
  
  // 进化材料
  EVOLUTION_MATERIALS: {
    'purple_to_orange': {
      heroSoul: 800,
    },
    'orange_to_red': {
      heroSoul: 2000,
      factionCore: 100,
    },
    'max_stars': {
      duplicateCard: 5,
    }
  }
} as const;

// 阵营加成常量
export const FACTION_BONUS = {
  'demon->human': 0.25,   // 恶魔 → 人族 +25%
  'human->angel': 0.20,   // 人族 → 天使 +20%
  'angel->demon': 0.30,   // 天使 → 恶魔 +30%
} as const;

// 星级成长倍数常量
export const STAR_MULTIPLIERS = {
  1: 1.00,    // 1星：基础100%
  2: 1.10,    // 2星：属性+10%
  3: 1.20,    // 3星：属性+20%
  4: 1.35,    // 4星：属性+35%
  5: 1.50,    // 5星：属性+50%
} as const;

// 技能冷却时间常量
export const SKILL_COOLDOWNS = {
  purple: { min: 15, max: 20 },    // 紫将：15-20秒
  orange: { min: 12, max: 18 },    // 橙将：12-18秒
  red: { min: 8, max: 15 },        // 红将：8-15秒
} as const;

// ============================================
// 商业化与经济常量
// ============================================

// VIP等级配置
export const VIP_CONFIGS: Record<VIPLevel, VIPConfig> = {
  0: {
    level: 0,
    dailyFreeDraw: 1,
    upgradeSpeedMultiplier: 1,
    equipmentBonus: 0,
    bagCapacity: 50,
    marketFee: 0.05,
    hasExclusiveSupport: false,
    hasExclusiveAppearance: false,
    hasEarlyAccess: false,
  },
  1: {
    level: 1,
    dailyFreeDraw: 3,
    upgradeSpeedMultiplier: 2,
    equipmentBonus: 0.10,
    bagCapacity: 100,
    marketFee: 0.04,
    hasExclusiveSupport: false,
    hasExclusiveAppearance: false,
    hasEarlyAccess: false,
  },
  2: {
    level: 2,
    dailyFreeDraw: 3,
    upgradeSpeedMultiplier: 3,
    equipmentBonus: 0.15,
    bagCapacity: 150,
    marketFee: 0.035,
    hasExclusiveSupport: false,
    hasExclusiveAppearance: false,
    hasEarlyAccess: false,
  },
  3: {
    level: 3,
    dailyFreeDraw: 5,
    upgradeSpeedMultiplier: 5,
    equipmentBonus: 0.20,
    bagCapacity: 200,
    marketFee: 0.03,
    hasExclusiveSupport: true,
    hasExclusiveAppearance: true,
    hasEarlyAccess: false,
  },
  4: {
    level: 4,
    dailyFreeDraw: 5,
    upgradeSpeedMultiplier: 7,
    equipmentBonus: 0.25,
    bagCapacity: 350,
    marketFee: 0.025,
    hasExclusiveSupport: true,
    hasExclusiveAppearance: true,
    hasEarlyAccess: true,
  },
  5: {
    level: 5,
    dailyFreeDraw: 10,
    upgradeSpeedMultiplier: 10,
    equipmentBonus: 0.30,
    bagCapacity: 500,
    marketFee: 0.02,
    hasExclusiveSupport: true,
    hasExclusiveAppearance: true,
    hasEarlyAccess: true,
  },
} as const;

// 市场手续费
export const MARKET_FEES = {
  p2p: 0.05,
  auction: 0.07,
  bundle: 0.05,
  rental: 0.10,
} as const;

// 版税比例
export const ROYALTY_FEES = {
  firstSale: 0.10,      // 首次销售
  secondarySale: 0.05,  // 二次销售
  ugc: 0.08,           // UGC创作
  developer: 0.02,     // 开发者
} as const;

// 稀有度分布
export const RARITY_DISTRIBUTION = {
  common: 0.60,
  rare: 0.30,
  epic: 0.09,
  legendary: 0.009,
  mythic: 0.001,
} as const;

// 忠诚度变化
export const LOYALTY_CHANGES = {
  win: 5,
  lose: -2,
  captured: -10,
  redeemed: 20,
  dailyIdle: -3,
} as const;

// 忠诚度阈值
export const LOYALTY_THRESHOLDS = {
  defect: 30,        // 叛逃阈值
  gracePeriod: 30,  // 赎回宽限期(天)
} as const;

// 繁育规则
export const BREEDING_RULES = {
  parentMinLevel: 80,
  parentMinStars: 5,
  cooldown: 7,       // 天
  maxBreeds: 3,
} as const;

// 觉醒配置
export const AWAKENING_CONFIG = {
  maxLevel: 3,
  attributeBonus: [0.10, 0.20, 0.30],
} as const;

// 对战收入等级
export const BATTLE_REVENUE = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  veryHigh: 4,
  extreme: 5,
} as const;

export const __HERO_TYPES_MODULE__ = true as const;