import React from 'react';
import { useUniSatWallet } from '../hooks/useUniSatWallet';

export const UniSatConnectButton: React.FC = () => {
    const {
        isConnected,
        address,
        balance,
        network,
        isLoading,
        error,
        connect,
        disconnect,
        switchToFractal,
        checkUniSatInstalled,
    } = useUniSatWallet();

    const formatBalance = (sats: number) => {
        return (sats / 100000000).toFixed(8);
    };

    const truncateAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // 检查是否连接到正确的网络
    const isCorrectNetwork =
        network === 'fractal_mainnet' || network === 'fractal_testnet';

    if (isConnected && address) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 16px',
                    backgroundColor: 'rgba(0, 180, 216, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid #00b4d8',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', color: '#90e0ef' }}>
                        {truncateAddress(address)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#fff' }}>
                        {formatBalance(balance.total)} FB
                    </span>
                    {network && (
                        <span
                            style={{
                                fontSize: '10px',
                                color: isCorrectNetwork ? '#4CAF50' : '#FF9800',
                            }}
                        >
                            {network}
                        </span>
                    )}
                </div>

                {!isCorrectNetwork && (
                    <button
                        onClick={switchToFractal}
                        style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: '#FF9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        切换网络
                    </button>
                )}

                <button
                    onClick={disconnect}
                    style={{
                        padding: '4px 12px',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        color: '#F44336',
                        border: '1px solid #F44336',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    断开
                </button>
            </div>
        );
    }

    if (!checkUniSatInstalled()) {
        return (
            <a
                href="https://unisat.io/download"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    padding: '8px 16px',
                    backgroundColor: '#00b4d8',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                }}
            >
                安装 UniSat
            </a>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
                onClick={connect}
                disabled={isLoading}
                style={{
                    padding: '10px 20px',
                    backgroundColor: isLoading ? '#666' : '#00b4d8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                }}
            >
                {isLoading ? '连接中...' : '连接 UniSat'}
            </button>

            {error && (
                <div
                    style={{
                        color: '#F44336',
                        fontSize: '12px',
                        padding: '8px',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        borderRadius: '4px',
                    }}
                >
                    ❌ {error}
                </div>
            )}
        </div>
    );
};

export default UniSatConnectButton;
