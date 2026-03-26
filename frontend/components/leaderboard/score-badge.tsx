"use client";

interface ScoreBadgeProps {
  score: number;
  showLabel?: boolean;
}

export function ScoreBadge({ score, showLabel = false }: ScoreBadgeProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    if (score >= 60) return "bg-teal-500/20 text-teal-400 border border-teal-500/30";
    if (score >= 40) return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    if (score >= 20) return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    return "bg-red-500/20 text-red-400 border border-red-500/30";
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`rounded px-2 py-0.5 text-sm font-bold min-w-[40px] text-center ${getScoreColor(score)}`}
      >
        {score}
      </div>
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {score >= 80 ? "Elite" : score >= 60 ? "Good" : score >= 40 ? "Average" : "Low"}
        </span>
      )}
    </div>
  );
}

interface DimensionBadgeProps {
  dimension: string;
  score: number;
  raw?: number;
}

export function DimensionBadge({ dimension, score, raw }: DimensionBadgeProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 8) return "bg-emerald-500/20 text-emerald-400";
    if (score >= 6) return "bg-teal-500/20 text-teal-400";
    if (score >= 4) return "bg-amber-500/20 text-amber-400";
    if (score >= 2) return "bg-orange-500/20 text-orange-400";
    return "bg-red-500/20 text-red-400";
  };

  const labels: Record<string, string> = {
    profitability: "Profit",
    win_rate: "Win Rate",
    profit_factor: "P.F.",
    risk_mgmt: "Risk",
    experience: "Exp.",
    pos_control: "Pos.",
    anti_bot: "Anti-Bot",
    focus: "Focus",
    close_disc: "Close",
    capital: "Capital",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`rounded px-2 py-0.5 text-xs font-bold min-w-[32px] text-center ${getScoreColor(score)}`}
        title={`${dimension}: ${score}/10 (raw: ${raw})`}
      >
        {score.toFixed(1)}
      </div>
      <span className="text-xs text-muted-foreground">{labels[dimension] || dimension}</span>
    </div>
  );
}
