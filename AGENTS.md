# AGENTS.md - 项目开发指南

> **AI 助手技能体系**: 本项目采用职责分离的技能配置，请根据需要查看对应的技能文件：
> 
> | 技能文件 | 职责 | 使用场景 |
> |---------|------|----------|
> | `.trae/skills/endless-winter-game-developer/SKILL.md` | **代码实现** | 编写组件、Hooks、游戏功能、Web3 集成 |
> | `.trae/skills/endless-winter-project-manager/SKILL.md` | **项目管理** | 任务规划、进度跟踪、风险管理 |
> | `.trae/skills/endless-winter-code-reviewer/SKILL.md` | **代码审查** | 审查代码质量、提出改进建议 |
> | `.trae/skills/endless-winter-architect/SKILL.md` | **架构设计** | 系统架构、技术选型、性能规划 |

## 项目概述
这是一个基于 **React + TypeScript + Phaser 3** 的末日生存模拟经营游戏。使用 Vite 作为构建工具，React 负责 UI 界面，Phaser 3 负责游戏画面渲染。

**AI 助手职责**: 作为《无尽冬日》游戏开发专家，提供 React + TypeScript + Phaser 3 + UniSat Web3 的全方位技术支持。职责单一：专注于游戏功能开发和 Web3 集成。

## 项目特点
- **游戏类型**: 生存模拟经营类
- **技术栈**: React 19 + TypeScript 5.7 + Phaser 3.90 + Vite 6
- **游戏机制**: 资源管理、建筑建造、幸存者管理、季节系统
- **存档系统**: 使用 localStorage 进行游戏进度保存
- **文件规模**: 22 个 TypeScript/TSX 源文件

## Build Commands

### 构建命令

| Command | Description |
|---------|-------------|
| `npm install` | 安装项目依赖 |
| `npm run dev` | 启动开发服务器 localhost:8080 |
| `npm run build` | 生产构建，输出到 `dist/` 目录 |
| `npm run dev-nolog` | 启动开发服务器（无匿名日志） |
| `npm run build-nolog` | 生产构建（无匿名日志） |

### 代码检查
- **检查**: `npx eslint src/`（已配置 TypeScript + React）
- **修复**: `npx eslint src/ --fix`

### 测试
- **状态**: 当前未配置测试框架
- 如有测试，使用 `npm test` 运行

## 代码风格指南

### TypeScript 配置
- Target: ES2020
- Strict mode enabled
- Module: ESNext with bundler resolution
- JSX: react-jsx transform
- No unused locals/parameters allowed

### 命名规范
- **组件**: PascalCase（如 `ResourcePanel`, `PhaserGame`）
- **类**: PascalCase（如 `GameManager`, `ResourceSystem`）
- **接口**: PascalCase 加 `I` 前缀（如 `IRefPhaserGame`, `IProps`）
- **类型**: PascalCase（如 `ResourceType`, `GameState`）
- **函数/变量**: camelCase（如 `handleSaveGame`, `gameState`）
- **常量**: UPPER_SNAKE_CASE（如 `GAME_CONSTANTS`）
- **文件**: 组件/类使用 PascalCase，工具函数使用 camelCase

### Import/Export Patterns
```typescript
// React imports first
import React, { useState, useEffect } from 'react';

// Third-party libraries
import { Game } from 'phaser';

// Absolute project imports
import { GameManager } from './game/GameManager';
import type { ResourceType } from './types/game.types';

// Relative imports
import ResourcePanel from './components/UI/ResourcePanel';

// Export patterns
export class GameManager { }
export interface IRefPhaserGame { }
export type { ResourceType };
export default Component;
```

### Formatting Rules
- **Braces**: Same line (K&R style)
- **Indentation**: 4 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line endings**: LF (.editorconfig configured)
- **Trailing commas**: Not enforced

### React Patterns
- Use functional components with hooks
- Use `forwardRef` for ref forwarding
- Destructure props in component parameters
- CSS-in-JS via inline `<style>` tags in components
- Event handlers named with `handle` prefix

### Game Architecture (Phaser + React)
- **Game Systems**: Class-based in `src/systems/`
- **Game Scenes**: In `src/game/scenes/`
- **Game Manager**: Main orchestrator in `src/game/GameManager.ts`
- **React Bridge**: `PhaserGame.tsx` connects React to Phaser
- **Event Bus**: Use `EventBus` for cross-communication

