import { Hero, Skill, SkillEffect, Buff, Debuff, HeroAttributes } from '../types/slg/hero.types';
import { generateId } from '../utils/helpers';

export interface SkillCooldown {
  heroId: string;
  skillId: string;
  currentCooldown: number;
  maxCooldown: number;
  lastUsedTime: number;
}

export interface ActiveBuff {
  id: string;
  heroId: string;
  buff: Buff;
  sourceSkill: string;
}

export interface ActiveDebuff {
  id: string;
  heroId: string;
  debuff: Debuff;
  sourceSkill: string;
}

export interface SkillCastResult {
  success: boolean;
  skillId: string;
  skillName: string;
  effects: SkillEffectResult[];
  message?: string;
}

export interface SkillEffectResult {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'shield' | 'special';
  targetId: string;
  value: number;
  duration?: number;
  isCritical: boolean;
  description: string;
}

export interface BattleStateInfo {
  currentTurn: number;
  roundNumber: number;
  casterHealthPercent: number;
  isFieldBattle: boolean;
  isFortressBattle: boolean;
  weather?: string;
}

export class SLGSkillSystem {
  private static instance: SLGSkillSystem;
  
  private cooldowns: Map<string, SkillCooldown> = new Map();
  private activeBuffs: Map<string, ActiveBuff[]> = new Map();
  private activeDebuffs: Map<string, ActiveDebuff[]> = new Map();
  
  private skillDamageMultipliers: Record<string, number> = {
    'damage': 1.0,
    'heal': 1.2,
    'shield': 1.0,
    'burn': 0.5,
  };

  private constructor() {}

  static getInstance(): SLGSkillSystem {
    if (!SLGSkillSystem.instance) {
      SLGSkillSystem.instance = new SLGSkillSystem();
    }
    return SLGSkillSystem.instance;
  }

  getCooldownKey(heroId: string, skillId: string): string {
    return `${heroId}_${skillId}`;
  }

  isSkillReady(heroId: string, skillId: string): boolean {
    const key = this.getCooldownKey(heroId, skillId);
    const cooldown = this.cooldowns.get(key);
    
    if (!cooldown) return true;
    return cooldown.currentCooldown <= 0;
  }

  getCooldownRemaining(heroId: string, skillId: string): number {
    const key = this.getCooldownKey(heroId, skillId);
    const cooldown = this.cooldowns.get(key);
    
    if (!cooldown) return 0;
    return Math.max(0, cooldown.currentCooldown);
  }

  updateCooldowns(deltaTime: number): void {
    this.cooldowns.forEach((cooldown) => {
      if (cooldown.currentCooldown > 0) {
        cooldown.currentCooldown = Math.max(0, cooldown.currentCooldown - deltaTime);
      }
    });
  }

  castSkill(
    caster: Hero,
    skill: Skill,
    targets: Hero[],
    battleState?: BattleStateInfo
  ): SkillCastResult {
    const cooldownKey = this.getCooldownKey(caster.id, skill.id);
    const cooldown = this.cooldowns.get(cooldownKey);

    if (cooldown && cooldown.currentCooldown > 0) {
      return {
        success: false,
        skillId: skill.id,
        skillName: skill.name,
        effects: [],
        message: `技能冷却中，剩余 ${Math.ceil(cooldown.currentCooldown)} 秒`
      };
    }

    const effects: SkillEffectResult[] = [];
    
    for (const target of targets) {
      for (const effect of skill.effects) {
        const result = this.calculateSkillEffect(caster, target, effect, battleState);
        if (result) {
          effects.push(result);
        }
      }
    }

    this.startCooldown(caster.id, skill, skill.cooldown || 0);

    return {
      success: true,
      skillId: skill.id,
      skillName: skill.name,
      effects,
      message: `${caster.name} 使用了 ${skill.name}`
    };
  }

