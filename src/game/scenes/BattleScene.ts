import Phaser from 'phaser';
import { BattleSystem, BattleUnit, BattleEvent } from '../logic/BattleSystem';
import { Hero } from '../../types/Hero';
import { VisualUnit } from '../visuals/VisualUnit';
import { EffectManager } from '../visuals/EffectManager';
import { PerformanceMonitor } from '../visuals/PerformanceMonitor';

export class BattleScene extends Phaser.Scene {
  private battleSystem!: BattleSystem;
  private visualUnits: Map<string, VisualUnit> = new Map();
  private effectManager!: EffectManager;
  private performanceMonitor!: PerformanceMonitor;
  private battleLogText!: Phaser.GameObjects.Text;
  private isPaused: boolean = false;
  
  // Animation Queue
  private eventQueue: BattleEvent[] = [];
  private isProcessingEvent: boolean = false;

  constructor() {
    super('BattleScene');
  }

  init(data: { attackerHeroes: Hero[]; defenderHeroes: Hero[] }) {
    this.battleSystem = new BattleSystem(data.attackerHeroes, data.defenderHeroes);
  }

  create() {
    this.add.image(0, 0, 'bg_battle').setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);
    
    this.effectManager = new EffectManager(this);
    this.performanceMonitor = new PerformanceMonitor(this);

    // Create unit visuals
    this.battleSystem.units.forEach((unit, index) => {
      this.createVisualUnit(unit, index);
    });

    // UI for Battle Log
    this.battleLogText = this.add.text(10, this.scale.height - 150, 'Battle Start!', {
      font: '14px Arial',
      color: '#ffffff',
      wordWrap: { width: 300 },
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 5, y: 5 }
    });
    
    // Pause/Resume Button
    const pauseBtn = this.add.text(this.scale.width - 100, 10, 'Pause', { fill: '#0f0', backgroundColor: '#333', padding: { x: 5, y: 5 } })
      .setInteractive()
      .on('pointerdown', () => {
        this.isPaused = !this.isPaused;
        pauseBtn.setText(this.isPaused ? 'Resume' : 'Pause');
      });
      
    // Exit Button
    this.add.text(this.scale.width - 100, 40, 'Exit', { fill: '#f00', backgroundColor: '#333', padding: { x: 5, y: 5 } })
      .setInteractive()
      .on('pointerdown', () => {
        // Stop scene and notify app (via callback if possible, or event)
        // Since we don't have direct React callback here, we rely on App component handling unmount or we can dispatch a custom event on window
        // But for now, just pause
        this.isPaused = true;
        // In real app, we might use a global event bus or registry
      });
  }

  update(time: number, delta: number) {
    this.performanceMonitor.update(time, delta);
    
    if (this.isPaused) return;

    // Process Animation Queue
    if (this.isProcessingEvent) return; // Wait for current animation

    if (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.processBattleEvent(event);
      }
    } else {
      // If no animations pending, advance logic
      // Convert delta to seconds
      const dt = delta / 1000;
      
      // Update Logic
      this.battleSystem.update(dt);
      
      // Fetch new events
      const newEvents = this.battleSystem.getEvents();
      this.eventQueue.push(...newEvents);
    }
  }

  private createVisualUnit(unit: BattleUnit, index: number) {
    const x = unit.side === 'attacker' ? 200 : 600;
    const y = 150 + (index % 3) * 120; // 3 units per side
    const color = unit.side === 'attacker' ? 0x0000ff : 0xff0000;
    
    const visualUnit = new VisualUnit(this, x, y, color, unit.name);
    // Flip defenders
    if (unit.side === 'defender') {
      visualUnit.container.setScale(-1, 1);
      // Fix text orientation
      const text = visualUnit.container.list.find(obj => obj instanceof Phaser.GameObjects.Text) as Phaser.GameObjects.Text;
      if (text) text.setScale(-1, 1);
    }

    this.visualUnits.set(unit.uniqueId, visualUnit);
  }

  private processBattleEvent(event: BattleEvent) {
    this.isProcessingEvent = true;

    // Add log
    this.addLog(`[${event.timestamp.toFixed(1)}] ${event.type}: ${event.sourceId?.split('_')[2] || '?'} -> ${event.targetId?.split('_')[2] || '?'}`);

    switch (event.type) {
      case 'attack':
        this.handleAttackEvent(event);
        break;
      case 'skill':
        this.handleSkillEvent(event);
        break;
      case 'heal':
        this.handleHealEvent(event);
        break;
      case 'death':
        this.handleDeathEvent(event);
        break;
      default:
        this.isProcessingEvent = false;
        break;
    }
  }

  private handleAttackEvent(event: BattleEvent) {
    const source = this.visualUnits.get(event.sourceId!);
    const target = this.visualUnits.get(event.targetId!);

    if (source && target) {
      source.playAttack(target.getPosition(), () => {
        // Animation complete
        this.isProcessingEvent = false;
      });
      
      // Delay hit effect slightly to match animation impact
      this.time.delayedCall(150, () => {
        target.playHit();
        this.effectManager.playFloatingText(target.container.x, target.container.y, `-${event.value}`, event.isCrit ? '#ff0000' : '#ffffff');
        this.updateUnitHp(event.targetId!);
      });
    } else {
      this.isProcessingEvent = false;
    }
  }

  private handleSkillEvent(event: BattleEvent) {
    const source = this.visualUnits.get(event.sourceId!);
    const target = this.visualUnits.get(event.targetId!);

    if (source && target) {
      // Play skill animation (maybe cast time?)
      // For now, instant effect with delay
      this.effectManager.playEffect(target.getPosition(), source.getPosition(), event.skillId);
      
      this.time.delayedCall(300, () => {
        target.playHit();
        this.effectManager.playFloatingText(target.container.x, target.container.y, `-${event.value} (Skill)`, '#ff00ff');
        this.updateUnitHp(event.targetId!);
        this.isProcessingEvent = false;
      });
    } else {
      this.isProcessingEvent = false;
    }
  }

  private handleHealEvent(event: BattleEvent) {
    const source = this.visualUnits.get(event.sourceId!);
    const target = this.visualUnits.get(event.targetId!);

    if (source && target) {
      this.effectManager.playEffect(target.getPosition(), source.getPosition(), 'heal');
      
      this.time.delayedCall(200, () => {
        this.effectManager.playFloatingText(target.container.x, target.container.y, `+${event.value}`, '#00ff00');
        this.updateUnitHp(event.targetId!);
        this.isProcessingEvent = false;
      });
    } else {
      this.isProcessingEvent = false;
    }
  }

  private handleDeathEvent(event: BattleEvent) {
    const target = this.visualUnits.get(event.targetId!);
    if (target) {
      target.playDie(() => {
        this.isProcessingEvent = false;
      });
    } else {
      this.isProcessingEvent = false;
    }
  }

  private updateUnitHp(unitId: string) {
    const unit = this.battleSystem.units.find(u => u.uniqueId === unitId);
    const visual = this.visualUnits.get(unitId);
    if (unit && visual) {
      visual.updateHp(unit.currentHp, unit.maxHp);
    }
  }

  private addLog(message: string) {
    const currentText = this.battleLogText.text;
    const lines = currentText.split('\n');
    if (lines.length > 8) lines.shift();
    lines.push(message);
    this.battleLogText.setText(lines.join('\n'));
  }
}
