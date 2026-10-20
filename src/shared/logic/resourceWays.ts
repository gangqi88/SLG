import type { PlayerResourceKey } from '@/shared/logic/PlayerResources';

export type Way = { key: string; title: string; desc: string; to?: string };

export type ResourceNeedKey = PlayerResourceKey | 'fragment';

export const getResourceWays = (key: ResourceNeedKey): Way[] => {
  const common: Way[] = [
    { key: 'tasks', title: '任务', desc: '完成任务领取奖励', to: '/tasks' },
    { key: 'gathering', title: '采集', desc: '派遣队伍采集资源', to: '/gathering' },
    { key: 'battle', title: '战斗', desc: '挑战副本获得奖励', to: '/battle' },
    { key: 'siege', title: '攻城战', desc: '参与攻城获取资源', to: '/siege' },
    { key: 'lootbox', title: '背包', desc: '打开宝箱获取道具', to: '/lootbox' },
  ];

  if (key === 'fragment') {
    return [
      { key: 'lootbox', title: '背包', desc: '打开宝箱获得碎片', to: '/lootbox' },
      { key: 'gacha', title: '招募', desc: '招募重复获得碎片', to: '/gacha' },
      { key: 'tasks', title: '任务', desc: '完成任务领取碎片', to: '/tasks' },
      { key: 'battle', title: '战斗', desc: '结算奖励可能包含碎片', to: '/battle' },
    ];
  }

  if (key === 'bun') {
    return [
      { key: 'lootbox', title: '背包', desc: '打开宝箱获得包子', to: '/lootbox' },
      { key: 'tasks', title: '任务', desc: '完成任务领取包子', to: '/tasks' },
      { key: 'battle', title: '战斗', desc: '战斗结算可获包子', to: '/battle' },
      { key: 'shop', title: '商店', desc: '商店系统待接入' },
    ];
  }

  if (key === 'gem') {
    return [
      { key: 'tasks', title: '任务', desc: '完成任务领取元宝', to: '/tasks' },
      { key: 'activity', title: '活动', desc: '活动系统待接入' },
      { key: 'recharge', title: '充值', desc: '充值系统待接入' },
    ];
  }

  return common;
};
