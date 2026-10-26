from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any
from app.services.rag import RAGDocumentService
from app.schemas.domain import RAGQueryRequest, RAGQueryResponse

router = APIRouter(prefix="/api/v1/rag", tags=["RAG Document Research"])

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        content = await file.read()
        doc_entry = RAGDocumentService.process_and_add_document(
            filename=file.filename or "uploaded_document",
            file_bytes=content,
            mime_type=file.content_type or "application/octet-stream"
        )
        return {"status": "success", "document": doc_entry}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/documents")
def list_documents() -> List[Dict[str, Any]]:
    return RAGDocumentService.get_documents()

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str):
    success = RAGDocumentService.delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": "success", "deleted_id": doc_id}

@router.post("/query", response_model=RAGQueryResponse)
def query_documents(req: RAGQueryRequest):
    data = RAGDocumentService.query(query_text=req.query, document_ids=req.document_ids)
    return RAGQueryResponse(**data)
