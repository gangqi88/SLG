import React from 'react';
import { useMainCity } from '@/features/city/hooks/useMainCity';
import styles from './AdBillboard.module.css';

export const AdBillboard: React.FC = () => {
  const { adSpace, placeBid } = useMainCity();

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Ad Billboard</h3>
      
      {adSpace ? (
        <div className={styles.currentAd}>
          <p className={styles.allianceName}>{adSpace.allianceName}</p>
          <p className={styles.message}>{adSpace.message}</p>
          <p className={styles.expiresAt}>
            Expires: {new Date(adSpace.expiresAt).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <div className={styles.noAd}>
          <p>No active advertisement</p>
        </div>
      )}

      <button className={styles.bidButton} onClick={placeBid}>
        Place Bid
      </button>
    </div>
  );
};
