import { useState, useEffect, useCallback } from 'react';
import AllianceManager from '@/features/alliance/logic/AllianceManager';
import {
  Alliance,
  AllianceMember,
  AllianceRole,
  AllianceTech,
  AdSpace,
  AdBid,
  ChatMessage,
  TradeRequest,
  AllianceWar,
  ShopItem,
} from '../types/Alliance';

interface UseAllianceReturn {
  alliance: Alliance | null;
  members: AllianceMember[];
  playerRole: AllianceRole | null;
  playerContribution: number;
  chatMessages: ChatMessage[];
  tradeRequests: TradeRequest[];
  shopItems: ShopItem[];
  activeWar: AllianceWar | null;
  adSpace: AdSpace | null;
  pendingBids: AdBid[];
  techList: AllianceTech[];
  techBonuses: Record<string, number>;
  isLoading: boolean;
  hasAlliance: boolean;
  checkInStatus: { available: boolean; streak: number };
  createAlliance: (name: string) => Promise<Alliance | null>;
  joinAlliance: (allianceId: string) => Promise<boolean>;
  leaveAlliance: () => Promise<boolean>;
  updateAnnouncement: (content: string) => Promise<boolean>;
  upgradeAlliance: () => Promise<boolean>;
  checkIn: () => Promise<{ contribution: number; streak: number }>;
  sendChatMessage: (
    content: string,
    type?: 'normal' | 'system' | 'announcement',
  ) => Promise<ChatMessage>;
  getChatHistory: (offset?: number, limit?: number) => ChatMessage[];
  buyShopItem: (itemId: string, quantity?: number) => Promise<boolean>;
  createTradeRequest: (
    offerType: 'resource' | 'hero',
    offerAmount: number,
    offerResourceType: 'wood' | 'stone' | 'food' | 'gold',
    requestType: 'resource' | 'hero',
    requestAmount: number,
    requestResourceType: 'wood' | 'stone' | 'food' | 'gold',
  ) => TradeRequest;
  acceptTradeRequest: (tradeId: string) => boolean;
  cancelTradeRequest: (tradeId: string) => boolean;
  placeAdBid: (amount: number) => Promise<AdBid>;
  upgradeTech: (techId: string) => Promise<boolean>;
  declareWar: (
    targetAllianceId: string,
    targetCityId?: string,
    targetCityName?: string,
    defenderName?: string,
  ) => Promise<AllianceWar | null>;
  submitWarScore: (score: number) => boolean;
  contributeResource: (type: 'wood' | 'stone' | 'food' | 'gold', amount: number) => number;
  save: () => Promise<boolean>;
  load: () => Promise<boolean>;
}

