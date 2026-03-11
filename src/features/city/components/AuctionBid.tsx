import React, { useState } from 'react';
import styles from './AuctionBid.module.css';

interface AuctionBidProps {
  currentBid: number;
  minBid: number;
  onPlaceBid: (amount: number) => void;
  onCancel: () => void;
}

export const AuctionBid: React.FC<AuctionBidProps> = ({
  currentBid,
  minBid,
  onPlaceBid,
  onCancel,
}) => {
  const [bidAmount, setBidAmount] = useState<number>(minBid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bidAmount >= minBid) {
      onPlaceBid(bidAmount);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>Place Your Bid</h3>
        
        <div className={styles.currentBid}>
          <span>Current Bid:</span>
          <span className={styles.amount}>{currentBid}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="bidAmount">Your Bid</label>
            <input
              id="bidAmount"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              min={minBid}
              step={1}
            />
            <span className={styles.minBid}>Minimum: {minBid}</span>
          </div>

          <div className={styles.quickBids}>
            <button
              type="button"
              onClick={() => setBidAmount(minBid)}
            >
              Min ({minBid})
            </button>
            <button
              type="button"
              onClick={() => setBidAmount(Math.floor(currentBid * 1.1))}
            >
              +10%
            </button>
            <button
              type="button"
              onClick={() => setBidAmount(Math.floor(currentBid * 1.25))}
            >
              +25%
            </button>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={bidAmount < minBid}
            >
              Place Bid
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
