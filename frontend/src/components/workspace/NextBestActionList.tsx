import { ListChecks } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NextBestAction } from "@/types/api";

const PRIORITY_VARIANT: Record<NextBestAction["priority"], "destructive" | "warning" | "secondary"> = {
  High: "destructive",
  Medium: "warning",
  Low: "secondary",
};

export function NextBestActionList({ actions }: { actions: NextBestAction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          Next Best Action
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action, idx) => (
          <div key={idx} className="rounded-md border p-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">{action.action}</p>
              <Badge variant={PRIORITY_VARIANT[action.priority]}>{action.priority}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{action.rationale}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
