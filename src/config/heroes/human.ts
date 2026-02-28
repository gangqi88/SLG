import { Hero } from '../../types/slg/hero.types';
import { generateId } from '../../utils/helpers';

export const humanHeroes: Hero[] = [
  {
    id: 'su-mo',
    name: '苏墨',
    faction: 'human',
    quality: 'orange',
    rarity: 75,
    stars: 3,
    attributes: {
      command: 68,
      strength: 22,
      strategy: 92,
      defense: 45
    },
    growthRates: {
      command: 0.8,
      strength: 0.3,
      strategy: 1.2,
      defense: 0.6
    },
    maxLevelAttributes: {
      command: 68,
      strength: 22,
      strategy: 92,
      defense: 45
    },
    activeSkill: {
      id: 'cang-liang-shi',
      name: '仓廪实',
      description: '立即获得当前储量10%资源',
      type: 'active',
      effects: [
        { type: 'special', value: 10, target: 'self' }
      ],
      cooldown: 8 * 60 * 60,
      levels: [
        { level: 1, effect: '获得10%资源', description: '立即获得当前储量10%资源', cooldown: 8 * 60 * 60 }
      ],
      tags: ['resource', 'economy'],
      icon: 'skill_warehouse'
    },
    passiveSkill: {
      id: 'quan-nong',
      name: '劝农',
      description: '资源产量永久+12%',
      type: 'passive',
      effects: [
        { type: 'buff', value: 12, target: 'self' }
      ],
      levels: [
        { level: 1, effect: '资源产量+12%', description: '资源产量永久+12%' }
      ],
      tags: ['resource', 'economy'],
      icon: 'skill_farming'
    },
    talent: {
      id: 'quan-zi-yuan-chan-liang',
      name: '全资源产量+25%，粮食+15%',
      description: '全资源产量+25%，粮食+15%',
      type: 'talent',
      effects: [
        { type: 'buff', value: 25, target: 'self' },
        { type: 'buff', value: 15, target: 'self', condition: 'food' }
      ],
      levels: [
        { level: 1, effect: '全资源+25%，粮食+15%', description: '全资源产量+25%，粮食+15%' }
      ],
      tags: ['resource', 'economy', 'talent'],
      icon: 'talent_resources'
    },
    bonds: [
      {
        id: 'fan-shi-xian-liang',
        name: '凡世贤良',
        description: '苏墨+温竹+梁石 → 建造速度+30%',
        heroes: ['su-mo', 'wen-zhu', 'liang-shi'],
        effects: [
          { attribute: 'strategy', bonus: 30, condition: '温竹和梁石在队' }
        ],
        activationCondition: { requiredStars: 6, requiredLevel: 30 },
        icon: 'bond_scholars'
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
    avatar: 'hero_su_mo_avatar',
    fullImage: 'hero_su_mo_full',
    icon: 'hero_su_mo_icon',
    lore: '乱世农政隐士，可令荒地化为粮仓。',
    quotes: [
      '民以食为天，国以民为本。',
      '仓廪实而知礼节，衣食足而知荣辱。',
      '农为邦本，本固邦宁。'
    ]
  },
  {
    id: 'qin-lie',
    name: '秦烈',
    faction: 'human',
    quality: 'orange',
    rarity: 78,
    stars: 3,
    attributes: {
      command: 92,
      strength: 72,
      strategy: 33,
      defense: 96
    },
    growthRates: {
      command: 1.1,
      strength: 0.9,
      strategy: 0.4,
      defense: 1.2
    },
    maxLevelAttributes: {
      command: 92,
      strength: 72,
      strategy: 33,
      defense: 96
    },
    activeSkill: {
      id: 'pan-shi-yu',
      name: '磐石御',
      description: '全队护盾',
      type: 'active',
      effects: [
        { type: 'shield', value: 30, target: 'ally' }
      ],
      cooldown: 12,
      levels: [
        { level: 1, effect: '全队护盾30%', description: '为全体友军施加30%最大生命值的护盾', cooldown: 12 }
      ],
      tags: ['shield', 'defense'],
      icon: 'skill_shield'
    },
    passiveSkill: {
      id: 'tie-jia',
      name: '铁甲',
      description: '防御+18%，骑兵伤害-15%',
      type: 'passive',
      effects: [
        { type: 'defense', value: 18, target: 'self' },
        { type: 'debuff', value: -15, target: 'enemy', condition: 'cavalry' }
      ],
      levels: [
        { level: 1, effect: '防御+18%，骑伤-15%', description: '防御+18%，受到骑兵伤害-15%' }
      ],
      tags: ['defense', 'passive'],
      icon: 'skill_armor'
    },
    talent: {
      id: 'shou-cheng-fang-yu',
      name: '守城防御+40%，受伤-25%',
      description: '守城防御+40%，受伤-25%',
      type: 'talent',
      effects: [
        { type: 'defense', value: 40, target: 'self', condition: 'defense' },
        { type: 'debuff', value: -25, target: 'self', condition: 'damage' }
      ],
      levels: [
        { level: 1, effect: '守城防御+40%，受伤-25%', description: '守城防御+40%，受伤-25%' }
      ],
      tags: ['defense', 'talent', 'fortress'],
      icon: 'talent_fortress'
    },
    bonds: [
      {
        id: 'tie-xue-shu-cheng',
        name: '铁血戍城',
        description: '秦烈+钟离野+赵承彦 → 步兵血量+30%',
        heroes: ['qin-lie', 'zhong-li-ye', 'zhao-cheng-yan'],
        effects: [
          { attribute: 'defense', bonus: 30, condition: '钟离野和赵承彦在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_warriors'
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
    avatar: 'hero_qin_lie_avatar',
    fullImage: 'hero_qin_lie_full',
    icon: 'hero_qin_lie_icon',
    lore: '边关老兵，以血肉守护城池。',
    quotes: [
      '城在人在，城亡人亡。',
      '铁壁铜墙，誓死守卫。',
      '后退者，死！'
    ]
  },
  {
    id: 'wen-zhu',
    name: '温竹',
    faction: 'human',
    quality: 'orange',
    rarity: 76,
    stars: 3,
    attributes: {
      command: 62,
      strength: 31,
      strategy: 94,
      defense: 48
    },
    growthRates: {
      command: 0.7,
      strength: 0.4,
      strategy: 1.2,
      defense: 0.6
    },
    maxLevelAttributes: {
      command: 62,
      strength: 31,
      strategy: 94,
      defense: 48
    },
    activeSkill: {
      id: 'luan-xin-zhou',
      name: '乱心咒',
      description: '3部队混乱互攻',
      type: 'active',
      effects: [
        { type: 'debuff', value: 100, target: 'enemy', duration: 5 }
      ],
      cooldown: 15,
      levels: [
        { level: 1, effect: '混乱5秒', description: '使3支敌方部队混乱，互相攻击5秒', cooldown: 15 }
      ],
      tags: ['control', 'debuff'],
      icon: 'skill_confusion'
    },
    passiveSkill: {
      id: 'guan-shi',
      name: '观势',
      description: '敌方技能概率-10%',
      type: 'passive',
      effects: [
        { type: 'debuff', value: -10, target: 'enemy', condition: 'skill' }
      ],
      levels: [
        { level: 1, effect: '敌技能概率-10%', description: '敌方技能释放概率-10%' }
      ],
      tags: ['debuff', 'passive'],
      icon: 'skill_insight'
    },
    talent: {
      id: 'fang-gong-ji',
      name: '敌方攻击-12%，士气-20',
      description: '敌方攻击-12%，士气-20',
      type: 'talent',
      effects: [
        { type: 'debuff', value: -12, target: 'enemy', condition: 'attack' },
        { type: 'debuff', value: -20, target: 'enemy', condition: 'morale' }
      ],
      levels: [
        { level: 1, effect: '敌攻击-12%，士气-20', description: '敌方攻击-12%，士气-20' }
      ],
      tags: ['debuff', 'talent', 'morale'],
      icon: 'talent_weaken'
    },
    bonds: [
      {
        id: 'zhi-ji-lian-huan',
        name: '智计连环',
        description: '温竹+柳轻烟+南宫望 → 谋略效果+35%',
        heroes: ['wen-zhu', 'liu-qing-yan', 'nan-gong-wang'],
        effects: [
          { attribute: 'strategy', bonus: 35, condition: '柳轻烟和南宫望在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_strategists'
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
    avatar: 'hero_wen_zhu_avatar',
    fullImage: 'hero_wen_zhu_full',
    icon: 'hero_wen_zhu_icon',
    lore: '清雅攻心谋士，不动刀兵而胜。',
    quotes: [
      '上兵伐谋，其次伐交。',
      '不战而屈人之兵。',
      '攻心为上，攻城为下。'
    ]
  },
  {
    id: 'liang-shi',
    name: '梁石',
    faction: 'human',
    quality: 'purple',
    rarity: 55,
    stars: 2,
    attributes: {
      command: 44,
      strength: 18,
      strategy: 82,
      defense: 66
    },
    growthRates: {
      command: 0.5,
      strength: 0.2,
      strategy: 1.0,
      defense: 0.8
    },
    maxLevelAttributes: {
      command: 44,
      strength: 18,
      strategy: 82,
      defense: 66
    },
    activeSkill: {
      id: 'ji-xiu',
      name: '急修',
      description: '城防恢复35%',
      type: 'active',
      effects: [
        { type: 'special', value: 35, target: 'self' }
      ],
      cooldown: 6 * 60 * 60,
      levels: [
        { level: 1, effect: '城防恢复35%', description: '立即恢复35%城防值', cooldown: 6 * 60 * 60 }
      ],
      tags: ['building', 'repair'],
      icon: 'skill_build'
    },
    passiveSkill: {
      id: 'gu-ruo-jin-tang',
      name: '固若金汤',
      description: '城防+25%，陷阱伤害+15%',
      type: 'passive',
      effects: [
        { type: 'defense', value: 25, target: 'self' },
        { type: 'buff', value: 15, target: 'self', condition: 'trap' }
      ],
      levels: [
        { level: 1, effect: '城防+25%，陷阱伤+15%', description: '城防+25%，陷阱伤害+15%' }
      ],
      tags: ['defense', 'building', 'passive'],
      icon: 'skill_fortify'
    },
    talent: {
      id: 'jian-zao-su-du',
      name: '建造速度+35%',
      description: '建造速度+35%',
      type: 'talent',
      effects: [
        { type: 'buff', value: 35, target: 'self', condition: 'building' }
      ],
      levels: [
        { level: 1, effect: '建造速度+35%', description: '建造速度+35%' }
      ],
      tags: ['building', 'talent'],
      icon: 'talent_engineer'
    },
    bonds: [
      {
        id: 'gong-shi-jing-tong',
        name: '工事精通',
        description: '苏墨+梁石+苏晚晴 → 资源消耗-12%',
        heroes: ['su-mo', 'liang-shi', 'su-wan-qing'],
        effects: [
          { attribute: 'strategy', bonus: 12, condition: '苏墨和苏晚晴在队' }
        ],
        activationCondition: { requiredStars: 6, requiredLevel: 30 },
        icon: 'bond_engineers'
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
    avatar: 'hero_liang_shi_avatar',
    fullImage: 'hero_liang_shi_full',
    icon: 'hero_liang_shi_icon',
    lore: '天下第一巧匠，善筑坚城。',
    quotes: [
      '工欲善其事，必先利其器。',
      '筑城如育人，根基最重要。',
      '一砖一瓦，皆是心血。'
    ]
  },
  {
    id: 'liu-qing-yan',
    name: '柳轻烟',
    faction: 'human',
    quality: 'orange',
    rarity: 77,
    stars: 3,
    attributes: {
      command: 72,
      strength: 66,
      strategy: 78,
      defense: 52
    },
    growthRates: {
      command: 0.9,
      strength: 0.8,
      strategy: 1.0,
      defense: 0.6
    },
    maxLevelAttributes: {
      command: 72,
      strength: 66,
      strategy: 78,
      defense: 52
    },
    activeSkill: {
      id: 'qie-liang',
      name: '窃粮',
      description: '窃取敌方10%粮食',
      type: 'active',
      effects: [
        { type: 'special', value: 10, target: 'enemy' }
      ],
      cooldown: 10 * 60 * 60,
      levels: [
        { level: 1, effect: '窃取10%粮食', description: '窃取敌方10%粮食储备', cooldown: 10 * 60 * 60 }
      ],
      tags: ['resource', 'steal'],
      icon: 'skill_steal'
    },
    passiveSkill: {
      id: 'mi-tan',
      name: '密探',
      description: '行军速度+20%',
      type: 'passive',
      effects: [
        { type: 'buff', value: 20, target: 'self', condition: 'speed' }
      ],
      levels: [
        { level: 1, effect: '行军速度+20%', description: '行军速度+20%' }
      ],
      tags: ['movement', 'passive'],
      icon: 'skill_scout'
    },
    talent: {
      id: 'lue-duo-cheng-gong',
      name: '掠夺成功率+30%，行踪隐匿',
      description: '掠夺成功率+30%，行踪隐匿',
      type: 'talent',
      effects: [
        { type: 'buff', value: 30, target: 'self', condition: 'plunder' },
        { type: 'special', value: 100, target: 'self', condition: 'stealth' }
      ],
      levels: [
        { level: 1, effect: '掠夺+30%，隐匿', description: '掠夺成功率+30%，行踪隐匿' }
      ],
      tags: ['plunder', 'talent', 'stealth'],
      icon: 'talent_spies'
    },
    bonds: [
      {
        id: 'wu-ying-die-ying',
        name: '无影谍影',
        description: '柳轻烟+顾长风+南宫望 → 掠夺收益+40%',
        heroes: ['liu-qing-yan', 'gu-chang-feng', 'nan-gong-wang'],
        effects: [
          { attribute: 'strategy', bonus: 40, condition: '顾长风和南宫望在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_spies'
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
    avatar: 'hero_liu_qing_yan_avatar',
    fullImage: 'hero_liu_qing_yan_full',
    icon: 'hero_liu_qing_yan_icon',
    lore: '神秘女谍，来去无影。',
    quotes: [
      '来无影，去无踪。',
      '知己知彼，百战不殆。',
      '情报就是生命。'
    ]
  },
  {
    id: 'zhao-cheng-yan',
    name: '赵承彦',
    faction: 'human',
    quality: 'purple',
    rarity: 58,
    stars: 2,
    attributes: {
      command: 86,
      strength: 58,
      strategy: 66,
      defense: 62
    },
    growthRates: {
      command: 1.1,
      strength: 0.7,
      strategy: 0.8,
      defense: 0.8
    },
    maxLevelAttributes: {
      command: 86,
      strength: 58,
      strategy: 66,
      defense: 62
    },
    activeSkill: {
      id: 'zheng-jun',
      name: '整军',
      description: '恢复15%伤兵，攻击+10%',
      type: 'active',
      effects: [
        { type: 'heal', value: 15, target: 'ally' },
        { type: 'buff', value: 10, target: 'ally' }
      ],
      cooldown: 12,
      levels: [
        { level: 1, effect: '伤兵+15%，攻击+10%', description: '恢复15%伤兵，全队攻击+10%', cooldown: 12 }
      ],
      tags: ['heal', 'buff'],
      icon: 'skill_marshal'
    },
    passiveSkill: {
      id: 'jun-ji',
      name: '军纪',
      description: '士气永不低于30%',
      type: 'passive',
      effects: [
        { type: 'special', value: 30, target: 'ally', condition: 'morale' }
      ],
      levels: [
        { level: 1, effect: '士气≥30%', description: '士气永不低于30%' }
      ],
      tags: ['morale', 'passive'],
      icon: 'skill_discipline'
    },
    talent: {
      id: 'lian-bing-su-du',
      name: '练兵速度+45%，伤兵恢复+18%',
      description: '练兵速度+45%，伤兵恢复+18%',
      type: 'talent',
      effects: [
        { type: 'buff', value: 45, target: 'self', condition: 'training' },
        { type: 'buff', value: 18, target: 'self', condition: 'heal' }
      ],
      levels: [
        { level: 1, effect: '练兵+45%，伤兵+18%', description: '练兵速度+45%，伤兵恢复+18%' }
      ],
      tags: ['training', 'talent', 'heal'],
      icon: 'talent_trainer'
    },
    bonds: [
      {
        id: 'zhi-jun-yan-ming',
        name: '治军严明',
        description: '赵承彦+秦烈+钟离野 → 征兵消耗-18%',
        heroes: ['zhao-cheng-yan', 'qin-lie', 'zhong-li-ye'],
        effects: [
          { attribute: 'command', bonus: 18, condition: '秦烈和钟离野在队' }
        ],
        activationCondition: { requiredStars: 6, requiredLevel: 30 },
        icon: 'bond_military'
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
    avatar: 'hero_zhao_cheng_yan_avatar',
    fullImage: 'hero_zhao_cheng_yan_full',
    icon: 'hero_zhao_cheng_yan_icon',
    lore: '儒将治军，麾下皆精锐。',
    quotes: [
      '令行禁止，赏罚分明。',
      '养兵千日，用兵一时。',
      '精锐之师，所向披靡。'
    ]
  },
  {
    id: 'zhong-li-ye',
    name: '钟离野',
    faction: 'human',
    quality: 'orange',
    rarity: 80,
    stars: 4,
    attributes: {
      command: 90,
      strength: 94,
      strategy: 26,
      defense: 76
    },
    growthRates: {
      command: 1.1,
      strength: 1.2,
      strategy: 0.3,
      defense: 0.9
    },
    maxLevelAttributes: {
      command: 90,
      strength: 94,
      strategy: 26,
      defense: 76
    },
    activeSkill: {
      id: 'po-zhen-chong-feng',
      name: '破阵冲锋',
      description: '直线冲击+击退',
      type: 'active',
      effects: [
        { type: 'damage', value: 150, target: 'enemy' }
      ],
      cooldown: 15,
      levels: [
        { level: 1, effect: '直线冲击+击退', description: '对直线敌人造成150%伤害并击退', cooldown: 15 }
      ],
      tags: ['damage', 'charge', 'control'],
      icon: 'skill_charge'
    },
    passiveSkill: {
      id: 'xiao-yong',
      name: '骁勇',
      description: '武力+15%，暴击伤害+18%',
      type: 'passive',
      effects: [
        { type: 'buff', value: 15, target: 'self', condition: 'strength' },
        { type: 'buff', value: 18, target: 'self', condition: 'critDamage' }
      ],
      levels: [
        { level: 1, effect: '武力+15%，暴伤+18%', description: '武力+15%，暴击伤害+18%' }
      ],
      tags: ['damage', 'passive', 'crit'],
      icon: 'skill_brave'
    },
    talent: {
      id: 'di-bing-gong-ji',
      name: '兵力<50%时攻击+30%',
      description: '兵力<50%时攻击+30%',
      type: 'talent',
      effects: [
        { type: 'buff', value: 30, target: 'self', condition: 'lowHealth' }
      ],
      levels: [
        { level: 1, effect: '低血攻击+30%', description: '兵力<50%时攻击+30%' }
      ],
      tags: ['damage', 'talent', 'lowHealth'],
      icon: 'talent_berserker'
    },
    bonds: [
      {
        id: 'sha-chang-han-su',
        name: '沙场悍卒',
        description: '钟离野+秦烈+赵承彦 → 野战伤害+25%',
        heroes: ['zhong-li-ye', 'qin-lie', 'zhao-cheng-yan'],
        effects: [
          { attribute: 'strength', bonus: 25, condition: '秦烈和赵承彦在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_veterans'
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
    avatar: 'hero_zhong_li_ye_avatar',
    fullImage: 'hero_zhong_li_ye_full',
    icon: 'hero_zhong_li_ye_icon',
    lore: '草莽猛将，绝境可翻盘。',
    quotes: [
      '狭路相逢勇者胜！',
      '置之死地而后生。',
      '杀！'
    ]
  },
  {
    id: 'su-wan-qing',
    name: '苏晚晴',
    faction: 'human',
    quality: 'orange',
    rarity: 74,
    stars: 3,
    attributes: {
      command: 58,
      strength: 24,
      strategy: 90,
      defense: 50
    },
    growthRates: {
      command: 0.7,
      strength: 0.3,
      strategy: 1.1,
      defense: 0.6
    },
    maxLevelAttributes: {
      command: 58,
      strength: 24,
      strategy: 90,
      defense: 50
    },
    activeSkill: {
      id: 'miao-shou-hui-chun',
      name: '妙手回春',
      description: '群体回血25%',
      type: 'active',
      effects: [
        { type: 'heal', value: 25, target: 'ally' }
      ],
      cooldown: 12,
      levels: [
        { level: 1, effect: '群体回血25%', description: '为全体友军恢复25%最大生命值', cooldown: 12 }
      ],
      tags: ['heal', 'aoe'],
      icon: 'skill_heal'
    },
    passiveSkill: {
      id: 'hu-sheng',
      name: '护生',
      description: '战损-15%',
      type: 'passive',
      effects: [
        { type: 'buff', value: -15, target: 'ally', condition: 'casualty' }
      ],
      levels: [
        { level: 1, effect: '战损-15%', description: '战斗损失-15%' }
      ],
      tags: ['defense', 'passive'],
      icon: 'skill_protect'
    },
    talent: {
      id: 'shang-bing-zhuan-hua',
      name: '伤兵转化率+25%',
      description: '伤兵转化率+25%',
      type: 'talent',
      effects: [
        { type: 'buff', value: 25, target: 'self', condition: 'wounded' }
      ],
      levels: [
        { level: 1, effect: '伤兵转化+25%', description: '伤兵转化为兵力+25%' }
      ],
      tags: ['heal', 'talent'],
      icon: 'talent_medic'
    },
    bonds: [
      {
        id: 'ji-shi-an-min',
        name: '济世安民',
        description: '苏墨+梁石+苏晚晴 → 医疗速度+35%',
        heroes: ['su-mo', 'liang-shi', 'su-wan-qing'],
        effects: [
          { attribute: 'strategy', bonus: 35, condition: '苏墨和梁石在队' }
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
    avatar: 'hero_su_wan_qing_avatar',
    fullImage: 'hero_su_wan_qing_full',
    icon: 'hero_su_wan_qing_icon',
    lore: '乱世女医，不问阵营，只救苍生。',
    quotes: [
      '救死扶伤，医者本分。',
      '生命面前，无分敌我。',
      '药到病除。'
    ]
  },
  {
    id: 'gu-chang-feng',
    name: '顾长风',
    faction: 'human',
    quality: 'purple',
    rarity: 52,
    stars: 2,
    attributes: {
      command: 36,
      strength: 16,
      strategy: 84,
      defense: 38
    },
    growthRates: {
      command: 0.4,
      strength: 0.2,
      strategy: 1.0,
      defense: 0.5
    },
    maxLevelAttributes: {
      command: 36,
      strength: 16,
      strategy: 84,
      defense: 38
    },
    activeSkill: {
      id: 'wu-yi-yi-wu',
      name: '以物易物',
      description: '资源1:1转换',
      type: 'active',
      effects: [
        { type: 'special', value: 100, target: 'self' }
      ],
      cooldown: 3,
      levels: [
        { level: 1, effect: '资源1:1转换', description: '每日3次，资源1:1转换', cooldown: 3 }
      ],
      tags: ['resource', 'trade'],
      icon: 'skill_trade'
    },
    passiveSkill: {
      id: 'ju-cai',
      name: '聚财',
      description: '铜币产量+25%',
      type: 'passive',
      effects: [
        { type: 'buff', value: 25, target: 'self', condition: 'gold' }
      ],
      levels: [
        { level: 1, effect: '铜币+25%', description: '铜币产量+25%' }
      ],
      tags: ['resource', 'passive'],
      icon: 'skill_wealth'
    },
    talent: {
      id: 'shang-dui-shou-yi',
      name: '商队收益+40%，铜币+25%',
      description: '商队收益+40%，铜币+25%',
      type: 'talent',
      effects: [
        { type: 'buff', value: 40, target: 'self', condition: 'trade' },
        { type: 'buff', value: 25, target: 'self', condition: 'gold' }
      ],
      levels: [
        { level: 1, effect: '商队+40%，铜币+25%', description: '商队收益+40%，铜币+25%' }
      ],
      tags: ['resource', 'talent', 'trade'],
      icon: 'talent_merchant'
    },
    bonds: [
      {
        id: 'tian-xia-shang-lu',
        name: '天下商路',
        description: '顾长风+柳轻烟+南宫望 → 贸易损耗-25%',
        heroes: ['gu-chang-feng', 'liu-qing-yan', 'nan-gong-wang'],
        effects: [
          { attribute: 'strategy', bonus: 25, condition: '柳轻烟和南宫望在队' }
        ],
        activationCondition: { requiredStars: 6, requiredLevel: 30 },
        icon: 'bond_merchants'
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
    avatar: 'hero_gu_chang_feng_avatar',
    fullImage: 'hero_gu_chang_feng_full',
    icon: 'hero_gu_chang_feng_icon',
    lore: '巨商子弟，以财力养势。',
    quotes: [
      '有钱能使鬼推磨。',
      '商道即人道。',
      '和气生财。'
    ]
  },
  {
    id: 'nan-gong-wang',
    name: '南宫望',
    faction: 'human',
    quality: 'orange',
    rarity: 79,
    stars: 3,
    attributes: {
      command: 66,
      strength: 32,
      strategy: 96,
      defense: 46
    },
    growthRates: {
      command: 0.8,
      strength: 0.4,
      strategy: 1.2,
      defense: 0.6
    },
    maxLevelAttributes: {
      command: 66,
      strength: 32,
      strategy: 96,
      defense: 46
    },
    activeSkill: {
      id: 'feng-lei-yin',
      name: '风雷引',
      description: '全体雷电谋略伤害',
      type: 'active',
      effects: [
        { type: 'damage', value: 120, target: 'enemy' }
      ],
      cooldown: 18,
      levels: [
        { level: 1, effect: '全体雷电伤害', description: '对全体敌人造成120%雷电伤害', cooldown: 18 }
      ],
      tags: ['damage', 'magic', 'aoe'],
      icon: 'skill_thunder'
    },
    passiveSkill: {
      id: 'tian-ji',
      name: '天机',
      description: '免疫控制，10%闪避',
      type: 'passive',
      effects: [
        { type: 'special', value: 100, target: 'self', condition: 'immune' },
        { type: 'buff', value: 10, target: 'self', condition: 'dodge' }
      ],
      levels: [
        { level: 1, effect: '免疫控制，闪避+10%', description: '免疫控制，10%闪避' }
      ],
      tags: ['defense', 'passive', 'control'],
      icon: 'skill_divine'
    },
    talent: {
      id: 'bao-ji-yu-tian',
      name: '暴击+15%，雨天翻倍',
      description: '暴击+15%，雨天翻倍',
      type: 'talent',
      effects: [
        { type: 'buff', value: 15, target: 'self', condition: 'crit' },
        { type: 'buff', value: 100, target: 'self', condition: 'rain' }
      ],
      levels: [
        { level: 1, effect: '暴击+15%，雨天翻倍', description: '暴击+15%，雨天伤害翻倍' }
      ],
      tags: ['damage', 'talent', 'weather'],
      icon: 'talent_storm'
    },
    bonds: [
      {
        id: 'xing-xiang-mi-shu',
        name: '星象秘术',
        description: '南宫望+温竹+柳轻烟 → 技能伤害+30%',
        heroes: ['nan-gong-wang', 'wen-zhu', 'liu-qing-yan'],
        effects: [
          { attribute: 'strategy', bonus: 30, condition: '温竹和柳轻烟在队' }
        ],
        activationCondition: { requiredStars: 9, requiredLevel: 40 },
        icon: 'bond_astrologers'
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
    avatar: 'hero_nan_gong_wang_avatar',
    fullImage: 'hero_nan_gong_wang_full',
    icon: 'hero_nan_gong_wang_icon',
    lore: '观星隐士，借天地之力扭转战局。',
    quotes: [
      '天象异变，必有大事。',
      '顺应天时，方能制胜。',
      '天机不可泄露。'
    ]
  }
];

export const humanHeroesWithIds = humanHeroes.map(hero => ({
  ...hero,
  id: generateId()
}));
