import { Hero, Team, TeamMember } from '../types/slg/hero.types';
import { slgSkillSystem, BattleStateInfo } from './SLGSkillSystem';
import { generateId } from '../utils/helpers';

export interface BattleEvent {
  id: string;
  turn: number;
  round: number;
  type: 'attack' | 'skill' | 'buff' | 'debuff' | 'heal' | 'death';
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
  value: number;
  description: string;
  timestamp: number;
}

export interface BattleRound {
  roundNumber: number;
  attackerEvents: BattleEvent[];
  defenderEvents: BattleEvent[];
}

export interface BattleResult {
  winner: 'attacker' | 'defender' | 'draw';
  attackerPower: number;
  defenderPower: number;
  winProbability: number;
  rounds: BattleRound[];
  events: BattleEvent[];
  attackerCasualties: number;
  defenderCasualties: number;
  duration: number;
}

export interface BattleConfig {
  isFieldBattle: boolean;
  isFortressBattle: boolean;
  weather?: string;
  autoBattle: boolean;
}

export class BattleManager {
  private static instance: BattleManager;
  
  private currentBattle: {
    attacker: Team;
    defender: Team;
    config: BattleConfig;
    startTime: number;
    currentTurn: number;
    currentRound: number;
    events: BattleEvent[];
    attackerHeroes: Map<string, Hero>;
    defenderHeroes: Map<string, Hero>;
  } | null = null;

  private constructor() {}

  static getInstance(): BattleManager {
    if (!BattleManager.instance) {
      BattleManager.instance = new BattleManager();
    }
    return BattleManager.instance;
  }

  startBattle(
    attackerTeam: Team,
    defenderTeam: Team,
    attackerHeroes: Map<string, Hero>,
    defenderHeroes: Map<string, Hero>,
    config: BattleConfig
  ): BattleResult {
    this.currentBattle = {
      attacker: attackerTeam,
      defender: defenderTeam,
      config,
      startTime: Date.now(),
      currentTurn: 0,
      currentRound: 0,
      events: [],
      attackerHeroes,
      defenderHeroes
    };

    const rounds: BattleRound[] = [];
    const maxRounds = 20;

    while (this.currentBattle.currentRound < maxRounds) {
      this.currentBattle.currentRound++;
      
      const roundResult = this.processRound();
      rounds.push(roundResult);

      const attackerAlive = this.getAliveCount(attackerTeam, attackerHeroes);
      const defenderAlive = this.getAliveCount(defenderTeam, defenderHeroes);

      if (attackerAlive === 0 || defenderAlive === 0) {
        break;
      }
    }

    const result = this.calculateBattleResult(rounds);
    
    this.currentBattle = null;
    return result;
  }

  private processRound(): BattleRound {
    if (!this.currentBattle) throw new Error('No active battle');

    const round: BattleRound = {
      roundNumber: this.currentBattle.currentRound,
      attackerEvents: [],
      defenderEvents: []
    };

    const attackerTeam = this.currentBattle.attacker;
    const defenderTeam = this.currentBattle.defender;

    this.processTurn(attackerTeam, defenderTeam, this.currentBattle.attackerHeroes, this.currentBattle.defenderHeroes, round.attackerEvents);
    this.processTurn(defenderTeam, attackerTeam, this.currentBattle.defenderHeroes, this.currentBattle.attackerHeroes, round.defenderEvents);

    this.currentBattle.events.push(...round.attackerEvents, ...round.defenderEvents);

    return round;
  }

