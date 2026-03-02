// 技能经验服务 - 处理技能经验计算和升级

import { Survivor, Building, SkillSpecialization, GameState } from '../../types/game.types';
import { PROFESSIONAL_SKILLS_CONFIG, SKILL_CONSTANTS } from '../../utils/constants';

export class SkillExperienceService {
    private gameState: GameState;

    constructor(gameState: GameState) {
        this.gameState = gameState;
    }

    updateSkillExperience(survivor: Survivor, deltaTime: number): void {
        const experienceGain = this.calculateExperienceGain(survivor, deltaTime);
        
        survivor.skills.totalExperience += experienceGain;

        survivor.skills.professionalSkills.forEach((skill, skillType) => {
            const config = PROFESSIONAL_SKILLS_CONFIG[skillType];
            if (!config || skill.currentLevel >= config.maxLevel) return;

            if (this.shouldGainSkillExperience(survivor, skill.specialization)) {
                const experienceRate = SKILL_CONSTANTS.PROFESSIONAL_SKILLS.EXPERIENCE_GAIN_RATE[skill.specialization] || 0.5;
                skill.experience += experienceGain * experienceRate;

                const requiredExperience = this.getRequiredExperience(skillType, skill.currentLevel);
                if (skill.experience >= requiredExperience) {
                    skill.currentLevel += 1;
                    skill.experience = skill.experience - requiredExperience;
                    
                    console.log(`${survivor.name} 的 ${skill.name} 升级到 Lv.${skill.currentLevel}`);
                }
            }
        });

        this.updateBaseSkills(survivor, deltaTime);
    }

    calculateExperienceGain(survivor: Survivor, deltaTime: number): number {
        let experience = 0;

        if (survivor.jobType !== 'idle' && survivor.jobType !== 'resting') {
            const hoursWorked = deltaTime / 3600;
            experience += hoursWorked * SKILL_CONSTANTS.EXPERIENCE_RATES.WORK_PER_HOUR;
        }

        const workEfficiency = this.calculateWorkEfficiency(survivor);
        experience *= workEfficiency;

        return Math.max(0, experience);
    }

    private shouldGainSkillExperience(survivor: Survivor, specialization: SkillSpecialization): boolean {
        switch (specialization) {
            case 'gathering':
                return survivor.jobType === 'gathering';
            case 'construction':
                return survivor.jobType === 'construction';
            case 'research':
                return survivor.jobType === 'research';
            case 'medical':
                return !!survivor.assignedBuildingId && 
                       this.gameState.buildings.some((b: Building) => 
                           b.id === survivor.assignedBuildingId && b.type === 'hospital');
            case 'management':
                return !!survivor.assignedBuildingId && 
                       this.gameState.buildings.some((b: Building) => 
                           b.id === survivor.assignedBuildingId && 
                           (b.type === 'shelter' || b.type === 'warehouse'));
            default:
                return false;
        }
    }

    private getRequiredExperience(skillType: string, currentLevel: number): number {
        const config = PROFESSIONAL_SKILLS_CONFIG[skillType as keyof typeof PROFESSIONAL_SKILLS_CONFIG];
        if (!config) return 100;

        return config.baseExperienceRequired * Math.pow(SKILL_CONSTANTS.BASE_SKILLS.LEVEL_UP_MULTIPLIER, currentLevel - 1);
    }

    private updateBaseSkills(survivor: Survivor, deltaTime: number): void {
        const experienceGain = this.calculateExperienceGain(survivor, deltaTime) / 10;

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

        if (survivor.assignedBuildingId) {
            const building = this.gameState.buildings.find((b: Building) => b.id === survivor.assignedBuildingId);
            if (building?.type === 'hospital') {
                this.gainBaseSkillExperience(survivor, 'medical', experienceGain);
            }
        }
    }

    private gainBaseSkillExperience(survivor: Survivor, skillName: 'gathering' | 'construction' | 'research' | 'medical', experience: number): void {
        const currentLevel = survivor.skills.baseSkills[skillName];
        if (currentLevel >= SKILL_CONSTANTS.BASE_SKILLS.MAX_LEVEL) return;

        const requiredExperience = SKILL_CONSTANTS.BASE_SKILLS.EXPERIENCE_PER_LEVEL * 
                                 Math.pow(SKILL_CONSTANTS.BASE_SKILLS.LEVEL_UP_MULTIPLIER, currentLevel - 1);
        
        const upgradeChance = experience / requiredExperience;
        if (Math.random() < upgradeChance) {
            survivor.skills.baseSkills[skillName] = Math.min(
                SKILL_CONSTANTS.BASE_SKILLS.MAX_LEVEL,
                currentLevel + 1
            );
            
            survivor.skills.skillPoints += SKILL_CONSTANTS.PROFESSIONAL_SKILLS.SKILL_POINT_SOURCES.levelUp;
            
            console.log(`${survivor.name} 的 ${this.getBaseSkillName(skillName)} 升级到 Lv.${survivor.skills.baseSkills[skillName]}`);
        }
    }

    private calculateWorkEfficiency(survivor: Survivor): number {
        let efficiency = 1;
        
        const baseSkills = survivor.skills.baseSkills;
        efficiency += (baseSkills.gathering - 1) * 0.05;
        
        if (survivor.stamina < 20) efficiency *= 0.5;
        else if (survivor.stamina < 50) efficiency *= 0.8;
        
        if (survivor.health < 30) efficiency *= 0.3;
        else if (survivor.health < 60) efficiency *= 0.6;
        
        return Math.max(0.1, efficiency);
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
