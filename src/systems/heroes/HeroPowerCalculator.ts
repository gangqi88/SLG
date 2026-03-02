// 英雄战斗力计算器

import type { Hero, HeroAttributes, HeroQuality } from '../../types/slg/hero.types';
import { STAR_MULTIPLIERS } from '../../constants/hero.constants';

export class HeroPowerCalculator {
    calculate(hero: Hero): number {
        const { command, strength, strategy, defense } = hero.attributes;
        const starMultiplier = this.getStarMultiplier(hero.stars);
        
        const basePower = (command * 1.5 + strength * 1.2 + strategy * 1.0 + defense * 0.8);
        const levelBonus = 1 + (hero.level - 1) * 0.05;
        const starsBonus = starMultiplier;
        const qualityBonus = this.getQualityMultiplier(hero.quality);
        
        return Math.floor(basePower * levelBonus * starsBonus * qualityBonus);
    }

    calculateWithEquipment(hero: Hero, equipmentPower: number = 0): number {
        return this.calculate(hero) + equipmentPower;
    }

    calculatePotential(hero: Hero): number {
        const potential = hero.maxLevelAttributes;
        
        const basePower = (
            potential.command * 1.5 + 
            potential.strength * 1.2 + 
            potential.strategy * 1.0 + 
            potential.defense * 0.8
        );
        
        return Math.floor(basePower * STAR_MULTIPLIERS[5] * this.getQualityMultiplier(hero.quality));
    }

    getStarMultiplier(stars: number): number {
        return STAR_MULTIPLIERS[stars as keyof typeof STAR_MULTIPLIERS] || 1;
    }

    getQualityMultiplier(quality: HeroQuality): number {
        switch (quality) {
            case 'purple': return 1.0;
            case 'orange': return 1.3;
            case 'red': return 1.8;
            default: return 1.0;
        }
    }

    calculateAttributeContribution(attributes: HeroAttributes): number {
        return attributes.command * 1.5 + 
               attributes.strength * 1.2 + 
               attributes.strategy * 1.0 + 
               attributes.defense * 0.8;
    }
}
