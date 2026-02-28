---
alwaysApply: true
---
# 编码标准规范

## 1. 语言要求
- 必须使用中文；

## 2. 代码质量
- 提供的代码力求简洁高效；
- 达到发布上线的生产级别标准；

## 3. 复杂度控制
- 单函数认知复杂度 < 15，强制拆分复杂逻辑。

## 4. 代码整洁
- 禁止保留未使用的变量。

## 5. SLG游戏专用规范

### 5.1 英雄命名规范
- **英雄组件**: PascalCase + Hero前缀 (e.g., `HeroCard`, `HeroList`, `HeroDetail`)
- **英雄类**: PascalCase + Hero后缀 (e.g., `HeroSystem`, `HeroManager`, `HeroRenderer`)
- **英雄ID**: kebab-case + 唯一标识 (e.g., `su-mo`, `qin-lie`, `luo-xi`)
- **英雄技能**: camelCase + 技能类型 (e.g., `healLight`, `damageStrike`, `shieldGuard`)
- **英雄常量**: UPPER_SNAKE_CASE + HERO_前缀 (e.g., `HERO_MAX_LEVEL`, `HERO_QUALITY_RED`)

### 5.2 战斗系统命名规范
- **战斗组件**: PascalCase + Battle前缀 (e.g., `BattleUI`, `BattleReport`, `BattleEffect`)
- **战斗类**: PascalCase + Battle后缀 (e.g., `BattleSystem`, `BattleCalculator`, `BattleRenderer`)
- **战斗常量**: UPPER_SNAKE_CASE + BATTLE_前缀 (e.g., `BATTLE_MAX_TEAMS`, `BATTLE_COOLDOWN_MIN`)
- **阵營常量**: UPPER_SNAKE_CASE + FACTION_前缀 (e.g., `FACTION_HUMAN`, `FACTION_ANGEL`, `FACTION_DEMON`)

### 5.3 Web3 NFT命名规范
- **NFT组件**: PascalCase + NFT前缀 (e.g., `NFTHero`, `NFTMarket`, `NFTMint`)
- **NFT Hook**: camelCase + useNFT前缀 (e.g., `useNFTHero`, `useNFTMarket`, `useNFTMint`)
- **NFT常量**: UPPER_SNAKE_CASE + NFT_前缀 (e.g., `NFT_CONTRACT_ADDRESS`, `NFT_MAX_SUPPLY`)

### 5.4 SLG函数命名规范
- **战斗函数**: 动词 + Battle + 对象 (e.g., `calculateBattleDamage`, `executeBattleTurn`, `renderBattleEffect`)
- **英雄函数**: 动词 + Hero + 操作 (e.g., `upgradeHeroLevel`, `evolveHeroQuality`, `equipHeroItem`)
- **阵營函数**: 动词 + Faction + 操作 (e.g., `checkFactionBonus`, `applyFactionEffect`, `renderFactionStyle`)

### 5.5 文件组织规范
```
src/
├── components/
│   ├── SLG/               # SLG专用组件
│   │   ├── Hero/          # 英雄相关
│   │   ├── Battle/        # 战斗相关
│   │   ├── Faction/       # 阵营相关
│   │   └── Team/          # 队伍相关
│   └── NFT/               # NFT相关组件
├── systems/
│   ├── HeroSystem.ts      # 英雄系统
│   ├── BattleSystem.ts    # 战斗系统
│   ├── FactionSystem.ts   # 阵营系统
│   └── NFTHeroSystem.ts   # NFT英雄系统
├── types/
│   ├── slg/               # SLG类型定义
│   └── nft/               # NFT类型定义
└── utils/
    ├── slg/               # SLG工具函数
    └── nft/               # NFT工具函数
```