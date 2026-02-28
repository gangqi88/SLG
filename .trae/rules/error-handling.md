---
alwaysApply: false
description: 基于编码标准规范的前置条件，本规范在检测到错误处理相关代码时智能生效，确保统一的错误处理实践。
---
# 错误处理规范

## 1. 基本原则
- 禁止空 catch 块，必须包含日志记录。

## 2. 标准化错误处理
- 优先使用 `src/utils/error.util.ts` 中的 `getErrorMessage` 和 `formatError` 进行标准化错误处理。

## 3. 网络请求规范
- 网络请求必须经过 `HttpService` 以利用内置的重试与熔断机制。

## 4. 业务异常告警
- 关键业务异常需通过 `ArbitrageNotifierService` 发送告警。

## 5. 诊断日志增强
- 在关键执行链路（如 `executeThreeLegs`、`executeSingleLeg`）中添加详细诊断日志，记录执行状态、重试次数、滑点调整等信息。

## 6. SLG游戏错误处理

### 6.1 英雄系统错误处理
```typescript
// 英雄操作错误处理示例
try {
  const result = heroSystem.upgradeHero(heroId, materials);
  return { success: true, data: result };
} catch (error) {
  // 记录详细错误信息
  console.error(`英雄升级失败`, {
    heroId,
    materials,
    error: error.message,
    stack: error.stack,
    timestamp: Date.now()
  });
  
  // 返回标准化错误响应
  return {
    success: false,
    error: formatError(error, 'HERO_UPGRADE_FAILED'),
    userMessage: getHeroUpgradeErrorMessage(error)
  };
}
```

### 6.2 战斗系统错误处理
```typescript
// 战斗计算错误处理示例
function calculateBattleDamage(attacker: Hero, defender: Hero): DamageResult {
  try {
    // 验证输入参数
    if (!attacker || !defender) {
      throw new Error('战斗参数无效：英雄对象不存在');
    }
    
    // 执行伤害计算
    const baseDamage = attacker.attributes.strength * 0.8;
    const defenseReduction = defender.attributes.defense / (defender.attributes.defense + 200);
    const factionBonus = getFactionBonus(attacker, defender);
    
    return {
      damage: Math.floor(baseDamage * (1 - defenseReduction) * (1 + factionBonus)),
      critical: isCriticalHit(attacker),
      blocked: isBlocked(defender)
    };
  } catch (error) {
    // 记录战斗错误
    console.error('战斗伤害计算失败', {
      attackerId: attacker.id,
      defenderId: defender.id,
      error: error.message
    });
    
    // 返回默认值，避免游戏中断
    return {
      damage: 0,
      critical: false,
      blocked: false,
      error: error.message
    };
  }
}
```

### 6.3 Web3 NFT错误处理
```typescript
// NFT铸造错误处理示例
async function mintNFTHero(heroId: string, quality: HeroQuality): Promise<NFTMintResult> {
  try {
    // 检查钱包连接
    if (!window.ethereum) {
      throw new Error('未检测到钱包，请安装MetaMask或其他Web3钱包');
    }
    
    // 检查网络
    const network = await window.ethereum.request({ method: 'eth_chainId' });
    if (network !== EXPECTED_CHAIN_ID) {
      throw new Error('网络不匹配，请切换到正确的网络');
    }
    
    // 执行铸造
    const result = await heroNFTContract.mintHero(heroId, quality);
    
    return {
      success: true,
      transactionHash: result.hash,
      tokenId: result.events.Transfer.returnValues.tokenId
    };
  } catch (error) {
    // 处理特定Web3错误
    if (error.code === 4001) {
      // 用户拒绝交易
      return {
        success: false,
        error: '用户取消了交易',
        userAction: 'retry'
      };
    } else if (error.code === -32603) {
      // 内部错误
      return {
        success: false,
        error: '网络繁忙，请稍后重试',
        userAction: 'retry'
      };
    }
    
    // 记录Web3错误
    console.error('NFT英雄铸造失败', {
      heroId,
      quality,
      errorCode: error.code,
      errorMessage: error.message
    });
    
    return {
      success: false,
      error: formatError(error, 'NFT_MINT_FAILED'),
      userAction: 'contact_support'
    };
  }
}
```

