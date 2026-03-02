import { Hero, Team, Buff, Debuff } from '../types/slg/hero.types';
import { battleSystem } from './BattleSystem';
import { generateId } from '../utils/helpers';

export interface PredictionConfig {
    simulationCount: number;
    includeVariance: boolean;
    variancePercent: number;
}

export interface PredictedOutcome {
    attackerWinRate: number;
    defenderWinRate: number;
    drawRate: number;
    averageRounds: number;
    expectedDamage: {
        attacker: number;
        defender: number;
    };
    expectedCasualties: {
        attacker: number;
        defender: number;
    };
    confidence: number;
    samples: number;
}

export interface RealTimeBattleState {
    battleId: string;
    startTime: number;
    currentTick: number;
    isActive: boolean;
    isPaused: boolean;
    attackerState: TeamBattleState;
    defenderState: TeamBattleState;
    events: BattleTickEvent[];
    effects: ActiveEffect[];
}

export interface TeamBattleState {
    teamId: string;
    members: MemberBattleState[];
    morale: number;
    power: number;
}

export interface MemberBattleState {
    memberId: string;
    heroId: string;
    heroName: string;
    currentHealth: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    position: { x: number; y: number };
    isAlive: boolean;
    buffs: Buff[];
    debuffs: Debuff[];
    actionReady: boolean;
    lastAction?: string;
}

export interface BattleTickEvent {
    tick: number;
    timestamp: number;
    type: 'attack' | 'skill' | 'heal' | 'buff' | 'death';
    sourceId: string;
    sourceName: string;
    targetId?: string;
    targetName?: string;
    value: number;
    isCritical: boolean;
    isDodged: boolean;
    description: string;
}

export interface ActiveEffect {
    id: string;
    type: 'damage' | 'heal' | 'buff_apply' | 'debuff_apply' | 'death';
    targetId: string;
    value: number;
    duration: number;
    position: { x: number; y: number };
    color?: string;
}

export class BattlePredictionSystem {
    private static instance: BattlePredictionSystem;
    private currentBattle: RealTimeBattleState | null = null;
    private tickInterval: number | null = null;
    private config: PredictionConfig = {
        simulationCount: 100,
        includeVariance: true,
        variancePercent: 0.1,
    };

    private constructor() {}

    static getInstance(): BattlePredictionSystem {
        if (!BattlePredictionSystem.instance) {
            BattlePredictionSystem.instance = new BattlePredictionSystem();
        }
        return BattlePredictionSystem.instance;
    }

    setConfig(config: Partial<PredictionConfig>): void {
        this.config = { ...this.config, ...config };
    }

    predictBattleOutcome(
        attackerTeam: Team,
        defenderTeam: Team,
        attackerHeroes: Map<string, Hero>,
        defenderHeroes: Map<string, Hero>
    ): PredictedOutcome {
        let attackerWins = 0;
        let defenderWins = 0;
        let draws = 0;
        let totalRounds = 0;
        let totalAttackerDamage = 0;
        let totalDefenderDamage = 0;
        let totalAttackerCasualties = 0;
        let totalDefenderCasualties = 0;

        for (let i = 0; i < this.config.simulationCount; i++) {
            const result = this.simulateSingleBattle(
                attackerTeam,
                defenderTeam,
                attackerHeroes,
                defenderHeroes
            );

            if (result.winner === 'attacker') attackerWins++;
            else if (result.winner === 'defender') defenderWins++;
            else draws++;

            totalRounds += result.rounds;
            totalAttackerDamage += result.attackerDamage;
            totalDefenderDamage += result.defenderDamage;
            totalAttackerCasualties += result.attackerCasualties;
            totalDefenderCasualties += result.defenderCasualties;
        }

        const samples = this.config.simulationCount;
        const confidence = this.calculateConfidence(samples);

        return {
            attackerWinRate: (attackerWins / samples) * 100,
            defenderWinRate: (defenderWins / samples) * 100,
            drawRate: (draws / samples) * 100,
            averageRounds: totalRounds / samples,
            expectedDamage: {
                attacker: totalAttackerDamage / samples,
                defender: totalDefenderDamage / samples,
            },
            expectedCasualties: {
                attacker: totalAttackerCasualties / samples,
                defender: totalDefenderCasualties / samples,
            },
            confidence,
            samples,
        };
    }

