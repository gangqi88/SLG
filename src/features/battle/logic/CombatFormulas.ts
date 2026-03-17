import { Race, HeroStats, TroopType } from '@/features/hero/types/Hero';

// Damage Constants
const NORMAL_ATTACK_COEFF = 0.8;
const SKILL_HEALING_COEFF = 1.2;
const BASE_CRIT_RATE = 0.05;
const BASE_CRIT_DAMAGE = 1.5;

// Restraint Bonuses (Race)
const RACE_RESTRAINT_BONUS: Partial<Record<Race, Partial<Record<Race, number>>>> = {
  [Race.DEMON]: { [Race.HUMAN]: 0.25 },
  [Race.HUMAN]: { [Race.ANGEL]: 0.2 },
  [Race.ANGEL]: { [Race.DEMON]: 0.3 },
};

// Restraint Bonuses (Troop Type)
// Infantry > Cavalry > Archer > Infantry
// Mage > Siege > Flying > Mage
const TROOP_RESTRAINT_BONUS: Partial<Record<TroopType, Partial<Record<TroopType, number>>>> = {
  [TroopType.INFANTRY]: { [TroopType.CAVALRY]: 0.2 },
  [TroopType.CAVALRY]: { [TroopType.ARCHER]: 0.2 },
  [TroopType.ARCHER]: { [TroopType.INFANTRY]: 0.2, [TroopType.FLYING]: 0.4 }, // Archers counter Flying heavily
  [TroopType.MAGE]: { [TroopType.SIEGE]: 0.25, [TroopType.INFANTRY]: 0.1 },
  [TroopType.SIEGE]: { [TroopType.FLYING]: -0.3, [TroopType.INFANTRY]: 0.3 }, // Siege bad vs Flying, good vs Infantry
  [TroopType.FLYING]: { [TroopType.MAGE]: 0.2, [TroopType.INFANTRY]: 0.15 },
};

/**
 * Calculate damage reduction percentage based on defense.
 * Formula: Defense / (Defense + 200)
 */
export const calculateDamageReduction = (defense: number): number => {
  return defense / (defense + 200);
};

/**
 * Calculate race restraint bonus.
 * Returns a multiplier (e.g., 1.25 for +25%).
 */
export const getRaceRestraintMultiplier = (attackerRace: Race, defenderRace: Race): number => {
  const bonus = RACE_RESTRAINT_BONUS[attackerRace]?.[defenderRace] || 0;
  return 1 + bonus;
};

/**
 * Calculate troop restraint bonus.
 */
export const getTroopRestraintMultiplier = (
  attackerTroop: TroopType | string,
  defenderTroop: TroopType | string,
): number => {
  // Safe cast or check if string matches enum
  const att = attackerTroop as TroopType;
  const def = defenderTroop as TroopType;
  const bonus = TROOP_RESTRAINT_BONUS[att]?.[def] || 0;
  return 1 + bonus;
};

/**
 * Calculate normal attack damage.
 * Formula: (Strength * 0.8) * (1 - Reduction) * RaceRestraint * TroopRestraint * Random(0.95, 1.05)
 */
export const calculateNormalDamage = (
  attackerStats: HeroStats,
  attackerRace: Race,
  attackerTroop: TroopType | string,
  defenderStats: HeroStats,
  defenderRace: Race,
  defenderTroop: TroopType | string,
): { damage: number; isCrit: boolean } => {
  const baseDamage = attackerStats.strength * NORMAL_ATTACK_COEFF;
  const reduction = calculateDamageReduction(defenderStats.defense);
  const raceRestraint = getRaceRestraintMultiplier(attackerRace, defenderRace);
  const troopRestraint = getTroopRestraintMultiplier(attackerTroop, defenderTroop);

  // Crit calculation
  const isCrit = Math.random() < BASE_CRIT_RATE;

  let finalDamage = baseDamage * (1 - reduction) * raceRestraint * troopRestraint;

  if (isCrit) {
    finalDamage *= BASE_CRIT_DAMAGE;
  }

  // Add some randomness +/- 5%
  const randomness = 0.95 + Math.random() * 0.1;
  finalDamage *= randomness;

  return {
    damage: Math.max(1, Math.round(finalDamage)),
    isCrit,
  };
};

/**
 * Calculate skill damage.
 * Formula: (Strategy * Coefficient) * (1 - Reduction) * Restraints
 */
export const calculateSkillDamage = (
  attackerStats: HeroStats,
  attackerRace: Race,
  attackerTroop: TroopType | string,
  defenderStats: HeroStats,
  defenderRace: Race,
  defenderTroop: TroopType | string,
  skillCoefficient: number,
): { damage: number; isCrit: boolean } => {
  const baseDamage = attackerStats.strategy * skillCoefficient;

  const reduction = calculateDamageReduction(defenderStats.defense);
  const raceRestraint = getRaceRestraintMultiplier(attackerRace, defenderRace);
  const troopRestraint = getTroopRestraintMultiplier(attackerTroop, defenderTroop);

  const isCrit = Math.random() < BASE_CRIT_RATE;

  let finalDamage = baseDamage * (1 - reduction) * raceRestraint * troopRestraint;

  if (isCrit) {
    finalDamage *= BASE_CRIT_DAMAGE;
  }

  return {
    damage: Math.max(1, Math.round(finalDamage)),
    isCrit,
  };
};

/**
 * Calculate healing amount.
 * Formula: Strategy * 1.2
 */
export const calculateHealing = (healerStats: HeroStats): { healing: number; isCrit: boolean } => {
  const baseHealing = healerStats.strategy * SKILL_HEALING_COEFF;
  const isCrit = Math.random() < BASE_CRIT_RATE;

  let finalHealing = baseHealing;
  if (isCrit) {
    finalHealing *= BASE_CRIT_DAMAGE;
  }

  return {
    healing: Math.round(finalHealing),
    isCrit,
  };
};
