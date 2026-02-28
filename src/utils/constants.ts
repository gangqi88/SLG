import { ResourceType, BuildingType, ProfessionalSkillType, SkillSpecialization } from '../types/game.types';

// 定义建筑配置接口
interface BuildingConfig {
    name: string;
    maxLevel: number;
    workerCapacity: number;
    constructionTime: number;
    resourceCost: Record<number, Partial<Record<ResourceType, number>>>;
    resourceProduction?: Record<number, Partial<Record<ResourceType, number>>>;
    resourceConsumption?: Record<number, Partial<Record<ResourceType, number>>>;
    capacityIncrease?: Record<number, Partial<Record<ResourceType, number>>>;
}

export const GAME_CONSTANTS = {
    // 游戏时间设置
    TIME: {
        REAL_TIME_PER_GAME_MINUTE: 1000, // 1游戏分钟 = 1秒现实时间
        HOURS_PER_DAY: 24,
        DAYS_PER_SEASON: 30,
        SEASONS: ['spring', 'summer', 'autumn', 'winter'] as const,
    },

    // 资源默认设置
    RESOURCES: {
        INITIAL_AMOUNTS: {
            food: 100,
            wood: 200,
            steel: 50,
            electricity: 100,
            fuel: 50,
        },
        DEFAULT_CAPACITY: {
            food: 500,
            wood: 1000,
            steel: 500,
            electricity: 1000,
            fuel: 500,
        },
    },

    // 幸存者默认设置
    SURVIVORS: {
        INITIAL_COUNT: 5,
        MAX_HEALTH: 100,
        MAX_HUNGER: 100,
        MAX_STAMINA: 100,
        MAX_TEMPERATURE: 100,
        BASE_HUNGER_RATE: 1, // 每小时饥饿值下降
        BASE_STAMINA_RATE: 2, // 工作时每小时体力消耗
        BASE_HEALTH_RECOVERY: 0.5, // 每小时健康恢复
        MIN_TEMPERATURE_FOR_HYPOTHERMIA: 35, // 体温低于35度开始失温
    },

    // 建筑默认设置
    BUILDINGS: {
        SHELTER: {
            name: '庇护所',
            maxLevel: 5,
            workerCapacity: 10,
            constructionTime: 2, // 小时
            resourceCost: {
                1: { wood: 100, steel: 20 },
                2: { wood: 200, steel: 50, electricity: 20 },
                3: { wood: 400, steel: 100, electricity: 50 },
                4: { wood: 800, steel: 200, electricity: 100, fuel: 50 },
                5: { wood: 1600, steel: 400, electricity: 200, fuel: 100 },
            },
        } as BuildingConfig,
        WAREHOUSE: {
            name: '仓库',
            maxLevel: 3,
            workerCapacity: 5,
            constructionTime: 3,
            resourceCost: {
                1: { wood: 150 },
                2: { wood: 300, steel: 50 },
                3: { wood: 600, steel: 100, electricity: 30 },
            },
            capacityIncrease: {
                1: { food: 500, wood: 1000, steel: 500, electricity: 500, fuel: 500 },
                2: { food: 1000, wood: 2000, steel: 1000, electricity: 1000, fuel: 1000 },
                3: { food: 2000, wood: 4000, steel: 2000, electricity: 2000, fuel: 2000 },
            },
        } as BuildingConfig,
        FARM: {
            name: '农场',
            maxLevel: 4,
            workerCapacity: 6,
            constructionTime: 4,
            resourceCost: {
                1: { wood: 200, steel: 30 },
                2: { wood: 400, steel: 60, electricity: 20 },
                3: { wood: 800, steel: 120, electricity: 40, fuel: 20 },
                4: { wood: 1600, steel: 240, electricity: 80, fuel: 40 },
            },
            resourceProduction: {
                1: { food: 10 },
                2: { food: 25 },
                3: { food: 60 },
                4: { food: 150 },
            },
            resourceConsumption: {
                1: { electricity: 5 },
                2: { electricity: 10 },
                3: { electricity: 20, fuel: 5 },
                4: { electricity: 40, fuel: 10 },
            },
        } as BuildingConfig,
        LUMBER_MILL: {
            name: '伐木场',
            maxLevel: 3,
            workerCapacity: 8,
            constructionTime: 3,
            resourceCost: {
                1: { wood: 100 },
                2: { wood: 200, steel: 40 },
                3: { wood: 400, steel: 80, electricity: 30 },
            },
            resourceProduction: {
                1: { wood: 20 },
                2: { wood: 50 },
                3: { wood: 120 },
            },
            resourceConsumption: {
                1: { electricity: 3 },
                2: { electricity: 8 },
                3: { electricity: 20, fuel: 5 },
            },
        } as BuildingConfig,
        POWER_PLANT: {
            name: '发电站',
            maxLevel: 3,
            workerCapacity: 4,
            constructionTime: 5,
            resourceCost: {
                1: { wood: 300, steel: 100 },
                2: { wood: 600, steel: 200, fuel: 50 },
                3: { wood: 1200, steel: 400, fuel: 100 },
            },
            resourceProduction: {
                1: { electricity: 50 },
                2: { electricity: 120 },
                3: { electricity: 300 },
            },
            resourceConsumption: {
                1: { fuel: 10 },
                2: { fuel: 25 },
                3: { fuel: 60 },
            },
        } as BuildingConfig,
    },

    // 季节影响
    SEASON_EFFECTS: {
        spring: {
            temperature: 15,
            resourceMultiplier: { food: 1.2, wood: 1.1, electricity: 1, fuel: 0.9, steel: 1 },
            survivorEffect: { healthRecovery: 1.2, hungerRate: 1 },
        },
        summer: {
            temperature: 25,
            resourceMultiplier: { food: 1.5, wood: 1.3, electricity: 1.2, fuel: 0.8, steel: 1 },
            survivorEffect: { healthRecovery: 1.5, hungerRate: 1.2 },
        },
        autumn: {
            temperature: 10,
            resourceMultiplier: { food: 1, wood: 1, electricity: 1, fuel: 1, steel: 1 },
            survivorEffect: { healthRecovery: 1, hungerRate: 1 },
        },
        winter: {
            temperature: -10,
            resourceMultiplier: { food: 0.5, wood: 0.8, electricity: 0.9, fuel: 1.5, steel: 0.9 },
            survivorEffect: { healthRecovery: 0.7, hungerRate: 1.3 },
            heatingRequired: true,
        },
    },

    // 难度设置
    DIFFICULTY: {
        easy: {
            resourceMultiplier: 1.5,
            survivorHealthRecovery: 1.2,
            disasterFrequency: 0.5,
            eventRewardMultiplier: 1.5,
        },
        normal: {
            resourceMultiplier: 1,
            survivorHealthRecovery: 1,
            disasterFrequency: 1,
            eventRewardMultiplier: 1,
        },
        hard: {
            resourceMultiplier: 0.7,
            survivorHealthRecovery: 0.8,
            disasterFrequency: 1.5,
            eventRewardMultiplier: 0.7,
        },
    },
};

