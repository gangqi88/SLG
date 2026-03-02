import type { FactionType, HeroQuality } from './hero.types';
import type { NFTHero } from './nft-hero.types';

export type ListingStatus = 'active' | 'sold' | 'cancelled' | 'expired';

export type PaymentToken = 'BTC' | 'FB' | 'USDT' | 'FRIEND';

export interface MarketListing {
    id: string;
    sellerAddress: string;
    hero: NFTHero;
    price: number;
    paymentToken: PaymentToken;
    status: ListingStatus;
    listedAt: number;
    expiresAt: number;
    cancelledAt?: number;
    soldAt?: number;
}

export interface CreateListingRequest {
    heroId: string;
    price: number;
    paymentToken: PaymentToken;
    duration: number;
}

export interface CancelListingRequest {
    listingId: string;
}

export interface PurchaseRequest {
    listingId: string;
    buyerAddress: string;
}

export interface MarketFilter {
    faction?: FactionType;
    quality?: HeroQuality;
    minStars?: number;
    maxStars?: number;
    minPrice?: number;
    maxPrice?: number;
    paymentToken?: PaymentToken;
    sellerAddress?: string;
}

export interface MarketStats {
    totalListings: number;
    totalVolume: number;
    averagePrice: number;
    listingsByQuality: Record<HeroQuality, number>;
    listingsByFaction: Record<FactionType, number>;
}

export interface ListingResult {
    success: boolean;
    listing?: MarketListing;
    error?: string;
}

export interface PurchaseResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

export const MARKET_CONSTANTS = {
    MIN_PRICE: 100,
    MAX_PRICE: 100000000,
    DEFAULT_DURATION: 7 * 24 * 60 * 60 * 1000,
    FEE_PERCENTAGE: 2.5,
    MIN_LISTING_DURATION: 1 * 24 * 60 * 60 * 1000,
    MAX_LISTING_DURATION: 30 * 24 * 60 * 60 * 1000,
} as const;

export const PAYMENT_TOKEN_INFO: Record<PaymentToken, {
    name: string;
    symbol: string;
    decimals: number;
    icon: string;
}> = {
    BTC: { name: 'Bitcoin', symbol: 'BTC', decimals: 8, icon: '₿' },
    FB: { name: 'Fractal Bitcoin', symbol: 'FB', decimals: 8, icon: '◈' },
    USDT: { name: 'Tether', symbol: 'USDT', decimals: 6, icon: '$' },
    FRIEND: { name: 'Friend Token', symbol: 'FRIEND', decimals: 18, icon: '🤝' },
};
