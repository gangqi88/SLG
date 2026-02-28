import { useState, useCallback, useEffect } from 'react';
import { GameManager } from '../../game/GameManager';

export interface Web3GameState {
    isWeb3Enabled: boolean;
    lastChainSaveTime?: number;
    inscriptionId?: string;
    network: 'fractal_mainnet' | 'fractal_testnet';
}

export const useWeb3Game = (gameManager: GameManager) => {
    const [web3State, setWeb3State] = useState<Web3GameState>(() =>
        gameManager.getWeb3State()
    );

    // 刷新 Web3 状态
    const refreshWeb3State = useCallback(() => {
        const state = gameManager.getWeb3State();
        setWeb3State(state);
    }, [gameManager]);

    // 启用 Web3
    const enableWeb3 = useCallback(() => {
        gameManager.enableWeb3();
        refreshWeb3State();
    }, [gameManager, refreshWeb3State]);

    // 禁用 Web3
    const disableWeb3 = useCallback(() => {
        gameManager.disableWeb3();
        refreshWeb3State();
    }, [gameManager, refreshWeb3State]);

    // 设置铭文 ID
    const setInscriptionId = useCallback(
        (id: string) => {
            gameManager.setInscriptionId(id);
            refreshWeb3State();
        },
        [gameManager, refreshWeb3State]
    );

    // 获取用于铭刻的数据
    const getInscriptionData = useCallback(() => {
        return gameManager.getInscriptionData();
    }, [gameManager]);

    // 监听游戏状态变化（可选）
    useEffect(() => {
        const interval = setInterval(() => {
            refreshWeb3State();
        }, 5000); // 每 5 秒刷新一次

        return () => clearInterval(interval);
    }, [refreshWeb3State]);

    return {
        web3State,
        refreshWeb3State,
        enableWeb3,
        disableWeb3,
        setInscriptionId,
        getInscriptionData,
        isWeb3Enabled: web3State.isWeb3Enabled,
    };
};

export default useWeb3Game;
