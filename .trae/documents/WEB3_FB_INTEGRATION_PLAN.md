# Web3 集成实施方案（Fractal Bitcoin - UniSat 优先）

## 概述
本项目将集成 Fractal Bitcoin (FB) 二层网络，**使用 UniSat 作为主要技术栈**，实现游戏状态铭刻、BRC-20 代币经济系统。

**为什么选择 UniSat？**
- 官方原生支持 Fractal Bitcoin
- 完整的 API 生态（钱包 + 索引器）
- 内置 BRC-20 和 Runes 支持
- 最好的用户体验和文档

## 技术选型（UniSat 优先）

### 核心资源
- **UniSat Wallet** - Chrome 扩展（`window.unisat` API）
- **UniSat API** - 官方 REST API（api.unisat.io/query-v4）
- **UniSat Indexer** - BRC-20/铭文索引服务
- **bitcoinjs-lib** - 备用交易构建

### 网络配置
- **主网**: Fractal Bitcoin Mainnet（`fractal_mainnet`）
- **测试网**: Fractal Bitcoin Testnet（`fractal_testnet`）
- **资产标准**: BRC-20（推荐）和 Runes

## 实施阶段

### 阶段一：UniSat 环境搭建（第 1 周）

#### 1.1 安装依赖
```bash
npm install bitcoinjs-lib axios
npm install -D @types/bitcoinjs-lib
```

**注意**: UniSat API 通过原生 `window.unisat` 访问，无需额外 npm 包

#### 1.2 创建目录结构
```
src/web3/
├── config/
│   ├── network.ts          # UniSat 网络配置
│   └── constants.ts        # 常量定义
├── providers/
│   └── UniSatProvider.tsx  # UniSat Provider
├── hooks/
│   ├── useUniSatWallet.ts  # UniSat 钱包连接
│   ├── useUniSatBRC20.ts   # UniSat BRC-20 API
│   ├── useUniSatInscribe.ts # UniSat 铭刻
│   └── useUniSatBalance.ts # 余额查询
├── services/
│   ├── unisatAPI.ts        # UniSat API 封装
│   ├── unisatWallet.ts     # UniSat 钱包封装
│   └── indexer.ts          # UniSat 索引器
├── components/
│   ├── UniSatConnectButton.tsx
│   ├── UniSatBRC20List.tsx
│   └── UniSatInscribePanel.tsx
└── utils/
    ├── address.ts          # Taproot 地址工具
    └── format.ts           # 格式化工具
```

#### 1.3 UniSat 网络配置
创建 `src/web3/config/network.ts`:

```typescript
// UniSat 支持的 Fractal Bitcoin 网络
export const UNISAT_NETWORKS = {
  fractalMainnet: {
    name: 'Fractal Bitcoin',
    unisatNetwork: 'fractal_mainnet' as const,
    explorer: 'https://explorer.fractalbitcoin.io',
    apiBase: 'https://api.unisat.io/query-v4',
    wsBase: 'wss://api.unisat.io/query-v4/ws',
  },
  fractalTestnet: {
    name: 'Fractal Bitcoin Testnet',
    unisatNetwork: 'fractal_testnet' as const,
    explorer: 'https://explorer-testnet.fractalbitcoin.io',
    apiBase: 'https://api.unisat.io/query-v4',
    wsBase: 'wss://api.unisat.io/query-v4/ws',
  },
}

export type UniSatNetwork = typeof UNISAT_NETWORKS[keyof typeof UNISAT_NETWORKS]

// 当前网络
export const CURRENT_NETWORK = import.meta.env.VITE_FB_NETWORK === 'mainnet' 
  ? UNISAT_NETWORKS.fractalMainnet 
  : UNISAT_NETWORKS.fractalTestnet
```

#### 1.4 UniSat API 服务封装
创建 `src/web3/services/unisatAPI.ts`:

