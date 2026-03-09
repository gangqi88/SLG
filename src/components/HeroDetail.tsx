import React from 'react';
import { Hero, Quality } from '../types/Hero';

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
  return (
    <div className="hero-detail-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="hero-detail-card" style={{
        backgroundColor: '#333', padding: '20px', borderRadius: '8px', maxWidth: '600px', width: '90%',
        maxHeight: '90vh', overflowY: 'auto', border: `2px solid ${getQualityColor(hero.quality)}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: getQualityColor(hero.quality), margin: 0 }}>{hero.name} <small style={{ fontSize: '0.6em', color: '#ccc' }}>({hero.quality})</small></h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <p><strong>种族:</strong> {hero.race}</p>
            <p><strong>定位:</strong> {hero.position}</p>
            <p><strong>兵种:</strong> {hero.troopType}</p>
          </div>
          <div>
            <p><strong>统御:</strong> {hero.stats.command}</p>
            <p><strong>武力:</strong> {hero.stats.strength}</p>
            <p><strong>谋略:</strong> {hero.stats.strategy}</p>
            <p><strong>防御:</strong> {hero.stats.defense}</p>
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
    </div>
  );
};

export default HeroDetail;
