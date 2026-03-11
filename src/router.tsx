import React, { Suspense } from 'react';
import { createBrowserRouter, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import { humanHeroes } from '@/features/hero/data/humanHeroes';
import { demonHeroes } from '@/features/hero/data/demonHeroes';

// Lazy load components
const HeroList = React.lazy(() => import('@/features/hero/components/HeroList'));
const CityView = React.lazy(() => import('@/features/city/components/CityView'));
const GatheringView = React.lazy(() => import('@/features/resource/components/GatheringView'));
const TaskView = React.lazy(() => import('@/features/task/components/TaskView'));
const GachaView = React.lazy(() => import('@/features/gacha/components/GachaView'));
const LootBoxView = React.lazy(() => import('@/features/gacha/components/LootBoxView'));
const TowerDefenseView = React.lazy(() => import('@/features/battle/components/TowerDefenseView'));
const CookingView = React.lazy(() => import('@/features/resource/components/CookingView'));
const SiegeView = React.lazy(() => import('@/features/battle/components/SiegeView'));
const BattleView = React.lazy(() => import('@/features/battle/components/BattleView'));

// Wrapper to handle onExit
const WithExit = ({ Component, ...props }: { Component: React.ComponentType<any>, [key: string]: any }) => {
  const navigate = useNavigate();
  return <Component {...props} onExit={() => navigate('/')} />;
};

// Wrapper for BattleView to provide props
const BattleWrapper = () => {
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

const Loading = () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <HeroList />
          </Suspense>
        ),
      },
      {
        path: 'city',
        element: (
          <Suspense fallback={<Loading />}>
            <WithExit Component={CityView} />
          </Suspense>
        ),
      },
      {
        path: 'gathering',
        element: (
          <Suspense fallback={<Loading />}>
            <WithExit Component={GatheringView} />
          </Suspense>
        ),
      },
      {
        path: 'tasks',
        element: (
          <Suspense fallback={<Loading />}>
            <TaskView />
          </Suspense>
        ),
      },
      {
        path: 'gacha',
        element: (
          <Suspense fallback={<Loading />}>
            <GachaView />
          </Suspense>
        ),
      },
      {
        path: 'lootbox',
        element: (
          <Suspense fallback={<Loading />}>
            <WithExit Component={LootBoxView} />
          </Suspense>
        ),
      },
      {
        path: 'tower-defense',
        element: (
          <Suspense fallback={<Loading />}>
            <WithExit Component={TowerDefenseView} />
          </Suspense>
        ),
      },
      {
        path: 'cooking',
        element: (
          <Suspense fallback={<Loading />}>
            <WithExit Component={CookingView} />
          </Suspense>
        ),
      },
      {
        path: 'siege',
        element: (
          <Suspense fallback={<Loading />}>
            <WithExit Component={SiegeView} />
          </Suspense>
        ),
      },
      {
        path: 'battle',
        element: (
          <Suspense fallback={<Loading />}>
            <BattleWrapper />
          </Suspense>
        ),
      },
    ],
  },
]);
