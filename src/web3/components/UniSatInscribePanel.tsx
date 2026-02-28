import React, { useState } from 'react';
import type { InscribeGameStateParams } from '../hooks/useUniSatInscribe';
import { useUniSatInscribe } from '../hooks/useUniSatInscribe';
import { useUniSatWallet } from '../hooks/useUniSatWallet';
import { CURRENT_NETWORK } from '../config/network';

export interface UniSatInscribePanelProps {
    gameState: InscribeGameStateParams;
}

export const UniSatInscribePanel: React.FC<UniSatInscribePanelProps> = ({
    gameState,
}) => {
    const { isConnected } = useUniSatWallet();
    const unisat = typeof window !== 'undefined' ? window.unisat || null : null;
    const { isInscribing, result, inscribeGameState } = useUniSatInscribe(unisat);
    const [savedInscriptions, setSavedInscriptions] = useState<string[]>([]);

    const handleInscribe = async () => {
        const result = await inscribeGameState(gameState);
        if (result.inscriptionId) {
            setSavedInscriptions((prev) => [result.inscriptionId!, ...prev]);
        }
    };

    if (!isConnected) {
        return (
            <div
                style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#aaa',
                }}
            >
                <p>请先连接 UniSat 钱包</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '16px' }}>
            <h3
                style={{
                    margin: '0 0 12px 0',
                    fontSize: '16px',
                    color: '#00b4d8',
                }}
            >
                链上存档
            </h3>
            <p
                style={{
                    fontSize: '13px',
                    color: '#aaa',
                    marginBottom: '16px',
                }}
            >
                使用 UniSat 铭刻功能保存游戏状态到 FB
            </p>

            <div
                style={{
                    padding: '12px',
                    backgroundColor: 'rgba(0, 180, 216, 0.1)',
                    borderRadius: '6px',
                    marginBottom: '16px',
                }}
            >
                <h4
                    style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        color: '#90e0ef',
                    }}
                >
                    当前游戏状态:
                </h4>
                <ul
                    style={{
                        margin: 0,
                        paddingLeft: '20px',
                        fontSize: '13px',
                        color: '#ccc',
                    }}
                >
                    <li>生存天数: {gameState.daysSurvived}</li>
                    <li>幸存者: {gameState.totalSurvivors}</li>
                    <li>建筑: {gameState.buildingsCount}</li>
                </ul>
            </div>

            <button
                onClick={handleInscribe}
                disabled={isInscribing}
                style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: isInscribing ? '#666' : '#00b4d8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: isInscribing ? 'not-allowed' : 'pointer',
                    opacity: isInscribing ? 0.7 : 1,
                    marginBottom: '16px',
                }}
            >
                {isInscribing ? '铭刻中...' : '铭刻到链上'}
            </button>

            {result?.error && (
                <div
                    style={{
                        padding: '12px',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        borderRadius: '6px',
                        color: '#F44336',
                        fontSize: '13px',
                        marginBottom: '16px',
                    }}
                >
                    ❌ {result.error}
                </div>
            )}

            {result?.inscriptionId && (
                <div
                    style={{
                        padding: '12px',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderRadius: '6px',
                        marginBottom: '16px',
                    }}
                >
                    <div style={{ color: '#4CAF50', marginBottom: '8px' }}>
                        ✅ 铭刻成功！
                    </div>
                    <div
                        style={{
                            fontSize: '12px',
                            color: '#ccc',
                            marginBottom: '8px',
                        }}
                    >
                        <p style={{ margin: '4px 0' }}>
                            铭文 ID: {result.inscriptionId}
                        </p>
                        <p style={{ margin: '4px 0' }}>交易 ID: {result.txid}</p>
                    </div>
                    <a
                        href={`${CURRENT_NETWORK.explorer}/inscription/${result.inscriptionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: '#00b4d8',
                            fontSize: '12px',
                            textDecoration: 'none',
                        }}
                    >
                        查看铭文 →
                    </a>
                </div>
            )}

            {savedInscriptions.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                    <h4
                        style={{
                            margin: '0 0 8px 0',
                            fontSize: '14px',
                            color: '#90e0ef',
                        }}
                    >
                        历史存档
                    </h4>
                    <ul
                        style={{
                            margin: 0,
                            padding: 0,
                            listStyle: 'none',
                        }}
                    >
                        {savedInscriptions.map((id, index) => (
                            <li
                                key={id}
                                style={{
                                    padding: '8px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '4px',
                                    marginBottom: '4px',
                                    fontSize: '12px',
                                }}
                            >
                                <a
                                    href={`${CURRENT_NETWORK.explorer}/inscription/${id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: '#00b4d8',
                                        textDecoration: 'none',
                                    }}
                                >
                                    存档 #{index + 1}: {id.slice(0, 20)}...
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div
                style={{
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#888',
                }}
            >
                <h4
                    style={{
                        margin: '0 0 8px 0',
                        fontSize: '13px',
                        color: '#aaa',
                    }}
                >
                    关于 UniSat 铭刻
                </h4>
                <ul
                    style={{
                        margin: 0,
                        paddingLeft: '16px',
                    }}
                >
                    <li>游戏数据将被永久铭刻在 FB 区块链上</li>
                    <li>需要支付 FB 作为 Gas 费用</li>
                    <li>铭刻完成后可在 UniSat 市场查看</li>
                </ul>
            </div>
        </div>
    );
};

export default UniSatInscribePanel;