    private simulateSingleBattle(
        attackerTeam: Team,
        defenderTeam: Team,
        attackerHeroes: Map<string, Hero>,
        defenderHeroes: Map<string, Hero>
    ): {
        winner: 'attacker' | 'defender' | 'draw';
        rounds: number;
        attackerDamage: number;
        defenderDamage: number;
        attackerCasualties: number;
        defenderCasualties: number;
    } {
        const attackerState = this.cloneTeamState(attackerTeam, attackerHeroes);
        const defenderState = this.cloneTeamState(defenderTeam, defenderHeroes);

        let rounds = 0;
        const maxRounds = 20;

        while (rounds < maxRounds) {
            rounds++;

            this.processBattleRound(attackerState, defenderState, attackerHeroes, defenderHeroes);

            const attackerAlive = attackerState.filter(m => m.currentHealth > 0).length;
            const defenderAlive = defenderState.filter(m => m.currentHealth > 0).length;

            if (attackerAlive === 0 && defenderAlive === 0) {
                return {
                    winner: 'draw',
                    rounds,
                    attackerDamage: 0,
                    defenderDamage: 0,
                    attackerCasualties: attackerTeam.members.length,
                    defenderCasualties: defenderTeam.members.length,
                };
            }
            if (attackerAlive === 0) {
                return {
                    winner: 'defender',
                    rounds,
                    attackerDamage: 0,
                    defenderDamage: 0,
                    attackerCasualties: attackerTeam.members.length - attackerAlive,
                    defenderCasualties: defenderTeam.members.length - defenderAlive,
                };
            }
            if (defenderAlive === 0) {
                return {
                    winner: 'attacker',
                    rounds,
                    attackerDamage: 0,
                    defenderDamage: 0,
                    attackerCasualties: attackerTeam.members.length - attackerAlive,
                    defenderCasualties: defenderTeam.members.length - defenderAlive,
                };
            }
        }

        const attackerPower = this.calculateStatePower(attackerState);
        const defenderPower = this.calculateStatePower(defenderState);

        if (attackerPower > defenderPower) {
            return {
                winner: 'attacker',
                rounds,
                attackerDamage: 0,
                defenderDamage: 0,
                attackerCasualties: 0,
                defenderCasualties: 0,
            };
        } else if (defenderPower > attackerPower) {
            return {
                winner: 'defender',
                rounds,
                attackerDamage: 0,
                defenderDamage: 0,
                attackerCasualties: 0,
                defenderCasualties: 0,
            };
        }

        return {
            winner: 'draw',
            rounds,
            attackerDamage: 0,
            defenderDamage: 0,
            attackerCasualties: 0,
            defenderCasualties: 0,
        };
    }

    private cloneTeamState(team: Team, heroes: Map<string, Hero>): MemberBattleState[] {
        return team.members.map((member, index) => {
            const hero = heroes.get(member.heroId);
            if (!hero) {
                return {
                    memberId: generateId(),
                    heroId: member.heroId,
                    heroName: 'Unknown',
                    currentHealth: 0,
                    maxHealth: 100,
                    mana: 0,
                    maxMana: 100,
                    position: { x: index * 100, y: 0 },
                    isAlive: false,
                    buffs: [],
                    debuffs: [],
                    actionReady: true,
                };
            }

            return {
                memberId: generateId(),
                heroId: member.heroId,
                heroName: hero.name,
                currentHealth: member.currentHealth || hero.attributes.command * 10,
                maxHealth: member.maxHealth || hero.attributes.command * 10,
                mana: member.mana || 50,
                maxMana: member.maxMana || 100,
                position: { x: index * 100, y: 0 },
                isAlive: true,
                buffs: [...member.buffs],
                debuffs: [...member.debuffs],
                actionReady: true,
            };
        });
    }

