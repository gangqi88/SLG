---
alwaysApply: false
description: 基于编码标准规范的前置条件，本规范在检测到日志记录相关代码时智能生效，确保统一的日志实践。
---
# 日志规范

## 1. Logger 实例管理
- 所有服务必须拥有独立的 `Logger` 实例上下文。

## 2. 日志格式
- 核心业务数据（如套利机会）推荐使用结构化 JSON 日志。

## 3. 诊断日志增强

### 3.1 配置记录
- 在 `validateBeforeExecution()` 等方法中记录关键配置（如 `ARBITRAGE_MIN_PROFIT_RATE`）的来源、解析结果与实际值。

### 3.2 对比信息记录
- 在关键决策点记录对比信息（如当前 ROI 与阈值对比、路径类型与代币序列）。

### 3.3 日志级别区分
- `error`：系统异常，需要人工介入
- `warn`：预期内的失败（如滑点过高、余额不足）
- `debug`：调试信息（生产环境可能过滤）

## 4. SLG游戏日志规范

### 4.1 英雄系统日志
```typescript
// 英雄操作日志示例
class HeroSystemLogger {
  private logger = Logger.create('HeroSystem');
  
  upgradeHero(heroId: string, fromLevel: number, toLevel: number, materials: any) {
    this.logger.info('英雄升级开始', {
      heroId,
      fromLevel,
      toLevel,
      materials: JSON.stringify(materials),
      timestamp: Date.now()
    });
    
    try {
      const result = this.performUpgrade(heroId, toLevel, materials);
      
      this.logger.info('英雄升级成功', {
        heroId,
        newLevel: toLevel,
        newAttributes: result.attributes,
        materialsConsumed: materials,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      this.logger.error('英雄升级失败', {
        heroId,
        targetLevel: toLevel,
        materials,
        error: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
      throw error;
    }
  }
}
```

### 4.2 战斗系统日志
```typescript
// 战斗过程日志示例
class BattleSystemLogger {
  private logger = Logger.create('BattleSystem');
  
  executeBattle(attackerTeam: Team, defenderTeam: Team): BattleResult {
    const battleId = generateBattleId();
    
    this.logger.info('战斗开始', {
      battleId,
      attacker: {
        teamId: attackerTeam.id,
        faction: attackerTeam.faction,
        heroes: attackerTeam.members.map(m => ({ id: m.heroId, level: m.level }))
      },
      defender: {
        teamId: defenderTeam.id,
        faction: defenderTeam.faction,
        heroes: defenderTeam.members.map(m => ({ id: m.heroId, level: m.level }))
      },
      timestamp: Date.now()
    });
    
    try {
      const result = this.performBattle(attackerTeam, defenderTeam);
      
      this.logger.info('战斗结束', {
        battleId,
        winner: result.winner,
        rounds: result.rounds.length,
        totalDamage: result.totalDamage,
        duration: result.duration,
        heroPerformances: result.heroPerformances,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      this.logger.error('战斗执行异常', {
        battleId,
        attackerTeamId: attackerTeam.id,
        defenderTeamId: defenderTeam.id,
        error: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
      
      // 返回默认结果，避免游戏中断
      return this.getDefaultBattleResult(attackerTeam, defenderTeam);
    }
  }
  
  logSkillUsage(heroId: string, skillId: string, target: string, effect: any) {
    this.logger.debug('技能使用', {
      heroId,
      skillId,
      target,
      effect: JSON.stringify(effect),
      timestamp: Date.now()
    });
  }
}
```

### 4.3 Web3 NFT日志
```typescript
// NFT操作日志示例
class NFTHeroLogger {
  private logger = Logger.create('NFTHeroSystem');
  
  async mintHero(heroId: string, quality: HeroQuality, userAddress: string): Promise<NFTMintResult> {
    this.logger.info('NFT英雄铸造开始', {
      heroId,
      quality,
      userAddress,
      timestamp: Date.now()
    });
    
    try {
      const result = await this.performMinting(heroId, quality, userAddress);
      
      this.logger.info('NFT英雄铸造成功', {
        heroId,
        tokenId: result.tokenId,
        transactionHash: result.transactionHash,
        quality,
        userAddress,
        gasUsed: result.gasUsed,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      this.logger.error('NFT英雄铸造失败', {
        heroId,
        quality,
        userAddress,
        errorCode: error.code,
        errorMessage: error.message,
        timestamp: Date.now()
      });
      
      throw error;
    }
  }
  
  logNFTTransfer(from: string, to: string, tokenId: string, transactionHash: string) {
    this.logger.info('NFT转移', {
      from,
      to,
      tokenId,
      transactionHash,
      timestamp: Date.now()
    });
  }
}
```

