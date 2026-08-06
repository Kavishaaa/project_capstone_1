import { BookOpen, FileCheck2, FileQuestion, FileText, MessageSquareText, User, type LucideIcon } from "lucide-react";

import type { SourceType } from "@/types/api";

export const SOURCE_TYPE_ICON: Record<SourceType, LucideIcon> = {
  crm: User,
  policy: BookOpen,
  faq: FileQuestion,
  kb: FileText,
  sop: FileCheck2,
  ticket: MessageSquareText,
};

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  crm: "CRM Record",
  policy: "Policy Document",
  faq: "FAQ",
  kb: "Knowledge Base",
  sop: "SOP",
  ticket: "Historical Ticket",
};

export function SourceTypeIcon({ type, className }: { type: SourceType; className?: string }) {
  const Icon = SOURCE_TYPE_ICON[type];
  return <Icon className={className} />;
}
