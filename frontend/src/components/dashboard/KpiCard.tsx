import * as React from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { KpiSnapshot } from "@/types/api";

const TREND_ICON: Record<KpiSnapshot["trend"], LucideIcon> = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
};

const TREND_COLOR: Record<KpiSnapshot["trend"], string> = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
};

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 90, damping: 20 });
  const rounded = useTransform(spring, (latest) => Math.round(latest).toLocaleString());

  React.useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{rounded}</motion.span>;
}

export function KpiCard({ kpi, icon: Icon }: { kpi: KpiSnapshot; icon: LucideIcon }) {
  const TrendIcon = TREND_ICON[kpi.trend];
  const numericValue = Number.parseFloat(kpi.value.replace(/[^0-9.]/g, ""));
  const suffix = kpi.value.replace(/^[0-9.\s]+/, "").trim();
  const isNumeric = !Number.isNaN(numericValue);

  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
          <p className="mt-1 text-2xl font-bold">
            {isNumeric ? (
              <>
                <AnimatedNumber value={numericValue} />
                {suffix && <span className="ml-1 text-lg">{suffix}</span>}
              </>
            ) : (
              kpi.value
            )}
          </p>
          <div className={cn("mt-1 flex items-center gap-1 text-xs font-medium", TREND_COLOR[kpi.trend])}>
            <TrendIcon className="h-3.5 w-3.5" />
            {kpi.delta}
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