### 4.4 阵营克制日志
```typescript
// 阵营克制效果日志
class FactionSystemLogger {
  private logger = Logger.create('FactionSystem');
  
  applyFactionBonus(attacker: Hero, defender: Hero, baseDamage: number): number {
    const factionBonus = this.getFactionBonus(attacker.faction, defender.faction);
    const finalDamage = baseDamage * (1 + factionBonus);
    
    if (factionBonus > 0) {
      this.logger.debug('阵营克制生效', {
        attackerFaction: attacker.faction,
        defenderFaction: defender.faction,
        baseDamage,
        bonus: factionBonus,
        finalDamage,
        timestamp: Date.now()
      });
    }
    
    return finalDamage;
  }
}
```

### 4.5 性能监控日志
```typescript
// 性能监控日志
class PerformanceLogger {
  private logger = Logger.create('Performance');
  
  measureBattlePerformance(battleId: string, battleFunction: Function): any {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    try {
      const result = battleFunction();
      
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      
      this.logger.info('战斗性能指标', {
        battleId,
        duration: endTime - startTime,
        memoryUsed: endMemory - startMemory,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      this.logger.error('战斗性能异常', {
        battleId,
        duration: performance.now() - startTime,
        error: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }
  
  private getMemoryUsage(): number {
    return performance.memory ? performance.memory.usedJSHeapSize : 0;
  }
}
```

### 4.6 用户行为日志
```typescript
// 用户行为分析日志
class UserBehaviorLogger {
  private logger = Logger.create('UserBehavior');
  
  logHeroOperation(userId: string, operation: string, heroId: string, details: any) {
    this.logger.info('用户英雄操作', {
      userId,
      operation, // 'upgrade', 'evolve', 'equip', 'deploy'
      heroId,
      details,
      timestamp: Date.now()
    });
  }
  
  logBattleParticipation(userId: string, battleId: string, result: string, team: Team) {
    this.logger.info('用户战斗参与', {
      userId,
      battleId,
      result, // 'win', 'lose', 'draw'
      teamPower: team.power,
      teamFaction: team.faction,
      duration: Date.now(),
      timestamp: Date.now()
    });
  }
  
  logNFTTransaction(userId: string, transactionType: string, tokenId: string, amount: number) {
    this.logger.info('用户NFT交易', {
      userId,
      transactionType, // 'mint', 'transfer', 'sell', 'buy'
      tokenId,
      amount,
      timestamp: Date.now()
    });
  }
}
```

### 4.7 平衡性分析日志
```typescript
// 游戏平衡性分析日志
class BalanceLogger {
  private logger = Logger.create('GameBalance');
  
  logHeroUsageStatistics(heroId: string, usageData: HeroUsageData) {
    this.logger.info('英雄使用统计', {
      heroId,
      winRate: usageData.winRate,
      pickRate: usageData.pickRate,
      averageDamage: usageData.averageDamage,
      averageHealing: usageData.averageHealing,
      battleCount: usageData.battleCount,
      timestamp: Date.now()
    });
  }
  
  logFactionBalanceMetrics(metrics: FactionBalanceMetrics) {
    this.logger.info('阵营平衡指标', {
      humanWinRate: metrics.humanWinRate,
      angelWinRate: metrics.angelWinRate,
      demonWinRate: metrics.demonWinRate,
      averageBattleDuration: metrics.averageBattleDuration,
      sampleSize: metrics.sampleSize,
      timestamp: Date.now()
    });
  }
}
```

### 4.8 日志级别使用指南

#### SLG游戏日志级别
- **error**: 系统崩溃、战斗无法执行、NFT交易失败
- **warn**: 英雄升级失败、网络超时、资源不足
- **info**: 英雄升级成功、战斗结束、NFT铸造成功
- **debug**: 技能使用详情、伤害计算详情、阵营克制效果

#### 性能监控日志级别
- **error**: 内存泄漏、性能严重下降
- **warn**: 响应时间超过阈值、内存使用过高
- **info**: 关键操作完成时间
- **debug**: 详细性能指标

#### 用户行为日志级别
- **info**: 用户关键操作（战斗、交易、升级）
- **debug**: 详细交互行为（界面点击、浏览）

### 4.9 日志聚合和分析
```typescript
// 日志聚合工具
class SLGLogAggregator {
  aggregateBattleStats(logs: BattleLog[]): BattleStats {
    return {
      totalBattles: logs.length,
      averageDuration: logs.reduce((sum, log) => sum + log.duration, 0) / logs.length,
      factionWinRates: this.calculateFactionWinRates(logs),
      heroUsageStats: this.calculateHeroUsageStats(logs),
      timestamp: Date.now()
    };
  }
  
  generateBalanceReport(timeRange: TimeRange): BalanceReport {
    const logs = this.getLogsInRange(timeRange);
    return {
      heroBalance: this.aggregateHeroStats(logs),
      factionBalance: this.aggregateFactionStats(logs),
      economicBalance: this.aggregateEconomicStats(logs),
      timestamp: Date.now()
    };
  }
}
```