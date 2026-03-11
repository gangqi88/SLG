import React, { useState } from 'react';
import { GachaManager, GachaResult } from '@/features/gacha/logic/GachaManager';
import { Quality } from '@/features/hero/types/Hero';

const GachaView: React.FC = () => {
  // Singleton hack
  const [manager] = useState(() => (window as any)._gachaManager || ((window as any)._gachaManager = new GachaManager()));
  const [results, setResults] = useState<GachaResult[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const pools = manager.getPools();

  const handleDraw = async (poolId: string, count: number) => {
    if (isDrawing) return;
    setIsDrawing(true);
    setResults([]);

    // Simulate network/animation delay
    setTimeout(() => {
      try {
        const res = manager.draw(poolId, count);
        setResults(res);
      } catch (e) {
        alert(e);
      }
      setIsDrawing(false);
    }, 1000);
  };

  const getQualityColor = (q: Quality) => {
    if (q === Quality.RED) return '#ff4d4f';
    if (q === Quality.ORANGE) return '#fa8c16';
    return '#722ed1';
  };

  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      <h2>英雄召唤</h2>
      
      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
        {pools.map(pool => (
          <div key={pool.id} style={{ 
            minWidth: '300px', 
            backgroundColor: '#2a2a2a', 
            border: '1px solid #444', 
            borderRadius: '12px', 
            padding: '20px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 style={{ color: pool.type === 'Limited' ? '#ffd700' : '#fff' }}>{pool.name}</h3>
            <p style={{ fontSize: '0.9em', color: '#aaa', flex: 1 }}>{pool.description}</p>
            
            <div style={{ fontSize: '0.8em', marginBottom: '10px', backgroundColor: '#111', padding: '10px', borderRadius: '4px' }}>
              <strong>概率公示:</strong><br/>
              传说(Red): {(pool.rates[Quality.RED] * 100).toFixed(1)}%<br/>
              史诗(Orange): {(pool.rates[Quality.ORANGE] * 100).toFixed(1)}%<br/>
              精英(Purple): {(pool.rates[Quality.PURPLE] * 100).toFixed(1)}%<br/>
              <span style={{ color: '#aaa' }}>保底: {pool.pityLimit}抽必出史诗+</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => handleDraw(pool.id, 1)} 
                disabled={isDrawing}
                style={{ flex: 1 }}
              >
                单抽 ({pool.cost.amount})
              </button>
              <button 
                onClick={() => handleDraw(pool.id, 10)} 
                disabled={isDrawing}
                style={{ flex: 1, backgroundColor: '#d4af37', color: '#000' }}
              >
                十连 ({pool.cost.amount * 10})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Results Display */}
      {results.length > 0 && (
        <div className="animate-fade-in" style={{ marginTop: '20px' }}>
          <h3>召唤结果</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
            {results.map((res, idx) => (
              <div key={idx} className="animate-slide-in" style={{ 
                backgroundColor: '#333', 
                padding: '10px', 
                borderRadius: '8px', 
                border: `2px solid ${getQualityColor(res.hero.quality)}`,
                textAlign: 'center',
                animationDelay: `${idx * 0.1}s`
              }}>
                <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: getQualityColor(res.hero.quality) }}>
                  {res.hero.name}
                </div>
                <div style={{ fontSize: '0.8em', color: '#aaa' }}>{res.hero.quality}</div>
                {res.isNew && <div style={{ color: '#4caf50', fontSize: '0.8em', marginTop: '5px' }}>NEW!</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GachaView;
