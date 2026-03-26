import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">
              Polymarket Follow-Alpha
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Track Top Traders
            </h1>
            <p className="text-lg text-muted-foreground">
              Analyze Polymarket traders with our 10-dimension composite score system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
            <Link href="/leaderboard">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-left">
                    View top traders ranked by composite score. Analyze profitability,
                    win rate, risk management, and trading behavior.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-left space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">1.</span>
                    Enter any Polymarket wallet address
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">2.</span>
                    View detailed P/L and trading history
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">3.</span>
                    Compare across 10 performance dimensions
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Built with Next.js, Tailwind CSS, and Shadcn UI
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
