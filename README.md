# Polymarket Follow-Alpha System

跟单系统 - 追踪 Polymarket 交易员的持仓和业绩表现。

## 项目概述

本项目旨在构建一个高并发、低延迟的 Web3 自动化跟单与数据分析平台。

### 核心功能

- **地址画像与资产透视**: 输入任意 Polymarket 钱包地址，查看 Open Positions、Activity History、USDC 余额
- **P/L 计算**: 实时计算 Unrealized P/L 和 Realized P/L
- **大神排行榜**: 每日定时拉取官方榜单，计算综合评分 (0-100)
- **跟单功能**: 用户可关注特定交易员，自动同步其仓位

## 技术栈

### 后端

| 技术 | 说明 |
|------|------|
| **Python 3.14** | 主语言 |
| **FastAPI** | Web 框架 (全异步生态) |
| **httpx** | 异步 HTTP 客户端 |
| **py-clob-client** | Polymarket CLOB SDK |
| **eth-account** | 钱包签名认证 |
| **Web3.py** | 区块链查询 (Polygon USDC.e) |
| **SQLAlchemy 2.0** | 异步 ORM |
| **asyncpg** | PostgreSQL 异步驱动 |

### 前端

| 技术 | 说明 |
|------|------|
| **Next.js 14** | App Router |
| **Tailwind CSS** | 样式 |
| **Shadcn UI** | 组件库 |
| **React Query** | 数据获取 |
| **Prisma** | ORM |

### 数据层

| 技术 | 说明 |
|------|------|
| **Supabase** | PostgreSQL 数据库 |
| **Upstash Redis** | Serverless Redis 缓存 |

## 项目结构

```
PolymarketFollow/
├── README.md                    # 项目文档
├── TODO_LIST.md                 # 开发进度跟踪
├── CLAUDE.md                    # Claude Code 指导
│
├── backend/                     # FastAPI 后端
│   ├── app/
│   │   ├── main.py             # FastAPI 入口
│   │   ├── api/
│   │   │   └── routes/         # API 路由
│   │   │       ├── account.py  # 账户 API
│   │   │       └── leaderboard.py # 排行榜 API
│   │   ├── core/
│   │   │   ├── config.py      # 配置管理 (dotenv)
│   │   │   └── redis.py        # Redis 连接
│   │   ├── schemas/
│   │   │   └── schemas.py      # Pydantic 验证模型
│   │   └── services/
│   │       ├── base.py          # 基础 HTTP 客户端
│   │       ├── account_service.py  # P/L 计算服务
│   │       ├── scoring_service.py   # 10维度评分
│   │       ├── position_enricher.py # 仓位状态富化
│   │       ├── blockchain.py     # 链上余额查询
│   │       ├── gamma/           # Gamma API 客户端
│   │       ├── data/            # Data API 客户端
│   │       ├── clob/            # CLOB API 客户端
│   │       ├── websocket/       # WebSocket 客户端
│   │       └── auth/            # 认证客户端
│   ├── tests/                  # pytest 测试 (136 tests)
│   ├── .env                    # 环境变量
│   ├── .gitignore              # Git 忽略配置
│   └── requirements.txt        # Python 依赖
│
└── frontend/                   # Next.js 前端 (TODO)
    ├── app/
    │   ├── leaderboard/        # 排行榜页面
    │   └── address/[slug]/     # 地址详情页面
    ├── components/             # UI 组件
    ├── lib/                    # 工具函数
    └── prisma/
        └── schema.prisma       # Prisma 数据模型
```

## API 架构

### 已实现的 API 服务

