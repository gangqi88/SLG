import React, { useState } from 'react';
import { useAlliance } from '@/features/alliance/hooks/useAlliance';
import styles from './AllianceAd.module.css';

export const AllianceAd: React.FC = () => {
  const { adSpace, pendingBids, placeAdBid } = useAlliance();
  const [bidAmount, setBidAmount] = useState(1000);

  const handleBid = async () => {
    if (bidAmount <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    await placeAdBid(bidAmount);
    alert('Bid placed successfully!');
  };

  const formatTime = (timestamp: number) => {
    const remaining = timestamp - Date.now();
    if (remaining <= 0) return 'Expired';

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className={styles.ad}>
      <div className={styles.header}>
        <h3>Alliance Advertisement</h3>
      </div>

      {adSpace ? (
        <div className={styles.currentAd}>
          <h4>Current Ad</h4>
          <div className={styles.adCard}>
            <div className={styles.adContent}>
              <span className={styles.allianceName}>{adSpace.allianceName}</span>
              <p className={styles.message}>{adSpace.message}</p>
            </div>
            <div className={styles.adExpiry}>Expires in: {formatTime(adSpace.expiresAt)}</div>
          </div>
        </div>
      ) : (
        <div className={styles.noAd}>
          <p>No active advertisement</p>
          <p className={styles.hint}>Place a bid to show your alliance on the main city!</p>
        </div>
      )}

      <div className={styles.bidSection}>
        <h4>Place Bid</h4>
        <p>
          Current highest bid:{' '}
          {pendingBids.length > 0 ? Math.max(...pendingBids.map((b) => b.amount)) : 0} Gold
        </p>
        <div className={styles.bidForm}>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(Number(e.target.value))}
            min={1}
            className={styles.input}
          />
          <button onClick={handleBid} className={styles.bidButton}>
            Place Bid
          </button>
        </div>
      </div>

      <div className={styles.bidHistory}>
        <h4>Recent Bids</h4>
        {pendingBids.length === 0 ? (
          <p className={styles.empty}>No bids yet</p>
        ) : (
          <div className={styles.bidList}>
            {pendingBids
              .slice(-5)
              .reverse()
              .map((bid, index) => (
                <div key={index} className={styles.bidItem}>
                  <span className={styles.bidAlliance}>{bid.allianceName}</span>
                  <span className={styles.bidAmount}>{bid.amount.toLocaleString()} Gold</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
