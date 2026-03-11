import Phaser from 'phaser';

export class PerformanceMonitor {
  private scene: Phaser.Scene;
  private fpsText: Phaser.GameObjects.Text;
  private lastTime: number = 0;
  private frameCount: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.fpsText = scene.add
      .text(10, 10, 'FPS: 0', {
        font: '16px Arial',
        color: '#00ff00',
        backgroundColor: '#000000',
      })
      .setDepth(1000); // Ensure it's on top
  }

  public update(time: number, delta: number) {
    if (this.lastTime === 0) {
      this.lastTime = time;
      return;
    }

    this.frameCount++;
    if (time - this.lastTime >= 1000) {
      const fps = this.scene.game.loop.actualFps;
      this.fpsText.setText(`FPS: ${Math.round(fps)}`);
      this.lastTime = time;
      this.frameCount = 0;
    }
  }
}