### 6.4 战斗网络对战错误处理
```typescript
// 网络战斗错误处理示例
async function executeNetworkBattle(battleId: string, playerTeam: Team): Promise<BattleResult> {
  try {
    // 检查网络连接
    if (!navigator.onLine) {
      throw new Error('网络连接不可用，请检查网络设置');
    }
    
    // 发送战斗数据
    const response = await battleService.executeBattle(battleId, playerTeam);
    
    return response.data;
  } catch (error) {
    // 处理网络超时
    if (error.name === 'TimeoutError') {
      console.warn('战斗执行超时，尝试本地计算', { battleId });
      return executeLocalBattle(playerTeam, enemyTeam);
    }
    
    // 处理服务器错误
    if (error.response?.status >= 500) {
      return {
        success: false,
        error: '服务器暂时不可用，请稍后重试',
        retryable: true
      };
    }
    
    // 记录网络战斗错误
    console.error('网络战斗执行失败', {
      battleId,
      playerTeamId: playerTeam.id,
      error: error.message,
      statusCode: error.response?.status
    });
    
    return {
      success: false,
      error: formatError(error, 'NETWORK_BATTLE_FAILED'),
      fallback: executeLocalBattle
    };
  }
}
```

### 6.5 错误分类和处理策略

#### 英雄系统错误
- **参数错误**: 返回用户友好的提示信息
- **资源不足**: 提供资源获取建议
- **状态冲突**: 提示用户当前英雄状态
- **系统错误**: 记录日志并返回通用错误信息

#### 战斗系统错误
- **计算错误**: 使用默认值，确保游戏继续
- **状态同步错误**: 回滚到上一个有效状态
- **网络错误**: 启用本地计算作为备用方案

#### Web3 NFT错误
- **钱包连接错误**: 提供详细的连接指引
- **网络错误**: 提示网络切换建议
- **交易失败**: 区分用户取消和网络问题
- **合约错误**: 记录详细信息并联系技术支持

### 6.6 错误恢复策略
```typescript
// 错误恢复工具函数
function handleErrorRecovery(error: GameError, context: ErrorContext): RecoveryAction {
  switch (error.type) {
    case 'HERO_UPGRADE_FAILED':
      return {
        action: 'retry',
        maxRetries: 3,
        backoffMs: 1000,
        userMessage: '英雄升级失败，正在重试...'
      };
    
    case 'BATTLE_CALCULATION_ERROR':
      return {
        action: 'fallback',
        fallbackMethod: 'useDefaultValues',
        userMessage: '战斗计算异常，使用默认值继续游戏'
      };
    
    case 'NFT_MINT_FAILED':
      if (error.code === 4001) {
        return {
          action: 'user_confirm',
          userMessage: '您取消了交易，是否重新尝试？'
        };
      } else {
        return {
          action: 'contact_support',
          userMessage: 'NFT铸造失败，请联系技术支持'
        };
      }
    
    default:
      return {
        action: 'log_and_continue',
        userMessage: '发生未知错误，游戏将继续运行'
      };
  }
}
```

### 6.7 用户友好的错误消息
```typescript
// 错误消息映射表
const USER_ERROR_MESSAGES = {
  'HERO_UPGRADE_FAILED': '英雄升级失败，请检查资源是否充足',
  'BATTLE_TIMEOUT': '战斗超时，已使用本地计算',
  'WALLET_NOT_CONNECTED': '请先连接钱包',
  'NETWORK_MISMATCH': '请切换到正确的网络',
  'TRANSACTION_CANCELLED': '您取消了交易',
  'INSUFFICIENT_FUNDS': '余额不足，请充值后重试',
  'HERO_ALREADY_DEPLOYED': '英雄已在战斗中，无法重复部署',
  'TEAM_SIZE_EXCEEDED': '队伍已满，无法添加更多英雄'
};
```