// 建筑类型映射
export const BUILDING_TYPE_INFO: Record<BuildingType, {
    name: string;
    description: string;
    category: 'housing' | 'production' | 'storage' | 'utility' | 'research';
}> = {
    shelter: {
        name: '庇护所',
        description: '为幸存者提供住所，增加人口上限',
        category: 'housing',
    },
    warehouse: {
        name: '仓库',
        description: '存储各种资源，提升存储容量',
        category: 'storage',
    },
    farm: {
        name: '农场',
        description: '生产食物，消耗电力',
        category: 'production',
    },
    lumberMill: {
        name: '伐木场',
        description: '生产木材，消耗电力',
        category: 'production',
    },
    powerPlant: {
        name: '发电站',
        description: '生产电力，消耗燃料',
        category: 'production',
    },
    steelMill: {
        name: '钢厂',
        description: '生产钢材，消耗电力和燃料',
        category: 'production',
    },
    researchLab: {
        name: '研究所',
        description: '研究新技术，消耗各种资源',
        category: 'research',
    },
    hospital: {
        name: '医院',
        description: '治疗受伤和生病的幸存者',
        category: 'utility',
    },
    kitchen: {
        name: '厨房',
        description: '提高食物利用效率，减少饥饿',
        category: 'utility',
    },
};

