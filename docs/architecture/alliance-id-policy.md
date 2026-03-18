# 联盟 ID 与 NPC 配置规范

## 目标

- 统一联盟 ID 的来源与表达，避免混用占位字符串与真实联盟 ID
- 统一管理 NPC 联盟配置（名称/颜色/旗帜），消除散落的硬编码字符串
- 提供可验证的静态检查与单测，防止回归

## 规则

### 1. 联盟归属字段

- `ownerAllianceId === null` 时，`ownerAllianceName` 必须为 `null`
- `ownerAllianceId` 非空但 `ownerAllianceName` 为空时，运行时会补齐为“未知联盟”

### 2. NPC 联盟字典

- NPC 联盟配置集中定义在 `src/features/alliance/config/npcAlliances.ts`
- 访问 NPC 联盟信息必须通过导出的访问函数（例如 `getNpcAllianceOrNull`），禁止在业务代码里直接写 NPC 联盟 ID/名称字符串

### 3. Legacy ID

- 历史占位 ID（例如 `a_self/a_enemy`）不允许出现在生产运行时代码
- 若需要在测试阶段覆盖历史数据迁移场景，使用 `src/features/alliance/tests/legacyAllianceIds.ts` 的测试专用常量

## 验证

- 单元测试：
  - `npcAlliances.test.ts`：覆盖字典访问接口
  - `allianceStringPolicy.test.ts`：静态扫描，确保运行时代码不存在 legacy/NPC 字面量

