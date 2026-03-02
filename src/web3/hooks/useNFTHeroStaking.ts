import { useState, useEffect, useCallback } from 'react';
import type { NFTHero } from '../../types/slg/nft-hero.types';
import type {
    StakingPosition,
    StakingPool,
    StakingStats,
    StakeResult,
    UnstakeResult,
    ClaimResult,
} from '../../types/slg/staking.types';
import { stakingService } from '../../systems/StakingService';

export interface UseNFTHeroStakingState {
    positions: StakingPosition[];
    pool: StakingPool | null;
    stats: StakingStats | null;
    isLoading: boolean;
    error: string | null;
}

export interface UseNFTHeroStakingActions {
    fetchMyStakes: (address: string) => void;
    stake: (hero: NFTHero, ownerAddress: string, duration: number) => Promise<StakeResult>;
    initiateUnstake: (positionId: string, ownerAddress: string) => Promise<UnstakeResult>;
    completeUnstake: (positionId: string, ownerAddress: string) => Promise<UnstakeResult>;
    claimRewards: (positionId: string, ownerAddress: string) => Promise<ClaimResult>;
    refresh: (address: string) => void;
}

export const useNFTHeroStaking = (): UseNFTHeroStakingState & UseNFTHeroStakingActions => {
    const [positions, setPositions] = useState<StakingPosition[]>([]);
    const [pool, setPool] = useState<StakingPool | null>(null);
    const [stats, setStats] = useState<StakingStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMyStakes = useCallback((address: string) => {
        if (!address) {
            setPositions([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const stakes = stakingService.getMyStakes(address);
            setPositions(stakes);

            const poolInfo = stakingService.getPoolInfo();
            setPool(poolInfo);

            const stakingStats = stakingService.getStats();
            setStats(stakingStats);
        } catch (err: any) {
            setError(err.message || '获取质押信息失败');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const stake = useCallback(
        async (hero: NFTHero, ownerAddress: string, duration: number): Promise<StakeResult> => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await stakingService.stake(hero, ownerAddress, duration);

                if (result.success) {
                    fetchMyStakes(ownerAddress);
                }

                return result;
            } catch (err: any) {
                return {
                    success: false,
                    error: err.message || '质押失败',
                };
            } finally {
                setIsLoading(false);
            }
        },
        [fetchMyStakes]
    );

    const initiateUnstake = useCallback(
        async (positionId: string, ownerAddress: string): Promise<UnstakeResult> => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await stakingService.initiateUnstake(positionId, ownerAddress);

                if (result.success) {
                    fetchMyStakes(ownerAddress);
                }

                return result;
            } catch (err: any) {
                return {
                    success: false,
                    error: err.message || '解除质押失败',
                };
            } finally {
                setIsLoading(false);
            }
        },
        [fetchMyStakes]
    );

    const completeUnstake = useCallback(
        async (positionId: string, ownerAddress: string): Promise<UnstakeResult> => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await stakingService.completeUnstake(positionId, ownerAddress);

                if (result.success) {
                    fetchMyStakes(ownerAddress);
                }

                return result;
            } catch (err: any) {
                return {
                    success: false,
                    error: err.message || '完成解除质押失败',
                };
            } finally {
                setIsLoading(false);
            }
        },
        [fetchMyStakes]
    );

    const claimRewards = useCallback(
        async (positionId: string, ownerAddress: string): Promise<ClaimResult> => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await stakingService.claimRewards(positionId, ownerAddress);

                if (result.success) {
                    fetchMyStakes(ownerAddress);
                }

                return result;
            } catch (err: any) {
                return {
                    success: false,
                    error: err.message || '领取奖励失败',
                };
            } finally {
                setIsLoading(false);
            }
        },
        [fetchMyStakes]
    );

    const refresh = useCallback(
        (address: string) => {
            fetchMyStakes(address);
        },
        [fetchMyStakes]
    );

    useEffect(() => {
        const poolInfo = stakingService.getPoolInfo();
        setPool(poolInfo);
        const stakingStats = stakingService.getStats();
        setStats(stakingStats);
    }, []);

    return {
        positions,
        pool,
        stats,
        isLoading,
        error,
        fetchMyStakes,
        stake,
        initiateUnstake,
        completeUnstake,
        claimRewards,
        refresh,
    };
};

export default useNFTHeroStaking;
