import { Hero, Equipment, HeroAttributes } from '../types/slg/hero.types';
import { generateId } from '../utils/helpers';

export interface EquipmentEnhanceResult {
    success: boolean;
    newLevel?: number;
    newEnhancements?: Partial<HeroAttributes>;
    consumedMaterials?: {
        gold: number;
        enhancementStone: number;
    };
    successRate?: number;
    error?: string;
}

export interface EquipmentRefineResult {
    success: boolean;
    newQuality?: Equipment['quality'];
    consumedMaterials?: {
        gold: number;
        refineStone: number;
        heroSoul: number;
    };
    error?: string;
}

export interface EquipmentTransferResult {
    success: boolean;
    targetEquipment?: Equipment;
    consumedMaterials?: {
        gold: number;
    };
    error?: string;
}

export const EQUIPMENT_CONSTANTS = {
    MAX_ENHANCE_LEVEL: 20,
    ENHANCE_SUCCESS_RATES: {
        1: 1.00,
        2: 1.00,
        3: 1.00,
        4: 0.95,
        5: 0.90,
        6: 0.85,
        7: 0.80,
        8: 0.75,
        9: 0.70,
        10: 0.65,
        11: 0.60,
        12: 0.55,
        13: 0.50,
        14: 0.45,
        15: 0.40,
        16: 0.35,
        17: 0.30,
        18: 0.25,
        19: 0.20,
        20: 0.15,
    },
    ENHANCE_COSTS: {
        gold: {
            1: 100, 2: 200, 3: 300, 4: 500, 5: 800,
            6: 1200, 7: 1600, 8: 2000, 9: 2500, 10: 3000,
            11: 4000, 12: 5000, 13: 6000, 14: 7000, 15: 8000,
            16: 10000, 17: 12000, 18: 15000, 19: 18000, 20: 20000,
        },
        enhancementStone: {
            1: 1, 2: 2, 3: 3, 4: 5, 5: 8,
            6: 12, 7: 16, 8: 20, 9: 25, 10: 30,
            11: 40, 12: 50, 13: 60, 14: 70, 15: 80,
            16: 100, 17: 120, 18: 150, 19: 180, 20: 200,
        },
    },
    ENHANCE_BONUS: {
        command: 5,
        strength: 5,
        strategy: 5,
        defense: 5,
    },
    QUALITY_MULTIPLIERS: {
        common: 1,
        rare: 1.5,
        epic: 2,
        legendary: 3,
    },
    REFINE_COSTS: {
        common_to_rare: { gold: 5000, refineStone: 10, heroSoul: 5 },
        rare_to_epic: { gold: 15000, refineStone: 30, heroSoul: 15 },
        epic_to_legendary: { gold: 50000, refineStone: 100, heroSoul: 50 },
    },
} as const;

export class EquipmentSystem {
    private static instance: EquipmentSystem;

    private constructor() {}

    static getInstance(): EquipmentSystem {
        if (!EquipmentSystem.instance) {
            EquipmentSystem.instance = new EquipmentSystem();
        }
        return EquipmentSystem.instance;
    }

    calculateEnhanceCost(
        currentLevel: number,
        equipmentQuality: Equipment['quality']
    ): { gold: number; enhancementStone: number } {
        const nextLevel = currentLevel + 1;
        const qualityMultiplier = EQUIPMENT_CONSTANTS.QUALITY_MULTIPLIERS[equipmentQuality];

        const gold = Math.round(
            (EQUIPMENT_CONSTANTS.ENHANCE_COSTS.gold[nextLevel as keyof typeof EQUIPMENT_CONSTANTS.ENHANCE_COSTS.gold] || 20000) * qualityMultiplier
        );
        const stone = EQUIPMENT_CONSTANTS.ENHANCE_COSTS.enhancementStone[nextLevel as keyof typeof EQUIPMENT_CONSTANTS.ENHANCE_COSTS.enhancementStone] || 200;

        return { gold, enhancementStone: stone };
    }

