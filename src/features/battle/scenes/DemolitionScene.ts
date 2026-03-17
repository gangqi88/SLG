import Phaser from 'phaser';
import { EventBus } from '@/shared/logic/EventBus';

export class DemolitionScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private rocks!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private gameOver: boolean = false;
  private spawnEvent!: Phaser.Time.TimerEvent;

  constructor() {
    super('DemolitionScene');
  }

  create() {
    this.gameOver = false;
    this.score = 0;

    // Background
    this.add.rectangle(0, 0, 800, 600, 0x333333).setOrigin(0);
    // Wall hint at top
    this.add.rectangle(400, 50, 800, 100, 0x555555).setOrigin(0.5);
    this.add
      .text(400, 50, 'THE WALL IS CRUMBLING!', { fontSize: '32px', color: '#aaaaaa' })
      .setOrigin(0.5);

    // Player
    this.player = this.physics.add
      .sprite(400, 550, 'hero_icon_0')
      .setTint(0x00ff00)
      .setCollideWorldBounds(true);

    // Rocks Group
    this.rocks = this.physics.add.group();

    // Input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    // UI
    this.scoreText = this.add.text(16, 16, 'Damage: 0', { fontSize: '32px', color: '#ffffff' });

    // Spawn Rocks
    this.spawnEvent = this.time.addEvent({
      delay: 500, // Spawn every 0.5s
      callback: this.spawnRock,
      callbackScope: this,
      loop: true,
    });

    // Score Timer
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.gameOver) {
          this.score += 10;
          this.scoreText.setText(`Damage: ${this.score}`);
        }
      },
      loop: true,
    });

    // Collision
    this.physics.add.overlap(this.player, this.rocks, this.hitRock, undefined, this);

    EventBus.emit('current-scene-ready', this);
  }

  update() {
    if (this.gameOver) return;

    // Player Movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // Cleanup rocks
    this.rocks.children.each((rock: any) => {
      if (rock.y > 600) {
        rock.destroy();
      }
      return true;
    });
  }

  private spawnRock() {
    const x = Phaser.Math.Between(50, 750);
    const rock = this.rocks.create(x, 100, 'hero_icon_0'); // Placeholder rock
    rock.setTint(0x888888);
    rock.setVelocityY(Phaser.Math.Between(200, 400));
    rock.setAngularVelocity(Phaser.Math.Between(-100, 100));
  }

  private hitRock(player: any, _rock: any) {
    this.physics.pause();
    player.setTint(0xff0000);
    this.gameOver = true;
    this.spawnEvent.remove();

    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    this.add.text(400, 250, 'KNOCKED OUT!', { fontSize: '48px', color: '#ff0000' }).setOrigin(0.5);
    this.add
      .text(400, 320, `Final Damage: ${this.score}`, { fontSize: '32px', color: '#ffffff' })
      .setOrigin(0.5);

    // In a real game, emit event "demolitionComplete" with score
    this.game.events.emit('demolitionComplete', this.score);
  }
}
