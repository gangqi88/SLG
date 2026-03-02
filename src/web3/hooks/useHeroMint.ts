import { useState, useCallback } from 'react';
import type { UniSatWallet } from '../types/unisat';
import type { Hero } from '../../types/slg/hero.types';
import type { 
    NFTHeroInscriptionData, 
    NFTHeroMintResult 
} from '../../types/slg/nft-hero.types';
import { NFT_HERO_CONSTANTS } from '../../types/slg/nft-hero.types';
import { nftHeroService } from '../services/nftHeroService';

export interface GameMintCosts {
    gold: number;
    heroSoul: number;
    factionCore?: number;
}

export interface UseHeroMintState {
    isMinting: boolean;
    error: string | null;
    lastResult: NFTHeroMintResult | null;
}

export interface UseHeroMintActions {
    mintHero: (hero: Hero, wallet: UniSatWallet, toAddress: string) => Promise<NFTHeroMintResult>;
    calculateCosts: (hero: Hero) => GameMintCosts;
    canAfford: (costs: GameMintCosts, playerResources: GameMintCosts) => boolean;
}

export const useHeroMint = (): UseHeroMintState & UseHeroMintActions => {
    const [isMinting, setIsMinting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<NFTHeroMintResult | null>(null);

    const calculateCosts = useCallback((hero: Hero): GameMintCosts => {
        const baseGold = NFT_HERO_CONSTANTS.MINT_COSTS.game_mint.gold;
        const baseHeroSoul = NFT_HERO_CONSTANTS.MINT_COSTS.game_mint.heroSoul;
        
        const qualityMultiplierMap: Record<string, number> = {
            purple: 1,
            orange: 2,
            red: 3,
        };
        const qualityMultiplier = qualityMultiplierMap[hero.quality] || 1;
        const starMultiplier = hero.stars;

        return {
            gold: baseGold * qualityMultiplier * starMultiplier,
            heroSoul: baseHeroSoul * qualityMultiplier * starMultiplier,
            factionCore: hero.quality === 'red' ? 10 : undefined,
        };
    }, []);

    const canAfford = useCallback((costs: GameMintCosts, playerResources: GameMintCosts): boolean => {
        if (playerResources.gold < costs.gold) return false;
        if (playerResources.heroSoul < costs.heroSoul) return false;
        if (costs.factionCore && playerResources.factionCore && playerResources.factionCore < costs.factionCore) {
            return false;
        }
        return true;
    }, []);

    const mintHero = useCallback(async (
        hero: Hero,
        wallet: UniSatWallet,
        _toAddress: string
    ): Promise<NFTHeroMintResult> => {
        setIsMinting(true);
        setError(null);

        try {
            const inscriptionData: NFTHeroInscriptionData = {
                protocol: NFT_HERO_CONSTANTS.PROTOCOL,
                version: NFT_HERO_CONSTANTS.VERSION,
                type: 'hero',
                heroId: hero.id,
                faction: hero.faction,
                quality: hero.quality,
                rarity: hero.rarity,
                stars: hero.stars,
                level: hero.level,
                attributes: hero.attributes,
                skills: {
                    active: hero.activeSkill.id,
                    passive: hero.passiveSkill.id,
                    talent: hero.talent.id,
                },
                genesis: false,
                mintedAt: Date.now(),
                mintType: 'game_mint',
            };

            const result = await nftHeroService.mintAsInscription({
                wallet,
                heroData: inscriptionData,
            });

            setLastResult(result);

            if (!result.success) {
                setError(result.error || '铸造失败');
            }

            return result;
        } catch (err: any) {
            const errorResult: NFTHeroMintResult = {
                success: false,
                error: err.message || '铸造失败',
            };
            setError(errorResult.error || '铸造失败');
            setLastResult(errorResult);
            return errorResult;
        } finally {
            setIsMinting(false);
        }
    }, []);

    return {
        isMinting,
        error,
        lastResult,
        mintHero,
        calculateCosts,
        canAfford,
    };
};

export default useHeroMint;
