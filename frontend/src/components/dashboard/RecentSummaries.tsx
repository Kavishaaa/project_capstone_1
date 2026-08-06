import { FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentSummaryItem } from "@/types/api";

export function RecentSummaries({ summaries }: { summaries: RecentSummaryItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Recent AI Summaries
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {summaries.length === 0 && <p className="text-sm text-muted-foreground">No summaries yet.</p>}
        {summaries.map((summary) => (
          <div key={summary.conversation_id} className="rounded-md border p-3 text-sm">
            <p className="font-medium">{summary.customer_name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{summary.customer_issue}</p>
            <p className="mt-1 text-xs">
              <span className="font-medium text-success">Resolution: </span>
              {summary.resolution}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
