import { History } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SimilarCase } from "@/types/api";

export function SimilarCasesList({ cases }: { cases: SimilarCase[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          Similar Historical Cases
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {cases.length === 0 && <p className="text-sm text-muted-foreground">No similar past tickets found.</p>}
        {cases.map((c) => (
          <div key={c.ticket_id} className="rounded-md border p-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">{c.subject}</p>
              <Badge variant="outline">{Math.round(c.relevance_score * 100)}%</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{c.resolution}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
