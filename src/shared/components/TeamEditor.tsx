import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { allHeroes } from '@/features/hero/data/heroes';
import { Quality, Race, TroopType } from '@/features/hero/types/Hero';
import { Team } from '@/shared/logic/Team';
import styles from './TeamEditor.module.css';

const qualityColor = (q: Quality) => {
  if (q === Quality.RED) return 'var(--game-quality-red)';
  if (q === Quality.ORANGE) return 'var(--game-quality-orange)';
  return 'var(--game-quality-purple)';
};

const campLabel = (race: Race) => {
  if (race === Race.HUMAN) return '人族';
  if (race === Race.ANGEL) return '天使';
  if (race === Race.DEMON) return '恶魔';
  return String(race);
};

const roleLabel = (role: string) => {
  switch (role) {
    case TroopType.INFANTRY:
      return '步兵';
    case TroopType.ARCHER:
      return '弓兵';
    case TroopType.CAVALRY:
      return '骑兵';
    case TroopType.MAGE:
      return '法师';
    case TroopType.SIEGE:
      return '攻城';
    default:
      return role;
  }
};

export const TeamEditor: React.FC = () => {
  const { heroIds, maxSize } = useSyncExternalStore(
    (listener) => Team.subscribe(listener),
    () => Team.getSnapshot(),
  );
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allHeroes;
    return allHeroes.filter((h) => h.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className={styles.wrap}>
      <div className={styles.topRow}>
        <div className={styles.count}>
          {heroIds.length}/{maxSize}
        </div>
        <button type="button" onClick={() => Team.resetDefault()}>
          自动编队
        </button>
      </div>

      <input
        className={styles.search}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索武将名称"
        aria-label="搜索武将名称"
      />

      <div className={styles.list} role="listbox" aria-label="编队列表">
        {filtered.map((h) => {
          const selected = heroIds.includes(h.id);
          const full = !selected && heroIds.length >= maxSize;
          return (
            <button
              key={h.id}
              type="button"
              className={styles.row}
              onClick={() => Team.toggleHero(h.id)}
              disabled={full}
              title={full ? '已满编' : h.name}
              style={{ opacity: full ? 0.45 : 1 }}
            >
              <div
                className={styles.box}
                style={{
                  borderColor: selected ? 'var(--game-title)' : 'var(--game-border)',
                  color: selected ? 'var(--game-title)' : 'transparent',
                }}
              >
                ✓
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <div className={styles.name} style={{ color: qualityColor(h.quality) }}>
                  {h.name}
                </div>
                <div className={styles.meta}>
                  Lv.{h.level} · {campLabel(h.race)} · {roleLabel(String(h.troopType))}
                </div>
              </div>
              <div className={styles.tag}>{'★'.repeat(h.starRating)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

