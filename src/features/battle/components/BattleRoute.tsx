import React, { useMemo, useSyncExternalStore } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BattleView from '@/features/battle/components/BattleView';
import { demonHeroes } from '@/features/hero/data/demonHeroes';
import { parseBattleMode } from '@/features/battle/types/battleMode';
import { Team, getTeamHeroes } from '@/shared/logic/Team';

const BattleRoute: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defenderHeroes = useMemo(() => demonHeroes.slice(0, 3), []);
  const battleMode = parseBattleMode(searchParams.get('mode'));
  const team = useSyncExternalStore(
    (listener) => Team.subscribe(listener),
    () => Team.getSnapshot(),
  );
  const attackerHeroes = useMemo(() => getTeamHeroes(team.heroIds).slice(0, 3), [team.heroIds]);

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
