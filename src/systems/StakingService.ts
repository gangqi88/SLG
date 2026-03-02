import type { NFTHero } from '../types/slg/nft-hero.types';
import {
    StakingPosition,
    StakingPool,
    StakingStats,
    StakeResult,
    UnstakeResult,
    ClaimResult,
    STAKING_CONSTANTS,
    DURATION_BONUS_APR,
} from '../types/slg/staking.types';
import { generateId } from '../utils/helpers';

const STORAGE_KEY = 'nft_staking_positions';
const POOL_KEY = 'nft_staking_pool';

export class StakingService {
    private static instance: StakingService;
    private defaultPool: StakingPool;

    private constructor() {
        this.defaultPool = {
            id: 'main_pool',
            name: '英雄质押池',
            totalStaked: 0,
            totalRewards: 1000000,
            apr: STAKING_CONSTANTS.BASE_APR,
            minDuration: STAKING_CONSTANTS.MIN_STAKE_DURATION,
            maxDuration: STAKING_CONSTANTS.MAX_STAKE_DURATION,
            rewardToken: 'FRIEND',
            isActive: true,
        };
    }

    static getInstance(): StakingService {
        if (!StakingService.instance) {
            StakingService.instance = new StakingService();
        }
        return StakingService.instance;
    }

    private getPositions(): StakingPosition[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    private savePositions(positions: StakingPosition[]): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    }

    private getPool(): StakingPool {
        try {
            const stored = localStorage.getItem(POOL_KEY);
            return stored ? JSON.parse(stored) : this.defaultPool;
        } catch {
            return this.defaultPool;
        }
    }

    private savePool(pool: StakingPool): void {
        localStorage.setItem(POOL_KEY, JSON.stringify(pool));
    }

    private calculateAPR(duration: number): number {
        const days = Math.floor(duration / (24 * 60 * 60 * 1000));
        let apr = STAKING_CONSTANTS.BASE_APR;

        for (const [minDays, bonus] of Object.entries(DURATION_BONUS_APR)) {
            if (days >= parseInt(minDays)) {
                apr = STAKING_CONSTANTS.BASE_APR + bonus;
            }
        }

        return apr;
    }

    private calculatePendingRewards(position: StakingPosition): number {
        if (position.status !== 'active') return 0;

        const now = Date.now();
        const stakedDuration = now - position.stakedAt;
        const rewardRate = position.rewards.apr / 365 / 24 / 60 / 60 / 1000;
        const pending = stakedDuration * rewardRate * position.hero.power;

        return Math.floor(pending);
    }

    async stake(
        hero: NFTHero,
        ownerAddress: string,
        duration: number
    ): Promise<StakeResult> {
        if (duration < STAKING_CONSTANTS.MIN_STAKE_DURATION) {
            return { success: false, error: '质押时长最短7天' };
        }

        if (duration > STAKING_CONSTANTS.MAX_STAKE_DURATION) {
            return { success: false, error: '质押时长最长365天' };
        }

        const positions = this.getPositions();
        const existingStake = positions.find(
            p => p.hero.nftId === hero.nftId && p.status === 'active'
        );

        if (existingStake) {
            return { success: false, error: '该英雄已经在质押中' };
        }

        const apr = this.calculateAPR(duration);
        const now = Date.now();

        const position: StakingPosition = {
            id: generateId(),
            ownerAddress,
            hero,
            stakedAt: now,
            unlockAt: now + duration,
            duration,
            rewards: {
                pendingRewards: 0,
                claimedRewards: 0,
                rewardToken: 'FRIEND',
                apr,
            },
            status: 'active',
        };

        positions.push(position);
        this.savePositions(positions);

        const pool = this.getPool();
        pool.totalStaked += 1;
        this.savePool(pool);

        return { success: true, position };
    }