```typescript
const API_BASE = import.meta.env.VITE_UNISAT_API_BASE || 'https://api.unisat.io/query-v4'
const API_KEY = import.meta.env.VITE_UNISAT_API_KEY

export interface BRC20Balance {
  ticker: string
  overallBalance: string
  transferableBalance: string
  availableBalance: string
  decimals: number
}

export interface Inscription {
  inscriptionId: string
  inscriptionNumber: number
  contentType: string
  contentLength: number
}

export class UniSatAPI {
  private headers: Record<string, string>

  constructor() {
    this.headers = {
      'Content-Type': 'application/json',
    }
    if (API_KEY) {
      this.headers['Authorization'] = `Bearer ${API_KEY}`
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options?.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`UniSat API 错误 ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    if (!data.code || data.code !== 0) {
      throw new Error(data.msg || 'API 请求失败')
    }
    
    return data.data as T
  }

  // 获取 BRC-20 余额列表
  async getBRC20BalanceList(address: string): Promise<BRC20Balance[]> {
    return this.request<BRC20Balance[]>(`/address/${address}/brc20/summary`)
  }

  // 获取指定 BRC-20 代币余额
  async getBRC20Balance(address: string, ticker: string): Promise<BRC20Balance> {
    return this.request<BRC20Balance>(`/address/${address}/brc20/${ticker}`)
  }

  // 获取 BRC-20 交易历史
  async getBRC20History(address: string, ticker?: string) {
    const endpoint = ticker 
      ? `/address/${address}/brc20/${ticker}/history`
      : `/address/${address}/brc20/history`
    return this.request(endpoint)
  }

  // 获取铭文列表
  async getInscriptions(address: string, cursor?: number, size: number = 20): Promise<{
    list: Inscription[]
    total: number
  }> {
    const params = new URLSearchParams()
    if (cursor) params.append('cursor', cursor.toString())
    params.append('size', size.toString())
    
    return this.request(`/address/${address}/inscriptions?${params}`)
  }

  // 获取交易历史
  async getTransactionHistory(address: string) {
    return this.request(`/address/${address}/txs`)
  }

  // 获取 FB 余额（通过 UTXO）
  async getFBBalance(address: string): Promise<{
    confirmed: number
    unconfirmed: number
    total: number
  }> {
    return this.request(`/address/${address}/balance`)
  }

  // 获取 BRC-20 代币信息
  async getBRC20Info(ticker: string) {
    return this.request(`/brc20/${ticker}`)
  }

  // 获取 BRC-20 持有者列表
  async getBRC20Holders(ticker: string, cursor?: number, size: number = 20) {
    const params = new URLSearchParams()
    if (cursor) params.append('cursor', cursor.toString())
    params.append('size', size.toString())
    
    return this.request(`/brc20/${ticker}/holders?${params}`)
  }
}

export const unisatAPI = new UniSatAPI()
```

#### 1.5 UniSat 钱包类型定义
创建 `src/web3/types/unisat.d.ts`:

```typescript
// UniSat 钱包全局类型定义

declare global {
  interface Window {
    unisat?: UniSatWallet
  }
}

export interface UniSatWallet {
  // 账户相关
  requestAccounts(): Promise<string[]>
  getAccounts(): Promise<string[]>
  
  // 网络相关
  getNetwork(): Promise<string>
  switchNetwork(network: 'fractal_mainnet' | 'fractal_testnet' | string): Promise<void>
  
  // 余额相关
  getBalance(): Promise<{
    confirmed: number
    unconfirmed: number
    total: number
  }>
  
  // 地址相关
  getPublicKey(): Promise<string>
  
  // 签名相关
  signMessage(message: string, type?: 'bip322-simple' | 'ecdsa'): Promise<string>
  signPsbt(psbtHex: string, options?: SignPsbtOptions): Promise<string>
  pushPsbt(psbtHex: string): Promise<string>
  
  // 交易相关
  sendBitcoin(
    toAddress: string, 
    satoshis: number, 
    options?: { 
      feeRate?: number
      memo?: string
    }
  ): Promise<string>
  
  pushTx(rawTx: string): Promise<string>
  
  // 铭刻相关
  inscribe(
    content: string,
    options?: {
      contentType?: string
      feeRate?: number
    }
  ): Promise<{
    inscriptionId: string
    txid: string
  }>
  
  // 事件监听
  on(event: 'accountsChanged', callback: (accounts: string[]) => void): void
  on(event: 'networkChanged', callback: (network: string) => void): void
  
  removeListener(event: string, callback: Function): void
}

