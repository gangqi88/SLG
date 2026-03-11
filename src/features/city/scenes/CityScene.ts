import Phaser from 'phaser';
import { CityManager } from '../logic/CityManager';
import { humanHeroes } from '@/features/hero/data/humanHeroes'; // Default to human heroes for now
import { ResourceType } from '@/features/resource/logic/ResourceManager';

export class CityScene extends Phaser.Scene {
  private cityManager!: CityManager;
  private resourceText!: Phaser.GameObjects.Text;
  private buildingContainer!: Phaser.GameObjects.Container;

  constructor() {
    super('CityScene');
  }

  init() {
    // In a real game, we would load saved data or pass user's heroes
    this.cityManager = new CityManager(humanHeroes);
  }

  create() {
    this.add
      .image(0, 0, 'bg_city')
      .setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height);

    // Resource UI
    this.resourceText = this.add.text(10, 10, '', {
      font: '16px Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
    });

    // Buildings
    this.buildingContainer = this.add.container(0, 0);
    this.createBuildingSprites();

    // Back Button
    const backBtn = this.add
      .text(this.scale.width - 100, 10, 'Back', {
        fill: '#0f0',
        backgroundColor: '#333',
        padding: { x: 5, y: 5 },
      })
      .setInteractive()
      .on('pointerdown', () => {
        // Switch back to React view or Main Menu
        // For now, maybe just stop scene?
        // We need a callback to App.tsx
        this.game.events.emit('exitCity');
      });
  }

  update(time: number, delta: number) {
    const dt = delta / 1000;
    this.cityManager.update(dt);
    this.updateResourceUI();
  }

  private updateResourceUI() {
    const r = this.cityManager.resourceManager;
    const text = `
      Wood: ${Math.floor(r.getResource(ResourceType.WOOD))} (+${Math.floor(r.getProduction(ResourceType.WOOD))}/h)
      Stone: ${Math.floor(r.getResource(ResourceType.STONE))} (+${Math.floor(r.getProduction(ResourceType.STONE))}/h)
      Food: ${Math.floor(r.getResource(ResourceType.FOOD))} (+${Math.floor(r.getProduction(ResourceType.FOOD))}/h)
      Coin: ${Math.floor(r.getResource(ResourceType.COIN))} (+${Math.floor(r.getProduction(ResourceType.COIN))}/h)
    `;
    this.resourceText.setText(text);
  }

  private createBuildingSprites() {
    this.buildingContainer.removeAll(true);

    this.cityManager.buildingManager.getBuildings().forEach((building) => {
      const x = building.position.x;
      const y = building.position.y;

      const container = this.add.container(x, y);

      // Building visual
      const rect = this.add.rectangle(0, 0, 80, 80, 0x666666);
      rect.setInteractive();
      rect.on('pointerdown', () => {
        this.handleBuildingClick(building.id);
      });

      // Label
      const label = this.add
        .text(0, -50, `${building.type} Lv.${building.level}`, {
          fontSize: '12px',
          color: '#fff',
          backgroundColor: '#000',
        })
        .setOrigin(0.5);

      container.add([rect, label]);
      this.buildingContainer.add(container);
    });
  }

  private handleBuildingClick(buildingId: string) {
    const building = this.cityManager.buildingManager.getBuilding(buildingId);
    if (!building) return;

    // Show upgrade dialog (simplified: just confirm)
    const cost = building.level * 100;
    const confirm = window.confirm(
      `Upgrade ${building.type} to Lv.${building.level + 1}?\nCost: ${cost} Wood, ${cost} Stone`,
    );

    if (confirm) {
      const success = this.cityManager.upgradeBuilding(buildingId);
      if (success) {
        alert('Upgrade Successful!');
        this.createBuildingSprites(); // Refresh UI
      } else {
        alert('Not enough resources!');
      }
    }
  }
}
