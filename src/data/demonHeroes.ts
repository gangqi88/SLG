import { Hero, Race, Quality } from '../types/Hero';

export const demonHeroes: Hero[] = [
  {
    id: 'd_moloke',
    name: '暗狱·摩洛克',
    race: Race.DEMON,
    quality: Quality.RED,
    position: 'AOE核心',
    troopType: '炼狱魔王',
    stats: { command: 98, strength: 99, strategy: 44, defense: 82 },
    talent: {
      id: 't_moloke',
      name: '焚天',
      type: 'Talent',
      description: '攻击+45%，吸血+30%'
    },
    activeSkill: {
      id: 'a_moloke',
      name: '暗狱焚天',
      type: 'Active',
      description: '全体火伤+持续灼烧',
      cooldown: 18
    },
    passiveSkill: {
      id: 'p_moloke',
      name: '魔躯',
      type: 'Passive',
      description: '反弹25%伤害'
    },
    bond: {
      id: 'b_lian_yu_zhu_zai',
      name: '炼狱主宰',
      description: '摩洛克+萨洛斯+巴尔',
      requiredHeroes: ['d_moloke', 'd_salosi', 'd_baer'],
      effect: 'AOE+55%'
    },
    story: '炼狱魔王，以焚世之火吞噬一切。'
  },
  {
    id: 'd_kalong',
    name: '血刃·卡隆',
    race: Race.DEMON,
    quality: Quality.ORANGE,
    position: '残血收割',
    troopType: '收割恶魔',
    stats: { command: 60, strength: 92, strategy: 40, defense: 40 }, // Inferred
    talent: {
      id: 't_kalong',
      name: '血刃',
      type: 'Talent',
      description: '对<30%兵力敌人3倍伤害'
    },
    activeSkill: {
      id: 'a_kalong',
      name: '血刃斩',
      type: 'Active',
      description: '瞬间斩杀低血部队',
      cooldown: 12
    },
    passiveSkill: {
      id: 'p_kalong',
      name: '嗜血',
      type: 'Passive',
      description: '击杀回血20%'
    },
    bond: {
      id: 'b_si_wang_shou_ge',
      name: '死亡收割',
      description: '卡隆+摩洛克+赛列尔',
      requiredHeroes: ['d_kalong', 'd_moloke', 'd_sailier'],
      effect: '收割+65%'
    },
    story: '战场死神，专取残命。'
  },
  {
    id: 'd_lilisi',
    name: '幽影·莉莉丝',
    race: Race.DEMON,
    quality: Quality.RED,
    position: '潜行破城',
    troopType: '暗影魔女',
    stats: { command: 86, strength: 90, strategy: 62, defense: 66 },
    talent: {
      id: 't_lilisi',
      name: '隐匿',
      type: 'Talent',
      description: '行军隐身，不被侦测'
    },
    activeSkill: {
      id: 'a_lilisi',
      name: '暗影突袭',
      type: 'Active',
      description: '破城+无视防御35%',
      cooldown: 15
    },
    passiveSkill: {
      id: 'p_lilisi',
      name: '诡诈',
      type: 'Passive',
      description: '闪避+30%，免控'
    },
    bond: {
      id: 'b_an_ying_mo_nv',
      name: '暗影魔女',
      description: '莉莉丝+玛门+赛列尔',
      requiredHeroes: ['d_lilisi', 'd_mamen', 'd_sailier'],
      effect: '偷袭伤害+60%'
    },
    story: '暗影魔女，无声破城。'
  },
  {
    id: 'd_salosi',
    name: '炎魔·萨洛斯',
    race: Race.DEMON,
    quality: Quality.ORANGE,
    position: '火焰持续',
    troopType: '火焰恶魔',
    stats: { command: 90, strength: 92, strategy: 36, defense: 76 },
    talent: {
      id: 't_salosi',
      name: '炼狱',
      type: 'Talent',
      description: '灼烧+55%，攻城火伤'
    },
    activeSkill: {
      id: 'a_salosi',
      name: '炼狱火海',
      type: 'Active',
      description: '大范围灼烧8秒',
      cooldown: 15
    },
    passiveSkill: {
      id: 'p_salosi',
      name: '炎躯',
      type: 'Passive',
      description: '免火，攻击带灼烧'
    },
    bond: {
      id: 'b_fen_shi_lie_yan',
      name: '焚世烈焰',
      description: '萨洛斯+摩洛克+莫菲斯',
      requiredHeroes: ['d_salosi', 'd_moloke', 'd_mofeisi'],
      effect: '灼烧+65%'
    },
    story: '火焰聚合体，所过寸草不生。'
  },
  {
    id: 'd_beiximosi',
    name: '狂怒·贝希摩斯',
    race: Race.DEMON,
    quality: Quality.ORANGE,
    position: '狂暴坦克',
    troopType: '巨兽恶魔',
    stats: { command: 100, strength: 86, strategy: 22, defense: 96 },
    talent: {
      id: 't_beiximosi',
      name: '狂暴',
      type: 'Talent',
      description: '血量越低属性越高（最高翻倍）'
    },
    activeSkill: {
      id: 'a_beiximosi',
      name: '巨兽践踏',
      type: 'Active',
      description: '全体眩晕3秒',
      cooldown: 18
    },
    passiveSkill: {
      id: 'p_beiximosi',
      name: '钢铁魔躯',
      type: 'Passive',
      description: '防御+40%，减伤30%'
    },
    bond: {
      id: 'b_lian_yu_kuang_shou',
      name: '炼狱狂兽',
      description: '贝希摩斯+巴尔+摩洛克',
      requiredHeroes: ['d_beiximosi', 'd_baer', 'd_moloke'],
      effect: '坦度+55%'
    },
    story: '炼狱凶兽，越残血越恐怖。'
  },
  {
    id: 'd_mamen',
    name: '噬魂·玛门',
    race: Race.DEMON,
    quality: Quality.ORANGE,
    position: '掠夺核心',
    troopType: '贪欲恶魔',
    stats: { command: 50, strength: 50, strategy: 85, defense: 50 }, // Inferred
    talent: {
      id: 't_mamen',
      name: '贪婪',
      type: 'Talent',
      description: '掠夺翻倍，铜币+15%'
    },
    activeSkill: {
      id: 'a_mamen',
      name: '噬魂掠夺',
      type: 'Active',
      description: '大量掠夺+降储量上限',
      cooldown: 36000 // 10h
    },
    passiveSkill: {
      id: 'p_mamen',
      name: '聚魔',
      type: 'Passive',
      description: '掠夺越多攻击越高（最高+40%）'
    },
    bond: {
      id: 'b_wu_jin_tan_yu',
      name: '无尽贪欲',
      description: '玛门+莉莉丝+赛列尔',
      requiredHeroes: ['d_mamen', 'd_lilisi', 'd_sailier'],
      effect: '掠夺收益+75%'
    },
    story: '贪欲恶魔，掠夺资源与灵魂。'
  },
  {
    id: 'd_ajialesi',
    name: '魔焰·阿加雷斯',
    race: Race.DEMON,
    quality: Quality.ORANGE,
    position: '破甲攻城',
    troopType: '毁灭恶魔',
    stats: { command: 88, strength: 94, strategy: 30, defense: 80 },
    talent: {
      id: 't_ajialesi',
      name: '毁灭',
      type: 'Talent',
      description: '无视城防55%'
    },
    activeSkill: {
      id: 'a_ajialesi',
      name: '魔焰冲击',
      type: 'Active',
      description: '摧毁城墙',
      cooldown: 15
    },
    passiveSkill: {
      id: 'p_ajialesi',
      name: '碎甲',
      type: 'Passive',
      description: '无视防御40%'
    },
    bond: {
      id: 'b_hui_mie_xian_feng',
      name: '毁灭先锋',
      description: '阿加雷斯+萨洛斯+巴尔',
      requiredHeroes: ['d_ajialesi', 'd_salosi', 'd_baer'],
      effect: '攻城+70%'
    },
    story: '破城恶魔，无坚不摧。'
  },
  {
    id: 'd_sailier',
    name: '鬼哭·赛列尔',
    race: Race.DEMON,
    quality: Quality.ORANGE,
    position: '减益压制',
    troopType: '恐惧恶魔',
    stats: { command: 70, strength: 38, strategy: 92, defense: 58 },
    talent: {
      id: 't_sailier',
      name: '恐惧',
      type: 'Talent',
      description: '敌方攻防-35%'
    },
    activeSkill: {
      id: 'a_sailier',
      name: '鬼哭嚎',
      type: 'Active',
      description: '攻速-50%，持续6秒',
      cooldown: 15
    },
    passiveSkill: {
      id: 'p_sailier',
      name: '邪咒',
      type: 'Passive',
      description: '敌方治疗-85%'
    },
    bond: {
      id: 'b_kong_ju_ling_yu',
      name: '恐惧领域',
      description: '赛列尔+莉莉丝+玛门',
      requiredHeroes: ['d_sailier', 'd_lilisi', 'd_mamen'],
      effect: '减益+55%'
    },
    story: '恐惧化身，瓦解敌军意志。'
  },
  {
    id: 'd_baer',
    name: '暗翼·巴尔',
    race: Race.DEMON,
    quality: Quality.RED,
    position: '野战战神',
    troopType: '战争恶魔',
    stats: { command: 96, strength: 100, strategy: 26, defense: 84 },
    talent: {
      id: 't_baer',
      name: '战神',
      type: 'Talent',
      description: '野战伤害+65%'
    },
    activeSkill: {
      id: 'a_baer',
      name: '暗翼冲锋',
      type: 'Active',
      description: '大范围横扫击退',
      cooldown: 18
    },
    passiveSkill: {
      id: 'p_baer',
      name: '战魔',
      type: 'Passive',
      description: '攻击+45%，暴击+30%'
    },
    bond: {
      id: 'b_zhan_zheng_zhu_zai',
      name: '战争主宰',
      description: '巴尔+摩洛克+贝希摩斯',
      requiredHeroes: ['d_baer', 'd_moloke', 'd_beiximosi'],
      effect: '野战+75%'
    },
    story: '炼狱战神，野战无敌。'
  },
  {
    id: 'd_mofeisi',
    name: '血祭·莫菲斯',
    race: Race.DEMON,
    quality: Quality.ORANGE,
    position: '献祭爆发',
    troopType: '咒怨恶魔',
    stats: { command: 70, strength: 80, strategy: 80, defense: 40 }, // Inferred
    talent: {
      id: 't_mofeisi',
      name: '献祭',
      type: 'Talent',
      description: '献祭10%兵力→攻击+100%'
    },
    activeSkill: {
      id: 'a_mofeisi',
      name: '炼狱献祭',
      type: 'Active',
      description: '8秒伤害翻倍',
      cooldown: 18
    },
    passiveSkill: {
      id: 'p_mofeisi',
      name: '咒怨',
      type: 'Passive',
      description: '死亡自爆攻击100%'
    },
    bond: {
      id: 'b_xian_ji_zhi_li',
      name: '献祭之力',
      description: '莫菲斯+萨洛斯+摩洛克',
      requiredHeroes: ['d_mofeisi', 'd_salosi', 'd_moloke'],
      effect: '献祭增益+65%'
    },
    story: '以命换力，不惜一切取胜。'
  }
];
