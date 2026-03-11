import { Hero, HeroStats, Skill, TroopType } from '../../types/Hero';
import { calculateNormalDamage, calculateSkillDamage, calculateHealing } from './CombatFormulas';
import { BondManager } from './BondManager';
import { HeroLogic } from './HeroLogic';
import { BattleUnit, Buff, BattleLog, BattleEvent } from '../../types/BattleTypes';
import { ComboManager, ComboSkill } from './ComboManager';

export class BattleSystem {
  units: BattleUnit[] = [];
  logs: BattleLog[] = [];
  eventQueue: BattleEvent[] = [];
  currentTime: number = 0; // In seconds
  activeCombos: ComboSkill[] = [];
  comboTimer: number = 0;
  
  constructor(attackerHeroes: Hero[], defenderHeroes: Hero[]) {
    this.initializeUnits(attackerHeroes, 'attacker');
    this.initializeUnits(defenderHeroes, 'defender');

    // Initialize Combos
    // We check combos for the attacker side for now (player side)
    // Or maybe both sides? The prompt implies "heroes: Hero[]", likely the player's team.
    // Let's assume combos apply to each side independently.
    // For simplicity, let's just check attacker combos for now as the prompt is about "Implement Combo Skills system" generally.
    // But usually in games both sides can have it.
    // However, the prompt says "checkCombos(heroes: Hero[])".
    // Let's store combos per side? 
    // "Initialize and store active combos using ComboManager."
    
    // Let's try to support both sides.
    this.activeCombos = [
        ...ComboManager.checkCombos(attackerHeroes, 'attacker'),
        ...ComboManager.checkCombos(defenderHeroes, 'defender')
    ];
  }

  // ... rest of the file ...
  public addUnit(hero: Hero, side: 'attacker' | 'defender') {
    this.initializeUnits([hero], side);
  }

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
      // Calculate stats based on level/star
      const calculatedStats = HeroLogic.getStats(hero);

      // Calculate HP based on Command (Troop Count) * 10 or similar base
      // Document says Command = Troop Limit. Let's say 1 Command = 100 HP for now.
      let maxHp = calculatedStats.command * 100;
      
      // Determine range and speed based on TroopType
      let range = 60; // Default melee
      let speed = 50;  // Default speed
      
      if (hero.troopType === TroopType.ARCHER || hero.troopType === TroopType.MAGE) {
          range = 250;
          speed = 30;
      } else if (hero.troopType === TroopType.CAVALRY) {
          range = 60;
          speed = 80;
      } else if (hero.troopType === TroopType.FLYING) {
          range = 60;
          speed = 70;
      } else if (hero.troopType === TroopType.STRUCTURE) {
          range = 0;
          speed = 0; // Immobile
          maxHp *= 5; // Structure has high HP
      }

      // Randomize Y position (100-500), X based on side
      const startX = side === 'attacker' ? 100 + Math.random() * 100 : 600 + Math.random() * 100;
      const startY = 100 + Math.random() * 400;
      
      const unit: BattleUnit = {
        ...hero,
        uniqueId: `${side}_${index}_${hero.id}`,
        currentHp: maxHp,
        maxHp: maxHp,
        currentStats: { ...calculatedStats },
        cooldowns: {},
        buffs: [],
        isDead: false,
        side,
        positionIndex: index,
        shield: 0,
        lifesteal: 0,
        attackSpeed: 1.0,
        normalAttackCooldown: Math.random(), // Randomize start to avoid synchronized attacks
        x: startX,
        y: startY,
        speed,
        range
      };
      
