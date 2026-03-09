import { Hero, Race, Quality } from '../types/Hero';

export const angelHeroes: Hero[] = [
  {
    id: 'a_luoxi',
    name: '圣辉·洛曦',
    race: Race.ANGEL,
    quality: Quality.RED,
    position: '群疗核心',
    troopType: '圣光使徒',
    stats: { command: 78, strength: 32, strategy: 100, defense: 62 },
    talent: {
      id: 't_luoxi',
      name: '圣辉',
      type: 'Talent',
      description: '每秒回血3%（光环）'
    },
    activeSkill: {
      id: 'a_luoxi',
      name: '神恩复活',
      type: 'Active',
      description: '复活阵亡部队30%',
      cooldown: 20
    },
    passiveSkill: {
      id: 'p_luoxi',
      name: '圣洁',
      type: 'Passive',
      description: '治疗+30%，净化所有负面'
    },
    bond: {
      id: 'b_sheng_guang_shou_hu',
      name: '圣光守护',
      description: '洛曦+迦南+艾琳娜',
      requiredHeroes: ['a_luoxi', 'a_jianan', 'a_ailinna'],
      effect: '治疗+45%'
    },
    story: '圣光天使长，执掌治愈与重生。'
  },
  {
    id: 'a_jianan',
    name: '守御·迦南',
    race: Race.ANGEL,
    quality: Quality.ORANGE,
    position: '防御壁垒',
    troopType: '守护天使',
    stats: { command: 85, strength: 60, strategy: 40, defense: 98 }, // Inferred from "Defense Wall"
    talent: {
      id: 't_jianan',
      name: '壁垒',
      type: 'Talent',
      description: '防御+35%，减伤25%'
    },
    activeSkill: {
      id: 'a_jianan',
      name: '神圣庇护',
      type: 'Active',
      description: '全队无敌4秒',
      cooldown: 18
    },
    passiveSkill: {
      id: 'p_jianan',
      name: '不屈',
      type: 'Passive',
      description: '免疫一次致死伤害'
    },
    bond: {
      id: 'b_sheng_dun_jie_jie',
      name: '圣盾结界',
      description: '迦南+乌列+安度斯',
      requiredHeroes: ['a_jianan', 'a_wulie', 'a_andusi'],
      effect: '防御+45%'
    },
    story: '天界守卫，以圣光之盾护佑忠义。'
  },
  {
    id: 'a_mijiaer',
    name: '裁决·米迦尔',
    race: Race.ANGEL,
    quality: Quality.RED,
    position: '审判输出',
    troopType: '光翼战士',
    stats: { command: 96, strength: 98, strategy: 42, defense: 78 },
    talent: {
      id: 't_mijiaer',
      name: '裁决',
      type: 'Talent',
      description: '对恶魔伤害+55%'
    },
    activeSkill: {
      id: 'a_mijiaer',
      name: '圣剑裁决',
      type: 'Active',
      description: '全体巨额圣光伤害',
      cooldown: 18
    },
    passiveSkill: {
      id: 'p_mijiaer',
      name: '破魔',
      type: 'Passive',
      description: '无视恶魔防御35%'
    },
    bond: {
      id: 'b_tian_fa_zhi_ren',
      name: '天罚之刃',
      description: '米迦尔+瑟兰迪尔+晨曦',
      requiredHeroes: ['a_mijiaer', 'a_selandier', 'a_chenxi'],
      effect: '恶魔特攻+65%'
    },
    story: '审判天使，专斩邪魔。'
  },
  {
    id: 'a_ailinna',
    name: '祈愿·艾琳娜',
    race: Race.ANGEL,
    quality: Quality.ORANGE,
    position: '全队增益',
    troopType: '祈愿天使',
    stats: { command: 72, strength: 28, strategy: 94, defense: 56 },
    talent: {
      id: 't_ailinna',
      name: '祈福',
      type: 'Talent',
      description: '全属性+18%'
    },
    activeSkill: {
      id: 'a_ailinna',
      name: '光辉祈愿',
      type: 'Active',
      description: '6秒属性翻倍',
      cooldown: 15
    },
    passiveSkill: {
      id: 'p_ailinna',
      name: '净化',
      type: 'Passive',
      description: '每3秒清1个负面'
    },
    bond: {
      id: 'b_sheng_guang_zhu_fu',
      name: '圣光祝福',
      description: '艾琳娜+洛曦+拉斐尔',
      requiredHeroes: ['a_ailinna', 'a_luoxi', 'a_lafeier'],
      effect: '增益+40%'
    },
    story: '祈愿天使，赐福全军。'
  },
  {
    id: 'a_lafeier',
    name: '战魂·拉斐尔',
    race: Race.ANGEL,
    quality: Quality.ORANGE,
    position: '持续治疗',
    troopType: '治愈天使',
    stats: { command: 66, strength: 26, strategy: 96, defense: 54 },
    talent: {
      id: 't_lafeier',
      name: '愈合',
      type: 'Talent',
      description: '战斗中每秒回血2%'
    },
    activeSkill: {
      id: 'a_lafeier',
      name: '生命之光',
      type: 'Active',
      description: '瞬间回血40%+持续治疗',
      cooldown: 12
    },
    passiveSkill: {
      id: 'p_lafeier',
      name: '生机',
      type: 'Passive',
      description: '治疗无法被削弱'
    },
    bond: {
      id: 'b_sheng_ming_song_ge',
      name: '生命颂歌',
      description: '拉斐尔+洛曦+艾琳娜',
      requiredHeroes: ['a_lafeier', 'a_luoxi', 'a_ailinna'],
      effect: '持续治疗+30%'
    },
    story: '战场治愈天使，令士兵不倒。'
  },
  {
    id: 'a_selandier',
    name: '光翼·瑟兰迪尔',
    race: Race.ANGEL,
    quality: Quality.ORANGE,
    position: '速援突袭',
    troopType: '光翼骑兵',
    stats: { command: 70, strength: 88, strategy: 50, defense: 50 }, // Inferred
    talent: {
      id: 't_selandier',
      name: '神速',
      type: 'Talent',
      description: '行军速度+60%'
    },
    activeSkill: {
      id: 'a_selandier',
      name: '圣光突袭',
      type: 'Active',
      description: '瞬间支援+范围伤害',
      cooldown: 15
    },
    passiveSkill: {
      id: 'p_selandier',
      name: '迅捷',
      type: 'Passive',
      description: '攻击间隔-25%'
    },
    bond: {
      id: 'b_tian_guang_chi_yuan',
      name: '天光驰援',
      description: '瑟兰迪尔+米迦尔+晨曦',
      requiredHeroes: ['a_selandier', 'a_mijiaer', 'a_chenxi'],
      effect: '野战速度+45%'
    },
    story: '极速光翼天使，千里驰援。'
  },
  {
    id: 'a_wulie',
    name: '天盾·乌列',
    race: Race.ANGEL,
    quality: Quality.ORANGE,
    position: '城防天使',
    troopType: '壁垒天使',
    stats: { command: 88, strength: 42, strategy: 48, defense: 100 },
    talent: {
      id: 't_wulie',
      name: '镇守',
      type: 'Talent',
      description: '守城城防+60%'
    },
    activeSkill: {
      id: 'a_wulie',
      name: '天国壁垒',
      type: 'Active',
      description: '城池无敌8秒',
      cooldown: 20
    },
    passiveSkill: {
      id: 'p_wulie',
      name: '坚城',
      type: 'Passive',
      description: '城墙耐久+45%'
    },
    bond: {
      id: 'b_sheng_yu_shou_hu',
      name: '圣域守护',
      description: '乌列+迦南+安度斯',
      requiredHeroes: ['a_wulie', 'a_jianan', 'a_andusi'],
      effect: '守城效果+60%'
    },
    story: '城池守护天使，坚城如天国。'
  },
  {
    id: 'a_liya',
    name: '清心·莉娅',
    race: Race.ANGEL,
    quality: Quality.ORANGE,
    position: '驱散控制',
    troopType: '净化天使',
    stats: { command: 64, strength: 30, strategy: 92, defense: 50 },
    talent: {
      id: 't_liya',
      name: '清心',
      type: 'Talent',
      description: '每5秒驱散敌方1个增益'
    },
    activeSkill: {
      id: 'a_liya',
      name: '神圣沉默',
      type: 'Active',
      description: '全体禁技5秒',
      cooldown: 15
    },
    passiveSkill: {
      id: 'p_liya',
      name: '破邪',
      type: 'Passive',
      description: '敌方治疗-55%'
    },
    bond: {
      id: 'b_jing_shi_sheng_guang',
      name: '净世圣光',
      description: '莉娅+艾琳娜+洛曦',
      requiredHeroes: ['a_liya', 'a_ailinna', 'a_luoxi'],
      effect: '驱散必中'
    },
    story: '净化一切邪咒与负面。'
  },
  {
    id: 'a_andusi',
    name: '神佑·安度斯',
    race: Race.ANGEL,
    quality: Quality.ORANGE,
    position: '保命辅助',
    troopType: '天命天使',
    stats: { command: 82, strength: 38, strategy: 66, defense: 86 },
    talent: {
      id: 't_andusi',
      name: '神佑',
      type: 'Talent',
      description: '全队免疫暴击'
    },
    activeSkill: {
      id: 'a_andusi',
      name: '天命庇护',
      type: 'Active',
      description: '全队免死1次，回血20%',
      cooldown: 18
    },
    passiveSkill: {
      id: 'p_andusi',
      name: '幸运',
      type: 'Passive',
      description: '闪避+18%'
    },
    bond: {
      id: 'b_tian_ming_suo_gui',
      name: '天命所归',
      description: '安度斯+迦南+乌列',
      requiredHeroes: ['a_andusi', 'a_jianan', 'a_wulie'],
      effect: '生存+50%'
    },
    story: '天命守护天使。'
  },
  {
    id: 'a_chenxi',
    name: '耀光·晨曦',
    race: Race.ANGEL,
    quality: Quality.RED,
    position: '开场爆发',
    troopType: '破晓天使',
    stats: { command: 80, strength: 95, strategy: 60, defense: 60 }, // Inferred
    talent: {
      id: 't_chenxi',
      name: '破晓',
      type: 'Talent',
      description: '前10秒伤害+45%'
    },
    activeSkill: {
      id: 'a_chenxi',
      name: '圣光破晓',
      type: 'Active',
      description: '伤害+眩晕2秒',
      cooldown: 15
    },
    passiveSkill: {
      id: 'p_chenxi',
      name: '耀光',
      type: 'Passive',
      description: '攻击+18%，暴击+20%'
    },
    bond: {
      id: 'b_tian_guang_jiang_lin',
      name: '天光降临',
      description: '晨曦+米迦尔+瑟兰迪尔',
      requiredHeroes: ['a_chenxi', 'a_mijiaer', 'a_selandier'],
      effect: '开场伤害+65%'
    },
    story: '黎明天使，破晓破暗。'
  }
];
