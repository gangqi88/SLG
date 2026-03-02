// 英雄系统常量定义

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
        purple_to_orange: {
            heroSoul: 800,
        },
        orange_to_red: {
            heroSoul: 2000,
            factionCore: 100,
        },
        max_stars: {
            duplicateCard: 5,
        },
    },
} as const;

// 阵营克制加成
export const FACTION_BONUS = {
    'demon->human': 0.25,   // 恶魔 → 人族 +25%
    'human->angel': 0.20,   // 人族 → 天使 +20%
    'angel->demon': 0.30,   // 天使 → 恶魔 +30%
} as const;

// 星级成长倍数
export const STAR_MULTIPLIERS = {
    1: 1.00,    // 1星：基础100%
    2: 1.10,    // 2星：属性+10%
    3: 1.20,    // 3星：属性+20%
    4: 1.35,    // 4星：属性+35%
    5: 1.50,    // 5星：属性+50%
} as const;

// 技能冷却时间（秒）
export const SKILL_COOLDOWN = {
    ACTIVE: 20,
    PASSIVE: 0,
    TALENT: 0,
} as const;

// 品质颜色映射
export const QUALITY_COLORS = {
    purple: '#9B59B6',
    orange: '#E67E22',
    red: '#E74C3C',
} as const;

// 阵营颜色映射
export const FACTION_COLORS = {
    human: '#3498DB',
    angel: '#F1C40F',
    demon: '#E74C3C',
} as const;

// 品质名称映射
export const QUALITY_NAMES = {
    purple: '紫将',
    orange: '橙将',
    red: '红将',
} as const;

// 星级名称映射
export const STAR_NAMES = {
    1: '一星',
    2: '二星',
    3: '三星',
    4: '四星',
    5: '五星',
} as const;