export interface SignPsbtOptions {
  autoFinalized?: boolean
  toSignInputs: {
    index: number
    address?: string
    publicKey?: string
    sighashTypes?: number[]
  }[]
}
```

### 阶段二：UniSat 钱包连接（第 1 周）

#### 2.1 UniSat 钱包 Hook
创建 `src/web3/hooks/useUniSatWallet.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react'
import type { UniSatWallet } from '../types/unisat'
import { CURRENT_NETWORK } from '../config/network'

export interface UniSatWalletState {
  address: string | null
  publicKey: string | null
  balance: {
    confirmed: number
    unconfirmed: number
    total: number
  }
  network: string
  isConnected: boolean
}

export const useUniSatWallet = () => {
  const [state, setState] = useState<UniSatWalletState>({
    address: null,
    publicKey: null,
    balance: { confirmed: 0, unconfirmed: 0, total: 0 },
    network: '',
    isConnected: false,
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 检查 UniSat 是否安装
  const checkUniSatInstalled = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.unisat !== 'undefined'
  }, [])

  // 获取 UniSat 实例
  const getUniSat = useCallback((): UniSatWallet | null => {
    return window.unisat || null
  }, [])

  // 连接钱包
  const connect = useCallback(async () => {
    if (!checkUniSatInstalled()) {
      setError('请先安装 UniSat 钱包')
      window.open('https://unisat.io/download', '_blank')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const unisat = getUniSat()!
      
      // 请求账户
      const accounts = await unisat.requestAccounts()
      
      // 获取网络
      const network = await unisat.getNetwork()
      
      // 获取余额
      const balance = await unisat.getBalance()
      
      // 获取公钥（可选）
      let publicKey = ''
      try {
        publicKey = await unisat.getPublicKey()
      } catch {
        // 某些情况下可能无法获取公钥
      }

      setState({
        address: accounts[0],
        publicKey,
        balance,
        network,
        isConnected: true,
      })

      return true
    } catch (err: any) {
      setError(err.message || '连接钱包失败')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [checkUniSatInstalled, getUniSat])

  // 断开连接
  const disconnect = useCallback(() => {
    setState({
      address: null,
      publicKey: null,
      balance: { confirmed: 0, unconfirmed: 0, total: 0 },
      network: '',
      isConnected: false,
    })
    setError(null)
  }, [])

  // 切换到 FB 网络
  const switchToFractal = useCallback(async () => {
    const unisat = getUniSat()
    if (!unisat) return false

    try {
      const targetNetwork = CURRENT_NETWORK.unisatNetwork
      await unisat.switchNetwork(targetNetwork)
      
      // 更新状态
      const network = await unisat.getNetwork()
      setState(prev => ({ ...prev, network }))
      
      return true
    } catch (err: any) {
      setError('切换到 Fractal Bitcoin 失败: ' + err.message)
      return false
    }
  }, [getUniSat])

  // 刷新余额
  const refreshBalance = useCallback(async () => {
    const unisat = getUniSat()
    if (!unisat || !state.isConnected) return

    try {
      const balance = await unisat.getBalance()
      setState(prev => ({ ...prev, balance }))
    } catch (err) {
      console.error('刷新余额失败:', err)
    }
  }, [getUniSat, state.isConnected])

  // 监听账户和网络变化
  useEffect(() => {
    const unisat = getUniSat()
    if (!unisat || !state.isConnected) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        setState(prev => ({ ...prev, address: accounts[0] }))
        refreshBalance()
      }
    }

    const handleNetworkChanged = (network: string) => {
      setState(prev => ({ ...prev, network }))
    }

    unisat.on('accountsChanged', handleAccountsChanged)
    unisat.on('networkChanged', handleNetworkChanged)

    return () => {
      unisat.removeListener('accountsChanged', handleAccountsChanged)
      unisat.removeListener('networkChanged', handleNetworkChanged)
    }
  }, [getUniSat, state.isConnected, disconnect, refreshBalance])

  return {
    ...state,
    isLoading,
    error,
    connect,
    disconnect,
    switchToFractal,
    refreshBalance,
    checkUniSatInstalled,
  }
}

