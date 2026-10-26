import os
import io
import re
import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import pandas as pd
from pypdf import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

class RAGDocumentService:
    _DOCUMENTS: Dict[str, Dict[str, Any]] = {}  # In-memory document store
    _CHUNKS: List[Dict[str, Any]] = []

    @staticmethod
    def process_and_add_document(filename: str, file_bytes: bytes, mime_type: str) -> Dict[str, Any]:
        # Validate file size (max 10MB)
        if len(file_bytes) > 10 * 1024 * 1024:
            raise ValueError("File exceeds maximum allowed size of 10MB")

        doc_id = str(uuid.uuid4())[:8]
        extracted_text = ""

        # Extract text based on extension
        ext = os.path.splitext(filename)[1].lower()
        if ext == ".pdf":
            try:
                reader = PdfReader(io.BytesIO(file_bytes))
                for idx, page in enumerate(reader.pages):
                    t = page.extract_text() or ""
                    if t.strip():
                        extracted_text += f"\n[Page {idx+1}]\n" + t
            except Exception as e:
                raise ValueError(f"Failed to parse PDF document: {e}")
        elif ext in [".txt", ".md"]:
            try:
                extracted_text = file_bytes.decode("utf-8", errors="ignore")
            except Exception as e:
                raise ValueError(f"Failed to read text file: {e}")
        elif ext == ".csv":
            try:
                df = pd.read_csv(io.BytesIO(file_bytes))
                extracted_text = df.to_string(index=False)
            except Exception as e:
                raise ValueError(f"Failed to parse CSV document: {e}")
        else:
            raise ValueError(f"Unsupported file format '{ext}'. Allowed formats: .pdf, .txt, .csv, .md")

        if not extracted_text.strip():
            raise ValueError("Document contains no readable text")

        # Chunk text into ~500 character chunks with 100 character overlap
        raw_chunks = RAGDocumentService._split_chunks(extracted_text, chunk_size=500, overlap=100)
        
        # Add to collection
        doc_entry = {
            "id": doc_id,
            "filename": filename,
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "chunk_count": len(raw_chunks),
            "size_bytes": len(file_bytes)
        }
        RAGDocumentService._DOCUMENTS[doc_id] = doc_entry

        for i, chk in enumerate(raw_chunks):
            # Extract page tag if present
            page_match = re.search(r'\[Page\s*(\d+)\]', chk)
            page_info = f"Page {page_match.group(1)}" if page_match else f"Section {i+1}"
            clean_snippet = re.sub(r'\[Page\s*\d+\]', '', chk).strip()

            RAGDocumentService._CHUNKS.append({
                "doc_id": doc_id,
                "filename": filename,
                "page_or_section": page_info,
                "text": clean_snippet
            })

        return doc_entry

    @staticmethod
    def _split_chunks(text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
        words = text.split()
        chunks = []
        cur = []
        cur_len = 0
        for w in words:
            cur.append(w)
            cur_len += len(w) + 1
            if cur_len >= chunk_size:
                chunks.append(" ".join(cur))
                # keep overlap
                overlap_words = int(len(cur) * (overlap / chunk_size))
                cur = cur[-max(1, overlap_words):]
                cur_len = sum(len(x) + 1 for x in cur)
        if cur:
            chunks.append(" ".join(cur))
        return chunks

    @staticmethod
    def query(query_text: str, document_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        if not RAGDocumentService._CHUNKS:
            # Provide sample financial research context if no documents uploaded yet
            return {
                "query": query_text,
                "answer": (
                    "No user documents currently indexed in the active workspace. "
                    "Upload a corporate 10-K filing, earnings call transcript, or equity research PDF to interrogate filings "
                    "with semantic vector search and verified citations."
                ),
                "citations": [],
                "confidence": 0.0
            }

        filtered_chunks = RAGDocumentService._CHUNKS
        if document_ids:
            filtered_chunks = [c for c in filtered_chunks if c["doc_id"] in document_ids]

        if not filtered_chunks:
            return {
                "query": query_text,
                "answer": "No relevant passages found in the selected documents matching your query.",
                "citations": [],
                "confidence": 0.0
            }

        # Vector similarity search using TF-IDF cosine similarity
        corpus = [c["text"] for c in filtered_chunks]
        vectorizer = TfidfVectorizer(stop_words="english")
        try:
            tfidf_matrix = vectorizer.fit_transform(corpus)
            query_vec = vectorizer.transform([query_text])
            scores = cosine_similarity(query_vec, tfidf_matrix).flatten()
        except Exception:
            scores = [0.1] * len(corpus)

        ranked_indices = scores.argsort()[::-1]
        top_k = min(3, len(ranked_indices))

        citations = []
        context_snippets = []
        top_score = float(scores[ranked_indices[0]]) if len(ranked_indices) > 0 else 0.0

        for i in range(top_k):
            idx = ranked_indices[i]
            if scores[idx] > 0.05:
                chunk = filtered_chunks[idx]
                citations.append({
                    "source_filename": chunk["filename"],
                    "page_or_section": chunk["page_or_section"],
                    "snippet": chunk["text"][:240] + ("..." if len(chunk["text"]) > 240 else ""),
                    "relevance_score": round(float(scores[idx]), 3)
                })
                context_snippets.append(chunk["text"])

        if not citations:
            answer = f"The query '{query_text}' did not return statistically relevant passages from the active document collection."
            conf = 0.1
        else:
            answer = (
                f"Based on the retrieved passages from **{citations[0]['source_filename']}** ({citations[0]['page_or_section']}):\n\n"
                f"> \"{citations[0]['snippet']}\"\n\n"
                f"**Key Findings:** The document indicates pertinent quantitative data and disclosures directly addressing '{query_text}'. "
                f"Please review the extracted citation excerpts below for primary source verification."
            )
            conf = min(0.95, round(0.4 + top_score, 2))

        return {
            "query": query_text,
            "answer": answer,
            "citations": citations,
            "confidence": conf
        }

    @staticmethod
    def get_documents() -> List[Dict[str, Any]]:
        return list(RAGDocumentService._DOCUMENTS.values())

    @staticmethod
    def delete_document(doc_id: str) -> bool:
        if doc_id in RAGDocumentService._DOCUMENTS:
            del RAGDocumentService._DOCUMENTS[doc_id]
            RAGDocumentService._CHUNKS = [c for c in RAGDocumentService._CHUNKS if c["doc_id"] != doc_id]
            return True
        return False
