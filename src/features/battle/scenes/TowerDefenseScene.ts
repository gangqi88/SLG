import Phaser from 'phaser';

export class TowerDefenseScene extends Phaser.Scene {
  private hero!: Phaser.GameObjects.Container;
  private npc!: Phaser.GameObjects.Container;
  private enemies: Phaser.GameObjects.Container[] = [];
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  
  private lastFired: number = 0;
  private fireRate: number = 500; // ms
  private enemySpawnTimer: number = 0;
  private enemySpawnRate: number = 2000; // ms
  
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private npcHp: number = 100;
  private npcHpText!: Phaser.GameObjects.Text;
  
  private isGameOver: boolean = false;

  constructor() {
    super('TowerDefenseScene');
  }

  create() {
    // Background
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x333333).setOrigin(0);

    // Setup Physics
    this.enemyGroup = this.physics.add.group();
    this.projectiles = this.physics.add.group();

    // Create NPC (Qiao Sisters) - Center
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    
    this.npc = this.add.container(centerX, centerY);
    const npcBody = this.add.rectangle(0, 0, 40, 40, 0xff69b4); // Pink for Qiao Sisters
    const npcLabel = this.add.text(-20, -30, 'Qiao', { fontSize: '12px', color: '#fff' });
    this.npc.add([npcBody, npcLabel]);
    this.physics.add.existing(this.npc, true); // Static body

    // Create Hero
    this.hero = this.add.container(centerX, centerY + 50);
    const heroBody = this.add.rectangle(0, 0, 30, 30, 0x00ff00); // Green for Hero
    const heroLabel = this.add.text(-15, -25, 'Hero', { fontSize: '12px', color: '#fff' });
    this.hero.add([heroBody, heroLabel]);
    this.physics.add.existing(this.hero);
    (this.hero.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

    // Controls
    if (this.input.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // UI
    this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', color: '#fff' });
    this.npcHpText = this.add.text(centerX - 30, centerY - 40, `HP: ${this.npcHp}`, { fontSize: '16px', color: '#00ff00' });

    // Collisions
    this.physics.add.overlap(this.projectiles, this.enemyGroup, this.handleProjectileHitEnemy, undefined, this);
    this.physics.add.overlap(this.enemyGroup, this.npc, this.handleEnemyHitNpc, undefined, this);
  }

  update(time: number, delta: number) {
    if (this.isGameOver) return;

    // Hero Movement
    const speed = 200;
    const body = this.hero.body as Phaser.Physics.Arcade.Body;
    
    body.setVelocity(0);

    if (this.cursors.left.isDown) {
      body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      body.setVelocityY(speed);
    }

    // Hero Attack
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || (this.spaceKey.isDown && time > this.lastFired + this.fireRate)) {
      this.fireProjectile(time);
    }

    // Enemy Spawning
    this.enemySpawnTimer += delta;
    if (this.enemySpawnTimer > this.enemySpawnRate) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
      // Increase difficulty
      if (this.enemySpawnRate > 500) this.enemySpawnRate -= 20;
    }

    // Move Enemies towards NPC
    this.enemyGroup.children.iterate((enemy: any) => {
        if (enemy && enemy.active) {
            this.physics.moveToObject(enemy, this.npc, 100);
        }
        return true; // Keep iterating
    });
    
    // Cleanup projectiles
    this.projectiles.children.iterate((proj: any) => {
        if (proj && (proj.x < 0 || proj.x > this.scale.width || proj.y < 0 || proj.y > this.scale.height)) {
            proj.destroy();
        }
        return true;
    });
  }

  private fireProjectile(time: number) {
    this.lastFired = time;
    
    // Find nearest enemy to target
    let nearestEnemy: Phaser.GameObjects.Container | null = null;
    let minDist = Infinity;
    
    this.enemyGroup.children.iterate((enemy: any) => {
        if (enemy.active) {
            const dist = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, enemy.x, enemy.y);
            if (dist < minDist) {
                minDist = dist;
                nearestEnemy = enemy;
            }
        }
        return true;
    });

    const projectile = this.add.rectangle(this.hero.x, this.hero.y, 10, 10, 0xffff00);
    this.physics.add.existing(projectile);
    this.projectiles.add(projectile);
    
    const speed = 400;
    
    if (nearestEnemy) {
        this.physics.moveToObject(projectile, nearestEnemy, speed);
    } else {
        // Shoot in facing direction or default up
        // Simplified: shoot towards mouse or just up? Let's shoot towards closest edge or just random if no enemies.
        // Actually, let's shoot in the direction of movement, or Up if stationary.
        const body = this.hero.body as Phaser.Physics.Arcade.Body;
        if (body.velocity.length() > 0) {
             body.velocity.normalize().scale(speed);
             (projectile.body as Phaser.Physics.Arcade.Body).setVelocity(body.velocity.x, body.velocity.y);
        } else {
             (projectile.body as Phaser.Physics.Arcade.Body).setVelocity(0, -speed);
        }
    }
  }

  private spawnEnemy() {
    // Random edge position
    let x, y;
    const edge = Phaser.Math.Between(0, 3); // 0: top, 1: right, 2: bottom, 3: left
    
    switch(edge) {
        case 0: x = Phaser.Math.Between(0, this.scale.width); y = -20; break;
        case 1: x = this.scale.width + 20; y = Phaser.Math.Between(0, this.scale.height); break;
        case 2: x = Phaser.Math.Between(0, this.scale.width); y = this.scale.height + 20; break;
        case 3: x = -20; y = Phaser.Math.Between(0, this.scale.height); break;
        default: x = 0; y = 0;
    }

    const enemy = this.add.container(x, y);
    const enemyBody = this.add.rectangle(0, 0, 25, 25, 0xff0000);
    enemy.add(enemyBody);
    this.physics.add.existing(enemy);
    this.enemyGroup.add(enemy);
  }

  private handleProjectileHitEnemy(projectile: any, enemy: any) {
    projectile.destroy();
    enemy.destroy();
    
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  private handleEnemyHitNpc(enemy: any, npc: any) {
    enemy.destroy();
    
    this.npcHp -= 10;
    this.npcHpText.setText(`HP: ${this.npcHp}`);
    if (this.npcHp <= 30) this.npcHpText.setColor('#ff0000');
    
    if (this.npcHp <= 0) {
        this.gameOver();
    }
  }

  private gameOver() {
    this.isGameOver = true;
    this.physics.pause();
    this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', { fontSize: '40px', color: '#ff0000', backgroundColor: '#000' }).setOrigin(0.5);
    
    // Add restart button logic if needed, or just let user exit
  }
}
