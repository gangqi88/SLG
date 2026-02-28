# Web3 集成实施方案

## 概述
本项目将集成 Web3 功能，实现游戏状态上链、资产 NFT 化、代币经济系统。

## 技术选型

### 核心库
- **wagmi v2** - React Web3 hooks 库
- **viem v2** - TypeScript 原生以太坊交互库
- **@rainbow-me/rainbowkit** - 钱包连接 UI 组件
- **@tanstack/react-query v5** - 异步状态管理

### 区块链选择
- **开发/测试**: Sepolia 测试网
- **生产**: Ethereum Mainnet / Polygon / Base
- **理由**: EVM 兼容，生态成熟，gas 费用可控

## 实施阶段

### 阶段一：基础环境搭建（第 1 周）

#### 1.1 安装依赖
```bash
npm install wagmi viem @tanstack/react-query @rainbow-me/rainbowkit
```

#### 1.2 创建目录结构
```
src/
├── web3/
│   ├── config/
│   │   ├── wagmi.ts          # wagmi 配置
│   │   ├── chains.ts         # 链配置
│   │   └── contracts.ts      # 合约地址配置
│   ├── providers/
│   │   └── Web3Provider.tsx  # Web3 Provider 组件
│   ├── hooks/
│   │   ├── useWallet.ts      # 钱包连接 hook
│   │   ├── useGameState.ts   # 游戏状态合约 hook
│   │   ├── useNFTAssets.ts   # NFT 资产 hook
│   │   └── useToken.ts       # 代币 hook
│   ├── contracts/
│   │   ├── abi/
│   │   │   ├── GameState.json
│   │   │   ├── GameAssets.json
│   │   │   └── GameToken.json
│   │   └── addresses.ts
│   └── utils/
│       ├── format.ts         # 格式化工具
│       └── errors.ts         # 错误处理
```

#### 1.3 配置 wagmi
创建 `src/web3/config/wagmi.ts`:

```typescript
import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, polygon, base } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// 支持的链
export const supportedChains = [mainnet, sepolia, polygon, base] as const

// 创建配置
export const config = createConfig({
  chains: supportedChains,
  connectors: [
    injected(),
    walletConnect({
      projectId: import.meta.env.VITE_WC_PROJECT_ID || '',
    }),
    coinbaseWallet({
      appName: '无尽冬日',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
  },
})

// 类型声明
declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
```

#### 1.4 创建 Web3Provider
创建 `src/web3/providers/Web3Provider.tsx`:

```typescript
import React from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { config } from '../config/wagmi'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
})

interface Web3ProviderProps {
  children: React.ReactNode
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#00b4d8',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default Web3Provider
```

#### 1.5 更新 main.tsx
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Web3Provider } from './web3/providers/Web3Provider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Web3Provider>
      <App />
    </Web3Provider>
  </React.StrictMode>
)
```

### 阶段二：智能合约设计（第 1-2 周）

#### 2.1 合约架构

**合约 1: GameState.sol** - 游戏状态存储
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GameState {
    struct PlayerState {
        uint256 daysSurvived;
        uint256 totalSurvivors;
        uint256 buildingsCount;
        uint256 resourcesHash; // 资源状态哈希
        uint256 lastSaveTime;
        bool exists;
    }
    
    mapping(address => PlayerState) public playerStates;
    mapping(address => uint256[]) public saveHistory;
    
    event GameSaved(address indexed player, uint256 timestamp, uint256 daysSurvived);
    event GameLoaded(address indexed player, uint256 timestamp);
    
    function saveGame(
        uint256 _daysSurvived,
        uint256 _totalSurvivors,
        uint256 _buildingsCount,
        uint256 _resourcesHash
    ) external {
        PlayerState storage state = playerStates[msg.sender];
        
        state.daysSurvived = _daysSurvived;
        state.totalSurvivors = _totalSurvivors;
        state.buildingsCount = _buildingsCount;
        state.resourcesHash = _resourcesHash;
        state.lastSaveTime = block.timestamp;
        state.exists = true;
        
        saveHistory[msg.sender].push(block.timestamp);
        
        emit GameSaved(msg.sender, block.timestamp, _daysSurvived);
    }
    
    function loadGame() external view returns (PlayerState memory) {
        require(playerStates[msg.sender].exists, "No save found");
        return playerStates[msg.sender];
    }
    
    function getSaveHistory() external view returns (uint256[] memory) {
        return saveHistory[msg.sender];
    }
}
```

