import React from 'react';
import { ShopItem as ShopItemType } from '@/features/city/types/MainCity';
import styles from './ShopItem.module.css';

interface ShopItemProps {
  item: ShopItemType;
  onPurchase: () => void;
}

export const ShopItemCard: React.FC<ShopItemProps> = ({ item, onPurchase }) => {
  const canPurchase = item.weeklyLimit === 0 || item.soldThisWeek < item.weeklyLimit;

  return (
    <div className={styles.card}>
      <div className={styles.image}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.nameKey} />
        ) : (
          <div className={styles.placeholder}>?</div>
        )}
      </div>
      
      <h3 className={styles.name}>{item.nameKey}</h3>
      <p className={styles.description}>{item.descriptionKey}</p>
      
      <div className={styles.price}>
        {item.discount && (
          <span className={styles.discount}>{item.discount}% OFF</span>
        )}
        <span className={styles.amount}>
          {item.currency === 'cny' ? '¥' : '💎'}{item.price}
        </span>
      </div>

      {item.weeklyLimit > 0 && (
        <p className={styles.limit}>
          {item.weeklyLimit - item.soldThisWeek} / {item.weeklyLimit} left
        </p>
      )}

      <button
        className={styles.buyButton}
        onClick={onPurchase}
        disabled={!canPurchase}
      >
        {canPurchase ? 'Buy' : 'Sold Out'}
      </button>
    </div>
  );
};