export default useUniSatWallet
```

#### 2.2 UniSat 连接按钮组件
创建 `src/web3/components/UniSatConnectButton.tsx`:

```typescript
import React from 'react'
import { useUniSatWallet } from '../hooks/useUniSatWallet'

export const UniSatConnectButton: React.FC = () => {
  const { 
    isConnected, 
    address, 
    balance, 
    network,
    isLoading, 
    error, 
    connect, 
    disconnect,
    switchToFractal,
    checkUniSatInstalled 
  } = useUniSatWallet()

  const formatBalance = (sats: number) => {
    return (sats / 100000000).toFixed(8)
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // 检查是否连接到正确的网络
  const isCorrectNetwork = network === 'fractal_mainnet' || network === 'fractal_testnet'

  if (isConnected && address) {
    return (
      <div className="unisat-wallet-connected">
        <div className="wallet-info">
          <span className="address">{truncateAddress(address)}</span>
          <span className="balance">{formatBalance(balance.total)} FB</span>
          {network && <span className="network">{network}</span>}
        </div>
        
        {!isCorrectNetwork && (
          <button onClick={switchToFractal} className="switch-network-btn">
            切换到 FB
          </button>
        )}
        
        <button onClick={disconnect} className="disconnect-btn">
          断开
        </button>
      </div>
    )
  }

  if (!checkUniSatInstalled()) {
    return (
      <a 
        href="https://unisat.io/download" 
        target="_blank" 
        rel="noopener noreferrer"
        className="install-wallet-btn"
      >
        安装 UniSat
      </a>
    )
  }

  return (
    <div className="unisat-connect-container">
      <button 
        onClick={connect} 
        disabled={isLoading}
        className="connect-btn"
      >
        {isLoading ? '连接中...' : '连接 UniSat'}
      </button>
      
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}
    </div>
  )
}

export default UniSatConnectButton
```

### 阶段三：UniSat BRC-20 集成（第 2 周）

#### 3.1 UniSat BRC-20 Hook
创建 `src/web3/hooks/useUniSatBRC20.ts`:

```typescript
import { useState, useCallback, useEffect } from 'react'
import { unisatAPI, BRC20Balance } from '../services/unisatAPI'

export interface BRC20TokenWithPrice extends BRC20Balance {
  floorPrice?: number
  marketCap?: number
}

