import InventoryManager from '@/features/resource/logic/InventoryManager';
import { PlayerResources } from '@/shared/logic/PlayerResources';

export type RewardLine = { label: string; amount: number };

export type Reward = {
  type: 'resource' | 'item' | 'fragment' | 'hero';
  id: string;
  amount: number;
};

export const applyRewards = (rewards: Reward[]) => {
  rewards.forEach((r) => {
    if (r.type === 'resource') {
      if (r.id === 'coin') {
        PlayerResources.add('coin', r.amount);
        return;
      }
      if (r.id === 'diamond' || r.id === 'gem') {
        PlayerResources.add('gem', r.amount);
        return;
      }
      if (r.id === 'wood') {
        InventoryManager.addItem('resource_wood', r.amount);
        return;
      }
      if (r.id === 'stone' || r.id === 'ore') {
        InventoryManager.addItem('resource_stone', r.amount);
        return;
      }
      if (r.id === 'food') {
        PlayerResources.add('food', r.amount);
        return;
      }
      return;
    }

    if (r.type === 'item' || r.type === 'fragment') {
      InventoryManager.addItem(r.id, r.amount);
      return;
    }

    if (r.type === 'hero') {
      return;
    }
  });
};

export const formatRewardLines = (rewards: Reward[]): RewardLine[] => {
  return rewards.map((r) => {
    if (r.type === 'resource') {
      const label =
        r.id === 'coin'
          ? '金币'
          : r.id === 'diamond' || r.id === 'gem'
            ? '元宝'
            : r.id === 'wood'
              ? '木材'
              : r.id === 'stone' || r.id === 'ore'
                ? '矿石'
                : r.id === 'food'
                  ? '粮食'
                  : r.id;
      return { label, amount: r.amount };
    }
    if (r.type === 'item') return { label: r.id, amount: r.amount };
    if (r.type === 'hero') return { label: r.id, amount: r.amount };
    return { label: r.id, amount: r.amount };
  });
};