### Error Handling
- Use TypeScript strict types to prevent runtime errors
- Validate game state before operations
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Return boolean success flags for operations like save/load

### 文件组织
```
src/
├── components/       # React UI 组件
│   ├── UI/          # UI 特定组件（ResourcePanel.tsx）
│   ├── Layout/      # 布局组件（预留）
│   └── GameCanvas/  # 游戏画布包装器（预留）
├── game/            # Phaser 游戏逻辑
│   ├── scenes/      # Phaser 场景
│   ├── EventBus.ts  # 事件总线
│   ├── GameManager.ts  # 游戏管理器
│   └── main.ts      # 游戏初始化
├── systems/         # 游戏系统（资源、建筑等）
│   ├── ResourceSystem.ts
│   ├── BuildingSystem.ts
│   ├── SkillSystem.ts
│   ├── SurvivalSystem.ts
│   └── TimeSystem.ts
├── entities/        # 游戏实体（预留）
├── types/           # TypeScript 类型定义
├── hooks/           # 自定义 React Hooks（预留）
└── utils/           # 工具函数和常量
    ├── constants.ts
    ├── helpers.ts
    └── storage.ts
```

### ESLint 规则
- Extends: eslint:recommended, @typescript-eslint/recommended, react-hooks/recommended
- Plugins: react-refresh
- Enforces component export patterns for Fast Refresh

## 开发注意事项
- 开发服务器运行在 8080 端口
- Vite 自动处理热重载
- Phaser 游戏配置在 `src/game/main.ts`
- 游戏状态通过 localStorage 持久化
- 使用 React 19 和 Phaser 3.90.0

## Web3 集成开发指南（Fractal Bitcoin - UniSat 优先）

### Web3 技术栈（UniSat 优先）
- **UniSat Wallet API** - 浏览器扩展原生 API（`window.unisat`）
- **UniSat API** - 官方 REST API（api.unisat.io）
- **bitcoinjs-lib** - Bitcoin 交易构建（备用）
- **BRC-20 / Runes** - UniSat 原生支持的资产标准

### UniSat 资源
- **官网**: https://unisat.io
- **钱包下载**: https://unisat.io/download（Chrome 扩展）
- **API 文档**: https://docs.unisat.io
- **开发者控制台**: https://developer.unisat.io（获取 API Key）
- **市场 API**: https://api.unisat.io/query-v4

### Web3 目录结构（UniSat 优先）
```
src/web3/
├── config/
│   ├── network.ts          # FB 网络配置
│   └── constants.ts        # UniSat 常量
├── providers/
│   └── UniSatProvider.tsx  # UniSat Provider
├── hooks/
│   ├── useUniSatWallet.ts  # UniSat 钱包连接
│   ├── useUniSatBRC20.ts   # BRC-20 代币（UniSat API）
│   ├── useUniSatInscribe.ts # UniSat 铭刻
│   ├── useUniSatMarket.ts  # UniSat 市场数据
│   └── useUniSatBalance.ts # FB 余额查询
├── services/
│   ├── unisatAPI.ts        # UniSat API 封装
│   ├── unisatWallet.ts     # UniSat 钱包封装
│   └── indexer.ts          # FB 索引器
├── components/
│   ├── UniSatConnectButton.tsx
│   ├── UniSatBRC20List.tsx
│   └── UniSatInscribePanel.tsx
└── utils/
    ├── address.ts          # Taproot 地址工具
    └── format.ts           # 格式化工具
```

### UniSat 网络配置
```typescript
// UniSat 支持的 FB 网络
export const UNISAT_NETWORKS = {
  fractalMainnet: {
    name: 'Fractal Bitcoin',
    unisatNetwork: 'fractal_mainnet',
    explorer: 'https://explorer.fractalbitcoin.io',
    apiBase: 'https://api.unisat.io/query-v4',
  },
  fractalTestnet: {
    name: 'Fractal Bitcoin Testnet',
    unisatNetwork: 'fractal_testnet',
    explorer: 'https://explorer-testnet.fractalbitcoin.io',
    apiBase: 'https://api.unisat.io/query-v4',
  },
}

// 当前网络
export const CURRENT_NETWORK = import.meta.env.VITE_FB_NETWORK === 'mainnet' 
  ? UNISAT_NETWORKS.fractalMainnet 
  : UNISAT_NETWORKS.fractalTestnet
```

