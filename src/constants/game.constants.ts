// 游戏常量定义

export const GAME_CONSTANTS = {
    VERSION: '1.0.0',
    
    // 游戏难度
    DIFFICULTY: {
        EASY: 'easy',
        NORMAL: 'normal',
        HARD: 'hard',
        NIGHTMARE: 'nightmare',
    } as const,
    
    // 游戏难度参数
    DIFFICULTY_PARAMS: {
        easy: {
            resourceMultiplier: 1.5,
            enemyStrengthMultiplier: 0.7,
            survivorRecruitmentRate: 1.3,
        },
        normal: {
            resourceMultiplier: 1.0,
            enemyStrengthMultiplier: 1.0,
            survivorRecruitmentRate: 1.0,
        },
        hard: {
            resourceMultiplier: 0.7,
            enemyStrengthMultiplier: 1.3,
            survivorRecruitmentRate: 0.7,
        },
        nightmare: {
            resourceMultiplier: 0.5,
            enemyStrengthMultiplier: 1.6,
            survivorRecruitmentRate: 0.5,
        },
    },
    
    // 时间系统
    TIME: {
        TICKS_PER_DAY: 24,
        TICKS_PER_HOUR: 1,
        SEASONS: ['spring', 'summer', 'autumn', 'winter'] as const,
        SEASON_LENGTH_DAYS: 90,
    },
    
    // 温度范围
    TEMPERATURE: {
        MIN: -30,
        MAX: 40,
        COMFORTABLE_MIN: 15,
        COMFORTABLE_MAX: 25,
    },
    
    // 人口容量计算
    POPULATION: {
        BASE_CAPACITY: 10,
        PER_SHELTER: 5,
        PER_WAREHOUSE: 0,
    },
    
    // 资源类型
    RESOURCE_TYPES: ['food', 'wood', 'steel', 'electricity', 'fuel'] as const,
    
    // 建筑类型
    BUILDING_TYPES: {
        SHELTER: 'shelter',
        WAREHOUSE: 'warehouse',
        FARM: 'farm',
        LUMBER_MILL: 'lumberMill',
        POWER_PLANT: 'powerPlant',
        WATER_FILTER: 'waterFilter',
        KITCHEN: 'kitchen',
        HOSPITAL: 'hospital',
        RESEARCH_LAB: 'researchLab',
        TRAINING_CENTER: 'trainingCenter',
    } as const,
    
    // 职业类型
    JOB_TYPES: {
        IDLE: 'idle',
        GATHERING: 'gathering',
        CONSTRUCTION: 'construction',
        RESEARCH: 'research',
        MEDICAL: 'medical',
        MANAGEMENT: 'management',
        TRAINING: 'training',
        COOKING: 'cooking',
    } as const,
} as const;

export type GameDifficulty = typeof GAME_CONSTANTS.DIFFICULTY[keyof typeof GAME_CONSTANTS.DIFFICULTY];
export type ResourceType = typeof GAME_CONSTANTS.RESOURCE_TYPES[number];
export type BuildingType = typeof GAME_CONSTANTS.BUILDING_TYPES[keyof typeof GAME_CONSTANTS.BUILDING_TYPES];
export type JobType = typeof GAME_CONSTANTS.JOB_TYPES[keyof typeof GAME_CONSTANTS.JOB_TYPES];
