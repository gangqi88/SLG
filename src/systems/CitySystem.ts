import { 
  City, 
  CityBuilding, 
  CityBuildingType, 
  CityDefense, 
  CityResources,
  ResourceProduction,
  ResourceCost,
  SiegeResult,
  CITY_CONSTANTS,
  getFactionStyle
} from '../types/slg/city.types';
import { FactionType } from '../types/slg/hero.types';
import { generateId } from '../utils/helpers';

export class CitySystem {
  private cities: Map<string, City> = new Map();
  private static instance: CitySystem;

  private constructor() {}

  static getInstance(): CitySystem {
    if (!CitySystem.instance) {
      CitySystem.instance = new CitySystem();
    }
    return CitySystem.instance;
  }

  createCity(name: string, faction: FactionType, ownerId: string, x: number = 0, y: number = 0): City {
    const city: City = {
      id: generateId(),
      name,
      faction,
      level: 1,
      buildings: this.createInitialBuildings(faction),
      defense: this.createInitialDefense(faction),
      resources: this.createInitialResources(),
      position: { x, y },
      ownerId,
      status: 'peace',
      createdAt: Date.now(),
    };

    this.cities.set(city.id, city);
    return city;
  }

  private createInitialBuildings(faction: FactionType): CityBuilding[] {
    const buildings: CityBuilding[] = [];
    getFactionStyle(faction);

    const initialTypes: CityBuildingType[] = ['headquarters', 'barracks', 'storage', 'farm', 'mine', 'lumbermill'];

    initialTypes.forEach((type) => {
      const info = CITY_CONSTANTS.BUILDING_INFO[type];
      buildings.push({
        id: generateId(),
        name: info.name,
        type,
        level: type === 'headquarters' ? 1 : 1,
        maxLevel: info.maxLevel,
        production: this.calculateProduction(type, 1),
        defense: this.calculateBuildingDefense(type, 1),
        workers: 0,
        maxWorkers: this.getMaxWorkers(type),
        upgradeCost: this.calculateUpgradeCost(type, 2),
        upgradeTime: this.calculateUpgradeTime(type, 1),
        isUnderConstruction: false,
      });
    });

    return buildings;
  }

  private createInitialDefense(_faction: FactionType): CityDefense {
    const baseHealth = CITY_CONSTANTS.BASE_DEFENSE;
    return {
      wallHealth: baseHealth,
      maxWallHealth: baseHealth,
      towerCount: 0,
      towerDamage: 0,
      gateHealth: baseHealth * 0.3,
      defenders: 0,
      traps: [],
    };
  }

  private createInitialResources(): CityResources {
    return {
      food: 1000,
      wood: 1000,
      steel: 500,
      gold: 500,
      maxCapacity: CITY_CONSTANTS.BASE_STORAGE,
    };
  }

  private calculateProduction(type: CityBuildingType, level: number): ResourceProduction {
    const info = CITY_CONSTANTS.BUILDING_INFO[type];
    const multiplier = Math.pow(1.2, level - 1);
    
    return {
      food: Math.floor(info.baseProduction.food * multiplier),
      wood: Math.floor(info.baseProduction.wood * multiplier),
      steel: Math.floor(info.baseProduction.steel * multiplier),
      gold: Math.floor(info.baseProduction.gold * multiplier),
    };
  }

  private calculateUpgradeCost(type: CityBuildingType, level: number): ResourceCost {
    const info = CITY_CONSTANTS.BUILDING_INFO[type];
    const multiplier = Math.pow(1.5, level - 1);
    
    return {
      food: Math.floor(info.baseCost.food * multiplier),
      wood: Math.floor(info.baseCost.wood * multiplier),
      steel: Math.floor(info.baseCost.steel * multiplier),
      gold: Math.floor(info.baseCost.gold * multiplier),
    };
  }

  private calculateUpgradeTime(type: CityBuildingType, level: number): number {
    const baseTimes: Record<CityBuildingType, number> = {
      headquarters: 3600,
      barracks: 1800,
      storage: 1200,
      farm: 600,
      mine: 900,
      lumbermill: 600,
      blacksmith: 1500,
      wall: 2400,
      tower: 1800,
      gate: 1200,
      training_field: 1800,
      market: 1200,
    };
    return baseTimes[type] * level;
  }

  private calculateBuildingDefense(type: CityBuildingType, level: number): number {
    const baseDefense: Record<CityBuildingType, number> = {
      headquarters: 100,
      barracks: 50,
      storage: 80,
      farm: 20,
      mine: 30,
      lumbermill: 20,
      blacksmith: 40,
      wall: 500,
      tower: 200,
      gate: 300,
      training_field: 50,
      market: 30,
    };
    return baseDefense[type] * level;
  }

