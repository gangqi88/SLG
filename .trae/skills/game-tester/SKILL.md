# 游戏测试规范技能

> 本技能定义Web3 SLG游戏项目的测试策略、规范、流程和质量标准。

## 技能概述

- **职责**: 测试工程 - 质量保障、缺陷发现、风险评估
- **适用场景**: Web3 SLG游戏全维度测试
- **技术栈**: React 19 + TypeScript 5.7 + Phaser 3.90 + Web3

## 测试策略

### 测试金字塔

测试策略应当遵循测试金字塔模型：单元测试占比70%，集成测试20%，端到端测试10%。

- **单元测试**：关注单个函数、方法或组件的内部逻辑，执行速度快、稳定性高
- **集成测试**：验证多个模块之间的协作，检查模块间的接口和数据流
- **端到端测试**：从用户视角验证完整的功能流程，执行时间长、维护成本高

### 测试优先级

核心业务逻辑必须拥有完整的测试覆盖，包括：
- 英雄属性计算
- 战斗伤害公式
- 资源产出规则
- Web3交易流程

关键路径测试优先级最高：
- 用户登录流程
- 战斗进行流程
- 资源交易流程
- 英雄培养流程

### 测试环境管理

测试环境应当与生产环境隔离。测试环境应当模拟生产环境的配置。测试数据应当可重置，便于重复执行测试。

测试数据应当具有代表性和可重复性，覆盖正常情况、边界情况和异常情况。

## 单元测试规范

### 测试框架选择

建议使用Vitest作为项目的测试框架。Vitest与Vite原生集成，配置简单，执行速度快。

测试文件命名遵循 `*.test.ts` 或 `*.spec.ts` 约定，与源文件放在一起或放在 `__tests__` 目录中。

### 测试结构规范

每个测试文件应当包含测试套件（describe块），测试套件应当对应被测试的模块。测试用例（it或test块）应当遵循AAA模式：Arrange（准备）、Act（执行）、Assert（断言）。

测试用例的命名应当清晰描述测试场景和预期结果。

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateHeroPower } from '../utils/hero.utils';
import type { Hero } from '../types/hero.types';

describe('calculateHeroPower', () => {
  let mockHero: Hero;

  beforeEach(() => {
    mockHero = {
      id: 'hero_001',
      name: '测试英雄',
      quality: 'orange',
      faction: 'human',
      level: 50,
      starLevel: 3,
      attributes: { command: 80, strength: 70, intelligence: 60, defense: 65 },
      skills: [],
    };
  });

  it('应当根据属性和星级计算正确的战力', () => {
    const power = calculateHeroPower(mockHero, mockHero.starLevel);
    const expectedBase = 80 + 70 + 60 + 65;
    const expectedMultiplier = 1 + (3 - 1) * 0.1;
    expect(power).toBe(Math.floor(expectedBase * expectedMultiplier));
  });

  it('一星英雄应当使用1.0倍率', () => {
    expect(calculateHeroPower(mockHero, 1)).toBe(275);
  });

  it('属性为0时应当返回0', () => {
    mockHero.attributes = { command: 0, strength: 0, intelligence: 0, defense: 0 };
    expect(calculateHeroPower(mockHero, 1)).toBe(0);
  });
});
```

### 边界条件测试

数值边界：最小值、最大值、零值、负数
字符串边界：空字符串、超长字符串、特殊字符
数组边界：空数组、单元素数组

溢出和下溢是数值计算中的常见问题。测试应当覆盖整数溢出、浮点数精度问题。

### Mock与Stub使用

依赖外部系统的测试应当使用Mock或Stub隔离依赖。常用的Mock对象包括：HTTP请求、本地存储、随机数、时间函数、钱包API。

## 集成测试规范

### 模块接口测试

集成测试验证多个模块之间的协作是否正确。模块接口是集成测试的重点，包括模块间的数据传递、函数调用、事件通信等。

组件间的集成测试应当验证数据流是否正确。父组件传递给子组件的props是否正确，子组件触发的事件是否被父组件正确处理。

## 端到端测试

### 测试工具

端到端测试建议使用Playwright或Cypress。Playwright支持多浏览器、多平台，测试执行速度快。

E2E测试应当在接近生产环境的测试环境中运行。测试环境应当配置真实的服务器、数据库和第三方服务。

### 用户场景测试

E2E测试应当覆盖关键的用户场景：用户注册登录、创建角色、新手引导、第一场战斗、第一笔交易、加入联盟等。

```typescript
import { test, expect } from '@playwright/test';

test.describe('英雄系统', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game');
    await page.waitForLoadState('networkidle');
  });

  test('玩家应当能够查看英雄列表', async ({ page }) => {
    await page.click('[data-testid="hero-menu"]');
    await expect(page.locator('[data-testid="hero-list"]')).toBeVisible();
  });

  test('玩家应当能够升级英雄', async ({ page }) => {
    await page.click('[data-testid="hero-menu"]');
    await page.locator('.hero-card').first().click();
    await page.locator('[data-testid="upgrade-button"]').click();
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

## 游戏特定测试

### 战斗系统测试

战斗测试应当覆盖伤害计算、属性加成、技能效果、战斗结算等。

伤害计算测试验证：基础伤害、阵营克制、属性加成、星级加成、技能加成、暴击、伤害减免。

### 资源系统测试

资源测试覆盖：资源产出计算、资源消耗计算、资源存储限制、资源交易换算。

### Web3功能测试

Web3测试关注钱包集成和链上交互。钱包连接测试验证钱包能够正确连接和断开。链上交易测试验证交易能够正确发起和确认。

## 兼容性测试

### 浏览器兼容性

主要测试浏览器：Chrome、Firefox、Safari、Edge、iOS Safari、Android Chrome。

### 设备兼容性

移动设备测试覆盖不同屏幕尺寸、不同分辨率、不同性能水平的设备。响应式设计测试验证游戏在不同屏幕尺寸下的显示效果。

### 钱包兼容性

主要测试钱包：UniSat、Xverse、Leather等Fractal Bitcoin生态钱包。

## 缺陷管理

### 缺陷跟踪

发现的缺陷应当记录在缺陷跟踪系统中。缺陷应当根据严重程度划分优先级：P0（阻断性）、P1（严重）、P2（一般）、P3（轻微）。

缺陷修复后应当进行回归测试。

### 缺陷分析

缺陷数据应当定期统计分析，识别问题的高发领域和根本原因。

## 测试覆盖率

### 覆盖率目标

- 核心业务逻辑：80%以上
- 关键函数：100%
- 整体代码：70%以上

---

*技能版本: 1.0.1*
*最后更新: 2026-03-06*
*相关文档: fullstack-code-standards/SKILL.md, automation-workflow/SKILL.md*
*遵守规范: .trae/rules/project-rules/SKILL.md*
