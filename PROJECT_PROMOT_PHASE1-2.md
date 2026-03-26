# 🚀 Polymarket Follow-Alpha 核心系统开发指导文档 (Phase 1 & 2 融合版)

> **To Claude Code:** > 你现在的角色是本项目的首席全栈工程师。你需要严格遵循本指导文档中的架构选型、目录规范和开发流程，逐步实现 Polymarket 跟单系统的核心数据引擎（详情页）与排行榜（Leaderboard）功能。每完成一个 Step，请运行测试并等待人类开发者的确认，再进入下一个 Step。

## 一、 框架设计理念与技术选型

本项目旨在构建一个高并发、低延迟的 Web3 自动化跟单与数据分析平台。

- **设计理念:** 前后端分离，API First；后端重计算与异步并发，前端重交互与实时数据展示；数据库采用宽表与高频缓存结合。
- **前端框架:** Next.js 14 (App Router) + Tailwind CSS + Shadcn UI + React Query。
- **后端框架:** Python 3.10+ + FastAPI (全异步生态)。
- **持久化存储:** Supabase (PostgreSQL)，使用 `Prisma` (前端/Node端) / `SQLAlchemy` 或直接 HTTP API (Python 端) 进行交互。
- **高频缓存与队列:** Upstash (Serverless Redis)。

## 二、 第三方服务依赖与环境变量配置

在项目根目录的 `.env` 文件中，你需要读取和配置以下关键变量（人类开发者已提供）：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxx"
SUPABASE_SERVICE_ROLE_KEY="xxx"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# Polymarket API
POLYMARKET_CLOB_API_URL="https://clob.polymarket.com"
POLYMARKET_GAMMA_API_URL="https://gamma-api.polymarket.com"
```

## 三、 业务逻辑与核心功能要求

本次冲刺需要完成两大核心业务闭环：

**1. 地址画像与资产透视 (Address Snapshot)**

- **功能:** 输入任意 Polymarket 钱包地址，抓取其在 Polymarket 上的所有 Open Positions（当前持仓）、Activity History（交易历史）和 USDC.e 余额。
- **计算逻辑:** 必须在后端实时计算该地址的 **Unrealized P/L**（未实现盈亏，公式：`(现价 - 均价) * 份额`）和 **Realized P/L**（已实现盈亏）。

**2. 大神排行榜与评分引擎 (Leaderboard & Scoring)**

- **功能:** 每日定时拉取 Polymarket 官方榜单的前 1500 名地址。
- **打分系统:** 根据地址的胜率 (Win Rate)、盈亏比 (Profit Factor)、交易频次 (Experience) 等维度计算一个 0-100 的综合 Score。
- **展示:** 缓存排名前 200 的地址到 Upstash Redis 中，供前端页面秒级加载。

## 四、 目录结构规范

请严格按照以下结构创建和组织文件：

```text
/
├── backend/                  # FastAPI 后端项目
│   ├── app/
│   │   ├── api/routes/       # 路由层 (account.py, leaderboard.py)
│   │   ├── core/             # 配置与 Redis 连接池 (config.py, redis.py)
│   │   ├── models/           # 数据库 ORM 模型 (Prisma schema 定义)
│   │   ├── schemas/          # Pydantic 验证模型 (task.py - Follow-Alpha 专用)
│   │   ├── services/         # 核心业务逻辑
│   │   │   ├── gamma/        # Gamma API 客户端 (30+ 方法)
│   │   │   ├── data/         # Data API 客户端 (12+ 方法)
│   │   │   ├── clob/         # CLOB API 客户端 (HTTP + SDK)
│   │   │   ├── websocket/    # WebSocket 客户端
│   │   │   ├── auth/         # 认证客户端 (Trade/Rewards/Rebates)
│   │   │   ├── account_service.py    # 资产与 P/L 计算
│   │   │   ├── scoring_service.py    # 10维度打分逻辑
│   │   │   ├── position_enricher.py  # 仓位状态富化
│   │   │   ├── blockchain.py         # Polygon USDC.e 余额
│   │   │   └── monitor.py           # 信号监听 (Phase 4 - Producer)
│   │   └── workers/
│   │       └── python_worker.py     # 异步执行器 (Phase 4 - Consumer)
│   └── tests/                # pytest 测试用例 (136 tests)
│
└── frontend/                 # Next.js 前端项目
    ├── app/
    │   ├── leaderboard/page.tsx      # 排行榜页面
    │   └── address/[slug]/page.tsx   # 地址详情页面
    ├── components/
    │   ├── leaderboard/      # 数据表格与评分 Badge
    │   └── profile/          # 资产卡片、仓位列表、盈亏图表
    ├── lib/
    │   ├── supabase.ts       # Supabase 客户端初始化
    │   └── utils.ts
    └── prisma/               # Prisma Schema 定义
        └── schema.prisma
