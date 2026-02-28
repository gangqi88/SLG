---
alwaysApply: false
description: 基于编码标准规范的前置条件，本规范在检测到架构设计相关代码时智能生效，确保统一的架构设计实践。
---
# 架构设计规范

## 1. 消除双轨制
- 明确了"发现重复职责服务即合并"的重构原则，以降低系统熵值。

## 2. 架构原则
- 遵循 NestJS 模块化设计，保持关注点分离；
- 优先复用现有工具服务（如 `RateLimiterMonitorService`, `CircuitBreakerService`）。