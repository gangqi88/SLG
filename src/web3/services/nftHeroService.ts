import type { UniSatWallet } from '../types/unisat';
import type { NFTHeroInscriptionData, NFTHeroMintResult } from '../../types/slg/nft-hero.types';
import { NFT_HERO_CONSTANTS } from '../../types/slg/nft-hero.types';

export interface NFTHeroMintOptions {
    wallet: UniSatWallet;
    heroData: NFTHeroInscriptionData;
    feeRate?: number;
}

export interface NFTHeroTransferOptions {
    wallet: UniSatWallet;
    toAddress: string;
    inscriptionId: string;
    feeRate?: number;
}

export class NFTHeroService {
    private protocol = NFT_HERO_CONSTANTS.PROTOCOL;
    private version = NFT_HERO_CONSTANTS.VERSION;
    private contentType = NFT_HERO_CONSTANTS.CONTENT_TYPE;

    async mintAsInscription(options: NFTHeroMintOptions): Promise<NFTHeroMintResult> {
        const { wallet, heroData, feeRate } = options;

        try {
            const inscriptionData: NFTHeroInscriptionData = {
                protocol: this.protocol,
                version: this.version,
                type: 'hero',
                heroId: heroData.heroId,
                faction: heroData.faction,
                quality: heroData.quality,
                rarity: heroData.rarity,
                stars: heroData.stars,
                level: heroData.level,
                attributes: heroData.attributes,
                skills: heroData.skills,
                genesis: heroData.genesis,
                mintedAt: Date.now(),
                mintType: 'inscription',
            };

            const content = JSON.stringify(inscriptionData);

            const result = await wallet.inscribe(content, {
                contentType: this.contentType,
                feeRate: feeRate || 10,
            });

            if (result.inscriptionId) {
                return {
                    success: true,
                    inscriptionId: result.inscriptionId,
                    txid: result.txid,
                };
            }

            return {
                success: false,
                error: '铸造失败：未获得铭文ID',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || '铸造失败',
            };
        }
    }

    async mintAsFRC20(
        options: NFTHeroMintOptions
    ): Promise<NFTHeroMintResult> {
        const { wallet, heroData, feeRate } = options;

        try {
            const inscriptionData: NFTHeroInscriptionData = {
                protocol: this.protocol,
                version: this.version,
                type: 'hero',
                heroId: heroData.heroId,
                faction: heroData.faction,
                quality: heroData.quality,
                rarity: heroData.rarity,
                stars: heroData.stars,
                level: heroData.level,
                attributes: heroData.attributes,
                skills: heroData.skills,
                genesis: heroData.genesis,
                mintedAt: Date.now(),
                mintType: 'inscription',
            };

            const content = JSON.stringify(inscriptionData);

            const result = await wallet.inscribe(content, {
                contentType: this.contentType,
                feeRate: feeRate || 10,
            });

            if (result.inscriptionId) {
                return {
                    success: true,
                    inscriptionId: result.inscriptionId,
                    txid: result.txid,
                };
            }

            return {
                success: false,
                error: '铸造失败：未获得铭文ID',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || '铸造失败',
            };
        }
    }

    buildMetadata(heroData: NFTHeroInscriptionData): Record<string, any> {
        const factionNames: Record<string, string> = {
            human: 'Human',
            angel: 'Angel',
            demon: 'Demon',
        };

        const qualityNames: Record<string, string> = {
            purple: 'Purple',
            orange: 'Orange',
            red: 'Red',
        };

        return {
            name: `${heroData.faction.charAt(0).toUpperCase() + heroData.faction.slice(1)} Hero #${heroData.heroId}`,
            description: `A ${qualityNames[heroData.quality]} quality ${factionNames[heroData.faction]} hero with ${heroData.stars} stars.`,
            image: `ipfs://QmHero${heroData.heroId}`,
            attributes: [
                {
                    trait_type: 'Faction',
                    value: factionNames[heroData.faction],
                },
                {
                    trait_type: 'Quality',
                    value: qualityNames[heroData.quality],
                },
                {
                    trait_type: 'Rarity',
                    value: heroData.rarity,
                    display_type: 'number',
                },
                {
                    trait_type: 'Stars',
                    value: heroData.stars,
                    display_type: 'number',
                },
                {
                    trait_type: 'Level',
                    value: heroData.level,
                    display_type: 'number',
                },
                {
                    trait_type: 'Command',
                    value: heroData.attributes.command,
                    display_type: 'number',
                },
                {
                    trait_type: 'Strength',
                    value: heroData.attributes.strength,
                    display_type: 'number',
                },
                {
                    trait_type: 'Strategy',
                    value: heroData.attributes.strategy,
                    display_type: 'number',
                },
                {
                    trait_type: 'Defense',
                    value: heroData.attributes.defense,
                    display_type: 'number',
                },
            ],
        };
    }

    calculateMintFee(heroData: NFTHeroInscriptionData, feeRate: number = 10): number {
        const baseFee = NFT_HERO_CONSTANTS.MINT_COSTS.inscription.baseFee;
        const attributeCount = Object.keys(heroData.attributes).length;
        const attributeFee = attributeCount * NFT_HERO_CONSTANTS.MINT_COSTS.inscription.perAttribute;
        const dataSize = JSON.stringify(heroData).length;
        const byteFee = Math.ceil(dataSize / 1000) * feeRate * 100;

        return baseFee + attributeFee + byteFee;
    }

    async getInscriptionContent(
        _wallet: UniSatWallet,
        inscriptionId: string
    ): Promise<NFTHeroInscriptionData | null> {
        try {
            const response = await fetch(
                `https://api.unisat.io/query-v4/inscription/${inscriptionId}/content`
            );
            
            if (!response.ok) {
                return null;
            }

            const content = await response.text();
            const data = JSON.parse(content);

            if (data.protocol === this.protocol && data.type === 'hero') {
                return data as NFTHeroInscriptionData;
            }

            return null;
        } catch (error) {
            console.error('获取铭文内容失败:', error);
            return null;
        }
    }
}

export const nftHeroService = new NFTHeroService();
export default nftHeroService;
