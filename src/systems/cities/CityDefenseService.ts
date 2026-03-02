// 城市防御服务 - 负责城市防御和围攻计算

import { City, CityResources, ResourceProduction, SiegeResult } from '../../types/slg/city.types';

export class CityDefenseService {
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

    calculateCityPower(city: City, calculateTotalProduction: (city: City) => ResourceProduction): number {
        const defense = this.calculateCityDefense(city);
        const production = calculateTotalProduction(city);
        const productionPower = production.food + production.wood + production.steel + production.gold;
        
        return defense + Math.floor(productionPower * 0.5) + city.level * 100;
    }

    startSiege(city: City | undefined, attackerPower: number): SiegeResult {
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

    repairWall(
        city: City,
        hasEnoughResources: (resources: CityResources, cost: ResourceProduction) => boolean,
        consumeResources: (resources: CityResources, cost: ResourceProduction) => void
    ): { success: boolean; error?: string } {
        const damage = city.defense.maxWallHealth - city.defense.wallHealth;
        if (damage <= 0) {
            return { success: false, error: '城墙无需修复' };
        }

        const repairCost: ResourceProduction = {
            food: 0,
            wood: Math.floor(damage * 0.5),
            steel: Math.floor(damage * 0.3),
            gold: Math.floor(damage * 0.2),
        };

        if (!hasEnoughResources(city.resources, repairCost)) {
            return { success: false, error: '资源不足' };
        }

        consumeResources(city.resources, repairCost);
        city.defense.wallHealth = city.defense.maxWallHealth;

        return { success: true };
    }

    addResources(city: City, resources: Partial<CityResources>): void {
        if (resources.food) city.resources.food = Math.min(city.resources.food + resources.food, city.resources.maxCapacity);
        if (resources.wood) city.resources.wood = Math.min(city.resources.wood + resources.wood, city.resources.maxCapacity);
        if (resources.steel) city.resources.steel = Math.min(city.resources.steel + resources.steel, city.resources.maxCapacity);
        if (resources.gold) city.resources.gold += resources.gold;
    }
}