**合约 2: GameAssets.sol** - 游戏资产 NFT
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameAssets is ERC721, ERC721Enumerable, Ownable {
    enum AssetType { BUILDING, SURVIVOR, ITEM }
    
    struct Asset {
        AssetType assetType;
        string metadataURI;
        uint256 power;
        uint256 createdAt;
    }
    
    mapping(uint256 => Asset) public assets;
    mapping(address => uint256[]) public playerAssets;
    
    uint256 private _tokenIdCounter;
    
    event AssetMinted(address indexed player, uint256 tokenId, AssetType assetType);
    event AssetUpgraded(uint256 indexed tokenId, uint256 newPower);
    
    constructor() ERC721("EndlessWinterAssets", "EWA") Ownable(msg.sender) {}
    
    function mintAsset(
        address to,
        AssetType assetType,
        string memory metadataURI,
        uint256 power
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        
        assets[tokenId] = Asset({
            assetType: assetType,
            metadataURI: metadataURI,
            power: power,
            createdAt: block.timestamp
        });
        
        _safeMint(to, tokenId);
        playerAssets[to].push(tokenId);
        
        emit AssetMinted(to, tokenId, assetType);
        return tokenId;
    }
    
    function upgradeAsset(uint256 tokenId, uint256 newPower) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        assets[tokenId].power = newPower;
        emit AssetUpgraded(tokenId, newPower);
    }
    
    function getPlayerAssets(address player) external view returns (uint256[] memory) {
        return playerAssets[player];
    }
    
    // 必须的函数
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

