import Phaser from 'phaser';
import { BattleSystem } from '../logic/BattleSystem';
import { BattleUnit, BattleEvent } from '@/features/battle/types/BattleTypes';
import { Hero, TroopType } from '@/features/hero/types/Hero';
import { VisualUnit } from '@/shared/visuals/VisualUnit';
import { EffectManager } from '@/shared/visuals/EffectManager';
import { PerformanceMonitor } from '@/shared/visuals/PerformanceMonitor';
import { WALL_HERO, STREET_FIGHT_DEFENDERS } from '@/features/hero/data/siegeHeroes';

export class SiegeBattleScene extends Phaser.Scene {
  private battleSystem!: BattleSystem;
  private visualUnits: Map<string, VisualUnit> = new Map();
  private effectManager!: EffectManager;
  private performanceMonitor!: PerformanceMonitor;
  private battleLogText!: Phaser.GameObjects.Text;
  private isPaused: boolean = false;
  private wallBroken: boolean = false;

  // Animation Queue
  private eventQueue: BattleEvent[] = [];
  private isProcessingEvent: boolean = false;
  private getBattleSettings() {
    const raw = this.registry.get('battleSettings') as { auto?: boolean; speed?: number } | undefined;
    const auto = raw?.auto ?? true;
    const speed = raw?.speed ?? 1;
    return { auto, speed: speed === 2 ? 2 : 1 };
  }

  private consumeCommands() {
    const cmds = (this.registry.get('battleCommands') as unknown) as
      | { type: 'cast'; heroId: string; side: 'attacker' | 'defender' }[]
      | undefined;
    if (!cmds || cmds.length === 0) return;
    this.registry.set('battleCommands', []);
    cmds.forEach((c) => {
      if (c.type === 'cast') {
        this.battleSystem.castActiveSkillByHeroId(c.heroId, c.side);
      }
    });
  }

  constructor() {
    super('SiegeBattleScene');
  }

  init(data: { attackerHeroes: Hero[] }) {
    // Phase 1: Attackers vs Wall
    this.battleSystem = new BattleSystem(data.attackerHeroes, [WALL_HERO]);
    this.wallBroken = false;
  }

  create() {
    this.add
      .image(0, 0, 'bg_battle')
      .setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height);

