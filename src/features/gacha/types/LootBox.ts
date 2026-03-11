export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type ItemType = 'resource' | 'fragment' | 'hero' | 'box';

export interface GameItem {
  id: string;
  name: string;
  type: ItemType;
  description?: string;
  rarity: Rarity;
  icon?: string; // Optional icon path or emoji
}

export interface LootBoxDrop {
  itemId: string;
  minQuantity: number;
  maxQuantity: number;
  weight: number; // Probability weight
}

export interface LootBox extends GameItem {
  type: 'box';
  dropTable: LootBoxDrop[];
}

export interface InventoryItem {
  item: GameItem;
  quantity: number;
}

// Define some default boxes
export const BASIC_LOOT_BOX: LootBox = {
  id: 'basic_lootbox',
  name: 'Basic Loot Box',
  type: 'box',
  description: 'A dusty wooden box found in the wild.',
  rarity: 'common',
  dropTable: [
    { itemId: 'resource_wood', minQuantity: 5, maxQuantity: 15, weight: 40 },
    { itemId: 'resource_stone', minQuantity: 3, maxQuantity: 10, weight: 20 },
    { itemId: 'item_hero_exp', minQuantity: 50, maxQuantity: 100, weight: 20 },
    { itemId: 'item_hero_fragment', minQuantity: 5, maxQuantity: 10, weight: 15 },
    { itemId: 'fragment_hero_1', minQuantity: 1, maxQuantity: 2, weight: 5 }, // Rare
  ],
};

export const ITEMS_DB: Record<string, GameItem> = {
  basic_lootbox: BASIC_LOOT_BOX,
  resource_wood: {
    id: 'resource_wood',
    name: 'Wood',
    type: 'resource',
    rarity: 'common',
    description: 'Basic building material.',
  },
  resource_stone: {
    id: 'resource_stone',
    name: 'Stone',
    type: 'resource',
    rarity: 'common',
    description: 'Strong building material.',
  },
  fragment_hero_1: {
    id: 'fragment_hero_1',
    name: 'Hero Fragment (Alpha)',
    type: 'fragment',
    rarity: 'rare',
    description: 'A piece of a hero soul.',
  },
  fragment_hero_2: {
    id: 'fragment_hero_2',
    name: 'Hero Fragment (Omega)',
    type: 'fragment',
    rarity: 'epic',
    description: 'A rare piece of a hero soul.',
  },
  item_hero_exp: {
    id: 'item_hero_exp',
    name: 'Hero XP',
    type: 'resource',
    rarity: 'common',
    description: 'Experience for heroes.',
  },
  item_hero_fragment: {
    id: 'item_hero_fragment',
    name: 'Universal Hero Fragment',
    type: 'fragment',
    rarity: 'rare',
    description: 'Used to increase hero star rating.',
  },
};
