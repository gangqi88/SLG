import React, { useState } from 'react';
import { Hero, Quality } from '../types/Hero';
import { HeroLogic } from '../game/logic/HeroLogic';
import HeroDevelopmentView from './HeroDevelopmentView';

interface HeroDetailProps {
  hero: Hero;
  onClose: () => void;
}

const getQualityColor = (quality: Quality) => {
  switch (quality) {
    case Quality.RED: return '#ff4d4f';
    case Quality.ORANGE: return '#fa8c16';
    case Quality.PURPLE: return '#722ed1';
    default: return '#ccc';
  }
};

const HeroDetail: React.FC<HeroDetailProps> = ({ hero, onClose }) => {
  const [showDevelopment, setShowDevelopment] = useState(false);
  const [, setVersion] = useState(0); // To force re-render

  const stats = HeroLogic.getStats(hero);

  return (
    <div className="hero-detail-overlay animate-fade-in" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div className="hero-detail-card animate-slide-in" style={{
        backgroundColor: '#2a2a2a', padding: '24px', borderRadius: '12px', maxWidth: '600px', width: '90%',
        maxHeight: '90vh', overflowY: 'auto', border: `2px solid ${getQualityColor(hero.quality)}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #444', paddingBottom: '12px' }}>
          <h2 style={{ color: getQualityColor(hero.quality), margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            {hero.name} 
            <span style={{ fontSize: '0.5em', color: '#fff', backgroundColor: getQualityColor(hero.quality), padding: '2px 6px', borderRadius: '4px' }}>
              {hero.quality}
            </span>
            <span style={{ fontSize: '0.5em', color: '#fff', backgroundColor: '#555', padding: '2px 6px', borderRadius: '4px' }}>
               Lv.{hero.level} {'★'.repeat(hero.starRating)}
             </span>
          </h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={() => setShowDevelopment(true)} style={{ background: '#2196f3', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Development</button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer', padding: '0', lineHeight: '1' }}>×</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <p style={{ margin: '5px 0' }}><strong style={{ color: '#aaa' }}>种族:</strong> <span style={{ color: '#fff' }}>{hero.race}</span></p>
            <p style={{ margin: '5px 0' }}><strong style={{ color: '#aaa' }}>定位:</strong> <span style={{ color: '#fff' }}>{hero.position}</span></p>
            <p style={{ margin: '5px 0' }}><strong style={{ color: '#aaa' }}>兵种:</strong> <span style={{ color: '#fff' }}>{hero.troopType}</span></p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ backgroundColor: '#222', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8em', color: '#aaa' }}>统御</div>
              <div style={{ fontSize: '1.2em', color: '#4caf50' }}>{stats.command}</div>
            </div>
            <div style={{ backgroundColor: '#222', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8em', color: '#aaa' }}>武力</div>
              <div style={{ fontSize: '1.2em', color: '#f44336' }}>{stats.strength}</div>
            </div>
            <div style={{ backgroundColor: '#222', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8em', color: '#aaa' }}>谋略</div>
              <div style={{ fontSize: '1.2em', color: '#2196f3' }}>{stats.strategy}</div>
            </div>
            <div style={{ backgroundColor: '#222', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8em', color: '#aaa' }}>防御</div>
              <div style={{ fontSize: '1.2em', color: '#ff9800' }}>{stats.defense}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ borderBottom: '1px solid #555', paddingBottom: '5px' }}>技能</h3>
          <div style={{ marginBottom: '10px' }}>
            <strong>天赋: {hero.talent.name}</strong>
            <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#aaa' }}>{hero.talent.description}</p>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>主动: {hero.activeSkill.name}</strong> {hero.activeSkill.cooldown && <small>(CD: {hero.activeSkill.cooldown}s)</small>}
            <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#aaa' }}>{hero.activeSkill.description}</p>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>被动: {hero.passiveSkill.name}</strong>
            <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#aaa' }}>{hero.passiveSkill.description}</p>
          </div>
        </div>

        {hero.bond && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ borderBottom: '1px solid #555', paddingBottom: '5px' }}>羁绊: {hero.bond.name}</h3>
            <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#aaa' }}>{hero.bond.description}</p>
            <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#8c8' }}>效果: {hero.bond.effect}</p>
          </div>
        )}

        <div>
          <h3 style={{ borderBottom: '1px solid #555', paddingBottom: '5px' }}>背景故事</h3>
          <p style={{ fontStyle: 'italic', color: '#aaa' }}>{hero.story}</p>
        </div>
      </div>

      {showDevelopment && (
        <HeroDevelopmentView 
          hero={hero} 
          onClose={() => setShowDevelopment(false)} 
          onUpdate={() => setVersion(v => v + 1)} 
        />
      )}
    </div>
  );
};

export default HeroDetail;