**合约 3: GameToken.sol** - 游戏代币
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WinterToken is ERC20, Ownable {
    mapping(address => bool) public minters;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not minter");
        _;
    }
    
    constructor() ERC20("Winter Token", "WINTER") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // 初始供应 100万
    }
    
    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
    
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    // 奖励函数 - 由游戏合约调用
    function rewardPlayer(address player, uint256 amount) external onlyMinter {
        _mint(player, amount);
    }
}
```

#### 2.2 合约 ABI 文件
创建 `src/web3/contracts/abi/GameState.json` (简化版):
```json
{
  "abi": [
    {
      "inputs": [
        {"name": "_daysSurvived", "type": "uint256"},
        {"name": "_totalSurvivors", "type": "uint256"},
        {"name": "_buildingsCount", "type": "uint256"},
        {"name": "_resourcesHash", "type": "uint256"}
      ],
      "name": "saveGame",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "loadGame",
      "outputs": [
        {
          "components": [
            {"name": "daysSurvived", "type": "uint256"},
            {"name": "totalSurvivors", "type": "uint256"},
            {"name": "buildingsCount", "type": "uint256"},
            {"name": "resourcesHash", "type": "uint256"},
            {"name": "lastSaveTime", "type": "uint256"},
            {"name": "exists", "type": "bool"}
          ],
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
}
```

#### 2.3 合约地址配置
创建 `src/web3/contracts/addresses.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  sepolia: {
    GameState: '0x...', // 部署后填写
    GameAssets: '0x...',
    WinterToken: '0x...',
  },
  mainnet: {
    GameState: '0x...',
    GameAssets: '0x...',
    WinterToken: '0x...',
  },
  polygon: {
    GameState: '0x...',
    GameAssets: '0x...',
    WinterToken: '0x...',
  },
} as const

export type SupportedChain = keyof typeof CONTRACT_ADDRESSES
```

### 阶段三：前端 Hook 实现（第 2 周）

#### 3.1 钱包连接 Hook
创建 `src/web3/hooks/useWallet.ts`:

```typescript
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { useCallback } from 'react'

export const useWallet = () => {
  const { address, isConnected, isConnecting, isReconnecting, status } = useAccount()
  const chainId = useChainId()
  const { connect, connectors, error: connectError, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const connectWallet = useCallback(async (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId)
    if (connector) {
      connect({ connector })
    }
  }, [connect, connectors])

  const disconnectWallet = useCallback(() => {
    disconnect()
  }, [disconnect])

  const switchToChain = useCallback((chainId: number) => {
    switchChain({ chainId })
  }, [switchChain])

  return {
    address,
    isConnected,
    isConnecting: isConnecting || isPending,
    isReconnecting,
    status,
    chainId,
    connectors,
    connectError,
    connectWallet,
    disconnectWallet,
    switchToChain,
  }
}

export default useWallet
```

#### 3.2 游戏状态合约 Hook
创建 `src/web3/hooks/useGameState.ts`:

```typescript
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { useCallback, useEffect } from 'react'
import { parseAbi } from 'viem'
import { CONTRACT_ADDRESSES } from '../contracts/addresses'

const GAME_STATE_ABI = parseAbi([
  'function saveGame(uint256 _daysSurvived, uint256 _totalSurvivors, uint256 _buildingsCount, uint256 _resourcesHash) external',
  'function loadGame() external view returns (tuple(uint256 daysSurvived, uint256 totalSurvivors, uint256 buildingsCount, uint256 resourcesHash, uint256 lastSaveTime, bool exists))',
])

export interface SaveGameParams {
  daysSurvived: number
  totalSurvivors: number
  buildingsCount: number
  resourcesHash: string
  chainId: number
}

export const useGameState = (chainId: number) => {
  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.GameState

  // 写入合约 - 保存游戏
  const { 
    writeContract, 
    data: hash, 
    error: writeError, 
    isPending: isWriting 
  } = useWriteContract()

  // 等待交易确认
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // 读取合约 - 加载游戏
  const { 
    data: savedState, 
    refetch: refetchSavedState, 
    isLoading: isReading,
    error: readError 
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: GAME_STATE_ABI,
    functionName: 'loadGame',
    query: {
      enabled: !!contractAddress,
    },
  })

  const saveGameToChain = useCallback((params: Omit<SaveGameParams, 'chainId'>) => {
    if (!contractAddress) {
      console.error('Contract address not found for chain', chainId)
      return
    }

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: GAME_STATE_ABI,
      functionName: 'saveGame',
      args: [
        BigInt(params.daysSurvived),
        BigInt(params.totalSurvivors),
        BigInt(params.buildingsCount),
        BigInt(params.resourcesHash),
      ],
    })
  }, [writeContract, contractAddress, chainId])

  const loadGameFromChain = useCallback(() => {
    refetchSavedState()
  }, [refetchSavedState])

  return {
    saveGameToChain,
    loadGameFromChain,
    savedState,
    isSaving: isWriting || isConfirming,
    isSaved: isConfirmed,
    isLoading: isReading,
    saveError: writeError,
    loadError: readError,
    transactionHash: hash,
  }
}

export default useGameState
```

#### 3.3 NFT 资产 Hook
创建 `src/web3/hooks/useNFTAssets.ts`:

```typescript
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useCallback } from 'react'
import { parseAbi } from 'viem'
import { CONTRACT_ADDRESSES } from '../contracts/addresses'

const GAME_ASSETS_ABI = parseAbi([
  'function getPlayerAssets(address player) external view returns (uint256[])',
  'function assets(uint256 tokenId) external view returns (uint8 assetType, string metadataURI, uint256 power, uint256 createdAt)',
  'function upgradeAsset(uint256 tokenId, uint256 newPower) external',
])