  private calculateSkillEffect(
    caster: Hero,
    target: Hero,
    effect: SkillEffect,
    battleState?: BattleStateInfo
  ): SkillEffectResult | null {
    const attribute = caster.attributes;
    let baseValue = 0;
    let description = '';

    switch (effect.type) {
      case 'damage':
        baseValue = Math.round(attribute.strength * this.skillDamageMultipliers['damage'] * (effect.value / 100));
        description = `造成 ${baseValue} 点物理伤害`;
        break;
        
      case 'heal':
        baseValue = Math.round(attribute.strategy * this.skillDamageMultipliers['heal'] * (effect.value / 100));
        description = `恢复 ${baseValue} 点生命`;
        break;
        
      case 'shield':
        baseValue = Math.round(attribute.defense * (effect.value / 100));
        description = `获得 ${baseValue} 点护盾`;
        break;
        
      case 'buff':
      case 'debuff':
        baseValue = effect.value;
        const buffDebuffType = effect.type === 'buff' ? '增益' : '减益';
        description = `${buffDebuffType}: ${baseValue}%`;
        
        if (effect.condition) {
          if (this.checkCondition(target, effect.condition, battleState)) {
            baseValue = Math.round(baseValue * 1.5);
            description += ' (条件满足)';
          }
        }
        break;
        
      case 'special':
        baseValue = effect.value;
        description = this.getSpecialEffectDescription(effect);
        break;
        
      default:
        return null;
    }

    return {
      type: effect.type,
      targetId: target.id,
      value: baseValue,
      duration: effect.duration,
      isCritical: Math.random() < 0.1,
      description
    };
  }

  private checkCondition(target: Hero, condition: string, battleState?: BattleStateInfo): boolean {
    if (!battleState) return false;

    const conditions: Record<string, () => boolean> = {
      'lowHealth': () => battleState.casterHealthPercent < 50,
      'fortress': () => battleState.isFortressBattle,
      'fieldBattle': () => battleState.isFieldBattle,
      'demon': () => target.faction === 'demon',
      'human': () => target.faction === 'human',
      'angel': () => target.faction === 'angel',
      'rain': () => battleState.weather === 'rain',
      'earlyCombat': () => battleState.roundNumber <= 2,
      'combat': () => true,
      'plunder': () => true,
      'attack': () => true,
      'skill': () => true,
    };

    const checkFn = conditions[condition];
    return checkFn ? checkFn() : false;
  }

  private getSpecialEffectDescription(effect: SkillEffect): string {
    const descriptions: Record<string, string> = {
      'immune': '免疫控制',
      'purify': '净化负面效果',
      'purifyEnemy': '驱散增益',
      'stealth': '隐身',
      'lifesteal': '吸血',
      'reflect': '反弹伤害',
      'immuneDeath': '免死',
      'immuneCrit': '免疫暴击',
      'dodge': '闪避',
      'crit': '暴击',
      'critDamage': '暴击伤害',
      'healImmune': '治疗无法被削弱',
      'execute': '斩首',
      'kill': '击杀回血',
      'steal': '窃取资源',
      'trade': '贸易',
      'gold': '金币',
      'plunderDouble': '掠夺翻倍',
      'ignoreDefense': '无视防御',
      'lowHealthBuff': '低血增益',
      'sacrifice': '献祭',
      'aura': '光环效果',
      'immuneFire': '免疫火焰',
      'capacity': '储量上限',
    };

    return descriptions[effect.condition || ''] || `特殊效果: ${effect.value}`;
  }

  private startCooldown(heroId: string, skill: Skill, cooldownTime: number): void {
    const key = this.getCooldownKey(heroId, skill.id);
    
    this.cooldowns.set(key, {
      heroId,
      skillId: skill.id,
      currentCooldown: cooldownTime,
      maxCooldown: cooldownTime,
      lastUsedTime: Date.now()
    });
  }

  applyBuff(heroId: string, buff: Buff, sourceSkill: string): void {
    const key = `${heroId}_buffs`;
    const buffs = this.activeBuffs.get(key) || [];
    
    const activeBuff: ActiveBuff = {
      id: generateId(),
      heroId,
      buff: { ...buff },
      sourceSkill
    };
    
    buffs.push(activeBuff);
    this.activeBuffs.set(key, buffs);
  }

  applyDebuff(heroId: string, debuff: Debuff, sourceSkill: string): void {
    const key = `${heroId}_debuffs`;
    const debuffs = this.activeDebuffs.get(key) || [];
    
    const activeDebuff: ActiveDebuff = {
      id: generateId(),
      heroId,
      debuff: { ...debuff },
      sourceSkill
    };
    
    debuffs.push(activeDebuff);
    this.activeDebuffs.set(key, debuffs);
  }

