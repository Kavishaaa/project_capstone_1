import { Bot, Headset, User } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MessageOut } from "@/types/api";

const SENDER_STYLE: Record<string, { bubble: string; icon: typeof User; align: string }> = {
  customer: { bubble: "bg-secondary text-secondary-foreground", icon: User, align: "justify-start" },
  agent: { bubble: "bg-primary text-primary-foreground", icon: Headset, align: "justify-end" },
  ai: { bubble: "bg-accent/10 text-foreground border border-accent/30", icon: Bot, align: "justify-end" },
};

export function MessageBubble({ message }: { message: MessageOut }) {
  const style = SENDER_STYLE[message.sender] ?? SENDER_STYLE.customer;
  const Icon = style.icon;

  return (
    <div className={cn("flex items-end gap-2", style.align)}>
      {message.sender === "customer" && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className={cn("max-w-[70%] rounded-lg px-3.5 py-2 text-sm shadow-sm", style.bubble)}>
        <p>{message.text}</p>
      </div>
      {message.sender !== "customer" && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
