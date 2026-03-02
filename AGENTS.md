# AGENTS.md - 项目开发指南

> **AI 助手技能体系**: 本项目采用职责分离的技能配置，请根据需要查看对应的技能文件：
> 
> | 技能文件 | 职责 | 使用场景 |
> |---------|------|----------|
> | `.trae/skills/slg-game-developer/SKILL.md` | **SLG开发** | 编写英雄系统、战斗系统、Web3 NFT |
> | `.trae/skills/endless-winter-game-developer/SKILL.md` | **生存游戏开发** | 编写生存、建造、资源系统 |
> | `.trae/skills/endless-winter-project-manager/SKILL.md` | **项目管理** | 任务规划、进度跟踪、风险管理 |
> | `.trae/skills/endless-winter-code-reviewer/SKILL.md` | **代码审查** | 审查代码质量、提出改进建议 |
> | `.trae/skills/endless-winter-architect/SKILL.md` | **架构设计** | 系统架构、技术选型、性能规划 |

## 项目概述

基于 **React 19 + TypeScript 5.7 + Phaser 3.90** 的末日生存SLG游戏。包含：
- 生存模拟经营（资源、建造、幸存者）
- SLG英雄系统（30名英雄、三族阵营、战斗）
- Web3 NFT集成（UniSat钱包、Fractal Bitcoin）

## Build Commands

| Command | Description |
|---------|-------------|
| `npm install` | 安装项目依赖 |
| `npm run dev` | 启动开发服务器 localhost:8080 |
| `npm run build` | 生产构建，输出到 `dist/` |
| `npm run dev-nolog` | 启动开发服务器（无匿名日志） |
| `npm run build-nolog` | 生产构建（无匿名日志） |

### 代码检查（必须执行）
- **ESLint**: `npx eslint src/` (ESLint v9 flat config)
- **ESLint修复**: `npx eslint src/ --fix`
- **单文件检查**: `npx eslint src/systems/HeroSystem.ts`
- **TypeScript**: `npx tsc --noEmit`

### 测试
- **状态**: 当前未配置测试框架

## 代码风格指南

### 项目结构
```
src/
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
├── systems/               # 游戏系统（Facade模式 + 单一职责服务）
│   ├── heroes/           # 英雄系统服务
│   │   ├── HeroDataManager.ts
│   │   ├── HeroUpgradeService.ts
│   │   ├── HeroPowerCalculator.ts
│   │   ├── HeroRepository.ts
│   │   └── index.ts
│   ├── cities/           # 城市系统服务
│   ├── battle/           # 战斗系统服务
│   ├── skills/           # 技能系统服务
│   ├── teams/            # 队伍系统服务
│   └── *.ts             # Facade层
├── components/            # React组件
├── types/                 # TypeScript类型
├── hooks/                # 自定义Hooks
├── config/               # 配置数据
│   └── heroes/          # 英雄配置
├── game/                # Phaser游戏引擎
│   └── scenes/          # 游戏场景
└── web3/                # Web3集成
```

### 单一职责原则
- 每个系统文件专注单一功能
- 工具函数集中管理在 `utils/`
- 常量集中管理在 `constants/`
- 避免在系统文件中定义常量

### TypeScript 配置 (tsconfig.json)
- **Target**: ES2020
- **Strict mode**: enabled
- **noUnusedLocals**: true
- **noUnusedParameters**: true
- **Module**: ESNext (bundler mode)
- **jsx**: react-jsx

### 命名规范
| 类型 | 规则 | 示例 |
|------|------|------|
| 组件/类 | PascalCase | `ResourcePanel`, `GameManager` |
| 接口/类型 | PascalCase | `ResourceType`, `IProps` |
| 函数/变量 | camelCase | `handleSaveGame`, `gameState` |
| 常量 | UPPER_SNAKE_CASE | `GAME_CONSTANTS` |
| 文件 | PascalCase（组件）, camelCase（工具） | `ResourcePanel.ts`, `formatDate.ts` |

### Import 顺序
```typescript
// 1. React
import React, { useState, useEffect } from 'react';
// 2. 第三方库
import { Game } from 'phaser';
// 3. 绝对路径项目导入
import { GameManager } from './game/GameManager';
import type { ResourceType } from './types/game.types';
// 4. 相对路径
import ResourcePanel from './components/UI/ResourcePanel';
```

