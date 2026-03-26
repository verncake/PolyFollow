"use client";

import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "@/lib/api";
import { LeaderboardTable } from "@/components/leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LeaderboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => getLeaderboard({ limit: 200 }),
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Leaderboard</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Top Polymarket traders ranked by composite score
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {isError && (
          <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load leaderboard. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-3 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="space-y-3 p-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : data ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                    Total Traders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{data.total_count}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">
                    {data.entries.length > 0
                      ? (
                          data.entries.reduce((sum, e) => sum + e.score, 0) /
                          data.entries.length
                        ).toFixed(1)
                      : "N/A"}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                    Data Source
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">
                    {data.cached ? (
                      <span className="text-emerald-500">Cached</span>
                    ) : (
                      <span className="text-amber-500">Live</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard Table */}
            <Card>
              <CardHeader className="border-b border-border">
                <CardTitle>Top Traders</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <LeaderboardTable data={data.entries} />
              </CardContent>
            </Card>
          </>
        ) : null}
      </main>
    </div>
  );
}
