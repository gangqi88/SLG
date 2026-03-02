import type { HeroQuality } from '../types/slg/hero.types';
import type { NFTHero } from '../types/slg/nft-hero.types';

export interface PriceRecommendation {
    minPrice: number;
    maxPrice: number;
    recommendedPrice: number;
    confidence: number;
    factors: PriceFactor[];
}

export interface PriceFactor {
    name: string;
    impact: number;
    description: string;
}

export interface RarityScore {
    total: number;
    breakdown: RarityBreakdown;
    tier: RarityTier;
    percentile: number;
}

export interface RarityBreakdown {
    baseScore: number;
    qualityBonus: number;
    starsBonus: number;
    factionBonus: number;
    attributeBonus: number;
    skillBonus: number;
}

export type RarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'godlike';

export interface EconomyMetrics {
    totalSupply: number;
    averagePrice: number;
    floorPrice: number;
    ceilingPrice: number;
    volume24h: number;
    turnoverRate: number;
    rarityDistribution: Record<HeroQuality, number>;
}

export const ECONOMY_CONSTANTS = {
    QUALITY_WEIGHTS: {
        purple: 10,
        orange: 25,
        red: 50,
    },
    STAR_WEIGHTS: {
        1: 1,
        2: 1.5,
        3: 2.5,
        4: 4,
        5: 6,
    },
    FACTION_RARITY: {
        human: 1.0,
        angel: 1.2,
        demon: 1.5,
    },
    ATTRIBUTE_WEIGHTS: {
        command: 1.0,
        strength: 1.0,
        strategy: 1.0,
        defense: 0.8,
    },
    SKILL_WEIGHTS: {
        active: 2.0,
        passive: 1.5,
        talent: 3.0,
    },
    PRICE_MULTIPLIERS: {
        base: 100,
        volatility: 0.15,
        liquidityFactor: 0.1,
    },
    RARITY_TIERS: {
        common: { min: 0, max: 20 },
        uncommon: { min: 20, max: 40 },
        rare: { min: 40, max: 60 },
        epic: { min: 60, max: 80 },
        legendary: { min: 80, max: 95 },
        mythic: { min: 95, max: 99 },
        godlike: { min: 99, max: 100 },
    },
} as const;

export class EconomySystem {
    private static instance: EconomySystem;

    private constructor() {}

    static getInstance(): EconomySystem {
        if (!EconomySystem.instance) {
            EconomySystem.instance = new EconomySystem();
        }
        return EconomySystem.instance;
    }

    calculateRarityScore(hero: NFTHero): RarityScore {
        const heroData = hero.heroData;
        
        let baseScore = 0;
        let qualityBonus = 0;
        let starsBonus = 0;
        let factionBonus = 0;
        let attributeBonus = 0;
        let skillBonus = 0;

        qualityBonus = ECONOMY_CONSTANTS.QUALITY_WEIGHTS[heroData.quality as keyof typeof ECONOMY_CONSTANTS.QUALITY_WEIGHTS] || 10;

        const starWeight = ECONOMY_CONSTANTS.STAR_WEIGHTS[heroData.stars as keyof typeof ECONOMY_CONSTANTS.STAR_WEIGHTS] || 1;
        starsBonus = starWeight * 10;

        const factionMultiplier = ECONOMY_CONSTANTS.FACTION_RARITY[heroData.faction as keyof typeof ECONOMY_CONSTANTS.FACTION_RARITY] || 1;
        factionBonus = (factionMultiplier - 1) * 20;

        const attrValues = Object.values(heroData.attributes);
        const avgAttribute = (attrValues.reduce((a: number, b: number) => a + b, 0) / attrValues.length);
        attributeBonus = avgAttribute * 0.3;

        skillBonus = 15;

        baseScore = qualityBonus + starsBonus + factionBonus + attributeBonus + skillBonus;

        const total = Math.min(100, Math.round(baseScore));
        const tier = this.getRarityTier(total);
        const percentile = this.calculatePercentile(total);

        return {
            total,
            breakdown: {
                baseScore,
                qualityBonus,
                starsBonus,
                factionBonus,
                attributeBonus,
                skillBonus,
            },
            tier,
            percentile,
        };
    }

    private getRarityTier(score: number): RarityTier {
        if (score >= 99) return 'godlike';
        if (score >= 95) return 'mythic';
        if (score >= 80) return 'legendary';
        if (score >= 60) return 'epic';
        if (score >= 40) return 'rare';
        if (score >= 20) return 'uncommon';
        return 'common';
    }

    private calculatePercentile(score: number): number {
        const tiers = Object.entries(ECONOMY_CONSTANTS.RARITY_TIERS);
        let cumulative = 0;

        for (const [, range] of tiers) {
            const tierSize = range.max - range.min;
            if (score >= range.min) {
                cumulative += tierSize * (1 - cumulative * 0.01);
            }
        }

        return Math.min(99, Math.round(cumulative));
    }

