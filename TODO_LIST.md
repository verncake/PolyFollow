# TODO List - Polymarket Follow-Alpha System

最后更新: 2026-03-25

---

## 项目阶段

- [x] Step 1: 基础设施与数据层搭建 (Backend)
- [x] Step 2: 核心服务层实现 (Backend)
- [x] Step 3: 排行榜引擎与 API 暴露 (Backend)
- [ ] Step 4: 前端界面构建 (Frontend)
- [ ] Step 4.1: Follow-Alpha 协议层与队列基础设施
- [ ] Step 4.2: Monitor 服务实现 (Producer)
- [ ] Step 4.3: Worker 执行器实现 (Consumer)
- [ ] Step 4.4: 10w+ 压力测试与 Go 迁移准备

---

## Step 1: 基础设施 ✅

| 任务 | 状态 | 备注 |
|------|------|------|
| Supabase PostgreSQL 连接 | ✅ | asyncpg + SQLAlchemy 2.0 |
| Upstash Redis 连接 | ✅ | 已验证连接正常 |
| .env 环境变量配置 | ✅ | dotenv 自动加载 |
| .gitignore 配置 | ✅ | Python/IDE/敏感文件 |

---

## Step 2: 核心服务层 ✅

| 任务 | 状态 | 备注 |
|------|------|------|
| Gamma API 客户端 | ✅ | 30个方法, `services/gamma/client.py` |
| Data API 客户端 | ✅ | 12个方法, `services/data/client.py` |
| CLOB HTTP 客户端 | ✅ | 20个方法, `services/clob/client.py` |
| CLOB SDK 封装 | ✅ | 41个方法, `services/clob/sdk_client.py` |
| WebSocket 客户端 | ✅ | `services/websocket/client.py` |
| Auth 认证客户端 | ✅ | Trade/Rewards/Rebates/Bridge/Relayer |
| account_service (P/L计算) | ✅ | 28个测试100%通过 |
| 指数退避重试机制 | ✅ | `services/base.py` |
| Decimal 精度处理 | ✅ | P/L 计算使用 Decimal |
| Blockchain 客户端 | ✅ | Polygon USDC.e 余额查询 |

---

## Step 3: 排行榜引擎与 API 暴露 ✅

| 任务 | 状态 | 备注 |
|------|------|------|
| scoring_service.py (10维度评分) | ✅ | 0-100综合评分 |
| Position Enricher (仓位状态富化) | ✅ | Gamma API 交叉验证 |
| GET /api/v1/account/{address} | ✅ | 含10维度评分 + pending_redeem_count |
| GET /api/v1/account/{address}/positions | ✅ | 支持 status 过滤 (active/closed/pending_redeem) |
| GET /api/v1/account/{address}/closed-positions | ✅ | 已平仓仓位 |
| GET /api/v1/account/{address}/trades | ✅ | 交易历史 |
| GET /api/v1/account/{address}/activity | ✅ | 活动历史 |
| GET /api/v1/account/{address}/stats | ✅ | 含链上 USDC.e 余额 |
| GET /api/v1/leaderboard | ✅ | 排行榜 |
| GET /api/v1/leaderboard/top | ✅ | Top N 交易员 |
| GET /api/v1/leaderboard/trader/{address} | ✅ | 查找特定交易员 |
| 排行榜缓存到 Upstash | ✅ | Top 200, 60s TTL |
| 每日定时任务拉取榜单 | ❌ | 待实现 (APScheduler) |

### Step 3 子任务 (已完成)

- [x] 创建 `backend/app/services/scoring_service.py` (10维度)
  - [x] Profitability (盈利能力) - P/L 对数归一化
  - [x] Win Rate (胜率) - 过滤小额仓位防刷
  - [x] Profit Factor (盈亏比) - 0-5倍映射
  - [x] Risk Mgmt (风险管理) - 盈亏比 + 止损行为
  - [x] Experience (经验) - sqrt(天数*交易数)
  - [x] Pos. Control (仓位控制) - 最大仓位占比
  - [x] Anti-Bot (反Bot) - 睡眠规律 + 整数偏好
  - [x] Focus (专注度) - HHI集中度
  - [x] Close Disc. (平仓纪律) - SELL vs REDEEM
  - [x] Capital (资金体量) - log scale

