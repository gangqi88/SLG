// NFT英雄系统类型定义

import type { FactionType, HeroQuality, HeroAttributes, Skill } from './hero.types';

export type NFTType = 'inscription' | 'frc20' | 'brc20';

export type NFTRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type MintType = 'inscription' | 'game_mint';

export interface NFTHeroMetadata {
    name: string;
    description: string;
    image: string;
    attributes: NFTHeroAttribute[];
}

export interface NFTHeroAttribute {
    trait_type: string;
    value: string | number;
    display_type?: string;
}

export interface NFTHeroInscriptionData {
    protocol: 'endless-winter';
    version: '1.0';
    type: 'hero';
    heroId: string;
    faction: FactionType;
    quality: HeroQuality;
    rarity: number;
    stars: number;
    level: number;
    attributes: HeroAttributes;
    skills: {
        active: string;
        passive: string;
        talent: string;
    };
    genesis: boolean;
    mintedAt: number;
    mintType: MintType;
}

export interface NFTHeroChainData {
    inscriptionId: string;
    inscriptionNumber: number;
    owner: string;
    inscriptionIdStr: string;
    contentType: string;
    timestamp: number;
}

export interface NFTHero {
    id: string;
    nftId: string;
    tokenId?: string;
    type: NFTType;
    
    metadata: NFTHeroMetadata;
    
    chainData?: NFTHeroChainData;
    
    heroData: {
        heroId: string;
        faction: FactionType;
        quality: HeroQuality;
        rarity: number;
        stars: number;
        level: number;
        attributes: HeroAttributes;
        skills: {
            active: Skill;
            passive: Skill;
            talent: Skill;
        };
    };
    
    gameData?: {
        experience: number;
        status: 'idle' | 'deployed' | 'training';
        assignedTeam?: string;
        battleStats: {
            battlesWon: number;
            battlesLost: number;
            totalDamage: number;
            totalHealing: number;
        };
    };
    
    ownership: {
        ownerAddress: string;
        isOwner: boolean;
        lastTransferTime?: number;
    };
    
    provenance: {
        genesis: boolean;
        mintedAt: number;
        mintType: MintType;
        mintTransaction?: string;
        creator?: string;
    };
    
    rarity: NFTRarity;
    power: number;
}

export interface NFTHeroMintRequest {
    heroId: string;
    mintType: MintType;
    toAddress: string;
    metadata: NFTHeroMetadata;
    inscriptionData: NFTHeroInscriptionData;
}

export interface NFTHeroMintResult {
    success: boolean;
    inscriptionId?: string;
    txid?: string;
    error?: string;
    fee?: number;
}

export interface NFTHeroListing {
    id: string;
    seller: string;
    price: number;
    paymentToken: 'BTC' | 'FB' | 'BRC20';
    paymentTicker?: string;
    heroId: string;
    nftData: NFTHero;
    listedAt: number;
    expiresAt: number;
}

export interface NFTHeroTransferRequest {
    toAddress: string;
    heroId: string;
    inscriptionId: string;
}

export interface NFTHeroTransferResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

export interface NFTHeroQuery {
    owner?: string;
    faction?: FactionType;
    quality?: HeroQuality;
    stars?: number;
    minRarity?: number;
    maxRarity?: number;
    page?: number;
    limit?: number;
}

export const NFT_HERO_CONSTANTS = {
    PROTOCOL: 'endless-winter',
    VERSION: '1.0',
    CONTENT_TYPE: 'application/json',
    
    RARITY_COLORS: {
        common: '#9ca3af',
        uncommon: '#22c55e',
        rare: '#3b82f6',
        epic: '#a855f7',
        legendary: '#f59e0b',
        mythic: '#ef4444',
    },
    
    RARITY_THRESHOLDS: {
        common: 20,
        uncommon: 40,
        rare: 60,
        epic: 80,
        legendary: 95,
        mythic: 100,
    },
    
    MINT_COSTS: {
        inscription: {
            baseFee: 1000,
            perAttribute: 100,
        },
        game_mint: {
            gold: 10000,
            heroSoul: 100,
        },
    },
    
    MAX_LEVEL: 80,
    MAX_STARS: 5,
    
    INSCRIPTION_TICKER: 'EWHERO',
} as const;

export function calculateRarity(rarity: number): NFTRarity {
    if (rarity >= NFT_HERO_CONSTANTS.RARITY_THRESHOLDS.mythic) return 'mythic';
    if (rarity >= NFT_HERO_CONSTANTS.RARITY_THRESHOLDS.legendary) return 'legendary';
    if (rarity >= NFT_HERO_CONSTANTS.RARITY_THRESHOLDS.epic) return 'epic';
    if (rarity >= NFT_HERO_CONSTANTS.RARITY_THRESHOLDS.rare) return 'rare';
    if (rarity >= NFT_HERO_CONSTANTS.RARITY_THRESHOLDS.uncommon) return 'uncommon';
    return 'common';
}

export function calculatePower(attributes: HeroAttributes, stars: number, level: number): number {
    const attributeSum = attributes.command + attributes.strength + attributes.strategy + attributes.defense;
    const starMultiplier = 1 + (stars - 1) * 0.1;
    const levelMultiplier = 1 + (level - 1) * 0.05;
    return Math.floor(attributeSum * starMultiplier * levelMultiplier);
}

export function serializeInscriptionData(data: NFTHeroInscriptionData): string {
    return JSON.stringify(data);
}

export function deserializeInscriptionData(json: string): NFTHeroInscriptionData | null {
    try {
        const data = JSON.parse(json);
        if (data.protocol === NFT_HERO_CONSTANTS.PROTOCOL && data.type === 'hero') {
            return data as NFTHeroInscriptionData;
        }
        return null;
    } catch {
        return null;
    }
}

export const __NFT_HERO_TYPES_MODULE__ = true as const;
