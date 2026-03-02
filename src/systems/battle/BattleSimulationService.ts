// 战斗模拟服务 - 负责战斗模拟逻辑

import { Hero, Team, Buff, Debuff } from '../../types/slg/hero.types';
import { generateId } from '../../utils/helpers';

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

export interface SimulationResult {
    winner: 'attacker' | 'defender' | 'draw';
    rounds: number;
    attackerDamage: number;
    defenderDamage: number;
    attackerCasualties: number;
    defenderCasualties: number;
}

export interface BattleContextInput {
    attacker: Hero;
    defender: Hero;
    attackerState: MemberBattleState;
    defenderState: MemberBattleState;
}

export class BattleSimulationService {
    private calculateDamageFn: (context: unknown) => { finalDamage: number; isCritical: boolean; isDodged: boolean };

    constructor(calculateDamageFn: (context: unknown) => { finalDamage: number; isCritical: boolean; isDodged: boolean }) {
        this.calculateDamageFn = calculateDamageFn;
    }

    cloneTeamState(team: Team, heroes: Map<string, Hero>): MemberBattleState[] {
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

    simulateSingleBattle(
        attackerTeam: Team,
        defenderTeam: Team,
        attackerHeroes: Map<string, Hero>,
        defenderHeroes: Map<string, Hero>
    ): SimulationResult {
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
            return { winner: 'attacker', rounds, attackerDamage: 0, defenderDamage: 0, attackerCasualties: 0, defenderCasualties: 0 };
        } else if (defenderPower > attackerPower) {
            return { winner: 'defender', rounds, attackerDamage: 0, defenderDamage: 0, attackerCasualties: 0, defenderCasualties: 0 };
        }

        return { winner: 'draw', rounds, attackerDamage: 0, defenderDamage: 0, attackerCasualties: 0, defenderCasualties: 0 };
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
            const damage = this.calculateDamageFn(context);

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
            const damage = this.calculateDamageFn(context);

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

    private calculateStatePower(members: MemberBattleState[]): number {
        return members.reduce((sum, m) => {
            if (!m.isAlive) return sum;
            return sum + m.currentHealth;
        }, 0);
    }

    calculateStatePowerPublic(members: MemberBattleState[]): number {
        return this.calculateStatePower(members);
    }
}
