import { Hero, HeroUpgradeResult, HeroEvolveResult, 
         HeroFilterOptions, HeroSortOptions, HeroListQuery, HeroStatistics, 
         HERO_CONSTANTS, STAR_MULTIPLIERS } from '../types/slg/hero.types';
import { generateId } from '../utils/helpers';
import { saveGame, loadGame } from '../utils/storage';
import { humanHeroes, angelHeroes, demonHeroes } from '../config/heroes';

// 英雄系统类
export class HeroSystem {
  private heroes: Map<string, Hero> = new Map();
  private playerHeroes: string[] = []; // 玩家拥有的英雄ID列表
  
  constructor() {
    this.initializeHeroes();
    this.loadPlayerHeroes();
  }

  // 初始化英雄数据
  private initializeHeroes(): void {
    // 从配置文件加载所有英雄数据
    const allHeroes = [...humanHeroes, ...angelHeroes, ...demonHeroes];
    allHeroes.forEach(hero => {
      this.heroes.set(hero.id, hero);
    });
    console.log(`已加载 ${allHeroes.length} 个英雄数据`);
  }

  // 加载玩家英雄数据
  private loadPlayerHeroes(): void {
    const savedData = loadGame();
    if (savedData?.playerHeroes) {
      this.playerHeroes = savedData.playerHeroes;
      
      // 如果有保存的英雄详细数据，加载它们
      if (savedData.heroes) {
        Object.entries(savedData.heroes).forEach(([id, heroData]) => {
          const hero = heroData as Hero;
          this.heroes.set(id, hero);
        });
      }
    }
  }

  // 保存玩家英雄数据
  private savePlayerHeroes(): void {
    const heroesData: Record<string, Hero> = {};
    this.playerHeroes.forEach(heroId => {
      const hero = this.heroes.get(heroId);
      if (hero) {
        heroesData[heroId] = hero;
      }
    });

    const gameData = loadGame() || {
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
      gameStats: { daysSurvived: 1, totalSurvivorsRescued: 0, totalResourcesCollected: { food: 0, wood: 0, steel: 0, electricity: 0, fuel: 0 }, buildingsConstructed: 0 },
      difficulty: 'normal'
    };
    (gameData as any).playerHeroes = this.playerHeroes;
    (gameData as any).heroes = heroesData;
    saveGame(gameData);
  }

  // 获取英雄
  getHero(heroId: string): Hero | undefined {
    return this.heroes.get(heroId);
  }

  // 获取所有英雄
  getAllHeroes(): Hero[] {
    return Array.from(this.heroes.values());
  }

  // 获取玩家拥有的英雄
  getPlayerHeroes(): Hero[] {
    return this.playerHeroes
      .map(id => this.heroes.get(id))
      .filter(hero => hero !== undefined) as Hero[];
  }

  // 添加英雄到玩家收藏
  addHeroToPlayer(heroId: string, isNFT: boolean = false): boolean {
    const hero = this.heroes.get(heroId);
    if (!hero) {
      console.error(`英雄不存在: ${heroId}`);
      return false;
    }

    // 检查是否已拥有
    if (this.playerHeroes.includes(heroId)) {
      console.warn(`已拥有英雄: ${heroId}`);
      return false;
    }

    // 创建英雄副本（避免修改原始数据）
    const playerHero = { ...hero, id: generateId() };
    playerHero.isNFT = isNFT;
    playerHero.level = 1;
    playerHero.experience = 0;
    playerHero.status = 'idle';
    playerHero.battleStats = {
      battlesWon: 0,
      battlesLost: 0,
      totalDamage: 0,
      totalHealing: 0,
      criticalHits: 0,
      dodges: 0
    };

    this.heroes.set(playerHero.id, playerHero);
    this.playerHeroes.push(playerHero.id);
    this.savePlayerHeroes();

    console.log(`添加英雄到玩家收藏: ${playerHero.name} (${playerHero.id})`);
    return true;
  }

