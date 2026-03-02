import { FactionType } from '../types/slg/hero.types';
import { City, CityBuildingType, CityResources, ResourceProduction, ResourceCost, SiegeResult, GovernmentHero, GovernmentPosition, CITY_CONSTANTS } from '../types/slg/city.types';
import { CityDataManager, BuildingService, CityDefenseService, CityGovernmentService } from './cities';

export class CitySystem {
    private static instance: CitySystem;
    
    private dataManager: CityDataManager;
    private buildingService: BuildingService;
    private defenseService: CityDefenseService;
    private governmentService: CityGovernmentService;

    private constructor() {
        this.dataManager = new CityDataManager();
        this.buildingService = new BuildingService();
        this.defenseService = new CityDefenseService();
        this.governmentService = new CityGovernmentService();
    }

    static getInstance(): CitySystem {
        if (!CitySystem.instance) {
            CitySystem.instance = new CitySystem();
        }
        return CitySystem.instance;
    }

    createCity(name: string, faction: FactionType, ownerId: string, x: number = 0, y: number = 0): City {
        return this.dataManager.createCity(name, faction, ownerId, x, y);
    }

    getCity(cityId: string): City | undefined {
        return this.dataManager.getCity(cityId);
    }

    getAllCities(): City[] {
        return this.dataManager.getAllCities();
    }

    getCitiesByFaction(faction: FactionType): City[] {
        return this.dataManager.getCitiesByFaction(faction);
    }

    getCitiesByOwner(ownerId: string): City[] {
        return this.dataManager.getCitiesByOwner(ownerId);
    }

    upgradeBuilding(cityId: string, buildingType: CityBuildingType): { success: boolean; error?: string } {
        const city = this.dataManager.getCity(cityId);
        if (!city) {
            return { success: false, error: '城市不存在' };
        }

        return this.buildingService.upgradeBuilding(
            city,
            buildingType,
            (resources, cost) => this.dataManager.hasEnoughResources(resources, cost),
            (resources, cost) => this.dataManager.consumeResources(resources, cost),
            (type, level) => this.dataManager.calculateProduction(type, level),
            (type, level) => this.dataManager.calculateBuildingDefense(type, level),
            (type, level) => this.dataManager.calculateUpgradeCost(type, level),
            (type, level) => this.dataManager.calculateUpgradeTime(type, level),
            (type) => this.dataManager.getMaxWorkers(type)
        );
    }

    addBuilding(cityId: string, type: CityBuildingType): { success: boolean; error?: string } {
        const city = this.dataManager.getCity(cityId);
        if (!city) {
            return { success: false, error: '城市不存在' };
        }

        const info = CITY_CONSTANTS.BUILDING_INFO[type];
        return this.buildingService.addBuilding(
            city,
            type,
            info,
            (resources, cost) => this.dataManager.hasEnoughResources(resources, cost),
            (resources, cost) => this.dataManager.consumeResources(resources, cost),
            (type, level) => this.dataManager.calculateProduction(type, level),
            (type, level) => this.dataManager.calculateBuildingDefense(type, level),
            (type, level) => this.dataManager.calculateUpgradeCost(type, level),
            (type, level) => this.dataManager.calculateUpgradeTime(type, level),
            (type) => this.dataManager.getMaxWorkers(type)
        );
    }

    calculateTotalProduction(city: City): ResourceProduction {
        return this.buildingService.calculateTotalProduction(city);
    }

    calculateCityDefense(city: City): number {
        return this.defenseService.calculateCityDefense(city);
    }

    calculateCityPower(city: City): number {
        return this.defenseService.calculateCityPower(city, (c) => this.buildingService.calculateTotalProduction(c));
    }

    startSiege(attackerPower: number, defenderCityId: string): SiegeResult {
        const city = this.dataManager.getCity(defenderCityId);
        return this.defenseService.startSiege(city, attackerPower);
    }

    repairWall(cityId: string): { success: boolean; error?: string } {
        const city = this.dataManager.getCity(cityId);
        if (!city) {
            return { success: false, error: '城市不存在' };
        }

        return this.defenseService.repairWall(
            city,
            (resources, cost) => this.dataManager.hasEnoughResources(resources, cost as ResourceCost),
            (resources, cost) => this.dataManager.consumeResources(resources, cost as ResourceCost)
        );
    }

    addResources(cityId: string, resources: Partial<CityResources>): void {
        const city = this.dataManager.getCity(cityId);
        if (!city) return;
        this.defenseService.addResources(city, resources);
    }

    assignGovernmentHero(cityId: string, heroId: string, position: GovernmentPosition): { success: boolean; error?: string } {
        const city = this.dataManager.getCity(cityId);
        if (!city) {
            return { success: false, error: '城市不存在' };
        }
        return this.governmentService.assignHero(city, heroId, position);
    }

    removeGovernmentHero(cityId: string, heroId: string): { success: boolean; error?: string } {
        const city = this.dataManager.getCity(cityId);
        if (!city) {
            return { success: false, error: '城市不存在' };
        }
        return this.governmentService.removeHero(city, heroId);
    }

    calculateGovernmentBonus(city: City): ResourceProduction & { defense: number; training: number; research: number } {
        return this.governmentService.calculateBonus(city);
    }

    getGovernmentHeroes(cityId: string): GovernmentHero[] {
        const city = this.dataManager.getCity(cityId);
        return city?.governmentHeroes || [];
    }

    getAvailablePositions(cityId: string): GovernmentPosition[] {
        const city = this.dataManager.getCity(cityId);
        if (!city) return [];
        return this.governmentService.getAvailablePositions(city);
    }
}

export const citySystem = CitySystem.getInstance();
