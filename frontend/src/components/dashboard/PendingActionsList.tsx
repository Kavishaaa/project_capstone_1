import { ListTodo } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PendingAction } from "@/types/api";

const PRIORITY_VARIANT: Record<string, "destructive" | "warning" | "secondary"> = {
  High: "destructive",
  Medium: "warning",
  Low: "secondary",
};

export function PendingActionsList({ actions }: { actions: PendingAction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-primary" />
          Pending Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.length === 0 && <p className="text-sm text-muted-foreground">Nothing pending.</p>}
        {actions.map((action) => (
          <div key={action.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
            <span>{action.description}</span>
            <Badge variant={PRIORITY_VARIANT[action.priority] ?? "secondary"}>{action.priority}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
