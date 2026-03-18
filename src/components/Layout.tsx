import React, { Suspense, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import type { WalletAccount } from '@/shared/utils/web3';

const WalletConnect = React.lazy(() => import('@/shared/components/WalletConnect'));

const Layout: React.FC = () => {
  const [wallet, setWallet] = useState<WalletAccount | null>(null);

  const getLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    backgroundColor: isActive ? '#555' : undefined,
    color: 'white',
    textDecoration: 'none',
    padding: '8px 16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: isActive ? '#888' : 'transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  });

  return (
    <div className="container">
      <Suspense
        fallback={
          <div
            style={{
              padding: '10px',
              backgroundColor: '#333',
              borderRadius: '8px',
              color: '#fff',
              marginBottom: '20px',
              minHeight: '58px',
            }}
          />
        }
      >
        <WalletConnect onConnect={(acc) => setWallet(acc)} onDisconnect={() => setWallet(null)} />
      </Suspense>

      <div
        style={{
          padding: '10px',
          borderBottom: '1px solid #444',
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <NavLink to="/" style={getLinkStyle} end>
          Game Main
        </NavLink>
        <NavLink to="/heroes" style={getLinkStyle}>
          Heroes
        </NavLink>
        <NavLink to="/alliance" style={getLinkStyle}>
          Alliance
        </NavLink>
        <NavLink to="/style-guide" style={getLinkStyle}>
          Style Guide
        </NavLink>
      </div>

      <Outlet context={{ wallet }} />
    </div>
  );
};

export default Layout;
