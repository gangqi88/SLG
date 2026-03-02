// 战斗系统常量定义

export const BATTLE_CONSTANTS = {
    // 战斗回合
    MAX_ROUNDS: 50,
    AUTO_BATTLE_TIMEOUT: 30000,
    
    // 伤害计算基础值
    BASE_DAMAGE: 100,
    DAMAGE_VARIANCE: 0.1,
    
    // 暴击
    CRITICAL_CHANCE_BASE: 0.05,
    CRITICAL_DAMAGE_MULTIPLIER: 1.5,
    
    // 闪避
    BASE_DODGE_CHANCE: 0.1,
    
    // 防御减免
    DEFENSE_REDUCTION_CAP: 0.75,
    DEFENSE_PER_POINT: 0.01,
    
    // 治疗
    HEAL_VARIANCE: 0.15,
    HEAL_CRITICAL_MULTIPLIER: 1.5,
    
    // Buff/Debuff
    MAX_BUFF_STACK: 3,
    MAX_DEBUFF_STACK: 5,
    BUFF_DURATION: 3,
    DEBUFF_DURATION: 2,
    
    // 阵营克制
    FACTION_ADVANTAGE: {
        demon: 'human',
        human: 'angel',
        angel: 'demon',
    } as const,
    
    FACTION_ADVANTAGE_RATE: {
        demon: 0.25,
        human: 0.20,
        angel: 0.30,
    } as const,
    
    // 士气
    MORALE_MAX: 100,
    MORALE_MIN: 0,
    MORALE_HIT_PENALTY: 10,
    MORALE_WIN_BONUS: 15,
    
    // 怒气
    RAGE_MAX: 100,
    RAGE_SKILL_COST: 30,
    RAGE_PER_DAMAGE: 5,
    
    // 行动顺序
    TURN_ORDER_BONUS: {
        speed_advantage: 10,
        first_strike: 20,
    } as const,
} as const;

// 战斗模式
export const BATTLE_MODES = {
    PVE: 'pve',
    PVP: 'pvp',
    AUTO: 'auto',
    SIMULATION: 'simulation',
} as const;

// 战斗状态
export const BATTLE_STATES = {
    IDLE: 'idle',
    PREPARING: 'preparing',
    IN_PROGRESS: 'in_progress',
    PAUSED: 'paused',
    FINISHED: 'finished',
} as const;

// 伤害类型
export const DAMAGE_TYPES = {
    PHYSICAL: 'physical',
    MAGICAL: 'magical',
    TRUE: 'true',
} as const;

// 战场效果
export const BATTLE_FIELD_EFFECTS = {
    TERRAIN: {
        PLAINS: 'plains',
        MOUNTAIN: 'mountain',
        FOREST: 'forest',
        DESERT: 'desert',
        SNOW: 'snow',
    } as const,
    
    WEATHER: {
        CLEAR: 'clear',
        RAIN: 'rain',
        SNOW: 'snow',
        WIND: 'wind',
        FOG: 'fog',
    } as const,
    
    TIME_OF_DAY: {
        DAWN: 'dawn',
        DAY: 'day',
        DUSK: 'dusk',
        NIGHT: 'night',
    } as const,
} as const;
