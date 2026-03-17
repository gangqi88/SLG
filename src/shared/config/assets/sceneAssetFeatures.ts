export const SCENE_ASSET_FEATURES = {
  CityScene: ['shared-background', 'ui'],
  GatheringScene: ['shared-background', 'hero', 'ui'],
  CookingScene: ['shared-background', 'ui'],
  BattleScene: ['shared-background', 'hero', 'ui'],
} as const;

export const BATTLE_MODE_ASSET_FEATURES = {
  pvp: ['shared-background', 'hero', 'ui', 'battle-pvp'],
  pve: ['shared-background', 'hero', 'ui', 'battle-pve'],
  siege: ['shared-background', 'hero', 'ui', 'battle-siege'],
} as const;

export type SceneAssetFeatureScene = keyof typeof SCENE_ASSET_FEATURES;
export type BattleAssetMode = keyof typeof BATTLE_MODE_ASSET_FEATURES;
export const DEFAULT_SCENE_ASSET_FEATURES = ['shared-background'];

export const isSceneAssetFeatureScene = (scene: string): scene is SceneAssetFeatureScene =>
  scene in SCENE_ASSET_FEATURES;

export const getSceneAssetFeatures = (scene: SceneAssetFeatureScene): string[] => [
  ...SCENE_ASSET_FEATURES[scene],
];

export const getBattleSceneAssetFeatures = (mode: BattleAssetMode): string[] => [
  ...BATTLE_MODE_ASSET_FEATURES[mode],
];

export const getSceneAssetFeaturesByTarget = (targetScene?: string): string[] => {
  if (targetScene && isSceneAssetFeatureScene(targetScene)) {
    return getSceneAssetFeatures(targetScene);
  }
  return [...DEFAULT_SCENE_ASSET_FEATURES];
};
