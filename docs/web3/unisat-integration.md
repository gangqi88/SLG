# UniSat Web3 接入说明

本文档描述当前前端主工程中**已经落地**的 UniSat 钱包接入方式，面向前端开发者与文档维护者。

## 现行实现范围

以当前代码为准，Web3 相关能力主要分布在：

- `src/shared/components/WalletConnect.tsx`
- `src/shared/utils/web3.ts`
- `src/components/Layout.tsx`

当前实现是一个**轻量级前端钱包接入**，并非完整的链上业务层。

## 当前已落地能力

### 钱包检测

- 通过 `Web3Manager.isUniSatInstalled()` 检测 `window.unisat` 是否存在

### 钱包连接

- 通过 `window.unisat.requestAccounts()` 请求账户
- 通过 `window.unisat.getPublicKey()` 读取公钥
- 返回 `{ address, publicKey }`

### 消息签名

- 通过 `window.unisat.signMessage(message)` 执行签名
- 当前界面包含一个简单签名测试入口

## 当前界面入口

- 钱包连接组件位于 `src/shared/components/WalletConnect.tsx`
- 当前应用级入口挂载在 `src/components/Layout.tsx`

这说明钱包连接目前属于全局布局层能力，而不是某个独立页面专属能力。

## 使用前提

1. 在桌面浏览器中运行主应用
2. 浏览器已安装 UniSat 扩展
3. UniSat 可正常响应 `requestAccounts`、`getPublicKey`、`signMessage`

若未安装 UniSat，当前实现会提示用户安装钱包，而不是回退到其他钱包方案。

## 当前未落地的能力

以下内容**不要**写成现行能力：

- wagmi / RainbowKit / WalletConnect 方案
- 多钱包并行接入
- 完整的 UniSat API 服务层
- BRC-20 余额查询、铭刻、链上索引等复杂能力
- 基于环境变量驱动的完整 Fractal Bitcoin 运行时配置

这些内容目前更多存在于规划文档或专题方案中，而不是主前端现行实现。

## 关于 `.env.example`

仓库根目录存在 `.env.example`，其中包含：

- `VITE_UNISAT_API_KEY`
- `VITE_FB_NETWORK`
- `VITE_UNISAT_API_BASE`
- `VITE_GAME_PROTOCOL`

但根据当前代码核对结果，这些变量**尚未形成主前端运行时的明确依赖链**。因此目前更适合将其视为：

- 预留配置
- 规划方案遗留入口
- 后续扩展 UniSat API / Fractal Bitcoin 能力时的候选变量

在对应能力真正接入 `src/` 运行时代码之前，不应将其描述为“启动项目必须配置”。

## 与历史规划文档的关系

以下文档包含专题方案或历史规划：

- `.trae/documents/WEB3_INTEGRATION_PLAN.md`
- `.trae/documents/WEB3_FB_INTEGRATION_PLAN.md`
- `.trae/documents/Web3游戏项目-SLG.md`

这些文档可以作为后续设计参考，但**不能直接视为当前标准实现**。若其内容与代码冲突，应以代码与 `docs/` 为准。

## 后续补文档的触发条件

当以下能力真正落地时，建议继续扩展本文件或拆专题文档：

- 新增 UniSat API 请求封装
- 增加 Fractal Bitcoin 网络切换
- 增加链上存档 / 铭刻 / 余额读取
- 引入新的钱包抽象层或多钱包支持

## 需确认事项

- 当前是否计划继续沿用 UniSat-only 路线，还是未来恢复多钱包方案
- `.env.example` 中的变量是否应保留在根目录，还是迁移为专题能力落地后再启用