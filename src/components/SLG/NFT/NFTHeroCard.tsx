import React from 'react';
import type { NFTHero } from '../../../types/slg/nft-hero.types';
import { NFT_HERO_CONSTANTS } from '../../../types/slg/nft-hero.types';

interface NFTHeroCardProps {
    hero: NFTHero;
    onClick?: (hero: NFTHero) => void;
    selected?: boolean;
    showActions?: boolean;
    onMint?: (hero: NFTHero) => void;
    onTransfer?: (hero: NFTHero) => void;
}

const factionIcons: Record<string, string> = {
    human: '👥',
    angel: '👼',
    demon: '😈',
};

const qualityColors: Record<string, string> = {
    purple: '#9b59b6',
    orange: '#e67e22',
    red: '#e74c3c',
};

export const NFTHeroCard: React.FC<NFTHeroCardProps> = ({
    hero,
    onClick,
    selected = false,
    showActions = false,
    onMint,
    onTransfer,
}) => {
    const rarityColor = NFT_HERO_CONSTANTS.RARITY_COLORS[hero.rarity] || '#9ca3af';
    const factionIcon = factionIcons[hero.heroData.faction] || '❓';
    const qualityColor = qualityColors[hero.heroData.quality] || '#9ca3af';

    const handleClick = () => {
        if (onClick) {
            onClick(hero);
        }
    };

    return (
        <div
            className={`nft-hero-card ${selected ? 'selected' : ''}`}
            onClick={handleClick}
            style={{
                borderColor: rarityColor,
            }}
        >
            <div className="nft-hero-header">
                <div className="nft-hero-avatar">
                    <span className="faction-icon">{factionIcon}</span>
                    <span className="nft-badge">NFT</span>
                </div>
                <div className="nft-hero-info">
                    <h3 className="nft-hero-name">{hero.metadata.name}</h3>
                    <div className="nft-hero-meta">
                        <span
                            className="nft-hero-quality"
                            style={{ color: qualityColor }}
                        >
                            {hero.heroData.quality.toUpperCase()}
                        </span>
                        <span className="nft-hero-stars">
                            {'★'.repeat(hero.heroData.stars)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="nft-hero-stats">
                <div className="stat-row">
                    <span className="stat-label">Level</span>
                    <span className="stat-value">{hero.heroData.level}</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Rarity</span>
                    <span
                        className="stat-value"
                        style={{ color: rarityColor }}
                    >
                        {hero.rarity.toUpperCase()}
                    </span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Power</span>
                    <span className="stat-value">{hero.power}</span>
                </div>
            </div>

            <div className="nft-hero-attributes">
                <div className="attribute">
                    <span className="attr-label">Command</span>
                    <span className="attr-value">{hero.heroData.attributes.command}</span>
                </div>
                <div className="attribute">
                    <span className="attr-label">Strength</span>
                    <span className="attr-value">{hero.heroData.attributes.strength}</span>
                </div>
                <div className="attribute">
                    <span className="attr-label">Strategy</span>
                    <span className="attr-value">{hero.heroData.attributes.strategy}</span>
                </div>
                <div className="attribute">
                    <span className="attr-label">Defense</span>
                    <span className="attr-value">{hero.heroData.attributes.defense}</span>
                </div>
            </div>

            {hero.chainData && (
                <div className="nft-chain-info">
                    <span className="inscription-id">
                        #{hero.chainData.inscriptionNumber}
                    </span>
                </div>
            )}

            {showActions && (
                <div className="nft-hero-actions">
                    {onMint && (
                        <button
                            className="action-btn mint"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMint(hero);
                            }}
                        >
                            Mint
                        </button>
                    )}
                    {onTransfer && (
                        <button
                            className="action-btn transfer"
                            onClick={(e) => {
                                e.stopPropagation();
                                onTransfer(hero);
                            }}
                        >
                            Transfer
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default NFTHeroCard;
