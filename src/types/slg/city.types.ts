import { FactionType } from './hero.types';

export type GovernmentPosition = 
  | 'governor'      // 总督：全城加成
  | 'farm_minister' // 农业官：食物产量
  | 'mining_minister' // 矿务官：钢铁产量
  | 'lumber_minister' // 林务官：木材产量
  | 'trade_minister'  // 商务官：金币产量
  | 'defense_commander' // 防御官：城防加成
  | 'training_commander' // 训练官：练兵效率
  | 'researcher';      // 研究院：科技研究

export interface GovernmentHero {
  heroId: string;
  position: GovernmentPosition;
  assignedAt: number;
  bonusLevel: number;
}

export interface GovernmentBonus {
  position: GovernmentPosition;
  bonus: {
    food?: number;
    wood?: number;
    steel?: number;
    gold?: number;
    defense?: number;
    training?: number;
    research?: number;
  };
}

export const GOVERNMENT_POSITIONS: Record<GovernmentPosition, { 
  name: string; 
  description: string;
  primaryBonus: { type: string; value: number };
}> = {
  governor: {
    name: '总督',
    description: '统领全城，各项资源产量+10%',
    primaryBonus: { type: 'all', value: 10 },
  },
  farm_minister: {
    name: '农业官',
    description: '主管农业，食物产量+25%',
    primaryBonus: { type: 'food', value: 25 },
  },
  mining_minister: {
    name: '矿务官',
    description: '主管矿产，钢铁产量+25%',
    primaryBonus: { type: 'steel', value: 25 },
  },
  lumber_minister: {
    name: '林务官',
    description: '主管林业，木材产量+25%',
    primaryBonus: { type: 'wood', value: 25 },
  },
  trade_minister: {
    name: '商务官',
    description: '主管商业，金币产量+25%',
    primaryBonus: { type: 'gold', value: 25 },
  },
  defense_commander: {
    name: '防御官',
    description: '主管城防，防御力+20%',
    primaryBonus: { type: 'defense', value: 20 },
  },
  training_commander: {
    name: '训练官',
    description: '主管训练，士兵训练速度+20%',
    primaryBonus: { type: 'training', value: 20 },
  },
  researcher: {
    name: '研究员',
    description: '主管科研，科技研究速度+20%',
    primaryBonus: { type: 'research', value: 20 },
  },
};

export interface CityBuilding {
  id: string;
  name: string;
  type: CityBuildingType;
  level: number;
  maxLevel: number;
  production: ResourceProduction;
  defense: number;
  workers: number;
  maxWorkers: number;
  upgradeCost: ResourceCost;
  upgradeTime: number;
  isUnderConstruction: boolean;
  completionTime?: number;
}

export type CityBuildingType = 
  | 'headquarters'  // 主营
  | 'barracks'      // 兵营
  | 'storage'       // 仓库
  | 'farm'          // 农场
  | 'mine'          // 矿场
  | 'lumbermill'    // 伐木场
  | 'blacksmith'    // 铁匠铺
  | 'wall'          // 城墙
  | 'tower'         // 箭塔
  | 'gate'          // 城门
  | 'training_field' // 训练场
  | 'market';       // 市场

export interface ResourceProduction {
  food: number;
  wood: number;
  steel: number;
  gold: number;
}

export interface ResourceCost {
  food: number;
  wood: number;
  steel: number;
  gold: number;
}

export interface CityDefense {
  wallHealth: number;
  maxWallHealth: number;
  towerCount: number;
  towerDamage: number;
  gateHealth: number;
  defenders: number;
  traps: DefenseTrap[];
}

export interface DefenseTrap {
  id: string;
  type: 'arrow' | 'stone' | 'fire' | 'spike';
  damage: number;
  count: number;
  triggered: number;
}

export interface City {
  id: string;
  name: string;
  faction: FactionType;
  level: number;
  buildings: CityBuilding[];
  defense: CityDefense;
  resources: CityResources;
  governmentHeroes: GovernmentHero[];
  position: { x: number; y: number };
  ownerId: string;
  status: 'peace' | 'under_attack' | 'besieged';
  lastAttackTime?: number;
  createdAt: number;
}

export interface CityResources {
  food: number;
  wood: number;
  steel: number;
  gold: number;
  maxCapacity: number;
}

