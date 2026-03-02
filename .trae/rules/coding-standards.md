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

## 5. TypeScript 严格类型规范

### 5.1 禁止使用 any
- ❌ 禁止使用 `any` 类型
- ✅ 使用具体类型或 `unknown` + 类型守卫
- ✅ 使用 `as` 类型断言（仅在必要时）

```typescript
// ❌ 错误
const data: any = getData();
function process(obj: any) { }

// ✅ 正确
interface Data { id: number; name: string; }
const data: Data = getData();

// ✅ 使用 unknown + 类型守卫
function process(obj: unknown) {
    if (obj instanceof Error) {
        console.log(obj.message);
    }
}
```

### 5.2 错误处理类型安全
```typescript
// ❌ 错误
} catch (err: any) {
    setError(err.message || '错误');
}

// ✅ 正确
} catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知错误';
    setError(message);
}
```

### 5.3 Window 类型扩展
```typescript
// ❌ 错误
const wallet = (window as any).unisat;

// ✅ 正确
interface UniSatWindow extends Window {
    unisat?: UniSatWallet;
}
const wallet = (window as UniSatWindow).unisat;
```

## 6. ESLint v9 配置

### 6.1 配置文件
- 使用 `eslint.config.mjs` (ESLint v9 flat config)
- 配置文件位置: 项目根目录

### 6.2 关键规则
```javascript
{
    rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': 'warn',
        'react-hooks/exhaustive-deps': 'warn',
        'react-refresh/only-export-components': 'warn',
    }
}
```

### 6.3 运行命令
```bash
# 全量检查
npx eslint src/

# 单文件检查
npx eslint src/systems/HeroSystem.ts

# 自动修复
npx eslint src/ --fix
```

## 7. TypeScript 检查

### 7.1 运行命令
```bash
npx tsc --noEmit
```

### 7.2 tsconfig.json 关键配置
- `strict: true` (严格模式)
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `jsx: react-jsx`
- `target: ES2020`

## 8. SLG游戏专用规范

### 8.1 英雄命名规范
- **英雄组件**: PascalCase + Hero前缀 (e.g., `HeroCard`, `HeroList`, `HeroDetail`)
- **英雄类**: PascalCase + Hero后缀 (e.g., `HeroSystem`, `HeroManager`, `HeroRenderer`)
- **英雄ID**: kebab-case + 唯一标识 (e.g., `su-mo`, `qin-lie`, `luo-xi`)
- **英雄技能**: camelCase + 技能类型 (e.g., `healLight`, `damageStrike`, `shieldGuard`)
- **英雄常量**: UPPER_SNAKE_CASE + HERO_前缀 (e.g., `HERO_MAX_LEVEL`, `HERO_QUALITY_RED`)

### 8.2 战斗系统命名规范
- **战斗组件**: PascalCase + Battle前缀 (e.g., `BattleUI`, `BattleReport`, `BattleEffect`)
- **战斗类**: PascalCase + Battle后缀 (e.g., `BattleSystem`, `BattleCalculator`, `BattleRenderer`)
- **战斗常量**: UPPER_SNAKE_CASE + BATTLE_前缀 (e.g., `BATTLE_MAX_TEAMS`, `BATTLE_COOLDOWN_MIN`)
- **阵营常量**: UPPER_SNAKE_CASE + FACTION_前缀 (e.g., `FACTION_HUMAN`, `FACTION_ANGEL`, `FACTION_DEMON`)

### 8.3 Web3 NFT命名规范
- **NFT组件**: PascalCase + NFT前缀 (e.g., `NFTHero`, `NFTMarket`, `NFTMint`)
- **NFT Hook**: camelCase + useNFT前缀 (e.g., `useNFTHero`, `useNFTMarket`, `useNFTMint`)
- **NFT常量**: UPPER_SNAKE_CASE + NFT_前缀 (e.g., `NFT_CONTRACT_ADDRESS`, `NFT_MAX_SUPPLY`)

### 8.4 SLG函数命名规范
- **战斗函数**: 动词 + Battle + 对象 (e.g., `calculateBattleDamage`, `executeBattleTurn`, `renderBattleEffect`)
- **英雄函数**: 动词 + Hero + 操作 (e.g., `upgradeHeroLevel`, `evolveHeroQuality`, `equipHeroItem`)
- **阵营函数**: 动词 + Faction + 操作 (e.g., `checkFactionBonus`, `applyFactionEffect`, `renderFactionStyle`)

