"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import { LeaderboardEntry } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ScoreBadge } from "./score-badge";

const columns: ColumnDef<LeaderboardEntry>[] = [
  {
    accessorKey: "rank",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Rank
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm">#{row.getValue("rank")}</span>
    ),
  },
  {
    accessorKey: "address",
    header: "Trader",
    cell: ({ row }) => {
      const address = row.getValue("address") as string;
      return (
        <Link
          href={`/profile/${address}`}
          className="font-mono text-sm text-foreground hover:text-primary transition-colors"
        >
          {address.slice(0, 6)}...{address.slice(-4)}
        </Link>
      );
    },
  },
  {
    accessorKey: "score",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Score
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const score = row.getValue("score") as number;
      return <ScoreBadge score={score} />;
    },
  },
  {
    accessorKey: "win_rate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Win Rate
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const winRate = row.getValue("win_rate") as number;
      return (
        <span className={winRate >= 50 ? "text-emerald-400" : "text-red-400"}>
          {winRate.toFixed(1)}%
        </span>
      );
    },
  },
  {
    accessorKey: "profit_factor",
    header: "Profit Factor",
    cell: ({ row }) => {
      const pf = row.getValue("profit_factor") as number;
      return (
        <span className={pf >= 1 ? "text-emerald-400" : "text-red-400"}>
          {pf.toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "total_trades",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Trades
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue("total_trades")}</span>
    ),
  },
  {
    accessorKey: "data_quality",
    header: "Quality",
    cell: ({ row }) => {
      const quality = row.getValue("data_quality") as string;
      const qualityColor = {
        full: "text-emerald-400",
        partial: "text-amber-400",
        insufficient: "text-red-400",
      };
      return (
        <span className={`text-xs uppercase tracking-wide ${qualityColor[quality as keyof typeof qualityColor] || "text-muted-foreground"}`}>
          {quality}
        </span>
      );
    },
  },
];

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
}

export function LeaderboardTable({ data }: LeaderboardTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-10 text-muted-foreground font-medium">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-2">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {data.length} traders
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground hover:text-foreground"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground hover:text-foreground"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
