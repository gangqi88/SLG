export const zhCN = {
  appName: '指尖无双',

  routeMain: '主界面',
  routeHeroes: '武将',
  routeCityScene: '主城（场景）',
  routeMainCity: '主城',
  routeWorld: '世界地图',
  routeGathering: '资源采集',
  routeTasks: '任务',
  routeGacha: '招募',
  routeLootbox: '背包',
  routeTowerDefense: '守桥',
  routeCooking: '厨神大赛',
  routeSiege: '攻城战',
  routeBattle: '战斗',
  routeReports: '战报',
  routeAlliance: '联盟',
  routeStyleGuide: '视觉规范',

  topSettings: '设置',
  topReports: '战报',
  topMail: '邮件',
  topWelfare: '福利',
  topAvatar: '头像',
  topRecharge: '充值',
  topWallet: '钱包',

  bottomBag: '背包',
  bottomMail: '邮件',
  bottomFriend: '好友',
  bottomWelfare: '福利',
  bottomActivity: '活动',

  modalOk: '知道了',
  modalClose: '关闭',
  modalCancel: '取消',
  modalConfirm: '确定',

  commonLocked: '未解锁',
  commonNotOpen: '未开放',

  entryLootbox: '宝箱',
  entryBattleTrial: '试炼/战斗',
} as const;

export const enUS: Record<keyof typeof zhCN, string> = {
  appName: 'Fingertip Warlords',

  routeMain: 'Main',
  routeHeroes: 'Heroes',
  routeCityScene: 'City (Scene)',
  routeMainCity: 'Main City',
  routeWorld: 'World Map',
  routeGathering: 'Gathering',
  routeTasks: 'Tasks',
  routeGacha: 'Gacha',
  routeLootbox: 'Bag',
  routeTowerDefense: 'Tower Defense',
  routeCooking: 'Cooking',
  routeSiege: 'Siege',
  routeBattle: 'Battle',
  routeReports: 'Reports',
  routeAlliance: 'Alliance',
  routeStyleGuide: 'Style Guide',

  topSettings: 'Settings',
  topReports: 'Reports',
  topMail: 'Mail',
  topWelfare: 'Welfare',
  topAvatar: 'Profile',
  topRecharge: 'Recharge',
  topWallet: 'Wallet',

  bottomBag: 'Bag',
  bottomMail: 'Mail',
  bottomFriend: 'Friends',
  bottomWelfare: 'Welfare',
  bottomActivity: 'Events',

  modalOk: 'OK',
  modalClose: 'Close',
  modalCancel: 'Cancel',
  modalConfirm: 'Confirm',

  commonLocked: 'Locked',
  commonNotOpen: 'Not available',

  entryLootbox: 'Lootbox',
  entryBattleTrial: 'Trial/Battle',
};

export type StringKey = keyof typeof zhCN;