### 8.5 文件组织规范
```
src/
├── components/
│   ├── SLG/               # SLG专用组件
│   │   ├── Hero/          # 英雄相关
│   │   ├── Battle/        # 战斗相关
│   │   ├── City/          # 城市相关
│   │   ├── Faction/       # 阵营相关
│   │   ├── Team/          # 队伍相关
│   │   ├── Gacha/        # 抽卡相关
│   │   ├── NFT/           # NFT相关
│   │   └── Multiplayer/   # 多人对战
│   └── UI/               # 通用UI组件
├── constants/              # 集中常量定义
│   ├── game.constants.ts  # 游戏常量
│   ├── hero.constants.ts  # 英雄常量
│   ├── battle.constants.ts# 战斗常量
│   └── index.ts          # 统一导出
├── utils/                  # 工具函数
│   ├── helpers.ts         # 通用工具
│   ├── hero.utils.ts      # 英雄工具
│   ├── battle.utils.ts    # 战斗工具
│   └── index.ts          # 统一导出
├── systems/               # 游戏系统（单一职责）
│   ├── heroes/           # 英雄系统服务
│   │   ├── HeroDataManager.ts
│   │   ├── HeroUpgradeService.ts
│   │   ├── HeroPowerCalculator.ts
│   │   ├── HeroRepository.ts
│   │   └── index.ts
│   ├── cities/           # 城市系统服务
│   │   ├── CityDataManager.ts
│   │   ├── BuildingService.ts
│   │   ├── CityDefenseService.ts
│   │   ├── CityGovernmentService.ts
│   │   └── index.ts
│   ├── battle/           # 战斗系统服务
│   │   ├── BattleSimulationService.ts
│   │   ├── RealTimeBattleService.ts
│   │   └── index.ts
│   ├── skills/           # 技能系统服务
│   │   ├── SkillEffectCalculator.ts
│   │   ├── SkillLearningService.ts
│   │   ├── SkillExperienceService.ts
│   │   └── index.ts
│   ├── teams/            # 队伍系统服务
│   │   ├── TeamDataManager.ts
│   │   ├── TeamFormationService.ts
│   │   └── index.ts
│   └── *.ts             # Facade层
├── types/                 # TypeScript类型
│   ├── game.types.ts
│   └── slg/             # SLG类型
├── hooks/                # 自定义Hooks
├── config/              # 配置数据
│   └── heroes/          # 英雄配置
├── game/                # Phaser游戏引擎
│   ├── scenes/         # 游戏场景
│   ├── EventBus.ts
│   ├── GameManager.ts
│   └── main.ts
└── web3/               # Web3集成
    ├── hooks/          # React Hooks
    ├── services/       # Web3服务
    ├── components/     # Web3组件
    ├── config/        # 配置
    └── providers/     # Context
```

## 9. 单一职责原则

### 9.1 系统文件原则
- 每个系统文件只负责一个核心功能
- 避免在一个文件中混合多种职责
- 大于 300 行的文件需要考虑拆分

### 9.2 常量集中管理
- 所有常量必须放在 `src/constants/` 目录
- 不在系统文件中定义常量
- 使用 `index.ts` 统一导出

### 9.3 工具函数集中管理
- 纯函数必须放在 `src/utils/` 目录
- 避免在组件或系统中定义工具函数
- 便于单元测试

### 9.4 类型定义
- 相关类型放在同一文件
- 使用 `index.ts` 统一导出
- 避免类型定义散落在多个文件

## 10. Import 顺序规范

```typescript
// 1. React
import React, { useState, useEffect } from 'react';

// 2. 第三方库
import { Game } from 'phaser';
import { createSelector } from '@reduxjs/toolkit';

// 3. 常量（绝对路径）
import { HERO_CONSTANTS, BATTLE_CONSTANTS } from '@/constants';

// 4. 类型（绝对路径）
import type { Hero, Battle } from '@/types';

// 5. 系统（相对路径）
import { HeroSystem } from '../systems/HeroSystem';

// 6. 组件（相对路径）
import HeroCard from '../components/HeroCard';

// 7. 工具函数（相对路径）
import { calculatePower } from '../utils/hero.utils';
```

## 11. 代码质量检查流程

### 11.1 提交前检查
```bash
# 1. ESLint 检查
npx eslint src/ --fix

# 2. TypeScript 检查
npx tsc --noEmit

# 3. 构建验证
npm run build
```

### 11.2 检查规则优先级
1. **必须通过**: TypeScript 编译无错误
2. **必须通过**: ESLint 无 error（warning 可选）
3. **建议通过**: 构建成功