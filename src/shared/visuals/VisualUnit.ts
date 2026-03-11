import Phaser from 'phaser';

export type AnimationState = 'idle' | 'move' | 'attack' | 'hit' | 'die';

export class VisualUnit {
  public container: Phaser.GameObjects.Container;
  public body: Phaser.GameObjects.Arc; // Main circle body
  public weapon: Phaser.GameObjects.Shape; // Weapon visual
  private scene: Phaser.Scene;
  private state: AnimationState = 'idle';
  private originalPos: { x: number; y: number };

  constructor(scene: Phaser.Scene, x: number, y: number, color: number, name: string) {
    this.scene = scene;
    this.originalPos = { x, y };

    this.container = scene.add.container(x, y);

    // Body
    this.body = scene.add.circle(0, 0, 30, color);

    // Weapon (Triangle for now)
    this.weapon = scene.add.triangle(35, 0, 0, -10, 20, 0, 0, 10, 0xcccccc);

    // Name
    const nameText = scene.add
      .text(0, -45, name, { fontSize: '12px', color: '#fff' })
      .setOrigin(0.5);

    // HP Bar Background
    const hpBg = scene.add.rectangle(0, 45, 60, 8, 0x000000);
    // HP Bar Foreground
    const hpFg = scene.add.rectangle(0, 45, 60, 8, 0x00ff00);
    hpFg.setName('hpBar');

    this.container.add([this.body, this.weapon, nameText, hpBg, hpFg]);
  }

  public playAttack(targetPos: { x: number; y: number }, onComplete?: () => void) {
    if (this.state === 'die') return;
    this.state = 'attack';

    const startX = this.container.x;
    const startY = this.container.y;

    // Lunge forward
    this.scene.tweens.add({
      targets: this.container,
      x: startX + (targetPos.x - startX) * 0.3,
      y: startY + (targetPos.y - startY) * 0.3,
      duration: 150,
      ease: 'Power1',
      yoyo: true,
      onYoyo: () => {
        // Attack swing effect
        this.playWeaponSwing();
      },
      onComplete: () => {
        this.state = 'idle';
        if (onComplete) onComplete();
      },
    });
  }

  private playWeaponSwing() {
    this.scene.tweens.add({
      targets: this.weapon,
      angle: 45,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        this.weapon.angle = 0;
      },
    });
  }

  public playHit() {
    if (this.state === 'die') return;
    this.state = 'hit';

    // Flash white
    this.scene.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 100,
      yoyo: true,
      onUpdate: (tween) => {
        const val = Math.floor(tween.getValue());
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.ValueToColor(0xffffff),
          Phaser.Display.Color.ValueToColor(this.body.fillColor),
          100,
          val,
        );
        this.body.setFillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      },
      onComplete: () => {
        this.state = 'idle';
      },
    });

    // Shake
    this.scene.tweens.add({
      targets: this.container,
      x: this.container.x + (Math.random() > 0.5 ? 5 : -5),
      duration: 50,
      yoyo: true,
      repeat: 2,
    });
  }

  public playDie(onComplete?: () => void) {
    this.state = 'die';
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scale: 0.5,
      duration: 500,
      onComplete: () => {
        this.container.visible = false;
        if (onComplete) onComplete();
      },
    });
  }

  public updateHp(current: number, max: number) {
    const hpBar = this.container.getByName('hpBar') as Phaser.GameObjects.Rectangle;
    if (hpBar) {
      const percent = Math.max(0, current / max);

      this.scene.tweens.add({
        targets: hpBar,
        width: 60 * percent,
        duration: 200,
        ease: 'Power2',
      });

      hpBar.fillColor = percent > 0.5 ? 0x00ff00 : percent > 0.2 ? 0xffff00 : 0xff0000;
    }
  }

  public getPosition() {
    return { x: this.container.x, y: this.container.y };
  }
}
