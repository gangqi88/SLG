import { Hero } from '../../types/slg/hero.types';
import { generateId } from '../../utils/helpers';

export const demonHeroes: Hero[] = [
  {
    id: 'mo-luo-ke',
    name: '暗狱·摩洛克',
    faction: 'demon',
    quality: 'red',
    rarity: 98,
    stars: 5,
    attributes: {
      command: 98,
      strength: 99,
      strategy: 44,
      defense: 82
    },
    growthRates: {
      command: 1.2,
      strength: 1.2,
      strategy: 0.5,
      defense: 0.9
    },
    maxLevelAttributes: {
      command: 98,
      strength: 99,
      strategy: 44,
      defense: 82
    },
    activeSkill: {
      id: 'an-yu-fen-tian',
      name: '暗狱焚天',
      description: '全体火伤+持续灼烧',
      type: 'active',
      effects: [
        { type: 'damage', value: 80, target: 'enemy', duration: 8 },
        { type: 'burn', value: 10, target: 'enemy', duration: 8 }
      ],
      cooldown: 18,
      levels: [
        { level: 1, effect: '全体火伤+灼烧', description: '全体火伤+持续灼烧8秒', cooldown: 18 }
      ],
      tags: ['damage', 'fire', 'burn', 'aoe'],
      icon: 'skill_inferno'
    },
    passiveSkill: {
      id: 'mo-qu',
      name: '魔躯',
      description: '反弹25%伤害',
      type: 'passive',
      effects: [
        { type: 'special', value: 25, target: 'self', condition: 'reflect' }
      ],
      levels: [
        { level: 1, effect: '反弹25%伤害', description: '反弹25%伤害' }
      ],
      tags: ['defense', 'reflect'],
      icon: 'skill_reflect'
    },
    talent: {
      id: 'gong-ji-xi-xue',
      name: '攻击+45%，吸血+30%',
      description: '攻击+45%，吸血+30%',
      type: 'talent',
      effects: [
        { type: 'attack', value: 45, target: 'self' },
        { type: 'special', value: 30, target: 'self', condition: 'lifesteal' }
      ],
      levels: [
        { level: 1, effect: '攻击+45%，吸血+30%', description: '攻击+45%，吸血+30%' }
      ],
      tags: ['damage', 'lifesteal', 'talent'],
      icon: 'talent_destruction'
    },
    bonds: [
      {
        id: 'lian-yu-zhu-zai',
        name: '炼狱主宰',
        description: '摩洛克+萨洛斯+巴尔 → AOE+55%',
        heroes: ['mo-luo-ke', 'sa-luo-si', 'ba-er'],
        effects: [
          { attribute: 'strength', bonus: 55, condition: '萨洛斯和巴尔在队' }
        ],
        activationCondition: { requiredStars: 12, requiredLevel: 50 },
        icon: 'bond_demons'
      }
    ],
    bondActive: false,
    equipment: {},
    isNFT: false,
    level: 1,
    experience: 0,
    status: 'idle',
    battleStats: {
      battlesWon: 0,
      battlesLost: 0,
      totalDamage: 0,
      totalHealing: 0,
      criticalHits: 0,
      dodges: 0
    },
    getExperience: 1000,
    avatar: 'hero_mo_luo_ke_avatar',
    fullImage: 'hero_mo_luo_ke_full',
    icon: 'hero_mo_luo_ke_icon',
    lore: '炼狱魔王，以焚世之火吞噬一切。',
    quotes: [
      '在烈焰中，一切都将化为灰烬。',
      '恐惧是最好的武器。',
      '毁灭即是创造。'
    ]
  },
  {
    id: 'ka-long',
    name: '血刃·卡隆',
    faction: 'demon',
    quality: 'orange',
    rarity: 84,
    stars: 3,
    attributes: {
      command: 76,
      strength: 95,
      strategy: 32,
      defense: 70
    },
    growthRates: {
      command: 0.9,
      strength: 1.2,
      strategy: 0.4,
      defense: 0.9
    },
    maxLevelAttributes: {
      command: 76,
      strength: 95,
      strategy: 32,
      defense: 70
    },
    activeSkill: {
      id: 'xue-ren-zhan',
      name: '血刃斩',
      description: '瞬间斩杀低血部队',
      type: 'active',
      effects: [
        { type: 'damage', value: 200, target: 'enemy', condition: 'lowHealth' }
      ],
      cooldown: 12,
      levels: [
        { level: 1, effect: '斩杀死兵', description: '对低血量敌人造成200%伤害', cooldown: 12 }
      ],
      tags: ['damage', 'execute'],
      icon: 'skill_blood_blade'
    },
    passiveSkill: {
      id: 'shi-xue',
      name: '嗜血',
      description: '击杀回血20%',
      type: 'passive',
      effects: [
        { type: 'heal', value: 20, target: 'self', condition: 'kill' }
      ],
      levels: [
        { level: 1, effect: '击杀回血20%', description: '击杀单位后恢复20%生命' }
      ],
      tags: ['heal', 'passive', 'lifesteal'],
      icon: 'skill_bloodlust'
    },
    talent: {
      id: 'di-xue-gua-shang',
      name: '对<30%兵力敌人3倍伤害',
      description: '对<30%兵力敌人3倍伤害',
      type: 'talent',
      effects: [
        { type: 'damage', value: 200, target: 'enemy', condition: 'lowHealth' }
      ],
      levels: [
        { level: 1, effect: '斩首', description: '对<30%兵力敌人3倍伤害' }
      ],
      tags: ['damage', 'talent', 'execute'],
      icon: 'talent_executor'
    },
    bonds: [
      {
        id: 'si-wang-shou-ge',
        name: '死亡收割',
        description: '卡隆+摩洛克+赛列尔 → 收割+65%',
        heroes: ['ka-long', 'mo-luo-ke', 'sai-lie-er'],
        effects: [
          { attribute: 'strength', bonus: 65, condition: '摩洛克和赛列尔在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_reapers'
      }
    ],
    bondActive: false,
    equipment: {},
    isNFT: false,
    level: 1,
    experience: 0,
    status: 'idle',
    battleStats: {
      battlesWon: 0,
      battlesLost: 0,
      totalDamage: 0,
      totalHealing: 0,
      criticalHits: 0,
      dodges: 0
    },
    getExperience: 1000,
    avatar: 'hero_ka_long_avatar',
    fullImage: 'hero_ka_long_full',
    icon: 'hero_ka_long_icon',
    lore: '战场死神，专取残命。',
    quotes: [
      '死亡，是我最好的朋友。',
      '你的命，我收下了。',
      '下一个，就是你。'
    ]
  },
  {
    id: 'li-li-si',
    name: '幽影·莉莉丝',
    faction: 'demon',
    quality: 'red',
    rarity: 93,
    stars: 5,
    attributes: {
      command: 86,
      strength: 90,
      strategy: 62,
      defense: 66
    },
    growthRates: {
      command: 1.1,
      strength: 1.1,
      strategy: 0.8,
      defense: 0.8
    },
    maxLevelAttributes: {
      command: 86,
      strength: 90,
      strategy: 62,
      defense: 66
    },
    activeSkill: {
      id: 'an-ying-tu-xi',
      name: '暗影突袭',
      description: '破城+无视防御35%',
      type: 'active',
      effects: [
        { type: 'damage', value: 150, target: 'enemy', condition: 'fortress' },
        { type: 'special', value: 35, target: 'enemy', condition: 'ignoreDefense' }
      ],
      cooldown: 15,
      levels: [
        { level: 1, effect: '破城+无视防御', description: '破城并无视35%防御', cooldown: 15 }
      ],
      tags: ['damage', 'stealth', 'siege'],
      icon: 'skill_shadow_strike'
    },
    passiveSkill: {
      id: 'gui-zha',
      name: '诡诈',
      description: '闪避+30%，免控',
      type: 'passive',
      effects: [
        { type: 'dodge', value: 30, target: 'self' },
        { type: 'special', value: 100, target: 'self', condition: 'immuneControl' }
      ],
      levels: [
        { level: 1, effect: '闪避+30%，免控', description: '闪避+30%，免疫控制' }
      ],
      tags: ['defense', 'passive', 'control'],
      icon: 'skill_trickster'
    },
    talent: {
      id: 'hang-jun-yin-shen',
      name: '行军隐身，不被侦测',
      description: '行军隐身，不被侦测',
      type: 'talent',
      effects: [
        { type: 'special', value: 100, target: 'self', condition: 'stealth' }
      ],
      levels: [
        { level: 1, effect: '行军隐身', description: '行军时隐身，不被侦测' }
      ],
      tags: ['special', 'talent', 'stealth'],
      icon: 'talent_shadow'
    },
    bonds: [
      {
        id: 'an-ying-mo-nv',
        name: '暗影魔女',
        description: '莉莉丝+玛门+赛列尔 → 偷袭伤害+60%',
        heroes: ['li-li-si', 'ma-men', 'sai-lie-er'],
        effects: [
          { attribute: 'strength', bonus: 60, condition: '玛门和赛列尔在队' }
        ],
        activationCondition: { requiredStars: 12, requiredLevel: 50 },
        icon: 'bond_shadows'
      }
    ],
    bondActive: false,
    equipment: {},
    isNFT: false,
    level: 1,
    experience: 0,
    status: 'idle',
    battleStats: {
      battlesWon: 0,
      battlesLost: 0,
      totalDamage: 0,
      totalHealing: 0,
      criticalHits: 0,
      dodges: 0
    },
    getExperience: 1000,
    avatar: 'hero_li_li_si_avatar',
    fullImage: 'hero_li_li_si_full',
    icon: 'hero_li_li_si_icon',
    lore: '暗影魔女，无声破城。',
    quotes: [
      '黑暗，是我的主场。',
      '你看不到我。',
      '咯咯咯...'
    ]
  },
  {
    id: 'sa-luo-si',
    name: '炎魔·萨洛斯',
    faction: 'demon',
    quality: 'orange',
    rarity: 82,
    stars: 3,
    attributes: {
      command: 90,
      strength: 92,
      strategy: 36,
      defense: 76
    },
    growthRates: {
      command: 1.1,
      strength: 1.2,
      strategy: 0.4,
      defense: 0.9
    },
    maxLevelAttributes: {
      command: 90,
      strength: 92,
      strategy: 36,
      defense: 76
    },
    activeSkill: {
      id: 'lian-yu-hai',
      name: '炼狱火海',
      description: '大范围灼烧8秒',
      type: 'active',
      effects: [
        { type: 'damage', value: 60, target: 'enemy', duration: 8 },
        { type: 'burn', value: 15, target: 'enemy', duration: 8 }
      ],
      cooldown: 15,
      levels: [
        { level: 1, effect: '火海灼烧8秒', description: '大范围灼烧8秒', cooldown: 15 }
      ],
      tags: ['damage', 'fire', 'burn', 'aoe'],
      icon: 'skill_inferno_wave'
    },
    passiveSkill: {
      id: 'yan-qu',
      name: '炎躯',
      description: '免火，攻击带灼烧',
      type: 'passive',
      effects: [
        { type: 'special', value: 100, target: 'self', condition: 'immuneFire' },
        { type: 'burn', value: 5, target: 'enemy', condition: 'attack' }
      ],
      levels: [
        { level: 1, effect: '免火，攻击带灼烧', description: '免疫火焰伤害，攻击附带灼烧' }
      ],
      tags: ['defense', 'passive', 'fire'],
      icon: 'skill_fire_body'
    },
    talent: {
      id: 'shao-shang-jia',
      name: '灼烧+55%，攻城火伤',
      description: '灼烧+55%，攻城火伤',
      type: 'talent',
      effects: [
        { type: 'burn', value: 55, target: 'enemy' },
        { type: 'special', value: 50, target: 'enemy', condition: 'fortress' }
      ],
      levels: [
        { level: 1, effect: '灼烧+55%，攻城火伤', description: '灼烧效果+55%，攻城时附加火伤' }
      ],
      tags: ['damage', 'talent', 'fire', 'siege'],
      icon: 'talent_inferno'
    },
    bonds: [
      {
        id: 'fen-shi-lie-yan',
        name: '焚世烈焰',
        description: '萨洛斯+摩洛克+莫菲斯 → 灼烧+65%',
        heroes: ['sa-luo-si', 'mo-luo-ke', 'mo-fei-si'],
        effects: [
          { attribute: 'strength', bonus: 65, condition: '摩洛克和莫菲斯在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_fire'
      }
    ],
    bondActive: false,
    equipment: {},
    isNFT: false,
    level: 1,
    experience: 0,
    status: 'idle',
    battleStats: {
      battlesWon: 0,
      battlesLost: 0,
      totalDamage: 0,
      totalHealing: 0,
      criticalHits: 0,
      dodges: 0
    },
    getExperience: 1000,
    avatar: 'hero_sa_luo_si_avatar',
    fullImage: 'hero_sa_luo_si_full',
    icon: 'hero_sa_luo_si_icon',
    lore: '火焰聚合体，所过寸草不生。',
    quotes: [
      '燃烧吧！',
      '灰烬，是我的领地。',
      '哪里有火，哪里就有我。'
    ]
  },
  {
    id: 'bei-xi-mo-si',
    name: '狂怒·贝希摩斯',
    faction: 'demon',
    quality: 'orange',
    rarity: 85,
    stars: 3,
    attributes: {
      command: 100,
      strength: 86,
      strategy: 22,
      defense: 96
    },
    growthRates: {
      command: 1.3,
      strength: 1.1,
      strategy: 0.3,
      defense: 1.2
    },
    maxLevelAttributes: {
      command: 100,
      strength: 86,
      strategy: 22,
      defense: 96
    },
    activeSkill: {
      id: 'ju-shou-jian-ta',
      name: '巨兽践踏',
      description: '全体眩晕3秒',
      type: 'active',
      effects: [
        { type: 'damage', value: 80, target: 'enemy' },
        { type: 'control', value: 100, target: 'enemy', duration: 3 }
      ],
      cooldown: 18,
      levels: [
        { level: 1, effect: '眩晕3秒', description: '全体眩晕3秒', cooldown: 18 }
      ],
      tags: ['damage', 'control', 'stun'],
      icon: 'skill_beast_stomp'
    },
    passiveSkill: {
      id: 'gang-tie-mo-qu',
      name: '钢铁魔躯',
      description: '防御+40%，减伤30%',
      type: 'passive',
      effects: [
        { type: 'defense', value: 40, target: 'self' },
        { type: 'special', value: -30, target: 'self', condition: 'damageReduction' }
      ],
      levels: [
        { level: 1, effect: '防御+40%，减伤30%', description: '防御+40%，伤害减免30%' }
      ],
      tags: ['defense', 'passive'],
      icon: 'skill_steel_body'
    },
    talent: {
      id: 'xue-liang-yue-di',
      name: '血量越低属性越高（最高翻倍）',
      description: '血量越低属性越高（最高翻倍）',
      type: 'talent',
      effects: [
        { type: 'special', value: 100, target: 'self', condition: 'lowHealthBuff' }
      ],
      levels: [
        { level: 1, effect: '低血翻倍', description: '血量越低属性越高，最高翻倍' }
      ],
      tags: ['defense', 'talent', 'berserker'],
      icon: 'talent_beast'
    },
    bonds: [
      {
        id: 'lian-yu-kuang-shou',
        name: '炼狱狂兽',
        description: '贝希摩斯+巴尔+摩洛克 → 坦度+55%',
        heroes: ['bei-xi-mo-si', 'ba-er', 'mo-luo-ke'],
        effects: [
          { attribute: 'defense', bonus: 55, condition: '巴尔和摩洛克在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_beasts'
      }
    ],
    bondActive: false,
    equipment: {},
    isNFT: false,
    level: 1,
    experience: 0,
    status: 'idle',
    battleStats: {
      battlesWon: 0,
      battlesLost: 0,
      totalDamage: 0,
      totalHealing: 0,
      criticalHits: 0,
      dodges: 0
    },
    getExperience: 1000,
    avatar: 'hero_bei_xi_mo_si_avatar',
    fullImage: 'hero_bei_xi_mo_si_full',
    icon: 'hero_bei_xi_mo_si_icon',
    lore: '炼狱凶兽，越残血越恐怖。',
    quotes: [
      '咆哮吧！',
      '血越少，我越强！',
      '吼！！！'
    ]
  },
  {
    id: 'ma-men',
    name: '噬魂·玛门',
    faction: 'demon',
    quality: 'orange',
    rarity: 80,
    stars: 3,
    attributes: {
      command: 60,
      strength: 70,
      strategy: 85,
      defense: 50
    },
    growthRates: {
      command: 0.7,
      strength: 0.9,
      strategy: 1.1,
      defense: 0.6
    },
    maxLevelAttributes: {
      command: 60,
      strength: 70,
      strategy: 85,
      defense: 50
    },
    activeSkill: {
      id: 'shi-hun-lve-duo',
      name: '噬魂掠夺',
      description: '大量掠夺+降储量上限',
      type: 'active',
      effects: [
        { type: 'special', value: 30, target: 'enemy', condition: 'plunder' },
        { type: 'special', value: -20, target: 'enemy', condition: 'capacity' }
      ],
      cooldown: 10 * 60 * 60,
      levels: [
        { level: 1, effect: '掠夺+降上限', description: '大量掠夺并降低储量上限', cooldown: 10 * 60 * 60 }
      ],
      tags: ['resource', 'plunder'],
      icon: 'skill_plunder'
    },
    passiveSkill: {
      id: 'ju-mo',
      name: '聚魔',
      description: '掠夺越多攻击越高（最高+40%）',
      type: 'passive',
      effects: [
        { type: 'attack', value: 40, target: 'self', condition: 'plunder' }
      ],
      levels: [
        { level: 1, effect: '掠夺增攻', description: '掠夺越多攻击越高，最高+40%' }
      ],
      tags: ['damage', 'passive', 'plunder'],
      icon: 'skill_greed'
    },
    talent: {
      id: 'lve-duo-fan-bei',
      name: '掠夺翻倍，铜币+15%',
      description: '掠夺翻倍，铜币+15%',
      type: 'talent',
      effects: [
        { type: 'special', value: 100, target: 'self', condition: 'plunderDouble' },
        { type: 'special', value: 15, target: 'self', condition: 'gold' }
      ],
      levels: [
        { level: 1, effect: '掠夺翻倍', description: '掠夺翻倍，铜币+15%' }
      ],
      tags: ['resource', 'talent', 'plunder'],
      icon: 'talent_greed'
    },
    bonds: [
      {
        id: 'wu-jin-tan-yu',
        name: '无尽贪欲',
        description: '玛门+莉莉丝+赛列尔 → 掠夺收益+75%',
        heroes: ['ma-men', 'li-li-si', 'sai-lie-er'],
        effects: [
          { attribute: 'strategy', bonus: 75, condition: '莉莉丝和赛列尔在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_greed'
      }
    ],
    bondActive: false,
    equipment: {},
    isNFT: false,
    level: 1,
    experience: 0,
    status: 'idle',
    battleStats: {
      battlesWon: 0,
      battlesLost: 0,
      totalDamage: 0,
      totalHealing: 0,
      criticalHits: 0,
      dodges: 0
    },
    getExperience: 1000,
    avatar: 'hero_ma_men_avatar',
    fullImage: 'hero_ma_men_full',
    icon: 'hero_ma_men_icon',
    lore: '贪欲恶魔，掠夺资源与灵魂。',
    quotes: [
      '都是我的！',
      '贪婪，是我的本性。',
      '越多越好！'
    ]
  },
  {
    id: 'a-jia-lei-si',
    name: '魔焰·阿加雷斯',
    faction: 'demon',
    quality: 'orange',
    rarity: 83,
    stars: 3,
    attributes: {
      command: 88,
      strength: 94,
      strategy: 30,
      defense: 80
    },
    growthRates: {
      command: 1.1,
      strength: 1.2,
      strategy: 0.4,
      defense: 1.0
    },
    maxLevelAttributes: {
      command: 88,
      strength: 94,
      strategy: 30,
      defense: 80
    },
    activeSkill: {
      id: 'mo-yan-chong-ji',
      name: '魔焰冲击',
      description: '摧毁城墙',
      type: 'active',
      effects: [
        { type: 'damage', value: 200, target: 'enemy', condition: 'fortress' }
      ],
      cooldown: 15,
      levels: [
        { level: 1, effect: '摧毁城墙', description: '对城墙造成巨量伤害', cooldown: 15 }
      ],
      tags: ['damage', 'siege'],
      icon: 'skill_demolish'
    },
    passiveSkill: {
      id: 'sui-jia',
      name: '碎甲',
      description: '无视防御40%',
      type: 'passive',
      effects: [
        { type: 'special', value: 40, target: 'enemy', condition: 'ignoreDefense' }
      ],
      levels: [
        { level: 1, effect: '无视防御40%', description: '攻击时40%概率无视防御' }
      ],
      tags: ['damage', 'passive'],
      icon: 'skill_armor_break'
    },
    talent: {
      id: 'wu-shi-cheng-fang',
      name: '无视城防55%',
      description: '无视城防55%',
      type: 'talent',
      effects: [
        { type: 'special', value: 55, target: 'enemy', condition: 'fortress' }
      ],
      levels: [
        { level: 1, effect: '无视城防55%', description: '无视城防55%' }
      ],
      tags: ['damage', 'talent', 'siege'],
      icon: 'talent_demolisher'
    },
    bonds: [
      {
        id: 'hui-mie-xian-feng',
        name: '毁灭先锋',
        description: '阿加雷斯+萨洛斯+巴尔 → 攻城+70%',
        heroes: ['a-jia-lei-si', 'sa-luo-si', 'ba-er'],
        effects: [
          { attribute: 'strength', bonus: 70, condition: '萨洛斯和巴尔在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_destroyers'
      }
    ],
    bondActive: false,
    equipment: {},
    isNFT: false,
    level: 1,
    experience: 0,
    status: 'idle',
    battleStats: {
      battlesWon: 0,
      battlesLost: 0,
      totalDamage: 0,
      totalHealing: 0,
      criticalHits: 0,
      dodges: 0
    },
    getExperience: 1000,
    avatar: 'hero_a_jia_lei_si_avatar',
    fullImage: 'hero_a_jia_lei_si_full',
    icon: 'hero_a_jia_lei_si_icon',
    lore: '破城恶魔，无坚不摧。',
    quotes: [
      '没有什么是轰不碎的。',
      '城墙？在它面前就是纸。',
      '破坏，是我的艺术。'
    ]
  },
  {
    id: 'sai-lie-er',
    name: '鬼哭·赛列尔',
    faction: 'demon',
    quality: 'orange',
    rarity: 79,
    stars: 3,
    attributes: {
      command: 70,
      strength: 38,
      strategy: 92,
      defense: 58
    },
    growthRates: {
      command: 0.9,
      strength: 0.5,
      strategy: 1.2,
      defense: 0.7
    },
    maxLevelAttributes: {
      command: 70,
      strength: 38,
      strategy: 92,
      defense: 58
    },
    activeSkill: {
      id: 'gui-ku-ha',
      name: '鬼哭嚎',
      description: '攻速-50%，持续6秒',
      type: 'active',
      effects: [
        { type: 'debuff', value: -50, target: 'enemy', duration: 6, condition: 'attackSpeed' }
      ],
      cooldown: 15,
      levels: [
        { level: 1, effect: '攻速-50%', description: '敌人攻速-50%，持续6秒', cooldown: 15 }
      ],
      tags: ['debuff', 'control', 'fear'],
      icon: 'skill_fear'
    },
    passiveSkill: {
      id: 'xie-zhou',
      name: '邪咒',
      description: '敌方治疗-85%',
      type: 'passive',
      effects: [
        { type: 'debuff', value: -85, target: 'enemy', condition: 'heal' }
      ],
      levels: [
        { level: 1, effect: '敌治疗-85%', description: '敌方治疗效果-85%' }
      ],
      tags: ['debuff', 'passive', 'antiheal'],
      icon: 'skill_curse'
    },
    talent: {
      id: 'fang-gong-jian',
      name: '敌方攻防-35%',
      description: '敌方攻防-35%',
      type: 'talent',
      effects: [
        { type: 'debuff', value: -35, target: 'enemy', condition: 'attack' },
        { type: 'debuff', value: -35, target: 'enemy', condition: 'defense' }
      ],
      levels: [
        { level: 1, effect: '敌攻防-35%', description: '敌方攻击和防御-35%' }
      ],
      tags: ['debuff', 'talent', 'weaken'],
      icon: 'talent_terror'
    },
    bonds: [
      {
        id: 'kong-ju-ling-yu',
        name: '恐惧领域',
        description: '赛列尔+莉莉丝+玛门 → 减益+55%',
        heroes: ['sai-lie-er', 'li-li-si', 'ma-men'],
        effects: [
          { attribute: 'strategy', bonus: 55, condition: '莉莉丝和玛门在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_terror'
      }
    ],
    bondActive: false,
    equipment: {},
    isNFT: false,
    level: 1,
    experience: 0,
    status: 'idle',
    battleStats: {
      battlesWon: 0,
      battlesLost: 0,
      totalDamage: 0,
      totalHealing: 0,
      criticalHits: 0,
      dodges: 0
    },
    getExperience: 1000,
    avatar: 'hero_sai_lie_er_avatar',
    fullImage: 'hero_sai_lie_er_full',
    icon: 'hero_sai_lie_er_icon',
    lore: '恐惧化身，瓦解敌军意志。',
    quotes: [
      '恐惧吧！',
      '内心深处的恐惧...',
      '崩溃吧！'
    ]
  },
  {
    id: 'ba-er',
    name: '暗翼·巴尔',
    faction: 'demon',
    quality: 'red',
    rarity: 97,
    stars: 5,
    attributes: {
      command: 96,
      strength: 100,
      strategy: 26,
      defense: 84
    },
    growthRates: {
      command: 1.2,
      strength: 1.3,
      strategy: 0.3,
      defense: 1.0
    },
    maxLevelAttributes: {
      command: 96,
      strength: 100,
      strategy: 26,
      defense: 84
    },
    activeSkill: {
      id: 'an-yi-chong-feng',
      name: '暗翼冲锋',
      description: '大范围横扫击退',
      type: 'active',
      effects: [
        { type: 'damage', value: 160, target: 'enemy' },
        { type: 'control', value: 100, target: 'enemy', duration: 1 }
      ],
      cooldown: 18,
      levels: [
        { level: 1, effect: '横扫+击退', description: '大范围伤害并击退敌人', cooldown: 18 }
      ],
      tags: ['damage', 'charge', 'aoe'],
      icon: 'skill_wing_charge'
    },
    passiveSkill: {
      id: 'zhan-mo',
      name: '战魔',
      description: '攻击+45%，暴击+30%',
      type: 'passive',
      effects: [
        { type: 'attack', value: 45, target: 'self' },
        { type: 'crit', value: 30, target: 'self' }
      ],
      levels: [
        { level: 1, effect: '攻击+45%，暴击+30%', description: '攻击+45%，暴击+30%' }
      ],
      tags: ['damage', 'passive', 'crit'],
      icon: 'skill_war_demon'
    },
    talent: {
      id: 'ye-zhan-shang-hai',
      name: '野战伤害+65%',
      description: '野战伤害+65%',
      type: 'talent',
      effects: [
        { type: 'buff', value: 65, target: 'self', condition: 'fieldBattle' }
      ],
      levels: [
        { level: 1, effect: '野战+65%', description: '野战伤害+65%' }
      ],
      tags: ['damage', 'talent', 'field'],
      icon: 'talent_war_god'
    },
    bonds: [
      {
        id: 'zhan-zheng-zhu-zai',
        name: '战争主宰',
        description: '巴尔+摩洛克+贝希摩斯 → 野战+75%',
        heroes: ['ba-er', 'mo-luo-ke', 'bei-xi-mo-si'],
        effects: [
          { attribute: 'strength', bonus: 75, condition: '摩洛克和贝希摩斯在队' }
        ],
        activationCondition: { requiredStars: 12, requiredLevel: 50 },
        icon: 'bond_war'
      }
    ],
    bondActive: false,
    equipment: {},
    isNFT: false,
    level: 1,
    experience: 0,
    status: 'idle',
    battleStats: {
      battlesWon: 0,
      battlesLost: 0,
      totalDamage: 0,
      totalHealing: 0,
      criticalHits: 0,
      dodges: 0
    },
    getExperience: 1000,
    avatar: 'hero_ba_er_avatar',
    fullImage: 'hero_ba_er_full',
    icon: 'hero_ba_er_icon',
    lore: '炼狱战神，野战无敌。',
    quotes: [
      '战！',
      '野战，我才是王者。',
      '杀光一切！'
    ]
  },
  {
    id: 'mo-fei-si',
    name: '血祭·莫菲斯',
    faction: 'demon',
    quality: 'orange',
    rarity: 81,
    stars: 3,
    attributes: {
      command: 74,
      strength: 88,
      strategy: 45,
      defense: 68
    },
    growthRates: {
      command: 0.9,
      strength: 1.1,
      strategy: 0.6,
      defense: 0.8
    },
    maxLevelAttributes: {
      command: 74,
      strength: 88,
      strategy: 45,
      defense: 68
    },
    activeSkill: {
      id: 'lian-yu-xian-ji',
      name: '炼狱献祭',
      description: '8秒伤害翻倍',
      type: 'active',
      effects: [
        { type: 'buff', value: 100, target: 'self', duration: 8 }
      ],
      cooldown: 18,
      levels: [
        { level: 1, effect: '伤害翻倍', description: '献祭兵力，8秒内伤害翻倍', cooldown: 18 }
      ],
      tags: ['damage', 'buff', 'sacrifice'],
      icon: 'skill_sacrifice'
    },
    passiveSkill: {
      id: 'zhou-yuan',
      name: '咒怨',
      description: '死亡自爆攻击100%',
      type: 'passive',
      effects: [
        { type: 'damage', value: 100, target: 'enemy', condition: 'death' }
      ],
      levels: [
        { level: 1, effect: '死亡自爆', description: '死亡时自爆，造成100%攻击伤害' }
      ],
      tags: ['damage', 'passive', 'suicide'],
      icon: 'skill_grudge'
    },
    talent: {
      id: 'xian-ji-bao-fa',
      name: '献祭10%兵力→攻击+100%',
      description: '献祭10%兵力→攻击+100%',
      type: 'talent',
      effects: [
        { type: 'special', value: -10, target: 'self', condition: 'sacrifice' },
        { type: 'buff', value: 100, target: 'self', condition: 'sacrificed' }
      ],
      levels: [
        { level: 1, effect: '献祭增攻', description: '献祭10%兵力，攻击+100%' }
      ],
      tags: ['damage', 'talent', 'sacrifice'],
      icon: 'talent_blood'
    },
    bonds: [
      {
        id: 'xian-ji-zhi-li',
        name: '献祭之力',
        description: '莫菲斯+萨洛斯+摩洛克 → 献祭增益+65%',
        heroes: ['mo-fei-si', 'sa-luo-si', 'mo-luo-ke'],
        effects: [
          { attribute: 'strength', bonus: 65, condition: '萨洛斯和摩洛克在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_sacrifice'
      }
    ],
    bondActive: false,
    equipment: {},
    isNFT: false,
    level: 1,
    experience: 0,
    status: 'idle',
    battleStats: {
      battlesWon: 0,
      battlesLost: 0,
      totalDamage: 0,
      totalHealing: 0,
      criticalHits: 0,
      dodges: 0
    },
    getExperience: 1000,
    avatar: 'hero_mo_fei_si_avatar',
    fullImage: 'hero_mo_fei_si_full',
    icon: 'hero_mo_fei_si_icon',
    lore: '以命换力，不惜一切取胜。',
    quotes: [
      '以血为祭！',
      '力量，需要代价。',
      '玉石俱焚！'
    ]
  }
];

export const demonHeroesWithIds = demonHeroes.map(hero => ({
  ...hero,
  id: generateId()
}));
