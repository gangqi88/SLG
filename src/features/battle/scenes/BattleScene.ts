import Phaser from 'phaser';
import { BattleSystem } from '../logic/BattleSystem';
import { BattleUnit, BattleEvent } from '@/features/battle/types/BattleTypes';
import { Hero } from '@/features/hero/types/Hero';
import { VisualUnit } from '@/shared/visuals/VisualUnit';
import { EffectManager } from '@/shared/visuals/EffectManager';
import { PerformanceMonitor } from '@/shared/visuals/PerformanceMonitor';
import { accumulateStatsFromEvents, emptySideStats, type BattleResult } from '@/shared/logic/battleResult';

export class BattleScene extends Phaser.Scene {
  private battleSystem!: BattleSystem;
  private visualUnits: Map<string, VisualUnit> = new Map();
  private effectManager!: EffectManager;
  private performanceMonitor!: PerformanceMonitor;
  private battleLogText!: Phaser.GameObjects.Text;
  private isPaused: boolean = false;
  private battleId: string = '';
  private mode: string = '';
  private attackerNames: string[] = [];
  private defenderNames: string[] = [];
  private endEmitted: boolean = false;
  private sideByUnitId: Map<string, 'attacker' | 'defender'> = new Map();
  private stats = { attacker: emptySideStats(), defender: emptySideStats() };

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
    super('BattleScene');
  }

  init(data: { attackerHeroes: Hero[]; defenderHeroes: Hero[]; battleId?: string; battleMode?: string }) {
    this.battleSystem = new BattleSystem(data.attackerHeroes, data.defenderHeroes);
    this.battleId = data.battleId ?? '';
    this.mode = data.battleMode ?? 'battle';
    this.attackerNames = data.attackerHeroes.map((h) => h.name);
    this.defenderNames = data.defenderHeroes.map((h) => h.name);
    this.endEmitted = false;
    this.sideByUnitId = new Map();
    this.battleSystem.units.forEach((u) => this.sideByUnitId.set(u.uniqueId, u.side));
    this.stats = { attacker: emptySideStats(), defender: emptySideStats() };
  }

  create() {
    this.add
      .image(0, 0, 'bg_battle')
      .setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height);

    this.effectManager = new EffectManager(this);
    this.performanceMonitor = new PerformanceMonitor(this);

    // Create unit visuals
    this.battleSystem.units.forEach((unit) => {
      this.createVisualUnit(unit);
    });

    // UI for Battle Log
    this.battleLogText = this.add.text(10, this.scale.height - 150, 'Battle Start!', {
      font: '14px Arial',
      color: '#ffffff',
      wordWrap: { width: 300 },
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 5, y: 5 },
    });

    // Pause/Resume Button
    const pauseBtn = this.add
      .text(this.scale.width - 100, 10, 'Pause', {
        color: '#0f0',
        backgroundColor: '#333',
        padding: { x: 5, y: 5 },
      })
      .setInteractive()
      .on('pointerdown', () => {
        this.isPaused = !this.isPaused;
        pauseBtn.setText(this.isPaused ? 'Resume' : 'Pause');
      });

    // Exit Button
    this.add
      .text(this.scale.width - 100, 40, 'Exit', {
        color: '#f00',
        backgroundColor: '#333',
        padding: { x: 5, y: 5 },
      })
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

    const settings = this.getBattleSettings();
    this.battleSystem.setAutoSkillEnabled(settings.auto);
    this.consumeCommands();

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
      const dt = (delta / 1000) * settings.speed;

      // Update Logic
      this.battleSystem.update(dt);
      const cooldowns: Record<string, number> = {};
      this.battleSystem.units.forEach((u) => {
        if (u.side !== 'attacker' || u.isDead) return;
        const sid = u.activeSkill?.id;
        if (!sid) return;
        const cd = u.cooldowns[sid] || 0;
        cooldowns[u.id] = Math.max(0, cd);
      });
      this.registry.set('battleCooldowns', cooldowns);

      // Sync positions
      this.battleSystem.units.forEach((unit) => {
        const visual = this.visualUnits.get(unit.uniqueId);
        if (visual) {
          visual.container.setPosition(unit.x, unit.y);
        }
      });

      // Fetch new events
      const newEvents = this.battleSystem.getEvents();
      accumulateStatsFromEvents(this.stats, newEvents, this.sideByUnitId);
      this.eventQueue.push(...newEvents);

      const attackersAlive = this.battleSystem.units.some((u) => u.side === 'attacker' && !u.isDead);
      const defendersAlive = this.battleSystem.units.some((u) => u.side === 'defender' && !u.isDead);
      if ((!attackersAlive || !defendersAlive) && !this.endEmitted) {
        const winner = attackersAlive && !defendersAlive ? 'attacker' : !attackersAlive && defendersAlive ? 'defender' : 'draw';
        const result: BattleResult = {
          battleId: this.battleId,
          mode: this.mode,
          winner,
          durationSec: Math.round(this.battleSystem.currentTime * 10) / 10,
          attacker: { names: this.attackerNames },
          defender: { names: this.defenderNames },
          stats: this.stats,
        };
        this.endEmitted = true;
        this.isPaused = true;
        this.game.events.emit('battleEnd', result);
      }
    }
  }

  private createVisualUnit(unit: BattleUnit) {
    const x = unit.x;
    const y = unit.y;
    const color = unit.side === 'attacker' ? 0x0000ff : 0xff0000;

    const visualUnit = new VisualUnit(this, x, y, color, unit.name);
    // Flip defenders
    if (unit.side === 'defender') {
      visualUnit.container.setScale(-1, 1);
      // Fix text orientation
      const text = visualUnit.container.list.find(
        (obj) => obj instanceof Phaser.GameObjects.Text,
      ) as Phaser.GameObjects.Text;
      if (text) text.setScale(-1, 1);
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
      case 'combo':
        this.handleComboEvent(event);
        break;
      default:
        this.isProcessingEvent = false;
        break;
    }
  }

  private handleComboEvent(event: BattleEvent) {
    // Show Combo Text
    const textX = this.scale.width / 2;
    const textY = this.scale.height / 3;

    this.effectManager.playFloatingText(textX, textY, `COMBO: ${event.comboName}!`, '#ffff00');

    // Play effect on affected units
    if (event.affectedUnitIds) {
      event.affectedUnitIds.forEach((unitId) => {
        const visual = this.visualUnits.get(unitId);
        if (visual) {
          this.effectManager.playEffect(visual.getPosition(), visual.getPosition(), 'buff'); // Assuming 'buff' effect exists
          this.updateUnitHp(unitId);
          // Show "Combo!" text on unit
          this.effectManager.playFloatingText(
            visual.container.x,
            visual.container.y - 20,
            'Combo!',
            '#ffff00',
          );
        }
      });
    }

    // Delay next event slightly to let combo text show
    const settings = this.getBattleSettings();
    this.time.delayedCall(1000 / settings.speed, () => {
      this.isProcessingEvent = false;
    });
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
      const settings = this.getBattleSettings();
      this.time.delayedCall(150 / settings.speed, () => {
        target.playHit();
        this.effectManager.playFloatingText(
          target.container.x,
          target.container.y,
          `-${event.value}`,
          event.isCrit ? '#ff0000' : '#ffffff',
        );
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

      const settings = this.getBattleSettings();
      this.time.delayedCall(300 / settings.speed, () => {
        target.playHit();
        this.effectManager.playFloatingText(
          target.container.x,
          target.container.y,
          `-${event.value} (Skill)`,
          '#ff00ff',
        );
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

      const settings = this.getBattleSettings();
      this.time.delayedCall(200 / settings.speed, () => {
        this.effectManager.playFloatingText(
          target.container.x,
          target.container.y,
          `+${event.value}`,
          '#00ff00',
        );
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
    const unit = this.battleSystem.units.find((u) => u.uniqueId === unitId);
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
