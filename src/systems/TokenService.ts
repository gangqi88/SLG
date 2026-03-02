import {
    GameToken,
    TokenBalance,
    TokenTransaction,
    GovernanceProposal,
    GovernanceVote,
    SeasonReward,
    GAME_TOKENS,
    TOKEN_CONSTANTS,
} from '../types/slg/token.types';
import { generateId } from '../utils/helpers';

const BALANCES_KEY = 'game_token_balances';
const TRANSACTIONS_KEY = 'token_transactions';
const PROPOSALS_KEY = 'governance_proposals';
const VOTES_KEY = 'governance_votes';
const SEASON_REWARDS_KEY = 'season_rewards';

export class TokenService {
    private static instance: TokenService;

    private constructor() {
        this.initializeTokens();
    }

    static getInstance(): TokenService {
        if (!TokenService.instance) {
            TokenService.instance = new TokenService();
        }
        return TokenService.instance;
    }

    private initializeTokens(): void {
        const stored = localStorage.getItem('game_tokens');
        if (!stored) {
            localStorage.setItem('game_tokens', JSON.stringify(GAME_TOKENS));
        }
    }

    getTokens(): GameToken[] {
        const stored = localStorage.getItem('game_tokens');
        return stored ? JSON.parse(stored) : GAME_TOKENS;
    }

    getToken(symbol: string): GameToken | undefined {
        return this.getTokens().find(t => t.symbol === symbol);
    }

    private getBalances(): Record<string, TokenBalance[]> {
        try {
            const stored = localStorage.getItem(BALANCES_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    }

    private saveBalances(balances: Record<string, TokenBalance[]>): void {
        localStorage.setItem(BALANCES_KEY, JSON.stringify(balances));
    }

    getBalance(address: string, tokenSymbol: string): TokenBalance {
        const balances = this.getBalances();
        const userBalances = balances[address] || [];
        
        let tokenBalance = userBalances.find(b => b.symbol === tokenSymbol);
        
        if (!tokenBalance) {
            const token = this.getToken(tokenSymbol);
            tokenBalance = {
                tokenId: token?.id || tokenSymbol,
                symbol: tokenSymbol,
                balance: 0,
                locked: 0,
                available: 0,
            };
        }

        return tokenBalance;
    }

    getAllBalances(address: string): TokenBalance[] {
        const balances = this.getBalances();
        const userBalances = balances[address] || [];
        const tokens = this.getTokens();

        return tokens.map(token => {
            const existing = userBalances.find(b => b.symbol === token.symbol);
            return existing || {
                tokenId: token.id,
                symbol: token.symbol,
                balance: 0,
                locked: 0,
                available: 0,
            };
        });
    }

    addTokens(address: string, symbol: string, amount: number, _reason: string = 'reward'): void {
        const balances = this.getBalances();
        const userBalances = balances[address] || [];
        
        let tokenBalance = userBalances.find(b => b.symbol === symbol);
        
        if (!tokenBalance) {
            const token = this.getToken(symbol);
            tokenBalance = {
                tokenId: token?.id || symbol,
                symbol,
                balance: 0,
                locked: 0,
                available: 0,
            };
            userBalances.push(tokenBalance);
        }

        tokenBalance.balance += amount;
        tokenBalance.available += amount;

        balances[address] = userBalances;
        this.saveBalances(balances);

        this.recordTransaction({
            tokenId: tokenBalance.tokenId,
            from: 'system',
            to: address,
            amount,
            type: 'mint',
        });
    }

    spendTokens(address: string, symbol: string, amount: number): boolean {
        const balances = this.getBalances();
        const userBalances = balances[address] || [];
        const tokenBalance = userBalances.find(b => b.symbol === symbol);

        if (!tokenBalance || tokenBalance.available < amount) {
            return false;
        }

        tokenBalance.balance -= amount;
        tokenBalance.available -= amount;

        balances[address] = userBalances;
        this.saveBalances(balances);

        this.recordTransaction({
            tokenId: tokenBalance.tokenId,
            from: address,
            to: 'system',
            amount,
            type: 'burn',
        });

        return true;
    }

    private recordTransaction(tx: Omit<TokenTransaction, 'id' | 'timestamp' | 'status'>): void {
        const transactions = this.getTransactions();
        
        transactions.push({
            ...tx,
            id: generateId(),
            timestamp: Date.now(),
            status: 'confirmed',
        });

        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions.slice(-100)));
    }

