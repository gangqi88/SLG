import {
  Building,
  BuildingType,
  BuildingUpgradeCost,
  MainCityState,
  AdSpace,
  AdBid,
  ShopItem,
  AuctionItem,
  ResourcePrices,
  PriceHistory,
  PurchaseRecord,
  AuctionItemInput,
  INITIAL_BUILDINGS,
  BUILDING_MAX_LEVELS,
} from '../types/MainCity';

const STORAGE_KEY = 'main_city_manager_data';

class MainCityManager {
  private static instance: MainCityManager;
  private state: MainCityState;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.state = this.loadState();
  }

  public static getInstance(): MainCityManager {
    if (!MainCityManager.instance) {
      MainCityManager.instance = new MainCityManager();
    }
    return MainCityManager.instance;
  }

  private loadState(): MainCityState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load MainCityManager state:', error);
    }

    const buildings: Record<string, Building> = {};
    INITIAL_BUILDINGS.forEach((type, index) => {
      const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

    return {
      buildings,
      adSpace: null,
      pendingBids: [],
      shopItems: this.getDefaultShopItems(),
      auctionItems: this.getDefaultAuctionItems(),
      resourcePrices: {
        woodPrice: 1,
        stonePrice: 1,
        foodPrice: 1,
        goldPrice: 1,
        updatedAt: Date.now(),
      },
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save MainCityManager state:', error);
    }
  }

  private getDefaultShopItems(): ShopItem[] {
    return [
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
  }

  private getDefaultAuctionItems(): AuctionItem[] {
    return [
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
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.saveState();
    this.listeners.forEach((listener) => listener());
  }

  public getState(): MainCityState {
    return this.state;
  }

  public getBuilding(buildingId: string): Building | undefined {
    return this.state.buildings[buildingId];
  }

  public getAllBuildings(): Building[] {
    return Object.values(this.state.buildings);
  }

  public getUpgradeCost(_type: BuildingType, currentLevel: number): BuildingUpgradeCost {
    const baseWood = 100;
    const baseStone = 100;
    const baseGold = 50;
    const baseTime = 60;
    const growthRate = 2;

    const wood = Math.floor(baseWood * Math.pow(growthRate, currentLevel - 1));
    const stone = Math.floor(baseStone * Math.pow(growthRate, currentLevel - 1));
    const gold = Math.floor(baseGold * Math.pow(growthRate, currentLevel - 1));
    const time = Math.floor(baseTime * Math.pow(growthRate, currentLevel - 1));

    return { wood, stone, gold, time };
  }

  public async startUpgrade(buildingId: string): Promise<boolean> {
    const building = this.state.buildings[buildingId];
    if (!building || building.isUpgrading || building.level >= building.maxLevel) {
      return false;
    }

    const cost = this.getUpgradeCost(building.type, building.level);

    this.state.buildings[buildingId] = {
      ...building,
      isUpgrading: true,
      upgradeStartTime: Date.now(),
      upgradeEndTime: Date.now() + cost.time * 1000,
    };

    this.notify();
    return true;
  }

  public async cancelUpgrade(buildingId: string): Promise<boolean> {
    const building = this.state.buildings[buildingId];
    if (!building || !building.isUpgrading) {
      return false;
    }

    this.state.buildings[buildingId] = {
      ...building,
      isUpgrading: false,
      upgradeStartTime: 0,
      upgradeEndTime: 0,
    };

    this.notify();
    return true;
  }

  public async completeUpgrade(buildingId: string): Promise<Building | null> {
    const building = this.state.buildings[buildingId];
    if (!building || !building.isUpgrading) {
      return null;
    }

    if (Date.now() < building.upgradeEndTime) {
      return null;
    }

    this.state.buildings[buildingId] = {
      ...building,
      level: building.level + 1,
      isUpgrading: false,
      upgradeStartTime: 0,
      upgradeEndTime: 0,
    };

    this.notify();
    return this.state.buildings[buildingId];
  }

  public checkAndCompleteUpgrades(): void {
    Object.keys(this.state.buildings).forEach((buildingId) => {
      const building = this.state.buildings[buildingId];
      if (building.isUpgrading && Date.now() >= building.upgradeEndTime) {
        this.state.buildings[buildingId] = {
          ...building,
          level: building.level + 1,
          isUpgrading: false,
          upgradeStartTime: 0,
          upgradeEndTime: 0,
        };
      }
    });
    this.notify();
  }

  public async placeAdBid(allianceId: string, amount: number): Promise<AdBid> {
    const bid: AdBid = {
      allianceId,
      allianceName: `Alliance ${allianceId}`,
      amount,
      timestamp: Date.now(),
      refunded: false,
    };

    this.state.pendingBids.push(bid);
    this.notify();
    return bid;
  }

  public async resolveWeeklyAdWinner(): Promise<AdSpace | null> {
    if (this.state.pendingBids.length === 0) {
      return null;
    }

    const sortedBids = [...this.state.pendingBids].sort((a, b) => b.amount - a.amount);
    const winner = sortedBids[0];

    this.state.adSpace = {
      allianceId: winner.allianceId,
      allianceName: winner.allianceName,
      message: 'Welcome to our alliance!',
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    this.state.pendingBids.forEach((bid) => {
      if (bid.allianceId !== winner.allianceId) {
        bid.refunded = true;
      }
    });

    this.notify();
    return this.state.adSpace;
  }

  public getAdInfo(): AdSpace | null {
    return this.state.adSpace;
  }

  public getBidHistory(): AdBid[] {
    return this.state.pendingBids;
  }

  public getShopItems(): ShopItem[] {
    return this.state.shopItems;
  }

  public async purchaseItem(itemId: string, quantity: number): Promise<boolean> {
    const item = this.state.shopItems.find((i) => i.id === itemId);
    if (!item) {
      return false;
    }

    if (item.weeklyLimit > 0 && item.soldThisWeek + quantity > item.weeklyLimit) {
      return false;
    }

    item.soldThisWeek += quantity;
    this.notify();
    return true;
  }

  public getPurchaseHistory(): PurchaseRecord[] {
    return [];
  }

  public getAuctionItems(status?: 'active' | 'ended'): AuctionItem[] {
    if (status) {
      return this.state.auctionItems.filter((item) => item.status === status);
    }
    return this.state.auctionItems;
  }

  public async placeBid(auctionId: string, amount: number): Promise<boolean> {
    const auction = this.state.auctionItems.find((a) => a.id === auctionId);
    if (!auction || auction.status !== 'active') {
      return false;
    }

    const minBid = Math.floor(auction.currentBid * 1.05);
    if (amount < minBid) {
      return false;
    }

    auction.currentBid = amount;
    auction.highestBidder = 'current_player';
    auction.highestBidderName = 'You';
    auction.bidCount += 1;

    this.notify();
    return true;
  }

  public async buyout(auctionId: string): Promise<boolean> {
    const auction = this.state.auctionItems.find((a) => a.id === auctionId);
    if (!auction || auction.status !== 'active') {
      return false;
    }

    auction.status = 'ended';
    this.notify();
    return true;
  }

  public async createAuction(item: AuctionItemInput): Promise<AuctionItem> {
    const auction: AuctionItem = {
      id: `auction_${Date.now()}`,
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      itemType: item.itemType,
      itemId: item.itemId,
      itemName: item.itemName,
      itemImage: item.itemImage,
      currentBid: item.startPrice,
      highestBidder: '',
      highestBidderName: '',
      bidCount: 0,
      startPrice: item.startPrice,
      buyoutPrice: item.buyoutPrice,
      endTime: Date.now() + item.duration * 1000,
      status: 'active',
    };

    this.state.auctionItems.push(auction);
    this.notify();
    return auction;
  }

  public async cancelAuction(auctionId: string): Promise<boolean> {
    const auction = this.state.auctionItems.find((a) => a.id === auctionId);
    if (!auction || auction.status !== 'active') {
      return false;
    }

    auction.status = 'cancelled';
    this.notify();
    return true;
  }

  public getResourcePrices(): ResourcePrices {
    return this.state.resourcePrices;
  }

  public getHistoricalPrices(_days: number): PriceHistory[] {
    return [];
  }

  public async save(): Promise<boolean> {
    try {
      this.saveState();
      return true;
    } catch (error) {
      console.error('Failed to save MainCityManager:', error);
      return false;
    }
  }

  public async load(): Promise<boolean> {
    try {
      this.state = this.loadState();
      this.notify();
      return true;
    } catch (error) {
      console.error('Failed to load MainCityManager:', error);
      return false;
    }
  }

  public reset(): void {
    this.state = this.loadState();
    this.notify();
  }
}

export default MainCityManager;