export enum AssetType {
  BUILDING = 0,
  SURVIVOR = 1,
  ITEM = 2,
}

export interface Asset {
  tokenId: number
  assetType: AssetType
  metadataURI: string
  power: number
  createdAt: number
}

export const useNFTAssets = (playerAddress: string, chainId: number) => {
  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.GameAssets

  // 读取玩家资产
  const { 
    data: tokenIds, 
    refetch: refetchAssets,
    isLoading 
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: GAME_ASSETS_ABI,
    functionName: 'getPlayerAssets',
    args: [playerAddress as `0x${string}`],
    query: {
      enabled: !!contractAddress && !!playerAddress,
    },
  })

  // 升级资产
  const { 
    writeContract, 
    data: hash, 
    isPending: isUpgrading 
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isUpgraded } = useWaitForTransactionReceipt({
    hash,
  })

  const upgradeAsset = useCallback((tokenId: number, newPower: number) => {
    if (!contractAddress) return
    
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: GAME_ASSETS_ABI,
      functionName: 'upgradeAsset',
      args: [BigInt(tokenId), BigInt(newPower)],
    })
  }, [writeContract, contractAddress])

  const refreshAssets = useCallback(() => {
    refetchAssets()
  }, [refetchAssets])

  return {
    tokenIds: tokenIds ? tokenIds.map(id => Number(id)) : [],
    isLoading,
    upgradeAsset,
    isUpgrading: isUpgrading || isConfirming,
    isUpgraded,
    refreshAssets,
    transactionHash: hash,
  }
}

export default useNFTAssets
```

#### 3.4 代币 Hook
创建 `src/web3/hooks/useToken.ts`:

```typescript
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useCallback } from 'react'
import { parseAbi, formatUnits, parseUnits } from 'viem'
import { CONTRACT_ADDRESSES } from '../contracts/addresses'

const TOKEN_ABI = parseAbi([
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
])

export const useToken = (playerAddress: string, chainId: number) => {
  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.WinterToken

  // 读取余额
  const { 
    data: balance, 
    refetch: refetchBalance,
    isLoading: isLoadingBalance 
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: [playerAddress as `0x${string}`],
    query: {
      enabled: !!contractAddress && !!playerAddress,
    },
  })

  // 读取代币信息
  const { data: decimals } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'decimals',
    query: {
      enabled: !!contractAddress,
    },
  })

  const { data: symbol } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'symbol',
    query: {
      enabled: !!contractAddress,
    },
  })

  // 转账
  const { 
    writeContract, 
    data: hash, 
    isPending: isTransferring 
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isTransferred } = useWaitForTransactionReceipt({
    hash,
  })

  const transfer = useCallback((to: string, amount: string) => {
    if (!contractAddress || !decimals) return
    
    const parsedAmount = parseUnits(amount, decimals)
    
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: TOKEN_ABI,
      functionName: 'transfer',
      args: [to as `0x${string}`, parsedAmount],
    })
  }, [writeContract, contractAddress, decimals])

  const formattedBalance = balance && decimals 
    ? formatUnits(balance, decimals) 
    : '0'

  return {
    balance: formattedBalance,
    rawBalance: balance,
    symbol: symbol || 'WINTER',
    decimals: decimals || 18,
    isLoadingBalance,
    transfer,
    isTransferring: isTransferring || isConfirming,
    isTransferred,
    refetchBalance,
    transactionHash: hash,
  }
}

export default useToken
```

### 阶段四：UI 集成（第 3 周）

#### 4.1 钱包连接按钮组件
创建 `src/web3/components/ConnectButton.tsx`:

```typescript
import React from 'react'
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'

export const ConnectButton: React.FC = () => {
  return (
    <RainbowConnectButton
      showBalance={false}
      accountStatus="address"
      chainStatus="icon"
    />
  )
}

