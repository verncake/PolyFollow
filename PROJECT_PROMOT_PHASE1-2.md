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
│   │   ├── api/routes/       # 路由层 (e.g., polymarket.py, leaderboard.py)
│   │   ├── core/             # 配置与 Redis 连接池 (config.py, redis.py)
│   │   ├── models/           # 数据库 ORM 模型
│   │   ├── schemas/          # Pydantic 验证模型 (schemas.py)
│   │   └── services/         # 核心业务逻辑
│   │       ├── polymarket_client.py  # 封装第三方 API
│   │       ├── account_service.py    # 资产与 P/L 计算
│   │       └── scoring_service.py    # 10维度打分逻辑
│   └── tests/                # 必须包含 pytest 测试用例
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

> **Claude，请仔细阅读以上要求。如果你理解了，请从 Step 1 开始执行，生成 Prisma Schema 并进行数据库初始化。完成后请停止，并询问下一步指示。**
