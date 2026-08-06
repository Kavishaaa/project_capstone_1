import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgentProductivityRow } from "@/types/api";

export function AgentProductivityTable({ rows }: { rows: AgentProductivityRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Productivity</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2 font-medium">Agent</th>
              <th className="pb-2 text-right font-medium">Resolved</th>
              <th className="pb-2 text-right font-medium">Avg AHT</th>
              <th className="pb-2 text-right font-medium">Avg CSAT</th>
              <th className="pb-2 text-right font-medium">FCR</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.agent_name} className="border-b last:border-0">
                <td className="py-2 font-medium">{row.agent_name}</td>
                <td className="py-2 text-right">{row.tickets_resolved}</td>
                <td className="py-2 text-right">{row.avg_handle_time_minutes.toFixed(1)}m</td>
                <td className="py-2 text-right">{row.avg_csat.toFixed(1)}</td>
                <td className="py-2 text-right">{Math.round(row.fcr_rate * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
