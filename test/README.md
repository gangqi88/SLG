# SLG 智能合约测试套件

> 本测试套件验证联盟系统与主城建筑的智能合约逻辑

## 测试覆盖范围

### AllianceNFT 合约测试
- ✅ 创建联盟
- ✅ 加入/离开联盟
- ✅ 贡献系统
- ✅ 国库存取款
- ✅ 联盟升级
- ✅ 事件触发验证

### BuildingNFT 合约测试
- ✅ 铸造建筑NFT
- ✅ 建筑升级
- ✅ 建筑转移
- ✅ 属性加成计算
- ✅ 权限控制
- ✅ Gas使用优化

## 快速开始

### 1. 安装依赖
```bash
cd test
npm install
```

### 2. 运行本地测试
```bash
npm test
```

### 3. 启动本地节点并测试
```bash
# 终端1: 启动节点
npm run node

# 终端2: 运行测试
npm run test:local
```

### 4. Goerli测试网测试
```bash
# 配置环境变量
cp .env.example .env
# 编辑 .env 添加 GOERLI_RPC_URL 和 PRIVATE_KEY

npm run test:goerli
```

## 测试覆盖率目标

| 合约 | 目标覆盖率 |
|------|-----------|
| AllianceNFT | ≥ 90% |
| BuildingNFT | ≥ 90% |

## 运行覆盖率报告
```bash
npm run coverage
```

## Gas报告
```bash
REPORT_GAS=true npm test
```

## 合约部署

### 部署到本地
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 部署到Goerli
```bash
npx hardhat run scripts/deploy.js --network goerli
```

## 智能合约地址（Goerli）

部署完成后更新 `.env` 文件：
```
ALLIANCE_NFT_ADDRESS=0x...
BUILDING_NFT_ADDRESS=0x...
```

## 测试用例数量

| 合约 | 测试用例 |
|------|----------|
| AllianceNFT | 14 |
| BuildingNFT | 14 |
| **总计** | **28** |

## 预期结果

```
  AllianceNFT
    创建联盟
      ✓ 应该成功创建联盟
      ✓ 不应该创建空名称的联盟
      ✓ 应该正确设置成员
    加入联盟
      ✓ 应该成功加入联盟
      ✓ 不应该加入不存在的联盟
      ✓ 不应该重复加入联盟
      ✓ 不应该加入满员联盟
    离开联盟
      ✓ 应该成功离开联盟
      ✓ 不应该离开不在联盟中的地址
    贡献系统
      ✓ 应该成功存款到贡献池
      ✓ 不应该存款0
    国库系统
      ✓ 应该成功存款到国库
      ✓ 应该成功从国库取款
      ✓ 非盟主不应该取款
    升级系统
      ✓ 应该成功升级联盟
      ✓ 不应该超过最大等级
    事件测试
      ✓ 应该触发AllianceCreated事件
      ✓ 应该触发MemberJoined事件

  BuildingNFT
    铸造建筑
      ✓ 应该成功铸造城堡
      ✓ 应该成功铸造多个建筑
      ✓ 应该正确计算资源建筑产量加成
      ✓ 应该正确计算防御建筑防御加成
    升级建筑
      ✓ 应该成功升级建筑
      ✓ 不应该升级到最大等级
      ✓ 非拥有者不应该升级
      ✓ 升级后应该更新属性加成
    建筑转移
      ✓ 应该成功转移建筑
      ✓ 应该更新拥有者建筑列表
      ✓ 不应该非法转移
    查询功能
      ✓ 应该正确获取用户建筑数量
      ✓ 应该正确获取建筑详情
    事件测试
      ✓ 应该触发BuildingMinted事件
      ✓ 应该触发BuildingUpgraded事件
      ✓ 应该触发BuildingTransferred事件
    权限控制
      ✓ 仅MINTER_ROLE可以铸造
      ✓ 管理员应该可以授予MINTER_ROLE
    Gas使用测试
      ✓ 铸造应该使用合理的Gas
      ✓ 升级应该使用合理的Gas

  28 passing
```