      this.units.push(unit);
      sideUnits.push(unit);
    });

    // Check and apply bonds
    const activeBonds = BondManager.getActiveBonds(heroes);
    BondManager.applyBondEffects(sideUnits, activeBonds);
  }

  // Find a target for a unit (AI logic based on TroopType)
  private findTarget(unit: BattleUnit): BattleUnit | undefined {
    const enemies = this.units.filter(u => u.side !== unit.side && !u.isDead);
    if (enemies.length === 0) return undefined;

    // AI Behaviors
    // 0. Siege: Prioritize Structures
    if (unit.troopType === TroopType.SIEGE) {
        const structures = enemies.filter(e => e.troopType === TroopType.STRUCTURE);
        if (structures.length > 0) return structures[0];
    }

    // 1. Cavalry: Prioritize Back Row (highest index)
    if (unit.troopType === TroopType.CAVALRY) {
      // Sort by position index descending
      return enemies.sort((a, b) => b.positionIndex - a.positionIndex)[0];
    }
    
    // 2. Archer: Kiting / Focus Fire Weakest? 
    // Usually Archers hit closest unless specific skill. 
    // But let's say Archers prioritize Flying units (since they counter them) or Low HP.
    // Let's implement: Prioritize Flying, then Random.
    if (unit.troopType === TroopType.ARCHER) {
      const flyingEnemies = enemies.filter(e => e.troopType === TroopType.FLYING);
      if (flyingEnemies.length > 0) {
        return flyingEnemies[0];
      }
    }

    // 3. Flying: Ignore Front Row (index 0), attack Mid/Back
    if (unit.troopType === TroopType.FLYING) {
      // Find enemies not in front (positionIndex > 0)
      // Note: positionIndex is relative to their side array index. 
      // If we assume index 0 is front, 1 mid, 2 back.
      const backLines = enemies.filter(e => e.positionIndex > 0);
      if (backLines.length > 0) {
         return backLines[Math.floor(Math.random() * backLines.length)];
      }
    }

    // Default (Infantry, Mage, Siege): Attack Front Row (lowest index)
    // Sort by position index ascending (0 is front)
    return enemies.sort((a, b) => a.positionIndex - b.positionIndex)[0];
  }

  public update(deltaTime: number) {
    this.currentTime += deltaTime;

    this.updateMovement(deltaTime);

    // Combo Logic
    this.comboTimer += deltaTime;
    if (this.comboTimer >= 20) {
      this.comboTimer = 0;
      this.triggerCombos();
    }

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
      for (let i = unit.buffs.length - 1; i >= 0; i--) {
        const buff = unit.buffs[i];
        buff.duration -= deltaTime;
        if (buff.duration <= 0) {
           if (buff.onRemove) buff.onRemove(unit);
           unit.buffs.splice(i, 1);
        }
      }

      // AI Logic:
      // 1. Try to use Active Skill
      // 2. Else Normal Attack
      
      const target = this.findTarget(unit);
      if (!target) return;

      const dist = Math.sqrt(Math.pow(target.x - unit.x, 2) + Math.pow(target.y - unit.y, 2));

      // Only attack if in range
      if (dist <= unit.range) {
        // Check Active Skill
        const activeSkill = unit.activeSkill;
        if (activeSkill.cooldown && (unit.cooldowns[activeSkill.id] || 0) <= 0) {
          this.useSkill(unit, activeSkill);
          unit.cooldowns[activeSkill.id] = activeSkill.cooldown;
        } else {
          // Normal Attack
          unit.normalAttackCooldown = (unit.normalAttackCooldown || 0) - deltaTime;
          if (unit.normalAttackCooldown <= 0) {
             this.performNormalAttack(unit);
             // Reset cooldown
             unit.normalAttackCooldown = 1.0 / (unit.attackSpeed || 1.0);
          }
        }
      }
    });
  }

  private updateMovement(dt: number) {
    this.units.forEach(unit => {
      if (unit.isDead || unit.speed === 0) return;

      const target = this.findTarget(unit);
      if (target) {
        const dx = target.x - unit.x;
        const dy = target.y - unit.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > unit.range) {
          const angle = Math.atan2(dy, dx);
          // Move towards target
          unit.x += Math.cos(angle) * unit.speed * dt;
          unit.y += Math.sin(angle) * unit.speed * dt;
        }
      }
    });
  }

  private triggerCombos() {
    this.activeCombos.forEach(combo => {
        combo.execute(this.units, this.emitEvent.bind(this));
    });
  }

  private performNormalAttack(attacker: BattleUnit) {
    const target = this.findTarget(attacker);
    if (!target) return;

    const result = calculateNormalDamage(
      attacker.currentStats,
      attacker.race,
      attacker.troopType,
      target.currentStats,
      target.race,
      target.troopType
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

    if (attacker.lifesteal && attacker.lifesteal > 0) {
        const healAmount = Math.floor(result.damage * attacker.lifesteal);
        if (healAmount > 0) {
            this.applyHealing(attacker, healAmount);
            this.emitEvent({
                type: 'heal',
                sourceId: attacker.uniqueId,
                targetId: attacker.uniqueId,
                value: healAmount,
                timestamp: this.currentTime,
                skillId: 'lifesteal'
            });
        }
    }
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
          attacker.troopType,
          target.currentStats,
          target.race,
          target.troopType,
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
    let remainingDamage = damage;
    
    // Check Shield
    if (unit.shield && unit.shield > 0) {
        if (unit.shield >= remainingDamage) {
            unit.shield -= remainingDamage;
            remainingDamage = 0;
        } else {
            remainingDamage -= unit.shield;
            unit.shield = 0;
        }
    }

    unit.currentHp = Math.max(0, unit.currentHp - remainingDamage);
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
