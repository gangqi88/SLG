# 任务调度器技能

> 本技能是项目唯一调度入口，负责“任务识别、技能路由、协作编排”。规则解释权以项目规则文档为准。

## 技能概述

- **职责**: 统一调度与任务分发
- **适用场景**: 需要调用一个或多个技能协作完成任务
- **边界**: 不直接承担业务实现，只做分发与编排

## 单一事实源

- 规则基线：`.trae/rules/project-rules/SKILL.md`
- 调度实现：本文件
- 兼容入口：`frontend-workflow-orchestrator/SKILL.md`

当本文件与其他技能文档存在冲突时，按以下优先级处理：

1. 项目规则文档
2. 本调度文档
3. 具体技能文档

## 统一路由矩阵

| 任务类型       | 主技能                     | 协作技能（按需）                    |
| -------------- | -------------------------- | ----------------------------------- |
| 项目规划与排期 | `web3-slg-project-manager` | `architect`                         |
| 架构与技术方案 | `architect`                | `fullstack-code-standards`          |
| 业务开发与重构 | `fullstack-code-standards` | `react-expert`, `typescript-expert` |
| Web3与链上集成 | `web3-developer`           | `fullstack-code-standards`          |
| 代码质量与测试 | `game-tester`              | `cypress-expert`, `eslint-expert`   |
| 文档与规范治理 | `document-reviewer`        | `task-scheduler`                    |
| 美术资源流程   | `art-resources`            | `web3-slg-project-manager`          |
| 构建与工程配置 | `vite-expert`              | `eslint-expert`, `prettier-expert`  |

## 路由流程

### 1) 任务识别

- 从任务描述中提取目标（功能 / 架构 / 测试 / 文档 / 工程）
- 判断是单技能任务还是复合任务
- 生成主技能 + 协作技能列表
- 按 `R6-change-safety.md` 评估风险级别（低 / 中 / 高）

### 2) 分发策略

- **单技能任务**：直接分发到主技能
- **复合任务**：按“主技能先行，协作技能跟进”执行
- **冲突任务**：先交 `document-reviewer` 做规则一致性审查，再继续执行
- **中高风险任务**：必须附带灰度方案、观测指标、回滚或前向恢复说明

### 3) 协作模式

- **串行**：有前后依赖时使用（如开发 → 测试）
- **并行**：无依赖时使用（如多页面样式修复）
- **回环**：审查不通过时回主技能整改，再次审查

## 输入输出协议

```typescript
interface DispatchInput {
  goal: string;
  scope: 'single' | 'composite';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  riskLevel: 'low' | 'medium' | 'high';
}

interface DispatchOutput {
  ownerSkill: string;
  supportSkills: string[];
  mode: 'serial' | 'parallel' | 'loop';
  releaseGuard: string[];
  handoff: string;
}
```

## 发布门禁

- 低风险：要求基础验证与最小化改动说明
- 中风险：要求特性开关、灰度路径、回滚方案
- 高风险：要求设计评审、契约测试、灰度放量、回滚或前向恢复演练

## 维护规则

- 不在本文件重复书写编码规范、测试规范、版本流程细节
- 具体规范统一引用项目规则文档
- 新增技能时仅扩展“统一路由矩阵”，不复制其他技能正文

---

_技能版本：2.1.0_  
_最后更新：2026-03-17_  
_相关文档：project-rules/SKILL.md, project-rules/R6-change-safety.md, frontend-workflow-orchestrator/SKILL.md_
