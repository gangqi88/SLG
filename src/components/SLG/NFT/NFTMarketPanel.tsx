import React, { useState, useEffect } from 'react';
import type { NFTHero } from '../../../types/slg/nft-hero.types';
import type { FactionType, HeroQuality } from '../../../types/slg/hero.types';
import type { MarketListing, MarketFilter, PaymentToken } from '../../../types/slg/market.types';
import { useNFTMarket } from '../../../web3/hooks/useNFTMarket';
import { useUniSatWallet } from '../../../web3/hooks/useUniSatWallet';
import { useNFTHero } from '../../../web3/hooks/useNFTHero';
import { MarketList } from './Market/MarketList';
import { MyListingsPanel } from './Market/MyListingsPanel';
import { CreateListingPanel } from './Market/CreateListingPanel';
import './NFTMarketPanel.css';

type TabType = 'market' | 'my-listings' | 'sell';

interface NFTMarketPanelProps {
    onClose?: () => void;
}

export const NFTMarketPanel: React.FC<NFTMarketPanelProps> = ({ onClose }) => {
    const { address, isConnected } = useUniSatWallet();
    const wallet = (window as any).unisat;
    
    const {
        listings,
        myListings,
        stats,
        isLoading,
        fetchListings,
        createListing,
        cancelListing,
        purchaseListing,
    } = useNFTMarket();

    const { heroes: nftHeroes, fetchHeroes } = useNFTHero(wallet, address);

    const [activeTab, setActiveTab] = useState<TabType>('market');
    const [filter, setFilter] = useState<MarketFilter>({});
    const [showCreateListing, setShowCreateListing] = useState(false);
    const [selectedHero, setSelectedHero] = useState<NFTHero | null>(null);

    useEffect(() => {
        if (address) {
            fetchListings(filter);
            fetchHeroes(address);
        }
    }, [address]);

    const handlePurchase = async (listing: MarketListing) => {
        if (!isConnected || !address) {
            alert('请先连接钱包');
            return;
        }

        const result = await purchaseListing(listing.id, address);
        if (result.success) {
            alert(`购买成功！交易ID: ${result.transactionId}`);
            fetchListings(filter);
        } else {
            alert(`购买失败: ${result.error}`);
        }
    };

    const handleCancelListing = async (listingId: string) => {
        if (!address) return;

        if (!confirm('确定要取消此上架吗？')) return;

        const result = await cancelListing(listingId, address);
        if (result.success) {
            alert('取消成功');
            fetchListings(filter);
        } else {
            alert(`取消失败: ${result.error}`);
        }
    };

    const handleCreateListing = async (price: number, paymentToken: PaymentToken, duration: number) => {
        if (!selectedHero || !address) {
            alert('请选择要上架的英雄');
            return;
        }

        const result = await createListing(selectedHero, address, price, paymentToken, duration);
        if (result.success) {
            alert('上架成功！');
            setShowCreateListing(false);
            setSelectedHero(null);
            setActiveTab('my-listings');
        } else {
            alert(`上架失败: ${result.error}`);
        }
    };

    const factionOptions: { value: FactionType | ''; label: string }[] = [
        { value: '', label: '全部阵营' },
        { value: 'human', label: '人族' },
        { value: 'angel', label: '天使' },
        { value: 'demon', label: '恶魔' },
    ];

    const qualityOptions: { value: HeroQuality | ''; label: string }[] = [
        { value: '', label: '全部品质' },
        { value: 'purple', label: '紫将' },
        { value: 'orange', label: '橙将' },
        { value: 'red', label: '红将' },
    ];

    const tokenOptions: { value: PaymentToken | ''; label: string }[] = [
        { value: '', label: '全部代币' },
        { value: 'BTC', label: 'BTC' },
        { value: 'FB', label: 'FB' },
        { value: 'USDT', label: 'USDT' },
        { value: 'FRIEND', label: 'FRIEND' },
    ];

    return (
        <div className="nft-market-overlay" onClick={onClose}>
            <div className="nft-market-panel" onClick={e => e.stopPropagation()}>
                <div className="market-header">
                    <h2>NFT 英雄市场</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="market-stats">
                    <div className="stat-item">
                        <span className="stat-value">{stats?.totalListings || 0}</span>
                        <span className="stat-label">在售</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{stats?.totalVolume || 0}</span>
                        <span className="stat-label">总交易额</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{Math.round(stats?.averagePrice || 0)}</span>
                        <span className="stat-label">平均价格</span>
                    </div>
                </div>

                <div className="market-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`}
                        onClick={() => setActiveTab('market')}
                    >
                        市场
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'my-listings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('my-listings')}
                    >
                        我的上架
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'sell' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sell')}
                    >
                        出售
                    </button>
                </div>

                {activeTab === 'market' && (
                    <>
                        <div className="market-filters">
                            <select
                                value={filter.faction || ''}
                                onChange={e => setFilter({ ...filter, faction: e.target.value as FactionType || undefined })}
                            >
                                {factionOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <select
                                value={filter.quality || ''}
                                onChange={e => setFilter({ ...filter, quality: e.target.value as HeroQuality || undefined })}
                            >
                                {qualityOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <select
                                value={filter.paymentToken || ''}
                                onChange={e => setFilter({ ...filter, paymentToken: e.target.value as PaymentToken || undefined })}
                            >
                                {tokenOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <button className="refresh-btn" onClick={() => fetchListings(filter)}>
                                刷新
                            </button>
                        </div>

                        <MarketList
                            listings={listings}
                            isLoading={isLoading}
                            onPurchase={handlePurchase}
                        />
                    </>
                )}

                {activeTab === 'my-listings' && (
                    <>
                        {isConnected ? (
                            <MyListingsPanel
                                listings={myListings}
                                isLoading={isLoading}
                                onCancel={handleCancelListing}
                            />
                        ) : (
                            <div className="connect-wallet-prompt">
                                <p>请先连接钱包查看您的上架</p>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'sell' && (
                    <>
                        {isConnected ? (
                            <div className="sell-section">
                                <h3>选择要出售的NFT英雄</h3>
                                {nftHeroes.length === 0 ? (
                                    <div className="no-nft">
                                        <p>您还没有NFT英雄</p>
                                        <p className="hint">请先铸造或购买NFT英雄</p>
                                    </div>
                                ) : (
                                    <div className="nft-select-grid">
                                        {nftHeroes.map(hero => (
                                            <div
                                                key={hero.id}
                                                className={`nft-select-item ${selectedHero?.id === hero.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedHero(hero)}
                                            >
                                                <div className="nft-name">{hero.metadata.name}</div>
                                                <div className="nft-quality">{hero.heroData.quality}</div>
                                                <div className="nft-stars">{'★'.repeat(hero.heroData.stars)}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedHero && (
                                    <button
                                        className="sell-btn"
                                        onClick={() => setShowCreateListing(true)}
                                    >
                                        上架 {selectedHero.metadata.name}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="connect-wallet-prompt">
                                <p>请先连接钱包出售NFT</p>
                            </div>
                        )}
                    </>
                )}

                {showCreateListing && selectedHero && (
                    <CreateListingPanel
                        hero={selectedHero}
                        sellerAddress={address || ''}
                        onConfirm={handleCreateListing}
                        onCancel={() => setShowCreateListing(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default NFTMarketPanel;
