import { 
    Survivor, 
    SurvivorSkills, 
    ProfessionalSkill, 
    ProfessionalSkillType, 
    SkillSpecialization 
} from '../types/game.types';
import { 
    PROFESSIONAL_SKILLS_CONFIG, 
    SKILL_CONSTANTS 
} from '../utils/constants';

export class SkillSystem {
    private readonly gameState: any;

    constructor(gameState: any) {
        this.gameState = gameState;
    }

    // 初始化幸存者技能
    initializeSurvivorSkills(): SurvivorSkills {
        return {
            baseSkills: {
                gathering: 1,
                construction: 1,
                research: 1,
                medical: 1,
            },
            professionalSkills: new Map<ProfessionalSkillType, ProfessionalSkill>(),
            specialization: undefined,
            skillPoints: 0,
            totalExperience: 0,
        };
    }

    // 获取幸存者的技能效果加成
    getSkillEffects(survivor: Survivor): {
        workEfficiency: number;
        constructionSpeed: number;
        researchSpeed: number;
        healingEfficiency: number;
        staminaConsumption: number;
        survivalChance: number;
        resourceProduction: Partial<Record<string, number>>;
        resourceConsumption: Partial<Record<string, number>>;
    } {
        const effects = {
            workEfficiency: 0,
            constructionSpeed: 0,
            researchSpeed: 0,
            healingEfficiency: 0,
            staminaConsumption: 0,
            survivalChance: 0,
            resourceProduction: {} as Partial<Record<string, number>>,
            resourceConsumption: {} as Partial<Record<string, number>>,
        };

        // 基础技能加成
        const baseSkills = survivor.skills.baseSkills;
        effects.workEfficiency += (baseSkills.gathering - 1) * 0.05;
        effects.constructionSpeed += (baseSkills.construction - 1) * 0.05;
        effects.researchSpeed += (baseSkills.research - 1) * 0.05;
        effects.healingEfficiency += (baseSkills.medical - 1) * 0.05;

        // 专业技能加成
        survivor.skills.professionalSkills.forEach((skill, skillType) => {
            const config = PROFESSIONAL_SKILLS_CONFIG[skillType];
            if (!config || skill.currentLevel === 0) return;

            const effect = config.effects.find(e => e.level === skill.currentLevel);
            if (!effect) return;

            // 应用效果加成
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

    // 获取可学习的技能列表
    getLearnableSkills(survivor: Survivor): Array<{
        skillType: ProfessionalSkillType;
        name: string;
        description: string;
        specialization: SkillSpecialization;
        canLearn: boolean;
        requirements: string[];
        currentLevel: number;
        maxLevel: number;
    }> {
        const learnableSkills: Array<{
            skillType: ProfessionalSkillType;
            name: string;
            description: string;
            specialization: SkillSpecialization;
            canLearn: boolean;
            requirements: string[];
            currentLevel: number;
            maxLevel: number;
        }> = [];

        Object.entries(PROFESSIONAL_SKILLS_CONFIG).forEach(([skillType, config]) => {
            const requirements: string[] = [];
            let canLearn = true;

            // 检查基础技能要求
            const baseSkillLevel = config.requirements.baseSkillLevel;
            const requiredSpecialization = config.specialization;
            const baseSkillValue = survivor.skills.baseSkills[requiredSpecialization as keyof typeof survivor.skills.baseSkills];
            
            if (baseSkillValue < baseSkillLevel) {
                canLearn = false;
                requirements.push(`${this.getBaseSkillName(requiredSpecialization)} ${baseSkillValue}/${baseSkillLevel}`);
            }

            // 检查前置技能要求
            if (config.requirements.prerequisites) {
                for (const prereq of config.requirements.prerequisites) {
                    const prereqSkill = survivor.skills.professionalSkills.get(prereq);
                    if (!prereqSkill || prereqSkill.currentLevel < 1) {
                        canLearn = false;
                        const prereqConfig = PROFESSIONAL_SKILLS_CONFIG[prereq];
                        requirements.push(`需要先学习: ${prereqConfig?.name || prereq}`);
                    }
                }
            }

            // 检查技能点
            if (survivor.skills.skillPoints < 1) {
                canLearn = false;
                requirements.push('需要技能点');
            }

            // 检查是否已达到最大等级
            const existingSkill = survivor.skills.professionalSkills.get(skillType as ProfessionalSkillType);
            const currentLevel = existingSkill?.currentLevel || 0;
            
            if (currentLevel >= config.maxLevel) {
                canLearn = false;
                requirements.push('已达到最大等级');
            }

            learnableSkills.push({
                skillType: skillType as ProfessionalSkillType,
                name: config.name,
                description: config.description,
                specialization: config.specialization,
                canLearn,
                requirements,
                currentLevel,
                maxLevel: config.maxLevel,
            });
        });

        return learnableSkills;
    }

    // 学习新技能
    learnSkill(survivorId: string, skillType: ProfessionalSkillType): { success: boolean; message: string } {
        const survivor = this.gameState.survivors.find((s: Survivor) => s.id === survivorId);
        if (!survivor) {
            return { success: false, message: '幸存者不存在' };
        }

        const config = PROFESSIONAL_SKILLS_CONFIG[skillType];
        if (!config) {
            return { success: false, message: '技能不存在' };
        }

        // 检查是否可学习
        const learnableSkills = this.getLearnableSkills(survivor);
        const targetSkill = learnableSkills.find(s => s.skillType === skillType);
        
        if (!targetSkill?.canLearn) {
            return { success: false, message: '无法学习该技能' };
        }

        // 消耗技能点
        survivor.skills.skillPoints -= 1;

        // 创建或更新技能
        const existingSkill = survivor.skills.professionalSkills.get(skillType);
        if (existingSkill) {
            // 升级现有技能
            existingSkill.currentLevel += 1;
            existingSkill.experience = 0;
        } else {
            // 学习新技能
            const newSkill: ProfessionalSkill = {
                id: skillType,
                name: config.name,
                description: config.description,
                specialization: config.specialization,
                maxLevel: config.maxLevel,
                currentLevel: 1,
                experience: 0,
                requirements: config.requirements,
                effects: config.effects,
            };
            survivor.skills.professionalSkills.set(skillType, newSkill);
        }

        // 如果还没有专精方向，设置第一个技能的专精方向
        if (!survivor.skills.specialization) {
            survivor.skills.specialization = config.specialization;
        }

        return { success: true, message: `成功学习 ${config.name} Lv.1` };
    }

    // 升级技能（通过经验）
    updateSkillExperience(survivor: Survivor, deltaTime: number): void {
        const experienceGain = this.calculateExperienceGain(survivor, deltaTime);
        
        // 更新总经验
        survivor.skills.totalExperience += experienceGain;

        // 更新专业技能经验
        survivor.skills.professionalSkills.forEach((skill, skillType) => {
            const config = PROFESSIONAL_SKILLS_CONFIG[skillType];
            if (!config || skill.currentLevel >= config.maxLevel) return;

            // 根据工作类型给予相应技能经验
            if (this.shouldGainSkillExperience(survivor, skill.specialization)) {
                const experienceRate = SKILL_CONSTANTS.PROFESSIONAL_SKILLS.EXPERIENCE_GAIN_RATE[skill.specialization] || 0.5;
                skill.experience += experienceGain * experienceRate;

                // 检查是否升级
                const requiredExperience = this.getRequiredExperience(skillType, skill.currentLevel);
                if (skill.experience >= requiredExperience) {
                    skill.currentLevel += 1;
                    skill.experience = skill.experience - requiredExperience;
                    
                    console.log(`${survivor.name} 的 ${skill.name} 升级到 Lv.${skill.currentLevel}`);
                }
            }
        });

        // 更新基础技能经验
        this.updateBaseSkills(survivor, deltaTime);
    }

    // 计算经验获取
    private calculateExperienceGain(survivor: Survivor, deltaTime: number): number {
        let experience = 0;

        // 工作获得经验
        if (survivor.jobType !== 'idle' && survivor.jobType !== 'resting') {
            const hoursWorked = deltaTime / 3600;
            experience += hoursWorked * SKILL_CONSTANTS.EXPERIENCE_RATES.WORK_PER_HOUR;
        }

        // 根据工作表现获得额外经验
        const workEfficiency = this.calculateWorkEfficiency(survivor);
        experience *= workEfficiency;

        return Math.max(0, experience);
    }

    // 检查是否应该获得技能经验
    private shouldGainSkillExperience(survivor: Survivor, specialization: SkillSpecialization): boolean {
        switch (specialization) {
            case 'gathering':
                return survivor.jobType === 'gathering';
            case 'construction':
                return survivor.jobType === 'construction';
            case 'research':
                return survivor.jobType === 'research';
            case 'medical':
                return survivor.assignedBuildingId && 
                       this.gameState.buildings.some((b: any) => 
                           b.id === survivor.assignedBuildingId && b.type === 'hospital');
            case 'management':
                return survivor.assignedBuildingId && 
                       this.gameState.buildings.some((b: any) => 
                           b.id === survivor.assignedBuildingId && 
                           (b.type === 'shelter' || b.type === 'warehouse'));
            default:
                return false;
        }
    }

    // 计算升级所需经验
    private getRequiredExperience(skillType: ProfessionalSkillType, currentLevel: number): number {
        const config = PROFESSIONAL_SKILLS_CONFIG[skillType];
        if (!config) return 100;

        return config.baseExperienceRequired * Math.pow(SKILL_CONSTANTS.BASE_SKILLS.LEVEL_UP_MULTIPLIER, currentLevel - 1);
    }

    // 更新基础技能
    private updateBaseSkills(survivor: Survivor, deltaTime: number): void {
        const experienceGain = this.calculateExperienceGain(survivor, deltaTime) / 10; // 基础技能经验获取较慢

        // 根据工作类型更新相应基础技能
        switch (survivor.jobType) {
            case 'gathering':
                this.gainBaseSkillExperience(survivor, 'gathering', experienceGain);
                break;
            case 'construction':
                this.gainBaseSkillExperience(survivor, 'construction', experienceGain);
                break;
            case 'research':
                this.gainBaseSkillExperience(survivor, 'research', experienceGain);
                break;
        }

        // 医疗技能经验（如果幸存者在医院工作）
        if (survivor.assignedBuildingId) {
            const building = this.gameState.buildings.find((b: any) => b.id === survivor.assignedBuildingId);
            if (building?.type === 'hospital') {
                this.gainBaseSkillExperience(survivor, 'medical', experienceGain);
            }
        }
    }

    // 获取基础技能经验
    private gainBaseSkillExperience(survivor: Survivor, skillName: keyof SurvivorSkills['baseSkills'], experience: number): void {
        const currentLevel = survivor.skills.baseSkills[skillName];
        if (currentLevel >= SKILL_CONSTANTS.BASE_SKILLS.MAX_LEVEL) return;

        // 简化：每100经验升一级
        const requiredExperience = SKILL_CONSTANTS.BASE_SKILLS.EXPERIENCE_PER_LEVEL * 
                                 Math.pow(SKILL_CONSTANTS.BASE_SKILLS.LEVEL_UP_MULTIPLIER, currentLevel - 1);
        
        // 这里简化处理，实际应该累积经验值
        // 为了简化，我们假设每小时有一定几率升级
        const upgradeChance = experience / requiredExperience;
        if (Math.random() < upgradeChance) {
            survivor.skills.baseSkills[skillName] = Math.min(
                SKILL_CONSTANTS.BASE_SKILLS.MAX_LEVEL,
                currentLevel + 1
            );
            
            // 升级获得技能点
            survivor.skills.skillPoints += SKILL_CONSTANTS.PROFESSIONAL_SKILLS.SKILL_POINT_SOURCES.levelUp;
            
            console.log(`${survivor.name} 的 ${this.getBaseSkillName(skillName)} 升级到 Lv.${survivor.skills.baseSkills[skillName]}`);
        }
    }

    // 计算工作效率（考虑技能加成）
    private calculateWorkEfficiency(survivor: Survivor): number {
        let efficiency = 1;
        
        // 基础技能影响
        const baseSkills = survivor.skills.baseSkills;
        efficiency += (baseSkills.gathering - 1) * 0.05;
        
        // 专业技能影响
        const skillEffects = this.getSkillEffects(survivor);
        efficiency += skillEffects.workEfficiency;
        
        // 体力影响
        if (survivor.stamina < 20) efficiency *= 0.5;
        else if (survivor.stamina < 50) efficiency *= 0.8;
        
        // 健康影响
        if (survivor.health < 30) efficiency *= 0.3;
        else if (survivor.health < 60) efficiency *= 0.6;
        
        return Math.max(0.1, efficiency);
    }

    // 获取基础技能名称
    private getBaseSkillName(specialization: string): string {
        const names: Record<string, string> = {
            gathering: '采集',
            construction: '建造',
            research: '研究',
            medical: '医疗',
            management: '管理'
        };
        return names[specialization] || specialization;
    }

    // 获取幸存者的技能摘要
    getSkillSummary(survivor: Survivor): {
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

    // 重置幸存者技能（用于重新分配）
    resetSkills(survivorId: string): { success: boolean; message: string; refundedPoints?: number } {
        const survivor = this.gameState.survivors.find((s: Survivor) => s.id === survivorId);
        if (!survivor) {
            return { success: false, message: '幸存者不存在' };
        }

        // 计算返还的技能点
        let refundedPoints = 0;
        survivor.skills.professionalSkills.forEach((skill: ProfessionalSkill) => {
            refundedPoints += skill.currentLevel;
        });

        // 重置技能
        survivor.skills.professionalSkills.clear();
        survivor.skills.specialization = undefined;
        survivor.skills.skillPoints += refundedPoints;

        return { 
            success: true, 
            message: `技能已重置，返还 ${refundedPoints} 技能点`,
            refundedPoints 
        };
    }

    // 检查幸存者是否满足特定技能要求
    hasSkillRequirement(survivor: Survivor, requirements: {
        baseSkill?: { skill: keyof SurvivorSkills['baseSkills']; level: number };
        professionalSkill?: { skill: ProfessionalSkillType; level: number };
        specialization?: SkillSpecialization;
    }): boolean {
        // 检查基础技能要求
        if (requirements.baseSkill) {
            const baseSkillLevel = survivor.skills.baseSkills[requirements.baseSkill.skill];
            if (baseSkillLevel < requirements.baseSkill.level) {
                return false;
            }
        }

        // 检查专业技能要求
        if (requirements.professionalSkill) {
            const professionalSkill = survivor.skills.professionalSkills.get(requirements.professionalSkill.skill);
            if (!professionalSkill || professionalSkill.currentLevel < requirements.professionalSkill.level) {
                return false;
            }
        }

        // 检查专精方向要求
        if (requirements.specialization) {
            if (survivor.skills.specialization !== requirements.specialization) {
                return false;
            }
        }

        return true;
    }
}