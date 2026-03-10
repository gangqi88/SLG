import { Hero, Quality, Race, TroopType } from '../types/Hero';

// Helper to create heroes
const createHero = (
  id: string,
  name: string,
  race: Race,
  quality: Quality,
  position: string,
  troopType: TroopType,
  stats: { command: number; strength: number; strategy: number; defense: number },
  talent: string,
  active: string,
  passive: string,
  story: string
): Hero => ({
  id,
  name,
  race,
  quality,
  position,
  troopType,
  stats,
  level: 1,
  exp: 0,
  starRating: 1,
  equipment: [null, null, null, null],
  talent: { id: `t_${id}`, name: '天赋', description: talent, type: 'Talent' },
  activeSkill: { id: `a_${id}`, name: '主动技能', description: active, type: 'Active', cooldown: 10 },
  passiveSkill: { id: `p_${id}`, name: '被动技能', description: passive, type: 'Passive' },
  story
});

export const newTroopHeroes: Hero[] = [
  createHero(
    'archer_1', 'Elara', Race.HUMAN, Quality.PURPLE, 'Ranged DPS', TroopType.ARCHER,
    { command: 85, strength: 90, strategy: 70, defense: 50 },
    'Range +1', 'Rain of Arrows: Deal 80% damage to all enemies', 'Eagle Eye: Crit Rate +10%',
    'Elite elven archer.'
  ),
  createHero(
    'cavalry_1', 'Lancelot', Race.HUMAN, Quality.ORANGE, 'Charger', TroopType.CAVALRY,
    { command: 90, strength: 95, strategy: 60, defense: 80 },
    'Speed +20%', 'Charge: Deal 200% damage to single target', 'Knight\'s Honor: Defense +15%',
    'Legendary knight.'
  ),
  createHero(
    'mage_1', 'Merlin', Race.HUMAN, Quality.ORANGE, 'Magic DPS', TroopType.MAGE,
    { command: 80, strength: 40, strategy: 100, defense: 40 },
    'Magic DMG +20%', 'Fireball: Deal 150% magic damage', 'Mana Flow: Cooldown -1s',
    'Grand wizard.'
  ),
  createHero(
    'flying_1', 'Griffin Rider', Race.ANGEL, Quality.PURPLE, 'Air Unit', TroopType.FLYING,
    { command: 85, strength: 85, strategy: 75, defense: 60 },
    'Ignore Terrain', 'Aerial Strike: Deal 120% damage', 'Evasion: 10% chance to dodge',
    'Sky patrol.'
  ),
  createHero(
    'siege_1', 'Goliath', Race.DEMON, Quality.PURPLE, 'Siege', TroopType.SIEGE,
    { command: 95, strength: 100, strategy: 30, defense: 90 },
    'Structure DMG +50%', 'Smash: Deal 180% damage', 'Thick Skin: Damage Reduction +10%',
    'Living siege engine.'
  ),
  createHero(
    'infantry_1', 'Arthur', Race.HUMAN, Quality.ORANGE, 'Tank', TroopType.INFANTRY,
    { command: 95, strength: 90, strategy: 85, defense: 95 },
    'Defense +20%', 'Excalibur: Deal 250% damage', 'King\'s Aura: All Allies Defense +10%',
    'King of Camelot.'
  )
];
