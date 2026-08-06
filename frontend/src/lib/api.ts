/**
 * Typed fetch client for the EXLSmartAssist backend. Every backend endpoint
 * has a corresponding function here so pages never construct raw fetch
 * calls — keeps error handling and the base URL centralized.
 */
import type {
  AnalyticsResponse,
  ChatResponse,
  ChatTurn,
  ComplianceCheckResponse,
  ConversationListItem,
  ConversationOut,
  CopilotBundle,
  CrmNoteResponse,
  DashboardResponse,
  DemoUser,
  KnowledgeSearchResponse,
  LoginResponse,
  NextActionResponse,
  SummarizeResponse,
} from "@/types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ApiError(response.status, body || `Request to ${path} failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// --- Auth ---------------------------------------------------------------
export const login = (username: string, password: string) =>
  request<LoginResponse>("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });

export const listDemoUsers = () => request<DemoUser[]>("/api/auth/demo-users");

// --- Chat / Copilot ------------------------------------------------------
export const sendChatMessage = (industry: string, customerMessage: string, history: ChatTurn[]) =>
  request<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ industry, customer_message: customerMessage, history }),
  });

export const summarizeTranscript = (industry: string, transcript: ChatTurn[]) =>
  request<SummarizeResponse>("/api/summarize", {
    method: "POST",
    body: JSON.stringify({ industry, transcript }),
  });

export const getNextActions = (industry: string, transcript: ChatTurn[]) =>
  request<NextActionResponse>("/api/next-action", {
    method: "POST",
    body: JSON.stringify({ industry, transcript }),
  });

export const generateCrmNote = (industry: string, customerName: string, transcript: ChatTurn[]) =>
  request<CrmNoteResponse>("/api/crm-note", {
    method: "POST",
    body: JSON.stringify({ industry, customer_name: customerName, transcript }),
  });

export const checkCompliance = (industry: string, draftResponse: string) =>
  request<ComplianceCheckResponse>("/api/compliance-check", {
    method: "POST",
    body: JSON.stringify({ industry, draft_response: draftResponse }),
  });

// --- Knowledge Search -----------------------------------------------------
export const searchKnowledge = (query: string, industry?: string, sourceType?: string, topK = 8) =>
  request<KnowledgeSearchResponse>("/api/knowledge-search", {
    method: "POST",
    body: JSON.stringify({ query, industry: industry || null, source_type: sourceType || null, top_k: topK }),
  });

export const uploadPolicyDocument = async (industry: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(
    `${BASE_URL}/api/knowledge-search/upload-policy?industry=${encodeURIComponent(industry)}`,
    { method: "POST", body: formData },
  );
  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }
  return response.json();
};

// --- Dashboard / Analytics -------------------------------------------------
export const getDashboard = () => request<DashboardResponse>("/api/dashboard");
export const getAnalytics = () => request<AnalyticsResponse>("/api/analytics");

// --- Conversations / Copilot bundle -----------------------------------------
export const listConversations = () => request<ConversationListItem[]>("/api/conversations");
export const getConversation = (id: string) => request<ConversationOut>(`/api/conversations/${id}`);
export const getCopilotBundle = (id: string) => request<CopilotBundle>(`/api/conversations/${id}/copilot`);

export const submitFeedback = (suggestionType: string, rating: "up" | "down", conversationId?: string, comment = "") =>
  request<{ status: string }>("/api/feedback", {
    method: "POST",
    body: JSON.stringify({ suggestion_type: suggestionType, rating, conversation_id: conversationId, comment }),
  });
