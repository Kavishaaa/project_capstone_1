import * as React from "react";
import { ClipboardCheck, Copy, Download } from "lucide-react";
import jsPDF from "jspdf";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import type { CrmNoteResponse, SummarizeResponse } from "@/types/api";

export function CrmNotePanel({
  summary,
  crmNote,
  customerName,
}: {
  summary: SummarizeResponse;
  crmNote: CrmNoteResponse;
  customerName: string;
}) {
  const { showToast } = useToast();

  const copyNote = async () => {
    await navigator.clipboard.writeText(crmNote.note_text);
    showToast({ title: "CRM note copied to clipboard", variant: "success" });
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Call Summary — ${customerName}`, 14, 18);
    doc.setFontSize(10);
    const lines = [
      `Customer Issue: ${summary.customer_issue}`,
      `Root Cause: ${summary.root_cause}`,
      `Actions Performed: ${summary.actions_performed.join("; ")}`,
      `Resolution: ${summary.resolution}`,
      `Follow-up: ${summary.follow_up}`,
      `Sentiment: ${summary.sentiment}`,
      "",
      `CRM Note (${crmNote.category} / ${crmNote.disposition}):`,
      crmNote.note_text,
    ];
    const wrapped = doc.splitTextToSize(lines.join("\n"), 180);
    doc.text(wrapped, 14, 28);
    doc.save(`call-summary-${customerName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          Auto Call Summary & CRM Note
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="secondary">{summary.sentiment}</Badge>
          <Badge variant="outline">{crmNote.disposition}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Customer Issue</p>
          <p>{summary.customer_issue}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Root Cause</p>
          <p>{summary.root_cause}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Actions Performed</p>
          <ul className="list-inside list-disc">
            {summary.actions_performed.map((action, idx) => (
              <li key={idx}>{action}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Resolution</p>
          <p>{summary.resolution}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Follow-up</p>
          <p>{summary.follow_up}</p>
        </div>
        <div className="rounded-md border bg-secondary/40 p-3">
          <p className="text-xs font-semibold text-muted-foreground">CRM Note</p>
          <p className="mt-1 whitespace-pre-wrap">{crmNote.note_text}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={copyNote}>
            <Copy className="h-3.5 w-3.5" /> Copy Note
          </Button>
          <Button size="sm" onClick={exportPdf}>
            <Download className="h-3.5 w-3.5" /> Export PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
