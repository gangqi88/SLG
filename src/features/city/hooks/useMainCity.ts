import { useState, useEffect, useCallback } from 'react';
import {
  Building,
  BuildingType,
  BuildingUpgradeCost,
  AdSpace,
  AdBid,
  ShopItem,
  AuctionItem,
  ResourcePrices,
  INITIAL_BUILDINGS,
  BUILDING_MAX_LEVELS,
} from '../types/MainCity';

interface UseMainCityReturn {
  buildings: Record<string, Building>;
  adSpace: AdSpace | null;
  pendingBids: AdBid[];
  shopItems: ShopItem[];
  auctionItems: AuctionItem[];
  resourcePrices: ResourcePrices;
  currentResources: { wood: number; stone: number; food: number; gold: number };
  isLoading: boolean;
  getBuilding: (buildingId: string) => Building | undefined;
  getUpgradeCost: (type: BuildingType, level: number) => BuildingUpgradeCost;
  startUpgrade: (buildingId: string) => Promise<boolean>;
  cancelUpgrade: (buildingId: string) => Promise<boolean>;
  placeBid: () => void;
  purchaseItem: (itemId: string, quantity: number) => void;
  placeAuctionBid: (auctionId: string, amount: number) => void;
  buyout: (auctionId: string) => void;
}

const STORAGE_KEY = 'main_city_data';