    private processBattleRound(
        attackerState: MemberBattleState[],
        defenderState: MemberBattleState[],
        attackerHeroes: Map<string, Hero>,
        defenderHeroes: Map<string, Hero>
    ): void {
        const allAttackers = attackerState.filter(m => m.isAlive && m.actionReady);
        const allDefenders = defenderState.filter(m => m.isAlive && m.actionReady);

        for (const attacker of allAttackers) {
            const target = this.selectTarget(allDefenders);
            if (!target) break;

            const attackerHero = attackerHeroes.get(attacker.heroId);
            const defenderHero = defenderHeroes.get(target.heroId);

            if (!attackerHero || !defenderHero) continue;

            const context = this.createBattleContext(attackerHero, defenderHero, attacker, target);

            const damage = battleSystem.calculateDamage(context);

            target.currentHealth = Math.max(0, target.currentHealth - damage.finalDamage);

            if (target.currentHealth <= 0) {
                target.isAlive = false;
            }

            attacker.actionReady = false;
        }

        for (const defender of allDefenders) {
            const target = this.selectTarget(allAttackers);
            if (!target) break;

            const defenderHero = defenderHeroes.get(defender.heroId);
            const attackerHero = attackerHeroes.get(target.heroId);

            if (!defenderHero || !attackerHero) continue;

            const context = this.createBattleContext(defenderHero, attackerHero, defender, target);

            const damage = battleSystem.calculateDamage(context);

            target.currentHealth = Math.max(0, target.currentHealth - damage.finalDamage);

            if (target.currentHealth <= 0) {
                target.isAlive = false;
            }

            defender.actionReady = false;
        }

        attackerState.forEach(m => m.actionReady = true);
        defenderState.forEach(m => m.actionReady = true);
    }

    private selectTarget(aliveMembers: MemberBattleState[]): MemberBattleState | null {
        if (aliveMembers.length === 0) return null;
        return aliveMembers[Math.floor(Math.random() * aliveMembers.length)];
    }

    private createBattleContext(
        attacker: Hero,
        defender: Hero,
        attackerState: MemberBattleState,
        defenderState: MemberBattleState
    ): any {
        return {
            attackerFaction: attacker.faction,
            defenderFaction: defender.faction,
            attackerAttributes: attacker.attributes,
            defenderAttributes: defender.attributes,
            attackerLevel: attacker.level,
            defenderLevel: defender.level,
            skillMultiplier: 1.0,
            isPhysical: true,
            attackerBuffs: attackerState.buffs,
            attackerDebuffs: attackerState.debuffs,
            defenderBuffs: defenderState.buffs,
            defenderDebuffs: defenderState.debuffs,
        };
    }

    private calculateStatePower(members: MemberBattleState[]): number {
        return members.reduce((sum, m) => {
            if (!m.isAlive) return sum;
            return sum + m.currentHealth;
        }, 0);
    }

    private calculateConfidence(samples: number): number {
        if (samples >= 1000) return 95;
        if (samples >= 500) return 90;
        if (samples >= 100) return 80;
        if (samples >= 50) return 70;
        return 60;
    }

    startRealTimeBattle(
        battleId: string,
        attackerTeam: Team,
        defenderTeam: Team,
        attackerHeroes: Map<string, Hero>,
        defenderHeroes: Map<string, Hero>,
        onTick?: (state: RealTimeBattleState) => void
    ): void {
        this.currentBattle = {
            battleId,
            startTime: Date.now(),
            currentTick: 0,
            isActive: true,
            isPaused: false,
            attackerState: {
                teamId: attackerTeam.id,
                members: this.cloneTeamState(attackerTeam, attackerHeroes),
                morale: attackerTeam.morale,
                power: battleSystem.calculateTeamPower(attackerTeam.members),
            },
            defenderState: {
                teamId: defenderTeam.id,
                members: this.cloneTeamState(defenderTeam, defenderHeroes),
                morale: defenderTeam.morale,
                power: battleSystem.calculateTeamPower(defenderTeam.members),
            },
            events: [],
            effects: [],
        };

        const tickRate = 100;
        this.tickInterval = window.setInterval(() => {
            if (!this.currentBattle || this.currentBattle.isPaused) return;

            this.processTick(attackerHeroes, defenderHeroes);
            this.currentBattle.currentTick++;

            if (onTick) {
                onTick(this.currentBattle);
            }

            if (this.isBattleEnded()) {
                this.stopRealTimeBattle();
            }
        }, tickRate);
    }

