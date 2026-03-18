import React, { useState } from 'react';
import { useMainCity } from '@/features/city/hooks/useMainCity';
import { AuctionItemCard } from './AuctionItem';
import styles from './AuctionHouse.module.css';

type FilterStatus = 'active' | 'ended' | 'all';

export const AuctionHouse: React.FC = () => {
  const { auctionItems, isLoading } = useMainCity();
  const [filter, setFilter] = useState<FilterStatus>('active');

  const filteredItems =
    filter === 'all' ? auctionItems : auctionItems.filter((item) => item.status === filter);

  if (isLoading) {
    return <div className={styles.loading}>竞拍加载中...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>竞拍</h2>

      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'active' ? styles.active : ''}`}
          onClick={() => setFilter('active')}
        >
          进行中
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'ended' ? styles.active : ''}`}
          onClick={() => setFilter('ended')}
        >
          已结束
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          全部
        </button>
      </div>

      <div className={styles.grid}>
        {filteredItems.map((item) => (
          <AuctionItemCard key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 && <p className={styles.empty}>暂无竞拍</p>}
    </div>
  );
};