    calculateSuccessRate(
        currentLevel: number,
        isProtected: boolean = false
    ): number {
        const baseRate = EQUIPMENT_CONSTANTS.ENHANCE_SUCCESS_RATES[currentLevel as keyof typeof EQUIPMENT_CONSTANTS.ENHANCE_SUCCESS_RATES] || 0.15;
        
        if (isProtected) {
            return Math.min(1, baseRate + 0.2);
        }
        
        return baseRate;
    }

    enhanceEquipment(
        equipment: Equipment,
        playerGold: number,
        playerEnhancementStones: number,
        isProtected: boolean = false
    ): EquipmentEnhanceResult {
        if (equipment.level >= EQUIPMENT_CONSTANTS.MAX_ENHANCE_LEVEL) {
            return {
                success: false,
                error: '装备已达到最大强化等级',
            };
        }

        const costs = this.calculateEnhanceCost(equipment.level, equipment.quality);

        if (playerGold < costs.gold) {
            return {
                success: false,
                error: `金币不足，需要 ${costs.gold}`,
            };
        }

        if (playerEnhancementStones < costs.enhancementStone) {
            return {
                success: false,
                error: `强化石不足，需要 ${costs.enhancementStone}`,
            };
        }

        const successRate = this.calculateSuccessRate(equipment.level, isProtected);
        const roll = Math.random();
        const isSuccess = roll < successRate;

        if (!isSuccess) {
            if (isProtected) {
                return {
                    success: false,
                    successRate,
                    consumedMaterials: { gold: 0, enhancementStone: 0 },
                    error: '强化失败，保护罩生效，材料不退还',
                };
            }

            const lostGold = Math.round(costs.gold * 0.5);
            const lostStone = Math.round(costs.enhancementStone * 0.5);

            return {
                success: false,
                successRate,
                consumedMaterials: { gold: lostGold, enhancementStone: lostStone },
                error: '强化失败，损失50%材料',
            };
        }

        const newLevel = equipment.level + 1;
        const newEnhancements = this.calculateEnhancementBonus(newLevel, equipment.quality);

        return {
            success: true,
            newLevel,
            newEnhancements,
            consumedMaterials: costs,
            successRate,
        };
    }

    private calculateEnhancementBonus(
        level: number,
        quality: Equipment['quality']
    ): Partial<HeroAttributes> {
        const baseBonus = EQUIPMENT_CONSTANTS.ENHANCE_BONUS;
        const qualityMultiplier = EQUIPMENT_CONSTANTS.QUALITY_MULTIPLIERS[quality];

        const multiplier = level * qualityMultiplier;

        return {
            command: Math.round(baseBonus.command * multiplier),
            strength: Math.round(baseBonus.strength * multiplier),
            strategy: Math.round(baseBonus.strategy * multiplier),
            defense: Math.round(baseBonus.defense * multiplier),
        };
    }

    getEquipmentBonus(equipment: Equipment): HeroAttributes {
        const baseAttributes = equipment.attributes || {};
        const enhancementBonus = equipment.enhancements || {};

        return {
            command: (baseAttributes.command || 0) + (enhancementBonus.command || 0),
            strength: (baseAttributes.strength || 0) + (enhancementBonus.strength || 0),
            strategy: (baseAttributes.strategy || 0) + (enhancementBonus.strategy || 0),
            defense: (baseAttributes.defense || 0) + (enhancementBonus.defense || 0),
        };
    }