    private processTick(
        attackerHeroes: Map<string, Hero>,
        defenderHeroes: Map<string, Hero>
    ): void {
        if (!this.currentBattle) return;

        const attackerAlive = this.currentBattle.attackerState.members.filter(m => m.isAlive);
        const defenderAlive = this.currentBattle.defenderState.members.filter(m => m.isAlive);

        if (attackerAlive.length === 0 || defenderAlive.length === 0) {
            return;
        }

        const attacker = attackerAlive[Math.floor(Math.random() * attackerAlive.length)];
        const defender = defenderAlive[Math.floor(Math.random() * defenderAlive.length)];

        const attackerHero = attackerHeroes.get(attacker.heroId);
        const defenderHero = defenderHeroes.get(defender.heroId);

        if (!attackerHero || !defenderHero) return;

        const context = this.createBattleContext(attackerHero, defenderHero, attacker, defender);
        const damage = battleSystem.calculateDamage(context);

        defender.currentHealth = Math.max(0, defender.currentHealth - damage.finalDamage);

        const event: BattleTickEvent = {
            tick: this.currentBattle.currentTick,
            timestamp: Date.now(),
            type: 'attack',
            sourceId: attacker.heroId,
            sourceName: attacker.heroName,
            targetId: defender.heroId,
            targetName: defender.heroName,
            value: damage.finalDamage,
            isCritical: damage.isCritical,
            isDodged: damage.isDodged,
            description: `${attacker.heroName} 攻击 ${defender.heroName}`,
        };

        this.currentBattle.events.push(event);

        if (defender.currentHealth <= 0) {
            defender.isAlive = false;
            this.currentBattle.events.push({
                ...event,
                type: 'death',
                value: 0,
                description: `${defender.heroName} 阵亡`,
            });
        }
    }

    private isBattleEnded(): boolean {
        if (!this.currentBattle) return true;

        const attackerAlive = this.currentBattle.attackerState.members.filter(m => m.isAlive).length;
        const defenderAlive = this.currentBattle.defenderState.members.filter(m => m.isAlive).length;

        return attackerAlive === 0 || defenderAlive === 0 || this.currentBattle.currentTick >= 1200;
    }

    pauseRealTimeBattle(): void {
        if (this.currentBattle) {
            this.currentBattle.isPaused = true;
        }
    }

    resumeRealTimeBattle(): void {
        if (this.currentBattle) {
            this.currentBattle.isPaused = false;
        }
    }

    stopRealTimeBattle(): void {
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }
        if (this.currentBattle) {
            this.currentBattle.isActive = false;
        }
    }

    getCurrentState(): RealTimeBattleState | null {
        return this.currentBattle;
    }

    getPredictionSummary(outcome: PredictedOutcome): string {
        const lines: string[] = [];
        lines.push('═'.repeat(40));
        lines.push('🔮 战斗预测');
        lines.push('═'.repeat(40));
        lines.push('');
        lines.push(`胜率预测 (样本数: ${outcome.samples})`);
        lines.push(`  进攻方: ${outcome.attackerWinRate.toFixed(1)}%`);
        lines.push(`  防守方: ${outcome.defenderWinRate.toFixed(1)}%`);
        lines.push(`  平局: ${outcome.drawRate.toFixed(1)}%`);
        lines.push('');
        lines.push(`预计回合数: ${outcome.averageRounds.toFixed(1)}`);
        lines.push(`预测置信度: ${outcome.confidence}%`);
        lines.push('');
        lines.push('═'.repeat(40));

        return lines.join('\n');
    }
}

export const battlePredictionSystem = BattlePredictionSystem.getInstance();
