import backgroundManifest from './manifests/background.json';
import characterManifest from './manifests/character.json';
import uiAudioManifest from './manifests/ui-audio.json';

export const GAME_ASSET_TYPES = ['image', 'audio'] as const;

export type GameAssetType = (typeof GAME_ASSET_TYPES)[number];

export interface GameAsset {
  key: string;
  url: string;
  type: GameAssetType;
  feature: string;
  optional: boolean;
}

type RawGameAsset = {
  key: unknown;
  url: unknown;
  type: unknown;
  feature: unknown;
  optional: unknown;
};

const GAME_ASSET_TYPE_SET = new Set<string>(GAME_ASSET_TYPES);

const isGameAssetType = (value: string): value is GameAssetType => GAME_ASSET_TYPE_SET.has(value);

const toGameAsset = (item: RawGameAsset): GameAsset => {
  const key = typeof item.key === 'string' ? item.key.trim() : '';
  const url = typeof item.url === 'string' ? item.url.trim() : '';
  const type = typeof item.type === 'string' ? item.type.trim() : '';
  const feature = typeof item.feature === 'string' ? item.feature.trim() : '';
  const optional = typeof item.optional === 'boolean' ? item.optional : null;

  if (!key) {
    throw new Error('Invalid game asset: key is required.');
  }
  if (!url?.startsWith('/')) {
    throw new Error(`Invalid game asset "${key}": url must start with "/".`);
  }
  if (!isGameAssetType(type)) {
    throw new Error(`Invalid game asset "${key}": unsupported type "${type}".`);
  }
  if (!feature) {
    throw new Error(`Invalid game asset "${key}": feature is required.`);
  }
  if (optional === null) {
    throw new Error(`Invalid game asset "${key}": optional must be boolean.`);
  }

  return {
    key,
    url,
    type,
    feature,
    optional,
  };
};

const rawManifest = [
  ...backgroundManifest,
  ...characterManifest,
  ...uiAudioManifest,
] as RawGameAsset[];

export const GAME_ASSETS: GameAsset[] = rawManifest.map(toGameAsset);

export type ImageGameAsset = GameAsset & { type: 'image' };

export const IMAGE_GAME_ASSETS: ImageGameAsset[] = GAME_ASSETS.filter(
  (asset): asset is ImageGameAsset => asset.type === 'image',
);

export type AudioGameAsset = GameAsset & { type: 'audio' };

export const AUDIO_GAME_ASSETS: AudioGameAsset[] = GAME_ASSETS.filter(
  (asset): asset is AudioGameAsset => asset.type === 'audio',
);

export const getGameAssetsByFeatures = (features?: string[]) => {
  if (!features || features.length === 0) {
    return GAME_ASSETS;
  }
  const featureSet = new Set(features.map((feature) => feature.trim()).filter(Boolean));
  if (featureSet.size === 0) {
    return GAME_ASSETS;
  }
  return GAME_ASSETS.filter((asset) => featureSet.has(asset.feature));
};
