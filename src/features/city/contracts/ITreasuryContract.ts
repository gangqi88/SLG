export interface ITreasuryContract {
  // Read functions
  getBalance(allianceTokenId: string): Promise<string>;
  getPendingWithdrawals(allianceTokenId: string): Promise<WithdrawalRequest[]>;

  // Write functions (transaction)
  deposit(allianceTokenId: string, amount: string): Promise<string>;
  requestWithdraw(allianceTokenId: string, amount: string, recipient: string): Promise<string>;
  approveWithdraw(allianceTokenId: string, requestId: string): Promise<string>;
  executeWithdraw(allianceTokenId: string, requestId: string): Promise<string>;
}

export interface WithdrawalRequest {
  id: string;
  amount: string;
  recipient: string;
  approvals: number;
  requiredApprovals: number;
  status: 'pending' | 'executed' | 'rejected';
  createdAt: number;
}

export enum TreasuryContractEvents {
  DepositReceived = 'DepositReceived',
  WithdrawalRequested = 'WithdrawalRequested',
  WithdrawalExecuted = 'WithdrawalExecuted',
}
