import { FactionType } from './hero.types';

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
