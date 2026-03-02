import React, { useState } from 'react';
import type { NFTHero } from '../../../../types/slg/nft-hero.types';
import type { PaymentToken } from '../../../../types/slg/market.types';
import { PAYMENT_TOKEN_INFO, MARKET_CONSTANTS } from '../../../../types/slg/market.types';
import { NFTHeroCard } from '../NFTHeroCard';
import './CreateListingPanel.css';

interface CreateListingPanelProps {
    hero: NFTHero;
    sellerAddress: string;
    onListingCreated?: () => void;
    onCancel?: () => void;
    onConfirm?: (price: number, paymentToken: PaymentToken, duration: number) => Promise<any>;
}

export const CreateListingPanel: React.FC<CreateListingPanelProps> = ({
    hero,
    sellerAddress,
    onCancel,
    onConfirm,
}) => {
    const [price, setPrice] = useState<number>(1000);
    const [paymentToken, setPaymentToken] = useState<PaymentToken>('BTC');
    const [duration, setDuration] = useState<number>(7);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const durationOptions = [
        { value: 1, label: '1天' },
        { value: 3, label: '3天' },
        { value: 7, label: '7天' },
        { value: 14, label: '14天' },
        { value: 30, label: '30天' },
    ];

    const paymentTokens: PaymentToken[] = ['BTC', 'FB', 'USDT', 'FRIEND'];

    const handleSubmit = async () => {
        if (price < MARKET_CONSTANTS.MIN_PRICE) {
            setError(`价格不能低于 ${MARKET_CONSTANTS.MIN_PRICE}`);
            return;
        }

        if (price > MARKET_CONSTANTS.MAX_PRICE) {
            setError(`价格不能超过 ${MARKET_CONSTANTS.MAX_PRICE}`);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (onConfirm) {
                await onConfirm(price, paymentToken, duration * 24 * 60 * 60 * 1000);
            }
        } catch (err: any) {
            setError(err.message || '上架失败');
        } finally {
            setIsLoading(false);
        }
    };

    const fee = Math.round(price * MARKET_CONSTANTS.FEE_PERCENTAGE / 100);
    const netIncome = price - fee;

    return (
        <div className="create-listing-overlay" onClick={onCancel}>
            <div className="create-listing-panel" onClick={e => e.stopPropagation()}>
                <div className="panel-header">
                    <h2>上架英雄NFT</h2>
                    <button className="close-btn" onClick={onCancel}>×</button>
                </div>

                <div className="hero-preview">
                    <NFTHeroCard hero={hero} />
                </div>

                <div className="form-section">
                    <label className="form-label">设置价格</label>
                    <div className="price-input-group">
                        <input
                            type="number"
                            className="price-input"
                            value={price}
                            onChange={e => setPrice(Number(e.target.value))}
                            min={MARKET_CONSTANTS.MIN_PRICE}
                            max={MARKET_CONSTANTS.MAX_PRICE}
                        />
                        <select
                            className="token-select"
                            value={paymentToken}
                            onChange={e => setPaymentToken(e.target.value as PaymentToken)}
                        >
                            {paymentTokens.map(token => (
                                <option key={token} value={token}>
                                    {PAYMENT_TOKEN_INFO[token].icon} {token}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-section">
                    <label className="form-label">上架时长</label>
                    <div className="duration-options">
                        {durationOptions.map(option => (
                            <button
                                key={option.value}
                                className={`duration-btn ${duration === option.value ? 'active' : ''}`}
                                onClick={() => setDuration(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="fee-preview">
                    <div className="fee-row">
                        <span>售价</span>
                        <span>{PAYMENT_TOKEN_INFO[paymentToken].icon} {price.toLocaleString()}</span>
                    </div>
                    <div className="fee-row">
                        <span>平台费 ({MARKET_CONSTANTS.FEE_PERCENTAGE}%)</span>
                        <span className="fee-value">-{fee.toLocaleString()}</span>
                    </div>
                    <div className="fee-row total">
                        <span>预计收入</span>
                        <span className="income-value">{PAYMENT_TOKEN_INFO[paymentToken].icon} {netIncome.toLocaleString()}</span>
                    </div>
                </div>

                {error && (
                    <div className="error-message">{error}</div>
                )}

                <div className="action-buttons">
                    <button className="cancel-btn" onClick={onCancel}>
                        取消
                    </button>
                    <button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={isLoading || !sellerAddress}
                    >
                        {isLoading ? '上架中...' : '确认上架'}
                    </button>
                </div>

                {!sellerAddress && (
                    <div className="warning-message">
                        请先连接钱包
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateListingPanel;
