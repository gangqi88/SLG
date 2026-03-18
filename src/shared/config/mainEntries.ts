import type { StringKey } from '@/shared/locale/strings';

export type MainEntryKey =
  | 'heroes'
  | 'main-city'
  | 'world'
  | 'gathering'
  | 'tasks'
  | 'gacha'
  | 'lootbox'
  | 'tower-defense'
  | 'cooking'
  | 'siege'
  | 'battle'
  | 'alliance';

export type MainEntryConfig = {
  key: MainEntryKey;
  titleKey: StringKey;
  path: string;
  iconUrl: string;
  locked?: boolean;
  unlockTip?: string;
  badgeKey?: 'taskClaimableCount' | 'lootBoxCount';
};

export const MAIN_ENTRIES: MainEntryConfig[] = [
  {
    key: 'heroes',
    titleKey: 'routeHeroes',
    path: '/heroes',
    iconUrl: '/game-assets/character/hero_avatar_demo.svg',
  },
  {
    key: 'main-city',
    titleKey: 'routeMainCity',
    path: '/main-city',
    iconUrl: '/game-assets/ui/ui_btn_primary.svg',
  },
  {
    key: 'world',
    titleKey: 'routeWorld',
    path: '/world',
    iconUrl: '/game-assets/ui/ui_badge_siege.svg',
    locked: true,
    unlockTip: '通关第 3 章解锁',
  },
  {
    key: 'gathering',
    titleKey: 'routeGathering',
    path: '/gathering',
    iconUrl: '/game-assets/ui/ui_badge_pve.svg',
  },
  {
    key: 'tasks',
    titleKey: 'routeTasks',
    path: '/tasks',
    iconUrl: '/game-assets/ui/ui_btn_primary.svg',
    badgeKey: 'taskClaimableCount',
  },
  {
    key: 'gacha',
    titleKey: 'routeGacha',
    path: '/gacha',
    iconUrl: '/game-assets/ui/ui_badge_pvp.svg',
  },
  {
    key: 'lootbox',
    titleKey: 'entryLootbox',
    path: '/lootbox',
    iconUrl: '/game-assets/ui/ui_btn_primary.svg',
    badgeKey: 'lootBoxCount',
  },
  {
    key: 'tower-defense',
    titleKey: 'routeTowerDefense',
    path: '/tower-defense',
    iconUrl: '/game-assets/ui/ui_badge_pve.svg',
  },
  {
    key: 'cooking',
    titleKey: 'routeCooking',
    path: '/cooking',
    iconUrl: '/game-assets/ui/ui_badge_pvp.svg',
  },
  {
    key: 'siege',
    titleKey: 'routeSiege',
    path: '/siege',
    iconUrl: '/game-assets/ui/ui_badge_siege.svg',
  },
  {
    key: 'battle',
    titleKey: 'entryBattleTrial',
    path: '/battle',
    iconUrl: '/game-assets/ui/ui_badge_pve.svg',
  },
  {
    key: 'alliance',
    titleKey: 'routeAlliance',
    path: '/alliance',
    iconUrl: '/game-assets/ui/ui_btn_primary.svg',
  },
];
