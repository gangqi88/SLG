# Web3开发规范技能

> 本技能定义Web3 SLG游戏项目的区块链集成、钱包连接、资产NFT化及代币经济系统开发规范。

## 技能概述

- **职责**: Web3开发 - 钱包集成、NFT/代币、链上数据、智能合约交互
- **适用场景**: Web3区块链功能开发、NFT集成、代币经济
- **技术栈**: UniSat API + Fractal Bitcoin + TypeScript

## 技能职责

### 核心职责

Web3开发技能负责以下工作：

- 钱包连接和身份验证
- 链上资产管理和交易
- NFT铸造和转移
- 代币经济系统实现
- 区块链数据查询和同步
- Web3安全规范执行

### 职责边界

| 包含         | 不包含                   |
| ------------ | ------------------------ |
| 钱包集成开发 | UI界面设计               |
| 智能合约交互 | 智能合约编写（预留接口） |
| 链上数据处理 | 后端服务器开发           |
| 资产NFT化    | 美术资源制作             |

## 钱包集成规范

### 支持的钱包

| 钱包    | 网络            | 支持状态 |
| ------- | --------------- | -------- |
| UniSat  | Fractal Bitcoin | 首选     |
| Xverse  | Fractal Bitcoin | 待支持   |
| Leather | Fractal Bitcoin | 待支持   |

### 连接流程

```
检测钱包 → 请求连接 → 获取地址 → 验证签名 → 建立会话
```

### 连接代码示例

```typescript
// 钱包连接示例
interface WalletState {
  connected: boolean;
  address: string | null;
  publicKey: string | null;
  network: string;
}

class WalletService {
  private state: WalletState = {
    connected: false,
    address: null,
    publicKey: null,
    network: 'testnet',
  };

  async connect(): Promise<WalletState> {
    if (typeof window === 'undefined' || !window.unisat) {
      throw new Error('UniSat钱包未安装');
    }

    try {
      const accounts = await window.unisat.requestAccounts();
      if (accounts.length === 0) {
        throw new Error('未找到钱包账户');
      }

      this.state.address = accounts[0];
      this.state.connected = true;

      // 获取公钥
      const publicKey = await window.unisat.getPublicKey();
      this.state.publicKey = publicKey;

      return this.state;
    } catch (error) {
      console.error('钱包连接失败:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.state = {
      connected: false,
      address: null,
      publicKey: null,
      network: 'testnet',
    };
  }

  getState(): WalletState {
    return { ...this.state };
  }
}
```

### 钱包状态管理

```typescript
// 钱包状态钩子
import { create } from 'zustand';

interface WalletStore {
  connected: boolean;
  address: string | null;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  updateBalance: () => Promise<void>;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  connected: false,
  address: null,
  balance: 0,

  connect: async () => {
    const walletService = WalletService.getInstance();
    const state = await walletService.connect();
    set({
      connected: state.connected,
      address: state.address,
    });
  },

  disconnect: async () => {
    const walletService = WalletService.getInstance();
    await walletService.disconnect();
    set({ connected: false, address: null, balance: 0 });
  },

  updateBalance: async () => {
    // 更新余额逻辑
  },
}));
```

## 资产NFT规范

### NFT数据结构

```typescript
// NFT资产定义
interface GameNFT {
  id: string;
  type: 'hero' | 'land' | 'item';
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  owner: string;
  tokenId?: string;
  inscribed: boolean;
  createdAt: number;
}

interface NFTAttribute {
  trait_type: string;
  value: string | number;
}
```

### NFT铸造流程

```
准备数据 → 链下处理 → 铭刻 inscription → 确认上链 → 更新状态
```

### 英雄NFT示例

```typescript
// 英雄NFT数据结构
interface HeroNFT {
  // 基础信息
  id: string;
  name: string;
  quality: 'purple' | 'orange' | 'red';
  faction: 'human' | 'angel' | 'demon';

  // 属性
  attributes: {
    command: number;
    strength: number;
    intelligence: number;
    defense: number;
  };

  // 稀有度属性
  rarity: {
    starLevel: number;
    skills: string[];
    passiveAbilities: string[];
  };

  // 元数据
  metadata: {
    image: string;
    description: string;
    external_url: string;
  };
}

// 转换为NFT元数据
function heroToNFTMetadata(hero: Hero): HeroNFT {
  return {
    id: hero.id,
    name: hero.name,
    quality: hero.quality,
    faction: hero.faction,
    attributes: hero.attributes,
    rarity: {
      starLevel: hero.starLevel,
      skills: hero.skills.map((s) => s.id),
      passiveAbilities: hero.passiveSkills.map((s) => s.id),
    },
    metadata: {
      image: `https://assets.game.com/heroes/${hero.id}.png`,
      description: `${hero.faction}阵营${hero.quality}英雄`,
      external_url: `https://game.com/hero/${hero.id}`,
    },
  };
}
```

## 代币经济规范

### 代币类型

| 代币类型 | 用途       | 区块链 |
| -------- | ---------- | ------ |
| 游戏代币 | 游戏内流通 | 链下   |
| 治理代币 | DAO投票    | BRC-20 |
| 收藏代币 | 限定NFT    | Runes  |

### 代币接口

```typescript
// 代币接口
interface TokenBalance {
  symbol: string;
  balance: number;
  decimals: number;
}

