import { Hero, Race, Quality, TroopType } from '@/features/hero/types/Hero';

export const WALL_HERO: Hero = {
  id: 'wall_01',
  name: 'City Wall',
  race: Race.HUMAN, // Neutral?
  quality: Quality.RED,
  position: 'Structure',
  troopType: TroopType.STRUCTURE,
  stats: {
    command: 1000, // High HP (1000 * 100 * 5 = 500,000 HP)
    strength: 0,
    strategy: 0,
    defense: 500,
  },
  level: 1,
  exp: 0,
  starRating: 1,
  equipment: [],
  talent: {
    id: 't_wall',
    name: 'Fortification',
    description: 'Reduces damage taken',
    type: 'Talent',
  },
  activeSkill: { id: 's_wall', name: 'None', description: 'None', type: 'Active' },
  passiveSkill: { id: 'p_wall', name: 'Immobile', description: 'Cannot move', type: 'Passive' },
  story: 'The last line of defense.',
};

export const STREET_FIGHT_DEFENDERS: Hero[] = [
  {
    id: 'sf_guard_1',
    name: 'City Guard',
    race: Race.HUMAN,
    quality: Quality.PURPLE,
    position: 'Guard',
    troopType: TroopType.INFANTRY,
    stats: { command: 50, strength: 60, strategy: 30, defense: 50 },
    level: 30,
    exp: 0,
    starRating: 3,
    equipment: [],
    talent: { id: 't_guard', name: 'Guard', description: '', type: 'Talent' },
    activeSkill: {
      id: 's_slash',
      name: 'Slash',
      description: 'Deal damage',
      type: 'Active',
      cooldown: 5,
    },
    passiveSkill: { id: 'p_def', name: 'Defense', description: '', type: 'Passive' },
    story: '',
  },
  {
    id: 'sf_archer_1',
    name: 'Tower Archer',
    race: Race.HUMAN,
    quality: Quality.PURPLE,
    position: 'Archer',
    troopType: TroopType.ARCHER,
    stats: { command: 40, strength: 70, strategy: 40, defense: 30 },
    level: 30,
    exp: 0,
    starRating: 3,
    equipment: [],
    talent: { id: 't_archer', name: 'Aim', description: '', type: 'Talent' },
    activeSkill: {
      id: 's_shot',
      name: 'Power Shot',
      description: 'Deal damage',
      type: 'Active',
      cooldown: 6,
    },
    passiveSkill: { id: 'p_range', name: 'Range', description: '', type: 'Passive' },
    story: '',
  },
];