export const useAlliance = (): UseAllianceReturn => {
  const [alliance, setAlliance] = useState<Alliance | null>(null);
  const [members, setMembers] = useState<AllianceMember[]>([]);
  const [playerRole, setPlayerRole] = useState<AllianceRole | null>(null);
  const [playerContribution, setPlayerContribution] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [activeWar, setActiveWar] = useState<AllianceWar | null>(null);
  const [adSpace, setAdSpace] = useState<AdSpace | null>(null);
  const [pendingBids, setPendingBids] = useState<AdBid[]>([]);
  const [techList, setTechList] = useState<AllianceTech[]>([]);
  const [techBonuses, setTechBonuses] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [checkInStatus, setCheckInStatus] = useState({ available: false, streak: 0 });

  useEffect(() => {
    const manager = AllianceManager.getInstance();

    const syncState = () => {
      const state = manager.getState();
      setAlliance(state.currentAlliance);
      setMembers(state.members);
      setPlayerRole(state.playerRole);
      setPlayerContribution(state.playerContribution);
      setChatMessages(state.chatMessages);
      setTradeRequests(state.tradeRequests);
      setShopItems(state.shopItems);
      setActiveWar(state.activeWar);
      setAdSpace(state.currentAlliance?.adSpace || null);
      setPendingBids(state.pendingBids);
      setTechList(manager.getTechInfo());
      setTechBonuses(manager.getTechBonuses());
      setCheckInStatus(manager.getCheckInStatus());
      setIsLoading(false);
    };

    syncState();

    const unsubscribe = manager.subscribe((_event) => {
      syncState();
    });

    const t = setInterval(() => {
      manager.tickWar();
    }, 1000);

    return () => {
      clearInterval(t);
      unsubscribe();
    };
  }, []);

  const hasAlliance = alliance !== null;

  const createAlliance = useCallback(async (name: string) => {
    const manager = AllianceManager.getInstance();
    const result = await manager.createAlliance(name);
    return result;
  }, []);

  const joinAlliance = useCallback(async (allianceId: string) => {
    const manager = AllianceManager.getInstance();
    return await manager.joinAlliance(allianceId);
  }, []);

  const leaveAlliance = useCallback(async () => {
    const manager = AllianceManager.getInstance();
    return await manager.leaveAlliance();
  }, []);

  const updateAnnouncement = useCallback(async (content: string) => {
    const manager = AllianceManager.getInstance();
    return await manager.updateAnnouncement(content);
  }, []);

  const upgradeAlliance = useCallback(async () => {
    const manager = AllianceManager.getInstance();
    return await manager.upgradeAlliance();
  }, []);

  const checkIn = useCallback(async () => {
    const manager = AllianceManager.getInstance();
    return await manager.checkIn();
  }, []);

  const sendChatMessage = useCallback(
    async (content: string, type: 'normal' | 'system' | 'announcement' = 'normal') => {
      const manager = AllianceManager.getInstance();
      return await manager.sendChatMessage(content, type);
    },
    [],
  );

  const getChatHistory = useCallback((offset = 0, limit = 50) => {
    const manager = AllianceManager.getInstance();
    return manager.getChatHistory(offset, limit);
  }, []);

  const buyShopItem = useCallback(async (itemId: string, quantity = 1) => {
    const manager = AllianceManager.getInstance();
    return await manager.buyShopItem(itemId, quantity);
  }, []);

  const createTradeRequest = useCallback(
    (
      offerType: 'resource' | 'hero',
      offerAmount: number,
      offerResourceType: 'wood' | 'stone' | 'food' | 'gold',
      requestType: 'resource' | 'hero',
      requestAmount: number,
      requestResourceType: 'wood' | 'stone' | 'food' | 'gold',
    ) => {
      const manager = AllianceManager.getInstance();
      return manager.createTradeRequest(
        offerType,
        offerAmount,
        offerResourceType,
        requestType,
        requestAmount,
        requestResourceType,
      );
    },
    [],
  );

  const acceptTradeRequest = useCallback((tradeId: string) => {
    const manager = AllianceManager.getInstance();
    return manager.acceptTradeRequest(tradeId);
  }, []);

  const cancelTradeRequest = useCallback((tradeId: string) => {
    const manager = AllianceManager.getInstance();
    return manager.cancelTradeRequest(tradeId);
  }, []);

  const placeAdBid = useCallback(async (amount: number) => {
    const manager = AllianceManager.getInstance();
    return await manager.placeAdBid(amount);
  }, []);

  const upgradeTech = useCallback(async (techId: string) => {
    const manager = AllianceManager.getInstance();
    return await manager.upgradeTech(techId);
  }, []);

  const declareWar = useCallback(
    async (
      targetAllianceId: string,
      targetCityId?: string,
      targetCityName?: string,
      defenderName?: string,
    ) => {
      const manager = AllianceManager.getInstance();
      return await manager.declareWar(targetAllianceId, targetCityId, targetCityName, defenderName);
    },
    [],
  );

  const submitWarScore = useCallback((score: number) => {
    const manager = AllianceManager.getInstance();
    return manager.submitWarScore(score);
  }, []);

  const contributeResource = useCallback(
    (type: 'wood' | 'stone' | 'food' | 'gold', amount: number) => {
      const manager = AllianceManager.getInstance();
      return manager.contributeResource(type, amount);
    },
    [],
  );

  const save = useCallback(async () => {
    const manager = AllianceManager.getInstance();
    return await manager.save();
  }, []);

  const load = useCallback(async () => {
    const manager = AllianceManager.getInstance();
    return await manager.load();
  }, []);

  return {
    alliance,
    members,
    playerRole,
    playerContribution,
    chatMessages,
    tradeRequests,
    shopItems,
    activeWar,
    adSpace,
    pendingBids,
    techList,
    techBonuses,
    isLoading,
    hasAlliance,
    checkInStatus,
    createAlliance,
    joinAlliance,
    leaveAlliance,
    updateAnnouncement,
    upgradeAlliance,
    checkIn,
    sendChatMessage,
    getChatHistory,
    buyShopItem,
    createTradeRequest,
    acceptTradeRequest,
    cancelTradeRequest,
    placeAdBid,
    upgradeTech,
    declareWar,
    submitWarScore,
    contributeResource,
    save,
    load,
  };
};
