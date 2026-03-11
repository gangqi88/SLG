import {
  IAllianceNFT,
  AllianceOnChainData,
  MemberOnChainData,
  AllianceContractEvents,
} from '@/features/alliance/contracts/IAllianceNFT';
import {
  ITreasuryContract,
  WithdrawalRequest,
  TreasuryContractEvents,
} from '@/features/city/contracts/ITreasuryContract';
import { dispatchMockEvent } from '@/features/alliance/hooks/useAllianceEvents';

// Mock Web3 Service to simulate blockchain interactions
class MockAllianceService implements IAllianceNFT, ITreasuryContract {
  private static instance: MockAllianceService;
  private allianceData: Record<string, AllianceOnChainData> = {};
  private memberData: Record<string, Record<string, MemberOnChainData>> = {};
  private treasuryData: Record<string, { balance: string; requests: WithdrawalRequest[] }> = {};

  private constructor() {
    // Initial mock data if needed
  }

  public static getInstance(): MockAllianceService {
    if (!MockAllianceService.instance) {
      MockAllianceService.instance = new MockAllianceService();
    }
    return MockAllianceService.instance;
  }

  // --- IAllianceNFT Implementation ---

  async balanceOf(owner: string): Promise<string> {
    // Simulate reading balance
    return '1000'; // Mock token balance
  }

  async ownerOf(tokenId: string): Promise<string> {
    // Simulate getting owner
    return `0xMockOwner_${tokenId}`;
  }

  async getAllianceData(tokenId: string): Promise<AllianceOnChainData> {
    // Simulate fetch
    await this.simulateDelay();
    return (
      this.allianceData[tokenId] || {
        name: `Alliance #${tokenId}`,
        level: 1,
        contributionPool: '0',
        treasuryBalance: '0',
        createdAt: Date.now(),
        exists: true,
      }
    );
  }

  async getMemberData(tokenId: string, memberAddress: string): Promise<MemberOnChainData> {
    await this.simulateDelay();
    const members = this.memberData[tokenId] || {};
    return (
      members[memberAddress] || {
        memberAddress,
        contribution: '0',
        lastCheckIn: 0,
        isActive: false,
      }
    );
  }

  async getAllianceMembers(tokenId: string): Promise<string[]> {
    await this.simulateDelay();
    const members = this.memberData[tokenId] || {};
    return Object.keys(members);
  }

  async createAlliance(name: string): Promise<string> {
    await this.simulateDelay(2000); // Simulate mining
    const tokenId = `alliance_${Date.now()}`;

    this.allianceData[tokenId] = {
      name,
      level: 1,
      contributionPool: '0',
      treasuryBalance: '0',
      createdAt: Date.now(),
      exists: true,
    };

    dispatchMockEvent(AllianceContractEvents.AllianceCreated, { tokenId, name, creator: '0xUser' });
    return `0xTxHash_CreateAlliance_${tokenId}`;
  }

  async joinAlliance(tokenId: string): Promise<string> {
    await this.simulateDelay();
    // In real contract, msg.sender is used
    const memberAddress = '0xUser';

    if (!this.memberData[tokenId]) this.memberData[tokenId] = {};
    this.memberData[tokenId][memberAddress] = {
      memberAddress,
      contribution: '0',
      lastCheckIn: 0,
      isActive: true,
    };

    dispatchMockEvent(AllianceContractEvents.MemberJoined, { tokenId, member: memberAddress });
    return `0xTxHash_Join_${tokenId}`;
  }

  async leaveAlliance(tokenId: string): Promise<string> {
    await this.simulateDelay();
    const memberAddress = '0xUser';

    if (this.memberData[tokenId] && this.memberData[tokenId][memberAddress]) {
      delete this.memberData[tokenId][memberAddress];
    }

    dispatchMockEvent(AllianceContractEvents.MemberLeft, { tokenId, member: memberAddress });
    return `0xTxHash_Leave_${tokenId}`;
  }