  private getMaxWorkers(type: CityBuildingType): number {
    const workers: Record<CityBuildingType, number> = {
      headquarters: 10,
      barracks: 20,
      storage: 5,
      farm: 15,
      mine: 15,
      lumbermill: 15,
      blacksmith: 10,
      wall: 0,
      tower: 0,
      gate: 0,
      training_field: 15,
      market: 10,
    };
    return workers[type];
  }

  getCity(cityId: string): City | undefined {
    return this.cities.get(cityId);
  }

  getAllCities(): City[] {
    return Array.from(this.cities.values());
  }

  getCitiesByFaction(faction: FactionType): City[] {
    return Array.from(this.cities.values()).filter(city => city.faction === faction);
  }

  getCitiesByOwner(ownerId: string): City[] {
    return Array.from(this.cities.values()).filter(city => city.ownerId === ownerId);
  }

  upgradeBuilding(cityId: string, buildingType: CityBuildingType): { success: boolean; error?: string } {
    const city = this.cities.get(cityId);
    if (!city) {
      return { success: false, error: '城市不存在' };
    }

    const building = city.buildings.find(b => b.type === buildingType);
    if (!building) {
      return { success: false, error: '建筑不存在' };
    }

    if (building.isUnderConstruction) {
      return { success: false, error: '建筑正在建造中' };
    }

    if (building.level >= building.maxLevel) {
      return { success: false, error: '建筑已达最高等级' };
    }

    const cost = this.calculateUpgradeCost(buildingType, building.level + 1);
    if (!this.hasEnoughResources(city.resources, cost)) {
      return { success: false, error: '资源不足' };
    }

    this.consumeResources(city.resources, cost);
    
    building.level++;
    building.production = this.calculateProduction(buildingType, building.level);
    building.defense = this.calculateBuildingDefense(buildingType, building.level);
    building.upgradeCost = this.calculateUpgradeCost(buildingType, building.level + 1);
    building.upgradeTime = this.calculateUpgradeTime(buildingType, building.level);

    console.log(`建筑升级: ${building.name} -> Lv.${building.level}`);
    return { success: true };
  }

  private hasEnoughResources(resources: CityResources, cost: ResourceCost): boolean {
    return resources.food >= cost.food && 
           resources.wood >= cost.wood && 
           resources.steel >= cost.steel && 
           resources.gold >= cost.gold;
  }

  private consumeResources(resources: CityResources, cost: ResourceCost): void {
    resources.food -= cost.food;
    resources.wood -= cost.wood;
    resources.steel -= cost.steel;
    resources.gold -= cost.gold;
  }

  addBuilding(cityId: string, type: CityBuildingType): { success: boolean; error?: string } {
    const city = this.cities.get(cityId);
    if (!city) {
      return { success: false, error: '城市不存在' };
    }

    const existing = city.buildings.find(b => b.type === type);
    if (existing) {
      return { success: false, error: '该建筑已存在' };
    }

    const info = CITY_CONSTANTS.BUILDING_INFO[type];
    const cost = this.calculateUpgradeCost(type, 1);

    if (!this.hasEnoughResources(city.resources, cost)) {
      return { success: false, error: '资源不足' };
    }

    this.consumeResources(city.resources, cost);

    const building: CityBuilding = {
      id: generateId(),
      name: info.name,
      type,
      level: 1,
      maxLevel: info.maxLevel,
      production: this.calculateProduction(type, 1),
      defense: this.calculateBuildingDefense(type, 1),
      workers: 0,
      maxWorkers: this.getMaxWorkers(type),
      upgradeCost: this.calculateUpgradeCost(type, 2),
      upgradeTime: this.calculateUpgradeTime(type, 1),
      isUnderConstruction: false,
    };

    city.buildings.push(building);
    return { success: true };
  }

  calculateTotalProduction(city: City): ResourceProduction {
    const total: ResourceProduction = { food: 0, wood: 0, steel: 0, gold: 0 };
    
    city.buildings.forEach(building => {
      if (!building.isUnderConstruction && building.workers > 0) {
        const workerMultiplier = 1 + (building.workers / building.maxWorkers) * 0.5;
        total.food += Math.floor(building.production.food * workerMultiplier);
        total.wood += Math.floor(building.production.wood * workerMultiplier);
        total.steel += Math.floor(building.production.steel * workerMultiplier);
        total.gold += Math.floor(building.production.gold * workerMultiplier);
      }
    });

    return total;
  }

