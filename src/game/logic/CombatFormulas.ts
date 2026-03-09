import { Race, HeroStats } from '../../types/Hero';

// Damage Constants
const NORMAL_ATTACK_COEFF = 0.8;
const SKILL_HEALING_COEFF = 1.2;
const BASE_CRIT_RATE = 0.05;
const BASE_CRIT_DAMAGE = 1.5;
const MAX_CRIT_RATE = 0.60;
const MAX_CRIT_DAMAGE = 3.00;

// Restraint Bonuses
const RESTRAINT_BONUS = {
  [Race.DEMON]: { [Race.HUMAN]: 0.25 },
  [Race.HUMAN]: { [Race.ANGEL]: 0.20 },
  [Race.ANGEL]: { [Race.DEMON]: 0.30 },
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
export const getRestraintMultiplier = (attackerRace: Race, defenderRace: Race): number => {
  const bonus = RESTRAINT_BONUS[attackerRace]?.[defenderRace] || 0;
  return 1 + bonus;
};

/**
 * Calculate normal attack damage.
 * Formula: (Strength * 0.8) * (1 - Reduction) * Restraint * Random(0.95, 1.05)
 */
export const calculateNormalDamage = (
  attackerStats: HeroStats,
  attackerRace: Race,
  defenderStats: HeroStats,
  defenderRace: Race
): { damage: number; isCrit: boolean } => {
  const baseDamage = attackerStats.strength * NORMAL_ATTACK_COEFF;
  const reduction = calculateDamageReduction(defenderStats.defense);
  const restraint = getRestraintMultiplier(attackerRace, defenderRace);
  
  // Crit calculation
  let isCrit = Math.random() < BASE_CRIT_RATE; // Simple base crit for now
  // In a full implementation, crit rate might be affected by stats or skills
  
  let finalDamage = baseDamage * (1 - reduction) * restraint;
  
  if (isCrit) {
    finalDamage *= BASE_CRIT_DAMAGE;
  }
  
  // Add some randomness +/- 5%
  const randomness = 0.95 + Math.random() * 0.1;
  finalDamage *= randomness;

  return {
    damage: Math.max(1, Math.round(finalDamage)),
    isCrit
  };
};

/**
 * Calculate skill damage.
 * Formula: (Strategy * Coefficient) * (1 - Reduction) * Restraint
 */
export const calculateSkillDamage = (
  attackerStats: HeroStats,
  attackerRace: Race,
  defenderStats: HeroStats,
  defenderRace: Race,
  skillCoefficient: number // e.g., 1.5 for 150% damage
): { damage: number; isCrit: boolean } => {
  const baseDamage = attackerStats.strategy * skillCoefficient;
  // Skill damage usually ignores some defense or uses strategy defense, but for simplicity we use physical defense formula here unless specified otherwise.
  // The document says "Strategy: Skill Damage / Healing", implies Strategy is the source.
  // Defense: "Damage Reduction". Usually applies to all damage.
  
  const reduction = calculateDamageReduction(defenderStats.defense);
  const restraint = getRestraintMultiplier(attackerRace, defenderRace);
  
  let isCrit = Math.random() < BASE_CRIT_RATE;
  
  let finalDamage = baseDamage * (1 - reduction) * restraint;
  
  if (isCrit) {
    finalDamage *= BASE_CRIT_DAMAGE;
  }

  return {
    damage: Math.max(1, Math.round(finalDamage)),
    isCrit
  };
};

/**
 * Calculate healing amount.
 * Formula: Strategy * 1.2
 */
export const calculateHealing = (healerStats: HeroStats): { healing: number; isCrit: boolean } => {
  const baseHealing = healerStats.strategy * SKILL_HEALING_COEFF;
  let isCrit = Math.random() < BASE_CRIT_RATE;
  
  let finalHealing = baseHealing;
  if (isCrit) {
    finalHealing *= BASE_CRIT_DAMAGE;
  }
  
  return {
    healing: Math.round(finalHealing),
    isCrit
  };
};
