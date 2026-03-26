import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Polymarket Follow-Alpha
          </h1>
          <p className="text-xl text-muted-foreground">
            Track and follow top Polymarket traders with advanced analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Link href="/leaderboard">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-2xl">Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  View top traders ranked by our 10-dimension composite score.
                  Analyze profitability, win rate, risk management, and more.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-left space-y-2 text-muted-foreground">
                <li>Enter any Polymarket wallet address</li>
                <li>View detailed P/L analysis and trading history</li>
                <li>Compare traders across 10 performance dimensions</li>
                <li>Follow top traders with real-time updates</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <p className="text-sm text-muted-foreground">
            Built with Next.js, Tailwind CSS, and Shadcn UI
          </p>
        </div>
      </div>
    </div>
  );
}
