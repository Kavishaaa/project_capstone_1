"""Load seed JSON files into PostgreSQL.

Idempotent: checks for existing customer rows before inserting, so this can
safely run on every container startup without duplicating data.
"""
from __future__ import annotations

import json
import random
from datetime import datetime
from pathlib import Path

from app import database
from app.models.analytics import AgentProductivity
from app.models.conversation import Conversation, Message
from app.models.crm import Customer, Ticket
from app.models.knowledge import KnowledgeArticle

SEED_DIR = Path(__file__).resolve().parent.parent / "data" / "seed"

AGENT_NAMES = ["Priya Sharma", "Daniel Osei", "Wei Chen", "Sofia Marino", "James Whitfield"]


def _parse_dt(value: str) -> datetime:
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return datetime.utcnow()


def load_seed_files() -> list[dict]:
    return [json.loads(p.read_text()) for p in sorted(SEED_DIR.glob("*.json"))]


def seed_database() -> None:
    database.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    try:
        if db.query(Customer).count() > 0:
            print("[seed_db] Database already seeded, skipping.")
            return

        datasets = load_seed_files()
        for data in datasets:
            industry = data["industry"]

            for c in data.get("customers", []):
                db.add(
                    Customer(
                        id=c["id"],
                        name=c["name"],
                        industry=industry,
                        email=c["email"],
                        phone=c["phone"],
                        account_number=c["account_number"],
                        policy_or_account_type=c["policy_or_account_type"],
                        tier=c.get("tier", "Standard"),
                        since=c["since"],
                        notes=c.get("notes", ""),
                    )
                )

            for t in data.get("tickets", []):
                db.add(
                    Ticket(
                        id=t["id"],
                        customer_id=t["customer_id"],
                        industry=industry,
                        subject=t["subject"],
                        description=t["description"],
                        resolution=t.get("resolution", ""),
                        status=t.get("status", "Resolved"),
                        priority=t.get("priority", "Medium"),
                        channel=t.get("channel", "Phone"),
                        agent_name=t.get("agent_name", "Unassigned"),
                        handle_time_minutes=t.get("handle_time_minutes", 0),
                        csat_score=t.get("csat_score", 0),
                        first_contact_resolution=t.get("first_contact_resolution", True),
                        created_at=_parse_dt(t.get("created_at", "")),
                    )
                )

            for conv in data.get("transcripts", []):
                db.add(
                    Conversation(
                        id=conv["id"],
                        customer_id=conv["customer_id"],
                        industry=industry,
                        subject=conv["subject"],
                        status=conv.get("status", "Active"),
                        agent_name=conv.get("agent_name", random.choice(AGENT_NAMES)),
                    )
                )
                for i, turn in enumerate(conv.get("turns", [])):
                    db.add(
                        Message(
                            id=f"{conv['id']}-MSG-{i:03d}",
                            conversation_id=conv["id"],
                            sender=turn["sender"],
                            text=turn["text"],
                        )
                    )

            for section in ("kb_articles", "faqs", "policies", "sops"):
                for item in data.get(section, []):
                    db.add(
                        KnowledgeArticle(
                            id=item["id"],
                            industry=industry,
                            source_type=item["source_type"],
                            title=item["title"],
                            content=item["content"],
                            tags=item.get("tags", ""),
                        )
                    )

        for name in AGENT_NAMES:
            db.add(
                AgentProductivity(
                    id=f"PROD-{name.replace(' ', '-').upper()}",
                    agent_name=name,
                    tickets_resolved=random.randint(38, 96),
                    avg_handle_time_minutes=round(random.uniform(6.5, 15.5), 1),
                    avg_csat=round(random.uniform(3.8, 4.9), 2),
                    fcr_rate=round(random.uniform(68.0, 94.0), 1),
                )
            )

        db.commit()
        print(f"[seed_db] Seeded {len(datasets)} industry datasets successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
