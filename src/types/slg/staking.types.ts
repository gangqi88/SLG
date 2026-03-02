import type { NFTHero } from './nft-hero.types';

export type StakingStatus = 'active' | 'unstaking' | 'claimed' | 'expired';

export interface StakingPosition {
    id: string;
    ownerAddress: string;
    hero: NFTHero;
    stakedAt: number;
    unlockAt: number;
    duration: number;
    rewards: StakingRewards;
    status: StakingStatus;
    claimedAt?: number;
}

export interface StakingRewards {
    pendingRewards: number;
    claimedRewards: number;
    rewardToken: string;
    apr: number;
}

export interface StakeRequest {
    heroId: string;
    hero: NFTHero;
    duration: number;
    ownerAddress: string;
}

export interface UnstakeRequest {
    positionId: string;
    ownerAddress: string;
}

export interface ClaimRewardsRequest {
    positionId: string;
    ownerAddress: string;
}

export interface StakingPool {
    id: string;
    name: string;
    totalStaked: number;
    totalRewards: number;
    apr: number;
    minDuration: number;
    maxDuration: number;
    rewardToken: string;
    isActive: boolean;
}

export interface StakingStats {
    totalStaked: number;
    totalPositions: number;
    totalRewardsDistributed: number;
    averageApr: number;
}

export interface StakeResult {
    success: boolean;
    position?: StakingPosition;
    error?: string;
}

export interface UnstakeResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

export interface ClaimResult {
    success: boolean;
    amount?: number;
    transactionId?: string;
    error?: string;
}

export const STAKING_CONSTANTS = {
    MIN_STAKE_DURATION: 7 * 24 * 60 * 60 * 1000,
    MAX_STAKE_DURATION: 365 * 24 * 60 * 60 * 1000,
    UNSTAKE_DELAY: 7 * 24 * 60 * 60 * 1000,
    CLAIM_INTERVAL: 24 * 60 * 60 * 1000,
    REWARD_TOKENS: ['FRIEND', 'FB', 'GEMS'],
    BASE_APR: 0.15,
    BONUS_APR: {
        30: 0.05,
        90: 0.10,
        180: 0.20,
        365: 0.30,
    },
} as const;

export const DURATION_BONUS_APR: Record<number, number> = {
    7: 0.05,
    14: 0.08,
    30: 0.10,
    60: 0.15,
    90: 0.20,
    180: 0.25,
    365: 0.30,
};
