import * as React from "react";
import { motion } from "framer-motion";
import { Clock, MessageSquareText, Smile, TicketCheck, type LucideIcon } from "lucide-react";

import { ActiveConversationsList } from "@/components/dashboard/ActiveConversationsList";
import { AiInsightsPanel } from "@/components/dashboard/AiInsightsPanel";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PendingActionsList } from "@/components/dashboard/PendingActionsList";
import { RecentSummaries } from "@/components/dashboard/RecentSummaries";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboard } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import type { DashboardResponse } from "@/types/api";

const KPI_ICONS: LucideIcon[] = [Clock, MessageSquareText, Smile, TicketCheck];

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { showToast } = useToast();

  React.useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => showToast({ title: "Failed to load dashboard", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.kpis.map((kpi, idx) => (
          <KpiCard key={kpi.label} kpi={kpi} icon={KPI_ICONS[idx % KPI_ICONS.length]} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ActiveConversationsList conversations={data.active_conversations} />
        <RecentSummaries summaries={data.recent_summaries} />
        <div className="space-y-4">
          <PendingActionsList actions={data.pending_actions} />
          <AiInsightsPanel insights={data.ai_insights} />
        </div>
      </div>
    </motion.div>
  );
}
