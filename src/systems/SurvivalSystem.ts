import { Survivor, GameState, ProfessionalSkillType, ProfessionalSkill } from '../types/game.types';
import { GAME_CONSTANTS } from '../utils/constants';

export class SurvivalSystem {
    private readonly gameState: GameState;

    constructor(gameState: GameState) {
        this.gameState = gameState;
    }

    // 更新幸存者状态
    updateSurvivors(deltaTime: number): Survivor[] {
        return this.gameState.survivors.map(survivor => {
            let updatedSurvivor = { ...survivor };

            // 更新饥饿值
            updatedSurvivor = this.updateHunger(updatedSurvivor, deltaTime);

            // 更新体力
            updatedSurvivor = this.updateStamina(updatedSurvivor, deltaTime);

            // 更新体温
            updatedSurvivor = this.updateTemperature(updatedSurvivor, deltaTime);

            // 更新健康值
            updatedSurvivor = this.updateHealth(updatedSurvivor, deltaTime);

            // 检查伤病状态
            updatedSurvivor = this.checkHealthConditions(updatedSurvivor);

            // 更新技能（工作经验）
            updatedSurvivor = this.updateSkills(updatedSurvivor, deltaTime);

            return updatedSurvivor;
        });
    }

    // 添加新幸存者
    addSurvivor(skills?: Partial<Survivor['skills']>): Survivor {
        const newSurvivor: Survivor = {
            id: `survivor-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            name: this.generateSurvivorName(),
            health: 100,
            hunger: 100,
            stamina: 100,
            temperature: 36.5, // 正常体温
            skills: {
                baseSkills: {
                    gathering: Math.floor(Math.random() * 3) + 1,
                    construction: Math.floor(Math.random() * 3) + 1,
                    research: Math.floor(Math.random() * 3) + 1,
                    medical: Math.floor(Math.random() * 3) + 1,
                },
                professionalSkills: new Map<ProfessionalSkillType, ProfessionalSkill>(),
                skillPoints: 0,
                totalExperience: 0,
                specialization: undefined,
                ...skills,
            },
            assignedBuildingId: null,
            jobType: 'idle' as const,
            isSick: false,
            isInjured: false,
        };

        this.gameState.survivors.push(newSurvivor);
        this.gameState.gameStats.totalSurvivorsRescued++;

        return newSurvivor;
    }

    // 移除幸存者（死亡或离开）
    removeSurvivor(survivorId: string): { success: boolean; survivor?: Survivor } {
        const index = this.gameState.survivors.findIndex(s => s.id === survivorId);
        if (index === -1) {
            return { success: false };
        }

        const survivor = this.gameState.survivors[index];
        this.gameState.survivors.splice(index, 1);

        return { success: true, survivor };
    }

    // 治疗幸存者
    healSurvivor(survivorId: string, amount: number): { success: boolean; newHealth: number } {
        const survivor = this.gameState.survivors.find(s => s.id === survivorId);
        if (!survivor) {
            return { success: false, newHealth: 0 };
        }

        const newHealth = Math.min(100, survivor.health + amount);
        survivor.health = newHealth;

        // 如果健康值足够高，清除伤病状态
        if (newHealth >= 70) {
            survivor.isSick = false;
            survivor.isInjured = false;
        }

        return { success: true, newHealth };
    }

    // 喂食幸存者
    feedSurvivor(survivorId: string, amount: number): { success: boolean; newHunger: number } {
        const survivor = this.gameState.survivors.find(s => s.id === survivorId);
        if (!survivor) {
            return { success: false, newHunger: 0 };
        }

        const newHunger = Math.min(100, survivor.hunger + amount);
        survivor.hunger = newHunger;

        return { success: true, newHunger };
    }

    // 让幸存者休息
    makeSurvivorRest(survivorId: string): { success: boolean; newStamina: number } {
        const survivor = this.gameState.survivors.find(s => s.id === survivorId);
        if (!survivor) {
            return { success: false, newStamina: 0 };
        }

        // 切换到休息状态
        survivor.jobType = 'resting';
        survivor.assignedBuildingId = null;

        // 快速恢复体力
        const newStamina = Math.min(100, survivor.stamina + 30);
        survivor.stamina = newStamina;

        return { success: true, newStamina };
    }

    // 获取幸存者统计
    getSurvivorStatistics(): {
        total: number;
        healthy: number;
        sick: number;
        injured: number;
        working: number;
        idle: number;
        averageHealth: number;
        averageHunger: number;
    } {
        const total = this.gameState.survivors.length;
        let healthy = 0;
        let sick = 0;
        let injured = 0;
        let working = 0;
        let idle = 0;
        let totalHealth = 0;
        let totalHunger = 0;

        this.gameState.survivors.forEach(survivor => {
            if (survivor.health >= 70) healthy++;
            if (survivor.isSick) sick++;
            if (survivor.isInjured) injured++;
            if (survivor.jobType !== 'idle' && survivor.jobType !== 'resting') working++;
            if (survivor.jobType === 'idle') idle++;
            
            totalHealth += survivor.health;
            totalHunger += survivor.hunger;
        });

        return {
            total,
            healthy,
            sick,
            injured,
            working,
            idle,
            averageHealth: total > 0 ? Math.round(totalHealth / total) : 0,
            averageHunger: total > 0 ? Math.round(totalHunger / total) : 0,
        };
    }

    // 获取需要关注的幸存者（健康值低、饥饿等）
    getSurvivorsNeedingAttention(): Array<{
        survivor: Survivor;
        issues: string[];
        priority: 'high' | 'medium' | 'low';
    }> {
        const survivorsWithIssues = this.gameState.survivors.map(survivor => {
            const issues: string[] = [];
            let priorityScore = 0;

            // 检查健康问题
            if (survivor.health < 30) {
                issues.push('生命垂危');
                priorityScore += 3;
            } else if (survivor.health < 50) {
                issues.push('健康状况差');
                priorityScore += 2;
            }

            // 检查饥饿问题
            if (survivor.hunger < 20) {
                issues.push('极度饥饿');
                priorityScore += 3;
            } else if (survivor.hunger < 50) {
                issues.push('饥饿');
                priorityScore += 1;
            }

            // 检查体温问题
            if (survivor.temperature < 35) {
                issues.push('严重失温');
                priorityScore += 3;
            } else if (survivor.temperature < 36) {
                issues.push('体温过低');
                priorityScore += 2;
            }

            // 检查伤病
            if (survivor.isSick) {
                issues.push('生病');
                priorityScore += 2;
            }
            if (survivor.isInjured) {
                issues.push('受伤');
                priorityScore += 2;
            }

            // 确定优先级
            let priority: 'high' | 'medium' | 'low' = 'low';
            if (priorityScore >= 3) priority = 'high';
            else if (priorityScore >= 1) priority = 'medium';

            return {
                survivor,
                issues,
                priority,
            };
        });

        // 按优先级排序
        return survivorsWithIssues
            .filter(item => item.issues.length > 0)
            .sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
    }

    // 私有方法
    private updateHunger(survivor: Survivor, deltaTime: number): Survivor {
        let hungerRate = GAME_CONSTANTS.SURVIVORS.BASE_HUNGER_RATE;

        // 工作消耗更多能量
        if (survivor.jobType !== 'idle' && survivor.jobType !== 'resting') {
            hungerRate *= 1.5;
        }

        // 冬季消耗更多能量
        if (this.gameState.time.season === 'winter') {
            hungerRate *= GAME_CONSTANTS.SEASON_EFFECTS.winter.survivorEffect.hungerRate;
        }

        // 伤病消耗更多能量
        if (survivor.isSick || survivor.isInjured) {
            hungerRate *= 1.2;
        }

        const hungerDecrease = hungerRate * (deltaTime / 3600); // 转换为小时
        const newHunger = Math.max(0, survivor.hunger - hungerDecrease);

        return { ...survivor, hunger: newHunger };
    }

    private updateStamina(survivor: Survivor, deltaTime: number): Survivor {
        let staminaChange = 0;

        if (survivor.jobType === 'resting') {
            // 休息时快速恢复体力
            staminaChange = 20 * (deltaTime / 3600);
        } else if (survivor.jobType === 'idle') {
            // 空闲时缓慢恢复体力
            staminaChange = 5 * (deltaTime / 3600);
        } else {
            // 工作时消耗体力
            const consumptionRate = GAME_CONSTANTS.SURVIVORS.BASE_STAMINA_RATE;
            staminaChange = -consumptionRate * (deltaTime / 3600);
        }

        const newStamina = Math.max(0, Math.min(100, survivor.stamina + staminaChange));
        return { ...survivor, stamina: newStamina };
    }

    private updateTemperature(survivor: Survivor, deltaTime: number): Survivor {
        const environmentTemp = this.gameState.time.temperature;
        let tempChange = 0;

        // 体温趋向环境温度
        const tempDifference = environmentTemp - survivor.temperature;
        tempChange = tempDifference * 0.1 * (deltaTime / 3600);

        // 建筑保温效果
        if (survivor.assignedBuildingId) {
            const building = this.gameState.buildings.find(b => b.id === survivor.assignedBuildingId);
            if (building?.type === 'shelter' && building.level >= 2) {
                tempChange *= 0.5; // 建筑内温度变化较慢
            }
        }

        // 冬季额外影响
        if (this.gameState.time.season === 'winter') {
            // 户外工作更容易失温
            if (survivor.jobType !== 'idle' && survivor.jobType !== 'resting') {
                tempChange -= 0.5 * (deltaTime / 3600);
            }
        }

        const newTemperature = Math.max(34, Math.min(40, survivor.temperature + tempChange));
        return { ...survivor, temperature: newTemperature };
    }

    private updateHealth(survivor: Survivor, deltaTime: number): Survivor {
        let healthChange = 0;

        // 基础健康恢复
        const baseRecovery = GAME_CONSTANTS.SURVIVORS.BASE_HEALTH_RECOVERY;
        healthChange += baseRecovery * (deltaTime / 3600);

        // 季节影响
        const seasonEffect = GAME_CONSTANTS.SEASON_EFFECTS[this.gameState.time.season];
        healthChange *= seasonEffect.survivorEffect.healthRecovery;

        // 难度影响
        const difficultyEffect = GAME_CONSTANTS.DIFFICULTY[this.gameState.difficulty];
        healthChange *= difficultyEffect.survivorHealthRecovery;

        // 饥饿影响健康
        if (survivor.hunger < 20) {
            healthChange -= 2 * (deltaTime / 3600); // 极度饥饿损害健康
        } else if (survivor.hunger < 50) {
            healthChange -= 0.5 * (deltaTime / 3600); // 饥饿减缓恢复
        }

        // 体温影响健康
        if (survivor.temperature < 35) {
            healthChange -= 3 * (deltaTime / 3600); // 严重失温
        } else if (survivor.temperature < 36) {
            healthChange -= 1 * (deltaTime / 3600); // 体温过低
        }

        // 伤病影响
        if (survivor.isSick) {
            healthChange -= 1 * (deltaTime / 3600);
        }
        if (survivor.isInjured) {
            healthChange -= 2 * (deltaTime / 3600);
        }

        const newHealth = Math.max(0, Math.min(100, survivor.health + healthChange));
        return { ...survivor, health: newHealth };
    }

    private checkHealthConditions(survivor: Survivor): Survivor {
        let updatedSurvivor = { ...survivor };

        // 检查是否需要生病
        if (!survivor.isSick) {
            const sickChance = this.calculateSickChance(survivor);
            if (Math.random() < sickChance) {
                updatedSurvivor.isSick = true;
            }
        }

        // 检查是否需要受伤
        if (!survivor.isInjured) {
            const injuryChance = this.calculateInjuryChance(survivor);
            if (Math.random() < injuryChance) {
                updatedSurvivor.isInjured = true;
            }
        }

        // 自动恢复（如果条件良好）
        if (survivor.isSick && survivor.health > 80 && survivor.hunger > 70) {
            if (Math.random() < 0.01) { // 每天约24% chance
                updatedSurvivor.isSick = false;
            }
        }

        if (survivor.isInjured && survivor.health > 90) {
            if (Math.random() < 0.005) { // 每天约12% chance
                updatedSurvivor.isInjured = false;
            }
        }

        return updatedSurvivor;
    }

    private updateSkills(survivor: Survivor, deltaTime: number): Survivor {
        const updatedSurvivor = { ...survivor };
        const skillIncreaseChance = 0.001 * (deltaTime / 3600); // 每小时0.1% chance

        // 根据工作类型增加相应技能
        if (survivor.jobType === 'gathering' && Math.random() < skillIncreaseChance) {
            updatedSurvivor.skills.baseSkills.gathering = Math.min(10, survivor.skills.baseSkills.gathering + 0.1);
        } else if (survivor.jobType === 'construction' && Math.random() < skillIncreaseChance) {
            updatedSurvivor.skills.baseSkills.construction = Math.min(10, survivor.skills.baseSkills.construction + 0.1);
        } else if (survivor.jobType === 'research' && Math.random() < skillIncreaseChance) {
            updatedSurvivor.skills.baseSkills.research = Math.min(10, survivor.skills.baseSkills.research + 0.1);
        }

        return updatedSurvivor;
    }

    private calculateSickChance(survivor: Survivor): number {
        let chance = 0.0001; // 基础生病几率

        // 健康影响
        if (survivor.health < 50) chance *= 3;
        if (survivor.health < 30) chance *= 5;

        // 饥饿影响
        if (survivor.hunger < 30) chance *= 2;

        // 体温影响
        if (survivor.temperature < 36) chance *= 1.5;
        if (survivor.temperature < 35) chance *= 2;

        // 冬季更容易生病
        if (this.gameState.time.season === 'winter') chance *= 2;

        return chance * (1 / 3600); // 转换为每小时几率
    }

    private calculateInjuryChance(survivor: Survivor): number {
        let chance = 0.00005; // 基础受伤几率

        // 工作类型影响
        if (survivor.jobType === 'gathering') chance *= 1.5;
        if (survivor.jobType === 'construction') chance *= 2;

        // 体力影响
        if (survivor.stamina < 20) chance *= 3;

        return chance * (1 / 3600); // 转换为每小时几率
    }

    private generateSurvivorName(): string {
        const firstNames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴'];
        const lastNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛'];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return firstName + lastName;
    }
}