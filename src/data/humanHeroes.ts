import { Hero, Race, Quality } from '../types/Hero';

export const humanHeroes: Hero[] = [
  {
    id: 'h_sumo',
    name: '苏墨',
    race: Race.HUMAN,
    quality: Quality.ORANGE,
    position: '内政核心',
    troopType: '全适性',
    stats: { command: 68, strength: 22, strategy: 92, defense: 45 },
    talent: {
      id: 't_sumo',
      name: '丰登',
      type: 'Talent',
      description: '全资源产量+25%，粮食+15%'
    },
    activeSkill: {
      id: 'a_sumo',
      name: '仓廪实',
      type: 'Active',
      description: '立即获得当前储量10%资源',
      cooldown: 28800 // 8 hours
    },
    passiveSkill: {
      id: 'p_sumo',
      name: '劝农',
      type: 'Passive',
      description: '资源产量永久+12%'
    },
    bond: {
      id: 'b_fan_shi_xian_liang',
      name: '凡世贤良',
      description: '苏墨+温竹+梁石',
      requiredHeroes: ['h_sumo', 'h_wenzhu', 'h_liangshi'],
      effect: '建造速度+30%'
    },
    story: '乱世农政隐士，可令荒地化为粮仓。'
  },
  {
    id: 'h_qinlie',
    name: '秦烈',
    race: Race.HUMAN,
    quality: Quality.ORANGE,
    position: '防御坦克',
    troopType: '步兵/枪兵',
    stats: { command: 92, strength: 72, strategy: 33, defense: 96 },
    talent: {
      id: 't_qinlie',
      name: '坚壁',
      type: 'Talent',
      description: '守城防御+40%，受伤-25%'
    },
    activeSkill: {
      id: 'a_qinlie',
      name: '磐石御',
      type: 'Active',
      description: '全队护盾',
      cooldown: 12
    },
    passiveSkill: {
      id: 'p_qinlie',
      name: '铁甲',
      type: 'Passive',
      description: '防御+18%，骑兵伤害-15%'
    },
    bond: {
      id: 'b_tie_xue_shu_cheng',
      name: '铁血戍城',
      description: '秦烈+钟离野+赵承彦',
      requiredHeroes: ['h_qinlie', 'h_zhongliye', 'h_zhaochengyan'],
      effect: '步兵血量+30%'
    },
    story: '边关老兵，以血肉守护城池。'
  },
  {
    id: 'h_wenzhu',
    name: '温竹',
    race: Race.HUMAN,
    quality: Quality.ORANGE,
    position: '谋略辅助',
    troopType: '弓兵/谋士',
    stats: { command: 62, strength: 31, strategy: 94, defense: 48 },
    talent: {
      id: 't_wenzhu',
      name: '乱心',
      type: 'Talent',
      description: '敌方攻击-12%，士气-20'
    },
    activeSkill: {
      id: 'a_wenzhu',
      name: '乱心咒',
      type: 'Active',
      description: '3部队混乱互攻',
      cooldown: 15
    },
    passiveSkill: {
      id: 'p_wenzhu',
      name: '观势',
      type: 'Passive',
      description: '敌方技能概率-10%'
    },
    bond: {
      id: 'b_zhi_ji_lian_huan',
      name: '智计连环',
      description: '温竹+柳轻烟+南宫望',
      requiredHeroes: ['h_wenzhu', 'h_liuqingyan', 'h_nangongwang'],
      effect: '谋略效果+35%'
    },
    story: '清雅攻心谋士，不动刀兵而胜。'
  },
  {
    id: 'h_liangshi',
    name: '梁石',
    race: Race.HUMAN,
    quality: Quality.PURPLE,
    position: '工程匠师',
    troopType: '无（内政）',
    stats: { command: 44, strength: 18, strategy: 82, defense: 66 },
    talent: {
      id: 't_liangshi',
      name: '巧匠',
      type: 'Talent',
      description: '建造速度+35%'
    },
    activeSkill: {
      id: 'a_liangshi',
      name: '急修',
      type: 'Active',
      description: '城防恢复35%',
      cooldown: 21600 // 6 hours
    },
    passiveSkill: {
      id: 'p_liangshi',
      name: '固若金汤',
      type: 'Passive',
      description: '城防+25%，陷阱伤害+15%'
    },
    bond: {
      id: 'b_gong_shi_jing_tong',
      name: '工事精通',
      description: '苏墨+梁石+苏晚晴',
      requiredHeroes: ['h_sumo', 'h_liangshi', 'h_suwanqing'],
      effect: '资源消耗-12%'
    },
    story: '天下第一巧匠，善筑坚城。'
  },
  {
    id: 'h_liuqingyan',
    name: '柳轻烟',
    race: Race.HUMAN,
    quality: Quality.ORANGE,
    position: '谍战掠夺',
    troopType: '轻骑/弓兵',
    stats: { command: 72, strength: 66, strategy: 78, defense: 52 },
    talent: {
      id: 't_liuqingyan',
      name: '隐匿',
      type: 'Talent',
      description: '掠夺成功率+30%，行踪隐匿'
    },
    activeSkill: {
      id: 'a_liuqingyan',
      name: '窃粮',
      type: 'Active',
      description: '窃取敌方10%粮食',
      cooldown: 36000 // 10 hours
    },
    passiveSkill: {
      id: 'p_liuqingyan',
      name: '密探',
      type: 'Passive',
      description: '行军速度+20%'
    },
    bond: {
      id: 'b_wu_ying_die_ying',
      name: '无影谍影',
      description: '柳轻烟+顾长风+南宫望',
      requiredHeroes: ['h_liuqingyan', 'h_guchangfeng', 'h_nangongwang'],
      effect: '掠夺收益+40%'
    },
    story: '神秘女谍，来去无影。'
  },
  {
    id: 'h_zhaochengyan',
    name: '赵承彦',
    race: Race.HUMAN,
    quality: Quality.PURPLE,
    position: '练兵统帅',
    troopType: '步兵/弓兵',
    stats: { command: 86, strength: 58, strategy: 66, defense: 62 },
    talent: {
      id: 't_zhaochengyan',
      name: '精兵',
      type: 'Talent',
      description: '练兵速度+45%，伤兵恢复+18%'
    },
    activeSkill: {
      id: 'a_zhaochengyan',
      name: '整军',
      type: 'Active',
      description: '恢复15%伤兵，攻击+10%',
      cooldown: 12
    },
    passiveSkill: {
      id: 'p_zhaochengyan',
      name: '军纪',
      type: 'Passive',
      description: '士气永不低于30%'
    },
    bond: {
      id: 'b_zhi_jun_yan_ming',
      name: '治军严明',
      description: '赵承彦+秦烈+钟离野',
      requiredHeroes: ['h_zhaochengyan', 'h_qinlie', 'h_zhongliye'],
      effect: '征兵消耗-18%'
    },
    story: '儒将治军，麾下皆精锐。'
  },
  {
    id: 'h_zhongliye',
    name: '钟离野',
    race: Race.HUMAN,
    quality: Quality.ORANGE,
    position: '先锋战士',
    troopType: '枪兵/骑兵',
    stats: { command: 90, strength: 94, strategy: 26, defense: 76 },
    talent: {
      id: 't_zhongliye',
      name: '背水',
      type: 'Talent',
      description: '兵力<50%时攻击+30%'
    },
    activeSkill: {
      id: 'a_zhongliye',
      name: '破阵冲锋',
      type: 'Active',
      description: '直线冲击+击退',
      cooldown: 15
    },
    passiveSkill: {
      id: 'p_zhongliye',
      name: '骁勇',
      type: 'Passive',
      description: '武力+15%，暴击伤害+18%'
    },
    bond: {
      id: 'b_sha_chang_han_zu',
      name: '沙场悍卒',
      description: '钟离野+秦烈+赵承彦',
      requiredHeroes: ['h_zhongliye', 'h_qinlie', 'h_zhaochengyan'],
      effect: '野战伤害+25%'
    },
    story: '草莽猛将，绝境可翻盘。'
  },
  {
    id: 'h_suwanqing',
    name: '苏晚晴',
    race: Race.HUMAN,
    quality: Quality.ORANGE,
    position: '战地医者',
    troopType: '全辅助',
    stats: { command: 58, strength: 24, strategy: 90, defense: 50 },
    talent: {
      id: 't_suwanqing',
      name: '仁心',
      type: 'Talent',
      description: '伤兵转化率+25%'
    },
    activeSkill: {
      id: 'a_suwanqing',
      name: '妙手回春',
      type: 'Active',
      description: '群体回血25%',
      cooldown: 12
    },
    passiveSkill: {
      id: 'p_suwanqing',
      name: '护生',
      type: 'Passive',
      description: '战损-15%'
    },
    bond: {
      id: 'b_ji_shi_an_min',
      name: '济世安民',
      description: '苏墨+梁石+苏晚晴',
      requiredHeroes: ['h_sumo', 'h_liangshi', 'h_suwanqing'],
      effect: '医疗速度+35%'
    },
    story: '乱世女医，不问阵营，只救苍生。'
  },
  {
    id: 'h_guchangfeng',
    name: '顾长风',
    race: Race.HUMAN,
    quality: Quality.PURPLE,
    position: '商道使者',
    troopType: '无（内政）',
    stats: { command: 36, strength: 16, strategy: 84, defense: 38 },
    talent: {
      id: 't_guchangfeng',
      name: '财通',
      type: 'Talent',
      description: '商队收益+40%，铜币+25%'
    },
    activeSkill: {
      id: 'a_guchangfeng',
      name: '以物易物',
      type: 'Active',
      description: '资源1:1转换',
      cooldown: 28800 // Assuming daily means 8h or once per day, using 8h for now
    },
    passiveSkill: {
      id: 'p_guchangfeng',
      name: '聚财',
      type: 'Passive',
      description: '铜币产量+25%'
    },
    bond: {
      id: 'b_tian_xia_shang_lu',
      name: '天下商路',
      description: '顾长风+柳轻烟+南宫望',
      requiredHeroes: ['h_guchangfeng', 'h_liuqingyan', 'h_nangongwang'],
      effect: '贸易损耗-25%'
    },
    story: '巨商子弟，以财力养势。'
  },
  {
    id: 'h_nangongwang',
    name: '南宫望',
    race: Race.HUMAN,
    quality: Quality.ORANGE,
    position: '观星谋士',
    troopType: '谋士/弓兵',
    stats: { command: 66, strength: 32, strategy: 96, defense: 46 },
    talent: {
      id: 't_nangongwang',
      name: '观星',
      type: 'Talent',
      description: '暴击+15%，雨天翻倍'
    },
    activeSkill: {
      id: 'a_nangongwang',
      name: '风雷引',
      type: 'Active',
      description: '全体雷电谋略伤害',
      cooldown: 18
    },
    passiveSkill: {
      id: 'p_nangongwang',
      name: '天机',
      type: 'Passive',
      description: '免疫控制，10%闪避'
    },
    bond: {
      id: 'b_xing_xiang_mi_shu',
      name: '星象秘术',
      description: '南宫望+温竹+柳轻烟',
      requiredHeroes: ['h_nangongwang', 'h_wenzhu', 'h_liuqingyan'],
      effect: '技能伤害+30%'
    },
    story: '观星隐士，借天地之力扭转战局。'
  }
];
