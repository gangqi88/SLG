import { useState, useEffect, useCallback } from 'react';
import type { UniSatWallet } from '../types/unisat';
import { CURRENT_NETWORK } from '../config/network';

export interface UniSatWalletState {
    address: string | null;
    publicKey: string | null;
    balance: {
        confirmed: number;
        unconfirmed: number;
        total: number;
    };
    network: string;
    isConnected: boolean;
}

export const useUniSatWallet = () => {
    const [state, setState] = useState<UniSatWalletState>({
        address: null,
        publicKey: null,
        balance: { confirmed: 0, unconfirmed: 0, total: 0 },
        network: '',
        isConnected: false,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 检查 UniSat 是否安装
    const checkUniSatInstalled = useCallback(() => {
        return typeof window !== 'undefined' && typeof window.unisat !== 'undefined';
    }, []);

    // 获取 UniSat 实例
    const getUniSat = useCallback((): UniSatWallet | null => {
        return window.unisat || null;
    }, []);

    // 连接钱包
    const connect = useCallback(async () => {
        if (!checkUniSatInstalled()) {
            setError('请先安装 UniSat 钱包');
            window.open('https://unisat.io/download', '_blank');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const unisat = getUniSat()!;

            // 请求账户
            const accounts = await unisat.requestAccounts();

            // 获取网络
            const network = await unisat.getNetwork();

            // 获取余额
            const balance = await unisat.getBalance();

            // 获取公钥（可选）
            let publicKey = '';
            try {
                publicKey = await unisat.getPublicKey();
            } catch {
                // 某些情况下可能无法获取公钥
            }

            setState({
                address: accounts[0],
                publicKey,
                balance,
                network,
                isConnected: true,
            });

            return true;
        } catch (err: any) {
            setError(err.message || '连接钱包失败');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [checkUniSatInstalled, getUniSat]);

    // 断开连接
    const disconnect = useCallback(() => {
        setState({
            address: null,
            publicKey: null,
            balance: { confirmed: 0, unconfirmed: 0, total: 0 },
            network: '',
            isConnected: false,
        });
        setError(null);
    }, []);

    // 切换到 FB 网络
    const switchToFractal = useCallback(async () => {
        const unisat = getUniSat();
        if (!unisat) return false;

        try {
            const targetNetwork = CURRENT_NETWORK.unisatNetwork;
            await unisat.switchNetwork(targetNetwork);

            // 更新状态
            const network = await unisat.getNetwork();
            setState((prev) => ({ ...prev, network }));

            return true;
        } catch (err: any) {
            setError('切换到 Fractal Bitcoin 失败: ' + err.message);
            return false;
        }
    }, [getUniSat]);

    // 刷新余额
    const refreshBalance = useCallback(async () => {
        const unisat = getUniSat();
        if (!unisat || !state.isConnected) return;

        try {
            const balance = await unisat.getBalance();
            setState((prev) => ({ ...prev, balance }));
        } catch (err) {
            console.error('刷新余额失败:', err);
        }
    }, [getUniSat, state.isConnected]);

    // 监听账户和网络变化
    useEffect(() => {
        const unisat = getUniSat();
        if (!unisat || !state.isConnected) return;

        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                disconnect();
            } else {
                setState((prev) => ({ ...prev, address: accounts[0] }));
                refreshBalance();
            }
        };

        const handleNetworkChanged = (network: string) => {
            setState((prev) => ({ ...prev, network }));
        };

        unisat.on('accountsChanged', handleAccountsChanged);
        unisat.on('networkChanged', handleNetworkChanged);

        return () => {
            unisat.removeListener('accountsChanged', handleAccountsChanged);
            unisat.removeListener('networkChanged', handleNetworkChanged);
        };
    }, [getUniSat, state.isConnected, disconnect, refreshBalance]);

    return {
        ...state,
        isLoading,
        error,
        connect,
        disconnect,
        switchToFractal,
        refreshBalance,
        checkUniSatInstalled,
    };
};

export default useUniSatWallet;
