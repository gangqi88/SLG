import { Hero, HeroStats, Skill } from '../../types/Hero';
import { calculateNormalDamage, calculateSkillDamage, calculateHealing } from './CombatFormulas';
import { BondManager } from './BondManager';

export interface BattleUnit extends Hero {
  uniqueId: string; // Runtime unique ID (e.g., heroId_1)
  currentHp: number;
  maxHp: number;
  currentStats: HeroStats; // Stats after buffs/debuffs
  cooldowns: { [skillId: string]: number }; // Remaining cooldown in seconds
  buffs: Buff[];
  isDead: boolean;
  side: 'attacker' | 'defender';
  target?: string; // ID of current target
}

export interface Buff {
  id: string;
  name: string;
  duration: number; // Seconds remaining
  effect: (unit: BattleUnit) => void;
  onRemove?: (unit: BattleUnit) => void;
}

export interface BattleLog {
  timestamp: number;
  sourceId: string;
  targetId?: string;
  action: 'attack' | 'skill' | 'heal' | 'buff' | 'death';
  value?: number;
  message: string;
  isCrit?: boolean;
}

export interface BattleEvent {
  type: 'attack' | 'skill' | 'heal' | 'death';
  sourceId?: string;
  targetId?: string;
  skillId?: string;
  value?: number;
  isCrit?: boolean;
  timestamp: number;
}

export class BattleSystem {
  units: BattleUnit[] = [];
  logs: BattleLog[] = [];
  eventQueue: BattleEvent[] = [];
  currentTime: number = 0; // In seconds
  
  constructor(attackerHeroes: Hero[], defenderHeroes: Hero[]) {
    this.initializeUnits(attackerHeroes, 'attacker');
    this.initializeUnits(defenderHeroes, 'defender');
  }

  // ... rest of the file ...
  private emitEvent(event: BattleEvent) {
    this.eventQueue.push(event);
  }

  public getEvents(): BattleEvent[] {
    const events = [...this.eventQueue];
    this.eventQueue = [];
    return events;
  }


  private initializeUnits(heroes: Hero[], side: 'attacker' | 'defender') {
    const sideUnits: BattleUnit[] = [];
    
    heroes.forEach((hero, index) => {
      // Calculate HP based on Command (Troop Count) * 10 or similar base
      // Document says Command = Troop Limit. Let's say 1 Command = 100 HP for now.
      const maxHp = hero.stats.command * 100;
      
      const unit: BattleUnit = {
        ...hero,
        uniqueId: `${side}_${index}_${hero.id}`,
        currentHp: maxHp,
        maxHp: maxHp,
        currentStats: { ...hero.stats },
        cooldowns: {},
        buffs: [],
        isDead: false,
        side
      };
      
      this.units.push(unit);
      sideUnits.push(unit);
    });

    // Check and apply bonds
    const activeBonds = BondManager.getActiveBonds(heroes);
    BondManager.applyBondEffects(sideUnits, activeBonds);
  }

  // Find a target for a unit (simple logic: random living enemy)
  private findTarget(unit: BattleUnit): BattleUnit | undefined {
    const enemies = this.units.filter(u => u.side !== unit.side && !u.isDead);
    if (enemies.length === 0) return undefined;
    // Prioritize front row? Or random?
    // Let's pick random for now.
    return enemies[Math.floor(Math.random() * enemies.length)];
  }

  public update(deltaTime: number) {
    this.currentTime += deltaTime;

    // Check win condition
    const attackersAlive = this.units.some(u => u.side === 'attacker' && !u.isDead);
    const defendersAlive = this.units.some(u => u.side === 'defender' && !u.isDead);
    
    if (!attackersAlive || !defendersAlive) return;

    this.units.forEach(unit => {
      if (unit.isDead) return;

      // Update cooldowns
      Object.keys(unit.cooldowns).forEach(skillId => {
        unit.cooldowns[skillId] = Math.max(0, unit.cooldowns[skillId] - deltaTime);
      });

      // Update buffs
      unit.buffs.forEach(buff => {
        buff.duration -= deltaTime;
        // Apply continuous effects here if any
      });
      // Remove expired buffs
      unit.buffs = unit.buffs.filter(buff => buff.duration > 0);

      // AI Logic:
      // 1. Try to use Active Skill
      // 2. Else Normal Attack (with attack speed interval, simplified to 1s for now)
      
      // Check Active Skill
      const activeSkill = unit.activeSkill;
      if (activeSkill.cooldown && (unit.cooldowns[activeSkill.id] || 0) <= 0) {
        this.useSkill(unit, activeSkill);
        unit.cooldowns[activeSkill.id] = activeSkill.cooldown;
      } else {
        // Normal Attack (every 1 second approx)
        // We can use a simple timer or just check roughly
        // Let's assume this update is called every frame, we need an attack timer per unit.
        // For simplicity, let's say 5% chance per tick (if 20 ticks/sec = 1 atk/sec)
        // Or better, add 'attackTimer' to unit.
        // Let's just use random chance for MVP to simulate attack speed.
        if (Math.random() < deltaTime) { // If deltaTime is 1.0 (1 sec), 100% chance.
           this.performNormalAttack(unit);
        }
      }
    });
  }