// 专业技能配置
export const PROFESSIONAL_SKILLS_CONFIG: Partial<Record<ProfessionalSkillType, {
    name: string;
    description: string;
    specialization: SkillSpecialization;
    maxLevel: number;
    baseExperienceRequired: number; // 每级基础经验需求
    requirements: {
        baseSkillLevel: number;
        prerequisites?: ProfessionalSkillType[];
    };
    effects: Array<{
        level: number;
        description: string;
        modifiers: {
            resourceProduction?: Partial<Record<ResourceType, number>>;
            resourceConsumption?: Partial<Record<ResourceType, number>>;
            workEfficiency?: number;
            constructionSpeed?: number;
            researchSpeed?: number;
            healingEfficiency?: number;
            staminaConsumption?: number;
            survivalChance?: number;
        };
    }>;
}>> = {
    // 采集专家技能
    woodcuttingMaster: {
        name: '伐木大师',
        description: '提高木材采集效率，减少体力消耗',
        specialization: 'gathering',
        maxLevel: 5,
        baseExperienceRequired: 100,
        requirements: { baseSkillLevel: 3 },
        effects: [
            {
                level: 1,
                description: '木材采集效率+10%，体力消耗-5%',
                modifiers: { workEfficiency: 0.1, staminaConsumption: -0.05 }
            },
            {
                level: 2,
                description: '木材采集效率+20%，体力消耗-10%',
                modifiers: { workEfficiency: 0.2, staminaConsumption: -0.1 }
            },
            {
                level: 3,
                description: '木材采集效率+30%，体力消耗-15%',
                modifiers: { workEfficiency: 0.3, staminaConsumption: -0.15 }
            },
            {
                level: 4,
                description: '木材采集效率+40%，体力消耗-20%',
                modifiers: { workEfficiency: 0.4, staminaConsumption: -0.2 }
            },
            {
                level: 5,
                description: '木材采集效率+50%，体力消耗-25%',
                modifiers: { workEfficiency: 0.5, staminaConsumption: -0.25 }
            }
        ]
    },
    huntingExpert: {
        name: '狩猎专家',
        description: '提高食物采集效率，增加狩猎成功率',
        specialization: 'gathering',
        maxLevel: 5,
        baseExperienceRequired: 100,
        requirements: { baseSkillLevel: 3 },
        effects: [
            {
                level: 1,
                description: '食物采集效率+10%，生存几率+5%',
                modifiers: { workEfficiency: 0.1, survivalChance: 0.05 }
            },
            {
                level: 2,
                description: '食物采集效率+20%，生存几率+10%',
                modifiers: { workEfficiency: 0.2, survivalChance: 0.1 }
            },
            {
                level: 3,
                description: '食物采集效率+30%，生存几率+15%',
                modifiers: { workEfficiency: 0.3, survivalChance: 0.15 }
            },
            {
                level: 4,
                description: '食物采集效率+40%，生存几率+20%',
                modifiers: { workEfficiency: 0.4, survivalChance: 0.2 }
            },
            {
                level: 5,
                description: '食物采集效率+50%，生存几率+25%',
                modifiers: { workEfficiency: 0.5, survivalChance: 0.25 }
            }
        ]
    },
    miningProficiency: {
        name: '采矿精通',
        description: '提高钢材采集效率，发现更多矿脉',
        specialization: 'gathering',
        maxLevel: 5,
        baseExperienceRequired: 120,
        requirements: { baseSkillLevel: 4 },
        effects: [
            {
                level: 1,
                description: '钢材采集效率+15%，资源发现率+5%',
                modifiers: { workEfficiency: 0.15 }
            },
            {
                level: 2,
                description: '钢材采集效率+25%，资源发现率+10%',
                modifiers: { workEfficiency: 0.25 }
            },
            {
                level: 3,
                description: '钢材采集效率+35%，资源发现率+15%',
                modifiers: { workEfficiency: 0.35 }
            },
            {
                level: 4,
                description: '钢材采集效率+45%，资源发现率+20%',
                modifiers: { workEfficiency: 0.45 }
            },
            {
                level: 5,
                description: '钢材采集效率+55%，资源发现率+25%',
                modifiers: { workEfficiency: 0.55 }
            }
        ]
    },
    resourceConservation: {
        name: '资源节约',
        description: '减少资源消耗，提高资源利用效率',
        specialization: 'gathering',
        maxLevel: 5,
        baseExperienceRequired: 80,
        requirements: { baseSkillLevel: 2 },
        effects: [
            {
                level: 1,
                description: '资源消耗-5%，工作效率+5%',
                modifiers: { resourceConsumption: { food: -0.05, wood: -0.05 }, workEfficiency: 0.05 }
            },
            {
                level: 2,
                description: '资源消耗-10%，工作效率+10%',
                modifiers: { resourceConsumption: { food: -0.1, wood: -0.1 }, workEfficiency: 0.1 }
            },
            {
                level: 3,
                description: '资源消耗-15%，工作效率+15%',
                modifiers: { resourceConsumption: { food: -0.15, wood: -0.15 }, workEfficiency: 0.15 }
            },
            {
                level: 4,
                description: '资源消耗-20%，工作效率+20%',
                modifiers: { resourceConsumption: { food: -0.2, wood: -0.2 }, workEfficiency: 0.2 }
            },
            {
                level: 5,
                description: '资源消耗-25%，工作效率+25%',
                modifiers: { resourceConsumption: { food: -0.25, wood: -0.25 }, workEfficiency: 0.25 }
            }
        ]
    },
    // 建造专家技能（示例）
    fastConstruction: {
        name: '快速建造',
        description: '提高建筑建造速度，减少施工时间',
        specialization: 'construction',
        maxLevel: 5,
        baseExperienceRequired: 100,
        requirements: { baseSkillLevel: 3 },
        effects: [
            {
                level: 1,
                description: '建造速度+10%，材料消耗-5%',
                modifiers: { constructionSpeed: 0.1 }
            },
            {
                level: 2,
                description: '建造速度+20%，材料消耗-10%',
                modifiers: { constructionSpeed: 0.2 }
            },
            {
                level: 3,
                description: '建造速度+30%，材料消耗-15%',
                modifiers: { constructionSpeed: 0.3 }
            },
            {
                level: 4,
                description: '建造速度+40%，材料消耗-20%',
                modifiers: { constructionSpeed: 0.4 }
            },
            {
                level: 5,
                description: '建造速度+50%，材料消耗-25%',
                modifiers: { constructionSpeed: 0.5 }
            }
        ]
    },
};

