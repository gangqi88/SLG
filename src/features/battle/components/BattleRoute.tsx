import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BattleView from '@/features/battle/components/BattleView';
import { humanHeroes } from '@/features/hero/data/humanHeroes';
import { demonHeroes } from '@/features/hero/data/demonHeroes';
import { parseBattleMode } from '@/features/battle/types/battleMode';

const BattleRoute: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const attackerHeroes = humanHeroes.slice(0, 3);
  const defenderHeroes = demonHeroes.slice(0, 3);
  const battleMode = parseBattleMode(searchParams.get('mode'));

  return (
    <BattleView
      attackerHeroes={attackerHeroes}
      defenderHeroes={defenderHeroes}
      battleMode={battleMode}
      onExit={() => navigate('/')}
    />
  );
};

export default BattleRoute;
