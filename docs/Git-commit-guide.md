# Git 提交规范指引

## 规范格式

提交信息必须匹配正则：

`^(feat|fix|refactor|docs|style|test|chore)\([a-z0-9-]+\):\s.{1,50}$`

示例：

- `refactor(alliance): 将 ensureMigrated 方法移至测试专用模块`
- `fix(battle): 修复攻城战结算重复写入战报`

## 安装（本地）

在仓库根目录执行：

- `npm run hooks:install`

会安装：

- `.git/hooks/commit-msg`：强制校验提交信息格式，不合规直接阻断提交
- `.git/hooks/pre-commit`：检测 commit-msg hook 是否存在，并给出本次提交建议模板

## 模板生成器（CLI）

- 查看建议模板：
  - `npm run commit:template`

如需非交互模式：

- `node scripts/git/commit-template.mjs --non-interactive`

## 常见错误

- 不符合正则：请按 `type(scope): subject` 重新编辑，subject 最长 50 字符
- scope 不规范：scope 只能包含 `a-z0-9-`

## CI 校验

GitHub Actions 会在 PR / push 时校验提交信息，发现不合规直接失败：

- `.github/workflows/commit-message.yml`

