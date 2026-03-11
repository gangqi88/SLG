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

export interface PriceHistory {
  resource: 'wood' | 'stone' | 'food' | 'gold';
  price: number;
  timestamp: number;
}

export interface PurchaseRecord {
  id: string;
  itemId: string;
  quantity: number;
  totalPaid: number;
  timestamp: number;
}

export interface MainCityState {
  buildings: Record<string, Building>;
  adSpace: AdSpace | null;
  pendingBids: AdBid[];
  shopItems: ShopItem[];
  auctionItems: AuctionItem[];
  resourcePrices: ResourcePrices;
}

export interface AuctionItemInput {
  sellerId: string;
  sellerName: string;
  itemType: 'hero' | 'material' | 'skin';
  itemId: string;
  itemName: string;
  itemImage: string;
  startPrice: number;
  buyoutPrice: number;
  duration: number;
}

export const BUILDING_NAMES: Record<BuildingType, string> = {
  [BuildingType.CASTLE]: 'mainCity.building.castle',
  [BuildingType.WAREHOUSE]: 'mainCity.building.warehouse',
  [BuildingType.WALL]: 'mainCity.building.wall',
  [BuildingType.LUMBER_MILL]: 'mainCity.building.lumber',
  [BuildingType.QUARRY]: 'mainCity.building.quarry',
  [BuildingType.FARM]: 'mainCity.building.farm',
  [BuildingType.MARKET]: 'mainCity.building.market',
  [BuildingType.BARRACKS]: 'mainCity.building.barracks',
  [BuildingType.STABLE]: 'mainCity.building.stable',
  [BuildingType.RANGE]: 'mainCity.building.range',
  [BuildingType.HOSPITAL]: 'mainCity.building.hospital',
  [BuildingType.ALLIANCE_HALL]: 'mainCity.building.allianceHall',
  [BuildingType.HERO_HALL]: 'mainCity.building.heroHall',
  [BuildingType.BAZAAR]: 'mainCity.building.bazaar',
};

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

export const UNLOCK_REQUIREMENTS: Partial<
  Record<BuildingType, { castleLevel?: number; buildingLevel?: BuildingType }>
> = {
  [BuildingType.WAREHOUSE]: { castleLevel: 5 },
  [BuildingType.WALL]: { castleLevel: 3 },
  [BuildingType.MARKET]: { castleLevel: 5 },
  [BuildingType.BARRACKS]: { castleLevel: 3 },
  [BuildingType.STABLE]: { castleLevel: 5 },
  [BuildingType.RANGE]: { buildingLevel: BuildingType.BARRACKS },
  [BuildingType.HOSPITAL]: { castleLevel: 4 },
  [BuildingType.ALLIANCE_HALL]: { castleLevel: 8 },
  [BuildingType.BAZAAR]: { castleLevel: 6 },
};
