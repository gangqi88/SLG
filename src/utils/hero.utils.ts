// 英雄相关工具函数

import type { Hero, HeroAttributes, HeroQuality } from '../types/slg/hero.types';
import { FACTION_BONUS, STAR_MULTIPLIERS, HERO_CONSTANTS } from '../constants/hero.constants';

/**
 * 计算英雄战斗力
 */
export function calculateHeroPower(hero: Hero): number {
    const { command, strength, strategy, defense } = hero.attributes;
    const starMultiplier = STAR_MULTIPLIERS[hero.stars as keyof typeof STAR_MULTIPLIERS] || 1;
    
    // 基础属性计算
    const basePower = (command * 1.5 + strength * 1.2 + strategy * 1.0 + defense * 0.8);
    
    // 等级加成
    const levelBonus = 1 + (hero.level - 1) * 0.05;
    
    // 星级加成
    const starsBonus = starMultiplier;
    
    // 品质加成
    const qualityBonus = getQualityMultiplier(hero.quality);
    
    return Math.floor(basePower * levelBonus * starsBonus * qualityBonus);
}

/**
 * 获取品质倍数
 */
export function getQualityMultiplier(quality: HeroQuality): number {
    switch (quality) {
        case 'purple': return 1.0;
        case 'orange': return 1.3;
        case 'red': return 1.8;
        default: return 1.0;
    }
}

/**
 * 计算阵营克制加成
 */
export function getFactionBonus(attackerFaction: string, defenderFaction: string): number {
    const key = `${attackerFaction}->${defenderFaction}`;
    return FACTION_BONUS[key as keyof typeof FACTION_BONUS] || 0;
}

/**
 * 计算升级所需经验
 */
export function calculateLevelUpExp(level: number): number {
    return Math.floor(
        HERO_CONSTANTS.LEVEL_UP_BASE_EXP * 
        Math.pow(HERO_CONSTANTS.LEVEL_UP_MULTIPLIER, level - 1)
    );
}

/**
 * 计算进化材料需求
 */
export function getEvolutionCost(
    currentQuality: HeroQuality,
    targetQuality: HeroQuality
): Record<string, number> {
    const key = `${currentQuality}_to_${targetQuality}`;
    return HERO_CONSTANTS.EVOLUTION_MATERIALS[key as keyof typeof HERO_CONSTANTS.EVOLUTION_MATERIALS] || {};
}

/**
 * 计算属性成长值
 */
export function calculateGrowthAttributes(
    baseAttributes: HeroAttributes,
    growthRates: HeroAttributes,
    level: number
): HeroAttributes {
    return {
        command: Math.floor(baseAttributes.command + growthRates.command * (level - 1)),
        strength: Math.floor(baseAttributes.strength + growthRates.strength * (level - 1)),
        strategy: Math.floor(baseAttributes.strategy + growthRates.strategy * (level - 1)),
        defense: Math.floor(baseAttributes.defense + growthRates.defense * (level - 1)),
    };
}

/**
 * 验证英雄数据有效性
 */
export function validateHero(hero: Hero): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!hero.id) errors.push('英雄ID不能为空');
    if (!hero.name) errors.push('英雄名称不能为空');
    if (!['human', 'angel', 'demon'].includes(hero.faction)) {
        errors.push('无效的英雄阵营');
    }
    if (!['purple', 'orange', 'red'].includes(hero.quality)) {
        errors.push('无效的英雄品质');
    }
    if (hero.stars < 1 || hero.stars > HERO_CONSTANTS.MAX_STARS) {
        errors.push(`星级必须在1-${HERO_CONSTANTS.MAX_STARS}之间`);
    }
    if (hero.level < 1 || hero.level > HERO_CONSTANTS.MAX_LEVEL) {
        errors.push(`等级必须在1-${HERO_CONSTANTS.MAX_LEVEL}之间`);
    }
    
    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * 格式化英雄战斗力
 */
export function formatPower(power: number): string {
    if (power >= 10000) {
        return `${(power / 10000).toFixed(1)}W`;
    }
    if (power >= 1000) {
        return `${(power / 1000).toFixed(1)}K`;
    }
    return power.toString();
}

/**
 * 获取英雄状态颜色
 */
export function getHeroStatusColor(status: string): string {
    switch (status) {
        case 'idle': return '#95A5A6';
        case 'deployed': return '#27AE60';
        case 'injured': return '#E74C3C';
        case 'training': return '#3498DB';
        default: return '#95A5A6';
    }
}
