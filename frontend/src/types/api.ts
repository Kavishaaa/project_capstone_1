/**
 * TypeScript mirrors of backend Pydantic schemas (backend/app/schemas/*.py).
 * Keep these in sync manually — there is no codegen step in this project.
 */

export type Industry =
  | "Insurance"
  | "Banking"
  | "Healthcare"
  | "Retail"
  | "Travel"
  | "Utilities"
  | "Telecom";

export type SourceType = "crm" | "policy" | "faq" | "kb" | "sop" | "ticket";

export interface ChatTurn {
  sender: "customer" | "agent" | "ai";
  text: string;
}

export interface SourceCitation {
  id: string;
  title: string;
  source_type: SourceType;
  snippet: string;
  relevance_score: number;
}

export interface ChatResponse {
  suggested_reply: string;
  confidence: number;
  tone: string;
  sources: SourceCitation[];
  used_live_llm: boolean;
}

export interface SummarizeResponse {
  customer_issue: string;
  root_cause: string;
  actions_performed: string[];
  resolution: string;
  follow_up: string;
  sentiment: string;
  crm_note: string;
}

export interface NextBestAction {
  action: string;
  rationale: string;
  priority: "High" | "Medium" | "Low";
}

export interface NextActionResponse {
  actions: NextBestAction[];
  escalation_recommended: boolean;
  escalation_reason: string;
}

export interface KnowledgeResult {
  id: string;
  title: string;
  source_type: SourceType;
  industry: string;
  snippet: string;
  relevance_score: number;
}

export interface KnowledgeSearchResponse {
  results: KnowledgeResult[];
  total: number;
}

export interface CrmNoteResponse {
  note_text: string;
  category: string;
  disposition: string;
}

export interface ComplianceFlag {
  rule: string;
  severity: "High" | "Medium" | "Low";
  explanation: string;
  matched_policy: string | null;
}

export interface ComplianceCheckResponse {
  passed: boolean;
  risk_level: "Low" | "Medium" | "High";
  flags: ComplianceFlag[];
  matched_policies: string[];
}

export interface KpiSnapshot {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
}

export interface ActiveConversationSummary {
  id: string;
  customer_name: string;
  industry: string;
  subject: string;
  status: string;
  agent_name: string;
  last_message_preview: string;
}

export interface RecentSummaryItem {
  conversation_id: string;
  customer_name: string;
  customer_issue: string;
  resolution: string;
  created_at: string;
}

export interface PendingAction {
  id: string;
  description: string;
  priority: string;
  related_conversation_id: string | null;
}

export interface AiInsight {
  title: string;
  detail: string;
  category: "trend" | "risk" | "opportunity";
}

export interface DashboardResponse {
  kpis: KpiSnapshot[];
  active_conversations: ActiveConversationSummary[];
  recent_summaries: RecentSummaryItem[];
  pending_actions: PendingAction[];
  ai_insights: AiInsight[];
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface TopPolicy {
  title: string;
  industry: string;
  search_count: number;
}

export interface AgentProductivityRow {
  agent_name: string;
  tickets_resolved: number;
  avg_handle_time_minutes: number;
  avg_csat: number;
  fcr_rate: number;
}

export interface AnalyticsResponse {
  aht_trend: TrendPoint[];
  csat_trend: TrendPoint[];
  fcr_trend: TrendPoint[];
  top_policies: TopPolicy[];
  agent_productivity: AgentProductivityRow[];
}

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  role: "Agent" | "Supervisor" | "Admin";
  email: string;
  avatar_initials: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface DemoUser {
  username: string;
  password: string;
  display_name: string;
  role: string;
}

export interface MessageOut {
  id: string;
  sender: string;
  text: string;
  created_at: string;
}

export interface ConversationOut {
  id: string;
  customer_id: string;
  customer_name: string;
  industry: string;
  subject: string;
  status: string;
  agent_name: string;
  started_at: string;
  messages: MessageOut[];
}

export interface ConversationListItem {
  id: string;
  customer_name: string;
  industry: string;
  subject: string;
  status: string;
  agent_name: string;
  last_message_preview: string;
}

export interface SimilarCase {
  ticket_id: string;
  subject: string;
  resolution: string;
  industry: string;
  relevance_score: number;
}

export interface CopilotBundle {
  suggested_reply: string;
  confidence: number;
  customer_summary: string;
  next_best_actions: NextBestAction[];
  escalation_recommended: boolean;
  escalation_reason: string;
  relevant_sops: SourceCitation[];
  related_policies: SourceCitation[];
  compliance_flags: ComplianceFlag[];
  similar_cases: SimilarCase[];
  used_live_llm: boolean;
}
