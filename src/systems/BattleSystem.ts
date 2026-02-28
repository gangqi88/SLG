import { HeroAttributes, FactionType, Buff, Debuff, TeamMember, SkillEffect } from '../types/slg/hero.types';
import { factionSystem } from './FactionSystem';

export interface DamageResult {
  baseDamage: number;
  finalDamage: number;
  isCritical: boolean;
  isDodged: boolean;
  damageType: 'physical' | 'magical' | 'true';
  breakdown: DamageBreakdown;
}

export interface DamageBreakdown {
  attributeDamage: number;
  factionBonus: number;
  skillMultiplier: number;
  criticalBonus: number;
  buffDebuffBonus: number;
  defenseReduction: number;
}

export interface BattleContext {
  attackerFaction: FactionType;
  defenderFaction: FactionType;
  attackerAttributes: HeroAttributes;
  defenderAttributes: HeroAttributes;
  attackerLevel: number;
  defenderLevel: number;
  skillMultiplier: number;
  isPhysical: boolean;
  attackerBuffs: Buff[];
  attackerDebuffs: Debuff[];
  defenderBuffs: Buff[];
  defenderDebuffs: Debuff[];
  battleField?: {
    terrain?: string;
    weather?: string;
    timeOfDay?: string;
  };
}

export interface HealResult {
  baseHeal: number;
  finalHeal: number;
  isCritical: boolean;
}

export interface SkillEffectResult {
  success: boolean;
  effects: SkillEffect[];
  damage?: DamageResult;
  heal?: HealResult;
  buffs?: Buff[];
  debuffs?: Debuff[];
}

export class BattleSystem {
  private static instance: BattleSystem;

  private baseCritRate = 0.05;
  private baseDodgeRate = 0.1;

  private critDamageMultiplier = 1.5;
  private levelDamageBonus = 0.02;

  private constructor() {}

  static getInstance(): BattleSystem {
    if (!BattleSystem.instance) {
      BattleSystem.instance = new BattleSystem();
    }
    return BattleSystem.instance;
  }

  calculateAttributeDamage(
    attribute: keyof HeroAttributes,
    attributes: HeroAttributes,
    isPhysical: boolean
  ): number {
    const baseValue = attributes[attribute];

    if (isPhysical) {
      return Math.round(baseValue * 2.5);
    }
    return Math.round(baseValue * 2.2);
  }

  calculateDefenseReduction(
    defenderDefense: number,
    defenderLevel: number,
    isPhysical: boolean
  ): number {
    const defenseFactor = isPhysical ? 0.6 : 0.5;
    const levelFactor = defenderLevel * this.levelDamageBonus;

    const reduction = defenderDefense * defenseFactor;
    const cappedReduction = Math.min(reduction, 0.75);

    return cappedReduction + levelFactor;
  }

  calculateCriticalHit(
    _attackerAttributes: HeroAttributes,
    attackerBuffs: Buff[],
    baseCritRate: number = this.baseCritRate
  ): { isCritical: boolean; critRate: number; critDamage: number } {
    let critRate = baseCritRate;

    const critBuffs = attackerBuffs.filter(b => b.type === 'critRate' || b.type === 'criticalChance');
    for (const buff of critBuffs) {
      critRate += buff.value / 100;
    }

    critRate = Math.min(critRate, 0.75);

    const roll = Math.random();
    const isCritical = roll < critRate;

    let critDamage = this.critDamageMultiplier;
    const critDamageBuffs = attackerBuffs.filter(b => b.type === 'critDamage' || b.type === 'criticalDamage');
    for (const buff of critDamageBuffs) {
      critDamage += buff.value / 100;
    }

    return { isCritical, critRate, critDamage };
  }

  calculateDodge(
    _defenderAttributes: HeroAttributes,
    defenderBuffs: Buff[],
    attackerBuffs: Buff[],
    baseDodgeRate: number = this.baseDodgeRate
  ): boolean {
    let dodgeRate = baseDodgeRate;

    const dodgeBuffs = defenderBuffs.filter(b => b.type === 'dodge' || b.type === 'evasion');
    for (const buff of dodgeBuffs) {
      dodgeRate += buff.value / 100;
    }

    const accuracyDebuffs = attackerBuffs.filter(b => b.type === 'accuracy' || b.type === 'hitChance');
    for (const debuff of accuracyDebuffs) {
      dodgeRate -= debuff.value / 100;
    }

    dodgeRate = Math.max(0.02, Math.min(dodgeRate, 0.5));

    return Math.random() < dodgeRate;
  }

