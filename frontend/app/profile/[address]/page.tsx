"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import {
  getAccountSummary,
  getAccountPositions,
  getAccountClosedPositions,
  getAccountActivity,
  getAccountStats,
} from "@/lib/api";
import { AddressHeader, PositionsList, ActivityList } from "@/components/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddressPageProps {
  params: Promise<{ address: string }>;
}

export default function AddressPage({ params }: AddressPageProps) {
  const resolvedParams = use(params);
  const address = resolvedParams.address;

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["account", address, "summary"],
    queryFn: () => getAccountSummary(address),
    enabled: !!address,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["account", address, "stats"],
    queryFn: () => getAccountStats(address),
    enabled: !!address,
  });

  const {
    data: positions,
    isLoading: positionsLoading,
    refetch: refetchPositions,
  } = useQuery({
    queryKey: ["account", address, "positions"],
    queryFn: () => getAccountPositions(address, { status: "active" }),
    enabled: !!address,
  });

  const {
    data: closedPositions,
    isLoading: closedLoading,
    refetch: refetchClosed,
  } = useQuery({
    queryKey: ["account", address, "closed-positions"],
    queryFn: () => getAccountClosedPositions(address),
    enabled: !!address,
  });

  const {
    data: activity,
    isLoading: activityLoading,
    refetch: refetchActivity,
  } = useQuery({
    queryKey: ["account", address, "activity"],
    queryFn: () => getAccountActivity(address),
    enabled: !!address,
  });

  const isLoading = summaryLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Trader Profile</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Detailed analysis and performance metrics
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                refetchSummary();
                refetchPositions();
                refetchClosed();
                refetchActivity();
              }}
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
        {summaryError && (
          <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load account data. Please check the address and try again.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        ) : summary ? (
          <>
            <AddressHeader summary={summary} />

            {/* Quick Stats from /stats endpoint */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                      Portfolio Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-semibold">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(stats.total_value || 0)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                      USDC.e Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-semibold">
                      {stats.usdc_e_balance !== null
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(stats.usdc_e_balance)
                        : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Polygon</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground font-normal text-xs uppercase tracking-wide">
                      Markets Traded
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-semibold">
                      {stats.markets_traded_count || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="positions" className="mt-6">
              <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
                <TabsTrigger value="positions" className="data-[state=active]:bg-background">
                  Active
                  {positions && positions.count > 0 && (
                    <span className="ml-2 text-xs opacity-60">({positions.count})</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="closed" className="data-[state=active]:bg-background">
                  Closed
                  {closedPositions && closedPositions.count > 0 && (
                    <span className="ml-2 text-xs opacity-60">({closedPositions.count})</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-background">
                  Activity
                  {activity && activity.count > 0 && (
                    <span className="ml-2 text-xs opacity-60">({activity.count})</span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="positions" className="mt-4">
                {positionsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <PositionsList
                    positions={positions?.positions || []}
                    title="Active Positions"
                    emptyMessage="No active positions"
                  />
                )}
              </TabsContent>

              <TabsContent value="closed" className="mt-4">
                {closedLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <PositionsList
                    positions={closedPositions?.positions || []}
                    title="Closed Positions"
                    emptyMessage="No closed positions"
                  />
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                {activityLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <ActivityList
                    activity={activity?.activity || []}
                    title="Activity History"
                    emptyMessage="No activity"
                  />
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </main>
    </div>
  );
}
