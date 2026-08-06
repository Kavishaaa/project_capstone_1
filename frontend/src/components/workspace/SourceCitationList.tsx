import { BookText, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SourceCitation } from "@/types/api";

export function SourceCitationList({
  title,
  icon: Icon = BookText,
  citations,
  emptyLabel,
}: {
  title: string;
  icon?: LucideIcon;
  citations: SourceCitation[];
  emptyLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {citations.length === 0 && <p className="text-sm text-muted-foreground">{emptyLabel}</p>}
        {citations.map((citation) => (
          <div key={citation.id} className="rounded-md border p-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">{citation.title}</p>
              <Badge variant="outline">{Math.round(citation.relevance_score * 100)}%</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{citation.snippet}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
