# 快速开始

## 环境要求

- Node.js：建议使用当前 LTS 版本
- npm：建议使用与当前 Node.js 匹配的版本

> 说明：仓库当前未提供固定版本文件，若团队需要统一版本，建议后续补充 `.nvmrc` 或在根文档中固定版本。

## 安装依赖

```bash
npm install
```

## 启动开发环境

```bash
npm run dev
```

- 默认地址：`http://localhost:8080`
- 开发服务器由 Vite 提供

## 构建产物

```bash
npm run build
```

- 产物输出目录：`dist/`

## 运行测试

### 单元测试

```bash
npx vitest run
```

> `npm run test` 会进入 Vitest watch 模式；若只想执行一次测试，优先使用 `npx vitest run`。

### E2E 测试

```bash
npm run test:e2e
```

该命令会先启动开发服务器，再运行 Cypress。

### TypeScript 类型检查

```bash
npx tsc --noEmit
```

### ESLint

```bash
npm run lint
```

### Stylelint

```bash
npm run lint:style
```

## Web3 调试说明

- 当前钱包能力以 UniSat 为主
- 若未安装或未注入 `window.unisat`，相关钱包连接功能不可用
- 当前项目更适合在桌面浏览器中调试

## 进一步阅读

- [架构概览](architecture/overview.md)
- [编码规范](development/coding-standards.md)
- [测试说明](development/testing.md)
- [质量门说明](development/quality-gates.md)