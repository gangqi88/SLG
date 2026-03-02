import React, { useState } from 'react';
import type { MarketListing } from '../../../../types/slg/market.types';
import { PAYMENT_TOKEN_INFO } from '../../../../types/slg/market.types';
import { NFTHeroCard } from '../NFTHeroCard';
import './MarketList.css';

interface MarketListProps {
    listings: MarketListing[];
    isLoading?: boolean;
    onPurchase?: (listing: MarketListing) => void;
    onViewDetails?: (listing: MarketListing) => void;
}

export const MarketList: React.FC<MarketListProps> = ({
    listings,
    isLoading = false,
    onPurchase,
    onViewDetails,
}) => {
    const [selectedListing, setSelectedListing] = useState<MarketListing | null>(null);

    const handlePurchase = (listing: MarketListing) => {
        if (onPurchase) {
            onPurchase(listing);
        }
    };

    const handleCardClick = (_hero: any) => {
        if (selectedListing && onViewDetails) {
            onViewDetails(selectedListing);
        }
    };

    const getTimeRemaining = (expiresAt: number): string => {
        const remaining = expiresAt - Date.now();
        if (remaining <= 0) return '已过期';

        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

        if (days > 0) return `${days}天 ${hours}小时`;
        return `${hours}小时`;
    };

    if (isLoading) {
        return (
            <div className="market-list-loading">
                <p>加载中...</p>
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <div className="market-list-empty">
                <p>暂无上架的英雄NFT</p>
            </div>
        );
    }

    return (
        <div className="market-list">
            {listings.map((listing) => (
                <div
                    key={listing.id}
                    className={`market-list-item ${selectedListing?.id === listing.id ? 'selected' : ''}`}
                    onClick={() => setSelectedListing(listing)}
                >
                    <NFTHeroCard
                        hero={listing.hero}
                        onClick={handleCardClick}
                        selected={selectedListing?.id === listing.id}
                    />

                    <div className="listing-info">
                        <div className="listing-price">
                            <span className="price-label">价格</span>
                            <span className="price-value">
                                {PAYMENT_TOKEN_INFO[listing.paymentToken].icon} {listing.price.toLocaleString()}
                            </span>
                            <span className="price-token">{listing.paymentToken}</span>
                        </div>

                        <div className="listing-time">
                            <span className="time-label">剩余时间</span>
                            <span className="time-value">{getTimeRemaining(listing.expiresAt)}</span>
                        </div>

                        <button
                            className="purchase-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePurchase(listing);
                            }}
                        >
                            购买
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MarketList;
