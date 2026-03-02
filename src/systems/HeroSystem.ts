// 英雄系统 - Facade模式入口
// 委托给专用服务类处理具体业务逻辑

import type { 
    Hero, 
    HeroUpgradeResult, 
    HeroEvolveResult, 
    HeroFilterOptions, 
    HeroSortOptions, 
    HeroStatistics,
    Equipment 
} from '../types/slg/hero.types';
import { 
    HeroDataManager, 
    HeroUpgradeService, 
    HeroPowerCalculator, 
    HeroRepository 
} from './heroes';

export class HeroSystem {
    private dataManager: HeroDataManager;
    private upgradeService: HeroUpgradeService;
    private powerCalculator: HeroPowerCalculator;
    private repository: HeroRepository;
    private playerHeroes: string[] = [];

    constructor() {
        this.dataManager = new HeroDataManager();
        this.upgradeService = new HeroUpgradeService();
        this.powerCalculator = new HeroPowerCalculator();
        this.repository = new HeroRepository();
        
        this.loadPlayerHeroes();
    }

    private loadPlayerHeroes(): void {
        const { heroes, playerHeroIds } = this.repository.load();
        playerHeroIds.forEach(id => {
            if (!this.dataManager.heroExists(id)) {
                this.dataManager.updateHero(heroes.get(id)!);
            }
        });
        this.playerHeroes = playerHeroIds;
    }

    private savePlayerHeroes(): void {
        this.repository.save(this.getHeroesMap(), this.playerHeroes);
    }

    private getHeroesMap(): Map<string, Hero> {
        const map = new Map<string, Hero>();
        this.playerHeroes.forEach(id => {
            const hero = this.dataManager.getHero(id);
            if (hero) map.set(id, hero);
        });
        return map;
    }

    getHero(heroId: string): Hero | undefined {
        return this.dataManager.getHero(heroId);
    }

    getAllHeroes(): Hero[] {
        return this.dataManager.getAllHeroes();
    }

    getPlayerHeroes(): Hero[] {
        return this.playerHeroes
            .map(id => this.dataManager.getHero(id))
            .filter((hero): hero is Hero => hero !== undefined);
    }

    addHeroToPlayer(heroId: string, isNFT: boolean = false): boolean {
        if (this.playerHeroes.includes(heroId)) {
            console.warn(`已拥有英雄: ${heroId}`);
            return false;
        }

        const playerHero = this.dataManager.createPlayerHero(heroId, isNFT);
        if (!playerHero) return false;

        this.playerHeroes.push(playerHero.id);
        this.savePlayerHeroes();
        
        console.log(`添加英雄到玩家收藏: ${playerHero.name} (${playerHero.id})`);
        return true;
    }

    upgradeHero(heroId: string, experienceToAdd: number): HeroUpgradeResult {
        const hero = this.dataManager.getHero(heroId);
        if (!hero) {
            return { success: false, error: '英雄不存在' };
        }

        const result = this.upgradeService.upgrade(hero, experienceToAdd);
        
        if (result.success) {
            this.dataManager.updateHero(hero);
            this.savePlayerHeroes();
        }
        
        return result;
    }

    evolveHero(heroId: string): HeroEvolveResult {
        const hero = this.dataManager.getHero(heroId);
        if (!hero) {
            return { success: false, error: '英雄不存在' };
        }

        try {
            if (hero.quality === 'purple' && hero.stars >= 3) {
                hero.quality = 'orange';
                console.log(`英雄 ${hero.name} 进化为橙将`);
            } else if (hero.quality === 'orange' && hero.stars >= 4) {
                hero.quality = 'red';
                console.log(`英雄 ${hero.name} 进化为红将`);
            } else {
                return { success: false, error: '不满足进化条件' };
            }

            this.dataManager.updateHero(hero);
            this.savePlayerHeroes();

            return {
                success: true,
                newQuality: hero.quality,
                newStars: hero.stars,
                consumedMaterials: {
                    heroSoul: hero.quality === 'orange' ? 800 : 2000,
                    factionCore: hero.quality === 'red' ? 100 : 0,
                    duplicateCards: 0
                }
            };
        } catch (error) {
            console.error('英雄进化失败:', error);
            return { success: false, error: '进化过程出错' };
        }
    }

    calculateHeroPower(hero: Hero): number {
        return this.powerCalculator.calculate(hero);
    }

    filterHeroes(heroes: Hero[], filters: HeroFilterOptions): Hero[] {
        return heroes.filter(hero => {
            if (filters.factions?.length && !filters.factions.includes(hero.faction)) return false;
            if (filters.qualities?.length && !filters.qualities.includes(hero.quality)) return false;
            if (filters.stars?.length && !filters.stars.includes(hero.stars)) return false;
            if (filters.isNFT !== undefined && hero.isNFT !== filters.isNFT) return false;
            if (filters.powers?.length) {
                const power = this.calculateHeroPower(hero);
                if (power < filters.powers[0] || power > filters.powers[1]) return false;
            }
            if (filters.searchText) {
                const searchLower = filters.searchText.toLowerCase();
                if (!hero.name.toLowerCase().includes(searchLower) && 
                    !hero.lore.toLowerCase().includes(searchLower)) {
                    return false;
                }
            }
            return true;
        });
    }

