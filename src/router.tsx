/* eslint-disable react-refresh/only-export-components */

import React, { Suspense } from 'react';
import { createBrowserRouter, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';

// Lazy load components
const GameMain = React.lazy(() => import('@/features/main/components/GameMain'));
const HeroList = React.lazy(() => import('@/features/hero/components/HeroList'));
const CityView = React.lazy(() => import('@/features/city/components/CityView'));
const MainCityView = React.lazy(() => import('@/features/city/components/MainCityView'));
const GatheringView = React.lazy(() => import('@/features/resource/components/GatheringView'));
const TaskView = React.lazy(() => import('@/features/task/components/TaskView'));
const GachaView = React.lazy(() => import('@/features/gacha/components/GachaView'));
const LootBoxView = React.lazy(() => import('@/features/gacha/components/LootBoxView'));
const TowerDefenseView = React.lazy(() => import('@/features/battle/components/TowerDefenseView'));
const CookingView = React.lazy(() => import('@/features/resource/components/CookingView'));
const SiegeView = React.lazy(() => import('@/features/battle/components/SiegeView'));
const BattleRoute = React.lazy(() => import('@/features/battle/components/BattleRoute'));
const StyleGuide = React.lazy(() => import('@/shared/components/StyleGuide'));
const AllianceDashboard = React.lazy(
  () => import('@/features/alliance/components/AllianceDashboard'),
);

type ExitProps = {
  onExit: () => void;
};

// Wrapper to handle onExit
const WithExit = ({ Component }: { Component: React.ComponentType<ExitProps> }) => {
  const navigate = useNavigate();
  return <Component onExit={() => navigate('/')} />;
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
            <GameMain />
          </Suspense>
        ),
      },
      {
        path: 'heroes',
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
        path: 'main-city',
        element: (
          <Suspense fallback={<Loading />}>
            <MainCityView />
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
            <BattleRoute />
          </Suspense>
        ),
      },
      {
        path: 'alliance',
        element: (
          <Suspense fallback={<Loading />}>
            <AllianceDashboard />
          </Suspense>
        ),
      },
      {
        path: 'style-guide',
        element: (
          <Suspense fallback={<Loading />}>
            <StyleGuide />
          </Suspense>
        ),
      },
    ],
  },
]);
