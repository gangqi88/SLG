import React, { useState } from 'react';
import { Hero, Quality, Race } from '@/features/hero/types/Hero';
import { allHeroes } from '@/features/hero/data/heroes';
import HeroDetail from './HeroDetail';

const HeroList: React.FC = () => {
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [filterRace, setFilterRace] = useState<string>('All');

  const handleHeroCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, hero: Hero) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedHero(hero);
    }
  };

  const filteredHeroes =
    filterRace === 'All' ? allHeroes : allHeroes.filter((h) => h.race === filterRace);

  return (
    <div style={{ padding: '20px' }}>
      <h1>英雄列表</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setFilterRace('All')} style={{ marginRight: '10px' }}>
          全部
        </button>
        <button onClick={() => setFilterRace(Race.HUMAN)} style={{ marginRight: '10px' }}>
          人族
        </button>
        <button onClick={() => setFilterRace(Race.ANGEL)} style={{ marginRight: '10px' }}>
          天使
        </button>
        <button onClick={() => setFilterRace(Race.DEMON)} style={{ marginRight: '10px' }}>
          恶魔
        </button>
      </div>

      <div
        className="hero-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredHeroes.map((hero) => (
          <div
            key={hero.id}
            onClick={() => setSelectedHero(hero)}
            onKeyDown={(event) => handleHeroCardKeyDown(event, hero)}
            className="animate-fade-in"
            role="button"
            tabIndex={0}
            style={{
              border: '1px solid #444',
              borderRadius: '8px',
              padding: '15px',
              cursor: 'pointer',
              backgroundColor: '#2a2a2a',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
            }}
          >
            <h3
              style={{
                margin: '0 0 10px 0',
                color:
                  hero.quality === Quality.RED
                    ? '#ff4d4f'
                    : hero.quality === Quality.ORANGE
                      ? '#fa8c16'
                      : '#722ed1',
              }}
            >
              {hero.name}
            </h3>
            <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#aaa' }}>
              {hero.race} | {hero.position}
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8em',
                color: '#888',
              }}
            >
              <span>武:{hero.stats.strength}</span>
              <span>智:{hero.stats.strategy}</span>
              <span>统:{hero.stats.command}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedHero && <HeroDetail hero={selectedHero} onClose={() => setSelectedHero(null)} />}
    </div>
  );
};

export default HeroList;