```

## 五、 编码规范与代码逻辑铁律

1. **全异步 I/O:** 后端所有网络请求必须使用 `httpx` (async)，所有数据库和 Redis 操作必须使用异步 Client。严禁使用阻塞主线程的同步库（如 `requests`）。
2. **容错与限流:** Polymarket API 有严格的 Rate Limit。在 `polymarket_client.py` 中必须实现 Retry 机制（指数退避算法）和错误捕获。如果第三方 API 挂了，接口要返回优雅的报错（503），而不是直接 Crash。
3. **数据一致性:** 涉及到金额、均价、盈亏的字段，数据库与 Pydantic 模型中统一使用 `Decimal` 类型，保留 6 位小数，绝对禁止使用 `Float` 计算资金。
4. **缓存优先 (Cache-Aside):** 对于排行榜数据，先查 Redis (`Upstash`)，若无数据再查 Supabase，并回写 Redis。

## 六、 渐进式开发流程 (Action Plan)

**Step 1: 基础设施与数据层搭建 (Backend)**

- 任务：初始化 `schema.prisma`（包含 User, LeaderboardAddress, Position表），并推送到 Supabase。
- 任务：在后端建立 Upstash Redis 的连接单例，并写一个简单的 Ping 测试。
- **完成标志:** 数据库表结构创建成功，Redis 可读写。等待人工验收。

**Step 2: 核心服务层实现 (Backend)**

- 任务：编写 `polymarket_client.py`，实现获取某个地址的 Positions 和 Trades 接口。
- 任务：编写 `account_service.py`，实现 P/L 的核心数学计算逻辑。
- 任务：编写对应的 Pytest 单元测试，Mock 掉网络请求，专测数学公式的准确性。
- **完成标志:** 测试用例 100% Pass。

**Step 3: 排行榜引擎与 API 暴露 (Backend)**

- 任务：编写 `scoring_service.py`，实现基础的综合评分逻辑（可先用简单加权平均算法）。
- 任务：暴露 FastAPI 接口：`GET /api/v1/account/{address}` 和 `GET /api/v1/leaderboard`。
- **完成标志:** Swagger UI (/docs) 可正常调用并返回 JSON。

**Step 4: 前端界面构建 (Frontend)**

- 任务：在 Next.js 中集成 Shadcn UI。
- 任务：实现 `/leaderboard` 页面，包含一个带排序功能的数据表格（使用 `tanstack/react-table`）。
- 任务：实现 `/address/[slug]` 页面，顶部展示资金看板，下方使用 Tabs 切换展示 Active/Closed 仓位列表。
- **完成标志:** 页面渲染成功，对接后端 API 并在本地成功展示数据。

---

## 七、Phase 4: Follow-Alpha 跟单引擎架构 (10w+ 用户支持)

> 本节专为支持 **10w+ 用户并发跟单** 场景设计，强调 **Monitor-Worker 物理分离** 与 **渐进式 Go 迁移路径**。

### 架构设计原则

系统通过 **Upstash Redis** 作为消息总线，分为两个 **独立运行的进程**：

1. **Monitor 进程 (Producer):** 监听交易信号、匹配用户配置、计算下单金额，将任务推入 Redis 队列。
2. **Worker 进程 (Consumer):** 从队列取任务、调用 API 下单、管理 Nonce 和幂等性。

```
┌─────────────────────────────────────────────────────────────────┐
│                      Upstash Redis                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │ ORDER_QUEUE │    │ TASK_CACHE  │    │ FOLLOWER_CONFIG     │ │
│  │ (List)      │    │ (Hash)      │    │ (Hash)              │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         ▲                    ▲                     ▲
         │                    │                     │
    Monitor 进程          Worker 进程          API Server
   (Producer)            (Consumer)          (读配置/查状态)

```

### 目录结构扩展

```text
backend/app/
├── services/
│   ├── monitor.py           # 信号监听与任务分发 (Producer)
│   └── ...
├── workers/
│   └── python_worker.py     # 异步执行器 (Consumer)
├── schemas/
│   └── task.py             # TradeTask 协议定义
└── core/
    └── redis_queue.py      # 队列操作封装
