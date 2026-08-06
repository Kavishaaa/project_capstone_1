"""LLM provider router.

Exposes a single `get_llm_engine()` used by every service. When Azure OpenAI
or OpenAI credentials are present in Settings, requests are routed to the
real model via LangChain chat models. Otherwise, the grounded MockLLM
simulator (app/services/llm_mock.py) is used so the whole product works
with zero configuration.
"""
from __future__ import annotations

from functools import lru_cache
from typing import Protocol

from app.config import get_settings
from app.services.llm_mock import MockLLM, get_mock_llm


class LLMEngine(Protocol):
    def generate_reply(self, customer_message: str, industry: str, sources: list[dict]) -> str: ...

    def generate_summary_fields(self, transcript_text: str, industry: str, sources: list[dict]) -> dict: ...

    def generate_crm_note(self, customer_name: str, industry: str, summary: dict) -> str: ...


class LiveLLM:
    """Thin adapter that gives a real LangChain chat model the same interface as MockLLM."""

    def __init__(self):
        settings = get_settings()
        if settings.has_azure_credentials:
            from langchain_openai import AzureChatOpenAI

            self._model = AzureChatOpenAI(
                azure_endpoint=settings.azure_openai_endpoint,
                api_key=settings.azure_openai_api_key,
                azure_deployment=settings.azure_openai_deployment,
                api_version=settings.azure_openai_api_version,
                temperature=0.3,
            )
        else:
            from langchain_openai import ChatOpenAI

            self._model = ChatOpenAI(
                api_key=settings.openai_api_key,
                model=settings.openai_model,
                temperature=0.3,
            )
        # Kept as a fallback for any field the live model omits or errors on.
        self._fallback = get_mock_llm()

    def _invoke(self, prompt: str) -> str:
        result = self._model.invoke(prompt)
        return getattr(result, "content", str(result)).strip()

    def generate_reply(self, customer_message: str, industry: str, sources: list[dict]) -> str:
        context = "\n".join(f"- ({s['source_type']}) {s['title']}: {s['snippet']}" for s in sources[:4])
        prompt = (
            "You are EXLSmartAssist, an enterprise customer support copilot for the "
            f"{industry} industry. Using ONLY the knowledge context below, draft a concise, "
            "empathetic, policy-grounded reply to the customer's message. Do not invent policy "
            "details not present in the context.\n\n"
            f"Knowledge context:\n{context}\n\n"
            f"Customer message: {customer_message}\n\nReply:"
        )
        try:
            return self._invoke(prompt)
        except Exception:
            return self._fallback.generate_reply(customer_message, industry, sources)

    def generate_summary_fields(self, transcript_text: str, industry: str, sources: list[dict]) -> dict:
        context = "\n".join(f"- {s['title']}: {s['snippet']}" for s in sources[:3])
        prompt = (
            f"Summarize this {industry} support transcript into exactly three short lines with these labels: "
            "CUSTOMER_ISSUE:, ROOT_CAUSE:, RESOLUTION:. Use the knowledge context to ground the root cause and "
            f"resolution when relevant.\n\nKnowledge context:\n{context}\n\nTranscript:\n{transcript_text}\n"
        )
        try:
            text = self._invoke(prompt)
            fields = {"customer_issue": "", "root_cause": "", "resolution": ""}
            for line in text.splitlines():
                for key, label in (
                    ("customer_issue", "CUSTOMER_ISSUE:"),
                    ("root_cause", "ROOT_CAUSE:"),
                    ("resolution", "RESOLUTION:"),
                ):
                    if line.strip().upper().startswith(label):
                        fields[key] = line.split(":", 1)[1].strip()
            if all(fields.values()):
                return fields
            raise ValueError("incomplete live summary")
        except Exception:
            return self._fallback.generate_summary_fields(transcript_text, industry, sources)

    def generate_crm_note(self, customer_name: str, industry: str, summary: dict) -> str:
        prompt = (
            f"Write a concise, professional CRM note (3-4 sentences) for a {industry} customer service "
            f"interaction with {customer_name}. Issue: {summary['customer_issue']}. "
            f"Root cause: {summary['root_cause']}. Resolution: {summary['resolution']}."
        )
        try:
            return self._invoke(prompt)
        except Exception:
            return self._fallback.generate_crm_note(customer_name, industry, summary)


@lru_cache
def get_llm_engine() -> LLMEngine:
    settings = get_settings()
    if settings.has_live_llm:
        try:
            return LiveLLM()
        except Exception:
            # If the live provider fails to initialize (bad key, missing package, etc.),
            # gracefully fall back so the product never hard-fails on the AI layer.
            return get_mock_llm()
    return get_mock_llm()


def is_using_live_llm() -> bool:
    return isinstance(get_llm_engine(), LiveLLM)
