import { BookOpen, FileCheck2 } from "lucide-react";

import { ComplianceWarningBanner } from "@/components/workspace/ComplianceWarningBanner";
import { CustomerSummaryCard } from "@/components/workspace/CustomerSummaryCard";
import { EscalationBanner } from "@/components/workspace/EscalationBanner";
import { NextBestActionList } from "@/components/workspace/NextBestActionList";
import { SimilarCasesList } from "@/components/workspace/SimilarCasesList";
import { SourceCitationList } from "@/components/workspace/SourceCitationList";
import { SuggestedReplyCard } from "@/components/workspace/SuggestedReplyCard";
import type { CopilotBundle } from "@/types/api";

export function CopilotPanel({
  bundle,
  conversationId,
  onSendReply,
}: {
  bundle: CopilotBundle;
  conversationId: string;
  onSendReply: (text: string) => void;
}) {
  return (
    <div className="space-y-4">
      {bundle.escalation_recommended && <EscalationBanner reason={bundle.escalation_reason} />}

      <SuggestedReplyCard
        reply={bundle.suggested_reply}
        confidence={bundle.confidence}
        usedLiveLlm={bundle.used_live_llm}
        conversationId={conversationId}
        onSend={onSendReply}
      />

      <CustomerSummaryCard summary={bundle.customer_summary} />

      <NextBestActionList actions={bundle.next_best_actions} />

      <ComplianceWarningBanner flags={bundle.compliance_flags} />

      <SourceCitationList
        title="Relevant SOPs"
        icon={FileCheck2}
        citations={bundle.relevant_sops}
        emptyLabel="No matching SOPs found."
      />

      <SourceCitationList
        title="Related Policies"
        icon={BookOpen}
        citations={bundle.related_policies}
        emptyLabel="No matching policies found."
      />

      <SimilarCasesList cases={bundle.similar_cases} />
    </div>
  );
}
