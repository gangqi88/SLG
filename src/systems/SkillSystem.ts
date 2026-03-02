import { Survivor, SurvivorSkills, ProfessionalSkillType, GameState } from '../types/game.types';
import { SkillEffectCalculator, SkillLearningService, SkillExperienceService } from './skills';

export class SkillSystem {
    private readonly gameState: GameState;
    private effectCalculator: SkillEffectCalculator;
    private learningService: SkillLearningService;
    private experienceService: SkillExperienceService;

    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.effectCalculator = new SkillEffectCalculator();
        this.learningService = new SkillLearningService(this.gameState);
        this.experienceService = new SkillExperienceService(this.gameState);
    }

    initializeSurvivorSkills(): SurvivorSkills {
        return this.learningService.initializeSkills();
    }

    getSkillEffects(survivor: Survivor): ReturnType<SkillEffectCalculator['calculateEffects']> {
        return this.effectCalculator.calculateEffects(survivor);
    }

    getLearnableSkills(survivor: Survivor): ReturnType<SkillLearningService['getLearnableSkills']> {
        return this.learningService.getLearnableSkills(survivor);
    }

    learnSkill(survivorId: string, skillType: ProfessionalSkillType): { success: boolean; message: string } {
        return this.learningService.learnSkill(survivorId, skillType);
    }

    updateSkillExperience(survivor: Survivor, deltaTime: number): void {
        this.experienceService.updateSkillExperience(survivor, deltaTime);
    }

    getSkillSummary(survivor: Survivor): ReturnType<SkillEffectCalculator['getSummary']> {
        return this.effectCalculator.getSummary(survivor);
    }

    resetSkills(survivorId: string): { success: boolean; message: string; refundedPoints?: number } {
        return this.learningService.resetSkills(survivorId);
    }

    hasSkillRequirement(survivor: Survivor, requirements: {
        baseSkill?: { skill: keyof SurvivorSkills['baseSkills']; level: number };
        professionalSkill?: { skill: ProfessionalSkillType; level: number };
        specialization?: string;
    }): boolean {
        return this.learningService.hasSkillRequirement(survivor, requirements as Parameters<typeof this.learningService.hasSkillRequirement>[1]);
    }
}