export default ConnectButton
```

#### 4.2 链上存档按钮组件
创建 `src/web3/components/ChainSaveButton.tsx`:

```typescript
import React from 'react'
import { useGameState, SaveGameParams } from '../hooks/useGameState'
import { useAccount } from 'wagmi'

interface ChainSaveButtonProps {
  gameData: Omit<SaveGameParams, 'chainId'>
  onSuccess?: () => void
}

export const ChainSaveButton: React.FC<ChainSaveButtonProps> = ({ 
  gameData, 
  onSuccess 
}) => {
  const { isConnected, chainId } = useAccount()
  const { 
    saveGameToChain, 
    isSaving, 
    isSaved, 
    saveError,
    transactionHash 
  } = useGameState(chainId || 0)

  const handleSave = () => {
    if (!chainId) return
    
    saveGameToChain({
      ...gameData,
    })
  }

  React.useEffect(() => {
    if (isSaved && onSuccess) {
      onSuccess()
    }
  }, [isSaved, onSuccess])

  if (!isConnected) {
    return (
      <button disabled className="web3-button disabled">
        请先连接钱包
      </button>
    )
  }

  return (
    <div className="chain-save-container">
      <button 
        onClick={handleSave} 
        disabled={isSaving}
        className="web3-button"
      >
        {isSaving ? '保存中...' : '保存到链上'}
      </button>
      
      {isSaved && (
        <div className="success-message">
          ✅ 保存成功!
          {transactionHash && (
            <a 
              href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              查看交易
            </a>
          )}
        </div>
      )}
      
      {saveError && (
        <div className="error-message">
          ❌ 保存失败: {saveError.message}
        </div>
      )}
    </div>
  )
}

export default ChainSaveButton
```

#### 4.3 代币余额显示组件
创建 `src/web3/components/TokenBalance.tsx`:

```typescript
import React from 'react'
import { useToken } from '../hooks/useToken'
import { useAccount } from 'wagmi'

export const TokenBalance: React.FC = () => {
  const { address, isConnected, chainId } = useAccount()
  const { balance, symbol, isLoadingBalance } = useToken(address || '', chainId || 0)

  if (!isConnected) {
    return <div className="token-balance">-- {symbol}</div>
  }

  return (
    <div className="token-balance">
      {isLoadingBalance ? (
        <span>加载中...</span>
      ) : (
        <span>
          <strong>{parseFloat(balance).toFixed(2)}</strong> {symbol}
        </span>
      )}
    </div>
  )
}

export default TokenBalance
```

### 阶段五：GameManager 集成（第 3-4 周）

#### 5.1 修改 GameManager
更新 `src/game/GameManager.ts`，添加 Web3 集成层:

```typescript
// ... 现有导入
import { SaveGameParams } from '../web3/hooks/useGameState'

export interface Web3GameState {
  isWeb3Enabled: boolean
  lastChainSaveTime?: number
  chainSaveHash?: string
}

export class GameManager {
  // ... 现有属性
  private web3State: Web3GameState = {
    isWeb3Enabled: false,
  }

  // 获取链上保存所需的数据
  getChainSaveData(): Omit<SaveGameParams, 'chainId'> {
    const resourcesHash = this.calculateResourcesHash()
    
    return {
      daysSurvived: this.gameState.gameStats.daysSurvived,
      totalSurvivors: this.gameState.survivors.length,
      buildingsCount: this.gameState.buildings.length,
      resourcesHash,
    }
  }

