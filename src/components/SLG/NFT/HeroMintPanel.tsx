import React, { useState, useCallback } from 'react';
import type { Hero } from '../../../types/slg/hero.types';
import { useHeroMint, GameMintCosts } from '../../../web3/hooks/useHeroMint';
import { useUniSatWallet } from '../../../web3/hooks/useUniSatWallet';
import { NFT_HERO_CONSTANTS } from '../../../types/slg/nft-hero.types';
import type { UniSatWallet } from '../../../web3/types/unisat.d';
import './HeroMintPanel.css';

interface HeroMintPanelProps {
    heroes: Hero[];
    playerResources: GameMintCosts;
    onMintSuccess?: (hero: Hero, inscriptionId: string) => void;
    onClose?: () => void;
}

export const HeroMintPanel: React.FC<HeroMintPanelProps> = ({
    heroes,
    playerResources,
    onMintSuccess,
    onClose,
}) => {
    const { address, isConnected } = useUniSatWallet();
    const { isMinting, error, mintHero, calculateCosts, canAfford } = useHeroMint();
    const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
    const [mintType, setMintType] = useState<'inscription' | 'game_mint'>('inscription');

    const handleMint = useCallback(async () => {
        if (!selectedHero || !address) return;

        const wallet = (window as Window & { unisat?: UniSatWallet }).unisat;
        if (!wallet) {
            alert('请先安装 UniSat 钱包');
            return;
        }

        const result = await mintHero(selectedHero, wallet, address);

        if (result.success && result.inscriptionId) {
            alert(`铸造成功！铭文ID: ${result.inscriptionId}`);
            if (onMintSuccess) {
                onMintSuccess(selectedHero, result.inscriptionId);
            }
        } else {
            alert(`铸造失败: ${result.error}`);
        }
    }, [selectedHero, address, mintHero, onMintSuccess]);

    const costs = selectedHero ? calculateCosts(selectedHero) : null;
    const affordable = costs ? canAfford(costs, playerResources) : false;

    return (
        <div className="hero-mint-panel">
            <div className="mint-panel-header">
                <h2>铸造 NFT 英雄</h2>
                {onClose && (
                    <button className="close-btn" onClick={onClose}>×</button>
                )}
            </div>

            {!isConnected ? (
                <div className="mint-connect-wallet">
                    <p>请先连接 UniSat 钱包</p>
                </div>
            ) : (
                <>
                    <div className="mint-type-selector">
                        <button
                            className={`mint-type-btn ${mintType === 'inscription' ? 'active' : ''}`}
                            onClick={() => setMintType('inscription')}
                        >
                            铭文铸造
                            <span className="mint-type-desc">使用 BTC 链上铸造</span>
                        </button>
                        <button
                            className={`mint-type-btn ${mintType === 'game_mint' ? 'active' : ''}`}
                            onClick={() => setMintType('game_mint')}
                        >
                            游戏内铸造
                            <span className="mint-type-desc">消耗游戏资源</span>
                        </button>
                    </div>

                    <div className="mint-hero-list">
                        <h3>选择英雄</h3>
                        <div className="hero-select-grid">
                            {heroes.filter(h => !h.isNFT).map((hero) => (
                                <div
                                    key={hero.id}
                                    className={`mint-hero-item ${selectedHero?.id === hero.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedHero(hero)}
                                >
                                    <div className="mint-hero-avatar">
                                        {hero.icon || '🧙'}
                                    </div>
                                    <div className="mint-hero-info">
                                        <span className="mint-hero-name">{hero.name}</span>
                                        <span className="mint-hero-quality">{hero.quality}</span>
                                        <span className="mint-hero-stars">{'★'.repeat(hero.stars)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedHero && costs && (
                        <div className="mint-cost-preview">
                            <h3>铸造费用</h3>
                            {mintType === 'inscription' ? (
                                <div className="cost-item">
                                    <span className="cost-label">预估 BTC 费用</span>
                                    <span className="cost-value">~{NFT_HERO_CONSTANTS.MINT_COSTS.inscription.baseFee / 10000} BTC</span>
                                </div>
                            ) : (
                                <>
                                    <div className="cost-item">
                                        <span className="cost-label">金币</span>
                                        <span className={`cost-value ${playerResources.gold < costs.gold ? 'insufficient' : ''}`}>
                                            {costs.gold.toLocaleString()} / {playerResources.gold.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="cost-item">
                                        <span className="cost-label">英雄之魂</span>
                                        <span className={`cost-value ${playerResources.heroSoul < costs.heroSoul ? 'insufficient' : ''}`}>
                                            {costs.heroSoul.toLocaleString()} / {playerResources.heroSoul.toLocaleString()}
                                        </span>
                                    </div>
                                    {costs.factionCore && (
                                        <div className="cost-item">
                                            <span className="cost-label">阵营核心</span>
                                            <span className={`cost-value ${(playerResources.factionCore || 0) < costs.factionCore ? 'insufficient' : ''}`}>
                                                {costs.factionCore} / {playerResources.factionCore || 0}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="mint-error">
                            {error}
                        </div>
                    )}

                    <div className="mint-actions">
                        <button
                            className="mint-confirm-btn"
                            disabled={!selectedHero || isMinting || (mintType === 'game_mint' && !affordable)}
                            onClick={handleMint}
                        >
                            {isMinting ? '铸造中...' : '确认铸造'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default HeroMintPanel;
