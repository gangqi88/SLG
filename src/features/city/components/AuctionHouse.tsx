import React, { useState } from 'react';
import { useMainCity } from '@/features/city/hooks/useMainCity';
import { AuctionItemCard } from './AuctionItem';
import styles from './AuctionHouse.module.css';

type FilterStatus = 'active' | 'ended' | 'all';

export const AuctionHouse: React.FC = () => {
  const { auctionItems, isLoading } = useMainCity();
  const [filter, setFilter] = useState<FilterStatus>('active');

  const filteredItems = filter === 'all' 
    ? auctionItems 
    : auctionItems.filter(item => item.status === filter);

  if (isLoading) {
    return <div className={styles.loading}>Loading auctions...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Auction House</h2>

      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'active' ? styles.active : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'ended' ? styles.active : ''}`}
          onClick={() => setFilter('ended')}
        >
          Ended
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
      </div>

      <div className={styles.grid}>
        {filteredItems.map((item) => (
          <AuctionItemCard key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <p className={styles.empty}>No auctions found</p>
      )}
    </div>
  );
};