    // Add Siege Hint
    this.add
      .text(400, 50, 'PHASE 1: BREACH THE WALL', {
        fontSize: '32px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.effectManager = new EffectManager(this);
    this.performanceMonitor = new PerformanceMonitor(this);

    // Create unit visuals
    this.battleSystem.units.forEach((unit) => {
      this.createVisualUnit(unit);
    });

    // UI for Battle Log
    this.battleLogText = this.add.text(10, this.scale.height - 150, 'Siege Started!', {
      font: '14px Arial',
      color: '#ffffff',
      wordWrap: { width: 300 },
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 5, y: 5 },
    });

    // Exit Button
    this.add
      .text(this.scale.width - 100, 40, 'Retreat', {
        color: '#f00',
        backgroundColor: '#333',
        padding: { x: 5, y: 5 },
      })
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.stop();
        // Notify React via event? Or just stop.
      });
  }

  update(time: number, delta: number) {
    this.performanceMonitor.update(time, delta);

    if (this.isPaused) return;

    if (this.isProcessingEvent) return;

    const settings = this.getBattleSettings();
    this.battleSystem.setAutoSkillEnabled(settings.auto);
    this.consumeCommands();

    if (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.processBattleEvent(event);
      }
    } else {
      const dt = (delta / 1000) * settings.speed;
      this.battleSystem.update(dt);

      // Sync positions
      this.battleSystem.units.forEach((unit) => {
        const visual = this.visualUnits.get(unit.uniqueId);
        if (visual) {
          visual.container.setPosition(unit.x, unit.y);
          visual.updateHp(unit.currentHp, unit.maxHp);
        }
      });

      const newEvents = this.battleSystem.getEvents();
      this.eventQueue.push(...newEvents);

      // Check win condition
      const attackersAlive = this.battleSystem.units.some(
        (u) => u.side === 'attacker' && !u.isDead,
      );
      const defendersAlive = this.battleSystem.units.some(
        (u) => u.side === 'defender' && !u.isDead,
      );

      if (!attackersAlive) {
        this.add
          .text(400, 300, 'DEFEAT', { fontSize: '64px', color: '#ff0000', backgroundColor: '#000' })
          .setOrigin(0.5)
          .setDepth(100);
        this.isPaused = true;
      } else if (!defendersAlive) {
        this.add
          .text(400, 300, 'VICTORY!', {
            fontSize: '64px',
            color: '#00ff00',
            backgroundColor: '#000',
          })
          .setOrigin(0.5)
          .setDepth(100);
        this.add
          .text(400, 400, 'Rewards Claimed: Gold x1000, Wood x500', {
            fontSize: '24px',
            color: '#ffd700',
            backgroundColor: '#000',
          })
          .setOrigin(0.5)
          .setDepth(100);
        this.isPaused = true;
      }
    }
  }

  private createVisualUnit(unit: BattleUnit) {
    const x = unit.x;
    const y = unit.y;
    const color = unit.side === 'attacker' ? 0x0000ff : 0xff0000;

    // Special visual for Wall
    const name = unit.troopType === TroopType.STRUCTURE ? 'WALL' : unit.name;

    const visualUnit = new VisualUnit(this, x, y, color, name);
    if (unit.side === 'defender') {
      visualUnit.container.setScale(-1, 1);
      const text = visualUnit.container.list.find(
        (obj) => obj instanceof Phaser.GameObjects.Text,
      ) as Phaser.GameObjects.Text;
      if (text) text.setScale(-1, 1);
    }

    if (unit.troopType === TroopType.STRUCTURE) {
      // Make wall bigger
      visualUnit.container.setScale(2);
    }

    this.visualUnits.set(unit.uniqueId, visualUnit);
  }

  private processBattleEvent(event: BattleEvent) {
    this.isProcessingEvent = true;

    // Add log
    this.addLog(
      `[${event.timestamp.toFixed(1)}] ${event.type}: ${event.sourceId?.split('_')[2] || '?'} -> ${event.targetId?.split('_')[2] || '?'}`,
    );

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

  // Reuse handlers from BattleScene (simplified for brevity, assume similar implementation)
  private handleAttackEvent(event: BattleEvent) {
    const source = this.visualUnits.get(event.sourceId!);
    const target = this.visualUnits.get(event.targetId!);

    if (source && target) {
      source.playAttack(target.getPosition(), () => {
        this.isProcessingEvent = false;
      });

      const settings = this.getBattleSettings();
      this.time.delayedCall(150 / settings.speed, () => {
        target.playHit();
        this.effectManager.playFloatingText(
          target.container.x,
          target.container.y,
          `-${event.value}`,
          event.isCrit ? '#ff0000' : '#ffffff',
        );
      });
    } else {
      this.isProcessingEvent = false;
    }
  }

  private handleSkillEvent(_event: BattleEvent) {
    const event = _event;
    const source = this.visualUnits.get(event.sourceId!);
    const target = this.visualUnits.get(event.targetId!);

    if (source && target) {
      this.effectManager.playEffect(target.getPosition(), source.getPosition(), event.skillId || 'skill');
      const settings = this.getBattleSettings();
      this.time.delayedCall(240 / settings.speed, () => {
        target.playHit();
        this.effectManager.playFloatingText(
          target.container.x,
          target.container.y,
          `-${event.value} (Skill)`,
          '#ff00ff',
        );
        const unit = this.battleSystem.units.find((u) => u.uniqueId === event.targetId);
        if (unit) {
          const visual = this.visualUnits.get(unit.uniqueId);
          if (visual) visual.updateHp(unit.currentHp, unit.maxHp);
        }
        this.isProcessingEvent = false;
      });
    } else {
      this.isProcessingEvent = false;
    }
  }

  private handleHealEvent(_event: BattleEvent) {
    const event = _event;
    const source = this.visualUnits.get(event.sourceId!);
    const target = this.visualUnits.get(event.targetId!);

    if (source && target) {
      this.effectManager.playEffect(target.getPosition(), source.getPosition(), 'heal');
      const settings = this.getBattleSettings();
      this.time.delayedCall(180 / settings.speed, () => {
        this.effectManager.playFloatingText(
          target.container.x,
          target.container.y,
          `+${event.value}`,
          '#00ff00',
        );
        const unit = this.battleSystem.units.find((u) => u.uniqueId === event.targetId);
        if (unit) {
          const visual = this.visualUnits.get(unit.uniqueId);
          if (visual) visual.updateHp(unit.currentHp, unit.maxHp);
        }
        this.isProcessingEvent = false;
      });
    } else {
      this.isProcessingEvent = false;
    }
  }

  private handleDeathEvent(event: BattleEvent) {
    const targetUnit = this.battleSystem.units.find((u) => u.uniqueId === event.targetId);
    const visual = this.visualUnits.get(event.targetId!);

    if (visual) {
      visual.playDie(() => {
        this.isProcessingEvent = false;

        // Check if Wall died
        if (targetUnit && targetUnit.troopType === TroopType.STRUCTURE && !this.wallBroken) {
          this.triggerPhase2();
        }
      });
    } else {
      this.isProcessingEvent = false;
    }
  }

  private triggerPhase2() {
    this.wallBroken = true;
    this.add
      .text(400, 300, 'WALL BREACHED! STREET FIGHT BEGINS!', {
        fontSize: '48px',
        color: '#ff0000',
        stroke: '#fff',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Spawn Defenders
    STREET_FIGHT_DEFENDERS.forEach((hero) => {
      this.battleSystem.addUnit(hero, 'defender');
      // We need to find the newly added unit to create visual
      // The new unit is the last one in units array
      const newUnit = this.battleSystem.units[this.battleSystem.units.length - 1];
      this.createVisualUnit(newUnit);
    });

    // Attackers Plunder logic
    this.battleSystem.units.forEach((u) => {
      if (u.side === 'attacker' && !u.isDead) {
        this.effectManager.playFloatingText(u.x, u.y - 50, 'Looting...', '#ffd700');
      }
    });
  }

  private addLog(message: string) {
    const currentText = this.battleLogText.text;
    const lines = currentText.split('\n');
    if (lines.length > 8) lines.shift();
    lines.push(message);
    this.battleLogText.setText(lines.join('\n'));
  }
}
