import {
  Alliance,
  AllianceMember,
  AllianceRole,
  AllianceState,
  AllianceTech,
  AdSpace,
  AdBid,
  ChatMessage,
  TradeRequest,
  AllianceWar,
  AllianceApplication,
  ShopItem,
  DEFAULT_TECH_LIST,
  DEFAULT_SHOP_ITEMS,
  CHECK_IN_REWARD,
  LEAVE_PENALTY_RATE,
  WAR_DECLARE_REQUIRED_LEVEL,
  WAR_DECLARE_DEPOSIT,
  WAR_DURATION,
} from '../../types/Alliance';
import { STORAGE_KEY, getUpgradeCost, getMaxMembers } from '@/features/alliance/config/alliance';

type AllianceEventType = 'chat' | 'contribution' | 'war' | 'shop' | 'tech' | 'member' | 'alliance';

interface AllianceEvent {
  type: AllianceEventType;
  data: unknown;
  timestamp: number;
}

import MockAllianceService from './MockAllianceService';
import { WithdrawalRequest } from '@/features/city/contracts/ITreasuryContract';

class AllianceManager {
  private static instance: AllianceManager;
  private state: AllianceState;
  private listeners: Set<(event: AllianceEvent) => void> = new Set();
  private playerId: string;
  private playerName: string;
  private web3Service: MockAllianceService;

  private constructor() {
    this.playerId = `player_${Date.now()}`;
    this.playerName = 'Player';
    this.state = this.loadState();
    this.web3Service = MockAllianceService.getInstance();
  }

  public static getInstance(): AllianceManager {
    if (!AllianceManager.instance) {
      AllianceManager.instance = new AllianceManager();
    }
    return AllianceManager.instance;
  }

  public setPlayerInfo(playerId: string, playerName: string): void {
    this.playerId = playerId;
    this.playerName = playerName;
  }

