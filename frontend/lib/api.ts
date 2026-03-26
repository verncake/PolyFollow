/**
 * API client for Polymarket Follow-Alpha backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export interface ScoreDimensions {
  profitability: { score: number; raw: number };
  win_rate: { score: number; raw: number };
  profit_factor: { score: number; raw: number };
  risk_mgmt: { score: number; raw: number };
  experience: { score: number; raw: number };
  pos_control: { score: number; raw: number };
  anti_bot: { score: number; raw: number };
  focus: { score: number; raw: number };
  close_disc: { score: number; raw: number };
  capital: { score: number; raw: number };
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  score: number;
  data_quality: string;
  win_rate: number;
  profit_factor: number;
  total_trades: number;
  dimensions: ScoreDimensions;
  volume?: number;
  category?: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total_count: number;
  cached: boolean;
  category?: string;
  time_period?: string;
}

export interface AccountSummary {
  address: string;
  total_unrealized_pnl: string;
  total_realized_pnl: string;
  total_pnl: string;
  open_positions_count: number;
  pending_redeem_count: number;
  closed_positions_count: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: string;
  profit_factor: string;
  score: number;
  data_quality: string;
  dimensions: ScoreDimensions;
}

export interface Position {
  market_status?: string;
  market_closed?: boolean;
  market_resolved?: boolean;
  is_redeemable?: boolean;
  days_until_end?: number;
  display_status?: string;
  position_id?: string;
  market?: string;
  side?: string;
  size?: string;
  entry_price?: string;
  current_price?: string;
  cashPnl?: string;
  realizedPnl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PositionsResponse {
  address: string;
  positions: Position[];
  count: number;
  pending_redeem_count: number;
  limit: number;
  offset: number;
  status_filter: string;
}

export interface ClosedPositionsResponse {
  address: string;
  positions: Position[];
  count: number;
  limit: number;
  offset: number;
}

export interface Trade {
  id: string;
  market?: string;
  side?: string;
  size?: string;
  price?: string;
  fee?: string;
  timestamp?: string;
}

export interface TradesResponse {
  address: string;
  trades: Trade[];
  count: number;
  limit: number;
  offset: number;
}

export interface Activity {
  id: string;
  type: string;
  market?: string;
  amount?: string;
  timestamp?: string;
}

export interface ActivityResponse {
  address: string;
  activity: Activity[];
  count: number;
  limit: number;
  offset: number;
}

export interface AccountStats {
  address: string;
  total_value: number;
  usdc_e_balance: number | null;
  markets_traded_count: number;
}

export async function getLeaderboard(params?: {
  category?: string;
  time_period?: string;
  limit?: number;
  offset?: number;
}): Promise<LeaderboardResponse> {
  return fetchApi<LeaderboardResponse>("/api/v1/leaderboard", { params });
}

export async function getTopTraders(limit = 50): Promise<LeaderboardResponse> {
  return fetchApi<LeaderboardResponse>("/api/v1/leaderboard/top", {
    params: { limit },
  });
}

export async function getTraderOnLeaderboard(
  address: string
): Promise<{ found: boolean; entry?: LeaderboardEntry; address: string }> {
  return fetchApi(`/api/v1/leaderboard/trader/${address}`);
}

export async function getAccountSummary(
  address: string
): Promise<AccountSummary> {
  return fetchApi(`/api/v1/account/${address}`);
}

export async function getAccountPositions(
  address: string,
  params?: {
    limit?: number;
    offset?: number;
    status?: "all" | "active" | "closed" | "pending_redeem";
  }
): Promise<PositionsResponse> {
  return fetchApi(`/api/v1/account/${address}/positions`, { params });
}

export async function getAccountClosedPositions(
  address: string,
  params?: { limit?: number; offset?: number }
): Promise<ClosedPositionsResponse> {
  return fetchApi(`/api/v1/account/${address}/closed-positions`, { params });
}

export async function getAccountTrades(
  address: string,
  params?: {
    market?: string;
    limit?: number;
    offset?: number;
  }
): Promise<TradesResponse> {
  return fetchApi(`/api/v1/account/${address}/trades`, { params });
}

export async function getAccountActivity(
  address: string,
  params?: {
    activity_type?: string;
    market?: string;
    limit?: number;
    offset?: number;
  }
): Promise<ActivityResponse> {
  return fetchApi(`/api/v1/account/${address}/activity`, { params });
}

export async function getAccountStats(
  address: string
): Promise<AccountStats> {
  return fetchApi(`/api/v1/account/${address}/stats`);
}