  // 计算资源哈希（用于链上验证）
  private calculateResourcesHash(): string {
    // 简化的哈希计算 - 实际项目中使用更复杂的算法
    const resourcesData = JSON.stringify(this.gameState.resources)
    let hash = 0
    for (let i = 0; i < resourcesData.length; i++) {
      const char = resourcesData.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString()
  }

  // 从链上恢复游戏
  restoreFromChain(chainState: {
    daysSurvived: number
    totalSurvivors: number
    buildingsCount: number
  }): boolean {
    // 验证数据一致性
    if (chainState.daysSurvived !== this.gameState.gameStats.daysSurvived) {
      console.warn('链上数据与本地数据不一致')
      // 可以选择以链上数据为准
    }

    this.web3State.lastChainSaveTime = Date.now()
    return true
  }

  // 启用 Web3
  enableWeb3(): void {
    this.web3State.isWeb3Enabled = true
  }

  // 禁用 Web3
  disableWeb3(): void {
    this.web3State.isWeb3Enabled = false
  }

  // 获取 Web3 状态
  getWeb3State(): Web3GameState {
    return { ...this.web3State }
  }

  // ... 其他现有方法
}
```

#### 5.2 更新 App.tsx 集成 Web3 UI
```typescript
import React, { useState, useEffect, useRef } from 'react'
import { GameManager } from './game/GameManager'
import ResourcePanel from './components/UI/ResourcePanel'
import { PhaserGame } from './PhaserGame'
import { IRefPhaserGame } from './PhaserGame'
import { ConnectButton } from './web3/components/ConnectButton'
import { ChainSaveButton } from './web3/components/ChainSaveButton'
import { TokenBalance } from './web3/components/TokenBalance'
import { useAccount } from 'wagmi'

function App() {
  const [gameManager] = useState(() => new GameManager())
  const [gameInfo, setGameInfo] = useState<any>(null)
  const [isGameRunning, setIsGameRunning] = useState(false)
  const [showGameUI, setShowGameUI] = useState(true)
  const [activeTab, setActiveTab] = useState<'local' | 'web3'>('local')
  
  const { isConnected, address, chainId } = useAccount()
  const phaserRef = useRef<IRefPhaserGame | null>(null)

  useEffect(() => {
    // 如果连接了钱包，启用 Web3
    if (isConnected) {
      gameManager.enableWeb3()
    } else {
      gameManager.disableWeb3()
    }
  }, [isConnected, gameManager])

  // ... 其他现有 useEffect 和函数

  return (
    <div className="app">
      <header className="app-header">
        <h1>无尽冬日</h1>
        <div className="game-controls">
          <ConnectButton />
          {isConnected && <TokenBalance />}
          <button onClick={handleNewGame}>新游戏</button>
          <button onClick={handleSaveGame}>本地保存</button>
          <button onClick={handleLoadGame}>本地加载</button>
        </div>
      </header>

      <div className="game-container">
        {/* ... Phaser 游戏 */}
        
        {showGameUI && (
          <div className="game-ui">
            {/* 标签页切换 */}
            <div className="ui-tabs">
              <button 
                className={activeTab === 'local' ? 'active' : ''}
                onClick={() => setActiveTab('local')}
              >
                本地游戏
              </button>
              <button 
                className={activeTab === 'web3' ? 'active' : ''}
                onClick={() => setActiveTab('web3')}
              >
                Web3
              </button>
            </div>

            {activeTab === 'web3' && isConnected && (
              <div className="web3-panel">
                <h3>区块链存档</h3>
                <ChainSaveButton 
                  gameData={gameManager.getChainSaveData()}
                  onSuccess={() => alert('游戏已保存到区块链!')}
                />
                
                <h3>NFT 资产</h3>
                <div className="nft-assets">
                  <p>您的链上资产将显示在这里</p>
                </div>
                
                <h3>代币操作</h3>
                <div className="token-actions">
                  <p>使用 WINTER 代币购买游戏内道具</p>
                </div>
              </div>
            )}
            
            {/* ... 其他 UI */}
          </div>
        )}
      </div>
    </div>
  )
}
```

### 阶段六：环境配置（贯穿全程）

#### 6.1 环境变量文件
创建 `.env.example`:
```env
# WalletConnect Project ID (从 https://cloud.walletconnect.com/ 获取)
VITE_WC_PROJECT_ID=your_walletconnect_project_id

# 默认链 ID (1=Mainnet, 11155111=Sepolia, 137=Polygon)
VITE_DEFAULT_CHAIN_ID=11155111

# Alchemy/Infura API Key (用于 RPC 连接)
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
```

创建 `.env` (gitignore 中):
```env
VITE_WC_PROJECT_ID=your_actual_project_id
VITE_DEFAULT_CHAIN_ID=11155111
VITE_ALCHEMY_API_KEY=your_actual_api_key
```

#### 6.2 更新 vite 配置
更新 `vite/config.dev.mjs`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 8080,
  },
  define: {
    // 确保环境变量可用
    'process.env': {},
  },
})
```

### 阶段七：测试与优化（第 4 周）

#### 7.1 测试清单
- [ ] 钱包连接/断开功能
- [ ] 多钱包支持 (MetaMask, WalletConnect, Coinbase)
- [ ] 网络切换功能
- [ ] 链上存档功能
- [ ] 链上读档功能
- [ ] 错误处理 (用户拒绝、网络错误等)
- [ ] 加载状态显示
- [ ] 交易确认等待

#### 7.2 性能优化
- [ ] 合约调用缓存
- [ ] 批量请求优化
- [ ] 错误重试机制
- [ ] 离线模式支持

#### 7.3 安全考虑
- [ ] 输入验证
- [ ] 防止重放攻击
- [ ] 合约权限控制
- [ ] 敏感操作确认

## 实施时间表

| 阶段 | 时间 | 主要任务 | 产出物 |
|------|------|----------|--------|
| 阶段一 | 第 1 周 | 环境搭建、依赖安装、基础配置 | 可运行的 Web3 环境 |
| 阶段二 | 第 1-2 周 | 智能合约开发、部署、测试 | 部署到测试网的合约 |
| 阶段三 | 第 2 周 | Hook 开发、合约交互封装 | 完整的 hooks 库 |
| 阶段四 | 第 3 周 | UI 组件开发、用户界面集成 | Web3 UI 组件 |
| 阶段五 | 第 3-4 周 | GameManager 集成、数据同步 | 完整的 Web3 游戏功能 |
| 阶段六 | 全程 | 环境配置、文档编写 | 配置文件、文档 |
| 阶段七 | 第 4 周 | 测试、优化、Bug 修复 | 稳定的 Web3 功能 |

## 风险与应对

### 技术风险
1. **智能合约漏洞**
   - 应对: 代码审计、形式化验证、测试网充分测试

2. **Gas 费用波动**
   - 应对: Layer 2 方案 (Polygon/Base)、批量操作、Gas 优化

3. **网络拥堵**
   - 应对: 异步处理、队列机制、离线缓存

### 业务风险
1. **用户接受度**
   - 应对: 可选功能、保留本地存档、Web2.5 过渡

2. **监管风险**
   - 应对: 合规设计、地区限制、KYC 准备

## 预算估算

| 项目 | 预估成本 | 说明 |
|------|----------|------|
| 智能合约开发 | 2-3 周工作量 | 3 个核心合约 |
| 前端集成 | 2-3 周工作量 | Hook + UI |
| 合约部署 (测试网) | 免费 | Sepolia 使用测试币 |
| 合约部署 (主网) | $500-2000 | 取决于 Gas 价格 |
| 合约审计 | $5000-15000 | 可选但推荐 |
| 基础设施 | $100/月 | RPC 节点、IPFS 等 |

## 下一步行动

1. **立即开始**: 阶段一环境搭建
2. **本周完成**: 安装依赖、配置 wagmi
3. **下周开始**: 智能合约开发
4. **建立**: 测试网部署流程
5. **准备**: 主网部署清单

---

**备注**: 此方案基于 React 19 + TypeScript 5.7 + wagmi v2 + viem v2 技术栈，是当前 (2025年) Web3 前端开发的最佳实践。
