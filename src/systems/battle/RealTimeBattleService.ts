// 实时战斗服务 - 负责实时战斗状态管理

import { Hero, Team } from '../../types/slg/hero.types';
import { MemberBattleState } from './BattleSimulationService';

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

export class RealTimeBattleService {
    private currentBattle: RealTimeBattleState | null = null;
    private tickInterval: number | null = null;
    private calculateDamageFn: (context: unknown) => { finalDamage: number; isCritical: boolean; isDodged: boolean };
    private calculateTeamPowerFn: (members: unknown[]) => number;
    private cloneTeamStateFn: (team: Team, heroes: Map<string, Hero>) => MemberBattleState[];

    constructor(
        calculateDamageFn: (context: unknown) => { finalDamage: number; isCritical: boolean; isDodged: boolean },
        calculateTeamPowerFn: (members: unknown[]) => number,
        cloneTeamStateFn: (team: Team, heroes: Map<string, Hero>) => MemberBattleState[]
    ) {
        this.calculateDamageFn = calculateDamageFn;
        this.calculateTeamPowerFn = calculateTeamPowerFn;
        this.cloneTeamStateFn = cloneTeamStateFn;
    }

    startBattle(
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
                members: this.cloneTeamStateFn(attackerTeam, attackerHeroes),
                morale: attackerTeam.morale,
                power: this.calculateTeamPowerFn(attackerTeam.members),
            },
            defenderState: {
                teamId: defenderTeam.id,
                members: this.cloneTeamStateFn(defenderTeam, defenderHeroes),
                morale: defenderTeam.morale,
                power: this.calculateTeamPowerFn(defenderTeam.members),
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
                this.stopBattle();
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
        const damage = this.calculateDamageFn(context);

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

    private createBattleContext(
        attacker: Hero,
        defender: Hero,
        attackerState: MemberBattleState,
        defenderState: MemberBattleState
    ): unknown {
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

    private isBattleEnded(): boolean {
        if (!this.currentBattle) return true;

        const attackerAlive = this.currentBattle.attackerState.members.filter(m => m.isAlive).length;
        const defenderAlive = this.currentBattle.defenderState.members.filter(m => m.isAlive).length;

        return attackerAlive === 0 || defenderAlive === 0 || this.currentBattle.currentTick >= 1200;
    }

    pauseBattle(): void {
        if (this.currentBattle) {
            this.currentBattle.isPaused = true;
        }
    }

    resumeBattle(): void {
        if (this.currentBattle) {
            this.currentBattle.isPaused = false;
        }
    }

    stopBattle(): void {
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
}
