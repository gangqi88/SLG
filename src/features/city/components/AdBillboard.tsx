import React from 'react';
import { useMainCity } from '@/features/city/hooks/useMainCity';
import styles from './AdBillboard.module.css';

export const AdBillboard: React.FC = () => {
  const { adSpace, placeBid } = useMainCity();

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>联盟广告位</h3>

      {adSpace ? (
        <div className={styles.currentAd}>
          <p className={styles.allianceName}>{adSpace.allianceName}</p>
          <p className={styles.message}>{adSpace.message}</p>
          <p className={styles.expiresAt}>
            到期: {new Date(adSpace.expiresAt).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <div className={styles.noAd}>
          <p>暂无广告</p>
        </div>
      )}

      <button className={styles.bidButton} onClick={placeBid}>
        出价
      </button>
    </div>
  );
};
