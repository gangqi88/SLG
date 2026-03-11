import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import WalletConnect from '@/shared/components/WalletConnect';
import { WalletAccount } from '@/shared/utils/web3';

const Layout: React.FC = () => {
  const [wallet, setWallet] = useState<WalletAccount | null>(null);

  const getLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    backgroundColor: isActive ? '#555' : undefined,
    borderColor: isActive ? '#888' : undefined,
    color: 'white',
    textDecoration: 'none',
    padding: '8px 16px',
    border: '1px solid transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  });

  return (
    <div className="container">
      <WalletConnect 
        onConnect={(acc) => setWallet(acc)} 
        onDisconnect={() => setWallet(null)} 
      />

      <div style={{ padding: '10px', borderBottom: '1px solid #444', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <NavLink to="/" style={getLinkStyle} end>Hero List</NavLink>
        <NavLink to="/city" style={getLinkStyle}>City Management</NavLink>
        <NavLink to="/gathering" style={getLinkStyle}>Gathering</NavLink>
        <NavLink to="/tasks" style={getLinkStyle}>Tasks</NavLink>
        <NavLink to="/gacha" style={getLinkStyle}>Gacha</NavLink>
        <NavLink to="/lootbox" style={getLinkStyle}>Loot Box</NavLink>
        <NavLink to="/tower-defense" style={getLinkStyle}>Guard Qiao</NavLink>
        <NavLink to="/cooking" style={getLinkStyle}>Chef Contest</NavLink>
        <NavLink to="/siege" style={getLinkStyle}>Siege War</NavLink>
        <NavLink to="/battle" style={getLinkStyle}>Test Battle</NavLink>
      </div>

      <Outlet context={{ wallet }} />
    </div>
  );
};

export default Layout;
