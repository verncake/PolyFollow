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
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Address Profile</h1>
          <p className="text-muted-foreground mt-1">
            Detailed trader analysis and performance metrics
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchSummary();
            refetchPositions();
            refetchClosed();
            refetchActivity();
          }}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {summaryError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load account data. Please check the address and try again.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : summary ? (
        <>
          <AddressHeader summary={summary} />

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(stats.total_value || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    USDC.e Balance (Polygon)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.usdc_e_balance !== null
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(stats.usdc_e_balance)
                      : "N/A"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Markets Traded
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.markets_traded_count || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="positions" className="mt-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="positions">
                Active Positions
                {positions && positions.count > 0 && (
                  <span className="ml-2 text-xs bg-secondary px-1.5 py-0.5 rounded">
                    {positions.count}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="closed">
                Closed Positions
                {closedPositions && closedPositions.count > 0 && (
                  <span className="ml-2 text-xs bg-secondary px-1.5 py-0.5 rounded">
                    {closedPositions.count}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="activity">
                Activity
                {activity && activity.count > 0 && (
                  <span className="ml-2 text-xs bg-secondary px-1.5 py-0.5 rounded">
                    {activity.count}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="positions" className="mt-6">
              {positionsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
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

            <TabsContent value="closed" className="mt-6">
              {closedLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
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

            <TabsContent value="activity" className="mt-6">
              {activityLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
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
    </div>
  );
}