### Formatting Rules
- **Braces**: Same line (K&R)
- **Indentation**: 4 spaces
- **Quotes**: Single quotes
- **Semicolons**: Required
- **Line endings**: LF (EditorConfig: `crlf` on Windows, `lf` on Unix)

### EditorConfig (.editorconfig)
- indent_style: space
- indent_size: 4
- charset: utf-8

### React Patterns
- Functional components with hooks
- Use `forwardRef` for ref forwarding
- Destructure props in parameters
- CSS-in-JS via inline `<style>` tags
- Event handlers: `handle` prefix

### Error Handling
- Use TypeScript strict types
- Validate game state before operations
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Return boolean for save/load operations

### ESLint 配置 (.eslintrc.cjs)
- **Env**: browser, es2020
- **Parser**: @typescript-eslint/parser
- **Plugins**: react-refresh
- **Extends**: eslint:recommended, @typescript-eslint/recommended, react-hooks/recommended
- **Key Rules**:
  - `react-refresh/only-export-components`: warn (allowConstantExport: true)
  - 忽略: dist, .eslintrc.cjs

## 文件组织
```
src/
├── components/UI/     # React UI 组件
├── game/              # Phaser 游戏逻辑
│   ├── scenes/        # Phaser 场景
│   ├── EventBus.ts    # 事件总线
│   ├── GameManager.ts # 游戏管理器
│   └── main.ts        # 游戏初始化
├── systems/           # 游戏系统（资源、建筑等）
├── types/             # TypeScript 类型定义
├── hooks/             # 自定义 React Hooks
└── utils/             # 工具函数和常量
```

## 开发注意事项
- 开发服务器: localhost:8080
- Phaser 配置: `src/game/main.ts`
- 游戏状态: localStorage 持久化
- 热重载: Vite 自动处理

## 架构设计（前后端分离 + 性能优化 + 联机储备）

详见 `.trae/rules/architecture-design.md`

### 前后端分离原则
- **前端**: 本地计算、状态管理、UI渲染
- **后端预留**: 数据校验、状态同步、防作弊
- 关键战斗计算需支持服务器校验

### 性能优化
- 避免热路径装箱，使用对象池
- 严格类型，避免 `any`
- 模块化导入，只导入需要的部分

### 联机同步储备
- 帧同步结构预留 (`BattleFrame`)
- 乐观更新 + 状态回滚
- 断线重连支持 (`Syncable` 接口)

### 性能指标
- 首屏加载 < 3秒
- 交互响应 < 100ms
- 战斗计算 < 16ms (60fps)

## Web3 集成（UniSat - Fractal Bitcoin）
详见完整版 AGENTS.md 或 `WEB3_FB_INTEGRATION_PLAN.md`

### 核心原则
- Hook 命名: `useUniSat` 前缀
- 优先使用 `window.unisat` API
- BRC-20 / Runes 资产标准
- 地址格式: Taproot（bc1p...）

### 环境变量
```env
VITE_UNISAT_API_KEY=your_api_key
VITE_FB_NETWORK=mainnet  # 或 testnet
```

### UniSat 资源
- 钱包: https://unisat.io/download
- 文档: https://docs.unisat.io
- API: https://api.unisat.io/query-v4

## 常用操作

### 开发服务器
- 开发: `npm run dev` → localhost:8080
- 无日志开发: `npm run dev-nolog`
- 热重载: Vite 自动处理

### 代码检查与构建
- **全量 lint**: `npx eslint src/`
- **全量 lint 修复**: `npx eslint src/ --fix`
- **单文件 lint**: `npx eslint src/systems/ResourceSystem.ts`
- **单文件 lint 修复**: `npx eslint src/systems/ResourceSystem.ts --fix`
- **TypeScript 检查**: `npx tsc --noEmit`
- **生产构建**: `npm run build`

### 关键文件
- Phaser 配置: `src/game/main.ts`
- 游戏状态: localStorage 持久化

## 剩余工作任务

### Phase 3.3: 跨链和扩展
- [ ] 多钱包支持
- [ ] 跨链资产转移
- [ ] 社交功能集成
- [ ] 移动端适配

### Phase 3.4: 优化发布
- [ ] 性能优化
- [ ] 安全审计
- [ ] 生产部署
- [ ] 用户培训

### 其他待办
- 智能合约设计和部署（预留，未来可选）

## 代码质量状态

### ESLint v9 配置
- 配置文件: `eslint.config.mjs` (flat config)
- 状态: ✅ 0 errors, 11 warnings

### TypeScript
- 状态: ✅ 通过 (0 errors)
