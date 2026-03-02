import React, { useState, useCallback } from 'react';
import type { FactionType, HeroQuality } from '../../../types/slg/hero.types';
import type { NFTHero, NFTHeroListing } from '../../../types/slg/nft-hero.types';
import { NFTHeroCard } from './NFTHeroCard';
import './NFTMarketplace.css';

interface NFTMarketplaceProps {
    _listings?: NFTHeroListing[];
    heroes: NFTHero[];
    isLoading?: boolean;
    _onPurchase?: (listing: NFTHeroListing) => void;
    onViewDetails?: (hero: NFTHero) => void;
    onClose?: () => void;
}

export const NFTMarketplace: React.FC<NFTMarketplaceProps> = ({
    heroes,
    isLoading = false,
    onViewDetails,
    onClose,
}) => {
    const [filterFaction, setFilterFaction] = useState<FactionType | 'all'>('all');
    const [filterQuality, setFilterQuality] = useState<HeroQuality | 'all'>('all');
    const [filterStars, setFilterStars] = useState<number | 'all'>('all');
    const [sortBy, setSortBy] = useState<'price' | 'rarity' | 'power'>('rarity');
    const [selectedHero, setSelectedHero] = useState<NFTHero | null>(null);

    const filteredHeroes = heroes.filter((hero) => {
        if (filterFaction !== 'all' && hero.heroData.faction !== filterFaction) return false;
        if (filterQuality !== 'all' && hero.heroData.quality !== filterQuality) return false;
        if (filterStars !== 'all' && hero.heroData.stars !== filterStars) return false;
        return true;
    });

    const sortedHeroes = [...filteredHeroes].sort((a, b) => {
        switch (sortBy) {
            case 'rarity':
                return b.heroData.rarity - a.heroData.rarity;
            case 'power':
                return b.power - a.power;
            case 'price':
                return 0;
            default:
                return 0;
        }
    });

    const handleHeroClick = useCallback((hero: NFTHero) => {
        setSelectedHero(hero);
        if (onViewDetails) {
            onViewDetails(hero);
        }
    }, [onViewDetails]);

    return (
        <div className="nft-marketplace">
            <div className="marketplace-header">
                <h2>NFT 英雄市场</h2>
                {onClose && (
                    <button className="close-btn" onClick={onClose}>×</button>
                )}
            </div>

            <div className="marketplace-filters">
                <div className="filter-group">
                    <label>阵营</label>
                    <select
                        value={filterFaction}
                        onChange={(e) => setFilterFaction(e.target.value as FactionType | 'all')}
                    >
                        <option value="all">全部</option>
                        <option value="human">人族</option>
                        <option value="angel">天使</option>
                        <option value="demon">恶魔</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>品质</label>
                    <select
                        value={filterQuality}
                        onChange={(e) => setFilterQuality(e.target.value as HeroQuality | 'all')}
                    >
                        <option value="all">全部</option>
                        <option value="purple">紫将</option>
                        <option value="orange">橙将</option>
                        <option value="red">红将</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>星级</label>
                    <select
                        value={filterStars}
                        onChange={(e) => setFilterStars(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    >
                        <option value="all">全部</option>
                        <option value="1">1星</option>
                        <option value="2">2星</option>
                        <option value="3">3星</option>
                        <option value="4">4星</option>
                        <option value="5">5星</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>排序</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'price' | 'rarity' | 'power')}
                    >
                        <option value="rarity">稀有度</option>
                        <option value="power">战斗力</option>
                        <option value="price">价格</option>
                    </select>
                </div>
            </div>

            <div className="marketplace-stats">
                <span>共 {sortedHeroes.length} 个 NFT 英雄</span>
            </div>

            {isLoading ? (
                <div className="marketplace-loading">
                    <p>加载中...</p>
                </div>
            ) : sortedHeroes.length === 0 ? (
                <div className="marketplace-empty">
                    <p>暂无 NFT 英雄</p>
                    <p className="empty-hint">请先连接钱包获取你的 NFT 英雄</p>
                </div>
            ) : (
                <div className="marketplace-grid">
                    {sortedHeroes.map((hero) => (
                        <NFTHeroCard
                            key={hero.id}
                            hero={hero}
                            onClick={handleHeroClick}
                            selected={selectedHero?.id === hero.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default NFTMarketplace;
