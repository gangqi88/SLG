import React, { useState } from 'react';
import HeroList from '@/features/hero/components/HeroList';
import BattleView from '@/features/battle/components/BattleView';
import CityView from '@/features/city/components/CityView';
import TaskView from '@/features/task/components/TaskView';
import GachaView from '@/features/gacha/components/GachaView';
import LootBoxView from '@/features/gacha/components/LootBoxView';
import GatheringView from '@/features/resource/components/GatheringView';
import TowerDefenseView from '@/features/battle/components/TowerDefenseView';
import CookingView from '@/features/resource/components/CookingView';
import SiegeView from '@/features/battle/components/SiegeView';
import WalletConnect from '@/shared/components/WalletConnect';
import { humanHeroes } from '@/features/hero/data/humanHeroes';
import { demonHeroes } from '@/features/hero/data/demonHeroes';
import { WalletAccount } from '@/shared/utils/web3';

const App: React.FC = () => {
  const [view, setView] = useState<'heroList' | 'battle' | 'city' | 'tasks' | 'gacha' | 'gathering' | 'lootbox' | 'towerDefense' | 'cooking' | 'siege'>('heroList');
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
        <button onClick={() => setView('gathering')} style={view === 'gathering' ? { backgroundColor: '#555', borderColor: '#888' } : {}}>Gathering</button>
        <button onClick={() => setView('tasks')} style={view === 'tasks' ? { backgroundColor: '#555', borderColor: '#888' } : {}}>Tasks</button>
        <button onClick={() => setView('gacha')} style={view === 'gacha' ? { backgroundColor: '#555', borderColor: '#888' } : {}}>Gacha</button>
        <button onClick={() => setView('lootbox')} style={view === 'lootbox' ? { backgroundColor: '#555', borderColor: '#888' } : {}}>Loot Box</button>
        <button onClick={() => setView('towerDefense')} style={view === 'towerDefense' ? { backgroundColor: '#555', borderColor: '#888' } : {}}>Guard Qiao</button>
        <button onClick={() => setView('cooking')} style={view === 'cooking' ? { backgroundColor: '#555', borderColor: '#888' } : {}}>Chef Contest</button>
        <button onClick={() => setView('siege')} style={view === 'siege' ? { backgroundColor: '#555', borderColor: '#888' } : {}}>Siege War</button>
        <button onClick={() => setView('battle')} style={view === 'battle' ? { backgroundColor: '#555', borderColor: '#888' } : {}}>Test Battle</button>
      </div>

      {view === 'heroList' && <HeroList />}
      
      {view === 'city' && (
        <CityView onExit={() => setView('heroList')} />
      )}

      {view === 'gathering' && (
        <GatheringView onExit={() => setView('heroList')} />
      )}

      {view === 'tasks' && <TaskView />}
      
      {view === 'gacha' && <GachaView />}

      {view === 'lootbox' && <LootBoxView onExit={() => setView('heroList')} />}
      
      {view === 'towerDefense' && (
        <TowerDefenseView onExit={() => setView('heroList')} />
      )}

      {view === 'cooking' && (
        <CookingView onExit={() => setView('heroList')} />
      )}

      {view === 'siege' && (
        <SiegeView onExit={() => setView('heroList')} />
      )}
      
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
