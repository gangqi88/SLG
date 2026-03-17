import { describe, expect, it } from 'vitest';
import { GAME_ASSETS, getGameAssetsByFeatures } from '@/shared/config/assets';
import {
  DEFAULT_SCENE_ASSET_FEATURES,
  getBattleSceneAssetFeatures,
  getSceneAssetFeatures,
  getSceneAssetFeaturesByTarget,
} from '@/shared/config/assets/sceneAssetFeatures';

describe('assets config', () => {
  it('returns all assets when features are empty', () => {
    expect(getGameAssetsByFeatures().length).toBe(GAME_ASSETS.length);
    expect(getGameAssetsByFeatures([]).length).toBe(GAME_ASSETS.length);
  });

  it('filters assets by feature list', () => {
    const heroAssets = getGameAssetsByFeatures(['hero']);
    expect(heroAssets.length).toBeGreaterThan(0);
    expect(heroAssets.every((asset) => asset.feature === 'hero')).toBe(true);
  });

  it('supports trimmed multi-feature filters', () => {
    const assets = getGameAssetsByFeatures([' hero ', 'ui']);
    expect(assets.some((asset) => asset.feature === 'hero')).toBe(true);
    expect(assets.some((asset) => asset.feature === 'ui')).toBe(true);
  });

  it('maps scene to configured feature list', () => {
    expect(getSceneAssetFeatures('BattleScene')).toEqual(['shared-background', 'hero', 'ui']);
    expect(getSceneAssetFeaturesByTarget('CityScene')).toEqual(['shared-background', 'ui']);
  });

  it('maps battle mode to feature list', () => {
    expect(getBattleSceneAssetFeatures('pvp')).toEqual([
      'shared-background',
      'hero',
      'ui',
      'battle-pvp',
    ]);
    expect(getBattleSceneAssetFeatures('pve')).toContain('battle-pve');
    expect(getBattleSceneAssetFeatures('siege')).toContain('battle-siege');
  });

  it('falls back to default feature list for unknown scene', () => {
    expect(getSceneAssetFeaturesByTarget('UnknownScene')).toEqual(DEFAULT_SCENE_ASSET_FEATURES);
    expect(getSceneAssetFeaturesByTarget()).toEqual(DEFAULT_SCENE_ASSET_FEATURES);
  });
});
