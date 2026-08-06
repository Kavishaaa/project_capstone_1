"""Build the Chroma vector index from seed JSON files.

Idempotent: skips embedding work entirely if the collection is already
populated, so container restarts don't re-embed everything every time.
"""
from __future__ import annotations

import json
from pathlib import Path

from app.services import vector_store

SEED_DIR = Path(__file__).resolve().parent.parent / "data" / "seed"


def _doc_text(item: dict) -> str:
    return f"{item['title']}\n{item['content']}"


def build_index() -> None:
    if not vector_store.is_empty():
        print("[build_vector_index] Vector store already populated, skipping.")
        return

    ids, texts, metadatas = [], [], []

    for path in sorted(SEED_DIR.glob("*.json")):
        data = json.loads(path.read_text())
        industry = data["industry"]

        for c in data.get("customers", []):
            doc_id = f"vec-{c['id']}"
            ids.append(doc_id)
            texts.append(
                f"Customer {c['name']} — {c['policy_or_account_type']}. Notes: {c.get('notes', '')}"
            )
            metadatas.append(
                {
                    "original_id": c["id"],
                    "title": f"CRM Record: {c['name']}",
                    "source_type": "crm",
                    "industry": industry,
                }
            )

        for t in data.get("tickets", []):
            doc_id = f"vec-{t['id']}"
            ids.append(doc_id)
            texts.append(f"{t['subject']}\n{t['description']}\nResolution: {t.get('resolution', '')}")
            metadatas.append(
                {
                    "original_id": t["id"],
                    "title": t["subject"],
                    "source_type": "ticket",
                    "industry": industry,
                }
            )

        for section in ("kb_articles", "faqs", "policies", "sops"):
            for item in data.get(section, []):
                doc_id = f"vec-{item['id']}"
                ids.append(doc_id)
                texts.append(_doc_text(item))
                metadatas.append(
                    {
                        "original_id": item["id"],
                        "title": item["title"],
                        "source_type": item["source_type"],
                        "industry": industry,
                    }
                )

    vector_store.add_documents(ids=ids, texts=texts, metadatas=metadatas)
    print(f"[build_vector_index] Indexed {len(ids)} documents across all industries.")


if __name__ == "__main__":
    build_index()
