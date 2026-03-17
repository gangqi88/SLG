---
name: 'frontend-workflow-orchestrator'
description: '前端流程编排兼容入口。实际调度统一委托 task-scheduler，规则统一遵循 project-rules。'
---

# 前端工作流编排器（兼容层）

> 本文档保留为兼容入口，避免历史调用失效。当前不再维护独立路由逻辑，统一转发到任务调度器。

## 技能概述

- **职责**: 历史入口兼容、前端流程编排说明
- **适用场景**: 旧任务或旧提示词仍调用 `frontend-workflow-orchestrator` 时
- **边界**: 不维护独立技能矩阵，不重复项目规则

## 统一调度规则

所有任务按如下顺序处理：

1. 读取项目规则：`.trae/rules/project-rules/SKILL.md`
2. 调用统一调度器：`.trae/skills/task-scheduler/SKILL.md`
3. 由调度器再分发到具体技能（架构、开发、测试、工程等）

## 兼容转发映射

| 历史场景       | 新处理方式                                                                      |
| -------------- | ------------------------------------------------------------------------------- |
| 计划与架构阶段 | 转发给 `task-scheduler`，主技能通常为 `architect` 或 `web3-slg-project-manager` |
| 开发实现阶段   | 转发给 `task-scheduler`，主技能通常为 `fullstack-code-standards`                |
| 质量保障阶段   | 转发给 `task-scheduler`，主技能通常为 `game-tester`                             |
| 构建与发布阶段 | 转发给 `task-scheduler`，主技能通常为 `vite-expert` / `eslint-expert`           |

## 维护说明

- 新增流程规则只更新 `task-scheduler/SKILL.md`
- 本文件仅维护“入口兼容”与“转发关系”
- 若未来停用兼容入口，需先全局替换调用点后再归档

---

_技能版本: 3.0.0_  
_最后更新: 2026-03-17_  
_相关文档: task-scheduler/SKILL.md, ../rules/project-rules/SKILL.md_