    sortHeroes(heroes: Hero[], options: HeroSortOptions): Hero[] {
        return [...heroes].sort((a, b) => {
            let aValue: number;
            let bValue: number;
            
            switch (options.field) {
                case 'level':
                    aValue = a.level;
                    bValue = b.level;
                    break;
                case 'power':
                    aValue = this.calculateHeroPower(a);
                    bValue = this.calculateHeroPower(b);
                    break;
                case 'quality':
                    aValue = a.quality === 'purple' ? 1 : a.quality === 'orange' ? 2 : 3;
                    bValue = b.quality === 'purple' ? 1 : b.quality === 'orange' ? 2 : 3;
                    break;
                case 'stars':
                    aValue = a.stars;
                    bValue = b.stars;
                    break;
                default:
                    aValue = a.level;
                    bValue = b.level;
            }
            
            return options.order === 'desc' ? bValue - aValue : aValue - bValue;
        });
    }

    getHeroStatistics(): HeroStatistics {
        const heroes = this.getPlayerHeroes();
        const totalHeroes = heroes.length;
        
        return {
            totalHeroes,
            byFaction: {
                human: heroes.filter(h => h.faction === 'human').length,
                angel: heroes.filter(h => h.faction === 'angel').length,
                demon: heroes.filter(h => h.faction === 'demon').length
            },
            byQuality: {
                purple: heroes.filter(h => h.quality === 'purple').length,
                orange: heroes.filter(h => h.quality === 'orange').length,
                red: heroes.filter(h => h.quality === 'red').length
            },
            byStars: heroes.reduce((acc, h) => {
                acc[h.stars] = (acc[h.stars] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
            averageLevel: totalHeroes > 0 
                ? heroes.reduce((sum, h) => sum + h.level, 0) / totalHeroes 
                : 0,
            averagePower: totalHeroes > 0 
                ? heroes.reduce((sum, h) => sum + this.calculateHeroPower(h), 0) / totalHeroes 
                : 0,
            nftHeroes: heroes.filter(h => h.isNFT).length,
            deployedHeroes: heroes.filter(h => h.status === 'deployed').length
        };
    }

    // Equipment methods - delegate to data manager
    equipItem(heroId: string, equipment: Equipment, slot: string): boolean {
        const hero = this.dataManager.getHero(heroId);
        if (!hero) return false;
        
        hero.equipment = hero.equipment || {};
        hero.equipment[slot as keyof typeof hero.equipment] = equipment;
        
        this.dataManager.updateHero(hero);
        this.savePlayerHeroes();
        return true;
    }

    unequipItem(heroId: string, slot: string): boolean {
        const hero = this.dataManager.getHero(heroId);
        if (!hero || !hero.equipment) return false;
        
        delete hero.equipment[slot as keyof typeof hero.equipment];
        
        this.dataManager.updateHero(hero);
        this.savePlayerHeroes();
        return true;
    }

    // Bond methods
    activateBond(heroId: string, bondId: string): boolean {
        const hero = this.dataManager.getHero(heroId);
        if (!hero || !hero.bonds) return false;
        
        const bond = hero.bonds.find(b => b.id === bondId);
        if (!bond) return false;
        
        hero.bondActive = true;
        this.dataManager.updateHero(hero);
        this.savePlayerHeroes();
        return true;
    }

    upgradeSkill(heroId: string, skillType: 'activeSkill' | 'passiveSkill' | 'talent'): { success: boolean; newLevel?: number; error?: string } {
        const hero = this.dataManager.getHero(heroId);
        if (!hero) {
            return { success: false, error: '英雄不存在' };
        }

        const skill = hero[skillType];
        if (!skill) {
            return { success: false, error: '技能不存在' };
        }

        // Simplified skill upgrade logic
        if (!skill.levels) {
            return { success: false, error: '技能无法升级' };
        }

        const currentLevel = skill.levels.length;
        if (currentLevel >= 10) {
            return { success: false, error: '技能已达最高等级' };
        }

        // Add new level (simplified)
        skill.levels.push({ ...skill.levels[0], level: currentLevel + 1 });
        
        this.dataManager.updateHero(hero);
        this.savePlayerHeroes();
        
        return { success: true, newLevel: currentLevel + 1 };
    }

    enhanceEquipment(heroId: string, slot: string): { success: boolean; newLevel?: number; error?: string } {
        const hero = this.dataManager.getHero(heroId);
        if (!hero || !hero.equipment) {
            return { success: false, error: '装备不存在' };
        }

        const equipment = hero.equipment[slot as keyof typeof hero.equipment];
        if (!equipment) {
            return { success: false, error: '装备槽为空' };
        }

        // Simplified enhancement logic
        equipment.level = (equipment.level || 0) + 1;
        const newLevel = equipment.level;
        
        this.dataManager.updateHero(hero);
        this.savePlayerHeroes();
        
        return { success: true, newLevel };
    }

    promoteStar(heroId: string): { success: boolean; newStars?: number; error?: string } {
        const hero = this.dataManager.getHero(heroId);
        if (!hero) {
            return { success: false, error: '英雄不存在' };
        }

        if (hero.stars >= 5) {
            return { success: false, error: '已达最高星级' };
        }

        hero.stars += 1;
        
        this.dataManager.updateHero(hero);
        this.savePlayerHeroes();
        
        return { success: true, newStars: hero.stars };
    }
}

// Singleton instance
export const heroSystem = new HeroSystem();