    async initiateUnstake(
        positionId: string,
        ownerAddress: string
    ): Promise<UnstakeResult> {
        const positions = this.getPositions();
        const position = positions.find(p => p.id === positionId);

        if (!position) {
            return { success: false, error: '质押位置不存在' };
        }

        if (position.ownerAddress !== ownerAddress) {
            return { success: false, error: '无权操作' };
        }

        if (position.status !== 'active') {
            return { success: false, error: '该质押已结束' };
        }

        const now = Date.now();
        if (now < position.unlockAt) {
            const remaining = Math.ceil((position.unlockAt - now) / (24 * 60 * 60 * 1000));
            return { success: false, error: `还需等待${remaining}天才能解除质押` };
        }

        position.status = 'unstaking';
        position.rewards.pendingRewards = this.calculatePendingRewards(position);
        this.savePositions(positions);

        return {
            success: true,
            transactionId: generateId(),
        };
    }

    async completeUnstake(
        positionId: string,
        ownerAddress: string
    ): Promise<UnstakeResult> {
        const positions = this.getPositions();
        const position = positions.find(p => p.id === positionId);

        if (!position) {
            return { success: false, error: '质押位置不存在' };
        }

        if (position.ownerAddress !== ownerAddress) {
            return { success: false, error: '无权操作' };
        }

        if (position.status !== 'unstaking') {
            return { success: false, error: '该质押未处于解除中状态' };
        }

        position.status = 'claimed';
        position.claimedAt = Date.now();
        this.savePositions(positions);

        const pool = this.getPool();
        pool.totalStaked = Math.max(0, pool.totalStaked - 1);
        this.savePool(pool);

        return {
            success: true,
            transactionId: generateId(),
        };
    }

    async claimRewards(
        positionId: string,
        ownerAddress: string
    ): Promise<ClaimResult> {
        const positions = this.getPositions();
        const position = positions.find(p => p.id === positionId);

        if (!position) {
            return { success: false, error: '质押位置不存在' };
        }

        if (position.ownerAddress !== ownerAddress) {
            return { success: false, error: '无权操作' };
        }

        const pending = this.calculatePendingRewards(position);
        if (pending <= 0) {
            return { success: false, error: '暂无可领取的奖励' };
        }

        position.rewards.claimedRewards += pending;
        position.rewards.pendingRewards = 0;
        this.savePositions(positions);

        return {
            success: true,
            amount: pending,
            transactionId: generateId(),
        };
    }

    getMyStakes(address: string): StakingPosition[] {
        const positions = this.getPositions();
        return positions
            .filter(p => p.ownerAddress === address)
            .sort((a, b) => b.stakedAt - a.stakedAt);
    }

    getStakeById(positionId: string): StakingPosition | null {
        const positions = this.getPositions();
        return positions.find(p => p.id === positionId) || null;
    }

    getActiveStakes(): StakingPosition[] {
        return this.getPositions().filter(p => p.status === 'active');
    }

    getStats(): StakingStats {
        const positions = this.getPositions();
        const activePositions = positions.filter(p => p.status === 'active');

        const totalApr = activePositions.reduce((sum, p) => sum + p.rewards.apr, 0);

        return {
            totalStaked: activePositions.length,
            totalPositions: positions.length,
            totalRewardsDistributed: positions.reduce(
                (sum, p) => sum + p.rewards.claimedRewards,
                0
            ),
            averageApr: activePositions.length > 0 ? totalApr / activePositions.length : 0,
        };
    }

    getPoolInfo(): StakingPool {
        return this.getPool();
    }

    getDurationOptions(): Array<{ days: number; label: string; bonus: number }> {
        return [
            { days: 7, label: '7天', bonus: DURATION_BONUS_APR[7] },
            { days: 14, label: '14天', bonus: DURATION_BONUS_APR[14] },
            { days: 30, label: '30天', bonus: DURATION_BONUS_APR[30] },
            { days: 60, label: '60天', bonus: DURATION_BONUS_APR[60] },
            { days: 90, label: '90天', bonus: DURATION_BONUS_APR[90] },
            { days: 180, label: '180天', bonus: DURATION_BONUS_APR[180] },
            { days: 365, label: '365天', bonus: DURATION_BONUS_APR[365] },
        ];
    }
}

export const stakingService = StakingService.getInstance();