  private loadState(): AllianceState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load alliance state:', error);
    }

    return this.getDefaultState();
  }

  private getDefaultState(): AllianceState {
    const shopItems: ShopItem[] = DEFAULT_SHOP_ITEMS.map(item => ({
      ...item,
      soldThisWeek: 0,
    }));

    return {
      currentAlliance: null,
      playerAllianceId: null,
      playerRole: null,
      members: [],
      chatMessages: [],
      tradeRequests: [],
      shopItems,
      pendingBids: [],
      activeWar: null,
      applications: [],
      playerContribution: 0,
      playerLastCheckIn: 0,
      checkInStreak: 0,
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save alliance state:', error);
    }
  }

  private emit(type: AllianceEventType, data: unknown): void {
    const event: AllianceEvent = {
      type,
      data,
      timestamp: Date.now(),
    };
    this.listeners.forEach(listener => listener(event));
  }

  public subscribe(listener: (event: AllianceEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getState(): AllianceState {
    return this.state;
  }

  public getPlayerId(): string {
    return this.playerId;
  }

  public getPlayerName(): string {
    return this.playerName;
  }

  public hasAlliance(): boolean {
    return this.state.currentAlliance !== null;
  }

  public getAlliance(): Alliance | null {
    return this.state.currentAlliance;
  }

  public getPlayerRole(): AllianceRole | null {
    return this.state.playerRole;
  }

  public getMembers(): AllianceMember[] {
    return this.state.members;
  }

  public getMember(memberId: string): AllianceMember | undefined {
    return this.state.members.find(m => m.id === memberId);
  }

  public getContribution(): number {
    return this.state.playerContribution;
  }

  public async createAlliance(name: string): Promise<Alliance | null> {
    if (this.state.currentAlliance) {
      console.error('Player already has an alliance');
      return null;
    }

    const alliance: Alliance = {
      id: `alliance_${Date.now()}`,
      name,
      level: 1,
      announcement: 'Welcome to our alliance!',
      leaderId: this.playerId,
      memberCount: 1,
      maxMembers: getMaxMembers(1),
      createdAt: Date.now(),
      adSpace: null,
      techLevel: {
        resource_boost: 0,
        training_speed: 0,
        defense_boost: 0,
        attack_boost: 0,
        gathering_boost: 0,
      },
      requiredContribution: 0,
    };

    const leaderMember: AllianceMember = {
      id: this.playerId,
      address: this.playerId,
      name: this.playerName,
      role: 'leader' as AllianceRole,
      contribution: 0,
      lastCheckIn: 0,
      joinedAt: Date.now(),
      weeklyContribution: 0,
      contributionHistory: [],
    };

    this.state.currentAlliance = alliance;
    this.state.playerAllianceId = alliance.id;
    this.state.playerRole = 'leader' as AllianceRole;
    this.state.members = [leaderMember];

    this.saveState();
    this.emit('alliance', alliance);

    // Sync with Web3
    this.web3Service.createAlliance(name).then(tx => {
      console.log('Alliance created on-chain:', tx);
    });

    return alliance;
  }

  public async joinAlliance(allianceId: string): Promise<boolean> {
    if (this.state.currentAlliance) {
      return false;
    }

    const application: AllianceApplication = {
      id: `app_${Date.now()}`,
      playerId: this.playerId,
      playerName: this.playerName,
      allianceId,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.state.applications.push(application);
    this.saveState();

    // Sync with Web3
    this.web3Service.joinAlliance(allianceId).then(tx => {
      console.log('Joined alliance on-chain:', tx);
    });

    return true;
  }

  public async leaveAlliance(): Promise<boolean> {
    if (!this.state.currentAlliance) {
      return false;
    }

    const penalty = Math.floor(this.state.playerContribution * LEAVE_PENALTY_RATE);
    this.state.playerContribution = Math.max(0, this.state.playerContribution - penalty);

    this.state.members = this.state.members.filter(m => m.id !== this.playerId);

    if (this.state.currentAlliance.leaderId === this.playerId) {
      if (this.state.members.length === 0) {
        this.state.currentAlliance = null;
      } else {
        this.state.members[0].role = 'leader' as AllianceRole;
        this.state.currentAlliance.leaderId = this.state.members[0].id;
      }
    }

    if (this.state.currentAlliance) {
      this.state.currentAlliance.memberCount = this.state.members.length;
    }
    this.state.playerAllianceId = null;
    this.state.playerRole = null;

    this.saveState();
    this.emit('member', { action: 'leave', playerId: this.playerId });

    // Sync with Web3
    if (this.state.currentAlliance) {
      this.web3Service.leaveAlliance(this.state.currentAlliance.id).then(tx => {
        console.log('Left alliance on-chain:', tx);
      });
    }

    return true;
  }

  public async updateAnnouncement(content: string): Promise<boolean> {
    if (!this.state.currentAlliance || this.state.playerRole !== 'leader') {
      return false;
    }

    this.state.currentAlliance.announcement = content;
    this.saveState();
    this.emit('alliance', this.state.currentAlliance);

    return true;
  }

  public async upgradeAlliance(): Promise<boolean> {
    if (!this.state.currentAlliance) {
      return false;
    }

    const currentLevel = this.state.currentAlliance.level;
    const cost = getUpgradeCost(currentLevel);

    if (cost <= 0) {
      return false;
    }

    this.state.currentAlliance.level += 1;
    this.state.currentAlliance.maxMembers = getMaxMembers(this.state.currentAlliance.level);

    this.saveState();
    this.emit('alliance', this.state.currentAlliance);

    return true;
  }

  public async checkIn(): Promise<{ contribution: number; streak: number }> {
    if (!this.state.currentAlliance) {
      return { contribution: 0, streak: 0 };
    }

    const now = Date.now();
    const lastCheckIn = this.state.playerLastCheckIn;
    const oneDay = 24 * 60 * 60 * 1000;

    if (lastCheckIn > 0 && now - lastCheckIn < oneDay) {
      return { contribution: 0, streak: this.state.checkInStreak };
    }

    let reward = CHECK_IN_REWARD;
    if (lastCheckIn > 0 && now - lastCheckIn < oneDay * 2) {
      this.state.checkInStreak += 1;
      reward += Math.min(this.state.checkInStreak * 10, 100);
    } else {
      this.state.checkInStreak = 1;
    }

    this.state.playerContribution += reward;
    this.state.playerLastCheckIn = now;

    const member = this.state.members.find(m => m.id === this.playerId);
    if (member) {
      member.contribution += reward;
      member.lastCheckIn = now;
      member.weeklyContribution += reward;
      member.contributionHistory.push(reward);
    }

    this.saveState();
    this.emit('contribution', { contribution: reward, streak: this.state.checkInStreak });

    // Sync with Web3
    this.web3Service.checkIn(this.state.currentAlliance.id).then(tx => {
      console.log('Checked in on-chain:', tx);
    });

    return { contribution: reward, streak: this.state.checkInStreak };
  }

  public getCheckInStatus(): { available: boolean; streak: number } {
    if (!this.state.currentAlliance) {
      return { available: false, streak: 0 };
    }

    const now = Date.now();
    const lastCheckIn = this.state.playerLastCheckIn;
    const oneDay = 24 * 60 * 60 * 1000;

    const available = lastCheckIn === 0 || now - lastCheckIn >= oneDay;

    return { available, streak: this.state.checkInStreak };
  }

  public async sendChatMessage(content: string, type: 'normal' | 'system' | 'announcement' = 'normal'): Promise<ChatMessage> {
    if (!this.state.currentAlliance) {
      throw new Error('No alliance');
    }

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: this.playerId,
      senderName: this.playerName,
      content,
      timestamp: Date.now(),
      type,
    };

    this.state.chatMessages.push(message);

    if (this.state.chatMessages.length > 100) {
      this.state.chatMessages = this.state.chatMessages.slice(-100);
    }

    this.saveState();
    this.emit('chat', message);

    return message;
  }

  public getChatHistory(offset = 0, limit = 50): ChatMessage[] {
    return this.state.chatMessages.slice(offset, offset + limit);
  }

  public getShopItems(): ShopItem[] {
    return this.state.shopItems;
  }

  public async buyShopItem(itemId: string, quantity = 1): Promise<boolean> {
    const item = this.state.shopItems.find(i => i.id === itemId);
    if (!item) {
      return false;
    }

    if (item.weeklyLimit > 0 && item.soldThisWeek + quantity > item.weeklyLimit) {
      return false;
    }

    const totalPrice = item.price * quantity;
    if (this.state.playerContribution < totalPrice) {
      return false;
    }

    this.state.playerContribution -= totalPrice;
    item.soldThisWeek += quantity;

    const member = this.state.members.find(m => m.id === this.playerId);
    if (member) {
      member.contribution -= totalPrice;
    }

    this.saveState();
    this.emit('shop', { itemId, quantity });

    // Sync with Web3
    if (this.state.currentAlliance) {
      this.web3Service.purchaseShopItem(this.state.currentAlliance.id, itemId, quantity).then(tx => {
        console.log('Purchased shop item on-chain:', tx);
      });
    }

    return true;
  }

  public createTradeRequest(
    offerType: 'resource' | 'hero',
    offerAmount: number,
    offerResourceType: 'wood' | 'stone' | 'food' | 'gold',
    requestType: 'resource' | 'hero',
    requestAmount: number,
    requestResourceType: 'wood' | 'stone' | 'food' | 'gold'
  ): TradeRequest {
    if (!this.state.currentAlliance) {
      throw new Error('No alliance');
    }

    const trade: TradeRequest = {
      id: `trade_${Date.now()}`,
      creatorId: this.playerId,
      creatorName: this.playerName,
      offerType,
      offerAmount,
      offerResourceType,
      requestType,
      requestAmount,
      requestResourceType,
      status: 'open',
      createdAt: Date.now(),
    };

    this.state.tradeRequests.push(trade);
    this.saveState();

    return trade;
  }

  public acceptTradeRequest(tradeId: string): boolean {
    const trade = this.state.tradeRequests.find(t => t.id === tradeId);
    if (!trade || trade.status !== 'open' || trade.creatorId === this.playerId) {
      return false;
    }

    trade.status = 'accepted';
    trade.completedAt = Date.now();

    this.saveState();
    return true;
  }

  public cancelTradeRequest(tradeId: string): boolean {
    const trade = this.state.tradeRequests.find(t => t.id === tradeId);
    if (!trade || trade.creatorId !== this.playerId) {
      return false;
    }

    trade.status = 'cancelled';
    this.saveState();
    return true;
  }

  public getTradeRequests(): TradeRequest[] {
    return this.state.tradeRequests;
  }

  public async placeAdBid(amount: number): Promise<AdBid> {
    if (!this.state.currentAlliance) {
      throw new Error('No alliance');
    }

    const bid: AdBid = {
      allianceId: this.state.currentAlliance.id,
      allianceName: this.state.currentAlliance.name,
      amount,
      timestamp: Date.now(),
      refunded: false,
    };

    this.state.pendingBids.push(bid);
    this.saveState();

    return bid;
  }

  public getAdInfo(): AdSpace | null {
    return this.state.currentAlliance?.adSpace || null;
  }

  public getBidHistory(): AdBid[] {
    return this.state.pendingBids;
  }

  public getTechInfo(): AllianceTech[] {
    const alliance = this.state.currentAlliance;
    if (!alliance) {
      return [];
    }

    return DEFAULT_TECH_LIST.map(tech => ({
      ...tech,
      currentLevel: alliance.techLevel[tech.id] || 0,
    }));
  }

  public async upgradeTech(techId: string): Promise<boolean> {
    if (!this.state.currentAlliance) {
      return false;
    }

    const tech = DEFAULT_TECH_LIST.find(t => t.id === techId);
    if (!tech) {
      return false;
    }

    const currentLevel = this.state.currentAlliance.techLevel[techId] || 0;
    if (currentLevel >= tech.maxLevel) {
      return false;
    }

    const cost = tech.costPerLevel;
    if (this.state.playerContribution < cost) {
      return false;
    }

    this.state.playerContribution -= cost;
    this.state.currentAlliance.techLevel[techId] = currentLevel + 1;

    const member = this.state.members.find(m => m.id === this.playerId);
    if (member) {
      member.contribution -= cost;
    }

    this.saveState();
    this.emit('tech', { techId, newLevel: currentLevel + 1 });

    // Sync with Web3
    this.web3Service.upgradeTech(this.state.currentAlliance.id, techId).then(tx => {
      console.log('Upgraded tech on-chain:', tx);
    });

    return true;
  }

  public getTechBonuses(): Record<string, number> {
    if (!this.state.currentAlliance) {
      return {};
    }

    const bonuses: Record<string, number> = {};
    const techLevels = this.state.currentAlliance.techLevel;

    DEFAULT_TECH_LIST.forEach(tech => {
      const level = techLevels[tech.id] || 0;
      bonuses[tech.effectType] = tech.effectValue * level;
    });

    return bonuses;
  }

  public async declareWar(targetAllianceId: string): Promise<AllianceWar | null> {
    if (!this.state.currentAlliance) {
      return null;
    }

    if (this.state.currentAlliance.level < WAR_DECLARE_REQUIRED_LEVEL) {
      return null;
    }

    if (this.state.activeWar && this.state.activeWar.status === 'active') {
      return null;
    }

    const war: AllianceWar = {
      id: `war_${Date.now()}`,
      attackerId: this.state.currentAlliance.id,
      attackerName: this.state.currentAlliance.name,
      defenderId: targetAllianceId,
      defenderName: 'Enemy Alliance',
      startTime: Date.now(),
      endTime: Date.now() + WAR_DURATION,
      attackerScore: 0,
      defenderScore: 0,
      status: 'active',
      winnerId: null,
      attackerDeposit: WAR_DECLARE_DEPOSIT,
      defenderDeposit: WAR_DECLARE_DEPOSIT,
      reward: WAR_DECLARE_DEPOSIT * 0.4,
    };

    this.state.activeWar = war;
    this.saveState();
    this.emit('war', war);

    // Sync with Web3
    this.web3Service.declareWar(this.state.currentAlliance.id, targetAllianceId).then(tx => {
      console.log('Declared war on-chain:', tx);
    });

    return war;
  }

  public getWarInfo(): AllianceWar | null {
    return this.state.activeWar;
  }

  public submitWarScore(score: number): boolean {
    if (!this.state.activeWar || this.state.activeWar.status !== 'active') {
      return false;
    }

    if (this.state.activeWar.attackerId === this.state.currentAlliance?.id) {
      this.state.activeWar.attackerScore += score;
    } else if (this.state.activeWar.defenderId === this.state.currentAlliance?.id) {
      this.state.activeWar.defenderScore += score;
    }

    this.saveState();
    return true;
  }

  public async resolveWar(): Promise<AllianceWar | null> {
    if (!this.state.activeWar || this.state.activeWar.status !== 'active') {
      return null;
    }

    if (Date.now() < this.state.activeWar.endTime) {
      return null;
    }

    const war = this.state.activeWar;
    war.status = 'finished';

    if (war.attackerScore > war.defenderScore) {
      war.winnerId = war.attackerId;
    } else if (war.defenderScore > war.attackerScore) {
      war.winnerId = war.defenderId;
    }

    if (war.winnerId === this.state.currentAlliance?.id) {
      this.state.playerContribution += war.reward;
    }

    this.saveState();
    this.emit('war', war);

    // Sync with Web3
    this.web3Service.resolveWar(war.id).then(tx => {
      console.log('Resolved war on-chain:', tx);
    });

    return war;
  }

  public getApplications(): AllianceApplication[] {
    return this.state.applications;
  }

  public processApplication(applicationId: string, accepted: boolean): boolean {
    const app = this.state.applications.find(a => a.id === applicationId);
    if (!app || app.status !== 'pending') {
      return false;
    }

    if (!this.state.currentAlliance || 
        (this.state.playerRole !== 'leader' && this.state.playerRole !== 'officer')) {
      return false;
    }

    if (accepted) {
      const member: AllianceMember = {
        id: app.playerId,
        address: app.playerId,
        name: app.playerName,
        role: 'member' as AllianceRole,
        contribution: 0,
        lastCheckIn: 0,
        joinedAt: Date.now(),
        weeklyContribution: 0,
        contributionHistory: [],
      };

      this.state.members.push(member);
      this.state.currentAlliance.memberCount = this.state.members.length;
      app.status = 'accepted';
    } else {
      app.status = 'rejected';
    }

    app.processedAt = Date.now();
    this.saveState();
    this.emit('member', app);

    return true;
  }

  public contributeResource(type: 'wood' | 'stone' | 'food' | 'gold', amount: number): number {
    if (!this.state.currentAlliance) {
      return 0;
    }

    const contribution = Math.floor(amount);
    this.state.playerContribution += contribution;

    const member = this.state.members.find(m => m.id === this.playerId);
    if (member) {
      member.contribution += contribution;
      member.weeklyContribution += contribution;
    }

    this.saveState();
    this.emit('contribution', { type, amount: contribution });

    // Sync with Web3
    if (this.state.currentAlliance) {
      this.web3Service.contribute(this.state.currentAlliance.id, contribution.toString()).then(tx => {
        console.log('Contributed on-chain:', tx);
      });
    }

    return contribution;
  }

  public async depositToTreasury(amount: number): Promise<boolean> {
    if (!this.state.currentAlliance) {
      return false;
    }

    if (this.state.playerContribution < amount) {
      return false;
    }

    this.state.playerContribution -= amount;
    
    // Sync with Web3
    await this.web3Service.deposit(this.state.currentAlliance.id, amount.toString());
    
    this.saveState();
    this.emit('contribution', { type: 'gold', amount }); // Treat deposit as contribution
    
    return true;
  }

  public async requestWithdrawFromTreasury(amount: number, recipient: string): Promise<boolean> {
    if (!this.state.currentAlliance || this.state.playerRole !== 'leader') {
      return false;
    }

    // Sync with Web3
    await this.web3Service.requestWithdraw(this.state.currentAlliance.id, amount.toString(), recipient);
    
    return true;
  }

  public async getTreasuryBalance(): Promise<string> {
    if (!this.state.currentAlliance) {
      return '0';
    }
    return await this.web3Service.getBalance(this.state.currentAlliance.id);
  }

  public async getPendingWithdrawals(): Promise<WithdrawalRequest[]> {
    if (!this.state.currentAlliance) {
      return [];
    }
    return await this.web3Service.getPendingWithdrawals(this.state.currentAlliance.id);
  }

  public async save(): Promise<boolean> {
    try {
      this.saveState();
      return true;
    } catch (error) {
      console.error('Failed to save alliance:', error);
      return false;
    }
  }

  public async load(): Promise<boolean> {
    try {
      this.state = this.loadState();
      return true;
    } catch (error) {
      console.error('Failed to load alliance:', error);
      return false;
    }
  }

  public reset(): void {
    this.state = this.getDefaultState();
    this.saveState();
  }

  public weeklyReset(): void {
    this.state.shopItems.forEach(item => {
      item.soldThisWeek = 0;
    });

    this.state.members.forEach(member => {
      member.weeklyContribution = 0;
    });

    const winningBid = this.state.pendingBids.reduce((max, bid) => 
      bid.amount > max.amount ? bid : max, { amount: 0 } as AdBid);

    if (winningBid.amount > 0 && this.state.currentAlliance) {
      this.state.currentAlliance.adSpace = {
        allianceId: winningBid.allianceId,
        allianceName: winningBid.allianceName,
        message: 'Welcome to our alliance!',
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };
    }

    this.state.pendingBids = [];
    this.saveState();
  }
}

export default AllianceManager;