  // 升级英雄
  upgradeHero(heroId: string, experienceToAdd: number): HeroUpgradeResult {
    const hero = this.heroes.get(heroId);
    if (!hero) {
      return { success: false, error: '英雄不存在' };
    }

    if (hero.level >= HERO_CONSTANTS.MAX_LEVEL) {
      return { success: false, error: '已达到最高等级' };
    }

    try {
      let currentExp = hero.experience + experienceToAdd;
      let newLevel = hero.level;

      // 计算升级
      while (newLevel < HERO_CONSTANTS.MAX_LEVEL && currentExp >= this.getRequiredExperience(newLevel)) {
        currentExp -= this.getRequiredExperience(newLevel);
        newLevel++;
        
        // 更新属性
        this.updateHeroAttributes(hero, newLevel);
      }

      hero.level = newLevel;
      hero.experience = currentExp;

      this.savePlayerHeroes();

      return {
        success: true,
        newLevel,
        newAttributes: { ...hero.attributes },
        consumedExperience: experienceToAdd,
        remainingExperience: currentExp
      };
    } catch (error) {
      console.error('英雄升级失败:', error);
      return { success: false, error: '升级过程出错' };
    }
  }

  // 获取升级所需经验
  private getRequiredExperience(level: number): number {
    if (level >= HERO_CONSTANTS.MAX_LEVEL) return Infinity;
    return Math.floor(
      HERO_CONSTANTS.LEVEL_UP_BASE_EXP * 
      Math.pow(HERO_CONSTANTS.LEVEL_UP_MULTIPLIER, level - 1)
    );
  }

  // 更新英雄属性
  private updateHeroAttributes(hero: Hero, newLevel: number): void {
    const starMultiplier = STAR_MULTIPLIERS[hero.stars as keyof typeof STAR_MULTIPLIERS];
    
    hero.attributes = {
      command: Math.min(
        HERO_CONSTANTS.ATTRIBUTE_MAX,
        hero.maxLevelAttributes.command * starMultiplier * (newLevel / HERO_CONSTANTS.MAX_LEVEL)
      ),
      strength: Math.min(
        HERO_CONSTANTS.ATTRIBUTE_MAX,
        hero.maxLevelAttributes.strength * starMultiplier * (newLevel / HERO_CONSTANTS.MAX_LEVEL)
      ),
      strategy: Math.min(
        HERO_CONSTANTS.ATTRIBUTE_MAX,
        hero.maxLevelAttributes.strategy * starMultiplier * (newLevel / HERO_CONSTANTS.MAX_LEVEL)
      ),
      defense: Math.min(
        HERO_CONSTANTS.ATTRIBUTE_MAX,
        hero.maxLevelAttributes.defense * starMultiplier * (newLevel / HERO_CONSTANTS.MAX_LEVEL)
      )
    };
  }