const generateBuildingId = (type: BuildingType): string => {
  return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getInitialBuildings = (): Record<string, Building> => {
  const buildings: Record<string, Building> = {};
  
  INITIAL_BUILDINGS.forEach((type, index) => {
    const id = generateBuildingId(type);
    buildings[id] = {
      id,
      type,
      level: 1,
      maxLevel: BUILDING_MAX_LEVELS[type],
      isUpgrading: false,
      upgradeStartTime: 0,
      upgradeEndTime: 0,
      position: { x: (index % 4) * 100, y: Math.floor(index / 4) * 100 },
    };
  });
  
  return buildings;
};

const getDefaultResourcePrices = (): ResourcePrices => ({
  woodPrice: 1,
  stonePrice: 1,
  foodPrice: 1,
  goldPrice: 1,
  updatedAt: Date.now(),
});

const getSampleShopItems = (): ShopItem[] => [
  {
    id: 'skin_001',
    nameKey: 'skin.hero.legendary',
    descriptionKey: 'skin.hero.legendary.desc',
    type: 'skin',
    price: 299,
    currency: 'cny',
    imageUrl: '',
    weeklyLimit: 0,
    soldThisWeek: 0,
  },
  {
    id: 'item_001',
    nameKey: 'item.resource.pack',
    descriptionKey: 'item.resource.pack.desc',
    type: 'item',
    price: 68,
    currency: 'cny',
    imageUrl: '',
    weeklyLimit: 10,
    soldThisWeek: 3,
  },
  {
    id: 'bundle_001',
    nameKey: 'bundle.starter',
    descriptionKey: 'bundle.starter.desc',
    type: 'bundle',
    price: 98,
    currency: 'cny',
    imageUrl: '',
    weeklyLimit: 1,
    soldThisWeek: 0,
    discount: 20,
  },
];

const getSampleAuctionItems = (): AuctionItem[] => [
  {
    id: 'auction_001',
    sellerId: 'player_001',
    sellerName: 'WarriorKing',
    itemType: 'hero',
    itemId: 'hero_001',
    itemName: 'Legendary Hero',
    itemImage: '',
    currentBid: 1000,
    highestBidder: 'player_002',
    highestBidderName: 'DragonSlayer',
    bidCount: 5,
    startPrice: 500,
    buyoutPrice: 5000,
    endTime: Date.now() + 3600000 * 24,
    status: 'active',
  },
];

export const useMainCity = (): UseMainCityReturn => {
  const [buildings, setBuildings] = useState<Record<string, Building>>({});
  const [adSpace, setAdSpace] = useState<AdSpace | null>(null);
  const [pendingBids, setPendingBids] = useState<AdBid[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [auctionItems, setAuctionItems] = useState<AuctionItem[]>([]);
  const [resourcePrices, setResourcePrices] = useState<ResourcePrices>(getDefaultResourcePrices());
  const [currentResources, setCurrentResources] = useState({ wood: 10000, stone: 10000, food: 10000, gold: 10000 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setBuildings(data.buildings || getInitialBuildings());
          setAdSpace(data.adSpace || null);
          setPendingBids(data.pendingBids || []);
          setShopItems(data.shopItems || getSampleShopItems());
          setAuctionItems(data.auctionItems || getSampleAuctionItems());
          setResourcePrices(data.resourcePrices || getDefaultResourcePrices());
        } else {
          setBuildings(getInitialBuildings());
          setShopItems(getSampleShopItems());
          setAuctionItems(getSampleAuctionItems());
        }
      } catch (error) {
        console.error('Failed to load main city data:', error);
        setBuildings(getInitialBuildings());
        setShopItems(getSampleShopItems());
        setAuctionItems(getSampleAuctionItems());
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const checkAndCompleteUpgrades = () => {
      const now = Date.now();
      let hasUpdates = false;
      
      const updatedBuildings = { ...buildings };
      
      Object.keys(updatedBuildings).forEach(buildingId => {
        const building = updatedBuildings[buildingId];
        if (building.isUpgrading && building.upgradeEndTime > 0 && now >= building.upgradeEndTime) {
          updatedBuildings[buildingId] = {
            ...building,
            level: building.level + 1,
            isUpgrading: false,
            upgradeStartTime: 0,
            upgradeEndTime: 0,
          };
          hasUpdates = true;
        }
      });
      
      if (hasUpdates) {
        setBuildings(updatedBuildings);
      }
    };
    
    const interval = setInterval(checkAndCompleteUpgrades, 1000);
    
    return () => clearInterval(interval);
  }, [buildings]);

  useEffect(() => {
    if (!isLoading) {
      const data = {
        buildings,
        adSpace,
        pendingBids,
        shopItems,
        auctionItems,
        resourcePrices,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [buildings, adSpace, pendingBids, shopItems, auctionItems, resourcePrices, isLoading]);

  const getBuilding = useCallback((buildingId: string): Building | undefined => {
    return buildings[buildingId];
  }, [buildings]);

  const getUpgradeCost = useCallback((_type: BuildingType, level: number): BuildingUpgradeCost => {
    const baseWood = 100;
    const baseStone = 100;
    const baseGold = 50;
    const baseTime = 60;
    const growthRate = 2;

    const wood = Math.floor(baseWood * Math.pow(growthRate, level - 1));
    const stone = Math.floor(baseStone * Math.pow(growthRate, level - 1));
    const gold = Math.floor(baseGold * Math.pow(growthRate, level - 1));
    const time = Math.floor(baseTime * Math.pow(growthRate, level - 1));

    return { wood, stone, gold, time };
  }, []);

  const startUpgrade = useCallback(async (buildingId: string): Promise<boolean> => {
    const building = buildings[buildingId];
    if (!building || building.isUpgrading || building.level >= building.maxLevel) {
      return false;
    }

    const cost = getUpgradeCost(building.type, building.level);

    if (currentResources.wood < cost.wood || 
        currentResources.stone < cost.stone || 
        currentResources.gold < cost.gold) {
      return false;
    }

    setCurrentResources(prev => ({
      wood: prev.wood - cost.wood,
      stone: prev.stone - cost.stone,
      food: prev.food,
      gold: prev.gold - cost.gold,
    }));

    const newBuildings = {
      ...buildings,
      [buildingId]: {
        ...building,
        isUpgrading: true,
        upgradeStartTime: Date.now(),
        upgradeEndTime: Date.now() + cost.time * 1000,
      },
    };

    setBuildings(newBuildings);
    return true;
  }, [buildings, getUpgradeCost, currentResources]);

  const cancelUpgrade = useCallback(async (buildingId: string): Promise<boolean> => {
    const building = buildings[buildingId];
    if (!building || !building.isUpgrading) {
      return false;
    }

    const newBuildings = {
      ...buildings,
      [buildingId]: {
        ...building,
        isUpgrading: false,
        upgradeStartTime: 0,
        upgradeEndTime: 0,
      },
    };

    setBuildings(newBuildings);
    return true;
  }, [buildings]);

  const placeBid = useCallback(() => {
    console.log('Place bid clicked');
  }, []);

  const purchaseItem = useCallback((itemId: string, quantity: number) => {
    console.log('Purchase item:', itemId, quantity);
    setShopItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, soldThisWeek: item.soldThisWeek + quantity }
          : item
      )
    );
  }, []);

  const placeBidAuction = useCallback((auctionId: string, amount: number) => {
    console.log('Place auction bid:', auctionId, amount);
    setAuctionItems(prev =>
      prev.map(item =>
        item.id === auctionId
          ? {
              ...item,
              currentBid: amount,
              highestBidder: 'current_player',
              highestBidderName: 'You',
              bidCount: item.bidCount + 1,
            }
          : item
      )
    );
  }, []);

  const buyout = useCallback((auctionId: string) => {
    console.log('Buyout auction:', auctionId);
    setAuctionItems(prev =>
      prev.map(item =>
        item.id === auctionId
          ? { ...item, status: 'ended' as const }
          : item
      )
    );
  }, []);

  return {
    buildings,
    adSpace,
    pendingBids,
    shopItems,
    auctionItems,
    resourcePrices,
    currentResources,
    isLoading,
    getBuilding,
    getUpgradeCost,
    startUpgrade,
    cancelUpgrade,
    placeBid,
    purchaseItem,
    placeAuctionBid: placeBidAuction,
    buyout,
  };
};