  updateBuffsAndDebuffs(deltaTime: number): void {
    this.activeBuffs.forEach((buffs, key) => {
      const updatedBuffs = buffs
        .map(b => ({
          ...b,
          buff: { ...b.buff, duration: b.buff.duration - deltaTime }
        }))
        .filter(b => b.buff.duration > 0);
      
      if (updatedBuffs.length > 0) {
        this.activeBuffs.set(key, updatedBuffs);
      } else {
        this.activeBuffs.delete(key);
      }
    });

    this.activeDebuffs.forEach((debuffs, key) => {
      const updatedDebuffs = debuffs
        .map(d => ({
          ...d,
          debuff: { ...d.debuff, duration: d.debuff.duration - deltaTime }
        }))
        .filter(d => d.debuff.duration > 0);
      
      if (updatedDebuffs.length > 0) {
        this.activeDebuffs.set(key, updatedDebuffs);
      } else {
        this.activeDebuffs.delete(key);
      }
    });
  }

  getHeroBuffs(heroId: string): Buff[] {
    const key = `${heroId}_buffs`;
    const buffs = this.activeBuffs.get(key) || [];
    return buffs.map(b => b.buff);
  }

  getHeroDebuffs(heroId: string): Debuff[] {
    const key = `${heroId}_debuffs`;
    const debuffs = this.activeDebuffs.get(key) || [];
    return debuffs.map(d => d.debuff);
  }

  hasBuff(heroId: string, buffType: string): boolean {
    const buffs = this.getHeroBuffs(heroId);
    return buffs.some(b => b.type === buffType);
  }

  hasDebuff(heroId: string, debuffType: string): boolean {
    const debuffs = this.getHeroDebuffs(heroId);
    return debuffs.some(d => d.type === debuffType);
  }

  clearHeroEffects(heroId: string): void {
    this.activeBuffs.delete(`${heroId}_buffs`);
    this.activeDebuffs.delete(`${heroId}_debuffs`);
  }

  resetAllCooldowns(): void {
    this.cooldowns.clear();
  }

  resetHeroCooldowns(heroId: string): void {
    const keysToDelete: string[] = [];
    this.cooldowns.forEach((cooldown, key) => {
      if (cooldown.heroId === heroId) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cooldowns.delete(key));
  }

  getPassiveSkillEffects(hero: Hero, battleState?: BattleStateInfo): { attributeModifiers: Partial<HeroAttributes>; specialEffects: string[] } {
    const attributeModifiers: Partial<HeroAttributes> = {};
    const specialEffects: string[] = [];

    const passiveAndTalent = [hero.passiveSkill, hero.talent];
    
    for (const skill of passiveAndTalent) {
      for (const effect of skill.effects) {
        if (effect.type === 'buff' || effect.type === 'debuff') {
          if (effect.condition && battleState) {
            if (!this.checkCondition(hero, effect.condition, battleState)) {
              continue;
            }
          }
          
          if (effect.type === 'buff') {
            switch (effect.condition) {
              case 'attack':
              case 'strength':
                attributeModifiers.strength = (attributeModifiers.strength || 0) + effect.value;
                break;
              case 'strategy':
              case 'magicPower':
                attributeModifiers.strategy = (attributeModifiers.strategy || 0) + effect.value;
                break;
              case 'defense':
                attributeModifiers.defense = (attributeModifiers.defense || 0) + effect.value;
                break;
              case 'command':
                attributeModifiers.command = (attributeModifiers.command || 0) + effect.value;
                break;
              default:
                attributeModifiers.strength = (attributeModifiers.strength || 0) + effect.value;
            }
          }
        } else if (effect.type === 'special') {
          specialEffects.push(this.getSpecialEffectDescription(effect));
        }
      }
    }

    return { attributeModifiers, specialEffects };
  }

  applyPassiveSkillBonuses(hero: Hero, baseAttributes: HeroAttributes, battleState?: BattleStateInfo): HeroAttributes {
    const { attributeModifiers } = this.getPassiveSkillEffects(hero, battleState);
    
    return {
      command: Math.round(baseAttributes.command * (1 + (attributeModifiers.command || 0) / 100)),
      strength: Math.round(baseAttributes.strength * (1 + (attributeModifiers.strength || 0) / 100)),
      strategy: Math.round(baseAttributes.strategy * (1 + (attributeModifiers.strategy || 0) / 100)),
      defense: Math.round(baseAttributes.defense * (1 + (attributeModifiers.defense || 0) / 100)),
    };
  }
}

export const slgSkillSystem = SLGSkillSystem.getInstance();
