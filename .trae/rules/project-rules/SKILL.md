# 项目规则（索引）

> 本文件为规则总入口，正文必须小于 1000 字。详细规则拆分到分片文件，按需读取。

## 读取顺序

1. 先读本文件
2. 按任务类型读取对应分片
3. 冲突时按优先级：本文件 > task-scheduler > 其他技能

## 智能读取路由

- 语言与术语：`R1-language.md`
- 文档结构与格式：`R2-format.md`
- 版本与变更策略：`R3-version.md`
- 职责边界与协作接口：`R4-collaboration.md`
- 审查流程与常见问题：`R5-review.md`

## 全局硬规则

- 技能文档统一中文（简体）
- 技能文档文件名统一 `SKILL.md`
- 不在各技能重复维护全局矩阵与通用流程
- 调度入口统一 `task-scheduler/SKILL.md`
- 兼容入口仅转发：`frontend-workflow-orchestrator/SKILL.md`

## 使用示例

- 需写新技能文档：读 `R2-format.md` + `R3-version.md`
- 需定义技能边界：读 `R4-collaboration.md`
- 需做文档审查：读 `R5-review.md`

---

_文档版本: 2.0.0_
_最后更新: 2026-03-17_