  // 进化英雄
  evolveHero(heroId: string): HeroEvolveResult {
    const hero = this.heroes.get(heroId);
    if (!hero) {
      return { success: false, error: '英雄不存在' };
    }

    try {
      // 品质进化
      if (hero.quality === 'purple' && hero.stars >= 3) {
        hero.quality = 'orange';
        console.log(`英雄 ${hero.name} 进化为橙将`);
      } else if (hero.quality === 'orange' && hero.stars >= 4) {
        hero.quality = 'red';
        console.log(`英雄 ${hero.name} 进化为红将`);
      } else {
        return { success: false, error: '不满足进化条件' };
      }

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

  // 计算英雄战斗力
  calculateHeroPower(hero: Hero): number {
    const attributePower = 
      hero.attributes.command * 1.2 +
      hero.attributes.strength * 1.5 +
      hero.attributes.strategy * 1.3 +
      hero.attributes.defense * 1.0;
    
    const qualityMultiplier = 
      hero.quality === 'purple' ? 1.0 :
      hero.quality === 'orange' ? 1.5 :
      2.0;
    
    const starMultiplier = STAR_MULTIPLIERS[hero.stars as keyof typeof STAR_MULTIPLIERS];
    
    const levelMultiplier = 1 + (hero.level - 1) * 0.02;
    
    const bondMultiplier = hero.bondActive ? 1.2 : 1.0;
    
    return Math.floor(attributePower * qualityMultiplier * starMultiplier * levelMultiplier * bondMultiplier);
  }

  // 检查羁绊激活
  checkBonds(heroId: string): boolean {
    const hero = this.heroes.get(heroId);
    if (!hero) return false;

    let anyBondActive = false;
    
    hero.bonds.forEach(bond => {
      const requiredHeroesInTeam = bond.heroes.filter(id => 
        this.playerHeroes.includes(id) && 
        this.heroes.get(id)?.assignedTeam === hero.assignedTeam
      );
      
      const totalStars = requiredHeroesInTeam.reduce((sum, id) => {
        return sum + (this.heroes.get(id)?.stars || 0);
      }, 0);
      
      const minLevel = Math.min(...requiredHeroesInTeam.map(id => 
        this.heroes.get(id)?.level || 0
      ));
      
      if (
        totalStars >= bond.activationCondition.requiredStars &&
        minLevel >= bond.activationCondition.requiredLevel
      ) {
        anyBondActive = true;
      }
    });
    
    hero.bondActive = anyBondActive;
    return anyBondActive;
  }

  // 获取英雄列表（支持筛选和排序）
  getHeroList(query: HeroListQuery = {}): Hero[] {
    let heroes = this.getPlayerHeroes();

    // 筛选
    if (query.faction) {
      heroes = heroes.filter(hero => hero.faction === query.faction);
    }
    if (query.quality) {
      heroes = heroes.filter(hero => hero.quality === query.quality);
    }
    if (query.stars) {
      heroes = heroes.filter(hero => hero.stars === query.stars);
    }
    if (query.status) {
      heroes = heroes.filter(hero => hero.status === query.status);
    }
    if (query.assignedTeam) {
      heroes = heroes.filter(hero => hero.assignedTeam === query.assignedTeam);
    }
    if (query.isNFT !== undefined) {
      heroes = heroes.filter(hero => hero.isNFT === query.isNFT);
    }

    // 分页
    const limit = query.limit || 20;
    const page = query.page || 1;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return heroes.slice(start, end);
  }

  // 筛选英雄
  filterHeroes(heroes: Hero[], filters: HeroFilterOptions): Hero[] {
    return heroes.filter(hero => {
      // 阵营筛选
      if (filters.factions.length > 0 && !filters.factions.includes(hero.faction)) {
        return false;
      }
      
      // 品质筛选
      if (filters.qualities.length > 0 && !filters.qualities.includes(hero.quality)) {
        return false;
      }
      
      // 星级筛选
      if (filters.stars.length > 0 && !filters.stars.includes(hero.stars)) {
        return false;
      }
      
      // 等级筛选
      if (hero.level < filters.levels[0] || hero.level > filters.levels[1]) {
        return false;
      }
      
      // 战斗力筛选
      const power = this.calculateHeroPower(hero);
      if (power < filters.powers[0] || power > filters.powers[1]) {
        return false;
      }
      
      // 羁绊筛选
      if (filters.hasBond && !hero.bondActive) {
        return false;
      }
      
      // NFT筛选
      if (filters.isNFT && !hero.isNFT) {
        return false;
      }
      
      // 搜索文本
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        if (
          !hero.name.toLowerCase().includes(searchLower) &&
          !hero.lore.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      
      return true;
    });
  }

  // 排序英雄
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
        case 'rarity':
          aValue = a.rarity;
          bValue = b.rarity;
          break;
        default:
          aValue = a.level;
          bValue = b.level;
      }
      
      if (options.order === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });
  }

  // 获取英雄统计
  getHeroStatistics(): HeroStatistics {
    const heroes = this.getPlayerHeroes();
    const totalHeroes = heroes.length;
    
    // 按阵营统计
    const byFaction = {
      human: heroes.filter(h => h.faction === 'human').length,
      angel: heroes.filter(h => h.faction === 'angel').length,
      demon: heroes.filter(h => h.faction === 'demon').length
    };
    
    // 按品质统计
    const byQuality = {
      purple: heroes.filter(h => h.quality === 'purple').length,
      orange: heroes.filter(h => h.quality === 'orange').length,
      red: heroes.filter(h => h.quality === 'red').length
    };
    
    // 按星级统计
    const byStars: Record<string, number> = {};
    heroes.forEach(hero => {
      byStars[hero.stars] = (byStars[hero.stars] || 0) + 1;
    });
    
    // 平均等级
    const averageLevel = heroes.reduce((sum, hero) => sum + hero.level, 0) / totalHeroes;
    
    // 平均战斗力
    const totalPower = heroes.reduce((sum, hero) => sum + this.calculateHeroPower(hero), 0);
    const averagePower = totalPower / totalHeroes;
    
    // NFT英雄数量
    const nftHeroes = heroes.filter(h => h.isNFT).length;
    
    // 出战英雄数量
    const deployedHeroes = heroes.filter(h => h.status === 'deployed').length;
    
    return {
      totalHeroes,
      byFaction,
      byQuality,
      byStars,
      averageLevel,
      averagePower,
      nftHeroes,
      deployedHeroes
    };
  }
}