import { useState, useCallback, useEffect } from 'react';
import { unisatAPI } from '../services/unisatAPI';
import type { BRC20Balance } from '../types/unisat';

export interface BRC20TokenWithPrice extends BRC20Balance {
    floorPrice?: number;
    marketCap?: number;
}

export const useUniSatBRC20 = (address: string | null) => {
    const [tokens, setTokens] = useState<BRC20Balance[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 获取 BRC-20 余额
    const fetchBRC20Balance = useCallback(async () => {
        if (!address) {
            setTokens([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await unisatAPI.getBRC20BalanceList(address);
            setTokens(data || []);
        } catch (err: any) {
            setError(err.message || '获取 BRC-20 余额失败');
            console.error('获取 BRC-20 余额失败:', err);
        } finally {
            setIsLoading(false);
        }
    }, [address]);

    // 获取指定代币余额
    const getTokenBalance = useCallback(
        async (ticker: string): Promise<BRC20Balance | null> => {
            if (!address) return null;

            try {
                return await unisatAPI.getBRC20Balance(address, ticker);
            } catch (err) {
                console.error(`获取 ${ticker} 余额失败:`, err);
                return null;
            }
        },
        [address]
    );

    // 自动刷新
    useEffect(() => {
        if (address) {
            fetchBRC20Balance();
        }
    }, [address, fetchBRC20Balance]);

    return {
        tokens,
        isLoading,
        error,
        fetchBRC20Balance,
        getTokenBalance,
    };
};

export default useUniSatBRC20;