  private processTurn(
    attackerTeam: Team,
    defenderTeam: Team,
    attackerHeroes: Map<string, Hero>,
    defenderHeroes: Map<string, Hero>,
    events: BattleEvent[]
  ): void {
    if (!this.currentBattle) return;

    attackerTeam.members.forEach(member => {
      const hero = attackerHeroes.get(member.heroId);
      if (!hero || member.currentHealth <= 0) return;

      const battleState: BattleStateInfo = {
        currentTurn: this.currentBattle!.currentTurn,
        roundNumber: this.currentBattle!.currentRound,
        casterHealthPercent: (member.currentHealth / member.maxHealth) * 100,
        isFieldBattle: this.currentBattle!.config.isFieldBattle,
        isFortressBattle: this.currentBattle!.config.isFortressBattle,
        weather: this.currentBattle!.config.weather
      };

      const canUseSkill = Math.random() < 0.3 && slgSkillSystem.isSkillReady(hero.id, hero.activeSkill.id);
      
      if (canUseSkill) {
        const targets = this.selectSkillTargets(hero, defenderTeam, defenderHeroes);
        if (targets.length > 0) {
          const result = slgSkillSystem.castSkill(hero, hero.activeSkill, targets, battleState);
          
          if (result.success) {
            result.effects.forEach(effect => {
              const targetHero = defenderHeroes.get(effect.targetId);
              if (targetHero) {
                events.push(this.createBattleEvent(
                  'skill',
                  hero.id,
                  hero.name,
                  targetHero.id,
                  targetHero.name,
                  effect.value,
                  result.skillName + ': ' + effect.description
                ));

                if (effect.type === 'damage') {
                  this.applyDamage(targetHero, member, effect.value);
                } else if (effect.type === 'heal') {
                  this.applyHealing(member, effect.value);
                }
              }
            });
          }
        }
      } else {
        const target = this.selectAttackTarget(defenderTeam);
        if (target) {
          const targetHero = defenderHeroes.get(target.heroId);
          if (targetHero) {
            const damage = this.calculateAttackDamage(hero, targetHero, battleState);
            
            events.push(this.createBattleEvent(
              'attack',
              hero.id,
              hero.name,
              targetHero.id,
              targetHero.name,
              damage,
              `普通攻击造成 ${damage} 伤害`
            ));

            this.applyDamage(targetHero, target, damage);
          }
        }
      }
    });
  }

  private selectSkillTargets(
    caster: Hero,
    targetTeam: Team,
    targetHeroes: Map<string, Hero>
  ): Hero[] {
    const aliveTargets = targetTeam.members
      .filter(m => m.currentHealth > 0)
      .map(m => targetHeroes.get(m.heroId))
      .filter((h): h is Hero => h !== undefined);

    if (caster.activeSkill.effects[0]?.target === 'enemy' || caster.activeSkill.effects[0]?.target === 'all') {
      return aliveTargets;
    }
    
    return aliveTargets.slice(0, 1);
  }

  private selectAttackTarget(targetTeam: Team): TeamMember | null {
    const aliveMembers = targetTeam.members.filter(m => m.currentHealth > 0);
    if (aliveMembers.length === 0) return null;
    
    return aliveMembers[Math.floor(Math.random() * aliveMembers.length)];
  }

  private calculateAttackDamage(attacker: Hero, defender: Hero, battleState: BattleStateInfo): number {
    const attributes = slgSkillSystem.applyPassiveSkillBonuses(attacker, attacker.attributes, battleState);
    
    const baseDamage = attributes.strength * 0.8;
    
    let factionBonus = 1;
    if (attacker.faction === 'demon' && defender.faction === 'human') factionBonus = 1.25;
    else if (attacker.faction === 'human' && defender.faction === 'angel') factionBonus = 1.2;
    else if (attacker.faction === 'angel' && defender.faction === 'demon') factionBonus = 1.3;

    const isCrit = Math.random() < 0.05;
    const critMultiplier = isCrit ? 1.5 : 1;

    const defenseReduction = defender.attributes.defense / (defender.attributes.defense + 200);
    const finalDamage = Math.round(baseDamage * factionBonus * critMultiplier * (1 - defenseReduction));

    return finalDamage;
  }

  private applyDamage(targetHero: Hero, targetMember: TeamMember, damage: number): void {
    const actualDamage = Math.max(1, damage);
    targetMember.currentHealth = Math.max(0, targetMember.currentHealth - actualDamage);

    if (targetMember.currentHealth === 0) {
      this.currentBattle?.events.push(this.createBattleEvent(
        'death',
        'system',
        '系统',
        targetHero.id,
        targetHero.name,
        0,
        `${targetHero.name} 阵亡`
      ));
    }
  }

