"use client";

import { Position } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      return <Badge variant="default">Redeem</Badge>;
    }

    switch (status) {
      case "active":
        return <Badge variant="secondary">Active</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      case "pending_redeem":
        return <Badge variant="destructive">Pending</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Market</TableHead>
              <TableHead>Side</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead className="text-right">Entry</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">P/L</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map((position, index) => (
              <TableRow key={position.position_id || index}>
                <TableCell className="font-medium max-w-[200px] truncate">
                  {position.market || "Unknown"}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      position.side?.toLowerCase() === "yes"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {position.side || "N/A"}
                  </span>
                </TableCell>
                <TableCell className="text-right">{position.size || "0"}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(position.entry_price)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(position.current_price)}
                </TableCell>
                <TableCell
                  className={`text-right ${
                    parseFloat(position.cashPnl || "0") >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(position.cashPnl)}
                </TableCell>
                <TableCell>{getStatusBadge(position)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
