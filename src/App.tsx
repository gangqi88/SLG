import React, { useState } from 'react';
import HeroList from './components/HeroList';
import BattleView from './components/BattleView';
import CityView from './components/CityView';
import TaskView from './components/TaskView';
import GachaView from './components/GachaView';
import WalletConnect from './components/WalletConnect';
import { humanHeroes } from './data/humanHeroes';
import { demonHeroes } from './data/demonHeroes';
import { WalletAccount } from './utils/web3';

const App: React.FC = () => {
  const [view, setView] = useState<'heroList' | 'battle' | 'city' | 'tasks' | 'gacha'>('heroList');
  const [wallet, setWallet] = useState<WalletAccount | null>(null);

  // Simple test data: 3 Human vs 3 Demon
  const attackerHeroes = humanHeroes.slice(0, 3);
  const defenderHeroes = demonHeroes.slice(0, 3);

  return (
    <div className="container">
      <WalletConnect 
        onConnect={(acc) => setWallet(acc)} 
        onDisconnect={() => setWallet(null)} 
      />

      <div style={{ padding: '10px', borderBottom: '1px solid #444', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setView('heroList')} style={view === 'heroList' ? { backgroundColor: '#555', borderColor: '#888' } : {}}>Hero List</button>
        <button onClick={() => setView('city')} style={view === 'city' ? { backgroundColor: '#555', borderColor: '#888' } : {}}>City Management</button>
        <button onClick={() => setView('tasks')} style={view === 'tasks' ? { backgroundColor: '#555', borderColor: '#888' } : {}}>Tasks</button>
        <button onClick={() => setView('gacha')} style={view === 'gacha' ? { backgroundColor: '#555', borderColor: '#888' } : {}}>Gacha</button>
        <button onClick={() => setView('battle')} style={view === 'battle' ? { backgroundColor: '#555', borderColor: '#888' } : {}}>Test Battle</button>
      </div>

      {view === 'heroList' && <HeroList />}
      
      {view === 'city' && (
        <CityView onExit={() => setView('heroList')} />
      )}

      {view === 'tasks' && <TaskView />}
      
      {view === 'gacha' && <GachaView />}
      
      {view === 'battle' && (
        <BattleView 
          attackerHeroes={attackerHeroes} 
          defenderHeroes={defenderHeroes} 
          onExit={() => setView('heroList')} 
        />
      )}
    </div>
  );
};

export default App;
