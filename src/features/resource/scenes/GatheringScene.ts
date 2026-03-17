import Phaser from 'phaser';
import InventoryManager from '@/features/resource/logic/InventoryManager';

export class GatheringScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private resources!: Phaser.Physics.Arcade.Group;
  private gatheredText!: Phaser.GameObjects.Text;
  private gatheredData: { [key: string]: number } = {
    grass: 0,
    wood: 0,
  };
  private isGathering: boolean = false;
  constructor() {
    super('GatheringScene');
  }

  create() {
    // Create background
    this.add.rectangle(0, 0, 800, 600, 0x87ceeb).setOrigin(0); // Sky blue background
    this.add.rectangle(0, 500, 800, 100, 0x228b22).setOrigin(0); // Green ground

    // Create player
    this.player = this.physics.add.sprite(100, 450, 'player');
    // If 'player' texture doesn't exist, create a placeholder
    if (!this.textures.exists('player')) {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0xff0000);
      graphics.fillRect(0, 0, 32, 32);
      graphics.generateTexture('player', 32, 32);
      graphics.destroy();
      this.player.setTexture('player');
    }

    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(500); // Simple gravity

    // Create resources
    this.resources = this.physics.add.group();
    this.createResourceNodes();

    // Collisions
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 550, 'ground').setScale(2).refreshBody(); // Invisible ground platform for physics
    // If 'ground' texture doesn't exist...
    if (!this.textures.exists('ground')) {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0x228b22);
      graphics.fillRect(0, 0, 400, 50); // 400x50, scaled x2 -> 800x100
      graphics.generateTexture('ground', 400, 50);
      graphics.destroy();
      // Re-create the platform with the new texture
      platforms.clear(true, true);
      platforms.create(400, 550, 'ground').setDisplaySize(800, 100).refreshBody();
    }

    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.resources, platforms);

    // Input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    // UI
    this.gatheredText = this.add.text(10, 10, 'Gathered: Grass: 0, Wood: 0', {
      fontSize: '16px',
      color: '#000000',
      backgroundColor: '#ffffff',
      padding: { x: 5, y: 5 },
    });

    // Instructions
    this.add.text(10, 40, 'Arrows to move, Space to gather', {
      fontSize: '14px',
      color: '#000000',
    });

    // Back Button
    this.add
      .text(this.scale.width - 100, 10, 'Back', {
        color: '#fff',
        backgroundColor: '#333',
        padding: { x: 5, y: 5 },
      })
      .setInteractive()
      .on('pointerdown', () => {
        this.game.events.emit('exitGathering');
      });
  }

  update() {
    if (this.isGathering) {
      this.player.setVelocityX(0);
      return;
    }

    const speed = 160;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.player.body?.touching.down) {
      this.player.setVelocityY(-330);
    }

    // Check for gathering interaction
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      this.tryGather();
    }
  }

  private createResourceNodes() {
    // Add some random resource nodes
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(100, 700);
      const type = Phaser.Math.Between(0, 1) === 0 ? 'grass' : 'tree';
      const color = type === 'grass' ? 0x00ff00 : 0x8b4513; // Bright Green or Saddle Brown

      const textureKey = `resource_${type}`;
      if (!this.textures.exists(textureKey)) {
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(color);
        if (type === 'grass') {
          graphics.fillCircle(10, 10, 10); // Simple circle for grass
          graphics.generateTexture(textureKey, 20, 20);
        } else {
          graphics.fillRect(0, 0, 20, 40); // Rect for tree
          graphics.generateTexture(textureKey, 20, 40);
        }
        graphics.destroy();
      }

      const node = this.resources.create(x, 480, textureKey);
      node.setData('type', type);
      node.setCollideWorldBounds(true);
      node.setDrag(1000); // Stop sliding
    }
  }

  private tryGather() {
    // Check overlap with resources
    let found = false;
    this.physics.overlap(this.player, this.resources, (_player, resource) => {
      if (found) return; // Only gather one at a time
      found = true;
      this.startGathering(resource as Phaser.Physics.Arcade.Sprite);
    });
  }

  private startGathering(resource: Phaser.Physics.Arcade.Sprite) {
    this.isGathering = true;
    const type = resource.getData('type');

    // Show gathering indicator
    const text = this.add
      .text(this.player.x, this.player.y - 50, 'Gathering...', {
        fontSize: '12px',
        color: '#000',
      })
      .setOrigin(0.5);

    this.time.delayedCall(1000, () => {
      // Success
      this.gatheredData[type === 'grass' ? 'grass' : 'wood']++;

      // Loot Box Logic (20% chance)
      if (Math.random() < 0.2) {
        InventoryManager.addItem('basic_lootbox', 1);
        // Show feedback
        const lootText = this.add
          .text(this.player.x, this.player.y - 80, '🎁 Found Loot Box!', {
            fontSize: '14px',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 2,
          })
          .setOrigin(0.5);

        this.tweens.add({
          targets: lootText,
          y: lootText.y - 50,
          alpha: 0,
          duration: 1500,
          onComplete: () => lootText.destroy(),
        });
      }

      this.updateUI();

      // Remove resource
      resource.destroy();

      // Cleanup
      text.destroy();
      this.isGathering = false;
    });
  }

  private updateUI() {
    this.gatheredText.setText(
      `Gathered: Grass: ${this.gatheredData.grass}, Wood: ${this.gatheredData.wood}`,
    );
  }
}
