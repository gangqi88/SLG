import Phaser from 'phaser';

export interface EffectConfig {
  color: number;
  duration: number;
  type: 'flash' | 'projectile' | 'explosion' | 'beam';
}

export const SkillEffects: { [key: string]: EffectConfig } = {
  default: { color: 0xffffff, duration: 200, type: 'flash' },
  fire: { color: 0xff4500, duration: 500, type: 'explosion' },
  heal: { color: 0x00ff00, duration: 500, type: 'flash' },
  beam: { color: 0x00ffff, duration: 300, type: 'beam' },
};

export class EffectManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public playEffect(targetPos: { x: number, y: number }, sourcePos: { x: number, y: number }, skillId?: string) {
    // Determine effect type based on skillId or default
    // For now, simple mapping or random
    let config = SkillEffects.default;
    
    // Simple heuristic for demo
    if (skillId?.includes('fire') || skillId?.includes('burn')) config = SkillEffects.fire;
    if (skillId?.includes('heal')) config = SkillEffects.heal;
    if (skillId?.includes('beam') || skillId?.includes('laser')) config = SkillEffects.beam;

    switch (config.type) {
      case 'flash':
        this.playFlash(targetPos, config.color);
        break;
      case 'explosion':
        this.playExplosion(targetPos, config.color);
        break;
      case 'beam':
        this.playBeam(sourcePos, targetPos, config.color);
        break;
      case 'projectile':
        this.playProjectile(sourcePos, targetPos, config.color);
        break;
    }
  }

  public playFloatingText(x: number, y: number, text: string, color: string = '#fff') {
    const txt = this.scene.add.text(x, y - 20, text, {
      fontSize: '20px',
      color: color,
      stroke: '#000',
      strokeThickness: 2,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: txt,
      y: y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Power1',
      onComplete: () => {
        txt.destroy();
      }
    });
  }

  private playFlash(pos: { x: number, y: number }, color: number) {
    const circle = this.scene.add.circle(pos.x, pos.y, 40, color, 0.7);
    this.scene.tweens.add({
      targets: circle,
      scale: 1.5,
      alpha: 0,
      duration: 300,
      onComplete: () => circle.destroy()
    });
  }

  private playExplosion(pos: { x: number, y: number }, color: number) {
    const particles = this.scene.add.particles(pos.x, pos.y, 'particle_texture', {
      speed: { min: 50, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      lifespan: 500,
      gravityY: 0,
      quantity: 20,
      tint: color
    });
    
    // If texture not found, it might fail silently or show box. 
    // We should ensure a texture exists or use a shape.
    // For now, let's assume 'particle_texture' needs to be generated.
    
    this.scene.time.delayedCall(500, () => particles.destroy());
  }

  private playBeam(from: { x: number, y: number }, to: { x: number, y: number }, color: number) {
    const line = this.scene.add.line(0, 0, from.x, from.y, to.x, to.y, color).setOrigin(0);
    line.setLineWidth(5);
    
    this.scene.tweens.add({
      targets: line,
      alpha: 0,
      lineWidth: 0,
      duration: 300,
      onComplete: () => line.destroy()
    });
  }

  private playProjectile(from: { x: number, y: number }, to: { x: number, y: number }, color: number) {
    const ball = this.scene.add.circle(from.x, from.y, 5, color);
    this.scene.tweens.add({
      targets: ball,
      x: to.x,
      y: to.y,
      duration: 200,
      onComplete: () => {
        ball.destroy();
        this.playExplosion(to, color);
      }
    });
  }
}
