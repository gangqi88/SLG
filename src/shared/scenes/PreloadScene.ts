import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  private data: any;

  constructor() {
    super('PreloadScene');
  }

  init(data: any) {
    this.data = data;
    if (!this.data || Object.keys(this.data).length === 0) {
      this.data = this.registry.get('startData');
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
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0x333333);
      graphics.fillRect(0, 0, 800, 600);
      graphics.generateTexture('bg_battle', 800, 600);
    }

    if (!this.textures.exists('bg_city')) {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0x004400); // Dark Green for City
      graphics.fillRect(0, 0, 800, 600);
      graphics.generateTexture('bg_city', 800, 600);
    }

    if (this.data && this.data.targetScene) {
      this.scene.start(this.data.targetScene, this.data.sceneData);
    } else {
      // Default behavior: Go to CityScene if no target specified
      this.scene.start('CityScene');
    }
  }
}
