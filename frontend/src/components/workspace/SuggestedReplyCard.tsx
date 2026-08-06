import * as React from "react";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackButtons } from "@/components/workspace/FeedbackButtons";

export function SuggestedReplyCard({
  reply,
  confidence,
  usedLiveLlm,
  conversationId,
  onSend,
}: {
  reply: string;
  confidence: number;
  usedLiveLlm: boolean;
  conversationId: string;
  onSend: (text: string) => void;
}) {
  const [draft, setDraft] = React.useState(reply);

  React.useEffect(() => setDraft(reply), [reply]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          Suggested Reply
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={usedLiveLlm ? "accent" : "secondary"}>{usedLiveLlm ? "Live AI" : "Mock AI"}</Badge>
          <Badge variant="outline">{Math.round(confidence * 100)}% confidence</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-input bg-transparent p-2.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <div className="flex items-center justify-between">
          <FeedbackButtons suggestionType="suggested_reply" conversationId={conversationId} />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setDraft(reply)}>
              Reset
            </Button>
            <Button size="sm" onClick={() => onSend(draft)}>
              Send to Customer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
