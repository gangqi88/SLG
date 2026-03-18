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
const BattleReportsView = React.lazy(() => import('@/features/battle/components/BattleReportsView'));
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
        handle: { titleKey: 'routeMain' },
        element: (
          <Suspense fallback={<Loading />}>
            <GameMain />
          </Suspense>
        ),
      },
      {
        path: 'heroes',
        handle: { titleKey: 'routeHeroes' },
        element: (
          <Suspense fallback={<Loading />}>
            <HeroList />
          </Suspense>
        ),
      },
      {
        path: 'city',
        handle: { titleKey: 'routeCityScene' },
        element: (
          <Suspense fallback={<Loading />}>
            <WithExit Component={CityView} />
          </Suspense>
        ),
      },
      {
        path: 'main-city',
        handle: { titleKey: 'routeMainCity' },
        element: (
          <Suspense fallback={<Loading />}>
            <MainCityView />
          </Suspense>
        ),
      },
      {
        path: 'gathering',
        handle: { titleKey: 'routeGathering' },
        element: (
          <Suspense fallback={<Loading />}>
            <WithExit Component={GatheringView} />
          </Suspense>
        ),
      },
      {
        path: 'tasks',
        handle: { titleKey: 'routeTasks' },
        element: (
          <Suspense fallback={<Loading />}>
            <TaskView />
          </Suspense>
        ),
      },
      {
        path: 'gacha',
        handle: { titleKey: 'routeGacha' },
        element: (
          <Suspense fallback={<Loading />}>
            <GachaView />
          </Suspense>
        ),
      },
      {
        path: 'lootbox',
        handle: { titleKey: 'routeLootbox' },
        element: (
          <Suspense fallback={<Loading />}>
            <WithExit Component={LootBoxView} />
          </Suspense>
        ),
      },
      {
        path: 'tower-defense',
        handle: { titleKey: 'routeTowerDefense' },
        element: (
          <Suspense fallback={<Loading />}>
            <WithExit Component={TowerDefenseView} />
          </Suspense>
        ),
      },
      {
        path: 'cooking',
        handle: { titleKey: 'routeCooking' },
        element: (
          <Suspense fallback={<Loading />}>
            <WithExit Component={CookingView} />
          </Suspense>
        ),
      },
      {
        path: 'siege',
        handle: { titleKey: 'routeSiege' },
        element: (
          <Suspense fallback={<Loading />}>
            <WithExit Component={SiegeView} />
          </Suspense>
        ),
      },
      {
        path: 'battle',
        handle: { titleKey: 'routeBattle' },
        element: (
          <Suspense fallback={<Loading />}>
            <BattleRoute />
          </Suspense>
        ),
      },
      {
        path: 'reports',
        handle: { titleKey: 'routeReports' },
        element: (
          <Suspense fallback={<Loading />}>
            <BattleReportsView />
          </Suspense>
        ),
      },
      {
        path: 'alliance',
        handle: { titleKey: 'routeAlliance' },
        element: (
          <Suspense fallback={<Loading />}>
            <AllianceDashboard />
          </Suspense>
        ),
      },
      {
        path: 'style-guide',
        handle: { titleKey: 'routeStyleGuide' },
        element: (
          <Suspense fallback={<Loading />}>
            <StyleGuide />
          </Suspense>
        ),
      },
    ],
  },
]);
