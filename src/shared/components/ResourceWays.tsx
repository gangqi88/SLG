import React from 'react';
import type { PlayerResourceKey } from '@/shared/logic/PlayerResources';

type Way = { key: string; title: string; desc: string; to?: string };

export type ResourceNeedKey = PlayerResourceKey | 'fragment';

const resourceLabel = (key: ResourceNeedKey) => {
  switch (key) {
    case 'coin':
      return '金币';
    case 'gem':
      return '元宝';
    case 'food':
      return '粮食';
    case 'wood':
      return '木材';
    case 'ore':
      return '矿石';
    case 'bun':
      return '包子';
    case 'fragment':
      return '碎片';
    default:
      return key;
  }
};

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

export const ResourceWaysContent: React.FC<{
  resourceKey: ResourceNeedKey;
  onGo: (to: string) => void;
}> = ({ resourceKey, onGo }) => {
  const ways = getResourceWays(resourceKey);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ color: 'var(--game-text-muted)' }}>
        资源不足：{resourceLabel(resourceKey)}。可通过以下途径获取：
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ways.map((w) => (
          <div
            key={w.key}
            style={{
              borderRadius: 12,
              border: '1px solid rgba(58,58,90,0.7)',
              background: 'rgba(0,0,0,0.16)',
              padding: '10px 12px',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, color: 'var(--game-title)' }}>{w.title}</div>
              <div style={{ fontSize: 12, color: 'var(--game-text-muted)' }}>{w.desc}</div>
            </div>
            {w.to ? (
              <button
                type="button"
                onClick={() => onGo(w.to!)}
                style={{
                  height: 36,
                  borderRadius: 10,
                  border: '1px solid rgba(0,0,0,0.2)',
                  background: 'var(--game-btn-info)',
                  color: 'var(--game-text)',
                  fontWeight: 900,
                  padding: '0 10px',
                }}
              >
                前往
              </button>
            ) : (
              <button
                type="button"
                disabled
                style={{
                  height: 36,
                  borderRadius: 10,
                  border: '1px solid var(--game-border)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--game-text-muted)',
                  fontWeight: 900,
                  padding: '0 10px',
                }}
              >
                未开放
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