export interface SiegeResult {
  success: boolean;
  attackerLosses: number;
  defenderLosses: number;
  resourcesPlundered: ResourceProduction;
  wallDamage: number;
  duration: number;
  rewards: {
    experience: number;
    honor: number;
  };
}

export const CITY_CONSTANTS = {
  MAX_CITY_LEVEL: 30,
  BASE_DEFENSE: 1000,
  BASE_STORAGE: 10000,
  
  FACTION_COLORS: {
    human: '#6495ed',
    angel: '#ffd700',
    demon: '#dc143c',
  },
  
  FACTION_STYLES: {
    human: {
      primary: '#2c3e50',
      secondary: '#34495e',
      accent: '#3498db',
      name: 'Human Citadel',
    },
    angel: {
      primary: '#2c2c2c',
      secondary: '#3d3d3d',
      accent: '#f4d03f',
      name: 'Celestial Sanctuary',
    },
    demon: {
      primary: '#1a0a0a',
      secondary: '#2d1515',
      accent: '#e74c3c',
      name: 'Infernal Fortress',
    },
  },
  
  BUILDING_INFO: {
    headquarters: {
      name: '主营',
      maxLevel: 30,
      baseCost: { food: 0, wood: 0, steel: 0, gold: 100 },
      baseProduction: { food: 0, wood: 0, steel: 0, gold: 10 },
    },
    barracks: {
      name: '兵营',
      maxLevel: 20,
      baseCost: { food: 100, wood: 200, steel: 0, gold: 50 },
      baseProduction: { food: 0, wood: 0, steel: 0, gold: 0 },
    },
    storage: {
      name: '仓库',
      maxLevel: 20,
      baseCost: { food: 0, wood: 300, steel: 100, gold: 100 },
      baseProduction: { food: 0, wood: 0, steel: 0, gold: 0 },
    },
    farm: {
      name: '农场',
      maxLevel: 20,
      baseCost: { food: 50, wood: 100, steel: 0, gold: 0 },
      baseProduction: { food: 50, wood: 0, steel: 0, gold: 0 },
    },
    mine: {
      name: '矿场',
      maxLevel: 20,
      baseCost: { food: 50, wood: 100, steel: 0, gold: 0 },
      baseProduction: { food: 0, wood: 0, steel: 30, gold: 0 },
    },
    lumbermill: {
      name: '伐木场',
      maxLevel: 20,
      baseCost: { food: 50, wood: 50, steel: 0, gold: 0 },
      baseProduction: { food: 0, wood: 40, steel: 0, gold: 0 },
    },
    blacksmith: {
      name: '铁匠铺',
      maxLevel: 15,
      baseCost: { food: 100, wood: 200, steel: 100, gold: 100 },
      baseProduction: { food: 0, wood: 0, steel: 0, gold: 20 },
    },
    wall: {
      name: '城墙',
      maxLevel: 20,
      baseCost: { food: 0, wood: 500, steel: 300, gold: 200 },
      baseProduction: { food: 0, wood: 0, steel: 0, gold: 0 },
    },
    tower: {
      name: '箭塔',
      maxLevel: 15,
      baseCost: { food: 0, wood: 300, steel: 200, gold: 150 },
      baseProduction: { food: 0, wood: 0, steel: 0, gold: 0 },
    },
    gate: {
      name: '城门',
      maxLevel: 10,
      baseCost: { food: 0, wood: 200, steel: 150, gold: 100 },
      baseProduction: { food: 0, wood: 0, steel: 0, gold: 0 },
    },
    training_field: {
      name: '训练场',
      maxLevel: 15,
      baseCost: { food: 200, wood: 300, steel: 100, gold: 150 },
      baseProduction: { food: 0, wood: 0, steel: 0, gold: 0 },
    },
    market: {
      name: '市场',
      maxLevel: 15,
      baseCost: { food: 100, wood: 200, steel: 50, gold: 200 },
      baseProduction: { food: 0, wood: 0, steel: 0, gold: 30 },
    },
  },
} as const;

export const getFactionStyle = (faction: FactionType) => CITY_CONSTANTS.FACTION_STYLES[faction];
export const getFactionColor = (faction: FactionType) => CITY_CONSTANTS.FACTION_COLORS[faction];
