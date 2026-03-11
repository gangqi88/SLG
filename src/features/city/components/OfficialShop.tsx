import React from 'react';
import { useMainCity } from '@/features/city/hooks/useMainCity';
import { ShopItemCard } from './ShopItem';
import styles from './OfficialShop.module.css';

export const OfficialShop: React.FC = () => {
  const { shopItems, purchaseItem, isLoading } = useMainCity();

  if (isLoading) {
    return <div className={styles.loading}>Loading shop...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Official Shop</h2>

      <div className={styles.grid}>
        {shopItems.map((item) => (
          <ShopItemCard key={item.id} item={item} onPurchase={() => purchaseItem(item.id, 1)} />
        ))}
      </div>

      {shopItems.length === 0 && <p className={styles.empty}>No items available</p>}
    </div>
  );
};