export const useUniSatBRC20 = (address: string | null) => {
  const [tokens, setTokens] = useState<BRC20Balance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取 BRC-20 余额
  const fetchBRC20Balance = useCallback(async () => {
    if (!address) {
      setTokens([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await unisatAPI.getBRC20BalanceList(address)
      setTokens(data || [])
    } catch (err: any) {
      setError(err.message || '获取 BRC-20 余额失败')
      console.error('获取 BRC-20 余额失败:', err)
    } finally {
      setIsLoading(false)
    }
  }, [address])

  // 获取指定代币余额
  const getTokenBalance = useCallback(async (ticker: string): Promise<BRC20Balance | null> => {
    if (!address) return null

    try {
      return await unisatAPI.getBRC20Balance(address, ticker)
    } catch (err) {
      console.error(`获取 ${ticker} 余额失败:`, err)
      return null
    }
  }, [address])

  // 自动刷新
  useEffect(() => {
    if (address) {
      fetchBRC20Balance()
    }
  }, [address, fetchBRC20Balance])

  return {
    tokens,
    isLoading,
    error,
    fetchBRC20Balance,
    getTokenBalance,
  }
}

export default useUniSatBRC20
```

#### 3.2 BRC-20 列表组件
创建 `src/web3/components/UniSatBRC20List.tsx`:

```typescript
import React from 'react'
import { useUniSatBRC20 } from '../hooks/useUniSatBRC20'

interface UniSatBRC20ListProps {
  address: string | null
}

export const UniSatBRC20List: React.FC<UniSatBRC20ListProps> = ({ address }) => {
  const { tokens, isLoading, error, fetchBRC20Balance } = useUniSatBRC20(address)

  if (!address) {
    return <div className="brc20-list">请先连接钱包</div>
  }

  if (isLoading) {
    return <div className="brc20-list loading">加载中...</div>
  }

  if (error) {
    return (
      <div className="brc20-list error">
        <p>加载失败: {error}</p>
        <button onClick={fetchBRC20Balance}>重试</button>
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className="brc20-list empty">
        <p>暂无 BRC-20 代币</p>
        <small>您可以在 UniSat 市场购买代币</small>
      </div>
    )
  }

  return (
    <div className="brc20-list">
      <h3>我的 BRC-20 代币</h3>
      <div className="token-items">
        {tokens.map((token) => (
          <div key={token.ticker} className="token-item">
            <div className="token-header">
              <span className="ticker">{token.ticker}</span>
              <span className="decimals">{token.decimals} 位小数</span>
            </div>
            <div className="token-balance">
              <div className="balance-row">
                <span>总余额:</span>
                <strong>{parseFloat(token.overallBalance).toLocaleString()}</strong>
              </div>
              <div className="balance-row">
                <span>可用:</span>
                <span>{parseFloat(token.availableBalance).toLocaleString()}</span>
              </div>
              <div className="balance-row">
                <span>可转账:</span>
                <span>{parseFloat(token.transferableBalance).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={fetchBRC20Balance} className="refresh-btn">
        刷新
      </button>
    </div>
  )
}

export default UniSatBRC20List
```

### 阶段四：UniSat 铭刻功能（第 2-3 周）

#### 4.1 UniSat 铭刻 Hook
创建 `src/web3/hooks/useUniSatInscribe.ts`:

```typescript
import { useState, useCallback } from 'react'
import type { UniSatWallet } from '../types/unisat'

export interface InscribeGameStateParams {
  version: string
  daysSurvived: number
  totalSurvivors: number
  buildingsCount: number
  resources: object
  timestamp: number
}

export interface InscribeResult {
  inscriptionId?: string
  txid?: string
  error?: string
}

export const useUniSatInscribe = (unisat: UniSatWallet | null) => {
  const [isInscribing, setIsInscribing] = useState(false)
  const [result, setResult] = useState<InscribeResult | null>(null)

  // 铭刻游戏状态
  const inscribeGameState = useCallback(async (
    gameState: InscribeGameStateParams
  ): Promise<InscribeResult> => {
    if (!unisat) {
      return { error: '请先连接 UniSat 钱包' }
    }

    setIsInscribing(true)
    setResult(null)

    try {
      // 构建铭刻内容
      const content = JSON.stringify({
        p: 'endless-winter',
        op: 'game-save',
        v: gameState.version,
        data: {
          days: gameState.daysSurvived,
          survivors: gameState.totalSurvivors,
          buildings: gameState.buildingsCount,
          resources: gameState.resources,
        },
        ts: gameState.timestamp,
      })

      // 调用 UniSat 铭刻 API
      const inscribeResult = await unisat.inscribe(content, {
        contentType: 'application/json',
      })

      const successResult = {
        inscriptionId: inscribeResult.inscriptionId,
        txid: inscribeResult.txid,
      }

      setResult(successResult)
      return successResult
    } catch (error: any) {
      const errorResult = { error: error.message || '铭刻失败' }
      setResult(errorResult)
      return errorResult
    } finally {
      setIsInscribing(false)
    }
  }, [unisat])

  // 铭刻自定义内容
  const inscribeCustom = useCallback(async (
    content: string,
    contentType: string = 'text/plain'
  ): Promise<InscribeResult> => {
    if (!unisat) {
      return { error: '请先连接 UniSat 钱包' }
    }

    setIsInscribing(true)
    setResult(null)

    try {
      const inscribeResult = await unisat.inscribe(content, { contentType })

      const successResult = {
        inscriptionId: inscribeResult.inscriptionId,
        txid: inscribeResult.txid,
      }

      setResult(successResult)
      return successResult
    } catch (error: any) {
      const errorResult = { error: error.message || '铭刻失败' }
      setResult(errorResult)
      return errorResult
    } finally {
      setIsInscribing(false)
    }
  }, [unisat])

  return {
    isInscribing,
    result,
    inscribeGameState,
    inscribeCustom,
  }
}

export default useUniSatInscribe
```

#### 4.2 铭刻面板组件
创建 `src/web3/components/UniSatInscribePanel.tsx`:

```typescript
import React, { useState } from 'react'
import { useUniSatInscribe, InscribeGameStateParams } from '../hooks/useUniSatInscribe'
import { useUniSatWallet } from '../hooks/useUniSatWallet'
import { CURRENT_NETWORK } from '../config/network'

export interface UniSatInscribePanelProps {
  gameState: InscribeGameStateParams
}

export const UniSatInscribePanel: React.FC<UniSatInscribePanelProps> = ({ gameState }) => {
  const { isConnected, address } = useUniSatWallet()
  const unisat = typeof window !== 'undefined' ? window.unisat : null
  const { isInscribing, result, inscribeGameState } = useUniSatInscribe(unisat)
  const [savedInscriptions, setSavedInscriptions] = useState<string[]>([])

  const handleInscribe = async () => {
    const result = await inscribeGameState(gameState)
    if (result.inscriptionId) {
      setSavedInscriptions(prev => [result.inscriptionId!, ...prev])
    }
  }

  if (!isConnected) {
    return (
      <div className="inscribe-panel">
        <p>请先连接 UniSat 钱包</p>
      </div>
    )
  }

  return (
    <div className="inscribe-panel">
      <h3>链上存档</h3>
      <p>使用 UniSat 铭刻功能保存游戏状态到 FB</p>
      
      <div className="game-state-preview">
        <h4>当前游戏状态:</h4>
        <ul>
          <li>生存天数: {gameState.daysSurvived}</li>
          <li>幸存者: {gameState.totalSurvivors}</li>
          <li>建筑: {gameState.buildingsCount}</li>
        </ul>
      </div>
      
      <button 
        onClick={handleInscribe} 
        disabled={isInscribing}
        className="inscribe-btn"
      >
        {isInscribing ? '铭刻中...' : '铭刻到链上'}
      </button>

      {result?.error && (
        <div className="error-message">
          ❌ {result.error}
        </div>
      )}

      {result?.inscriptionId && (
        <div className="success-message">
          ✅ 铭刻成功！
          <div className="inscription-details">
            <p>铭文 ID: {result.inscriptionId}</p>
            <p>交易 ID: {result.txid}</p>
            <a 
              href={`${CURRENT_NETWORK.explorer}/inscription/${result.inscriptionId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              查看铭文
            </a>
          </div>
        </div>
      )}

      {savedInscriptions.length > 0 && (
        <div className="saved-history">
          <h4>历史存档</h4>
          <ul>
            {savedInscriptions.map((id, index) => (
              <li key={id}>
                <a 
                  href={`${CURRENT_NETWORK.explorer}/inscription/${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  存档 #{index + 1}: {id.slice(0, 20)}...
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="inscribe-info">
        <h4>关于 UniSat 铭刻</h4>
        <ul>
          <li>游戏数据将被永久铭刻在 FB 区块链上</li>
          <li>需要支付 FB 作为 Gas 费用</li>
          <li>铭刻完成后可在 UniSat 市场查看</li>
        </ul>
      </div>
    </div>
  )
}

export default UniSatInscribePanel
```

### 阶段五：GameManager 集成（第 3-4 周）

#### 5.1 修改 GameManager
更新 `src/game/GameManager.ts`:

```typescript
// ... 现有导入

export interface Web3GameState {
  isWeb3Enabled: boolean
  lastChainSaveTime?: number
  inscriptionId?: string
  network: 'fractal_mainnet' | 'fractal_testnet'
}

export class GameManager {
  // ... 现有属性
  private web3State: Web3GameState = {
    isWeb3Enabled: false,
    network: import.meta.env.VITE_FB_NETWORK === 'mainnet' ? 'fractal_mainnet' : 'fractal_testnet',
  }

  // 获取用于铭刻的游戏数据
  getInscriptionData() {
    return {
      version: '1.0.0',
      daysSurvived: this.gameState.gameStats.daysSurvived,
      totalSurvivors: this.gameState.survivors.length,
      buildingsCount: this.gameState.buildings.length,
      resources: this.summarizeResources(),
      timestamp: Date.now(),
    }
  }

  // 资源摘要（减少铭刻数据大小）
  private summarizeResources() {
    const resources = this.gameState.resources
    return {
      food: Math.floor(resources.food?.amount || 0),
      wood: Math.floor(resources.wood?.amount || 0),
      steel: Math.floor(resources.steel?.amount || 0),
      electricity: Math.floor(resources.electricity?.amount || 0),
      fuel: Math.floor(resources.fuel?.amount || 0),
    }
  }

  // 从铭文恢复游戏
  restoreFromInscription(inscriptionData: any): boolean {
    try {
      if (!inscriptionData.data) {
        throw new Error('无效的铭文数据')
      }

      const data = inscriptionData.data
      
      // 验证版本
      if (inscriptionData.v !== '1.0.0') {
        console.warn('铭文版本不兼容:', inscriptionData.v)
      }

      // 恢复游戏状态（简化版）
      console.log('从铭文恢复游戏:', {
        days: data.days,
        survivors: data.survivors,
        buildings: data.buildings,
      })

      this.web3State.lastChainSaveTime = inscriptionData.ts
      return true
    } catch (error) {
      console.error('恢复游戏失败:', error)
      return false
    }
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

  // 更新铭文 ID
  setInscriptionId(inscriptionId: string): void {
    this.web3State.inscriptionId = inscriptionId
    this.web3State.lastChainSaveTime = Date.now()
  }

  // ... 其他现有方法
}
```

#### 5.2 更新 App.tsx 集成 UniSat UI
```typescript
import React, { useState, useEffect, useRef } from 'react'
import { GameManager } from './game/GameManager'
import ResourcePanel from './components/UI/ResourcePanel'
import { PhaserGame } from './PhaserGame'
import { IRefPhaserGame } from './PhaserGame'
import { UniSatConnectButton } from './web3/components/UniSatConnectButton'
import { UniSatBRC20List } from './web3/components/UniSatBRC20List'
import { UniSatInscribePanel } from './web3/components/UniSatInscribePanel'
import { useUniSatWallet } from './web3/hooks/useUniSatWallet'

function App() {
  const [gameManager] = useState(() => new GameManager())
  const [gameInfo, setGameInfo] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'local' | 'unisat'>('local')
  
  const { isConnected, address } = useUniSatWallet()
  const phaserRef = useRef<IRefPhaserGame | null>(null)

  useEffect(() => {
    if (isConnected) {
      gameManager.enableWeb3()
    } else {
      gameManager.disableWeb3()
    }
  }, [isConnected, gameManager])

  // ... 其他现有代码

  return (
    <div className="app">
      <header className="app-header">
        <h1>无尽冬日</h1>
        <div className="game-controls">
          <UniSatConnectButton />
          <button onClick={handleNewGame}>新游戏</button>
          <button onClick={handleSaveGame}>本地保存</button>
        </div>
      </header>

      <div className="game-container">
        {/* ... Phaser 游戏 */}
        
        {showGameUI && (
          <div className="game-ui">
            <div className="ui-tabs">
              <button 
                className={activeTab === 'local' ? 'active' : ''}
                onClick={() => setActiveTab('local')}
              >
                本地
              </button>
              <button 
                className={activeTab === 'unisat' ? 'active' : ''}
                onClick={() => setActiveTab('unisat')}
              >
                UniSat
              </button>
            </div>

            {activeTab === 'unisat' && (
              <div className="unisat-panel">
                {!isConnected ? (
                  <div className="connect-prompt">
                    <h3>连接 UniSat 钱包</h3>
                    <p>使用 UniSat 钱包进行 BRC-20 代币管理和链上存档</p>
                    <UniSatConnectButton />
                    <div className="unisat-links">
                      <a href="https://unisat.io/download" target="_blank" rel="noopener noreferrer">
                        下载 UniSat 钱包
                      </a>
                      <a href="https://docs.unisat.io" target="_blank" rel="noopener noreferrer">
                        查看文档
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    <UniSatBRC20List address={address} />
                    <UniSatInscribePanel gameState={gameManager.getInscriptionData()} />
                  </>
                )}
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

### 阶段六：环境配置

#### 6.1 环境变量文件
创建 `.env.example`:
```env
# UniSat API Key（必需，从 https://developer.unisat.io 获取）
VITE_UNISAT_API_KEY=your_unisat_api_key_here

# FB 网络选择 (mainnet/testnet)
VITE_FB_NETWORK=testnet

# UniSat API 基础地址
VITE_UNISAT_API_BASE=https://api.unisat.io/query-v4

# 游戏铭文协议标识
VITE_GAME_PROTOCOL=endless-winter
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
    'process.env': {},
    global: 'globalThis',
  },
})
```

### 阶段七：测试与优化（第 4 周）

#### 7.1 UniSat 测试清单
- [ ] UniSat Wallet Chrome 扩展安装
- [ ] 钱包连接/断开功能
- [ ] 网络切换（Fractal Bitcoin）
- [ ] FB 余额查询
- [ ] BRC-20 余额查询（需 API Key）
- [ ] 铭文铭刻功能
- [ ] 错误处理（余额不足、网络错误）

#### 7.2 UniSat 钱包安装
1. **安装 Chrome 扩展**:
   - 访问 https://unisat.io/download
   - 添加到 Chrome

2. **切换到 Fractal Bitcoin**:
   - 打开 UniSat 钱包
   - 点击右上角网络选择器
   - 选择 "Fractal Bitcoin" 或 "Fractal Bitcoin Testnet"

3. **创建/导入钱包**:
   - 创建新钱包或导入助记词
   - 选择 Taproot 地址类型（bc1p...）

4. **获取测试币**:
   - 加入 UniSat Discord: https://discord.gg/unisat
   - 在 #testnet-faucet 频道申请测试币
   - 或使用官方水龙头（如可用）

#### 7.3 API Key 获取
1. 访问 https://developer.unisat.io
2. 注册开发者账号
3. 创建新应用
4. 获取 API Key
5. 配置到 `.env` 文件

## 实施时间表

| 阶段 | 时间 | 主要任务 | 产出物 |
|------|------|----------|--------|
| 阶段一 | 第 1 周 | UniSat 环境搭建、API 封装 | UniSatProvider、API 服务 |
| 阶段二 | 第 1 周 | UniSat 钱包连接 | useUniSatWallet hook |
| 阶段三 | 第 2 周 | UniSat BRC-20 集成 | useUniSatBRC20 hook + UI |
| 阶段四 | 第 2-3 周 | UniSat 铭刻功能 | useUniSatInscribe hook + 面板 |
| 阶段五 | 第 3-4 周 | GameManager 集成 | 完整的 UniSat 功能 |
| 阶段六 | 全程 | 环境配置、文档 | 配置文件、文档 |
| 阶段七 | 第 4 周 | FB 测试网测试 | 稳定的 UniSat 集成 |

## 预算估算

| 项目 | 预估成本 | 说明 |
|------|----------|------|
| 开发工作量 | 3-4 周 | UniSat 专用集成 |
| UniSat API | 免费-$100/月 | 免费版 10 req/s，付费版 100 req/s |
| FB 测试网使用 | 免费 | 向 UniSat Discord 申请测试币 |
| FB 主网铭刻 | ~$10-50/次 | 取决于铭文大小和网络拥堵 |

## 风险与应对

### 技术风险
1. **UniSat API 限制**
   - 应对: 实现缓存机制、请求队列

2. **FB 网络拥堵**
   - 应对: 动态调整 fee rate、交易重试

3. **铭刻费用波动**
   - 应对: 费用估算、用户确认流程

### 业务风险
1. **用户需安装 UniSat**
   - 应对: 详细安装教程、备选方案（OKX）

2. **API Key 管理**
   - 应对: 前端限制、后端代理（生产环境）

## 下一步行动

1. **立即开始**: 阶段一环境搭建
2. **申请**: UniSat API Key（https://developer.unisat.io）
3. **安装**: UniSat Wallet Chrome 扩展
4. **获取**: FB 测试网代币
5. **配置**: 环境变量和 API Key

## UniSat 资源链接

- **官网**: https://unisat.io
- **钱包下载**: https://unisat.io/download
- **开发者文档**: https://docs.unisat.io
- **API 控制台**: https://developer.unisat.io
- **市场**: https://unisat.io/market
- **GitHub**: https://github.com/unisat-wallet
- **Discord**: https://discord.gg/unisat

---

**文档版本**: 1.0.0  
**技术栈**: UniSat Wallet + UniSat API + Fractal Bitcoin  
**最后更新**: 2025年
