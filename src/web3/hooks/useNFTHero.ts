import { useState, useEffect, useCallback } from 'react';
import type { UniSatWallet } from '../types/unisat';
import type { 
    NFTHero, 
    NFTHeroInscriptionData,
    NFTHeroMetadata
} from '../../types/slg/nft-hero.types';
import { 
    calculateRarity, 
    calculatePower 
} from '../../types/slg/nft-hero.types';
import { unisatAPI } from '../services/unisatAPI';
import { nftHeroService } from '../services/nftHeroService';

export interface UseNFTHeroState {
    heroes: NFTHero[];
    isLoading: boolean;
    error: string | null;
    total: number;
}

export interface UseNFTHeroActions {
    fetchHeroes: (address: string) => Promise<void>;
    fetchHeroById: (inscriptionId: string) => Promise<NFTHero | null>;
    refreshHeroes: () => Promise<void>;
}

export const useNFTHero = (
    wallet: UniSatWallet | null,
    address: string | null
): UseNFTHeroState & UseNFTHeroActions => {
    const [heroes, setHeroes] = useState<NFTHero[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    const fetchHeroes = useCallback(async (ownerAddress: string) => {
        if (!ownerAddress) {
            setError('请先连接钱包');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const inscriptionResult = await unisatAPI.getInscriptions(ownerAddress, 0, 100);
            
            const heroInscriptions = inscriptionResult.list.filter(
                (inscription) => 
                    inscription.contentType === 'application/json' ||
                    inscription.contentType.includes('json')
            );

            const nftHeroes: NFTHero[] = [];

            for (const inscription of heroInscriptions) {
                try {
                    const content = await nftHeroService.getInscriptionContent(
                        wallet!,
                        inscription.inscriptionId
                    );

                    if (content && content.type === 'hero') {
                        const heroData = content as NFTHeroInscriptionData;
                        const rarity = calculateRarity(heroData.rarity);
                        const power = calculatePower(
                            heroData.attributes,
                            heroData.stars,
                            heroData.level
                        );

                        const nftHero: NFTHero = {
                            id: `nft-${inscription.inscriptionId}`,
                            nftId: inscription.inscriptionId,
                            type: 'inscription',
                            metadata: nftHeroService.buildMetadata(heroData) as unknown as NFTHeroMetadata,
                            chainData: {
                                inscriptionId: inscription.inscriptionId,
                                inscriptionNumber: inscription.inscriptionNumber,
                                owner: inscription.address || ownerAddress,
                                inscriptionIdStr: inscription.inscriptionId,
                                contentType: inscription.contentType,
                                timestamp: inscription.timestamp || Date.now(),
                            },
                            heroData: {
                                heroId: heroData.heroId,
                                faction: heroData.faction,
                                quality: heroData.quality,
                                rarity: heroData.rarity,
                                stars: heroData.stars,
                                level: heroData.level,
                                attributes: heroData.attributes,
                                skills: {
                                    active: heroData.skills.active as any,
                                    passive: heroData.skills.passive as any,
                                    talent: heroData.skills.talent as any,
                                },
                            },
                            ownership: {
                                ownerAddress: inscription.address || ownerAddress,
                                isOwner: (inscription.address || ownerAddress).toLowerCase() === ownerAddress.toLowerCase(),
                            },
                            provenance: {
                                genesis: heroData.genesis,
                                mintedAt: heroData.mintedAt,
                                mintType: heroData.mintType,
                            },
                            rarity,
                            power,
                        };

                        nftHeroes.push(nftHero);
                    }
                } catch (err) {
                    console.error(`获取铭文 ${inscription.inscriptionId} 失败:`, err);
                }
            }

            setHeroes(nftHeroes);
            setTotal(nftHeroes.length);
        } catch (err: any) {
            setError(err.message || '获取NFT英雄列表失败');
        } finally {
            setIsLoading(false);
        }
    }, [wallet]);

    const fetchHeroById = useCallback(async (inscriptionId: string): Promise<NFTHero | null> => {
        if (!wallet || !inscriptionId) {
            return null;
        }

        try {
            const content = await nftHeroService.getInscriptionContent(wallet, inscriptionId);
            
            if (!content || content.type !== 'hero') {
                return null;
            }

            const heroData = content;
            const rarity = calculateRarity(heroData.rarity);
            const power = calculatePower(heroData.attributes, heroData.stars, heroData.level);

            const nftHero: NFTHero = {
                id: `nft-${inscriptionId}`,
                nftId: inscriptionId,
                type: 'inscription',
                metadata: nftHeroService.buildMetadata(heroData) as unknown as NFTHeroMetadata,
                heroData: {
                    heroId: heroData.heroId,
                    faction: heroData.faction,
                    quality: heroData.quality,
                    rarity: heroData.rarity,
                    stars: heroData.stars,
                    level: heroData.level,
                    attributes: heroData.attributes,
                    skills: {
                        active: heroData.skills.active as any,
                        passive: heroData.skills.passive as any,
                        talent: heroData.skills.talent as any,
                    },
                },
                ownership: {
                    ownerAddress: address || '',
                    isOwner: true,
                },
                provenance: {
                    genesis: heroData.genesis,
                    mintedAt: heroData.mintedAt,
                    mintType: heroData.mintType,
                },
                rarity,
                power,
            };

            return nftHero;
        } catch (err) {
            console.error(`获取NFT英雄 ${inscriptionId} 失败:`, err);
            return null;
        }
    }, [wallet, address]);

    const refreshHeroes = useCallback(async () => {
        if (address) {
            await fetchHeroes(address);
        }
    }, [address, fetchHeroes]);

    useEffect(() => {
        if (address && wallet) {
            fetchHeroes(address);
        }
    }, [address, wallet, fetchHeroes]);

    return {
        heroes,
        isLoading,
        error,
        total,
        fetchHeroes,
        fetchHeroById,
        refreshHeroes,
    };
};

export default useNFTHero;
