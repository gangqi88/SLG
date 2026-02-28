import React from 'react';
import { useUniSatBRC20 } from '../hooks/useUniSatBRC20';

interface UniSatBRC20ListProps {
    address: string | null;
}

export const UniSatBRC20List: React.FC<UniSatBRC20ListProps> = ({ address }) => {
    const { tokens, isLoading, error, fetchBRC20Balance } = useUniSatBRC20(address);

    if (!address) {
        return (
            <div
                style={{
                    padding: '16px',
                    color: '#aaa',
                    textAlign: 'center',
                }}
            >
                请先连接钱包
            </div>
        );
    }

    if (isLoading) {
        return (
            <div
                style={{
                    padding: '16px',
                    color: '#aaa',
                    textAlign: 'center',
                }}
            >
                加载中...
            </div>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    padding: '16px',
                    color: '#F44336',
                    textAlign: 'center',
                }}
            >
                <p>加载失败: {error}</p>
                <button
                    onClick={fetchBRC20Balance}
                    style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        backgroundColor: '#00b4d8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    重试
                </button>
            </div>
        );
    }

    if (tokens.length === 0) {
        return (
            <div
                style={{
                    padding: '16px',
                    color: '#aaa',
                    textAlign: 'center',
                }}
            >
                <p>暂无 BRC-20 代币</p>
                <small style={{ fontSize: '12px' }}>
                    您可以在 UniSat 市场购买代币
                </small>
            </div>
        );
    }

    return (
        <div style={{ padding: '16px' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                }}
            >
                <h3
                    style={{
                        margin: 0,
                        fontSize: '16px',
                        color: '#00b4d8',
                    }}
                >
                    我的 BRC-20 代币
                </h3>
                <button
                    onClick={fetchBRC20Balance}
                    style={{
                        padding: '4px 12px',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        color: '#00b4d8',
                        border: '1px solid #00b4d8',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    刷新
                </button>
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                }}
            >
                {tokens.map((token) => (
                    <div
                        key={token.ticker}
                        style={{
                            padding: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '6px',
                            border: '1px solid #444',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '8px',
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    color: '#00b4d8',
                                }}
                            >
                                {token.ticker}
                            </span>
                            <span
                                style={{
                                    fontSize: '11px',
                                    color: '#aaa',
                                }}
                            >
                                {token.decimals} 位小数
                            </span>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '13px',
                                }}
                            >
                                <span style={{ color: '#aaa' }}>总余额:</span>
                                <strong style={{ color: '#fff' }}>
                                    {parseFloat(token.overallBalance).toLocaleString()}
                                </strong>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '12px',
                                }}
                            >
                                <span style={{ color: '#888' }}>可用:</span>
                                <span style={{ color: '#ccc' }}>
                                    {parseFloat(token.availableBalance).toLocaleString()}
                                </span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '12px',
                                }}
                            >
                                <span style={{ color: '#888' }}>可转账:</span>
                                <span style={{ color: '#ccc' }}>
                                    {parseFloat(token.transferableBalance).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UniSatBRC20List;
