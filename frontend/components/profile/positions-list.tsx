"use client";

import { Position } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PositionsListProps {
  positions: Position[];
  title: string;
  emptyMessage?: string;
}

export function PositionsList({
  positions,
  title,
  emptyMessage = "No positions found",
}: PositionsListProps) {
  const formatCurrency = (value: string | number | undefined) => {
    if (value === undefined || value === null) return "N/A";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const getStatusBadge = (position: Position) => {
    const status = position.display_status || position.market_status;

    if (position.is_redeemable) {
      return (
        <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
          Redeem
        </span>
      );
    }

    switch (status) {
      case "active":
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Active
          </span>
        );
      case "closed":
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground border border-border">
            Closed
          </span>
        );
      case "pending_redeem":
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30">
            Pending
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground border border-border">
            {status || "Unknown"}
          </span>
        );
    }
  };

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium h-10">Market</TableHead>
                <TableHead className="text-muted-foreground font-medium">Side</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium">Size</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium">Entry</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium">Current</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium">P/L</TableHead>
                <TableHead className="text-muted-foreground font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position, index) => (
                <TableRow
                  key={position.position_id || index}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium max-w-[200px] truncate py-3">
                    {position.market || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        position.side?.toLowerCase() === "yes"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      {position.side || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{position.size || "0"}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(position.entry_price)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(position.current_price)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      parseFloat(position.cashPnl || "0") >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatCurrency(position.cashPnl)}
                  </TableCell>
                  <TableCell>{getStatusBadge(position)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
