import type { UniSatWallet } from '../web3/types/unisat';
import type { NFTHero } from '../types/slg/nft-hero.types';
import {
    MarketListing,
    MarketFilter,
    MarketStats,
    ListingResult,
    PurchaseResult,
    MARKET_CONSTANTS,
    PaymentToken,
} from '../types/slg/market.types';
import { generateId } from '../utils/helpers';

const STORAGE_KEY = 'nft_market_listings';

export class NFTMarketService {
    private static instance: NFTMarketService;

    private constructor() {}

    static getInstance(): NFTMarketService {
        if (!NFTMarketService.instance) {
            NFTMarketService.instance = new NFTMarketService();
        }
        return NFTMarketService.instance;
    }

    private getAllListings(): MarketListing[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    private saveAllListings(listings: MarketListing[]): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
    }

    async createListing(
        hero: NFTHero,
        sellerAddress: string,
        price: number,
        paymentToken: PaymentToken,
        duration: number = MARKET_CONSTANTS.DEFAULT_DURATION
    ): Promise<ListingResult> {
        if (price < MARKET_CONSTANTS.MIN_PRICE) {
            return { success: false, error: `价格不能低于 ${MARKET_CONSTANTS.MIN_PRICE}` };
        }

        if (price > MARKET_CONSTANTS.MAX_PRICE) {
            return { success: false, error: `价格不能超过 ${MARKET_CONSTANTS.MAX_PRICE}` };
        }

        if (duration < MARKET_CONSTANTS.MIN_LISTING_DURATION) {
            return { success: false, error: '上架时间最短1天' };
        }

        if (duration > MARKET_CONSTANTS.MAX_LISTING_DURATION) {
            return { success: false, error: '上架时间最长30天' };
        }

        const listings = this.getAllListings();
        const existingListing = listings.find(
            l => l.hero.nftId === hero.nftId && l.status === 'active'
        );

        if (existingListing) {
            return { success: false, error: '该英雄已经在市场上架' };
        }

        const now = Date.now();
        const listing: MarketListing = {
            id: generateId(),
            sellerAddress,
            hero,
            price,
            paymentToken,
            status: 'active',
            listedAt: now,
            expiresAt: now + duration,
        };

        listings.push(listing);
        this.saveAllListings(listings);

        return { success: true, listing };
    }

    async cancelListing(
        listingId: string,
        sellerAddress: string
    ): Promise<ListingResult> {
        const listings = this.getAllListings();
        const listing = listings.find(l => l.id === listingId);

        if (!listing) {
            return { success: false, error: '上架不存在' };
        }

        if (listing.sellerAddress !== sellerAddress) {
            return { success: false, error: '只有卖家可以取消上架' };
        }

        if (listing.status !== 'active') {
            return { success: false, error: '该上架已结束' };
        }

        listing.status = 'cancelled';
        listing.cancelledAt = Date.now();

        this.saveAllListings(listings);

        return { success: true, listing };
    }

    async purchaseListing(
        listingId: string,
        buyerAddress: string,
        _wallet?: UniSatWallet
    ): Promise<PurchaseResult> {
        const listings = this.getAllListings();
        const listing = listings.find(l => l.id === listingId);

        if (!listing) {
            return { success: false, error: '上架不存在' };
        }

        if (listing.status !== 'active') {
            return { success: false, error: '该上架已结束' };
        }

        if (Date.now() > listing.expiresAt) {
            listing.status = 'expired';
            this.saveAllListings(listings);
            return { success: false, error: '该上架已过期' };
        }

        if (listing.sellerAddress === buyerAddress) {
            return { success: false, error: '不能购买自己的商品' };
        }

        listing.status = 'sold';
        listing.soldAt = Date.now();

        this.saveAllListings(listings);

        return {
            success: true,
            transactionId: generateId(),
        };
    }

    getListings(filter?: MarketFilter): MarketListing[] {
        let listings = this.getAllListings();

        listings = listings.filter(l => {
            if (l.status !== 'active') return false;
            if (Date.now() > l.expiresAt) return false;
            return true;
        });

        if (filter) {
            if (filter.faction) {
                listings = listings.filter(l => l.hero.heroData.faction === filter.faction);
            }
            if (filter.quality) {
                listings = listings.filter(l => l.hero.heroData.quality === filter.quality);
            }
            if (filter.minStars) {
                listings = listings.filter(l => l.hero.heroData.stars >= filter.minStars!);
            }
            if (filter.maxStars) {
                listings = listings.filter(l => l.hero.heroData.stars <= filter.maxStars!);
            }
            if (filter.minPrice) {
                listings = listings.filter(l => l.price >= filter.minPrice!);
            }
            if (filter.maxPrice) {
                listings = listings.filter(l => l.price <= filter.maxPrice!);
            }
            if (filter.paymentToken) {
                listings = listings.filter(l => l.paymentToken === filter.paymentToken);
            }
            if (filter.sellerAddress) {
                listings = listings.filter(l => l.sellerAddress === filter.sellerAddress);
            }
        }

        return listings.sort((a, b) => b.listedAt - a.listedAt);
    }

    getMyListings(address: string): MarketListing[] {
        const listings = this.getAllListings();
        return listings
            .filter(l => l.sellerAddress === address)
            .sort((a, b) => b.listedAt - a.listedAt);
    }

    getListingById(listingId: string): MarketListing | null {
        const listings = this.getAllListings();
        return listings.find(l => l.id === listingId) || null;
    }

    getStats(): MarketStats {
        const listings = this.getAllListings().filter(
            l => l.status === 'active' && Date.now() <= l.expiresAt
        );

        const totalListings = listings.length;
        const totalVolume = listings
            .filter(l => l.status === 'sold')
            .reduce((sum, l) => sum + l.price, 0);

        const listingsByQuality = {
            purple: listings.filter(l => l.hero.heroData.quality === 'purple').length,
            orange: listings.filter(l => l.hero.heroData.quality === 'orange').length,
            red: listings.filter(l => l.hero.heroData.quality === 'red').length,
        };

        const listingsByFaction = {
            human: listings.filter(l => l.hero.heroData.faction === 'human').length,
            angel: listings.filter(l => l.hero.heroData.faction === 'angel').length,
            demon: listings.filter(l => l.hero.heroData.faction === 'demon').length,
        };

        return {
            totalListings,
            totalVolume,
            averagePrice: totalListings > 0
                ? listings.reduce((sum, l) => sum + l.price, 0) / totalListings
                : 0,
            listingsByQuality,
            listingsByFaction,
        };
    }

    calculateFee(price: number): number {
        return Math.round(price * MARKET_CONSTANTS.FEE_PERCENTAGE / 100);
    }

    formatPrice(price: number, token: PaymentToken): string {
        return `${price.toLocaleString()} ${token}`;
    }

    addSampleListings(): void {
        const existingListings = this.getAllListings();
        if (existingListings.length > 0) return;
    }
}

export const nftMarketService = NFTMarketService.getInstance();
