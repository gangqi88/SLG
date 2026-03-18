import React from 'react';

const StyleGuide: React.FC = () => {
  return (
    <div style={{ padding: 'var(--spacing-32)', fontFamily: 'var(--font-family)' }}>
      <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-32)' }}>
        Style Guide
      </h1>

      <section style={{ marginBottom: 'var(--spacing-48)' }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-16)' }}>
          Game UI Tokens
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 'var(--spacing-16)',
          }}
        >
          {[
            { name: 'Game Background', var: '--game-bg' },
            { name: 'Panel', var: '--game-panel' },
            { name: 'Border', var: '--game-border' },
            { name: 'Title Gold', var: '--game-title' },
            { name: 'Text', var: '--game-text' },
            { name: 'Text Muted', var: '--game-text-muted' },
            { name: 'Button Confirm', var: '--game-btn-confirm' },
            { name: 'Button Reward', var: '--game-btn-reward' },
            { name: 'Button Battle', var: '--game-btn-battle' },
            { name: 'Button Info', var: '--game-btn-info' },
            { name: 'Quality Green', var: '--game-quality-green' },
            { name: 'Quality Blue', var: '--game-quality-blue' },
            { name: 'Quality Purple', var: '--game-quality-purple' },
            { name: 'Quality Orange', var: '--game-quality-orange' },
            { name: 'Quality Red', var: '--game-quality-red' },
          ].map((token) => (
            <div
              key={token.var}
              style={{
                border: '1px solid var(--game-border)',
                borderRadius: 'var(--game-radius-panel)',
                overflow: 'hidden',
                background: 'var(--game-panel)',
              }}
            >
              <div style={{ height: 88, backgroundColor: `var(${token.var})` }} />
              <div style={{ padding: 'var(--spacing-8)', color: 'var(--game-text)' }}>
                <strong>{token.name}</strong>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--game-text-muted)' }}>
                  var({token.var})
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'var(--spacing-24)' }}>
          <div style={{ color: 'var(--game-title)', fontSize: 'var(--game-font-title-xl)' }}>
            大标题（Title XL）
          </div>
          <div style={{ color: 'var(--game-text)', fontSize: 'var(--game-font-title-md)' }}>
            模块标题（Title MD）
          </div>
          <div style={{ color: 'var(--game-text)', fontSize: 'var(--game-font-body)' }}>
            正文（Body）
          </div>
          <div style={{ color: 'var(--game-text-muted)', fontSize: 'var(--game-font-caption)' }}>
            辅助小字（Caption）
          </div>
          <div
            style={{
              color: 'var(--game-text)',
              fontFamily: 'var(--game-font-mono)',
              fontSize: 'var(--game-font-body-sm)',
            }}
          >
            数字属性（Monospace）：123,456
          </div>
        </div>
      </section>

      {/* Colors Section */}
      <section style={{ marginBottom: 'var(--spacing-48)' }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-16)' }}>
          Colors
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 'var(--spacing-16)',
          }}
        >
          {[
            { name: 'Primary', var: '--color-primary' },
            { name: 'Secondary', var: '--color-secondary' },
            { name: 'Background', var: '--color-background' },
            { name: 'Text', var: '--color-text' },
            { name: 'Success', var: '--color-success' },
            { name: 'Error', var: '--color-error' },
          ].map((color) => (
            <div
              key={color.name}
              style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}
            >
              <div
                style={{
                  height: '100px',
                  backgroundColor: `var(${color.var})`,
                }}
              />
              <div style={{ padding: 'var(--spacing-8)' }}>
                <strong>{color.name}</strong>
                <div style={{ fontSize: 'var(--font-size-sm)', color: '#666' }}>
                  var({color.var})
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Spacing Section */}
      <section style={{ marginBottom: 'var(--spacing-48)' }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-16)' }}>
          Spacing
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)' }}>
          {[4, 8, 16, 24, 32, 48, 64].map((size) => (
            <div key={size} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: `var(--spacing-${size})`,
                  height: '20px',
                  backgroundColor: 'var(--color-primary)',
                  marginRight: 'var(--spacing-16)',
                }}
              />
              <span>
                --spacing-{size} ({size}px)
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Typography Section */}
      <section>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-16)' }}>
          Typography
        </h2>
        <div>
          <p style={{ fontSize: 'var(--font-size-3xl)' }}>Heading 1 (3xl)</p>
          <p style={{ fontSize: 'var(--font-size-2xl)' }}>Heading 2 (2xl)</p>
          <p style={{ fontSize: 'var(--font-size-xl)' }}>Heading 3 (xl)</p>
          <p style={{ fontSize: 'var(--font-size-lg)' }}>Large Text (lg)</p>
          <p style={{ fontSize: 'var(--font-size-base)' }}>Base Text (base)</p>
          <p style={{ fontSize: 'var(--font-size-sm)' }}>Small Text (sm)</p>
        </div>
      </section>
    </div>
  );
};

export default StyleGuide;
