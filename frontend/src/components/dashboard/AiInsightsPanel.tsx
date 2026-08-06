import { AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AiInsight } from "@/types/api";

const CATEGORY_ICON: Record<AiInsight["category"], typeof TrendingUp> = {
  trend: TrendingUp,
  risk: AlertTriangle,
  opportunity: Lightbulb,
};

const CATEGORY_COLOR: Record<AiInsight["category"], string> = {
  trend: "text-primary bg-primary/10",
  risk: "text-destructive bg-destructive/10",
  opportunity: "text-accent bg-accent/10",
};

export function AiInsightsPanel({ insights }: { insights: AiInsight[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, idx) => {
          const Icon = CATEGORY_ICON[insight.category];
          return (
            <div key={idx} className="flex gap-3 rounded-md border p-3">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", CATEGORY_COLOR[insight.category])}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="text-xs text-muted-foreground">{insight.detail}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