- [x] 创建 `backend/app/services/position_enricher.py`
  - [x] 交叉引用 Gamma API 获取市场状态
  - [x] 识别 closed/pending_redeem 状态
  - [x] display_status 显示逻辑

- [x] 创建 `backend/app/services/blockchain.py`
  - [x] Polygon USDC.e 余额查询
  - [x] RPC 自动重试机制
  - [x] Decimal 精度处理

- [x] 创建 `backend/app/api/routes/account.py`
  - [x] GET /{address} - 获取地址详情 (含10维度评分)
  - [x] GET /{address}/positions - 获取持仓 (含市场状态)
  - [x] GET /{address}/closed-positions - 已平仓
  - [x] GET /{address}/trades - 交易历史
  - [x] GET /{address}/activity - 活动历史
  - [x] GET /{address}/stats - 快速统计 (含链上余额)
  - [x] GET /{address}/stats - 支持 ?status= 过滤

- [x] 创建 `backend/app/api/routes/leaderboard.py`
  - [x] GET / - 获取排行榜 (含10维度评分)
  - [x] GET /top - Top N 交易员
  - [x] GET /trader/{address} - 查找特定交易员

- [x] 集成 Redis 缓存

---

## Step 4: 前端界面 ✅

| 任务 | 状态 | 备注 |
|------|------|------|
| Next.js 项目初始化 | ✅ | Next.js 14 + TypeScript |
| Shadcn UI 集成 | ✅ | Radix UI 组件库 |
| /leaderboard 页面 | ✅ | React Table + 评分 Badge |
| /profile/[address] 页面 | ✅ | 资金看板 + 10维度雷达图 |
| 对接后端 API | ✅ | React Query |
| Polymarket 深色主题 | ✅ | #0D0D0D 背景 |

### Step 4 子任务

- [x] 安装前端依赖
  - [x] Next.js 14
  - [x] Tailwind CSS
  - [x] Shadcn UI
  - [x] React Query (@tanstack/react-query)
  - [x] React Table (@tanstack/react-table)
- [x] 创建 `app/leaderboard/page.tsx`
  - [x] 数据表格
  - [x] 排序功能
  - [x] 评分 Badge
- [x] 创建 `app/profile/[address]/page.tsx`
  - [x] 资金看板
  - [x] Active Positions 列表
  - [x] Closed Positions 列表
  - [x] Activity 历史
  - [x] 10维度雷达图
- [x] 创建 `lib/supabase.ts` 客户端

---

## API 服务详情

### Gamma API (`services/gamma/client.py`) ✅
- [x] Events: list_events, get_event
- [x] Markets: get_market_by_slug, search_markets, list_markets
- [x] Tags: list_tags, get_markets_by_tag
- [x] Series: get_series, get_series_markets
- [x] Comments: get_comments
- [x] Profiles: get_public_profile, get_builder_leaderboard
- [x] Sports: get_sports, get_sport_categories
- [x] Builders: get_builders, get_builder

### Data API (`services/data/client.py`) ✅
- [x] get_positions - 当前持仓
- [x] get_closed_positions - 已平仓持仓
- [x] get_trades - 交易历史
- [x] get_activity - 活动记录
- [x] get_leaderboard - 排行榜
- [x] get_total_value - 总价值
- [x] get_markets_traded_count - 交易 markets 数
- [x] get_live_volume - 实时交易量
- [x] get_open_interest - 未平仓利息
- [x] get_market_positions - 指定市场持仓
- [x] get_top_holders - 顶级持有者

### CLOB HTTP (`services/clob/client.py`) ✅
- [x] get_order_book, get_spread, get_last_trade_price
- [x] get_midpoint, get_price, get_order_books
- [x] get_currencies, get_asset, get_markets
- [x] get_market, get_markets_xbtc, get_market_graphql

### CLOB SDK (`services/clob/sdk_client.py`) ✅
- [x] 41个 SDK 方法封装

### WebSocket (`services/websocket/client.py`) ✅
- [x] PolymarketWebSocket 主类
- [x] MarketDataStreamer 市场数据流
- [x] WebSocketChannel 频道管理
- [x] Market/User/Sports 频道

### Auth 模块 (`services/auth/`) ✅
- [x] WalletAuthenticator - 钱包签名
- [x] TradeClient - 交易 API (13方法)
- [x] RewardsClient - 奖励 API (7方法)
- [x] RebatesClient - 返佣 API
- [x] BridgeClient - 跨链 API (5方法)
- [x] RelayerClient - Relayer API (8方法)

