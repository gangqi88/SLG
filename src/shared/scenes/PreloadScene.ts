import Phaser from 'phaser';
import {
  OPTIONAL_BACKGROUND_IMAGE_ASSETS,
  type OptionalSceneImageAsset,
} from '@/shared/config/sceneAssets';

interface PreloadSceneData {
  targetScene?: string;
  sceneData?: unknown;
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
    // Optional background images are loaded later only if they actually exist.
  }

  create() {
    void this.loadBackgroundAssetsAndStart();
  }

  private async loadBackgroundAssetsAndStart() {
    const availableAssets = await this.getAvailableBackgroundAssets();

    if (availableAssets.length > 0) {
      availableAssets.forEach((asset) => {
        this.load.image(asset.key, asset.url);
      });

      await new Promise<void>((resolve) => {
        this.load.once(Phaser.Loader.Events.COMPLETE, () => resolve());
        this.load.start();
      });
    }

    // Generate a simple background texture if image fails to load
    if (!this.textures.exists('bg_battle')) {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0x333333);
      graphics.fillRect(0, 0, 800, 600);
      graphics.generateTexture('bg_battle', 800, 600);
      graphics.destroy();
    }

    if (!this.textures.exists('bg_city')) {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0x004400); // Dark Green for City
      graphics.fillRect(0, 0, 800, 600);
      graphics.generateTexture('bg_city', 800, 600);
      graphics.destroy();
    }

    this.startTargetScene();
  }

  private async getAvailableBackgroundAssets() {
    const checks = OPTIONAL_BACKGROUND_IMAGE_ASSETS.map(async (asset) => {
      const exists = await this.assetExists(asset.url);
      return exists ? asset : null;
    });

    const results = await Promise.all(checks);
    return results.filter((asset): asset is OptionalSceneImageAsset => asset !== null);
  }

  private async assetExists(url: string) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type') ?? '';
      return response.ok && contentType.startsWith('image/');
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
      // Default behavior: Go to CityScene if no target specified
      this.scene.start('CityScene');
    }
  }
}
