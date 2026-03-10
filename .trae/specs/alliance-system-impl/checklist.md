# 联盟系统验收检查清单

## 阶段一：基础设施

- [ ] 类型定义文件 Alliance.ts 包含所有必要接口
- [ ] 配置文件 alliance.ts 包含正确的数值参数
- [ ] TypeScript 编译无错误
- [ ] AllianceManager 单例类正确实现
- [ ] localStorage 持久化正常工作

## 阶段二：核心功能

### 联盟管理

- [ ] createAlliance 方法正确创建联盟并扣除铜币
- [ ] joinAlliance 方法正确处理加入申请
- [ ] leaveAlliance 方法正确处理离开并扣除贡献点
- [ ] upgradeAlliance 方法正确升级联盟等级
- [ ] 联盟等级与成员上限对应正确

### 签到系统

- [ ] checkIn 方法正确增加贡献点
- [ ] 连续签到奖励计算正确
- [ ] 每日签到限制生效

### 聊天系统

- [ ] sendChatMessage 方法正确发送消息
- [ ] getChatHistory 方法正确返回历史消息
- [ ] 消息类型（普通/系统/公告）处理正确

## 阶段三：经济系统

### 商店系统

- [ ] getShopItems 返回正确的物品列表
- [ ] buyShopItem 正确扣除贡献点
- [ ] 每周限购逻辑正确
- [ ] 库存不足时无法购买

### 交易系统

- [ ] createTradeRequest 正确创建交易
- [ ] acceptTradeRequest 正确处理交易
- [ ] cancelTradeRequest 正确取消交易
- [ ] 交易状态转换正确

### 广告系统

- [ ] placeAdBid 正确处理出价
- [ ] getAdInfo 正确返回广告信息
- [ ] 每周结算正确

## 阶段四：高级功能

### 科技系统

- [ ] getTechInfo 返回正确的科技信息
- [ ] upgradeTech 正确升级科技等级
- [ ] 科技属性加成正确计算
- [ ] 满级后无法继续升级

### 联盟战

- [ ] declareWar 正确创建战争
- [ ] 宣战条件验证正确
- [ ] submitWarScore 正确提交战绩
- [ ] 战争结算正确发放奖励

## 阶段五：Web3集成

- [ ] 联盟NFT接口正确
- [ ] 国库合约接口正确
- [ ] 事件监听正常工作

## 阶段六：组件

- [ ] AllianceDashboard 正确显示联盟信息
- [ ] AllianceInfoPanel 正确显示联盟数据
- [ ] AllianceMemberList 正确显示成员列表
- [ ] AllianceCheckIn 签到功能正常
- [ ] AllianceChat 聊天功能正常
- [ ] AllianceShop 商店功能正常
- [ ] AllianceTrade 交易功能正常
- [ ] AllianceTech 科技功能正常
- [ ] AllianceWar 联盟战功能正常
- [ ] AllianceAd 广告功能正常

## 阶段七：测试与验收

- [ ] 单元测试覆盖率 > 60%
- [ ] 核心逻辑集成测试通过
- [ ] 前端响应时间 < 200ms
- [ ] 权限控制测试通过
- [ ] 错误处理测试通过

## 功能验收

- [ ] 创建联盟消耗 10,000 铜币
- [ ] 联盟等级与成员上限对应
- [ ] 签到获得 50 贡献点
- [ ] 商店物品价格正确
- [ ] 科技升级消耗正确
- [ ] 联盟战保证金 50,000 铜币

## 性能验收

- [ ] TypeScript 编译无错误
- [ ] 无内存泄漏
- [ ] 组件渲染性能正常
