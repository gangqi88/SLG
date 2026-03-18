import React from 'react';

type Way = { key: string; title: string; desc: string; to?: string };

const ways: Way[] = [
  { key: 'checkin', title: '联盟签到', desc: '每日签到获取贡献', to: '/alliance' },
  { key: 'siege', title: '攻城战', desc: '参与攻城获取贡献（待细化）', to: '/siege' },
  { key: 'tasks', title: '任务', desc: '完成任务获取贡献（待接入联盟任务）', to: '/tasks' },
];

export const ContributionWaysContent: React.FC<{
  onGo: (to: string) => void;
  needAmount?: number;
  haveAmount?: number;
}> = ({ onGo, needAmount, haveAmount }) => {
  return <ContributionWaysContentInner onGo={onGo} needAmount={needAmount} haveAmount={haveAmount} />;
};

export const ContributionWaysContentInner: React.FC<{
  onGo: (to: string) => void;
  needAmount?: number;
  haveAmount?: number;
}> = ({ onGo, needAmount, haveAmount }) => {
  const need = typeof needAmount === 'number' ? Math.max(0, Math.floor(needAmount)) : null;
  const have = typeof haveAmount === 'number' ? Math.max(0, Math.floor(haveAmount)) : null;
  const deficit = need !== null && have !== null ? Math.max(0, need - have) : null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ color: 'var(--game-text-muted)' }}>
        贡献不足{deficit !== null ? `（缺少 ${deficit}）` : ''}。可通过以下途径获取：
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
              color: deficit > 0 ? 'var(--game-btn-battle)' : 'var(--game-title)',
            }}
          >
            {have}/{need}
          </span>
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
