import React, { useMemo, useSyncExternalStore } from 'react';
import { Team, getTeamHeroes } from '@/shared/logic/Team';
import { computeGatherRates } from '@/shared/logic/teamMetrics';
import { getResourceWays, type ResourceNeedKey, type Way } from '@/shared/logic/resourceWays';

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

const preferredWayKeysByResource: Partial<Record<ResourceNeedKey, string[]>> = {
  wood: ['gathering', 'tasks', 'siege', 'battle', 'lootbox'],
  ore: ['gathering', 'tasks', 'siege', 'battle', 'lootbox'],
  food: ['gathering', 'tasks', 'battle', 'lootbox'],
  coin: ['tasks', 'battle', 'siege', 'gathering', 'lootbox'],
  gem: ['tasks', 'recharge', 'activity'],
  bun: ['lootbox', 'tasks', 'battle', 'shop'],
  fragment: ['gacha', 'lootbox', 'tasks', 'battle'],
};

const sortWays = (resourceKey: ResourceNeedKey, ways: Way[]) => {
  const preferred = preferredWayKeysByResource[resourceKey] ?? [];
  const preferredIndex = new Map<string, number>();
  preferred.forEach((k, i) => preferredIndex.set(k, i));
  const withIndex = ways.map((w, idx) => ({ w, idx }));
  withIndex.sort((a, b) => {
    const ap = preferredIndex.has(a.w.key)
      ? (preferredIndex.get(a.w.key) as number)
      : Number.POSITIVE_INFINITY;
    const bp = preferredIndex.has(b.w.key)
      ? (preferredIndex.get(b.w.key) as number)
      : Number.POSITIVE_INFINITY;
    if (ap !== bp) return ap - bp;
    const ato = a.w.to ? 0 : 1;
    const bto = b.w.to ? 0 : 1;
    if (ato !== bto) return ato - bto;
    return a.idx - b.idx;
  });
  return withIndex.map((x) => x.w);
};

const formatEta = (minutes: number) => {
  const m = Math.max(0, Math.ceil(minutes));
  if (m < 60) return `约 ${m} 分钟`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm === 0 ? `约 ${h} 小时` : `约 ${h} 小时 ${mm} 分钟`;
};

export const ResourceWaysContent: React.FC<{
  resourceKey: ResourceNeedKey;
  needAmount?: number;
  haveAmount?: number;
  onGo: (to: string) => void;
}> = ({ resourceKey, needAmount, haveAmount, onGo }) => {
  const ways = sortWays(resourceKey, getResourceWays(resourceKey));
  const preferredSet = new Set(preferredWayKeysByResource[resourceKey] ?? []);
  const need = typeof needAmount === 'number' ? Math.max(0, Math.floor(needAmount)) : null;
  const have = typeof haveAmount === 'number' ? Math.max(0, Math.floor(haveAmount)) : null;
  const deficit = need !== null && have !== null ? Math.max(0, need - have) : null;
  const team = useSyncExternalStore(
    (listener) => Team.subscribe(listener),
    () => Team.getSnapshot(),
  );
  const teamHeroes = useMemo(() => getTeamHeroes(team.heroIds), [team.heroIds]);
  const gather = useMemo(() => computeGatherRates(teamHeroes), [teamHeroes]);
  const gatherEta = useMemo(() => {
    if (deficit === null || deficit <= 0) return null;
    if (resourceKey !== 'wood' && resourceKey !== 'ore') return null;
    const perMin = resourceKey === 'wood' ? gather.woodPerMin : gather.orePerMin;
    if (perMin <= 0) return null;
    return { perMin, etaText: formatEta(deficit / perMin) };
  }, [deficit, gather.orePerMin, gather.woodPerMin, resourceKey]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ color: 'var(--game-text-muted)' }}>
        资源不足：{resourceLabel(resourceKey)}
        {deficit !== null ? `（缺少 ${deficit}）` : ''}。可通过以下途径获取：
      </div>
      {need !== null && have !== null && (
        <div
          style={{
            borderRadius: 12,
            border: '1px solid rgba(58,58,90,0.7)',
            background: 'rgba(0,0,0,0.12)',
            padding: '10px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <span style={{ color: 'var(--game-text-muted)' }}>当前/所需</span>
          <span
            style={{
              fontFamily: 'var(--game-font-mono)',
              color: (deficit ?? 0) > 0 ? 'var(--game-btn-battle)' : 'var(--game-title)',
            }}
          >
            {have}/{need}
          </span>
        </div>
      )}
      {gatherEta && (
        <div style={{ color: 'var(--game-text-muted)', fontSize: 12 }}>
          按当前编队采集产速（{gatherEta.perMin}/分），预计 {gatherEta.etaText} 可补齐缺口。
        </div>
      )}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontWeight: 900, color: 'var(--game-title)' }}>{w.title}</div>
                {preferredSet.has(w.key) ? (
                  <span
                    style={{
                      fontSize: 12,
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: '1px solid rgba(212, 184, 126, 0.35)',
                      background: 'rgba(212, 184, 126, 0.12)',
                      color: 'var(--game-title)',
                      fontWeight: 900,
                    }}
                  >
                    推荐
                  </span>
                ) : null}
              </div>
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
