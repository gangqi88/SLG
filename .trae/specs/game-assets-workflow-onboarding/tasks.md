# 游戏素材接入工作流任务拆解

> **当前归类**: 待实施任务文档  
> **使用边界**: 本任务拆解用于指导素材工作流落地，完成状态以实际代码与文档为准。  
> **现行真源**: `spec.md` 与后续实现提交

## 阶段一：目录与清单基础

- [ ] Task 1: 建立素材目录与清单目录骨架
  - [ ] SubTask 1.1: 在 `public/` 下创建 `game-assets` 分层目录。
  - [ ] SubTask 1.2: 在 `src/shared/config/` 下创建 `assets` 配置目录。
  - [ ] SubTask 1.3: 提供初始清单文件与导出入口。

- [ ] Task 2: 定义素材清单类型与字段约束
  - [ ] SubTask 2.1: 定义通用素材条目类型（key/url/type/feature/optional）。
  - [ ] SubTask 2.2: 按玩法拆分清单并聚合导出。
  - [ ] SubTask 2.3: 迁移已有背景图清单到新结构。

## 阶段二：加载器改造与回退对齐

- [ ] Task 3: 让预加载场景消费统一素材清单
  - [ ] SubTask 3.1: 将 `PreloadScene` 从单一背景图配置改为清单驱动。
  - [ ] SubTask 3.2: 区分必需素材与可选素材加载路径。
  - [ ] SubTask 3.3: 保留并复用现有回退纹理策略。

- [ ] Task 4: 规范素材加载失败反馈
  - [ ] SubTask 4.1: 开发环境输出可读错误信息。
  - [ ] SubTask 4.2: 生产环境降噪并保留关键失败信号。
  - [ ] SubTask 4.3: 确认失败后仍可进入目标场景。

## 阶段三：自动校验与开发流程

- [ ] Task 5: 实现素材校验脚本
  - [ ] SubTask 5.1: 校验清单 key 唯一性。
  - [ ] SubTask 5.2: 校验 URL 文件存在性与扩展名合法性。
  - [ ] SubTask 5.3: 校验 optional 标记与加载策略一致性。

- [ ] Task 6: 接入 npm 工作流脚本
  - [ ] SubTask 6.1: 在 `package.json` 新增 `assets:check`。
  - [ ] SubTask 6.2: 约定本地提交流程中的最小执行顺序。
  - [ ] SubTask 6.3: 明确与 `build`、`test` 的关系。

## 阶段四：文档与验收闭环

- [ ] Task 7: 编写素材工作流文档
  - [ ] SubTask 7.1: 新增 `docs/development/game-assets-workflow.md`。
  - [ ] SubTask 7.2: 给出命名规范、目录规范与接入步骤。
  - [ ] SubTask 7.3: 补充常见失败案例排查。

- [ ] Task 8: 完成验证与回归记录
  - [ ] SubTask 8.1: 验证至少一个场景素材接入链路。
  - [ ] SubTask 8.2: 运行素材校验脚本并记录结果。
  - [ ] SubTask 8.3: 记录已知限制与后续优化建议。

## 任务依赖

- Task 2 依赖 Task 1（先有目录再定清单）。
- Task 3 依赖 Task 2（加载器改造依赖清单模型）。
- Task 5 依赖 Task 2（校验逻辑依赖清单字段定义）。
- Task 6 依赖 Task 5（脚本接入依赖脚本可执行）。
- Task 8 依赖 Task 3/5/7（实现、校验、文档完成后再验收）。