    refineEquipment(
        equipment: Equipment,
        playerGold: number,
        playerRefineStones: number,
        playerHeroSouls: number
    ): EquipmentRefineResult {
        const qualityOrder: Equipment['quality'][] = ['common', 'rare', 'epic', 'legendary'];
        const currentIndex = qualityOrder.indexOf(equipment.quality);

        if (currentIndex >= qualityOrder.length - 1) {
            return {
                success: false,
                error: '装备已达到最高品质',
            };
        }

        const nextQuality = qualityOrder[currentIndex + 1];
        const costs = this.getRefineCost(equipment.quality);

        if (playerGold < costs.gold) {
            return { success: false, error: `金币不足，需要 ${costs.gold}` };
        }
        if (playerRefineStones < costs.refineStone) {
            return { success: false, error: `精炼石不足，需要 ${costs.refineStone}` };
        }
        if (playerHeroSouls < costs.heroSoul) {
            return { success: false, error: `英雄之魂不足，需要 ${costs.heroSoul}` };
        }

        const successRate = this.getRefineSuccessRate(equipment.quality);
        const roll = Math.random();
        const isSuccess = roll < successRate;

        if (!isSuccess) {
            return {
                success: false,
                consumedMaterials: costs,
                error: `精炼失败，损失全部材料`,
            };
        }

        return {
            success: true,
            newQuality: nextQuality,
            consumedMaterials: costs,
        };
    }

    private getRefineCost(currentQuality: Equipment['quality']): { gold: number; refineStone: number; heroSoul: number } {
        switch (currentQuality) {
            case 'common':
                return { ...EQUIPMENT_CONSTANTS.REFINE_COSTS.common_to_rare };
            case 'rare':
                return { ...EQUIPMENT_CONSTANTS.REFINE_COSTS.rare_to_epic };
            case 'epic':
                return { ...EQUIPMENT_CONSTANTS.REFINE_COSTS.epic_to_legendary };
            default:
                return { gold: 0, refineStone: 0, heroSoul: 0 };
        }
    }

    private getRefineSuccessRate(currentQuality: Equipment['quality']): number {
        switch (currentQuality) {
            case 'common': return 0.8;
            case 'rare': return 0.6;
            case 'epic': return 0.4;
            default: return 0;
        }
    }

    applyEquipmentToHero(hero: Hero, equipment: Equipment): Hero {
        const updatedHero = { ...hero };
        
        const slot = equipment.type;
        updatedHero.equipment = {
            ...hero.equipment,
            [slot]: equipment,
        };

        return updatedHero;
    }

    removeEquipmentFromHero(hero: Hero, slot: 'weapon' | 'armor' | 'accessory'): Hero {
        const updatedHero = { ...hero };
        const newEquipment = { ...hero.equipment };
        delete newEquipment[slot];
        updatedHero.equipment = newEquipment;

        return updatedHero;
    }

    calculateHeroEquipmentBonus(hero: Hero): HeroAttributes {
        const bonuses: HeroAttributes = {
            command: 0,
            strength: 0,
            strategy: 0,
            defense: 0,
        };

        const equipmentSlots = ['weapon', 'armor', 'accessory'] as const;
        
        for (const slot of equipmentSlots) {
            const equipment = hero.equipment?.[slot];
            if (equipment) {
                const equipmentBonus = this.getEquipmentBonus(equipment);
                bonuses.command += equipmentBonus.command;
                bonuses.strength += equipmentBonus.strength;
                bonuses.strategy += equipmentBonus.strategy;
                bonuses.defense += equipmentBonus.defense;
            }
        }

        return bonuses;
    }

    createEquipment(
        name: string,
        type: Equipment['type'],
        quality: Equipment['quality'],
        attributes: Partial<HeroAttributes>
    ): Equipment {
        return {
            id: generateId(),
            name,
            type,
            quality,
            attributes,
            effects: [],
            level: 0,
            maxLevel: EQUIPMENT_CONSTANTS.MAX_ENHANCE_LEVEL,
            enhancements: {
                command: 0,
                strength: 0,
                strategy: 0,
                defense: 0,
            },
            icon: this.getEquipmentIcon(type),
        };
    }

    private getEquipmentIcon(type: Equipment['type']): string {
        switch (type) {
            case 'weapon': return '⚔️';
            case 'armor': return '🛡️';
            case 'accessory': return '💍';
            default: return '📦';
        }
    }
}

export const equipmentSystem = EquipmentSystem.getInstance();
