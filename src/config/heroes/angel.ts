import { Hero } from '../../types/slg/hero.types';
import { generateId } from '../../utils/helpers';

export const angelHeroes: Hero[] = [
  {
    id: 'luo-xi',
    name: '圣辉·洛曦',
    faction: 'angel',
    quality: 'red',
    rarity: 95,
    stars: 5,
    attributes: {
      command: 78,
      strength: 32,
      strategy: 100,
      defense: 62
    },
    growthRates: {
      command: 0.9,
      strength: 0.4,
      strategy: 1.3,
      defense: 0.7
    },
    maxLevelAttributes: {
      command: 78,
      strength: 32,
      strategy: 100,
      defense: 62
    },
    activeSkill: {
      id: 'shen-en-fu-huo',
      name: '神恩复活',
      description: '复活阵亡部队30%',
      type: 'active',
      effects: [
        { type: 'special', value: 30, target: 'ally' }
      ],
      cooldown: 20,
      levels: [
        { level: 1, effect: '复活30%部队', description: '复活阵亡部队30%（全场1次）', cooldown: 20 }
      ],
      tags: ['heal', 'revive'],
      icon: 'skill_resurrection'
    },
    passiveSkill: {
      id: 'sheng-jie',
      name: '圣洁',
      description: '治疗+30%，净化所有负面',
      type: 'passive',
      effects: [
        { type: 'healBoost', value: 30, target: 'self' },
        { type: 'special', value: 100, target: 'ally', condition: 'purify' }
      ],
      levels: [
        { level: 1, effect: '治疗+30%，净化负面', description: '治疗+30%，净化所有负面' }
      ],
      tags: ['heal', 'purify'],
      icon: 'skill_purity'
    },
    talent: {
      id: 'mei-miao-hui-xue',
      name: '每秒回血3%（光环）',
      description: '每秒回血3%（光环）',
      type: 'talent',
      effects: [
        { type: 'heal', value: 3, target: 'ally', condition: 'aura' }
      ],
      levels: [
        { level: 1, effect: '每秒回血3%', description: '每秒回血3%（光环）' }
      ],
      tags: ['heal', 'aura', 'talent'],
      icon: 'talent_aura'
    },
    bonds: [
      {
        id: 'sheng-guang-shou-hu',
        name: '圣光守护',
        description: '洛曦+迦南+艾琳娜 → 治疗+45%',
        heroes: ['luo-xi', 'jia-nan', 'ai-lin-na'],
        effects: [
          { attribute: 'strategy', bonus: 45, condition: '迦南和艾琳娜在队' }
        ],
        activationCondition: { requiredStars: 12, requiredLevel: 50 },
        icon: 'bond_guardians'
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
    avatar: 'hero_luo_xi_avatar',
    fullImage: 'hero_luo_xi_full',
    icon: 'hero_luo_xi_icon',
    lore: '圣光天使长，执掌治愈与重生。',
    quotes: [
      '光明终将驱散黑暗。',
      '生命是最宝贵的礼物。',
      '在我的圣光下，无人会倒下。'
    ]
  },
  {
    id: 'jia-nan',
    name: '守御·迦南',
    faction: 'angel',
    quality: 'orange',
    rarity: 82,
    stars: 3,
    attributes: {
      command: 80,
      strength: 45,
      strategy: 55,
      defense: 98
    },
    growthRates: {
      command: 1.0,
      strength: 0.5,
      strategy: 0.7,
      defense: 1.2
    },
    maxLevelAttributes: {
      command: 80,
      strength: 45,
      strategy: 55,
      defense: 98
    },
    activeSkill: {
      id: 'shen-sheng-bi-hu',
      name: '神圣庇护',
      description: '全队无敌4秒',
      type: 'active',
      effects: [
        { type: 'special', value: 100, target: 'ally', duration: 4 }
      ],
      cooldown: 18,
      levels: [
        { level: 1, effect: '全队无敌4秒', description: '全队无敌4秒（全场1次）', cooldown: 18 }
      ],
      tags: ['shield', 'invincible'],
      icon: 'skill_divine_shield'
    },
    passiveSkill: {
      id: 'bu-qu',
      name: '不屈',
      description: '免疫一次致死伤害',
      type: 'passive',
      effects: [
        { type: 'special', value: 100, target: 'self', condition: 'immuneDeath' }
      ],
      levels: [
        { level: 1, effect: '免疫致死', description: '免疫一次致死伤害' }
      ],
      tags: ['defense', 'passive'],
      icon: 'skill_invincible'
    },
    talent: {
      id: 'fang-yu-jian-shang',
      name: '防御+35%，减伤25%',
      description: '防御+35%，减伤25%',
      type: 'talent',
      effects: [
        { type: 'defense', value: 35, target: 'self' },
        { type: 'debuff', value: -25, target: 'self', condition: 'damage' }
      ],
      levels: [
        { level: 1, effect: '防御+35%，减伤25%', description: '防御+35%，伤害减免25%' }
      ],
      tags: ['defense', 'talent'],
      icon: 'talent_wall'
    },
    bonds: [
      {
        id: 'sheng-dun-jie-jie',
        name: '圣盾结界',
        description: '迦南+乌列+安度斯 → 防御+45%',
        heroes: ['jia-nan', 'wu-lie', 'an-du-si'],
        effects: [
          { attribute: 'defense', bonus: 45, condition: '乌列和安度斯在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_shields'
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
    avatar: 'hero_jia_nan_avatar',
    fullImage: 'hero_jia_nan_full',
    icon: 'hero_jia_nan_icon',
    lore: '天界守卫，以圣光之盾护佑忠义。',
    quotes: [
      '以吾之盾，护吾之民。',
      '圣光不灭，吾亦不倒。',
      '退后者，有死无生。'
    ]
  },
  {
    id: 'mi-jia-er',
    name: '裁决·米迦尔',
    faction: 'angel',
    quality: 'red',
    rarity: 96,
    stars: 5,
    attributes: {
      command: 96,
      strength: 98,
      strategy: 42,
      defense: 78
    },
    growthRates: {
      command: 1.2,
      strength: 1.2,
      strategy: 0.5,
      defense: 1.0
    },
    maxLevelAttributes: {
      command: 96,
      strength: 98,
      strategy: 42,
      defense: 78
    },
    activeSkill: {
      id: 'sheng-jian-cai-jue',
      name: '圣剑裁决',
      description: '全体巨额圣光伤害',
      type: 'active',
      effects: [
        { type: 'damage', value: 180, target: 'enemy' }
      ],
      cooldown: 18,
      levels: [
        { level: 1, effect: '全体圣光伤害', description: '对全体敌人造成180%圣光伤害', cooldown: 18 }
      ],
      tags: ['damage', 'holy', 'aoe'],
      icon: 'skill_holy_strike'
    },
    passiveSkill: {
      id: 'po-mo',
      name: '破魔',
      description: '无视恶魔防御35%',
      type: 'passive',
      effects: [
        { type: 'special', value: 35, target: 'enemy', condition: 'demon' }
      ],
      levels: [
        { level: 1, effect: '无视恶魔防御35%', description: '对恶魔敌人无视35%防御' }
      ],
      tags: ['damage', 'passive', 'demon'],
      icon: 'skill_anti_demon'
    },
    talent: {
      id: 'dui-mo-shang-hai',
      name: '对恶魔伤害+55%',
      description: '对恶魔伤害+55%',
      type: 'talent',
      effects: [
        { type: 'buff', value: 55, target: 'self', condition: 'demon' }
      ],
      levels: [
        { level: 1, effect: '对恶魔+55%', description: '对恶魔伤害+55%' }
      ],
      tags: ['damage', 'talent', 'demon'],
      icon: 'talent_judgment'
    },
    bonds: [
      {
        id: 'tian-fa-zhi-ren',
        name: '天罚之刃',
        description: '米迦尔+瑟兰迪尔+晨曦 → 恶魔特攻+65%',
        heroes: ['mi-jia-er', 'se-lan-di-er', 'chen-xi'],
        effects: [
          { attribute: 'strength', bonus: 65, condition: '瑟兰迪尔和晨曦在队，敌人为恶魔' }
        ],
        activationCondition: { requiredStars: 12, requiredLevel: 50 },
        icon: 'bond_justice'
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
    avatar: 'hero_mi_jia_er_avatar',
    fullImage: 'hero_mi_jia_er_full',
    icon: 'hero_mi_jia_er_icon',
    lore: '审判天使，专斩邪魔。',
    quotes: [
      '邪恶，终将受到审判。',
      '圣光之下，魑魅魍魉无所遁形。',
      '接受制裁吧！'
    ]
  },
  {
    id: 'ai-lin-na',
    name: '祈愿·艾琳娜',
    faction: 'angel',
    quality: 'orange',
    rarity: 81,
    stars: 3,
    attributes: {
      command: 72,
      strength: 28,
      strategy: 94,
      defense: 56
    },
    growthRates: {
      command: 0.9,
      strength: 0.3,
      strategy: 1.2,
      defense: 0.7
    },
    maxLevelAttributes: {
      command: 72,
      strength: 28,
      strategy: 94,
      defense: 56
    },
    activeSkill: {
      id: 'guang-hui-qi-yuan',
      name: '光辉祈愿',
      description: '6秒属性翻倍',
      type: 'active',
      effects: [
        { type: 'buff', value: 100, target: 'ally', duration: 6 }
      ],
      cooldown: 15,
      levels: [
        { level: 1, effect: '6秒属性翻倍', description: '全队属性翻倍，持续6秒', cooldown: 15 }
      ],
      tags: ['buff', 'buff'],
      icon: 'skill_blessing'
    },
    passiveSkill: {
      id: 'jing-hua',
      name: '净化',
      description: '每3秒清1个负面',
      type: 'passive',
      effects: [
        { type: 'special', value: 1, target: 'ally', condition: 'purify' }
      ],
      levels: [
        { level: 1, effect: '每3秒净化1个负面', description: '每3秒清除1个负面效果' }
      ],
      tags: ['purify', 'passive'],
      icon: 'skill_cleanse'
    },
    talent: {
      id: 'quan-shu-xing-jia',
      name: '全属性+18%',
      description: '全属性+18%',
      type: 'talent',
      effects: [
        { type: 'buff', value: 18, target: 'self' }
      ],
      levels: [
        { level: 1, effect: '全属性+18%', description: '全属性+18%' }
      ],
      tags: ['buff', 'talent'],
      icon: 'talent_blessing'
    },
    bonds: [
      {
        id: 'sheng-guang-zhu-fu',
        name: '圣光祝福',
        description: '艾琳娜+洛曦+拉斐尔 → 增益+40%',
        heroes: ['ai-lin-na', 'luo-xi', 'la-fei-er'],
        effects: [
          { attribute: 'strategy', bonus: 40, condition: '洛曦和拉斐尔在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_prayers'
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
    avatar: 'hero_ai_lin_na_avatar',
    fullImage: 'hero_ai_lin_na_full',
    icon: 'hero_ai_lin_na_icon',
    lore: '祈愿天使，赐福全军。',
    quotes: [
      '愿圣光庇佑你们。',
      '祈祷，是力量的源泉。',
      '光明与我们同在。'
    ]
  },
  {
    id: 'la-fei-er',
    name: '战魂·拉斐尔',
    faction: 'angel',
    quality: 'orange',
    rarity: 80,
    stars: 3,
    attributes: {
      command: 66,
      strength: 26,
      strategy: 96,
      defense: 54
    },
    growthRates: {
      command: 0.8,
      strength: 0.3,
      strategy: 1.2,
      defense: 0.7
    },
    maxLevelAttributes: {
      command: 66,
      strength: 26,
      strategy: 96,
      defense: 54
    },
    activeSkill: {
      id: 'sheng-ming-zhi-guang',
      name: '生命之光',
      description: '瞬间回血40%+持续治疗',
      type: 'active',
      effects: [
        { type: 'heal', value: 40, target: 'ally' },
        { type: 'heal', value: 10, target: 'ally', duration: 8 }
      ],
      cooldown: 12,
      levels: [
        { level: 1, effect: '回血40%+持续治疗', description: '瞬间回血40%，并持续治疗8秒', cooldown: 12 }
      ],
      tags: ['heal', 'hot'],
      icon: 'skill_life_beam'
    },
    passiveSkill: {
      id: 'sheng-ji',
      name: '生机',
      description: '治疗无法被削弱',
      type: 'passive',
      effects: [
        { type: 'special', value: 100, target: 'self', condition: 'healImmune' }
      ],
      levels: [
        { level: 1, effect: '治疗无法被削弱', description: '治疗效果无法被削弱' }
      ],
      tags: ['heal', 'passive'],
      icon: 'skill_life_force'
    },
    talent: {
      id: 'zhan-chang-hui-xue',
      name: '战斗中每秒回血2%',
      description: '战斗中每秒回血2%',
      type: 'talent',
      effects: [
        { type: 'heal', value: 2, target: 'ally', condition: 'combat' }
      ],
      levels: [
        { level: 1, effect: '每秒回血2%', description: '战斗中每秒回血2%' }
      ],
      tags: ['heal', 'talent', 'combat'],
      icon: 'talent_combat_heal'
    },
    bonds: [
      {
        id: 'sheng-ming-song-ge',
        name: '生命颂歌',
        description: '拉斐尔+洛曦+艾琳娜 → 持续治疗+30%',
        heroes: ['la-fei-er', 'luo-xi', 'ai-lin-na'],
        effects: [
          { attribute: 'strategy', bonus: 30, condition: '洛曦和艾琳娜在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_healers'
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
    avatar: 'hero_la_fei_er_avatar',
    fullImage: 'hero_la_fei_er_full',
    icon: 'hero_la_fei_er_icon',
    lore: '战场治愈天使，令士兵不倒。',
    quotes: [
      '生命之火，永不熄灭。',
      '有我在，你们不会倒下。',
      '坚持住！'
    ]
  },
  {
    id: 'se-lan-di-er',
    name: '光翼·瑟兰迪尔',
    faction: 'angel',
    quality: 'orange',
    rarity: 79,
    stars: 3,
    attributes: {
      command: 70,
      strength: 85,
      strategy: 40,
      defense: 60
    },
    growthRates: {
      command: 0.9,
      strength: 1.1,
      strategy: 0.5,
      defense: 0.7
    },
    maxLevelAttributes: {
      command: 70,
      strength: 85,
      strategy: 40,
      defense: 60
    },
    activeSkill: {
      id: 'sheng-guang-tu-xi',
      name: '圣光突袭',
      description: '瞬间支援+范围伤害',
      type: 'active',
      effects: [
        { type: 'damage', value: 100, target: 'enemy' },
        { type: 'movement', value: 100, target: 'self' }
      ],
      cooldown: 15,
      levels: [
        { level: 1, effect: '瞬移+范围伤害', description: '瞬间移动到战场并造成范围伤害', cooldown: 15 }
      ],
      tags: ['damage', 'movement', 'charge'],
      icon: 'skill_rapid_deploy'
    },
    passiveSkill: {
      id: 'xun-jie',
      name: '迅捷',
      description: '攻击间隔-25%',
      type: 'passive',
      effects: [
        { type: 'buff', value: -25, target: 'self', condition: 'attackSpeed' }
      ],
      levels: [
        { level: 1, effect: '攻速-25%', description: '攻击间隔-25%' }
      ],
      tags: ['attack', 'passive'],
      icon: 'skill_swift'
    },
    talent: {
      id: 'hang-jun-su-du',
      name: '行军速度+60%',
      description: '行军速度+60%',
      type: 'talent',
      effects: [
        { type: 'movement', value: 60, target: 'self' }
      ],
      levels: [
        { level: 1, effect: '行军+60%', description: '行军速度+60%' }
      ],
      tags: ['movement', 'talent'],
      icon: 'talent_light_wing'
    },
    bonds: [
      {
        id: 'tian-guang-chi-yuan',
        name: '天光驰援',
        description: '瑟兰迪尔+米迦尔+晨曦 → 野战速度+45%',
        heroes: ['se-lan-di-er', 'mi-jia-er', 'chen-xi'],
        effects: [
          { attribute: 'strength', bonus: 45, condition: '米迦尔和晨曦在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_light_wings'
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
    avatar: 'hero_se_lan_di_er_avatar',
    fullImage: 'hero_se_lan_di_er_full',
    icon: 'hero_se_lan_di_er_icon',
    lore: '极速光翼天使，千里驰援。',
    quotes: [
      '光之翼，带我驰援。',
      '速度即是生命。',
      '我来了！'
    ]
  },
  {
    id: 'wu-lie',
    name: '天盾·乌列',
    faction: 'angel',
    quality: 'orange',
    rarity: 83,
    stars: 3,
    attributes: {
      command: 88,
      strength: 42,
      strategy: 48,
      defense: 100
    },
    growthRates: {
      command: 1.1,
      strength: 0.5,
      strategy: 0.6,
      defense: 1.3
    },
    maxLevelAttributes: {
      command: 88,
      strength: 42,
      strategy: 48,
      defense: 100
    },
    activeSkill: {
      id: 'tian-guo-bi-lei',
      name: '天国壁垒',
      description: '城池无敌8秒',
      type: 'active',
      effects: [
        { type: 'special', value: 100, target: 'ally', duration: 8, condition: 'fortress' }
      ],
      cooldown: 20,
      levels: [
        { level: 1, effect: '城池无敌8秒', description: '城池无敌8秒（全场1次）', cooldown: 20 }
      ],
      tags: ['shield', 'invincible', 'fortress'],
      icon: 'skill_fortress_shield'
    },
    passiveSkill: {
      id: 'jian-cheng',
      name: '坚城',
      description: '城墙耐久+45%',
      type: 'passive',
      effects: [
        { type: 'defense', value: 45, target: 'self', condition: 'fortress' }
      ],
      levels: [
        { level: 1, effect: '城墙耐久+45%', description: '城墙耐久+45%' }
      ],
      tags: ['defense', 'passive', 'fortress'],
      icon: 'skill_fortress_wall'
    },
    talent: {
      id: 'shou-cheng-cheng-fang',
      name: '守城城防+60%',
      description: '守城城防+60%',
      type: 'talent',
      effects: [
        { type: 'defense', value: 60, target: 'self', condition: 'defense' }
      ],
      levels: [
        { level: 1, effect: '守城城防+60%', description: '守城时城防+60%' }
      ],
      tags: ['defense', 'talent', 'fortress'],
      icon: 'talent_fortress_guard'
    },
    bonds: [
      {
        id: 'sheng-yu-shou-hu',
        name: '圣域守护',
        description: '乌列+迦南+安度斯 → 守城效果+60%',
        heroes: ['wu-lie', 'jia-nan', 'an-du-si'],
        effects: [
          { attribute: 'defense', bonus: 60, condition: '迦南和安度斯在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_fortress'
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
    avatar: 'hero_wu_lie_avatar',
    fullImage: 'hero_wu_lie_full',
    icon: 'hero_wu_lie_icon',
    lore: '城池守护天使，坚城如天国。',
    quotes: [
      '城在人在。',
      '天国的壁垒，永不倒塌。',
      '有我守护，无人可破。'
    ]
  },
  {
    id: 'li-ya',
    name: '清心·莉娅',
    faction: 'angel',
    quality: 'orange',
    rarity: 78,
    stars: 3,
    attributes: {
      command: 64,
      strength: 30,
      strategy: 92,
      defense: 50
    },
    growthRates: {
      command: 0.8,
      strength: 0.4,
      strategy: 1.1,
      defense: 0.6
    },
    maxLevelAttributes: {
      command: 64,
      strength: 30,
      strategy: 92,
      defense: 50
    },
    activeSkill: {
      id: 'shen-sheng-chen-mo',
      name: '神圣沉默',
      description: '全体禁技5秒',
      type: 'active',
      effects: [
        { type: 'debuff', value: 100, target: 'enemy', duration: 5, condition: 'skill' }
      ],
      cooldown: 15,
      levels: [
        { level: 1, effect: '全体禁技5秒', description: '全体敌人沉默5秒，无法释放技能', cooldown: 15 }
      ],
      tags: ['control', 'debuff', 'silence'],
      icon: 'skill_silence'
    },
    passiveSkill: {
      id: 'po-xie',
      name: '破邪',
      description: '敌方治疗-55%',
      type: 'passive',
      effects: [
        { type: 'debuff', value: -55, target: 'enemy', condition: 'heal' }
      ],
      levels: [
        { level: 1, effect: '敌治疗-55%', description: '敌方治疗效果-55%' }
      ],
      tags: ['debuff', 'passive'],
      icon: 'skill_anti_heal'
    },
    talent: {
      id: 'mei-5-miao-qu-san',
      name: '每5秒驱散敌方1个增益',
      description: '每5秒驱散敌方1个增益',
      type: 'talent',
      effects: [
        { type: 'special', value: 1, target: 'enemy', condition: 'purifyEnemy', duration: 5 }
      ],
      levels: [
        { level: 1, effect: '每5秒驱散1增益', description: '每5秒驱散敌方1个增益' }
      ],
      tags: ['debuff', 'talent'],
      icon: 'talent_purify'
    },
    bonds: [
      {
        id: 'jing-shi-sheng-guang',
        name: '净世圣光',
        description: '莉娅+艾琳娜+洛曦 → 驱散必中',
        heroes: ['li-ya', 'ai-lin-na', 'luo-xi'],
        effects: [
          { attribute: 'strategy', bonus: 30, condition: '艾琳娜和洛曦在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_purifiers'
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
    avatar: 'hero_li_ya_avatar',
    fullImage: 'hero_li_ya_full',
    icon: 'hero_li_ya_icon',
    lore: '净化一切邪咒与负面。',
    quotes: [
      '邪恶，无所遁形。',
      '净化，是我的使命。',
      '清除一切负面！'
    ]
  },
  {
    id: 'an-du-si',
    name: '神佑·安度斯',
    faction: 'angel',
    quality: 'orange',
    rarity: 81,
    stars: 3,
    attributes: {
      command: 82,
      strength: 38,
      strategy: 66,
      defense: 86
    },
    growthRates: {
      command: 1.0,
      strength: 0.5,
      strategy: 0.8,
      defense: 1.1
    },
    maxLevelAttributes: {
      command: 82,
      strength: 38,
      strategy: 66,
      defense: 86
    },
    activeSkill: {
      id: 'tian-ming-bi-hu',
      name: '天命庇护',
      description: '全队免死1次，回血20%',
      type: 'active',
      effects: [
        { type: 'special', value: 100, target: 'ally', condition: 'immuneDeath' },
        { type: 'heal', value: 20, target: 'ally' }
      ],
      cooldown: 18,
      levels: [
        { level: 1, effect: '全队免死+回血20%', description: '全队免死1次并恢复20%生命（全场1次）', cooldown: 18 }
      ],
      tags: ['shield', 'heal', 'revive'],
      icon: 'skill_fate_shield'
    },
    passiveSkill: {
      id: 'xing-yun',
      name: '幸运',
      description: '闪避+18%',
      type: 'passive',
      effects: [
        { type: 'dodge', value: 18, target: 'self' }
      ],
      levels: [
        { level: 1, effect: '闪避+18%', description: '闪避+18%' }
      ],
      tags: ['defense', 'passive', 'dodge'],
      icon: 'skill_lucky'
    },
    talent: {
      id: 'quan-dui-mian-bao-ji',
      name: '全队免疫暴击',
      description: '全队免疫暴击',
      type: 'talent',
      effects: [
        { type: 'special', value: 100, target: 'ally', condition: 'immuneCrit' }
      ],
      levels: [
        { level: 1, effect: '全队免疫暴击', description: '全队免疫暴击' }
      ],
      tags: ['defense', 'talent', 'crit'],
      icon: 'talent_fate'
    },
    bonds: [
      {
        id: 'tian-ming-suo-gui',
        name: '天命所归',
        description: '安度斯+迦南+乌列 → 生存+50%',
        heroes: ['an-du-si', 'jia-nan', 'wu-lie'],
        effects: [
          { attribute: 'defense', bonus: 50, condition: '迦南和乌列在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_fate'
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
    avatar: 'hero_an_du_si_avatar',
    fullImage: 'hero_an_du_si_full',
    icon: 'hero_an_du_si_icon',
    lore: '天命守护天使。',
    quotes: [
      '天命所归。',
      '命运，在我手中。',
      '幸运常伴。'
    ]
  },
  {
    id: 'chen-xi',
    name: '耀光·晨曦',
    faction: 'angel',
    quality: 'red',
    rarity: 94,
    stars: 5,
    attributes: {
      command: 76,
      strength: 90,
      strategy: 48,
      defense: 64
    },
    growthRates: {
      command: 0.9,
      strength: 1.1,
      strategy: 0.6,
      defense: 0.8
    },
    maxLevelAttributes: {
      command: 76,
      strength: 90,
      strategy: 48,
      defense: 64
    },
    activeSkill: {
      id: 'sheng-guang-po-xiao',
      name: '圣光破晓',
      description: '伤害+眩晕2秒',
      type: 'active',
      effects: [
        { type: 'damage', value: 130, target: 'enemy' },
        { type: 'control', value: 100, target: 'enemy', duration: 2 }
      ],
      cooldown: 15,
      levels: [
        { level: 1, effect: '伤害+眩晕2秒', description: '造成伤害并眩晕敌人2秒', cooldown: 15 }
      ],
      tags: ['damage', 'control', 'stun'],
      icon: 'skill_dawn'
    },
    passiveSkill: {
      id: 'yao-guang',
      name: '耀光',
      description: '攻击+18%，暴击+20%',
      type: 'passive',
      effects: [
        { type: 'attack', value: 18, target: 'self' },
        { type: 'crit', value: 20, target: 'self' }
      ],
      levels: [
        { level: 1, effect: '攻击+18%，暴击+20%', description: '攻击+18%，暴击+20%' }
      ],
      tags: ['damage', 'passive', 'crit'],
      icon: 'skill_radiance'
    },
    talent: {
      id: 'kai-chang-shang-hai',
      name: '前10秒伤害+45%',
      description: '前10秒伤害+45%',
      type: 'talent',
      effects: [
        { type: 'buff', value: 45, target: 'self', condition: 'earlyCombat' }
      ],
      levels: [
        { level: 1, effect: '开场伤害+45%', description: '前10秒伤害+45%' }
      ],
      tags: ['damage', 'talent', 'early'],
      icon: 'talent_dawn'
    },
    bonds: [
      {
        id: 'tian-guang-jiang-lin',
        name: '天光降临',
        description: '晨曦+米迦尔+瑟兰迪尔 → 开场伤害+65%',
        heroes: ['chen-xi', 'mi-jia-er', 'se-lan-di-er'],
        effects: [
          { attribute: 'strength', bonus: 65, condition: '米迦尔和瑟兰迪尔在队' }
        ],
        activationCondition: { requiredStars: 12, requiredLevel: 50 },
        icon: 'bond_dawn'
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
    avatar: 'hero_chen_xi_avatar',
    fullImage: 'hero_chen_xi_full',
    icon: 'hero_chen_xi_icon',
    lore: '黎明天使，破晓破暗。',
    quotes: [
      '黎明终将到来！',
      '破晓时分，正是出击之时。',
      '光明的力量！'
    ]
  }
];

export const angelHeroesWithIds = angelHeroes.map(hero => ({
  ...hero,
  id: generateId()
}));
