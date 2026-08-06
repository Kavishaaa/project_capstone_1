import { PhoneForwarded } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function EscalationBanner({ reason }: { reason: string }) {
  return (
    <Card className="border-warning/50 bg-warning/10">
      <CardContent className="flex items-start gap-3 p-4">
        <PhoneForwarded className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div>
          <p className="text-sm font-semibold text-warning">Escalation Recommended</p>
          <p className="text-xs text-muted-foreground">{reason}</p>
        </div>
      </CardContent>
    </Card>
  );
}
