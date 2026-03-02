import { useState, useEffect, useCallback } from 'react';
import type { NFTHero } from '../../types/slg/nft-hero.types';
import type {
    MarketListing,
    MarketFilter,
    MarketStats,
    PaymentToken,
    ListingResult,
    PurchaseResult,
} from '../../types/slg/market.types';
import { nftMarketService } from '../../systems/NFTMarketService';

export interface UseNFTMarketState {
    listings: MarketListing[];
    myListings: MarketListing[];
    stats: MarketStats | null;
    isLoading: boolean;
    error: string | null;
}

export interface UseNFTMarketActions {
    fetchListings: (filter?: MarketFilter) => void;
    fetchMyListings: (address: string) => void;
    createListing: (
        hero: NFTHero,
        sellerAddress: string,
        price: number,
        paymentToken: PaymentToken,
        duration?: number
    ) => Promise<ListingResult>;
    cancelListing: (listingId: string, sellerAddress: string) => Promise<ListingResult>;
    purchaseListing: (
        listingId: string,
        buyerAddress: string
    ) => Promise<PurchaseResult>;
    refreshStats: () => void;
}

export const useNFTMarket = (): UseNFTMarketState & UseNFTMarketActions => {
    const [listings, setListings] = useState<MarketListing[]>([]);
    const [myListings, setMyListings] = useState<MarketListing[]>([]);
    const [stats, setStats] = useState<MarketStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchListings = useCallback((filter?: MarketFilter) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = nftMarketService.getListings(filter);
            setListings(result);
        } catch (err: any) {
            setError(err.message || '获取市场列表失败');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchMyListings = useCallback((address: string) => {
        if (!address) {
            setMyListings([]);
            return;
        }

        try {
            const result = nftMarketService.getMyListings(address);
            setMyListings(result);
        } catch (err: any) {
            setError(err.message || '获取我的上架失败');
        }
    }, []);

    const createListing = useCallback(
        async (
            hero: NFTHero,
            sellerAddress: string,
            price: number,
            paymentToken: PaymentToken,
            duration?: number
        ): Promise<ListingResult> => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await nftMarketService.createListing(
                    hero,
                    sellerAddress,
                    price,
                    paymentToken,
                    duration
                );

                if (result.success) {
                    fetchListings();
                    fetchMyListings(sellerAddress);
                    refreshStats();
                }

                return result;
            } catch (err: any) {
                const errorResult: ListingResult = {
                    success: false,
                    error: err.message || '创建上架失败',
                };
                return errorResult;
            } finally {
                setIsLoading(false);
            }
        },
        [fetchListings, fetchMyListings]
    );

    const cancelListing = useCallback(
        async (listingId: string, sellerAddress: string): Promise<ListingResult> => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await nftMarketService.cancelListing(listingId, sellerAddress);

                if (result.success) {
                    fetchListings();
                    fetchMyListings(sellerAddress);
                    refreshStats();
                }

                return result;
            } catch (err: any) {
                const errorResult: ListingResult = {
                    success: false,
                    error: err.message || '取消上架失败',
                };
                return errorResult;
            } finally {
                setIsLoading(false);
            }
        },
        [fetchListings, fetchMyListings]
    );

    const purchaseListing = useCallback(
        async (listingId: string, buyerAddress: string): Promise<PurchaseResult> => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await nftMarketService.purchaseListing(listingId, buyerAddress);

                if (result.success) {
                    fetchListings();
                    refreshStats();
                }

                return result;
            } catch (err: any) {
                const errorResult: PurchaseResult = {
                    success: false,
                    error: err.message || '购买失败',
                };
                return errorResult;
            } finally {
                setIsLoading(false);
            }
        },
        [fetchListings]
    );

    const refreshStats = useCallback(() => {
        try {
            const marketStats = nftMarketService.getStats();
            setStats(marketStats);
        } catch (err) {
            console.error('Failed to refresh stats:', err);
        }
    }, []);

    useEffect(() => {
        fetchListings();
        refreshStats();
    }, [fetchListings, refreshStats]);

    return {
        listings,
        myListings,
        stats,
        isLoading,
        error,
        fetchListings,
        fetchMyListings,
        createListing,
        cancelListing,
        purchaseListing,
        refreshStats,
    };
};

export default useNFTMarket;