  calculateCityDefense(city: City): number {
    let defense = 0;
    
    city.buildings.forEach(building => {
      defense += building.defense;
    });

    defense += city.defense.wallHealth;
    defense += city.defense.towerCount * city.defense.towerDamage;
    defense += city.defense.defenders * 10;

    return defense;
  }

  calculateCityPower(city: City): number {
    const defense = this.calculateCityDefense(city);
    const production = this.calculateTotalProduction(city);
    const productionPower = production.food + production.wood + production.steel + production.gold;
    
    return defense + Math.floor(productionPower * 0.5) + city.level * 100;
  }

  startSiege(attackerPower: number, defenderCityId: string): SiegeResult {
    const city = this.cities.get(defenderCityId);
    if (!city) {
      return {
        success: false,
        attackerLosses: 0,
        defenderLosses: 0,
        resourcesPlundered: { food: 0, wood: 0, steel: 0, gold: 0 },
        wallDamage: 0,
        duration: 0,
        rewards: { experience: 0, honor: 0 },
      };
    }

    const defenderPower = this.calculateCityDefense(city);
    const powerRatio = attackerPower / defenderPower;
    
    const winProbability = powerRatio / (powerRatio + 1);
    const isWin = Math.random() < winProbability;

    let attackerLosses = 0;
    let defenderLosses = 0;
    let wallDamage = 0;
    const resourcesPlundered: ResourceProduction = { food: 0, wood: 0, steel: 0, gold: 0 };

    if (isWin) {
      attackerLosses = Math.floor(attackerPower * 0.1 * (1 - winProbability));
      defenderLosses = Math.floor(defenderPower * 0.3);
      wallDamage = Math.floor(defenderPower * 0.2);
      
      const plunderRate = 0.3;
      resourcesPlundered.food = Math.floor(city.resources.food * plunderRate);
      resourcesPlundered.wood = Math.floor(city.resources.wood * plunderRate);
      resourcesPlundered.steel = Math.floor(city.resources.steel * plunderRate);
      resourcesPlundered.gold = Math.floor(city.resources.gold * plunderRate);

      city.resources.food -= resourcesPlundered.food;
      city.resources.wood -= resourcesPlundered.wood;
      city.resources.steel -= resourcesPlundered.steel;
      city.resources.gold -= resourcesPlundered.gold;

      city.defense.wallHealth -= wallDamage;
      city.status = 'peace';
      city.lastAttackTime = Date.now();
    } else {
      attackerLosses = Math.floor(attackerPower * 0.5);
      defenderLosses = Math.floor(defenderPower * 0.05);
    }

    return {
      success: isWin,
      attackerLosses,
      defenderLosses,
      resourcesPlundered,
      wallDamage,
      duration: Math.floor(30000 + Math.random() * 60000),
      rewards: {
        experience: isWin ? Math.floor(attackerPower * 0.1) : Math.floor(attackerPower * 0.02),
        honor: isWin ? Math.floor(attackerPower * 0.05) : 0,
      },
    };
  }

  repairWall(cityId: string): { success: boolean; error?: string } {
    const city = this.cities.get(cityId);
    if (!city) {
      return { success: false, error: '城市不存在' };
    }

    const damage = city.defense.maxWallHealth - city.defense.wallHealth;
    if (damage <= 0) {
      return { success: false, error: '城墙无需修复' };
    }

    const repairCost = {
      food: 0,
      wood: Math.floor(damage * 0.5),
      steel: Math.floor(damage * 0.3),
      gold: Math.floor(damage * 0.2),
    };

    if (!this.hasEnoughResources(city.resources, repairCost)) {
      return { success: false, error: '资源不足' };
    }

    this.consumeResources(city.resources, repairCost);
    city.defense.wallHealth = city.defense.maxWallHealth;

    return { success: true };
  }

  addResources(cityId: string, resources: Partial<CityResources>): void {
    const city = this.cities.get(cityId);
    if (!city) return;

    if (resources.food) city.resources.food = Math.min(city.resources.food + resources.food, city.resources.maxCapacity);
    if (resources.wood) city.resources.wood = Math.min(city.resources.wood + resources.wood, city.resources.maxCapacity);
    if (resources.steel) city.resources.steel = Math.min(city.resources.steel + resources.steel, city.resources.maxCapacity);
    if (resources.gold) city.resources.gold += resources.gold;
  }
}

export const citySystem = CitySystem.getInstance();
