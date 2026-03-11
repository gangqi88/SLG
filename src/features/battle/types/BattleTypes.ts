import { Hero, HeroStats } from './Hero';

export interface BattleUnit extends Hero {
  uniqueId: string; // Runtime unique ID (e.g., heroId_1)
  currentHp: number;
  maxHp: number;
  currentStats: HeroStats; // Stats after buffs/debuffs
  cooldowns: { [skillId: string]: number }; // Remaining cooldown in seconds
  buffs: Buff[];
  isDead: boolean;
  side: 'attacker' | 'defender';
  positionIndex: number; // 0-2 (Front, Mid, Back) - Simplified
  target?: string; // ID of current target
  shield?: number; // Absorbs damage
  lifesteal?: number; // 0-1, percentage of damage healed
  attackSpeed?: number; // Multiplier, default 1.0
  normalAttackCooldown?: number; // Timer for normal attack
  x: number;
  y: number;
  speed: number;
  range: number;
}

export interface Buff {
  id: string;
  name: string;
  duration: number; // Seconds remaining
  effect: (unit: BattleUnit) => void;
  onRemove?: (unit: BattleUnit) => void;
  isDebuff?: boolean;
}

export interface BattleLog {
  timestamp: number;
  sourceId: string;
  targetId?: string;
  action: 'attack' | 'skill' | 'heal' | 'buff' | 'death' | 'combo';
  value?: number;
  message: string;
  isCrit?: boolean;
}

export interface BattleEvent {
  type: 'attack' | 'skill' | 'heal' | 'death' | 'combo';
  sourceId?: string; // For combo, this might be null or a special system ID
  targetId?: string;
  skillId?: string; // For combo, this could be combo ID
  value?: number;
  isCrit?: boolean;
  timestamp: number;
  // Extra fields for combo
  comboName?: string;
  affectedUnitIds?: string[];
}
