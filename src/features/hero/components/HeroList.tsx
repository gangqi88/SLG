import React, { useMemo, useState } from 'react';
import { Hero, Quality, Race, TroopType } from '@/features/hero/types/Hero';
import { allHeroes } from '@/features/hero/data/heroes';
import { HeroLogic } from '@/features/hero/logic/HeroLogic';
import HeroDevelopmentView from './HeroDevelopmentView';
import styles from './HeroView.module.css';
import { useModal } from '@/shared/components/ModalProvider';

const HeroList: React.FC = () => {
  const modal = useModal();
  const [selectedHeroId, setSelectedHeroId] = useState<string>(() => allHeroes[0]?.id ?? '');
  const [filterCamp, setFilterCamp] = useState<string>('All');
  const [filterQuality, setFilterQuality] = useState<string>('All');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [, setVersion] = useState(0);

  const selectedHero = useMemo(
    () => allHeroes.find((h) => h.id === selectedHeroId) ?? null,
    [selectedHeroId],
  );

  const roles = useMemo(() => {
    const set = new Set<string>();
    allHeroes.forEach((h) => {
      set.add(String(h.troopType));
    });
    return Array.from(set).sort();
  }, []);

  const filteredHeroes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allHeroes.filter((h) => {
      if (filterCamp !== 'All' && h.race !== filterCamp) return false;
      if (filterQuality !== 'All' && h.quality !== filterQuality) return false;
      if (filterRole !== 'All' && String(h.troopType) !== filterRole) return false;
      if (q && !h.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filterCamp, filterQuality, filterRole, query]);

  const getQualityColor = (quality: Quality) => {
    switch (quality) {
      case Quality.RED:
        return 'var(--game-quality-red)';
      case Quality.ORANGE:
        return 'var(--game-quality-orange)';
      case Quality.PURPLE:
      default:
        return 'var(--game-quality-purple)';
    }
  };

  const getCampLabel = (race: Race) => {
    if (race === Race.HUMAN) return '人族';
    if (race === Race.ANGEL) return '天使';
    if (race === Race.DEMON) return '恶魔';
    return String(race);
  };

  const getRoleLabel = (role: string) => {
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

  const calcPower = (hero: Hero) => {
    const s = HeroLogic.getStats(hero);
    return s.command * 4 + s.strength * 3 + s.strategy * 3 + s.defense * 2;
  };

  return (
    <div className={styles.root}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>武将</h2>
          <div className={styles.controls}>
            <select
              className={styles.select}
              value={filterCamp}
              onChange={(e) => setFilterCamp(e.target.value)}
            >
              <option value="All">阵营：全部</option>
              <option value={Race.HUMAN}>阵营：人族</option>
              <option value={Race.ANGEL}>阵营：天使</option>
              <option value={Race.DEMON}>阵营：恶魔</option>
            </select>
            <select
              className={styles.select}
              value={filterQuality}
              onChange={(e) => setFilterQuality(e.target.value)}
            >
              <option value="All">品质：全部</option>
              <option value={Quality.PURPLE}>品质：紫</option>
              <option value={Quality.ORANGE}>品质：橙</option>
              <option value={Quality.RED}>品质：红</option>
            </select>
            <select
              className={styles.select}
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="All">职业：全部</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  职业：{getRoleLabel(r)}
                </option>
              ))}
            </select>
            <input
              className={styles.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索名称"
              aria-label="搜索名称"
            />
          </div>
        </div>
        <div className={styles.list} role="listbox" aria-label="武将列表">
          {filteredHeroes.map((h) => (
            <button
              key={h.id}
              type="button"
              className={`${styles.listItem} ${selectedHeroId === h.id ? styles.selected : ''}`}
              onClick={() => setSelectedHeroId(h.id)}
            >
              <div className={styles.avatar} style={{ borderColor: getQualityColor(h.quality) }}>
                {h.name.slice(0, 1)}
              </div>
              <div className={styles.meta}>
                <div className={styles.nameRow}>
                  <div className={styles.name} style={{ color: getQualityColor(h.quality) }}>
                    {h.name}
                  </div>
                </div>
                <div className={styles.sub}>
                  Lv.{h.level} · {getCampLabel(h.race)} · {getRoleLabel(String(h.troopType))}
                </div>
              </div>
              <div className={styles.rightMeta}>
                <div className={styles.stars}>{'★'.repeat(h.starRating)}</div>
                <div className={styles.power}>战力 {calcPower(h)}</div>
              </div>
            </button>
          ))}
          {filteredHeroes.length === 0 && <div className={styles.empty}>没有符合条件的武将</div>}
        </div>
      </div>

      <div className={styles.panel}>
        {selectedHero ? (
          <div className={styles.detailBody}>
            <div className={styles.detailHeader}>
              <div
                className={styles.heroPortrait}
                style={{ borderColor: getQualityColor(selectedHero.quality) }}
              >
                {selectedHero.name.slice(0, 1)}
              </div>
              <div className={styles.heroInfo}>
                <h3 className={styles.heroName} style={{ color: getQualityColor(selectedHero.quality) }}>
                  {selectedHero.name}
                </h3>
                <div className={styles.tags}>
                  <span className={styles.tag}>Lv.{selectedHero.level}</span>
                  <span className={styles.tag}>{'★'.repeat(selectedHero.starRating)}</span>
                  <span className={styles.tag}>阵营：{getCampLabel(selectedHero.race)}</span>
                  <span className={styles.tag}>职业：{getRoleLabel(String(selectedHero.troopType))}</span>
                </div>
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => {
                    modal.openModal({
                      title: `${selectedHero.name} 养成`,
                      content: (
                        <HeroDevelopmentView
                          hero={selectedHero}
                          onUpdate={() => {
                            setVersion((v) => v + 1);
                          }}
                        />
                      ),
                      actions: [
                        { key: 'close', label: '关闭', variant: 'secondary', onClick: () => modal.close() },
                      ],
                    });
                  }}
                >
                  养成
                </button>
              </div>
            </div>

            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>属性</h4>
              {(() => {
                const s = HeroLogic.getStats(selectedHero);
                return (
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>攻击</div>
                      <div className={styles.statValue}>{s.strength}</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>防御</div>
                      <div className={styles.statValue}>{s.defense}</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>生命</div>
                      <div className={styles.statValue}>{s.command}</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>速度</div>
                      <div className={styles.statValue}>{s.strategy}</div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>技能</h4>
              <div className={styles.skillBlock}>
                <div className={styles.skillName}>
                  主动：{selectedHero.activeSkill.name}
                  {selectedHero.activeSkill.cooldown ? (
                    <span style={{ marginLeft: 8, color: 'var(--game-text-muted)', fontSize: 12 }}>
                      CD {selectedHero.activeSkill.cooldown}s
                    </span>
                  ) : null}
                </div>
                <div className={styles.skillDesc}>{selectedHero.activeSkill.description}</div>
              </div>
              <div style={{ height: 10 }} />
              <div className={styles.skillBlock}>
                <div className={styles.skillName}>被动：{selectedHero.passiveSkill.name}</div>
                <div className={styles.skillDesc}>{selectedHero.passiveSkill.description}</div>
              </div>
              <div style={{ height: 10 }} />
              <div className={styles.skillBlock}>
                <div className={styles.skillName}>天赋：{selectedHero.talent.name}</div>
                <div className={styles.skillDesc}>{selectedHero.talent.description}</div>
              </div>
            </div>

            {selectedHero.bond ? (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>羁绊</h4>
                <div className={styles.skillBlock}>
                  <div className={styles.skillName}>{selectedHero.bond.name}</div>
                  <div className={styles.skillDesc}>{selectedHero.bond.description}</div>
                  <div className={styles.skillDesc}>效果：{selectedHero.bond.effect}</div>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className={styles.empty}>请选择一个武将</div>
        )}
      </div>
    </div>
  );
};

export default HeroList;
