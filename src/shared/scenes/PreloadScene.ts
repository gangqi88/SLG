import Phaser from 'phaser';
import { getGameAssetsByFeatures, type GameAsset } from '@/shared/config/assets';
import { getSceneAssetFeaturesByTarget } from '@/shared/config/assets/sceneAssetFeatures';

interface PreloadSceneData {
  targetScene?: string;
  sceneData?: unknown;
  assetFeatures?: string[];
}

export class PreloadScene extends Phaser.Scene {
  private startData: PreloadSceneData = {};

  constructor() {
    super('PreloadScene');
  }

  init(data: PreloadSceneData = {}) {
    this.startData = data;
    if (Object.keys(this.startData).length === 0) {
      const registryData = this.registry.get('startData');
      if (registryData && typeof registryData === 'object') {
        this.startData = registryData as PreloadSceneData;
      }
    }
  }

  preload() {
    /* TODO document why this method 'preload' is empty */
  }

  create() {
    void this.loadAssetsAndStart();
  }

  private async loadAssetsAndStart() {
    const scopedAssets = getGameAssetsByFeatures(this.resolveAssetFeatures());
    const requiredAssets = scopedAssets.filter((asset) => !asset.optional);
    const optionalAssets = scopedAssets.filter((asset) => asset.optional);
    await this.loadAssetBatch(requiredAssets, true);
    await this.loadAssetBatch(optionalAssets, false);
    this.ensureFallbackBackgrounds();
    this.startTargetScene();
  }

  private resolveAssetFeatures() {
    if (this.startData.assetFeatures && this.startData.assetFeatures.length > 0) {
      return this.startData.assetFeatures;
    }
    const fallbackFeatures = getSceneAssetFeaturesByTarget(this.startData.targetScene);
    if (import.meta.env.DEV) {
      console.warn(
        `[AssetLoader] 未传 assetFeatures，已按目标场景回退: ${this.startData.targetScene ?? 'default'}`,
      );
    }
    return fallbackFeatures;
  }

  private async loadAssetBatch(assets: GameAsset[], isRequired: boolean) {
    const availableAssets = await this.getAvailableAssets(assets, isRequired);
    if (availableAssets.length === 0) {
      return;
    }
    availableAssets.forEach((asset) => {
      if (asset.type === 'image') {
        this.load.image(asset.key, asset.url);
      }
      if (asset.type === 'audio') {
        this.load.audio(asset.key, asset.url);
      }
    });
    await new Promise<void>((resolve) => {
      this.load.once(Phaser.Loader.Events.COMPLETE, () => resolve());
      this.load.start();
    });
  }

  private ensureFallbackBackgrounds() {
    if (!this.textures.exists('bg_battle')) {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0x333333);
      graphics.fillRect(0, 0, 800, 600);
      graphics.generateTexture('bg_battle', 800, 600);
      graphics.destroy();
    }
    if (!this.textures.exists('bg_city')) {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0x004400);
      graphics.fillRect(0, 0, 800, 600);
      graphics.generateTexture('bg_city', 800, 600);
      graphics.destroy();
    }
  }

  private async getAvailableAssets(assets: GameAsset[], isRequired: boolean) {
    const checks = assets.map(async (asset) => {
      const exists = await this.assetExists(asset.url, asset.type);
      if (!exists) {
        this.reportMissingAsset(asset, isRequired);
      }
      return exists ? asset : null;
    });

    const results = await Promise.all(checks);
    return results.filter((asset): asset is GameAsset => asset !== null);
  }

  private reportMissingAsset(asset: GameAsset, isRequired: boolean) {
    if (import.meta.env.DEV) {
      if (isRequired) {
        console.error(`[AssetLoader] 必需素材缺失: ${asset.key} (${asset.url})`);
      } else {
        console.warn(`[AssetLoader] 可选素材缺失，已启用回退: ${asset.key} (${asset.url})`);
      }
      return;
    }
    if (isRequired) {
      console.error(`[AssetLoader] 必需素材缺失: ${asset.key}`);
    }
  }

  private async assetExists(url: string, type: GameAsset['type']) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type') ?? '';
      if (!response.ok) {
        return false;
      }
      if (type === 'image') {
        return contentType.startsWith('image/');
      }
      return contentType.startsWith('audio/');
    } catch {
      return false;
    }
  }

  private startTargetScene() {
    if (this.startData.targetScene) {
      const sceneData =
        this.startData.sceneData && typeof this.startData.sceneData === 'object'
          ? this.startData.sceneData
          : undefined;
      this.scene.start(this.startData.targetScene, sceneData);
    } else {
      this.scene.start('CityScene');
    }
  }
}
