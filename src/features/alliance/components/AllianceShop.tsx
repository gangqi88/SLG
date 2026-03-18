import React from 'react';
import { useAlliance } from '@/features/alliance/hooks/useAlliance';
import styles from './AllianceShop.module.css';
import { useModal } from '@/shared/components/ModalProvider';
import { useNavigate } from 'react-router-dom';
import { openContributionWays } from '@/shared/logic/openContributionWays';

export const AllianceShop: React.FC = () => {
  const { shopItems, playerContribution, buyShopItem } = useAlliance();
  const modal = useModal();
  const navigate = useNavigate();

  const handleBuy = async (itemId: string, price: number) => {
    if (playerContribution < price) {
      openContributionWays({ modal, navigate });
      return;
    }
    const success = await buyShopItem(itemId);
    if (success) {
      modal.openAlert({ title: '购买成功', message: '已完成购买。' });
    } else {
      modal.openAlert({ title: '购买失败', message: '购买失败，请稍后再试。' });
    }
  };

  const getItemIcon = (type: string) => {
    const icons: Record<string, string> = {
      hero: '🦸',
      resource: '📦',
      speedup: '⚡',
      bundle: '🎁',
    };
    return icons[type] || '📦';
  };

  return (
    <div className={styles.shop}>
      <div className={styles.header}>
        <h3>Alliance Shop</h3>
        <div className={styles.contribution}>
          Your Points: <span>{playerContribution}</span>
        </div>
      </div>

      <div className={styles.grid}>
        {shopItems.map((item) => {
          const remaining = item.weeklyLimit - item.soldThisWeek;
          const canBuy = remaining > 0 && playerContribution >= item.price;

          return (
            <div key={item.id} className={styles.item}>
              <div className={styles.icon}>{getItemIcon(item.type)}</div>
              <div className={styles.info}>
                <h4>{item.nameKey.replace('shop.', '').replace('_', ' ')}</h4>
                <p className={styles.desc}>
                  {item.descriptionKey.replace('shop.', '').replace('.desc', '')}
                </p>
                <div className={styles.price}>
                  <span className={styles.priceValue}>{item.price}</span>
                  <span className={styles.priceType}>Points</span>
                </div>
              </div>
              <div className={styles.stock}>
                <span className={remaining > 0 ? styles.inStock : styles.outOfStock}>
                  {remaining > 0 ? `${remaining} left` : 'Sold Out'}
                </span>
              </div>
              <button
                className={styles.buyButton}
                onClick={() => handleBuy(item.id, item.price)}
                disabled={!canBuy}
              >
                Buy
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
