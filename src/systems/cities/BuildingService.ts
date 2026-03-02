// 建筑服务 - 负责建筑相关计算和管理

import { CityBuilding, CityBuildingType, City, ResourceProduction, ResourceCost, CityResources } from '../../types/slg/city.types';
import { generateId } from '../../utils/helpers';

export class BuildingService {
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

    upgradeBuilding(
        city: City,
        buildingType: CityBuildingType,
        hasEnoughResources: (resources: CityResources, cost: ResourceCost) => boolean,
        consumeResources: (resources: CityResources, cost: ResourceCost) => void,
        calculateProduction: (type: CityBuildingType, level: number) => ResourceProduction,
        calculateDefense: (type: CityBuildingType, level: number) => number,
        calculateUpgradeCost: (type: CityBuildingType, level: number) => ResourceCost,
        calculateUpgradeTime: (type: CityBuildingType, level: number) => number,
        _getMaxWorkers: (type: CityBuildingType) => number
    ): { success: boolean; error?: string } {
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

        const cost = calculateUpgradeCost(buildingType, building.level + 1);
        if (!hasEnoughResources(city.resources, cost)) {
            return { success: false, error: '资源不足' };
        }

        consumeResources(city.resources, cost);
        
        building.level++;
        building.production = calculateProduction(buildingType, building.level);
        building.defense = calculateDefense(buildingType, building.level);
        building.upgradeCost = calculateUpgradeCost(buildingType, building.level + 1);
        building.upgradeTime = calculateUpgradeTime(buildingType, building.level);

        console.log(`建筑升级: ${building.name} -> Lv.${building.level}`);
        return { success: true };
    }

    addBuilding(
        city: City,
        type: CityBuildingType,
        buildingInfo: { name: string; maxLevel: number; baseProduction: ResourceProduction; baseCost: ResourceCost },
        hasEnoughResources: (resources: CityResources, cost: ResourceCost) => boolean,
        consumeResources: (resources: CityResources, cost: ResourceCost) => void,
        calculateProduction: (type: CityBuildingType, level: number) => ResourceProduction,
        calculateDefense: (type: CityBuildingType, level: number) => number,
        calculateUpgradeCost: (type: CityBuildingType, level: number) => ResourceCost,
        calculateUpgradeTime: (type: CityBuildingType, level: number) => number,
        getMaxWorkers: (type: CityBuildingType) => number
    ): { success: boolean; error?: string } {
        const existing = city.buildings.find(b => b.type === type);
        if (existing) {
            return { success: false, error: '该建筑已存在' };
        }

        const cost = calculateUpgradeCost(type, 1);
        if (!hasEnoughResources(city.resources, cost)) {
            return { success: false, error: '资源不足' };
        }

        consumeResources(city.resources, cost);

        const building: CityBuilding = {
            id: generateId(),
            name: buildingInfo.name,
            type,
            level: 1,
            maxLevel: buildingInfo.maxLevel,
            production: calculateProduction(type, 1),
            defense: calculateDefense(type, 1),
            workers: 0,
            maxWorkers: getMaxWorkers(type),
            upgradeCost: calculateUpgradeCost(type, 2),
            upgradeTime: calculateUpgradeTime(type, 1),
            isUnderConstruction: false,
        };

        city.buildings.push(building);
        return { success: true };
    }
}
