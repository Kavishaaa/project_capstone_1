import * as React from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { ConversationList } from "@/components/workspace/ConversationList";
import { CopilotPanel } from "@/components/workspace/CopilotPanel";
import { CrmNotePanel } from "@/components/workspace/CrmNotePanel";
import { MessageBubble } from "@/components/workspace/MessageBubble";
import { VoiceInputButton } from "@/components/workspace/VoiceInputButton";
import {
  generateCrmNote,
  getConversation,
  getCopilotBundle,
  listConversations,
  summarizeTranscript,
} from "@/lib/api";
import type {
  ChatTurn,
  ConversationListItem,
  ConversationOut,
  CopilotBundle,
  CrmNoteResponse,
  MessageOut,
  SummarizeResponse,
} from "@/types/api";

function toChatTurns(messages: MessageOut[]): ChatTurn[] {
  return messages.map((m) => ({ sender: m.sender as ChatTurn["sender"], text: m.text }));
}

export default function WorkspacePage() {
  const location = useLocation();
  const { showToast } = useToast();

  const [conversations, setConversations] = React.useState<ConversationListItem[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(
    (location.state as { conversationId?: string })?.conversationId ?? null,
  );
  const [conversation, setConversation] = React.useState<ConversationOut | null>(null);
  const [bundle, setBundle] = React.useState<CopilotBundle | null>(null);
  const [loadingConversation, setLoadingConversation] = React.useState(false);
  const [draftMessage, setDraftMessage] = React.useState("");

  const [summary, setSummary] = React.useState<SummarizeResponse | null>(null);
  const [crmNote, setCrmNote] = React.useState<CrmNoteResponse | null>(null);
  const [generatingSummary, setGeneratingSummary] = React.useState(false);

  React.useEffect(() => {
    listConversations()
      .then((list) => {
        setConversations(list);
        if (!selectedId && list.length > 0) {
          setSelectedId(list[0].id);
        }
      })
      .catch(() => showToast({ title: "Failed to load conversations", variant: "destructive" }));
  }, [selectedId, showToast]);

  React.useEffect(() => {
    if (!selectedId) return;
    setLoadingConversation(true);
    setSummary(null);
    setCrmNote(null);
    Promise.all([getConversation(selectedId), getCopilotBundle(selectedId)])
      .then(([conv, copilot]) => {
        setConversation(conv);
        setBundle(copilot);
      })
      .catch(() => showToast({ title: "Failed to load conversation", variant: "destructive" }))
      .finally(() => setLoadingConversation(false));
  }, [selectedId, showToast]);

  const handleSendReply = (text: string) => {
    if (!conversation) return;
    setConversation({
      ...conversation,
      messages: [
        ...conversation.messages,
        { id: crypto.randomUUID(), sender: "agent", text, created_at: new Date().toISOString() },
      ],
    });
    showToast({ title: "Reply sent to customer", variant: "success" });
  };

  const handleSendDraft = () => {
    if (!draftMessage.trim() || !conversation) return;
    setConversation({
      ...conversation,
      messages: [
        ...conversation.messages,
        { id: crypto.randomUUID(), sender: "agent", text: draftMessage.trim(), created_at: new Date().toISOString() },
      ],
    });
    setDraftMessage("");
  };

  const handleGenerateSummary = async () => {
    if (!conversation) return;
    setGeneratingSummary(true);
    try {
      const transcript = toChatTurns(conversation.messages);
      const [summaryResult, noteResult] = await Promise.all([
        summarizeTranscript(conversation.industry, transcript),
        generateCrmNote(conversation.industry, conversation.customer_name, transcript),
      ]);
      setSummary(summaryResult);
      setCrmNote(noteResult);
    } catch {
      showToast({ title: "Failed to generate summary", variant: "destructive" });
    } finally {
      setGeneratingSummary(false);
    }
  };

  return (
    <div className="grid h-[calc(100vh-7rem)] grid-cols-1 gap-4 lg:grid-cols-[260px_1fr_420px]">
      <Card className="overflow-hidden">
        <ConversationList conversations={conversations} selectedId={selectedId} onSelect={setSelectedId} />
      </Card>

      <Card className="flex flex-col overflow-hidden">
        {loadingConversation || !conversation ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            <div className="border-b p-4">
              <p className="font-semibold">{conversation.customer_name}</p>
              <p className="text-xs text-muted-foreground">
                {conversation.subject} · {conversation.industry} · Agent: {conversation.agent_name}
              </p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {conversation.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
            <div className="flex items-center gap-2 border-t p-3">
              <VoiceInputButton onTranscript={(text) => setDraftMessage((prev) => (prev ? `${prev} ${text}` : text))} />
              <Input
                placeholder="Type a message..."
                value={draftMessage}
                onChange={(e) => setDraftMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendDraft()}
              />
              <Button size="icon" onClick={handleSendDraft}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </Card>

      <div className="overflow-y-auto pr-1">
        {loadingConversation || !bundle || !conversation ? (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Tabs defaultValue="copilot">
              <TabsList className="mb-3 w-full">
                <TabsTrigger value="copilot" className="flex-1">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Copilot
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex-1">
                  Summary &amp; CRM Note
                </TabsTrigger>
              </TabsList>

              <TabsContent value="copilot">
                <CopilotPanel bundle={bundle} conversationId={conversation.id} onSendReply={handleSendReply} />
              </TabsContent>

              <TabsContent value="summary" className="space-y-3">
                {!summary || !crmNote ? (
                  <div className="rounded-md border p-4 text-center">
                    <p className="mb-3 text-sm text-muted-foreground">
                      Generate a structured call summary and CRM note from this conversation.
                    </p>
                    <Button onClick={handleGenerateSummary} disabled={generatingSummary}>
                      {generatingSummary ? "Generating..." : "Generate Summary"}
                    </Button>
                  </div>
                ) : (
                  <CrmNotePanel summary={summary} crmNote={crmNote} customerName={conversation.customer_name} />
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </div>
  );
}
