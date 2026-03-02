import React, { useState, useEffect } from 'react';
import type { NFTHero } from '../../../types/slg/nft-hero.types';
import { useNFTHeroStaking } from '../../../web3/hooks/useNFTHeroStaking';
import { useUniSatWallet } from '../../../web3/hooks/useUniSatWallet';
import { useNFTHero } from '../../../web3/hooks/useNFTHero';
import { NFTHeroCard } from './NFTHeroCard';
import { stakingService } from '../../../systems/StakingService';
import './StakingPanel.css';

interface StakingPanelProps {
    onClose?: () => void;
}

export const StakingPanel: React.FC<StakingPanelProps> = ({ onClose }) => {
    const { address, isConnected } = useUniSatWallet();
    const wallet = (window as any).unisat;
    
    const {
        positions,
        pool,
        stats,
        fetchMyStakes,
        stake,
        initiateUnstake,
        completeUnstake,
        claimRewards,
    } = useNFTHeroStaking();

    const { heroes: nftHeroes, fetchHeroes } = useNFTHero(wallet, address);

    const [activeTab, setActiveTab] = useState<'stake' | 'my-stakes'>('my-stakes');
    const [selectedHero, setSelectedHero] = useState<NFTHero | null>(null);
    const [selectedDuration, setSelectedDuration] = useState(30);
    const [isStaking, setIsStaking] = useState(false);

    useEffect(() => {
        if (address) {
            fetchMyStakes(address);
            fetchHeroes(address);
        }
    }, [address]);

    const availableHeroes = nftHeroes.filter(
        nft => !positions.some(p => p.hero.nftId === nft.nftId && p.status === 'active')
    );

    const durationOptions = stakingService.getDurationOptions();

    const handleStake = async () => {
        if (!selectedHero || !address) return;

        setIsStaking(true);
        const duration = selectedDuration * 24 * 60 * 60 * 1000;
        const result = await stake(selectedHero, address, duration);

        if (result.success) {
            alert('质押成功！');
            setSelectedHero(null);
            setActiveTab('my-stakes');
        } else {
            alert(`质押失败: ${result.error}`);
        }
        setIsStaking(false);
    };

    const handleUnstake = async (positionId: string) => {
        if (!address) return;

        const position = positions.find(p => p.id === positionId);
        if (!position) return;

        if (position.status === 'active' && Date.now() < position.unlockAt) {
            const result = await initiateUnstake(positionId, address);
            if (result.success) {
                alert('已申请解除质押，请等待锁定期结束后完成解除');
                fetchMyStakes(address);
            } else {
                alert(`申请失败: ${result.error}`);
            }
        } else if (position.status === 'unstaking') {
            const result = await completeUnstake(positionId, address);
            if (result.success) {
                alert('解除质押成功！');
                fetchMyStakes(address);
            } else {
                alert(`解除失败: ${result.error}`);
            }
        }
    };

    const handleClaim = async (positionId: string) => {
        if (!address) return;

        const result = await claimRewards(positionId, address);
        if (result.success) {
            alert(`领取成功！获得 ${result.amount} FRIEND`);
            fetchMyStakes(address);
        } else {
            alert(`领取失败: ${result.error}`);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="status-badge active">质押中</span>;
            case 'unstaking':
                return <span className="status-badge unstaking">解除中</span>;
            case 'claimed':
                return <span className="status-badge claimed">已解除</span>;
            default:
                return null;
        }
    };

    const getTimeRemaining = (unlockAt: number): string => {
        const remaining = unlockAt - Date.now();
        if (remaining <= 0) return '可解除';

        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

        return `${days}天 ${hours}小时`;
    };

    return (
        <div className="staking-overlay" onClick={onClose}>
            <div className="staking-panel" onClick={e => e.stopPropagation()}>
                <div className="panel-header">
                    <h2>英雄质押</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="pool-info">
                    <div className="pool-stat">
                        <span className="stat-value">{pool?.totalStaked || 0}</span>
                        <span className="stat-label">总质押数</span>
                    </div>
                    <div className="pool-stat">
                        <span className="stat-value">{(pool?.apr || 0) * 100}%</span>
                        <span className="stat-label">基础APY</span>
                    </div>
                    <div className="pool-stat">
                        <span className="stat-value">{stats?.totalPositions || 0}</span>
                        <span className="stat-label">我的质押</span>
                    </div>
                </div>

                <div className="staking-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'my-stakes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('my-stakes')}
                    >
                        我的质押
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'stake' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stake')}
                    >
                        质押英雄
                    </button>
                </div>

                {activeTab === 'my-stakes' && (
                    <div className="stakes-list">
                        {positions.length === 0 ? (
                            <div className="empty-state">
                                <p>暂无质押</p>
                            </div>
                        ) : (
                            positions.map(position => (
                                <div key={position.id} className="stake-item">
                                    <NFTHeroCard hero={position.hero} />
                                    <div className="stake-details">
                                        <div className="stake-status">
                                            {getStatusBadge(position.status)}
                                        </div>
                                        <div className="stake-info">
                                            <span>APY: {(position.rewards.apr * 100).toFixed(1)}%</span>
                                            <span>已解锁: {getTimeRemaining(position.unlockAt)}</span>
                                        </div>
                                        <div className="stake-actions">
                                            {position.status === 'active' && (
                                                <button
                                                    className="action-btn claim"
                                                    onClick={() => handleClaim(position.id)}
                                                >
                                                    领取奖励
                                                </button>
                                            )}
                                            {position.status === 'active' && Date.now() >= position.unlockAt && (
                                                <button
                                                    className="action-btn unstake"
                                                    onClick={() => handleUnstake(position.id)}
                                                >
                                                    解除质押
                                                </button>
                                            )}
                                            {position.status === 'unstaking' && (
                                                <button
                                                    className="action-btn complete"
                                                    onClick={() => handleUnstake(position.id)}
                                                >
                                                    完成解除
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'stake' && (
                    <div className="stake-form">
                        {!isConnected ? (
                            <div className="connect-prompt">
                                <p>请先连接钱包</p>
                            </div>
                        ) : (
                            <>
                                <h3>选择要质押的英雄</h3>
                                {availableHeroes.length === 0 ? (
                                    <div className="empty-state">
                                        <p>暂无可质押的英雄</p>
                                        <p className="hint">请先铸造或购买NFT英雄</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="hero-select-grid">
                                            {availableHeroes.map(hero => (
                                                <div
                                                    key={hero.id}
                                                    className={`hero-select-item ${selectedHero?.id === hero.id ? 'selected' : ''}`}
                                                    onClick={() => setSelectedHero(hero)}
                                                >
                                                    <div className="hero-name">{hero.metadata.name}</div>
                                                    <div className="hero-quality">{hero.heroData.quality}</div>
                                                    <div className="hero-stars">{'★'.repeat(hero.heroData.stars)}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {selectedHero && (
                                            <div className="duration-section">
                                                <h4>选择质押时长</h4>
                                                <div className="duration-options">
                                                    {durationOptions.map(opt => (
                                                        <button
                                                            key={opt.days}
                                                            className={`duration-btn ${selectedDuration === opt.days ? 'active' : ''}`}
                                                            onClick={() => setSelectedDuration(opt.days)}
                                                        >
                                                            {opt.label}
                                                            <span className="bonus">+{opt.bonus * 100}%</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedHero && (
                                            <button
                                                className="stake-btn"
                                                onClick={handleStake}
                                                disabled={isStaking}
                                            >
                                                {isStaking ? '质押中...' : `质押 ${selectedHero.metadata.name}`}
                                            </button>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StakingPanel;
