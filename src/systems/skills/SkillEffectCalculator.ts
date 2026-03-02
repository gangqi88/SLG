// 技能效果计算器 - 计算技能对幸存者的加成效果

import { Survivor } from '../../types/game.types';
import { PROFESSIONAL_SKILLS_CONFIG } from '../../utils/constants';

export interface SkillEffects {
    workEfficiency: number;
    constructionSpeed: number;
    researchSpeed: number;
    healingEfficiency: number;
    staminaConsumption: number;
    survivalChance: number;
    resourceProduction: Partial<Record<string, number>>;
    resourceConsumption: Partial<Record<string, number>>;
}

export class SkillEffectCalculator {
    calculateEffects(survivor: Survivor): SkillEffects {
        const effects: SkillEffects = {
            workEfficiency: 0,
            constructionSpeed: 0,
            researchSpeed: 0,
            healingEfficiency: 0,
            staminaConsumption: 0,
            survivalChance: 0,
            resourceProduction: {},
            resourceConsumption: {},
        };

        const baseSkills = survivor.skills.baseSkills;
        effects.workEfficiency += (baseSkills.gathering - 1) * 0.05;
        effects.constructionSpeed += (baseSkills.construction - 1) * 0.05;
        effects.researchSpeed += (baseSkills.research - 1) * 0.05;
        effects.healingEfficiency += (baseSkills.medical - 1) * 0.05;

        survivor.skills.professionalSkills.forEach((skill, skillType) => {
            const config = PROFESSIONAL_SKILLS_CONFIG[skillType];
            if (!config || skill.currentLevel === 0) return;

            const effect = config.effects.find(e => e.level === skill.currentLevel);
            if (!effect) return;

            const modifiers = effect.modifiers;
            
            if (modifiers.workEfficiency) effects.workEfficiency += modifiers.workEfficiency;
            if (modifiers.constructionSpeed) effects.constructionSpeed += modifiers.constructionSpeed;
            if (modifiers.researchSpeed) effects.researchSpeed += modifiers.researchSpeed;
            if (modifiers.healingEfficiency) effects.healingEfficiency += modifiers.healingEfficiency;
            if (modifiers.staminaConsumption) effects.staminaConsumption += modifiers.staminaConsumption;
            if (modifiers.survivalChance) effects.survivalChance += modifiers.survivalChance;
            
            if (modifiers.resourceProduction) {
                Object.entries(modifiers.resourceProduction).forEach(([resource, value]) => {
                    effects.resourceProduction[resource] = (effects.resourceProduction[resource] || 0) + value;
                });
            }
            
            if (modifiers.resourceConsumption) {
                Object.entries(modifiers.resourceConsumption).forEach(([resource, value]) => {
                    effects.resourceConsumption[resource] = (effects.resourceConsumption[resource] || 0) + value;
                });
            }
        });

        return effects;
    }

    calculateWorkEfficiency(survivor: Survivor): number {
        let efficiency = 1;
        
        const baseSkills = survivor.skills.baseSkills;
        efficiency += (baseSkills.gathering - 1) * 0.05;
        
        const skillEffects = this.calculateEffects(survivor);
        efficiency += skillEffects.workEfficiency;
        
        if (survivor.stamina < 20) efficiency *= 0.5;
        else if (survivor.stamina < 50) efficiency *= 0.8;
        
        if (survivor.health < 30) efficiency *= 0.3;
        else if (survivor.health < 60) efficiency *= 0.6;
        
        return Math.max(0.1, efficiency);
    }

    getSummary(survivor: Survivor): {
        baseSkills: { [key: string]: number };
        professionalSkills: Array<{ name: string; level: number; specialization: string }>;
        specialization?: string;
        skillPoints: number;
        totalExperience: number;
    } {
        const professionalSkills: Array<{ name: string; level: number; specialization: string }> = [];
        
        survivor.skills.professionalSkills.forEach((skill, skillType) => {
            const config = PROFESSIONAL_SKILLS_CONFIG[skillType];
            if (config && skill.currentLevel > 0) {
                professionalSkills.push({
                    name: config.name,
                    level: skill.currentLevel,
                    specialization: config.specialization,
                });
            }
        });

        return {
            baseSkills: { ...survivor.skills.baseSkills },
            professionalSkills,
            specialization: survivor.skills.specialization,
            skillPoints: survivor.skills.skillPoints,
            totalExperience: survivor.skills.totalExperience,
        };
    }
}
