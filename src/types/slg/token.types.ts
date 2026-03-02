export type TokenType = 'governance' | 'resource' | 'reward' | 'nft';

export type TokenStandard = 'BRC20' | 'FRC20' | 'ERC20' | 'native';

export interface GameToken {
    id: string;
    name: string;
    symbol: string;
    type: TokenType;
    standard: TokenStandard;
    decimals: number;
    totalSupply: number;
    circulatingSupply: number;
    icon: string;
    description: string;
    isListed: boolean;
}

export interface TokenBalance {
    tokenId: string;
    symbol: string;
    balance: number;
    locked: number;
    available: number;
}

export interface TokenTransaction {
    id: string;
    tokenId: string;
    from: string;
    to: string;
    amount: number;
    type: 'transfer' | 'mint' | 'burn' | 'stake' | 'unstake' | 'reward' | 'purchase';
    timestamp: number;
    status: 'pending' | 'confirmed' | 'failed';
    txHash?: string;
}

export interface StakingPool {
    tokenId: string;
    totalStaked: number;
    rewardRate: number;
    lockPeriod: number;
    minStake: number;
    maxStake: number;
}

export interface GovernanceProposal {
    id: string;
    title: string;
    description: string;
    proposer: string;
    votesFor: number;
    votesAgainst: number;
    votesAbstain: number;
    status: 'active' | 'passed' | 'rejected' | 'executed';
    startTime: number;
    endTime: number;
    quorum: number;
}

export interface GovernanceVote {
    proposalId: string;
    voter: string;
    vote: 'for' | 'against' | 'abstain';
    weight: number;
    timestamp: number;
}

export interface SeasonReward {
    seasonId: string;
    rank: number;
    rewards: TokenReward[];
    claimed: boolean;
    claimedAt?: number;
}

export interface TokenReward {
    tokenId: string;
    amount: number;
}

export const GAME_TOKENS: GameToken[] = [
    {
        id: 'friend',
        name: 'Friend Token',
        symbol: 'FRIEND',
        type: 'governance',
        standard: 'FRC20',
        decimals: 18,
        totalSupply: 1000000000,
        circulatingSupply: 300000000,
        icon: '🤝',
        description: '治理代币，用于投票和质押',
        isListed: true,
    },
    {
        id: 'gems',
        name: 'Gems',
        symbol: 'GEMS',
        type: 'resource',
        standard: 'native',
        decimals: 0,
        totalSupply: 0,
        circulatingSupply: 0,
        icon: '💎',
        description: '游戏内资源代币，用于购买和升级',
        isListed: false,
    },
    {
        id: 'honor',
        name: 'Honor Points',
        symbol: 'HONOR',
        type: 'reward',
        standard: 'native',
        decimals: 0,
        totalSupply: 0,
        circulatingSupply: 0,
        icon: '🏆',
        description: '荣誉积分，赛季奖励',
        isListed: false,
    },
];

export const TOKEN_CONSTANTS = {
    MINT_RATES: {
        daily: 100,
        weekly: 500,
        monthly: 2000,
    },
    STAKING_REWARD_RATE: 0.15,
    GOVERNANCE_QUORUM: 0.1,
    VOTE_WEIGHT_MULTIPLIER: 1,
    SEASON_REWARD_POOL: 1000000,
};
