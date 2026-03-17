export type BackgroundTextureKey = 'bg_battle' | 'bg_city';

export interface OptionalSceneImageAsset {
  key: BackgroundTextureKey;
  url: string;
}

export const OPTIONAL_BACKGROUND_IMAGE_ASSETS: OptionalSceneImageAsset[] = [
  { key: 'bg_battle', url: '/assets/bg_battle.png' },
  { key: 'bg_city', url: '/assets/bg_city.png' },
];