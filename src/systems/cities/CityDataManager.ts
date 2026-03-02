// 城市数据管理器 - 负责城市基本数据操作

import { City, CityBuilding, CityBuildingType, CityDefense, CityResources, CITY_CONSTANTS } from '../../types/slg/city.types';
import { FactionType } from '../../types/slg/hero.types';
import { generateId } from '../../utils/helpers';

export class CityDataManager {
    private cities: Map<string, City> = new Map();

    createCity(name: string, faction: FactionType, ownerId: string, x: number = 0, y: number = 0): City {
        const city: City = {
            id: generateId(),
            name,
            faction,
            level: 1,
            buildings: this.createInitialBuildings(faction),
            defense: this.createInitialDefense(faction),
            resources: this.createInitialResources(),
            governmentHeroes: [],
            position: { x, y },
            ownerId,
            status: 'peace',
            createdAt: Date.now(),
        };

        this.cities.set(city.id, city);
        return city;
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

    private createInitialBuildings(_faction: FactionType): CityBuilding[] {
        const buildings: CityBuilding[] = [];
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

    calculateProduction(type: CityBuildingType, level: number): { food: number; wood: number; steel: number; gold: number } {
        const info = CITY_CONSTANTS.BUILDING_INFO[type];
        const multiplier = Math.pow(1.2, level - 1);
        
        return {
            food: Math.floor(info.baseProduction.food * multiplier),
            wood: Math.floor(info.baseProduction.wood * multiplier),
            steel: Math.floor(info.baseProduction.steel * multiplier),
            gold: Math.floor(info.baseProduction.gold * multiplier),
        };
    }

    calculateUpgradeCost(type: CityBuildingType, level: number): { food: number; wood: number; steel: number; gold: number } {
        const info = CITY_CONSTANTS.BUILDING_INFO[type];
        const multiplier = Math.pow(1.5, level - 1);
        
        return {
            food: Math.floor(info.baseCost.food * multiplier),
            wood: Math.floor(info.baseCost.wood * multiplier),
            steel: Math.floor(info.baseCost.steel * multiplier),
            gold: Math.floor(info.baseCost.gold * multiplier),
        };
    }

    calculateUpgradeTime(type: CityBuildingType, level: number): number {
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

    calculateBuildingDefense(type: CityBuildingType, level: number): number {
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

    getMaxWorkers(type: CityBuildingType): number {
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

    hasEnoughResources(resources: CityResources, cost: { food: number; wood: number; steel: number; gold: number }): boolean {
        return resources.food >= cost.food && 
               resources.wood >= cost.wood && 
               resources.steel >= cost.steel && 
               resources.gold >= cost.gold;
    }

    consumeResources(resources: CityResources, cost: { food: number; wood: number; steel: number; gold: number }): void {
        resources.food -= cost.food;
        resources.wood -= cost.wood;
        resources.steel -= cost.steel;
        resources.gold -= cost.gold;
    }
}
