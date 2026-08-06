import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ConversationListItem } from "@/types/api";

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: ConversationListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={cn(
            "flex flex-col gap-1 border-b p-3 text-left text-sm transition-colors hover:bg-secondary",
            selectedId === conv.id && "bg-primary/10 hover:bg-primary/15",
          )}
        >
          <div className="flex items-center justify-between">
            <p className="font-medium">{conv.customer_name}</p>
            <Badge variant="outline" className="text-[10px]">
              {conv.industry}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">{conv.subject}</p>
          <p className="truncate text-[11px] text-muted-foreground/80">{conv.last_message_preview}</p>
        </button>
      ))}
    </div>
  );
}