| 模块 | 文件 | 方法数 | 说明 |
|------|------|--------|------|
| **Gamma API** | `services/gamma/client.py` | 30 | Markets, Events, Tags, Profiles |
| **Data API** | `services/data/client.py` | 12 | Positions, Trades, Activity, Leaderboard |
| **CLOB HTTP** | `services/clob/client.py` | 20 | Order Book, Prices, Spreads |
| **CLOB SDK** | `services/clob/sdk_client.py` | 41 | 完整交易支持 |
| **WebSocket** | `services/websocket/client.py` | - | Market, User, Sports 频道 |
| **Auth** | `services/auth/*.py` | 38+ | Trade, Rewards, Rebates, Bridge |
| **Blockchain** | `services/blockchain.py` | - | Polygon USDC.e 余额查询 |

### API 路由

```
GET  /api/v1/account/{address}        # 地址详情 (P/L, Positions, 10维度评分)
GET  /api/v1/account/{address}/positions  # 活跃仓位 (含市场状态)
GET  /api/v1/account/{address}/closed-positions  # 已平仓仓位
GET  /api/v1/account/{address}/trades     # 交易历史
GET  /api/v1/account/{address}/activity   # 活动历史
GET  /api/v1/account/{address}/stats      # 快速统计 (含链上余额)
GET  /api/v1/leaderboard                 # 排行榜
GET  /api/v1/leaderboard/top             # Top N 交易员
GET  /api/v1/leaderboard/trader/{address} # 查找交易员
POST /api/v1/follow/{address}             # 关注交易员 (TODO)
DELETE /api/v1/unfollow/{address}         # 取消关注 (TODO)
```

### 10维度评分系统

| 维度 | 权重 | 说明 |
|------|------|------|
| **Profitability** | 15% | 盈利能力 (P/L 归一化) |
| **Win Rate** | 15% | 胜率 (过滤小额防刷) |
| **Profit Factor** | 15% | 盈亏比 (0-5倍映射) |
| **Risk Management** | 10% | 风险管理 |
| **Experience** | 10% | 经验值 (sqrt(天数*交易数)) |
| **Position Control** | 10% | 仓位控制 (最大仓位占比) |
| **Anti-Bot** | 5% | 反Bot (睡眠规律+整数偏好) |
| **Focus** | 5% | 专注度 (HHI集中度) |
| **Close Discipline** | 10% | 平仓纪律 (SELL vs REDEEM) |
| **Capital** | 5% | 资金体量 (log scale) |

## 环境变量

```env
# Polygon RPC
POLYGON_RPC_URL=https://polygon.drpc.org

# Supabase
SUPABASE_URL=https://nlkvfiqtzlubwqnmefej.supabase.co
SUPABASE_ANON_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx

# Database
DATABASE_URL=postgresql+asyncpg://...
DIRECT_URL=postgresql+asyncpg://...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

## 快速开始

### 后端

```bash
cd backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Linux/Mac

# 安装依赖
pip install -r requirements.txt

# 运行开发服务器 (127.0.0.1)
uvicorn app.main:app --host 127.0.0.1 --port 8000

# 运行测试
pytest tests/ -v
```

### 测试

```bash
# 运行所有测试
pytest tests/ -v

# 查看覆盖率
pytest tests/ --cov=app/services --cov-report=html
```

## 数据库

使用 Supabase PostgreSQL，表结构:

| 表名 | 说明 |
|------|------|
| `users` | 用户账户 |
| `followed_addresses` | 关注关系 |
| `leaderboard_addresses` | 排行榜交易员 |
| `positions` | 仓位记录 |
| `trades` | 交易历史 |

## 开发规范

1. **全异步 I/O**: 后端所有网络请求必须使用 `httpx` (async)
2. **容错限流**: 必须实现 Retry 机制 (指数退避)
3. **精度**: 金额计算使用 `Decimal`，保留 6 位小数
4. **缓存**: 排行榜数据先查 Redis，无数据再查数据库

## 相关文档

- [Polymarket API 文档](https://docs.polymarket.com)
- [py-clob-client SDK](https://github.com/Polymarket/py-clob-client)
- [Supabase 文档](https://supabase.com/docs)
- [Upstash Redis](https://upstash.com/docs)
