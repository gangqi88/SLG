import React from 'react';
import { useNavigate } from 'react-router-dom';
import BattleView from '@/features/battle/components/BattleView';
import { humanHeroes } from '@/features/hero/data/humanHeroes';
import { demonHeroes } from '@/features/hero/data/demonHeroes';

const BattleRoute: React.FC = () => {
  const navigate = useNavigate();
  const attackerHeroes = humanHeroes.slice(0, 3);
  const defenderHeroes = demonHeroes.slice(0, 3);

  return (
    <BattleView
      attackerHeroes={attackerHeroes}
      defenderHeroes={defenderHeroes}
      onExit={() => navigate('/')}
    />
  );
};

export default BattleRoute;