  async contribute(tokenId: string, amount: string): Promise<string> {
    await this.simulateDelay();
    const memberAddress = '0xUser';

    // Update local state
    if (this.memberData[tokenId] && this.memberData[tokenId][memberAddress]) {
      const current = BigInt(this.memberData[tokenId][memberAddress].contribution);
      this.memberData[tokenId][memberAddress].contribution = (current + BigInt(amount)).toString();
    }

    if (this.allianceData[tokenId]) {
      const currentPool = BigInt(this.allianceData[tokenId].contributionPool);
      this.allianceData[tokenId].contributionPool = (currentPool + BigInt(amount)).toString();
    }

    dispatchMockEvent(AllianceContractEvents.ContributionReceived, {
      tokenId,
      member: memberAddress,
      amount,
    });
    return `0xTxHash_Contribute_${tokenId}`;
  }

  async checkIn(tokenId: string): Promise<string> {
    await this.simulateDelay();
    // Update last check-in time
    const memberAddress = '0xUser';
    if (this.memberData[tokenId] && this.memberData[tokenId][memberAddress]) {
      this.memberData[tokenId][memberAddress].lastCheckIn = Date.now();
    }
    return `0xTxHash_CheckIn_${tokenId}`;
  }

  async purchaseShopItem(tokenId: string, itemId: string, quantity: number): Promise<string> {
    await this.simulateDelay();
    dispatchMockEvent(AllianceContractEvents.ShopPurchase, {
      tokenId,
      itemId,
      quantity,
      buyer: '0xUser',
    });
    return `0xTxHash_ShopBuy_${tokenId}`;
  }

  async upgradeTech(tokenId: string, techId: string): Promise<string> {
    await this.simulateDelay();
    dispatchMockEvent(AllianceContractEvents.TechUpgraded, { tokenId, techId });
    return `0xTxHash_TechUpgrade_${tokenId}`;
  }

  async declareWar(attackerTokenId: string, defenderTokenId: string): Promise<string> {
    await this.simulateDelay();
    dispatchMockEvent(AllianceContractEvents.WarDeclared, {
      attacker: attackerTokenId,
      defender: defenderTokenId,
    });
    return `0xTxHash_WarDeclare_${attackerTokenId}`;
  }

  async resolveWar(warId: string): Promise<string> {
    await this.simulateDelay();
    dispatchMockEvent(AllianceContractEvents.WarEnded, { warId, winner: 'unknown' });
    return `0xTxHash_WarResolve_${warId}`;
  }

  // --- ITreasuryContract Implementation ---

  async getBalance(allianceTokenId: string): Promise<string> {
    await this.simulateDelay();
    return this.treasuryData[allianceTokenId]?.balance || '0';
  }

  async getPendingWithdrawals(allianceTokenId: string): Promise<WithdrawalRequest[]> {
    await this.simulateDelay();
    return this.treasuryData[allianceTokenId]?.requests || [];
  }

  async deposit(allianceTokenId: string, amount: string): Promise<string> {
    await this.simulateDelay();
    if (!this.treasuryData[allianceTokenId]) {
      this.treasuryData[allianceTokenId] = { balance: '0', requests: [] };
    }

    const current = BigInt(this.treasuryData[allianceTokenId].balance);
    this.treasuryData[allianceTokenId].balance = (current + BigInt(amount)).toString();

    dispatchMockEvent(TreasuryContractEvents.DepositReceived, {
      allianceTokenId,
      amount,
      depositor: '0xUser',
    });
    return `0xTxHash_Deposit_${allianceTokenId}`;
  }

  async requestWithdraw(
    allianceTokenId: string,
    amount: string,
    recipient: string,
  ): Promise<string> {
    await this.simulateDelay();
    // Add request logic here
    dispatchMockEvent(TreasuryContractEvents.WithdrawalRequested, {
      allianceTokenId,
      amount,
      recipient,
    });
    return `0xTxHash_RequestWithdraw_${allianceTokenId}`;
  }

  async approveWithdraw(allianceTokenId: string, requestId: string): Promise<string> {
    await this.simulateDelay();
    return `0xTxHash_ApproveWithdraw_${requestId}`;
  }

  async executeWithdraw(allianceTokenId: string, requestId: string): Promise<string> {
    await this.simulateDelay();
    dispatchMockEvent(TreasuryContractEvents.WithdrawalExecuted, { allianceTokenId, requestId });
    return `0xTxHash_ExecuteWithdraw_${requestId}`;
  }

  // Helper
  private simulateDelay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default MockAllianceService;