    calculatePriceRecommendation(
        hero: NFTHero,
        marketData?: {
            recentSales?: number[];
            similarListings?: number[];
            daysOnMarket?: number;
        }
    ): PriceRecommendation {
        const rarityScore = this.calculateRarityScore(hero);
        const heroData = hero.heroData;
        
        const basePrice = ECONOMY_CONSTANTS.PRICE_MULTIPLIERS.base;
        
        let qualityMultiplier = 1;
        switch (heroData.quality) {
            case 'purple': qualityMultiplier = 1; break;
            case 'orange': qualityMultiplier = 2.5; break;
            case 'red': qualityMultiplier = 5; break;
        }

        const starMultiplier = heroData.stars * 0.5 + 1;
        
        const rarityMultiplier = 1 + (rarityScore.total / 100) * 2;

        const levelMultiplier = 1 + (heroData.level / 80) * 0.5;

        const recommendedPrice = Math.round(
            basePrice * qualityMultiplier * starMultiplier * rarityMultiplier * levelMultiplier
        );

        const factors: PriceFactor[] = [
            {
                name: '品质',
                impact: qualityMultiplier,
                description: `${heroData.quality}品质提供 x${qualityMultiplier}基础加成`,
            },
            {
                name: '星级',
                impact: starMultiplier,
                description: `${heroData.stars}星提供 x${starMultiplier}加成`,
            },
            {
                name: '稀有度',
                impact: rarityMultiplier,
                description: `稀有度评分${rarityScore.total}提供 x${rarityMultiplier.toFixed(2)}加成`,
            },
            {
                name: '等级',
                impact: levelMultiplier,
                description: `等级${heroData.level}提供 x${levelMultiplier.toFixed(2)}加成`,
            },
        ];

        if (marketData?.recentSales && marketData.recentSales.length > 0) {
            const avgSale = marketData.recentSales.reduce((a: number, b: number) => a + b, 0) / marketData.recentSales.length;
            const adjustedPrice = Math.round((recommendedPrice + avgSale) / 2);
            factors.push({
                name: '市场参考',
                impact: adjustedPrice / recommendedPrice,
                description: `基于${marketData.recentSales.length}笔成交记录调整`,
            });
        }

        let minPrice = Math.round(recommendedPrice * 0.8);
        let maxPrice = Math.round(recommendedPrice * 1.3);
        
        if (marketData?.daysOnMarket && marketData.daysOnMarket > 7) {
            minPrice = Math.round(minPrice * 0.9);
            factors.push({
                name: '上架时间',
                impact: 0.9,
                description: '上架超过7天，建议降价',
            });
        }

        const confidence = this.calculateConfidence(rarityScore, marketData);

        return {
            minPrice,
            maxPrice,
            recommendedPrice,
            confidence,
            factors,
        };
    }

    private calculateConfidence(
        rarityScore: RarityScore,
        marketData?: { recentSales?: number[] }
    ): number {
        let confidence = 50;

        confidence += rarityScore.total * 0.3;

        if (marketData?.recentSales) {
            confidence += Math.min(20, marketData.recentSales.length * 5);
        }

        if (rarityScore.tier === 'godlike' || rarityScore.tier === 'mythic') {
            confidence -= 10;
        }

        return Math.min(95, Math.max(20, Math.round(confidence)));
    }

    calculateMarketMetrics(heroes: NFTHero[]): EconomyMetrics {
        if (heroes.length === 0) {
            return {
                totalSupply: 0,
                averagePrice: 0,
                floorPrice: 0,
                ceilingPrice: 0,
                volume24h: 0,
                turnoverRate: 0,
                rarityDistribution: { purple: 0, orange: 0, red: 0 },
            };
        }

        const prices = heroes.map(h => this.calculatePriceRecommendation(h).recommendedPrice);
        const averagePrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
        const floorPrice = Math.min(...prices);
        const ceilingPrice = Math.max(...prices);

        const rarityDistribution: Record<HeroQuality, number> = {
            purple: heroes.filter(h => h.heroData.quality === 'purple').length,
            orange: heroes.filter(h => h.heroData.quality === 'orange').length,
            red: heroes.filter(h => h.heroData.quality === 'red').length,
        };

        return {
            totalSupply: heroes.length,
            averagePrice: Math.round(averagePrice),
            floorPrice,
            ceilingPrice,
            volume24h: 0,
            turnoverRate: 0.05,
            rarityDistribution,
        };
    }

    getTierColor(tier: RarityTier): string {
        const colors: Record<RarityTier, string> = {
            common: '#9ca3af',
            uncommon: '#22c55e',
            rare: '#3b82f6',
            epic: '#a855f7',
            legendary: '#f59e0b',
            mythic: '#ef4444',
            godlike: '#ff00ff',
        };
        return colors[tier];
    }

    getTierName(tier: RarityTier): string {
        const names: Record<RarityTier, string> = {
            common: '普通',
            uncommon: '优秀',
            rare: '稀有',
            epic: '史诗',
            legendary: '传说',
            mythic: '神话',
            godlike: '神级',
        };
        return names[tier];
    }
}

export const economySystem = EconomySystem.getInstance();
