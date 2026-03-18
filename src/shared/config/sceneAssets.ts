import { IMAGE_GAME_ASSETS } from '@/shared/config/assets';

export type BackgroundTextureKey = 'bg_battle' | 'bg_city';

export interface OptionalSceneImageAsset {
  key: BackgroundTextureKey;
  url: string;
}

const isBackgroundTextureKey = (key: string): key is BackgroundTextureKey =>
  key === 'bg_battle' || key === 'bg_city';

export const OPTIONAL_BACKGROUND_IMAGE_ASSETS: OptionalSceneImageAsset[] = IMAGE_GAME_ASSETS.filter(
  (asset): asset is OptionalSceneImageAsset =>
    asset.optional && isBackgroundTextureKey(asset.key) && asset.feature === 'shared-background',
).map((asset) => ({
  key: asset.key,
  url: asset.url,
}));
