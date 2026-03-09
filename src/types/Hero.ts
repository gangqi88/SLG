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
  troopType: string; // e.g., "步兵", "弓兵"
  stats: HeroStats;
  talent: Skill;
  activeSkill: Skill;
  passiveSkill: Skill;
  bond?: Bond;
  story: string;
  avatar?: string; // Path to image
}
