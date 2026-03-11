import Phaser from 'phaser';
import { EventBus } from '../EventBus';

export class SneakAttackScene extends Phaser.Scene {
  private score: number = 0;
  private timeLeft: number = 30;
  private scoreText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private spies: Phaser.GameObjects.Sprite[] = [];
  private spawnTimer!: Phaser.Time.TimerEvent;

  constructor() {
    super('SneakAttackScene');
  }

  create() {
    // Background
    this.add.rectangle(0, 0, 800, 600, 0x222222).setOrigin(0);
    this.add.grid(400, 300, 800, 600, 50, 50, 0x000000).setAlpha(0.2);
    
    // Instructions
    this.add.text(400, 300, 'FIND THE SPIES!', { fontSize: '48px', color: '#ff0000' })
      .setOrigin(0.5)
      .setAlpha(0.5);

    // UI
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', color: '#ffffff' });
    this.timeText = this.add.text(600, 16, 'Time: 30', { fontSize: '32px', color: '#ffffff' });

    // Spawn Timer
    this.spawnTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnSpy,
      callbackScope: this,
      loop: true
    });

    // Initial Spies
    for(let i=0; i<3; i++) this.spawnSpy();

    // Game Timer
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        this.timeText.setText(`Time: ${this.timeLeft}`);
        if (this.timeLeft <= 0) {
          this.gameOver();
        }
      },
      loop: true
    });

    EventBus.emit('current-scene-ready', this);
  }

  private spawnSpy() {
    if (this.timeLeft <= 0) return;

    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(100, 550);
    
    // Spy visual - simple red tinted sprite
    const spy = this.add.sprite(x, y, 'hero_icon_0') // Placeholder asset
      .setTint(0xff0000)
      .setInteractive()
      .setAlpha(0);

    // Fade in
    this.tweens.add({
      targets: spy,
      alpha: 1,
      duration: 500,
      yoyo: true,
      hold: 1500,
      onComplete: () => {
        if (spy.active) spy.destroy();
      }
    });

    spy.on('pointerdown', () => {
      this.catchSpy(spy);
    });

    this.spies.push(spy);
  }

  private catchSpy(spy: Phaser.GameObjects.Sprite) {
    if (!spy.active) return;

    this.score += 100;
    this.scoreText.setText(`Score: ${this.score}`);
    
    // Effect
    const text = this.add.text(spy.x, spy.y, '+100', { color: '#00ff00', fontSize: '24px' }).setOrigin(0.5);
    this.tweens.add({
      targets: text,
      y: spy.y - 50,
      alpha: 0,
      duration: 500,
      onComplete: () => text.destroy()
    });

    spy.destroy();
  }

  private gameOver() {
    this.scene.pause();
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    this.add.text(400, 250, 'MISSION COMPLETE', { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(400, 320, `Damage Dealt: ${this.score}`, { fontSize: '32px', color: '#00ff00' }).setOrigin(0.5);
    
    // Notify React
    // In a real implementation, we would pass this score back to the SiegeManager
    // For now, we just rely on the user manually exiting
  }
}
