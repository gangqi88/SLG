export enum Race {
  HUMAN = 'Human',
  ANGEL = 'Angel',
  DEMON = 'Demon',
}

export enum Quality {
  PURPLE = 'Purple', // Elite
  ORANGE = 'Orange', // Epic
  RED = 'Red', // Legendary
}

export enum TroopType {
  INFANTRY = 'Infantry', // 步兵
  ARCHER = 'Archer', // 弓兵 (Ranged)
  CAVALRY = 'Cavalry', // 骑兵 (Fast)
  MAGE = 'Mage', // 法师 (Magic Damage)
  FLYING = 'Flying', // 飞行 (Ignores terrain, melee/ranged)
  SIEGE = 'Siege', // 攻城 (High dmg vs structures/defense)
  STRUCTURE = 'Structure', // 建筑 (Immobile, High HP)
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'Active' | 'Passive' | 'Talent';
  cooldown?: number; // In seconds, only for Active skills
  effect?: any; // To be defined later for actual implementation
}

export interface Bond {
  id: string;
  name: string;
  description: string;
  requiredHeroes: string[]; // List of Hero IDs
  effect: string;
}

export interface HeroStats {
  command: number; // 统御
  strength: number; // 武力
  strategy: number; // 谋略
  defense: number; // 防御
}

export interface Hero {
  id: string;
  name: string;
  race: Race;
  quality: Quality;
  position: string; // e.g., "内政核心", "防御坦克"
  troopType: TroopType | string; // Updated to use Enum but keep string compatibility for now
  stats: HeroStats;
  level: number;
  exp: number;
  starRating: number; // 1-5
  equipment: (string | null)[]; // 4 slots, storing equipment IDs or null
  talent: Skill;
  activeSkill: Skill;
  passiveSkill: Skill;
  bond?: Bond;
  story: string;
  avatar?: string; // Path to image
}
