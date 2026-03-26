"use client";

import { Activity } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ActivityListProps {
  activity: Activity[];
  title: string;
  emptyMessage?: string;
}

const ACTIVITY_COLORS: Record<string, string> = {
  TRADE: "bg-violet-500/20 text-violet-400 border border-violet-500/30",
  REDEEM: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  TRANSFER: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  WITHDRAW: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  DEPOSIT: "bg-teal-500/20 text-teal-400 border border-teal-500/30",
};

export function ActivityList({
  activity,
  title,
  emptyMessage = "No activity found",
}: ActivityListProps) {
  const formatCurrency = (value: string | undefined) => {
    if (!value) return "N/A";
    const num = parseFloat(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (timestamp: string | undefined) => {
    if (!timestamp) return "N/A";
    try {
      return new Date(timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  if (activity.length === 0) {
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
                <TableHead className="text-muted-foreground font-medium h-10">Type</TableHead>
                <TableHead className="text-muted-foreground font-medium">Market</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium">Amount</TableHead>
                <TableHead className="text-muted-foreground font-medium">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activity.map((item, index) => (
                <TableRow
                  key={item.id || index}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        ACTIVITY_COLORS[item.type] || "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {item.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate py-3">
                    {item.market || "N/A"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(item.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