  calculateDamage(context: BattleContext): DamageResult {
    const attribute = context.isPhysical ? 'strength' : 'strategy';
    const attributeDamage = this.calculateAttributeDamage(
      attribute,
      context.attackerAttributes,
      context.isPhysical
    );

    const factionBonus = factionSystem.calculateFactionBonus(
      context.attackerFaction,
      context.defenderFaction,
      1
    ) - 1;

    const { isCritical, critDamage } = this.calculateCriticalHit(
      context.attackerAttributes,
      context.attackerBuffs
    );

    const isDodged = this.calculateDodge(
      context.defenderAttributes,
      context.defenderBuffs,
      context.attackerBuffs
    );

    if (isDodged) {
      return {
        baseDamage: attributeDamage,
        finalDamage: 0,
        isCritical: false,
        isDodged: true,
        damageType: context.isPhysical ? 'physical' : 'magical',
        breakdown: {
          attributeDamage,
          factionBonus: 0,
          skillMultiplier: context.skillMultiplier,
          criticalBonus: 0,
          buffDebuffBonus: 0,
          defenseReduction: 0,
        },
      };
    }

    let buffDebuffBonus = 0;
    const attackBuffs = context.attackerBuffs.filter(
      b => b.type === 'attack' || b.type === 'damageBoost' || b.type === 'attackPower'
    );
    for (const buff of attackBuffs) {
      buffDebuffBonus += buff.value / 100;
    }

    const defenseReduction = this.calculateDefenseReduction(
      context.defenderAttributes.defense,
      context.defenderLevel,
      context.isPhysical
    );

    let finalDamage = attributeDamage * context.skillMultiplier;
    finalDamage *= (1 + factionBonus);
    finalDamage *= (1 + buffDebuffBonus);
    finalDamage *= (1 - defenseReduction);

    if (isCritical) {
      finalDamage *= critDamage;
    }

    const levelBonus = 1 + (context.attackerLevel - context.defenderLevel) * this.levelDamageBonus;
    finalDamage *= levelBonus;

    finalDamage = Math.round(Math.max(1, finalDamage));

    return {
      baseDamage: attributeDamage,
      finalDamage,
      isCritical,
      isDodged: false,
      damageType: context.isPhysical ? 'physical' : 'magical',
      breakdown: {
        attributeDamage,
        factionBonus: Math.round(factionBonus * 100),
        skillMultiplier: context.skillMultiplier,
        criticalBonus: isCritical ? Math.round((critDamage - 1) * 100) : 0,
        buffDebuffBonus: Math.round(buffDebuffBonus * 100),
        defenseReduction: Math.round(defenseReduction * 100),
      },
    };
  }

  calculateHeal(
    healerAttributes: HeroAttributes,
    healPower: number,
    healerBuffs: Buff[],
    targetMaxHealth: number
  ): HealResult {
    const baseHeal = Math.round(healerAttributes.strategy * healPower);

    let healMultiplier = 1;
    const healBuffs = healerBuffs.filter(b => b.type === 'healBoost' || b.type === 'healingPower');
    for (const buff of healBuffs) {
      healMultiplier += buff.value / 100;
    }

    const { isCritical } = this.calculateCriticalHit(healerAttributes, healerBuffs, 0.1);

    let finalHeal = baseHeal * healMultiplier;
    if (isCritical) {
      finalHeal *= 1.5;
    }

    finalHeal = Math.round(Math.min(finalHeal, targetMaxHealth * 0.35));

    return {
      baseHeal,
      finalHeal,
      isCritical,
    };
  }

  applyBuff(buff: Buff, attributes: HeroAttributes): HeroAttributes {
    const modified = { ...attributes };

    switch (buff.type) {
      case 'attack':
      case 'damageBoost':
        modified.strength = Math.round(modified.strength * (1 + buff.value / 100));
        break;
      case 'magicPower':
      case 'strategyBoost':
        modified.strategy = Math.round(modified.strategy * (1 + buff.value / 100));
        break;
      case 'defense':
        modified.defense = Math.round(modified.defense * (1 + buff.value / 100));
        break;
      case 'command':
        modified.command = Math.round(modified.command * (1 + buff.value / 100));
        break;
      case 'critRate':
      case 'criticalChance':
        break;
      case 'critDamage':
      case 'criticalDamage':
        break;
      case 'dodge':
      case 'evasion':
        break;
    }

    return modified;
  }

  updateBuffs(buffs: Buff[], deltaTime: number): Buff[] {
    return buffs
      .map(buff => ({
        ...buff,
        duration: buff.duration - deltaTime,
      }))
      .filter(buff => buff.duration > 0);
  }

  updateDebuffs(debuffs: Debuff[], deltaTime: number): Debuff[] {
    return debuffs
      .map(debuff => ({
        ...debuff,
        duration: debuff.duration - deltaTime,
      }))
      .filter(debuff => debuff.duration > 0);
  }

  calculateTeamPower(members: TeamMember[]): number {
    let totalPower = 0;

    for (const member of members) {
      const healthFactor = member.currentHealth / member.maxHealth;
      const manaFactor = member.mana / member.maxMana;

      let memberPower = member.maxHealth * 0.1;
      memberPower *= healthFactor;
      memberPower += member.mana * 2;

      const buffPower = member.buffs.reduce((sum, b) => sum + b.value, 0);
      const debuffPower = member.debuffs.reduce((sum, d) => sum + d.value, 0);

      memberPower *= (1 + (buffPower - debuffPower) / 100);
      memberPower *= manaFactor > 0.5 ? 1.1 : 0.9;

      totalPower += Math.round(memberPower);
    }

    return totalPower;
  }

  calculateBattleOutcome(
    attackerPower: number,
    defenderPower: number,
    attackerMorale: number = 50,
    defenderMorale: number = 50
  ): { winner: 'attacker' | 'defender'; winProbability: number } {
    const powerRatio = attackerPower / defenderPower;

    const moraleFactor = (attackerMorale - defenderMorale) / 200;

    let winProbability = powerRatio / (powerRatio + 1);
    winProbability += moraleFactor;

    winProbability = Math.max(0.05, Math.min(0.95, winProbability));

    const roll = Math.random();
    const winner = roll < winProbability ? 'attacker' : 'defender';

    return { winner, winProbability: Math.round(winProbability * 100) };
  }
}

export const battleSystem = BattleSystem.getInstance();