  private applyHealing(targetMember: TeamMember, healAmount: number): void {
    const actualHeal = Math.min(healAmount, targetMember.maxHealth - targetMember.currentHealth);
    targetMember.currentHealth = Math.min(targetMember.maxHealth, targetMember.currentHealth + actualHeal);
  }

  private getAliveCount(team: Team, heroes: Map<string, Hero>): number {
    return team.members.filter(m => {
      const hero = heroes.get(m.heroId);
      return hero && m.currentHealth > 0;
    }).length;
  }

  private createBattleEvent(
    type: BattleEvent['type'],
    sourceId: string,
    sourceName: string,
    targetId: string,
    targetName: string,
    value: number,
    description: string
  ): BattleEvent {
    return {
      id: generateId(),
      turn: this.currentBattle?.currentTurn || 0,
      round: this.currentBattle?.currentRound || 0,
      type,
      sourceId,
      sourceName,
      targetId,
      targetName,
      value,
      description,
      timestamp: Date.now()
    };
  }

  private calculateBattleResult(rounds: BattleRound[]): BattleResult {
    if (!this.currentBattle) throw new Error('No battle data');

    const attackerAlive = this.getAliveCount(this.currentBattle.attacker, this.currentBattle.attackerHeroes);
    const defenderAlive = this.getAliveCount(this.currentBattle.defender, this.currentBattle.defenderHeroes);

    let winner: 'attacker' | 'defender' | 'draw';
    if (attackerAlive > defenderAlive) winner = 'attacker';
    else if (defenderAlive > attackerAlive) winner = 'defender';
    else winner = 'draw';

    const attackerPower = this.calculateTeamPower(this.currentBattle.attacker, this.currentBattle.attackerHeroes);
    const defenderPower = this.calculateTeamPower(this.currentBattle.defender, this.currentBattle.defenderHeroes);

    const powerRatio = attackerPower / (attackerPower + defenderPower);
    const winProbability = Math.round(powerRatio * 100);

    const events = this.currentBattle.events;
    const attackerCasualties = this.calculateCasualties(this.currentBattle.attacker);
    const defenderCasualties = this.calculateCasualties(this.currentBattle.defender);
    const duration = Date.now() - this.currentBattle.startTime;

    return {
      winner,
      attackerPower,
      defenderPower,
      winProbability,
      rounds,
      events,
      attackerCasualties,
      defenderCasualties,
      duration
    };
  }

  private calculateTeamPower(team: Team, heroes: Map<string, Hero>): number {
    return team.members.reduce((sum, member) => {
      const hero = heroes.get(member.heroId);
      if (!hero) return sum;
      
      const healthPercent = member.currentHealth / member.maxHealth;
      const basePower = hero.attributes.strength * 1.5 + hero.attributes.strategy * 1.3 + hero.attributes.defense;
      
      return sum + Math.round(basePower * healthPercent);
    }, 0);
  }

  private calculateCasualties(team: Team): number {
    return team.members.filter(m => m.currentHealth <= 0).length;
  }

  getBattleReplay(): BattleEvent[] {
    return this.currentBattle?.events || [];
  }

  simulateBattle(
    attackerTeam: Team,
    defenderTeam: Team,
    attackerHeroes: Map<string, Hero>,
    defenderHeroes: Map<string, Hero>
  ): { winner: 'attacker' | 'defender'; winProbability: number } {
    const attackerPower = this.calculateTeamPower(attackerTeam, attackerHeroes);
    const defenderPower = this.calculateTeamPower(defenderTeam, defenderHeroes);

    let winProbability = attackerPower / (attackerPower + defenderPower);
    
    const attackerMoraleBonus = (attackerTeam.morale - 50) / 500;
    const defenderMoraleBonus = (defenderTeam.morale - 50) / 500;
    
    winProbability += attackerMoraleBonus - defenderMoraleBonus;
    winProbability = Math.max(0.05, Math.min(0.95, winProbability));

    const roll = Math.random();
    const winner = roll < winProbability ? 'attacker' : 'defender';

    return {
      winner,
      winProbability: Math.round(winProbability * 100)
    };
  }
}

export const battleManager = BattleManager.getInstance();
