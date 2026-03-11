import React, { useState } from 'react';
import { AuctionItem as AuctionItemType } from '@/features/city/types/MainCity';
import { useMainCity } from '@/features/city/hooks/useMainCity';
import styles from './AuctionItem.module.css';

interface AuctionItemProps {
  item: AuctionItemType;
}

export const AuctionItemCard: React.FC<AuctionItemProps> = ({ item }) => {
  const { placeAuctionBid, buyout } = useMainCity();
  const [bidAmount, setBidAmount] = useState<number>(0);

  const timeLeft = Math.max(0, item.endTime - Date.now());
  const hours = Math.floor(timeLeft / 3600000);
  const minutes = Math.floor((timeLeft % 3600000) / 60000);

  const minBid = Math.floor(item.currentBid * 1.05);

  const handleBid = () => {
    if (bidAmount >= minBid) {
      placeAuctionBid(item.id, bidAmount);
    }
  };

  const handleBuyout = () => {
    buyout(item.id);
  };

  return (
    <div className={styles.card}>
      <div className={styles.image}>
        {item.itemImage ? (
          <img src={item.itemImage} alt={item.itemName} />
        ) : (
          <div className={styles.placeholder}>?</div>
        )}
      </div>

      <h3 className={styles.name}>{item.itemName}</h3>
      
      <div className={styles.price}>
        <div className={styles.currentBid}>
          <span>Current Bid:</span>
          <span className={styles.amount}>{item.currentBid}</span>
        </div>
        {item.bidCount > 0 && (
          <div className={styles.bidCount}>
            {item.bidCount} bids
          </div>
        )}
      </div>

      <div className={styles.timeLeft}>
        {item.status === 'active' ? (
          timeLeft > 0 ? `${hours}h ${minutes}m left` : 'Ending soon'
        ) : (
          'Auction Ended'
        )}
      </div>

      {item.status === 'active' && (
        <div className={styles.actions}>
          <div className={styles.bidInput}>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              min={minBid}
              placeholder={`Min: ${minBid}`}
            />
            <button onClick={handleBid} disabled={bidAmount < minBid}>
              Bid
            </button>
          </div>
          {item.buyoutPrice > 0 && (
            <button className={styles.buyoutButton} onClick={handleBuyout}>
              Buyout: {item.buyoutPrice}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