### UniSat API 服务封装
创建 `src/web3/services/unisatAPI.ts`:
```typescript
const API_BASE = 'https://api.unisat.io/query-v4'
const API_KEY = import.meta.env.VITE_UNISAT_API_KEY

export class UniSatAPI {
  private async request(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`UniSat API 错误: ${response.status}`)
    }
    
    return response.json()
  }

  // 获取 BRC-20 余额
  async getBRC20Balance(address: string, ticker?: string) {
    const endpoint = ticker 
      ? `/address/${address}/brc20/${ticker}`
      : `/address/${address}/brc20/summary`
    return this.request(endpoint)
  }

  // 获取交易历史
  async getTransactionHistory(address: string) {
    return this.request(`/address/${address}/txs`)
  }

  // 获取 NFT/铭文列表
  async getInscriptions(address: string) {
    return this.request(`/address/${address}/inscriptions`)
  }
}

export const unisatAPI = new UniSatAPI()
```

### UniSat Hook 模板
```typescript
// useUniSatWallet.ts
import { useState, useEffect, useCallback } from 'react'

declare global {
  interface Window {
    unisat?: {
      requestAccounts: () => Promise<string[]>
      getAccounts: () => Promise<string[]>
      getBalance: () => Promise<{ confirmed: number; unconfirmed: number; total: number }>
      getNetwork: () => Promise<string>
      switchNetwork: (network: string) => Promise<void>
      signMessage: (message: string) => Promise<string>
      sendBitcoin: (toAddress: string, satoshis: number) => Promise<string>
      pushTx: (rawTx: string) => Promise<string>
      inscribe: (content: string, options?: any) => Promise<{ inscriptionId: string; txid: string }>
      on: (event: string, callback: Function) => void
      removeListener: (event: string, callback: Function) => void
    }
  }
}

export const useUniSatWallet = () => {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [balance, setBalance] = useState({ confirmed: 0, unconfirmed: 0, total: 0 })
  const [network, setNetwork] = useState('')

  const connect = useCallback(async () => {
    if (typeof window.unisat === 'undefined') {
      window.open('https://unisat.io/download', '_blank')
      return
    }

    try {
      const accounts = await window.unisat.requestAccounts()
      const bal = await window.unisat.getBalance()
      const net = await window.unisat.getNetwork()
      
      setAddress(accounts[0])
      setBalance(bal)
      setNetwork(net)
      setIsConnected(true)
    } catch (error) {
      console.error('UniSat 连接失败:', error)
    }
  }, [])

  return { address, isConnected, balance, network, connect }
}
```

### Web3 开发规范（UniSat 优先）
- **Hook 命名**: useUniSat + 功能名（如 `useUniSatWallet`, `useUniSatBRC20`）
- **钱包连接**: 优先使用原生 `window.unisat` API
- **API 调用**: 使用 UniSat 官方 API，需配置 API Key
- **资产标准**: BRC-20 和 Runes（UniSat 原生支持）
- **数据存储**: 使用 UniSat 铭刻功能存储游戏数据
- **地址格式**: Taproot（bc1p...）

### UniSat 环境变量
```env
# UniSat API Key（必需，从 https://developer.unisat.io 获取）
VITE_UNISAT_API_KEY=your_unisat_api_key

# FB 网络选择
VITE_FB_NETWORK=mainnet  # 或 testnet

# UniSat API 基础地址
VITE_UNISAT_API_BASE=https://api.unisat.io/query-v4

# 游戏铭文协议标识
VITE_GAME_PROTOCOL=endless-winter
```

### UniSat 钱包安装
1. **Chrome 扩展**: https://unisat.io/download
2. **切换到 Fractal Bitcoin**:
   - 点击钱包右上角网络选择器
   - 选择 "Fractal Bitcoin"（主网）或 "Fractal Bitcoin Testnet"
3. **创建/导入钱包**:
   - 使用 Taproot 地址类型（bc1p...）
4. **获取测试币**（测试网）:
   - 加入 UniSat Discord 申请测试币
   - 或使用官方水龙头

### UniSat API 限制
- **免费版**: 10 请求/秒
- **付费版**: 100 请求/秒
- **BRC-20 查询**: 需要 API Key
- **市场数据**: 部分需要付费

### 实施计划
详见 `WEB3_FB_INTEGRATION_PLAN.md` 文件，包含 UniSat 优先的详细实施计划。