```

### TradeTask 协议 (必须实现)

位于 `backend/app/schemas/task.py`：

```python
from pydantic import BaseModel, Field
from typing import Optional
import uuid

class TradeTask(BaseModel):
    """跟单任务协议 - JSON 序列化，支持跨语言 (Python/Go)"""
    task_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str                           # 跟单用户 ID
    target_address: str                    # 被跟单的 "大神" 地址
    market_id: str                         # 市场 ID (condition_id)
    outcome: str = Field(pattern="^(Yes|No)$")  # Yes 或 No
    amount_usdc: str                      # 下单金额 (Decimal string)
    price_limit: Optional[str] = None      # 限价，None = 市价
    created_at: str                        # ISO8601 时间戳

    class Config:
        json_schema_extra = {
            "example": {
                "task_id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "user_123",
                "target_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f",
                "market_id": "abc123_condition_id",
                "outcome": "Yes",
                "amount_usdc": "10.5",
                "price_limit": None,
                "created_at": "2026-03-26T10:00:00Z"
            }
        }
```

### 编码铁律 (Follow-Alpha 专用)

1. **禁止耦合:** Monitor 绝对不能直接调用 Worker 的函数。必须通过 Redis 队列中转。
2. **禁止同步:** 严禁在 Workers 或 Services 中使用 `requests` 或 `time.sleep`。统一使用 `httpx` 和 `asyncio.sleep`。
3. **幂等第一:** 执行器在处理 `task_id` 前，必须检查 Redis `TASK_CACHE` (Hash) 或数据库，确保该任务未被执行过。
4. **JSON Only:** 队列消息必须使用标准 JSON。禁止使用 Pickle（未来 Go Worker 无法解析）。
5. **Concurrency Control:** Worker 使用 `asyncio.Semaphore` 控制并发数，避免 Polymarket API 限流。

### 渐进式开发路线图 (Phase 4)

**Step 4.1: 协议层与队列基础设施**

- 任务：定义 `TradeTask` Pydantic 模型 (`schemas/task.py`)
- 任务：实现 `core/redis_queue.py`（`push_task`, `pop_task`, `get_task`, `ack_task`）
- 任务：实现基于 `task_id` 的 Redis 缓存防重
- **完成标志:** 可独立运行 `pytest tests/test_redis_queue.py`

**Step 4.2: Monitor 服务实现**

- 任务：实现 `services/monitor.py`（轮询 Polymarket 交易流或订阅 WebSocket）
- 任务：实现 FollowConfig 匹配逻辑（用户设置的跟单比例/最高限额）
- 任务：构造 `TradeTask` 并推入 Redis `ORDER_QUEUE`
- **完成标志:** Mock 一个 "大神" 交易信号，验证队列中正确生成多个用户的 Task

**Step 4.3: Worker 执行器实现**

- 任务：实现 `workers/python_worker.py`（独立入口，`python -m app.workers.python_worker` 启动）
- 任务：使用 `asyncio.Semaphore` 控制并发数
- 任务：成功下单后更新 Position 表，失败则记录 ErrorLog
- **完成标志:** 模拟 100 个并发 Task 涌入，验证执行器不漏单、不重单

**Step 4.4: 10w+ 压力测试与 Go 迁移准备**

- 任务：使用 Locust 或 asyncio 并发模拟 10w 用户场景
- 任务：优化 Redis 队列操作（Pipeline 批量读写）
- 任务：准备 Go Worker 原型（保持 Python Worker 接口兼容）
- **完成标志:** 1000 用户 / 10s 场景下，P99 延迟 < 500ms

---

### 10w+ 用户扩展指南

| 维度 | 当前设计 (Python) | 扩展目标 (Go) |
|------|------------------|---------------|
| 单机并发 | ~1000 并发连接 | ~10000 并发连接 |
| 队列消费 | asyncio.Semaphore | Go Goroutine Pool |
| Nonce 管理 | 单机内存 + Redis | 分布式锁 (Redlock) |
| 存储 | Upstash Redis | Kafka + Redis Hybrid |

> **提示:** 当并发量超过 1w 用户时，建议将 Worker 迁移至 Go 语言实现。Python Worker 保持接口兼容，作为过渡方案。

---

> **Claude，请仔细阅读以上要求。如果你理解了，请从 Step 4.1 开始执行，完成 Follow-Alpha 引擎的协议层与队列基础设施。完成后请停止，并询问下一步指示。**
