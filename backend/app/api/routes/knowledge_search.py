"""POST /knowledge-search — enterprise knowledge search via RAG.

Also hosts POST /knowledge-search/upload-policy, a bonus feature that lets an
Admin/Supervisor upload a PDF policy document, extracts its text, and embeds
it into the same vector store so it becomes immediately searchable/citable.
"""
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pypdf import PdfReader
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.knowledge import KnowledgeResult, KnowledgeSearchRequest, KnowledgeSearchResponse
from app.services import rag_pipeline, vector_store
from app.services.analytics_service import log_search

router = APIRouter(tags=["knowledge-search"])


@router.post("/knowledge-search", response_model=KnowledgeSearchResponse)
def knowledge_search(request: KnowledgeSearchRequest, db: Session = Depends(get_db)):
    results = rag_pipeline.search_knowledge(
        request.query, request.industry, request.source_type, top_k=request.top_k
    )
    log_search(db, request.query, request.industry or "", request.source_type or "", results[0] if results else None)
    return KnowledgeSearchResponse(
        results=[KnowledgeResult(**r) for r in results],
        total=len(results),
    )


@router.post("/knowledge-search/upload-policy")
async def upload_policy_document(industry: str, file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    reader = PdfReader(file.file)
    text = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
    if not text:
        raise HTTPException(status_code=422, detail="Could not extract any text from the uploaded PDF.")

    doc_id = f"UPLOAD-{uuid.uuid4().hex[:10]}"
    title = file.filename.rsplit(".", 1)[0]
    vector_store.add_documents(
        ids=[doc_id],
        texts=[text[:6000]],
        metadatas=[
            {
                "original_id": doc_id,
                "title": title,
                "source_type": "policy",
                "industry": industry,
            }
        ],
    )
    return {"status": "indexed", "id": doc_id, "title": title, "characters_indexed": len(text[:6000])}
