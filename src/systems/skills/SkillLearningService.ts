// 技能学习服务 - 处理技能学习和升级

import { Survivor, SurvivorSkills, ProfessionalSkill, ProfessionalSkillType, SkillSpecialization, GameState } from '../../types/game.types';
import { PROFESSIONAL_SKILLS_CONFIG } from '../../utils/constants';

export interface LearnableSkill {
    skillType: ProfessionalSkillType;
    name: string;
    description: string;
    specialization: SkillSpecialization;
    canLearn: boolean;
    requirements: string[];
    currentLevel: number;
    maxLevel: number;
}

export class SkillLearningService {
    private gameState: GameState;

    constructor(gameState: GameState) {
        this.gameState = gameState;
    }

    initializeSkills(): SurvivorSkills {
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

    getLearnableSkills(survivor: Survivor): LearnableSkill[] {
        const learnableSkills: LearnableSkill[] = [];

        Object.entries(PROFESSIONAL_SKILLS_CONFIG).forEach(([skillType, config]) => {
            const requirements: string[] = [];
            let canLearn = true;

            const baseSkillLevel = config.requirements.baseSkillLevel;
            const requiredSpecialization = config.specialization;
            const baseSkillValue = survivor.skills.baseSkills[requiredSpecialization as keyof typeof survivor.skills.baseSkills];
            
            if (baseSkillValue < baseSkillLevel) {
                canLearn = false;
                requirements.push(`${this.getBaseSkillName(requiredSpecialization)} ${baseSkillValue}/${baseSkillLevel}`);
            }

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

            if (survivor.skills.skillPoints < 1) {
                canLearn = false;
                requirements.push('需要技能点');
            }

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

    learnSkill(survivorId: string, skillType: ProfessionalSkillType): { success: boolean; message: string } {
        const survivor = this.gameState.survivors.find((s: Survivor) => s.id === survivorId);
        if (!survivor) {
            return { success: false, message: '幸存者不存在' };
        }

        const config = PROFESSIONAL_SKILLS_CONFIG[skillType];
        if (!config) {
            return { success: false, message: '技能不存在' };
        }

        const learnableSkills = this.getLearnableSkills(survivor);
        const targetSkill = learnableSkills.find(s => s.skillType === skillType);
        
        if (!targetSkill?.canLearn) {
            return { success: false, message: '无法学习该技能' };
        }

        survivor.skills.skillPoints -= 1;

        const existingSkill = survivor.skills.professionalSkills.get(skillType);
        if (existingSkill) {
            existingSkill.currentLevel += 1;
            existingSkill.experience = 0;
        } else {
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

        if (!survivor.skills.specialization) {
            survivor.skills.specialization = config.specialization;
        }

        return { success: true, message: `成功学习 ${config.name} Lv.1` };
    }

    resetSkills(survivorId: string): { success: boolean; message: string; refundedPoints?: number } {
        const survivor = this.gameState.survivors.find((s: Survivor) => s.id === survivorId);
        if (!survivor) {
            return { success: false, message: '幸存者不存在' };
        }

        let refundedPoints = 0;
        survivor.skills.professionalSkills.forEach((skill: ProfessionalSkill) => {
            refundedPoints += skill.currentLevel;
        });

        survivor.skills.professionalSkills.clear();
        survivor.skills.specialization = undefined;
        survivor.skills.skillPoints += refundedPoints;

        return { 
            success: true, 
            message: `技能已重置，返还 ${refundedPoints} 技能点`,
            refundedPoints 
        };
    }

    hasSkillRequirement(survivor: Survivor, requirements: {
        baseSkill?: { skill: keyof SurvivorSkills['baseSkills']; level: number };
        professionalSkill?: { skill: ProfessionalSkillType; level: number };
        specialization?: SkillSpecialization;
    }): boolean {
        if (requirements.baseSkill) {
            const baseSkillLevel = survivor.skills.baseSkills[requirements.baseSkill.skill];
            if (baseSkillLevel < requirements.baseSkill.level) {
                return false;
            }
        }

        if (requirements.professionalSkill) {
            const professionalSkill = survivor.skills.professionalSkills.get(requirements.professionalSkill.skill);
            if (!professionalSkill || professionalSkill.currentLevel < requirements.professionalSkill.level) {
                return false;
            }
        }

        if (requirements.specialization) {
            if (survivor.skills.specialization !== requirements.specialization) {
                return false;
            }
        }

        return true;
    }

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
}
