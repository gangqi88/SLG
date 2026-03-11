export interface IAllianceNFT {
  // Read functions
  balanceOf(owner: string): Promise<string>;
  ownerOf(tokenId: string): Promise<string>;
  getAllianceData(tokenId: string): Promise<AllianceOnChainData>;
  getMemberData(tokenId: string, memberAddress: string): Promise<MemberOnChainData>;
  getAllianceMembers(tokenId: string): Promise<string[]>;

  // Write functions (transaction)
  createAlliance(name: string): Promise<string>; // Returns transaction hash
  joinAlliance(tokenId: string): Promise<string>;
  leaveAlliance(tokenId: string): Promise<string>;
  contribute(tokenId: string, amount: string): Promise<string>;
  checkIn(tokenId: string): Promise<string>;
  purchaseShopItem(tokenId: string, itemId: string, quantity: number): Promise<string>;
  upgradeTech(tokenId: string, techId: string): Promise<string>;
  declareWar(attackerTokenId: string, defenderTokenId: string): Promise<string>;
  resolveWar(warId: string): Promise<string>;
}

export interface AllianceOnChainData {
  name: string;
  level: number;
  contributionPool: string;
  treasuryBalance: string;
  createdAt: number;
  exists: boolean;
}

export interface MemberOnChainData {
  memberAddress: string;
  contribution: string;
  lastCheckIn: number;
  isActive: boolean;
}

export enum AllianceContractEvents {
  AllianceCreated = 'AllianceCreated',
  MemberJoined = 'MemberJoined',
  MemberLeft = 'MemberLeft',
  ContributionReceived = 'ContributionReceived',
  ShopPurchase = 'ShopPurchase',
  TechUpgraded = 'TechUpgraded',
  WarDeclared = 'WarDeclared',
  WarEnded = 'WarEnded',
}