interface TokenService {
  getBalance(address: string, symbol: string): Promise<TokenBalance>;
  transfer(to: string, amount: number, symbol: string): Promise<string>;
  approve(spender: string, amount: number, symbol: string): Promise<string>;
}
```

### 经济模型设计

```typescript
// 游戏经济系统
interface EconomyConfig {
  // 代币产出
  production: {
    dailyLogin: number;
    battleWin: number;
    questComplete: number;
  };

  // 代币消耗
  consumption: {
    heroUpgrade: number[];
    equipmentEnhance: number[];
    speedUp: number[];
  };

  // 汇率
  rates: {
    usdToToken: number;
    tokenToUSD: number;
  };
}

const economyConfig: EconomyConfig = {
  production: {
    dailyLogin: 100,
    battleWin: 50,
    questComplete: 200,
  },
  consumption: {
    heroUpgrade: [1000, 5000, 20000, 50000, 100000],
    equipmentEnhance: [500, 2000, 8000, 30000],
    speedUp: [10, 50, 200, 1000],
  },
  rates: {
    usdToToken: 100,
    tokenToUSD: 0.01,
  },
};
```

## 链上数据查询

### 数据查询接口

```typescript
// 链上数据查询
interface BlockchainService {
  // 获取地址余额
  getBalance(address: string): Promise<number>;

  // 获取交易历史
  getTransactions(address: string, limit?: number): Promise<Transaction[]>;

  // 获取NFT列表
  getNFTs(address: string): Promise<GameNFT[]>;

  // 获取NFT详情
  getNFTDetail(tokenId: string): Promise<GameNFT>;

  // 验证交易
  verifyTransaction(txId: string): Promise<TransactionStatus>;
}

interface Transaction {
  txId: string;
  from: string;
  to: string;
  amount: number;
  symbol: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}
```

### 链上数据同步

```typescript
// 链上数据同步示例
class ChainDataSync {
  private syncInterval: number = 60000; // 1分钟
  private timer?: number;

  async syncNFTs(address: string): Promise<void> {
    const blockchainService = BlockchainService.getInstance();
    const nfts = await blockchainService.getNFTs(address);

    // 更新本地状态
    const localNFTs = this.loadLocalNFTs();
    const mergedNFTs = this.mergeNFTs(localNFTs, nfts);
    this.saveLocalNFTs(mergedNFTs);
  }

  startAutoSync(address: string): void {
    this.timer = window.setInterval(() => {
      this.syncNFTs(address);
    }, this.syncInterval);
  }

  stopAutoSync(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
```

## 安全规范

### 安全原则

- 私钥不离开钱包
- 敏感操作需要用户确认
- 签名内容需要完整展示
- 交易需要明确金额和接收方

### 安全检查清单

- [ ] 钱包连接前检查钱包是否安装
- [ ] 请求权限时明确说明权限范围
- [ ] 签名请求显示完整内容摘要
- [ ] 交易前确认接收地址和金额
- [ ] 错误处理包含友好提示
- [ ] 超时处理有重试机制

### 错误处理

```typescript
// Web3错误类型
enum Web3ErrorCode {
  WALLET_NOT_INSTALLED = 'WALLET_001',
  WALLET_CONNECTION_FAILED = 'WALLET_002',
  SIGNATURE_REJECTED = 'SIGN_001',
  TRANSACTION_FAILED = 'TX_001',
  INSUFFICIENT_BALANCE = 'BALANCE_001',
  NETWORK_MISMATCH = 'NETWORK_001',
}

interface Web3Error {
  code: Web3ErrorCode;
  message: string;
  details?: any;
}

function handleWeb3Error(error: any): Web3Error {
  if (error.code === 4001) {
    return {
      code: Web3ErrorCode.SIGNATURE_REJECTED,
      message: '签名已被用户拒绝',
      details: error,
    };
  }

  if (error.message?.includes('Insufficient funds')) {
    return {
      code: Web3ErrorCode.INSUFFICIENT_BALANCE,
      message: '余额不足',
      details: error,
    };
  }

  return {
    code: Web3ErrorCode.TRANSACTION_FAILED,
    message: '交易失败，请重试',
    details: error,
  };
}
```

## 测试规范

### Web3测试要点

- 钱包连接断开场景
- 签名被拒绝场景
- 交易失败场景
- 网络切换场景
- 余额不足场景
- 链上数据延迟场景

### 测试网络

- 测试网：Fractal Bitcoin Testnet
- 水龙头：使用测试网水龙头获取测试代币

## 与其他技能的协作

### 与代码规范技能协作

```markdown
协作点：

- Web3代码需要遵循代码规范
- 类型定义需要符合项目标准

引用：fullstack-code-standards/SKILL.md
```

### 与测试规范技能协作

```markdown
协作点：

- Web3功能需要完整测试覆盖
- 钱包兼容性需要测试验证

引用：game-tester/SKILL.md
```

### 与架构设计技能协作

```markdown
协作点：

- Web3架构需要符合整体架构设计
- 数据结构需要与系统对接

引用：architect/SKILL.md
```

---

_技能版本: 1.0.0_
_创建日期: 2026-03-06_ \*相关文档:

- fullstack-code-standards/SKILL.md
- game-tester/SKILL.md
- architect/SKILL.md\*
  _遵守规范: .trae/rules/project-rules/SKILL.md_
