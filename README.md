# Polymarket Follow-Alpha System

跟单系统 - 追踪 Polymarket 交易员的持仓和业绩表现。

## 仓库结构

本项目分为三个独立仓库：

| 仓库 | 说明 |
|------|------|
| [PolyFollow](https://github.com/verncake/PolyFollow) | 主仓 - 文档和项目规划 |
| [PolyFollow-Backend](https://github.com/verncake/PolyFollow-Backend) | FastAPI 后端 - API 服务 |
| [PolyFollow-Frontend](https://github.com/verncake/PolyFollow-Frontend) | Next.js 前端 - 用户界面 |

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
| **Tailwind CSS** | 样式 (Polymarket 深色主题) |
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
PolyFollow/                           # 主仓 - 文档
├── README.md                         # 项目文档
├── TODO_LIST.md                     # 开发进度跟踪
├── PROJECT_PROMOT_PHASE1-2.md      # 开发指导文档
└── CLAUDE.md                        # Claude Code 指导

PolyFollow-Backend/                   # 后端仓库
├── app/
│   ├── main.py                     # FastAPI 入口
│   ├── api/routes/                # API 路由
│   ├── core/                       # 配置与 Redis
│   ├── schemas/                    # Pydantic 模型
│   └── services/                    # 业务逻辑
├── tests/                          # pytest 测试
├── requirements.txt                 # Python 依赖
└── pyproject.toml                  # 项目配置

PolyFollow-Frontend/                  # 前端仓库
├── app/
│   ├── leaderboard/page.tsx        # 排行榜页面
│   └── profile/[address]/page.tsx   # 地址详情页面
├── components/                      # UI 组件
├── lib/                            # API 客户端
└── package.json                    # Node 依赖
```

## API 架构

### 已实现的 API 服务

| 模块 | 方法数 | 说明 |
|------|--------|------|
| **Gamma API** | 30 | Markets, Events, Tags, Profiles |
| **Data API** | 12 | Positions, Trades, Activity, Leaderboard |
| **CLOB HTTP** | 20 | Order Book, Prices, Spreads |
| **CLOB SDK** | 41 | 完整交易支持 |
| **WebSocket** | - | Market, User, Sports 频道 |
| **Auth** | 38+ | Trade, Rewards, Rebates, Bridge |
| **Blockchain** | - | Polygon USDC.e 余额查询 |

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

## 快速开始

### 后端

```bash
cd PolyFollow-Backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Linux/Mac

# 安装依赖
pip install -r requirements.txt

# 运行开发服务器
uvicorn app.main:app --host 127.0.0.1 --port 8000

# 运行测试
pytest tests/ -v
```

### 前端

```bash
cd PolyFollow-Frontend

# 安装依赖
npm install

# 运行开发服务器
npm run dev
```

## 相关文档

- [Polymarket API 文档](https://docs.polymarket.com)
- [py-clob-client SDK](https://github.com/Polymarket/py-clob-client)
- [Supabase 文档](https://supabase.com/docs)
- [Upstash Redis](https://upstash.com/docs)
