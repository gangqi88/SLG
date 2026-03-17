import Phaser from 'phaser';

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
    // Load assets here
    // For now, we can use placeholders or generate textures

    // Backgrounds
    this.load.image('bg_battle', 'assets/bg_battle.png');
    this.load.image('bg_city', 'assets/bg_city.png');

    // Hero avatars (if any)
    // this.load.image('hero_1', 'assets/hero_1.png');

    // UI elements
    // this.load.image('btn_attack', 'assets/btn_attack.png');
  }

  create() {
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
