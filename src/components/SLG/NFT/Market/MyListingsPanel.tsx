import React from 'react';
import type { MarketListing } from '../../../../types/slg/market.types';
import { PAYMENT_TOKEN_INFO } from '../../../../types/slg/market.types';
import { NFTHeroCard } from '../NFTHeroCard';
import './MyListingsPanel.css';

interface MyListingsPanelProps {
    listings: MarketListing[];
    onCancel?: (listingId: string) => void;
    onViewDetails?: (listing: MarketListing) => void;
    isLoading?: boolean;
}

export const MyListingsPanel: React.FC<MyListingsPanelProps> = ({
    listings,
    onCancel,
    onViewDetails,
    isLoading = false,
}) => {
    const getStatusBadge = (listing: MarketListing): { text: string; className: string } => {
        if (listing.status === 'sold') {
            return { text: '已售出', className: 'sold' };
        }
        if (listing.status === 'cancelled') {
            return { text: '已取消', className: 'cancelled' };
        }
        if (Date.now() > listing.expiresAt) {
            return { text: '已过期', className: 'expired' };
        }
        return { text: '出售中', className: 'active' };
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
            <div className="my-listings-loading">
                <p>加载中...</p>
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <div className="my-listings-empty">
                <p>您还没有上架的英雄NFT</p>
            </div>
        );
    }

    return (
        <div className="my-listings">
            {listings.map(listing => {
                const status = getStatusBadge(listing);

                return (
                    <div key={listing.id} className="my-listing-item">
                        <div className="listing-hero">
                            <NFTHeroCard hero={listing.hero} />
                        </div>

                        <div className="listing-details">
                            <div className="listing-status">
                                <span className={`status-badge ${status.className}`}>
                                    {status.text}
                                </span>
                            </div>

                            <div className="listing-price">
                                <span className="price-label">价格</span>
                                <span className="price-value">
                                    {PAYMENT_TOKEN_INFO[listing.paymentToken].icon} {listing.price.toLocaleString()}
                                </span>
                            </div>

                            <div className="listing-time">
                                <span className="time-label">
                                    {listing.status === 'active' ? '剩余时间' : '结束时间'}
                                </span>
                                <span className="time-value">
                                    {listing.status === 'active'
                                        ? getTimeRemaining(listing.expiresAt)
                                        : new Date(listing.expiresAt).toLocaleDateString()
                                    }
                                </span>
                            </div>

                            {listing.status === 'active' && (
                                <button
                                    className="cancel-listing-btn"
                                    onClick={() => onCancel?.(listing.id)}
                                >
                                    取消上架
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MyListingsPanel;
