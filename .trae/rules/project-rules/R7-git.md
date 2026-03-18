# R7 Git 提交规范与自动提交

## 目标

- 每次工程化代码修改都必须生成符合规范的 commit message
- 完成一个任务后自动提交，避免“改了但没记录”

## 规则

### 1) 提交信息格式

必须匹配正则：

`^(feat|fix|refactor|docs|style|test|chore)\([a-z0-9-]+\):\s.{1,50}$`

### 2) 自动提交触发条件

- 当且仅当本次任务产生了可提交的代码/文档变更（工作区有 diff）时触发自动提交
- 若无变更，跳过提交
- 自动提交前必须完成必要验证（按任务风险级别：至少单测/构建之一）

### 3) 自动提交步骤（统一入口）

1. 确保 hooks 已安装：`npm run hooks:install`
2. 暂存全部变更：`git add -A`
3. 生成提交信息（默认非交互）：`node scripts/git/commit-template.mjs --non-interactive`
4. 执行提交：`git commit -m "<generated-message>"`

若提交被 `commit-msg` 拒绝，必须重新生成/修正消息后再提交。

### 4) 禁止旁路

- 禁止绕过模板生成器/校验脚本直接写不合规 message
- CI 必须校验提交范围内的所有 commit message 合规，否则 PR 失败

---

_分片版本: 1.0.0_