  private performNormalAttack(attacker: BattleUnit) {
    const target = this.findTarget(attacker);
    if (!target) return;

    const result = calculateNormalDamage(
      attacker.currentStats,
      attacker.race,
      target.currentStats,
      target.race
    );

    this.applyDamage(target, result.damage);
    
    this.emitEvent({
      type: 'attack',
      sourceId: attacker.uniqueId,
      targetId: target.uniqueId,
      value: result.damage,
      isCrit: result.isCrit,
      timestamp: this.currentTime
    });

    this.logs.push({
      timestamp: this.currentTime,
      sourceId: attacker.uniqueId,
      targetId: target.uniqueId,
      action: 'attack',
      value: result.damage,
      isCrit: result.isCrit,
      message: `${attacker.name} attacked ${target.name} for ${result.damage} damage!`
    });
  }

  private useSkill(attacker: BattleUnit, skill: Skill) {
    // Determine skill type: Damage, Heal, Buff?
    // Document descriptions are varied.
    // We need a parser or hardcoded logic based on skill ID.
    // For MVP, generic logic:
    // If description contains "伤害" -> Deal Damage to random enemy
    // If description contains "治疗" or "回血" -> Heal random ally (or self/lowest hp)
    
    const isHealing = skill.description.includes('治疗') || skill.description.includes('回血');
    const isAoe = skill.description.includes('全体') || skill.description.includes('范围');

    if (isHealing) {
      // Heal logic
      const target = this.findLowestHpAlly(attacker);
      if (target) {
        const result = calculateHealing(attacker.currentStats);
        this.applyHealing(target, result.healing);
        
        this.emitEvent({
          type: 'heal',
          sourceId: attacker.uniqueId,
          targetId: target.uniqueId,
          skillId: skill.id,
          value: result.healing,
          isCrit: result.isCrit,
          timestamp: this.currentTime
        });

        this.logs.push({
          timestamp: this.currentTime,
          sourceId: attacker.uniqueId,
          targetId: target.uniqueId,
          action: 'heal',
          value: result.healing,
          isCrit: result.isCrit,
          message: `${attacker.name} used ${skill.name} healing ${target.name} for ${result.healing}!`
        });
      }
    } else {
      // Damage logic
      const targets = isAoe 
        ? this.units.filter(u => u.side !== attacker.side && !u.isDead) 
        : [this.findTarget(attacker)].filter((u): u is BattleUnit => !!u);
      
      targets.forEach(target => {
        // Coefficient assumption: 1.5 for single, 0.8 for AOE?
        // Document says "Strategy * 1.0~1.8". Let's use 1.5 default.
        const coeff = isAoe ? 1.0 : 1.5;
        const result = calculateSkillDamage(
          attacker.currentStats,
          attacker.race,
          target.currentStats,
          target.race,
          coeff
        );
        this.applyDamage(target, result.damage);
        
        this.emitEvent({
          type: 'skill',
          sourceId: attacker.uniqueId,
          targetId: target.uniqueId,
          skillId: skill.id,
          value: result.damage,
          isCrit: result.isCrit,
          timestamp: this.currentTime
        });

        this.logs.push({
          timestamp: this.currentTime,
          sourceId: attacker.uniqueId,
          targetId: target.uniqueId,
          action: 'skill',
          value: result.damage,
          isCrit: result.isCrit,
          message: `${attacker.name} used ${skill.name} on ${target.name} for ${result.damage}!`
        });
      });
    }
  }

  private findLowestHpAlly(unit: BattleUnit): BattleUnit | undefined {
    const allies = this.units.filter(u => u.side === unit.side && !u.isDead);
    return allies.sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp))[0];
  }

  private applyDamage(unit: BattleUnit, damage: number) {
    unit.currentHp = Math.max(0, unit.currentHp - damage);
    if (unit.currentHp <= 0) {
      unit.isDead = true;
      
      this.emitEvent({
        type: 'death',
        targetId: unit.uniqueId,
        timestamp: this.currentTime
      });

      this.logs.push({
        timestamp: this.currentTime,
        sourceId: 'system',
        targetId: unit.uniqueId,
        action: 'death',
        message: `${unit.name} has fallen!`
      });
    }
  }

  private applyHealing(unit: BattleUnit, healing: number) {
    unit.currentHp = Math.min(unit.maxHp, unit.currentHp + healing);
  }
}
