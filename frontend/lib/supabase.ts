import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          wallet_address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      followed_addresses: {
        Row: {
          id: string;
          user_id: string;
          target_address: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_address: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          target_address?: string;
          created_at?: string;
        };
      };
      leaderboard_addresses: {
        Row: {
          id: string;
          address: string;
          rank: number;
          score: number;
          data_quality: string;
          dimensions: Record<string, unknown>;
          volume: number | null;
          category: string | null;
          fetched_at: string;
        };
        Insert: {
          id?: string;
          address: string;
          rank: number;
          score: number;
          data_quality?: string;
          dimensions?: Record<string, unknown>;
          volume?: number | null;
          category?: string | null;
          fetched_at?: string;
        };
        Update: {
          id?: string;
          address?: string;
          rank?: number;
          score?: number;
          data_quality?: string;
          dimensions?: Record<string, unknown>;
          volume?: number | null;
          category?: string | null;
          fetched_at?: string;
        };
      };
      positions: {
        Row: {
          id: string;
          user_id: string;
          address: string;
          market: string;
          side: string;
          size: string;
          entry_price: string;
          current_price: string | null;
          realized_pnl: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          address: string;
          market: string;
          side: string;
          size: string;
          entry_price: string;
          current_price?: string | null;
          realized_pnl?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          address?: string;
          market?: string;
          side?: string;
          size?: string;
          entry_price?: string;
          current_price?: string | null;
          realized_pnl?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      trades: {
        Row: {
          id: string;
          user_id: string;
          address: string;
          market: string;
          side: string;
          size: string;
          price: string;
          fee: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          address: string;
          market: string;
          side: string;
          size: string;
          price: string;
          fee: string;
          timestamp: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          address?: string;
          market?: string;
          side?: string;
          size?: string;
          price?: string;
          fee?: string;
          timestamp?: string;
        };
      };
    };
  };
};