    getTransactions(address?: string): TokenTransaction[] {
        const stored = localStorage.getItem(TRANSACTIONS_KEY);
        const all = stored ? JSON.parse(stored) : [];
        
        if (address) {
            return all.filter((t: TokenTransaction) => t.from === address || t.to === address);
        }
        return all;
    }

    getProposals(): GovernanceProposal[] {
        const stored = localStorage.getItem(PROPOSALS_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    createProposal(proposer: string, title: string, description: string): GovernanceProposal {
        const proposals = this.getProposals();
        
        const proposal: GovernanceProposal = {
            id: generateId(),
            title,
            description,
            proposer,
            votesFor: 0,
            votesAgainst: 0,
            votesAbstain: 0,
            status: 'active',
            startTime: Date.now(),
            endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
            quorum: TOKEN_CONSTANTS.GOVERNANCE_QUORUM,
        };

        proposals.push(proposal);
        localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));

        return proposal;
    }

    vote(proposalId: string, voter: string, vote: 'for' | 'against' | 'abstain', weight: number): boolean {
        const proposals = this.getProposals();
        const proposal = proposals.find(p => p.id === proposalId);

        if (!proposal || proposal.status !== 'active') {
            return false;
        }

        if (Date.now() > proposal.endTime) {
            proposal.status = Date.now() > proposal.endTime ? 'rejected' : 'active';
        }

        switch (vote) {
            case 'for':
                proposal.votesFor += weight;
                break;
            case 'against':
                proposal.votesAgainst += weight;
                break;
            case 'abstain':
                proposal.votesAbstain += weight;
                break;
        }

        const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
        if (totalVotes >= proposal.quorum * 1000000) {
            if (proposal.votesFor > proposal.votesAgainst) {
                proposal.status = 'passed';
            } else {
                proposal.status = 'rejected';
            }
        }

        localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));

        const votes = this.getVotes(proposalId);
        votes.push({
            proposalId,
            voter,
            vote,
            weight,
            timestamp: Date.now(),
        });
        localStorage.setItem(VOTES_KEY, JSON.stringify(votes));

        return true;
    }

    private getVotes(proposalId: string): GovernanceVote[] {
        const stored = localStorage.getItem(VOTES_KEY);
        const all = stored ? JSON.parse(stored) : [];
        return all.filter((v: GovernanceVote) => v.proposalId === proposalId);
    }

    getSeasonRewards(seasonId: string, _address: string): SeasonReward | null {
        const stored = localStorage.getItem(SEASON_REWARDS_KEY);
        const all: SeasonReward[] = stored ? JSON.parse(stored) : [];
        
        return all.find(r => r.seasonId === seasonId) || null;
    }

    claimSeasonReward(seasonId: string, address: string): boolean {
        const stored = localStorage.getItem(SEASON_REWARDS_KEY);
        const all: SeasonReward[] = stored ? JSON.parse(stored) : [];
        
        const reward = all.find(r => r.seasonId === seasonId && !r.claimed);
        
        if (!reward) {
            return false;
        }

        for (const tokenReward of reward.rewards) {
            this.addTokens(address, tokenReward.tokenId, tokenReward.amount, 'season_reward');
        }

        reward.claimed = true;
        reward.claimedAt = Date.now();

        localStorage.setItem(SEASON_REWARDS_KEY, JSON.stringify(all));

        return true;
    }

    calculateStakeReward(stakedAmount: number, days: number): number {
        const dailyRate = TOKEN_CONSTANTS.STAKING_REWARD_RATE / 365;
        return Math.floor(stakedAmount * dailyRate * days);
    }

    formatTokenAmount(amount: number, decimals: number): string {
        if (decimals === 0) {
            return amount.toLocaleString();
        }
        return (amount / Math.pow(10, decimals)).toFixed(decimals);
    }
}

export const tokenService = TokenService.getInstance();
