export type ResourceType = 'food' | 'wood' | 'steel' | 'electricity' | 'fuel';

export interface Resource {
    type: ResourceType;
    amount: number;
    capacity: number;
    productionRate: number;
    consumptionRate: number;
}

export interface ResourceState {
    food: Resource;
    wood: Resource;
    steel: Resource;
    electricity: Resource;
    fuel: Resource;
}

export type BuildingType = 
    | 'shelter'     // 庇护所
    | 'warehouse'   // 仓库
    | 'farm'        // 农场
    | 'lumberMill'  // 伐木场
    | 'powerPlant'  // 发电站
    | 'steelMill'   // 钢厂
    | 'researchLab' // 研究所
    | 'hospital'    // 医院
    | 'kitchen';    // 厨房

export interface Building {
    id: string;
    type: BuildingType;
    level: number;
    x: number;
    y: number;
    maxLevel: number;
    constructionTime: number;
    resourceCost: Partial<Record<ResourceType, number>>;
    resourceProduction?: Partial<Record<ResourceType, number>>;
    resourceConsumption?: Partial<Record<ResourceType, number>>;
    workerCapacity: number;
    assignedWorkers: number;
    isConstructing: boolean;
}

export interface Survivor {
    id: string;
    name: string;
    health: number;        // 健康值 0-100
    hunger: number;        // 饥饿值 0-100
    stamina: number;       // 体力值 0-100
    temperature: number;   // 体温 0-100
    skills: SurvivorSkills;
    assignedBuildingId: string | null;
    jobType: 'idle' | 'gathering' | 'construction' | 'research' | 'resting';
    isSick: boolean;
    isInjured: boolean;
}

// 导入SLG英雄类型
import type { Hero, Team } from './slg/hero.types';

export interface GameState {
    resources: ResourceState;
    buildings: Building[];
    survivors: Survivor[];
    time: {
        day: number;
        hour: number;
        minute: number;
        season: 'spring' | 'summer' | 'autumn' | 'winter';
        temperature: number; // 环境温度 -30 到 30
    };
    gameStats: {
        daysSurvived: number;
        totalSurvivorsRescued: number;
        totalResourcesCollected: Record<ResourceType, number>;
        buildingsConstructed: number;
    };
    difficulty: GameDifficulty;
    
    // SLG扩展字段
    playerHeroes?: string[];     // 玩家拥有的英雄ID列表
    heroes?: Record<string, Hero>; // 英雄详细数据
    teams?: Team[];              // 玩家拥有的队伍
}

export type GameDifficulty = 'easy' | 'normal' | 'hard';

export interface GameEvent {
    id: string;
    type: 'disaster' | 'opportunity' | 'survivor' | 'discovery';
    title: string;
    description: string;
    choices: GameEventChoice[];
    expiresIn: number; // 游戏内小时数
}

export interface GameEventChoice {
    text: string;
    effects: Partial<{
        resources: Partial<Record<ResourceType, number>>;
        survivors: number;
        healthChange: number;
        buildingDamage: number;
    }>;
    successChance: number;
}

export type TechType = 
    | 'basicShelter'      // 基础庇护所
    | 'advancedFarming'   // 高级农业
    | 'electricityGrid'   // 电网
    | 'steelProduction'   // 钢铁生产
    | 'medicalResearch'   // 医疗研究
    | 'winterClothing'    // 冬装
    | 'insulatedBuildings' // 保温建筑
    | 'renewableEnergy';  // 可再生能源

export interface Technology {
    id: TechType;
    name: string;
    description: string;
    cost: Partial<Record<ResourceType, number>>;
    researchTime: number;
    prerequisites: TechType[];
    unlocked: boolean;
}

// 专业技能系统
export type SkillSpecialization = 
    | 'gathering'      // 采集专家
    | 'construction'   // 建造专家
    | 'research'       // 研究专家
    | 'medical'        // 医疗专家
    | 'management';    // 管理专家

export type ProfessionalSkillType = 
    // 采集专家技能
    | 'woodcuttingMaster'      // 伐木大师
    | 'huntingExpert'          // 狩猎专家
    | 'miningProficiency'      // 采矿精通
    | 'resourceConservation'   // 资源节约
    // 建造专家技能
    | 'fastConstruction'       // 快速建造
    | 'materialEfficiency'     // 材料效率
    | 'buildingMaintenance'    // 建筑维护
    | 'architecturalDesign'    // 建筑设计
    // 研究专家技能
    | 'researchSpeed'          // 研究速度
    | 'technologyDiscovery'    // 技术发现
    | 'experimentalDesign'     // 实验设计
    | 'scientificMethod'       // 科学方法
    // 医疗专家技能
    | 'diagnosticSkills'       // 诊断技能
    | 'treatmentEfficiency'    // 治疗效率
    | 'diseasePrevention'      // 疾病预防
    | 'firstAid'               // 急救技能
    // 管理专家技能
    | 'teamMotivation'         // 团队激励
    | 'resourceAllocation'     // 资源分配
    | 'workScheduling'         // 工作调度
    | 'crisisManagement';      // 危机管理

export interface ProfessionalSkill {
    id: ProfessionalSkillType;
    name: string;
    description: string;
    specialization: SkillSpecialization;
    maxLevel: number;
    currentLevel: number;
    experience: number; // 经验值 0-100
    requirements: {
        baseSkillLevel: number; // 需要的基础技能等级
        prerequisites?: ProfessionalSkillType[]; // 前置技能
    };
    effects: Array<{
        level: number;
        description: string;
        modifiers: Partial<{
            resourceProduction: Partial<Record<ResourceType, number>>;
            resourceConsumption: Partial<Record<ResourceType, number>>;
            workEfficiency: number; // 工作效率加成
            constructionSpeed: number; // 建造速度加成
            researchSpeed: number; // 研究速度加成
            healingEfficiency: number; // 治疗效率加成
            staminaConsumption: number; // 体力消耗减少
            survivalChance: number; // 生存几率增加
        }>;
    }>;
}

export interface SurvivorSkills {
    // 基础技能 (1-10级)
    baseSkills: {
        gathering: number;     // 采集技能
        construction: number;  // 建造技能
        research: number;      // 研究技能
        medical: number;       // 医疗技能
    };
    // 专业技能 (需要学习和升级)
    professionalSkills: Map<ProfessionalSkillType, ProfessionalSkill>;
    // 当前专精方向 (可以为空)
    specialization?: SkillSpecialization;
    // 技能点 (用于学习新技能)
    skillPoints: number;
    // 总经验值
    totalExperience: number;
}

export const __GAME_TYPES_MODULE__ = true as const;