### Blockchain (`services/blockchain.py`) ✅
- [x] get_usdc_e_balance - Polygon USDC.e 余额
- [x] RPC 自动重试
- [x] Decimal 精度

---

## 测试状态

```
tests/
├── test_account_service.py    ✅ 28 tests passed
├── test_redis.py              ✅ 6 tests passed
├── test_base_client.py        ✅ 9 tests passed
├── test_data_client.py        ✅ 15 tests passed
├── test_gamma_client.py       ✅ 10 tests passed
├── test_scoring_service.py    ✅ 30 tests passed
├── test_wallet.py             ✅ 10 tests passed
├── test_position_enricher.py ✅ 19 tests passed
├── test_blockchain.py         ✅ 9 tests passed

Total: 136 tests passed
```

---

## 数据库表结构

| 表名 | 字段数 | 说明 |
|------|--------|------|
| `users` | 4 | 用户账户 |
| `followed_addresses` | 4 | 关注关系 |
| `leaderboard_addresses` | 12 | 排行榜交易员 |
| `positions` | 18 | 仓位记录 |
| `trades` | 14 | 交易历史 |

---

## 待解决问题

1. **定时任务**: 每日自动拉取榜单 (APScheduler)
2. **前端初始化**: Next.js 项目需要从零搭建
3. **跟单功能**: POST /api/v1/follow/{address}

---

## 优先级排序

### P0 (必须)
1. [x] 10维度评分系统
2. [x] Position Enricher (Gamma API 交叉验证)
3. [x] Blockchain 客户端 (USDC.e 余额)
4. [x] Redis 缓存排行榜

### P1 (重要)
5. [ ] 前端 Next.js 初始化
6. [ ] /leaderboard 页面
7. [ ] /address/[slug] 页面

### P2 (重要 - 10w+ 支持)
8. [ ] Follow-Alpha 协议层 (TradeTask)
9. [ ] Monitor-Worker 架构
10. [ ] Go Worker 迁移路径

---

## Phase 4: Follow-Alpha 跟单引擎 (10w+ 用户)

### Step 4.1: 协议层与队列基础设施

| 任务 | 状态 | 备注 |
|------|------|------|
| TradeTask Pydantic 模型 | ❌ | `schemas/task.py`，JSON 序列化 |
| Redis 队列封装 | ❌ | `core/redis_queue.py`，push/pop/ack |
| TASK_CACHE 防重机制 | ❌ | 基于 task_id 的 Redis Hash |
| 单元测试 | ❌ | pytest 测试队列操作 |

### Step 4.2: Monitor 服务 (Producer)

| 任务 | 状态 | 备注 |
|------|------|------|
| Polymarket 交易流监听 | ❌ | WebSocket 或轮询 |
| FollowConfig 匹配逻辑 | ❌ | 用户跟单比例/最高限额 |
| TradeTask 构造与推送 | ❌ | 推入 ORDER_QUEUE |

### Step 4.3: Worker 执行器 (Consumer)

| 任务 | 状态 | 备注 |
|------|------|------|
| python_worker.py 入口 | ❌ | `python -m app.workers.python_worker` |
| asyncio.Semaphore 并发控制 | ❌ | 避免 API 限流 |
| Position 表更新 | ❌ | 成功下单后 |
| ErrorLog 错误记录 | ❌ | 失败时记录 |

### Step 4.4: 10w+ 扩展

| 任务 | 状态 | 备注 |
|------|------|------|
| Locust 压力测试 | ❌ | 模拟 10w 用户场景 |
| Redis Pipeline 优化 | ❌ | 批量读写 |
| Go Worker 原型 | ❌ | 接口兼容 Python Worker |

---

### 架构约束 (Claude 必须遵守)

1. **Monitor ↔ Worker 物理分离**: Monitor 禁止直接调用 Worker 函数，必须通过 Redis 队列
2. **禁止同步 I/O**: 严禁 `requests` / `time.sleep`，统一 `httpx` / `asyncio.sleep`
3. **幂等第一**: 处理 task_id 前必须检查 Redis 或数据库
4. **JSON Only**: 队列消息禁止 Pickle，支持跨语言
