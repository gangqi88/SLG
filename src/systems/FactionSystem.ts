import { FactionType, FACTION_BONUS, HeroAttributes } from '../types/slg/hero.types';

export interface FactionAttribute {
  primary: keyof HeroAttributes;
  secondary: keyof HeroAttributes;
  bonus: number;
}

export interface FactionInfo {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  attributes: FactionAttribute;
  recommendedRoles: string[];
}

export class FactionSystem {
  private static instance: FactionSystem;

  private factionInfo: Record<FactionType, FactionInfo> = {
    human: {
      name: 'Human',
      description: 'Balanced warriors with strong discipline and strategy',
      strengths: ['Strategic thinking', 'Defensive tactics', 'Leadership'],
      weaknesses: ['Limited magical potential', 'Lower raw power'],
      attributes: {
        primary: 'command',
        secondary: 'defense',
        bonus: 0.15,
      },
      recommendedRoles: ['Tank', 'Support', 'Strategy'],
    },
    angel: {
      name: 'Angel',
      description: 'Divine beings with powerful magical abilities',
      strengths: ['Healing magic', 'Divine power', 'Speed'],
      weaknesses: ['Physical vulnerability', 'Group coordination'],
      attributes: {
        primary: 'strategy',
        secondary: 'command',
        bonus: 0.15,
      },
      recommendedRoles: ['Mage', 'Healer', 'Support'],
    },
    demon: {
      name: 'Demon',
      description: 'Fierce warriors with overwhelming physical power',
      strengths: ['Raw power', 'Aggression', 'Intimidation'],
      weaknesses: ['Strategic depth', 'Defensive formations'],
      attributes: {
        primary: 'strength',
        secondary: 'defense',
        bonus: 0.15,
      },
      recommendedRoles: ['DPS', 'Assassin', 'Berserker'],
    },
  };

  private constructor() {}

  static getInstance(): FactionSystem {
    if (!FactionSystem.instance) {
      FactionSystem.instance = new FactionSystem();
    }
    return FactionSystem.instance;
  }

  getFactionInfo(faction: FactionType): FactionInfo {
    return this.factionInfo[faction];
  }

  getAllFactions(): FactionType[] {
    return ['human', 'angel', 'demon'];
  }

  getFactionAdvantage(attackerFaction: FactionType, defenderFaction: FactionType): number {
    if (attackerFaction === defenderFaction) {
      return 1.0;
    }

    const key = `${attackerFaction}->${defenderFaction}` as keyof typeof FACTION_BONUS;
    const advantage = FACTION_BONUS[key];

    return advantage !== undefined ? 1 + advantage : 1.0;
  }

  calculateFactionBonus(
    attackerFaction: FactionType,
    defenderFaction: FactionType,
    baseDamage: number
  ): number {
    const advantage = this.getFactionAdvantage(attackerFaction, defenderFaction);
    return Math.round(baseDamage * advantage);
  }

  getPrimaryAttribute(faction: FactionType): keyof HeroAttributes {
    return this.factionInfo[faction].attributes.primary;
  }

  getSecondaryAttribute(faction: FactionType): keyof HeroAttributes {
    return this.factionInfo[faction].attributes.secondary;
  }

  getAttributeBonus(faction: FactionType): number {
    return this.factionInfo[faction].attributes.bonus;
  }

  applyFactionAttributeBonus(
    faction: FactionType,
    attributes: HeroAttributes
  ): HeroAttributes {
    const primary = this.getPrimaryAttribute(faction);
    const secondary = this.getSecondaryAttribute(faction);
    const bonus = this.getAttributeBonus(faction);

    return {
      ...attributes,
      [primary]: Math.round(attributes[primary] * (1 + bonus)),
      [secondary]: Math.round(attributes[secondary] * (1 + bonus * 0.5)),
    };
  }

  getRecommendedRoles(faction: FactionType): string[] {
    return this.factionInfo[faction].recommendedRoles;
  }

  checkFactionSynergy(factions: FactionType[]): number {
    const uniqueFactions = new Set(factions);
    if (uniqueFactions.size === 1) {
      return 0.15;
    }
    if (uniqueFactions.size === 2) {
      return 0.08;
    }
    return 0;
  }

  getCounteredBy(faction: FactionType): FactionType {
    const counters: Record<FactionType, FactionType> = {
      human: 'demon',
      angel: 'human',
      demon: 'angel',
    };
    return counters[faction];
  }

  getCounters(faction: FactionType): FactionType {
    const counters: Record<FactionType, FactionType> = {
      human: 'angel',
      angel: 'demon',
      demon: 'human',
    };
    return counters[faction];
  }
}

export const factionSystem = FactionSystem.getInstance();
