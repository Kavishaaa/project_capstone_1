import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActiveConversationSummary } from "@/types/api";

export function ActiveConversationsList({ conversations }: { conversations: ActiveConversationSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          Active Conversations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {conversations.length === 0 && <p className="text-sm text-muted-foreground">No active conversations.</p>}
        {conversations.map((conv) => (
          <Link
            key={conv.id}
            to="/workspace"
            state={{ conversationId: conv.id }}
            className="block rounded-md border p-3 text-sm transition-colors hover:bg-secondary"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{conv.customer_name}</p>
              <Badge variant="outline">{conv.industry}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{conv.subject}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground/80">{conv.last_message_preview}</p>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{conv.agent_name}</span>
              <Badge variant="secondary">{conv.status}</Badge>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
