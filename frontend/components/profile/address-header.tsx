"use client";

import { AccountSummary } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreBadge, DimensionBadge } from "@/components/leaderboard/score-badge";

interface AddressHeaderProps {
  summary: AccountSummary;
}

export function AddressHeader({ summary }: AddressHeaderProps) {
  const formatPnL = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const isPositive = (value: string) => parseFloat(value) >= 0;

  const dimensions = summary.dimensions;
  const dimensionEntries = Object.entries(dimensions);

  return (
    <div className="space-y-6">
      {/* Address & Score */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-mono text-foreground">{summary.address}</h1>
          <div className="flex items-center gap-4 mt-2">
            <ScoreBadge score={summary.score} showLabel />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {summary.data_quality} data
            </span>
          </div>
        </div>
      </div>

      {/* P/L Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
              Total P/L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl font-semibold ${
                isPositive(summary.total_pnl) ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatPnL(summary.total_pnl)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
              Unrealized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl font-semibold ${
                isPositive(summary.total_unrealized_pnl) ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatPnL(summary.total_unrealized_pnl)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
              Realized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl font-semibold ${
                isPositive(summary.total_realized_pnl) ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatPnL(summary.total_realized_pnl)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl font-semibold ${
                isPositive(summary.win_rate) ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {parseFloat(summary.win_rate).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {summary.winning_trades}W / {summary.losing_trades}L
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 10-Dimension Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
            10-Dimension Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            {dimensionEntries.map(([key, value]) => (
              <DimensionBadge
                key={key}
                dimension={key}
                score={value.score}
                raw={value.raw}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Position Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
              Open Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{summary.open_positions_count}</div>
            {summary.pending_redeem_count > 0 && (
              <p className="text-xs text-amber-400 mt-0.5">
                {summary.pending_redeem_count} pending redeem
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
              Closed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{summary.closed_positions_count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
              Total Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{summary.total_trades}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
              Profit Factor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl font-semibold ${
                isPositive(summary.profit_factor) ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {parseFloat(summary.profit_factor).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
