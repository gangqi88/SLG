// 城市政府服务 - 负责官员任命和加成计算

import { City, GovernmentHero, GovernmentPosition, GOVERNMENT_POSITIONS, ResourceProduction } from '../../types/slg/city.types';

export class CityGovernmentService {
    assignHero(city: City, heroId: string, position: GovernmentPosition): { success: boolean; error?: string } {
        const existingHero = city.governmentHeroes.find(h => h.heroId === heroId);
        if (existingHero) {
            return { success: false, error: '该英雄已在城中任职' };
        }

        const existingPosition = city.governmentHeroes.find(h => h.position === position);
        if (existingPosition) {
            return { success: false, error: '该职位已有英雄担任' };
        }

        const governmentHero: GovernmentHero = {
            heroId,
            position,
            assignedAt: Date.now(),
            bonusLevel: 1,
        };

        city.governmentHeroes.push(governmentHero);
        console.log(`英雄 ${heroId} 任命为 ${GOVERNMENT_POSITIONS[position].name}`);
        return { success: true };
    }

    removeHero(city: City, heroId: string): { success: boolean; error?: string } {
        const index = city.governmentHeroes.findIndex(h => h.heroId === heroId);
        if (index === -1) {
            return { success: false, error: '该英雄未在城中任职' };
        }

        city.governmentHeroes.splice(index, 1);
        console.log(`英雄 ${heroId} 解除职位`);
        return { success: true };
    }

    calculateBonus(city: City): ResourceProduction & { defense: number; training: number; research: number } {
        const baseBonus: ResourceProduction & { defense: number; training: number; research: number } = {
            food: 0,
            wood: 0,
            steel: 0,
            gold: 0,
            defense: 0,
            training: 0,
            research: 0,
        };

        city.governmentHeroes.forEach(hero => {
            const positionInfo = GOVERNMENT_POSITIONS[hero.position];
            const bonusValue = positionInfo.primaryBonus.value * hero.bonusLevel;
            const bonusType = positionInfo.primaryBonus.type;

            if (bonusType === 'all') {
                baseBonus.food += bonusValue;
                baseBonus.wood += bonusValue;
                baseBonus.steel += bonusValue;
                baseBonus.gold += bonusValue;
            } else if (bonusType === 'food') {
                baseBonus.food += bonusValue;
            } else if (bonusType === 'wood') {
                baseBonus.wood += bonusValue;
            } else if (bonusType === 'steel') {
                baseBonus.steel += bonusValue;
            } else if (bonusType === 'gold') {
                baseBonus.gold += bonusValue;
            } else if (bonusType === 'defense') {
                baseBonus.defense += bonusValue;
            } else if (bonusType === 'training') {
                baseBonus.training += bonusValue;
            } else if (bonusType === 'research') {
                baseBonus.research += bonusValue;
            }
        });

        return baseBonus;
    }

    getHeroes(city: City): GovernmentHero[] {
        return city.governmentHeroes;
    }

    getAvailablePositions(city: City): GovernmentPosition[] {
        const allPositions: GovernmentPosition[] = [
            'governor', 'farm_minister', 'mining_minister', 
            'lumber_minister', 'trade_minister', 
            'defense_commander', 'training_commander', 'researcher'
        ];

        const occupiedPositions = city.governmentHeroes.map(h => h.position);
        return allPositions.filter(p => !occupiedPositions.includes(p));
    }
}
