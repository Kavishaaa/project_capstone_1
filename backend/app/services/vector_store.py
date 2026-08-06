"""ChromaDB-backed vector store for the enterprise knowledge base.

A single Chroma collection ("enterprise_knowledge") holds embedded text from
every source type (CRM notes, tickets, KB articles, FAQs, policies, SOPs)
tagged with metadata (industry, source_type, title) so retrieval can filter
by either dimension. Embeddings are produced locally via sentence-transformers,
so building and querying the index needs no external API calls or keys.
"""
from __future__ import annotations

import chromadb
from chromadb.utils import embedding_functions

from app.config import get_settings

_client = None
_collection = None
_COLLECTION_NAME = "enterprise_knowledge"


def get_client():
    global _client
    if _client is None:
        settings = get_settings()
        _client = chromadb.PersistentClient(path=settings.vector_db_path)
    return _client


def get_embedding_function():
    settings = get_settings()
    return embedding_functions.SentenceTransformerEmbeddingFunction(model_name=settings.embedding_model)


def get_collection():
    global _collection
    if _collection is None:
        _collection = get_client().get_or_create_collection(
            name=_COLLECTION_NAME,
            embedding_function=get_embedding_function(),
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def is_empty() -> bool:
    return get_collection().count() == 0


def add_documents(ids: list[str], texts: list[str], metadatas: list[dict]) -> None:
    """Embed and upsert documents. Upsert (vs add) keeps startup idempotent."""
    if not ids:
        return
    get_collection().upsert(ids=ids, documents=texts, metadatas=metadatas)


def query(
    query_text: str,
    top_k: int = 8,
    industry: str | None = None,
    source_types: list[str] | None = None,
) -> list[dict]:
    """Similarity search with optional metadata filtering.

    Returns dicts: {id, title, source_type, industry, snippet, relevance_score}
    """
    collection = get_collection()

    conditions = []
    if industry:
        conditions.append({"industry": industry})
    if source_types:
        conditions.append({"source_type": {"$in": source_types}})

    where = None
    if len(conditions) == 1:
        where = conditions[0]
    elif len(conditions) > 1:
        where = {"$and": conditions}

    results = collection.query(query_texts=[query_text], n_results=top_k, where=where)

    output = []
    ids = results.get("ids", [[]])[0]
    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    dists = results.get("distances", [[]])[0]
    for doc_id, doc_text, meta, dist in zip(ids, docs, metas, dists):
        # hnsw cosine distance is in [0, 2]; convert to an approximate [0, 1] similarity score.
        score = max(0.0, min(1.0, 1.0 - dist))
        output.append(
            {
                "id": meta.get("original_id", doc_id),
                "title": meta.get("title", "Untitled"),
                "source_type": meta.get("source_type", "unknown"),
                "industry": meta.get("industry", "General"),
                "snippet": doc_text[:400],
                "relevance_score": round(score, 3),
            }
        )
    return output