// 技能系统常量
export const SKILL_CONSTANTS = {
    // 基础技能设置
    BASE_SKILLS: {
        MAX_LEVEL: 10,
        EXPERIENCE_PER_LEVEL: 100,
        LEVEL_UP_MULTIPLIER: 1.5, // 每级经验需求乘数
    },
    // 专业技能设置
    PROFESSIONAL_SKILLS: {
        MAX_SKILL_POINTS: 20,
        EXPERIENCE_GAIN_RATE: {
            gathering: 1,
            construction: 0.8,
            research: 0.6,
            medical: 0.7,
            management: 0.5
        },
        // 技能点获取方式
        SKILL_POINT_SOURCES: {
            levelUp: 1, // 每升一级获得
            specialEvent: 2, // 特殊事件
            research: 3, // 研究完成
        }
    },
    // 经验获取速率
    EXPERIENCE_RATES: {
        WORK_PER_HOUR: 10, // 每小时工作获得经验
        SUCCESSFUL_TASK: 20, // 成功完成任务
        SPECIAL_EVENT: 50, // 特殊事件
        RESEARCH_COMPLETE: 100, // 研究完成
    }
};

// 资源类型映射
export const RESOURCE_TYPE_INFO: Record<ResourceType, {
    name: string;
    unit: string;
    color: string;
    icon: string;
}> = {
    food: {
        name: '食物',
        unit: '份',
        color: '#4CAF50',
        icon: '🍎',
    },
    wood: {
        name: '木材',
        unit: '单位',
        color: '#8B4513',
        icon: '🪵',
    },
    steel: {
        name: '钢材',
        unit: '吨',
        color: '#607D8B',
        icon: '⚙️',
    },
    electricity: {
        name: '电力',
        unit: '千瓦时',
        color: '#FFD700',
        icon: '⚡',
    },
    fuel: {
        name: '燃料',
        unit: '升',
        color: '#FF5722',
        icon: '⛽',
    },
};