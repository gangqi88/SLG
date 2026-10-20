export enum BuildingType {
  CASTLE = 'castle',
  WAREHOUSE = 'warehouse',
  WALL = 'wall',
  LUMBER_MILL = 'lumber',
  QUARRY = 'quarry',
  FARM = 'farm',
  MARKET = 'market',
  BARRACKS = 'barracks',
  STABLE = 'stable',
  RANGE = 'range',
  HOSPITAL = 'hospital',
  ALLIANCE_HALL = 'alliance_hall',
  HERO_HALL = 'hero_hall',
  BAZAAR = 'bazaar',
}

export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  maxLevel: number;
  isUpgrading: boolean;
  upgradeStartTime: number;
  upgradeEndTime: number;
  nftTokenId?: string;
  position: { x: number; y: number };
}

export interface BuildingUpgradeCost {
  wood: number;
  stone: number;
  gold: number;
  time: number;
}

export interface AdBid {
  allianceId: string;
  allianceName: string;
  amount: number;
  timestamp: number;
  refunded: boolean;
}

export interface AdSpace {
  allianceId: string;
  allianceName: string;
  message: string;
  expiresAt: number;
}

export interface ShopItem {
  id: string;
  nameKey: string;
  descriptionKey: string;
  type: 'skin' | 'item' | 'bundle';
  price: number;
  currency: 'cny' | 'token';
  imageUrl: string;
  weeklyLimit: number;
  soldThisWeek: number;
  discount?: number;
}

export interface AuctionItem {
  id: string;
  sellerId: string;
  sellerName: string;
  itemType: 'hero' | 'material' | 'skin';
  itemId: string;
  itemName: string;
  itemImage: string;
  currentBid: number;
  highestBidder: string;
  highestBidderName: string;
  bidCount: number;
  startPrice: number;
  buyoutPrice: number;
  endTime: number;
  status: 'active' | 'ended' | 'cancelled';
}

export interface ResourcePrices {
  woodPrice: number;
  stonePrice: number;
  foodPrice: number;
  goldPrice: number;
  updatedAt: number;
}

export const BUILDING_MAX_LEVELS: Record<BuildingType, number> = {
  [BuildingType.CASTLE]: 30,
  [BuildingType.WAREHOUSE]: 25,
  [BuildingType.WALL]: 25,
  [BuildingType.LUMBER_MILL]: 20,
  [BuildingType.QUARRY]: 20,
  [BuildingType.FARM]: 20,
  [BuildingType.MARKET]: 15,
  [BuildingType.BARRACKS]: 20,
  [BuildingType.STABLE]: 15,
  [BuildingType.RANGE]: 15,
  [BuildingType.HOSPITAL]: 20,
  [BuildingType.ALLIANCE_HALL]: 10,
  [BuildingType.HERO_HALL]: 15,
  [BuildingType.BAZAAR]: 10,
};

export const INITIAL_BUILDINGS: BuildingType[] = [
  BuildingType.CASTLE,
  BuildingType.LUMBER_MILL,
  BuildingType.QUARRY,
  BuildingType.FARM,
  BuildingType.HERO_HALL,
];
