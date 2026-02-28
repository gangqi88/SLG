import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UniSatNetwork } from '../config/network';
import { CURRENT_NETWORK } from '../config/network';

interface UniSatContextType {
    network: UniSatNetwork;
    isReady: boolean;
    isUniSatInstalled: boolean;
}

const UniSatContext = createContext<UniSatContextType | null>(null);

export const UniSatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const [isUniSatInstalled, setIsUniSatInstalled] = useState(false);

    useEffect(() => {
        // 检查 UniSat 钱包是否安装
        const checkUniSat = () => {
            const installed = typeof window !== 'undefined' && typeof window.unisat !== 'undefined';
            setIsUniSatInstalled(installed);
            setIsReady(true);
        };

        // 立即检查
        checkUniSat();

        // 监听 UniSat 注入（某些情况下钱包加载较慢）
        const handleLoad = () => {
            checkUniSat();
        };

        window.addEventListener('load', handleLoad);

        // 定期检查（处理延迟注入）
        const interval = setInterval(() => {
            if (!isUniSatInstalled) {
                checkUniSat();
            }
        }, 1000);

        // 5秒后停止检查
        setTimeout(() => {
            clearInterval(interval);
        }, 5000);

        return () => {
            window.removeEventListener('load', handleLoad);
            clearInterval(interval);
        };
    }, [isUniSatInstalled]);

    return (
        <UniSatContext.Provider
            value={{
                network: CURRENT_NETWORK,
                isReady,
                isUniSatInstalled,
            }}
        >
            {children}
        </UniSatContext.Provider>
    );
};

export const useUniSatContext = () => {
    const context = useContext(UniSatContext);
    if (!context) {
        throw new Error('useUniSatContext 必须在 UniSatProvider 内使用');
    }
    return context;
};

export default UniSatProvider;
