import React from 'react';
import type { BattleReport } from '@/shared/logic/battleReport';

export const BattleReportView: React.FC<{ report: BattleReport }> = ({ report }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ color: 'var(--game-text-muted)', marginBottom: 6 }}>{report.title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {report.entries.map((e) => (
          <div
            key={e.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 12,
              border: '1px solid rgba(58,58,90,0.7)',
              background: 'rgba(0,0,0,0.16)',
            }}
          >
            <span style={{ color: 'var(--game-text-muted)' }}>{e.label}</span>
            <span
              style={{
                fontFamily: 'var(--game-font-mono)',
                color:
                  e.tone === 'good'
                    ? 'var(--game-btn-confirm)'
                    : e.tone === 'bad'
                      ? 'var(--game-btn-battle)'
                      : 'var(--game-text)',
              }}
            >
              {e.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
