// 英雄数据管理器 - 负责英雄数据初始化和基本操作

import type { Hero } from '../../types/slg/hero.types';
import { humanHeroes, angelHeroes, demonHeroes } from '../../config/heroes';
import { generateId } from '../../utils/helpers';

export class HeroDataManager {
    private heroes: Map<string, Hero> = new Map();

    constructor() {
        this.initializeHeroes();
    }

    initializeHeroes(): void {
        const allHeroes = [...humanHeroes, ...angelHeroes, ...demonHeroes];
        allHeroes.forEach(hero => {
            this.heroes.set(hero.id, hero);
        });
        console.log(`已加载 ${allHeroes.length} 个英雄数据`);
    }

    getHero(heroId: string): Hero | undefined {
        return this.heroes.get(heroId);
    }

    getAllHeroes(): Hero[] {
        return Array.from(this.heroes.values());
    }

    getHeroesByFaction(faction: string): Hero[] {
        return this.getAllHeroes().filter(hero => hero.faction === faction);
    }

    getHeroesByQuality(quality: string): Hero[] {
        return this.getAllHeroes().filter(hero => hero.quality === quality);
    }

    createPlayerHero(templateId: string, isNFT: boolean = false): Hero | null {
        const template = this.heroes.get(templateId);
        if (!template) {
            console.error(`英雄模板不存在: ${templateId}`);
            return null;
        }

        const playerHero: Hero = {
            ...template,
            id: generateId(),
            isNFT,
            level: 1,
            experience: 0,
            status: 'idle',
            battleStats: {
                battlesWon: 0,
                battlesLost: 0,
                totalDamage: 0,
                totalHealing: 0,
                criticalHits: 0,
                dodges: 0
            }
        };

        this.heroes.set(playerHero.id, playerHero);
        return playerHero;
    }

    updateHero(hero: Hero): void {
        this.heroes.set(hero.id, hero);
    }

    deleteHero(heroId: string): boolean {
        return this.heroes.delete(heroId);
    }

    heroExists(heroId: string): boolean {
        return this.heroes.has(heroId);
    }

    getHeroCount(): number {
        return this.heroes.size;
    }
}
