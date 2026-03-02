// 战斗相关工具函数

import { BATTLE_CONSTANTS, DAMAGE_TYPES } from '../constants/battle.constants';
import { GAME_CONSTANTS } from '../constants/game.constants';
import { getFactionBonus } from './hero.utils';

/**
 * 计算伤害
 */
export function calculateDamage(
    attackerAttack: number,
    defenderDefense: number,
    skillMultiplier: number = 1,
    isCritical: boolean = false,
    factionBonus: number = 0
): number {
    // 基础伤害
    let damage = attackerAttack * skillMultiplier;
    
    // 防御减免
    const defenseReduction = Math.min(
        defenderDefense * BATTLE_CONSTANTS.DEFENSE_PER_POINT,
        BATTLE_CONSTANTS.DEFENSE_REDUCTION_CAP
    );
    damage *= (1 - defenseReduction);
    
    // 阵营克制加成
    damage *= (1 + factionBonus);
    
    // 暴击加成
    if (isCritical) {
        damage *= BATTLE_CONSTANTS.CRITICAL_DAMAGE_MULTIPLIER;
    }
    
    // 伤害波动
    const variance = 1 + (Math.random() * 2 - 1) * BATTLE_CONSTANTS.DAMAGE_VARIANCE;
    damage *= variance;
    
    return Math.floor(damage);
}

/**
 * 判定是否暴击
 */
export function rollCritical(baseChance: number): boolean {
    const criticalRoll = Math.random();
    return criticalRoll < (baseChance + BATTLE_CONSTANTS.CRITICAL_CHANCE_BASE);
}

/**
 * 判定是否闪避
 */
export function rollDodge(dodgeChance: number): boolean {
    const dodgeRoll = Math.random();
    return dodgeRoll < (dodgeChance + BATTLE_CONSTANTS.BASE_DODGE_CHANCE);
}

/**
 * 计算治疗量
 */
export function calculateHeal(
    healerPower: number,
    skillMultiplier: number = 1,
    isCritical: boolean = false
): number {
    let heal = healerPower * skillMultiplier;
    
    if (isCritical) {
        heal *= BATTLE_CONSTANTS.HEAL_CRITICAL_MULTIPLIER;
    }
    
    // 治疗波动
    const variance = 1 + (Math.random() * 2 - 1) * BATTLE_CONSTANTS.HEAL_VARIANCE;
    heal *= variance;
    
    return Math.floor(heal);
}

/**
 * 计算阵营克制
 */
export function calculateFactionBonus(attackerFaction: string, defenderFaction: string): number {
    return getFactionBonus(attackerFaction, defenderFaction);
}

/**
 * 格式化伤害数字
 */
export function formatDamage(damage: number): string {
    if (damage >= 10000) {
        return `${(damage / 10000).toFixed(1)}w`;
    }
    if (damage >= 1000) {
        return `${(damage / 1000).toFixed(1)}k`;
    }
    return Math.floor(damage).toString();
}

/**
 * 获取伤害类型颜色
 */
export function getDamageTypeColor(damageType: string): string {
    switch (damageType) {
        case DAMAGE_TYPES.PHYSICAL:
            return '#E74C3C';
        case DAMAGE_TYPES.MAGICAL:
            return '#9B59B6';
        case DAMAGE_TYPES.TRUE:
            return '#2C3E50';
        default:
            return '#95A5A6';
    }
}

/**
 * 计算回合结束时的人口容量
 */
export function calculatePopulationCapacity(buildings: { type: string; level: number }[]): number {
    let capacity = GAME_CONSTANTS.POPULATION.BASE_CAPACITY;
    
    buildings.forEach(building => {
        if (building.type === 'shelter') {
            capacity += GAME_CONSTANTS.POPULATION.PER_SHELTER * building.level;
        }
    });
    
    return capacity;
}

/**
 * 验证战斗配置
 */
export function validateBattleConfig(config: {
    attackerCount: number;
    defenderCount: number;
    maxRounds: number;
}): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (config.attackerCount < 1) {
        errors.push('攻击方至少需要1个单位');
    }
    if (config.defenderCount < 1) {
        errors.push('防守方至少需要1个单位');
    }
    if (config.maxRounds < 1 || config.maxRounds > BATTLE_CONSTANTS.MAX_ROUNDS) {
        errors.push(`回合数必须在1-${BATTLE_CONSTANTS.MAX_ROUNDS}之间`);
    }
    
    return {
        valid: errors.length === 0,
        errors,
    };
}
