### 💡 核心数据预处理（前提）

在计算以下所有维度前，必须先按 `market_id` 或 `asset_id` 将 `trades` 历史记录进行分组聚合，计算出每个盘口的净投入、净产出和最终盈亏。我们定义：

- **Trade:** 单笔买卖操作。
- **Position (仓位):** 在单一 Market 中的所有 Trades 聚合（包含已平仓和未平仓）。

---

### 1. Profitability (盈利能力) ✅

- **算法逻辑:** 绝对值的金钱游戏。
- **计算公式:** $Score = Realized\ PnL + Unrealized\ PnL$
- **代码处理:** 直接累加。由于是大神榜，这个数值通常很大，在打分时需要做对数归一化（Log Normalization），避免首富把其他人的分数压缩成 0。

### 2. Win Rate (胜率) ✅

- **算法逻辑:** 赢的次数占比。
- **计算公式:** $Win\ Rate = \frac{Count(Positions\ where\ PnL > 0)}{Count(Total\ Closed\ Positions)}$
- **防作弊机制:** 过滤掉总交易额极小（例如 < $5）的仓位，防止刷胜率。

### 3. Profit Factor (盈亏比) ✅

- **算法逻辑:** 赚的钱和亏的钱的比例，这是衡量量化策略好坏的核心指标。
- **计算公式:** $Profit\ Factor = \frac{\sum Gross\ Profit}{|\sum Gross\ Loss|}$
- **边界处理:** 如果 $Gross\ Loss == 0$，将此值设为一个合理的上限（如 99），避免除以零报错。

### 4. Risk Mgmt (风险管理 - 回撤与止损) ⚠️

- **推断逻辑转计算:** 优秀的交易员不会让一笔交易亏光所有利润。我们通过“平均亏损对比”来衡量。
- **计算公式:**
  $Risk\ Score = \frac{Average\ Winning\ Trade\ Size}{Average\ Losing\ Trade\ Size}$
- **补充指标 (止损率):** 统计所有亏损的仓位中，有多少是“主动 Sell（认赔出局）”的，有多少是“拿到盘口结束被系统 Redeem（归零）”的。主动 Sell 比例越高，风险管理得分越高。

### 5. Experience (交易经验) ✅

- **算法逻辑:** 穿越牛熊的经验值。
- **计算公式:** 结合 `Account Age` (第一笔交易距今的天数) 和 `Total Trades`。
- **打分建议:** 可以设置一个阈值，比如交易超过 500 笔且活跃超过 3 个月的地址，此项直接满分。

### 6. Pos. Control (仓位控制 - 凯利公式变体) ⚠️

- **推断逻辑转计算:** 看该地址是不是“赌徒”。重仓单一盘口是暴雷的前兆。
- **计算方法:** 遍历历史所有时间节点（或仅看当前 Open Positions）。
- **计算公式:**
  $Max\ Exposure = \max_{i} \left( \frac{Position_i\ Value}{Total\ Capital} \right)$
- **打分标准:** 单一仓位占比长期低于 15%-20% 的，得分高；经常 All-in (占比 > 80%) 的，得分极低（极度危险，不建议跟单）。

### 7. Anti-Bot (反机器人检测) ❌

- **推断逻辑转计算:** 机器人的特征是“不知疲倦”和“金额极其规律”。虽然没有直接的 Bot 标签，但可以通过行为学数据算出来。
- **维度 A: 睡眠规律检测。** 提取过去 30 天所有交易的时间戳（转为 UTC 小时 0-23）。计算这 24 个小时的交易频次分布。如果是人类，必然有连续 6-8 小时的交易低谷（睡觉）。如果 24 小时分布方差极小，高度疑似 Bot。
- **维度 B: 整数金额偏好。** 统计该地址下单大小，如果 90% 以上的订单都是精确的 `$10.0000` 或 `$50.0000`，疑似量化脚本。
- **综合逻辑:** 发现上述特征，Anti-Bot 分数打 0 分；表现得越像散户，分数越高。

### 8. Focus (专注度 - 领域专家) ✅

- **推断逻辑转计算:** 交易员是只做“Crypto”板块，还是涵盖“Politics, Sports, Pop Culture”？
- **计算方法:** 从 Polymarket 接口拉取盘口的 `tags`。统计该地址参与的所有盘口的主题分布。
- **计算公式:** 使用赫芬达尔-赫希曼指数 (HHI) 衡量集中度，或者简单点：
  $Focus\ Score = 1 - \frac{Count(Unique\ Categories\ Traded)}{Count(Total\ Positions)}$
- **意义:** 专注度高的往往是特定领域的 Alpha 挖掘者，更具跟单价值。

### 9. Close Disc. (平仓纪律 - 不赚最后一块铜板) ⚠️

- **推断逻辑转计算:** Polymarket 很多盘口在 95% 概率时，剩下的 5% 是极高的资金时间成本和黑天鹅风险。好交易员会提前平仓套现。
- **计算方法:** 统计所有盈利且已完结的仓位。
- **计算公式:**
  $Discipline\ Score = \frac{Count(Profitable\ Positions\ closed\ via\ SELL)}{Count(Profitable\ Positions\ closed\ via\ REDEEM)}$
- **打分标准:** 习惯在价格处于 `$0.90 - $0.99` 区间主动 Sell 掉的，平仓纪律得分高。全靠 Redeem 的，得分低。

### 10. Capital (资金体量) ✅

- **算法逻辑:** 衡量是不是大户。
- **计算公式:**
  $Total\ Capital = USDC.e\ Balance + \sum (Open\ Positions\ \times\ Current\ Price)$
- **打分建议:** 使用分位数（Percentile）打分，比如资金量在前 10% 的拿满分。

---

### 给 Claude Code 的最终整合指令：

"Claude，请参考以上的数学公式和逻辑，在 `scoring_service.py` 中实现一个 `AddressScorer` 类。

1. 所有涉及到 ⚠️ 和 ❌ 的维度，请严格按照提供的数学公式和时间戳/金额分布逻辑进行计算。
2. 将每个维度的绝对值（如胜率 65%、盈亏比 2.1）统一映射到 **0-10 分** 的区间，并配置一个权重字典（例如 Win Rate 和 Profit Factor 权重占 40%），最终输出一个 **0-100 的综合分数 (Total Score)**。
3. 如果遇到除以零或数据不足（比如该地址只交易过 1 次），请设计安全的 fallback 逻辑（如直接返回默认分或提示 Insufficient Data）。"
