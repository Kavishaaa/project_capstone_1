import * as React from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { submitFeedback } from "@/lib/api";
import { cn } from "@/lib/utils";

export function FeedbackButtons({ suggestionType, conversationId }: { suggestionType: string; conversationId: string }) {
  const [rated, setRated] = React.useState<"up" | "down" | null>(null);
  const { showToast } = useToast();

  const rate = async (rating: "up" | "down") => {
    setRated(rating);
    try {
      await submitFeedback(suggestionType, rating, conversationId);
      showToast({ title: "Thanks for the feedback", variant: "success" });
    } catch {
      showToast({ title: "Could not submit feedback", variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("h-7 w-7", rated === "up" && "text-success")}
        onClick={() => rate("up")}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("h-7 w-7", rated === "down" && "text-destructive")}
        onClick={() => rate("down")}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
