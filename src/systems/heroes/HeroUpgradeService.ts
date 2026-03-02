// 英雄升级服务

import type { Hero, HeroUpgradeResult } from '../../types/slg/hero.types';
import { HERO_CONSTANTS } from '../../constants/hero.constants';

export class HeroUpgradeService {
    upgrade(hero: Hero, experienceToAdd: number): HeroUpgradeResult {
        if (hero.level >= HERO_CONSTANTS.MAX_LEVEL) {
            return { success: false, error: '已达到最高等级' };
        }

        try {
            let currentExp = hero.experience + experienceToAdd;
            let newLevel = hero.level;

            while (
                newLevel < HERO_CONSTANTS.MAX_LEVEL && 
                currentExp >= this.getRequiredExperience(newLevel)
            ) {
                currentExp -= this.getRequiredExperience(newLevel);
                newLevel++;
                this.updateHeroAttributes(hero, newLevel);
            }

            hero.level = newLevel;
            hero.experience = currentExp;

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

    getRequiredExperience(level: number): number {
        if (level >= HERO_CONSTANTS.MAX_LEVEL) return Infinity;
        return Math.floor(
            HERO_CONSTANTS.LEVEL_UP_BASE_EXP * 
            Math.pow(HERO_CONSTANTS.LEVEL_UP_MULTIPLIER, level - 1)
        );
    }

    getTotalExperienceForLevel(targetLevel: number): number {
        let totalExp = 0;
        for (let level = 1; level < targetLevel; level++) {
            totalExp += this.getRequiredExperience(level);
        }
        return totalExp;
    }

    canUpgrade(hero: Hero, experience: number): boolean {
        if (hero.level >= HERO_CONSTANTS.MAX_LEVEL) return false;
        return experience >= this.getRequiredExperience(hero.level);
    }

    private updateHeroAttributes(hero: Hero, newLevel: number): void {
        const starMultiplier = this.getStarMultiplier(hero.stars);
        
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

    private getStarMultiplier(stars: number): number {
        const multipliers: Record<number, number> = { 1: 1.0, 2: 1.1, 3: 1.2, 4: 1.35, 5: 1.5 };
        return multipliers[stars] || 1.0;
    }
}
