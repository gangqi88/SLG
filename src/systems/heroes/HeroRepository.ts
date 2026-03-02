// 英雄数据仓库 - 负责数据持久化

import type { Hero } from '../../types/slg/hero.types';
import type { GameState } from '../../types/game.types';
import { saveGame, loadGame } from '../../utils/storage';

export class HeroRepository {
    save(heroes: Map<string, Hero>, playerHeroIds: string[]): void {
        const heroesData: Record<string, Hero> = {};
        
        playerHeroIds.forEach(heroId => {
            const hero = heroes.get(heroId);
            if (hero) {
                heroesData[heroId] = hero;
            }
        });

        const gameData = loadGame() || this.getDefaultGameData();
        gameData.playerHeroes = playerHeroIds;
        gameData.heroes = heroesData;
        
        saveGame(gameData);
    }

    load(): { heroes: Map<string, Hero>; playerHeroIds: string[] } {
        const heroes = new Map<string, Hero>();
        let playerHeroIds: string[] = [];
        
        const savedData = loadGame();
        
        if (savedData?.playerHeroes) {
            playerHeroIds = savedData.playerHeroes;
            
            if (savedData.heroes) {
                Object.entries(savedData.heroes).forEach(([id, heroData]) => {
                    const hero = heroData as Hero;
                    heroes.set(id, hero);
                });
            }
        }
        
        return { heroes, playerHeroIds };
    }

    private getDefaultGameData(): GameState {
        return {
            resources: {
                food: { type: 'food', amount: 100, capacity: 1000, productionRate: 0, consumptionRate: 0 },
                wood: { type: 'wood', amount: 100, capacity: 1000, productionRate: 0, consumptionRate: 0 },
                steel: { type: 'steel', amount: 50, capacity: 1000, productionRate: 0, consumptionRate: 0 },
                electricity: { type: 'electricity', amount: 0, capacity: 1000, productionRate: 0, consumptionRate: 0 },
                fuel: { type: 'fuel', amount: 0, capacity: 1000, productionRate: 0, consumptionRate: 0 }
            },
            buildings: [],
            survivors: [],
            time: { day: 1, hour: 8, minute: 0, season: 'winter', temperature: -10 },
            gameStats: { 
                daysSurvived: 1, 
                totalSurvivorsRescued: 0, 
                totalResourcesCollected: { food: 0, wood: 0, steel: 0, electricity: 0, fuel: 0 }, 
                buildingsConstructed: 0 
            },
            difficulty: 'normal'
        };
    }
}
