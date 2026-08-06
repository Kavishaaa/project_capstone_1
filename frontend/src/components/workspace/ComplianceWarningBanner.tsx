import { AlertOctagon, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ComplianceFlag } from "@/types/api";

const SEVERITY_VARIANT: Record<ComplianceFlag["severity"], "destructive" | "warning" | "secondary"> = {
  High: "destructive",
  Medium: "warning",
  Low: "secondary",
};

export function ComplianceWarningBanner({ flags }: { flags: ComplianceFlag[] }) {
  const passed = flags.length === 0;

  return (
    <Card className={cn(!passed && "border-destructive/40")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {passed ? (
            <ShieldCheck className="h-4 w-4 text-success" />
          ) : (
            <AlertOctagon className="h-4 w-4 text-destructive" />
          )}
          Compliance {passed ? "Passed" : "Warnings"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {passed && <p className="text-sm text-muted-foreground">No compliance issues detected in the suggested reply.</p>}
        {flags.map((flag, idx) => (
          <div key={idx} className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">{flag.rule}</p>
              <Badge variant={SEVERITY_VARIANT[flag.severity]}>{flag.severity}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{flag.explanation}</p>
            {flag.matched_policy && (
              <p className="mt-1 text-[11px] text-muted-foreground/80">Policy: {flag.matched_policy}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
