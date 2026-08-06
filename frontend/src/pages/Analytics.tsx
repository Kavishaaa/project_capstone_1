import * as React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

import { AgentProductivityTable } from "@/components/analytics/AgentProductivityTable";
import { TopPoliciesTable } from "@/components/analytics/TopPoliciesTable";
import { TrendCard } from "@/components/analytics/TrendCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { getAnalytics } from "@/lib/api";
import type { AnalyticsResponse } from "@/types/api";

export default function AnalyticsPage() {
  const [data, setData] = React.useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [exporting, setExporting] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  React.useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(() => showToast({ title: "Failed to load analytics", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [showToast]);

  const exportPdf = async () => {
    if (!containerRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(containerRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });
      doc.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      doc.save("exlsmartassist-analytics.pdf");
    } finally {
      setExporting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Operations Analytics</h2>
        <Button size="sm" onClick={exportPdf} disabled={exporting}>
          <Download className="h-3.5 w-3.5" /> {exporting ? "Exporting..." : "Export PDF"}
        </Button>
      </div>

      <div ref={containerRef} className="space-y-5 bg-background p-1">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TrendCard title="Avg Handle Time" data={data.aht_trend} color="#0B5FFF" suffix="m" />
          <TrendCard title="CSAT Score" data={data.csat_trend} color="#22c55e" />
          <TrendCard title="First Contact Resolution" data={data.fcr_trend} color="#FF6B00" suffix="%" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TopPoliciesTable policies={data.top_policies} />
          <AgentProductivityTable rows={data.agent_productivity} />
        </div>
      </div>
    </motion.div>
  );
}
