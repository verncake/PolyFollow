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
  TRADE: "bg-blue-100 text-blue-800",
  REDEEM: "bg-green-100 text-green-800",
  TRANSFER: "bg-purple-100 text-purple-800",
  WITHDRAW: "bg-orange-100 text-orange-800",
  DEPOSIT: "bg-teal-100 text-teal-800",
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
              <TableHead>Type</TableHead>
              <TableHead>Market</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activity.map((item, index) => (
              <TableRow key={item.id || index}>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      ACTIVITY_COLORS[item.type] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.type}
                  </span>
                </TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">
                  {item.market || "N/A"}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(item.timestamp)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
