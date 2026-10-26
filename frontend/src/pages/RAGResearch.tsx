import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Upload,
  Search,
  FileText,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Quote,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api/client';
import { RAGQueryResponse } from '../types';

export const RAGResearch: React.FC = () => {
  const [documents, setDocuments] = useState<Array<{ id: string; filename: string; uploaded_at: string; chunk_count: number; size_bytes: number }>>([]);
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<RAGQueryResponse | null>(null);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const fetchDocs = () => {
    api.getRAGDocuments()
      .then(setDocuments)
      .catch(() => setDocuments([]));
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage(null);
    try {
      await api.uploadDocument(file);
      setUploadMessage(`Successfully parsed and embedded "${file.name}"`);
      fetchDocs();
    } catch (err: any) {
      setUploadMessage(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await api.deleteRAGDocument(docId);
      fetchDocs();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || searching) return;

    setSearching(true);
    try {
      const res = await api.queryRAG(query.trim());
      setQueryResult(res);
    } catch (err: any) {
      alert(`Query failed: ${err.message}`);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
        <div className="flex items-center space-x-2.5 mb-1">
          <span className="p-1.5 rounded-lg gradient-ai text-white">
            <BookOpen className="w-4 h-4" />
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight">
            RAG Financial Document Research & Vector Retrieval
          </h1>
        </div>
        <p className="text-xs text-gray-400">
          Upload 10-K SEC filings, earnings transcripts, or equity research notes (.pdf, .txt, .csv) to interrogate document evidence with verifiable source citations.
        </p>

        {/* Upload Zone */}
        <div className="mt-5 pt-4 border-t border-[#1f2937]">
          <label className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-dashed border-[#374151] hover:border-indigo-500 bg-[#0b0f19] cursor-pointer transition-colors">
            <div className="flex items-center space-x-3 mb-2 sm:mb-0">
              <Upload className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-xs font-bold text-white">Upload Financial Filing / Transcript</span>
                <span className="text-[11px] text-gray-400 block">Supported formats: PDF, TXT, CSV (Max 10MB)</span>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold self-start sm:self-auto">
              {uploading ? 'Processing & Embedding...' : 'Choose File'}
            </span>
            <input type="file" accept=".pdf,.txt,.csv,.md" onChange={handleFileUpload} className="hidden" disabled={uploading} />
          </label>

          {uploadMessage && (
            <div className="mt-2 text-xs text-indigo-300 font-medium flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{uploadMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Query Search Form */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          Semantic Filing Search & Evidence Synthesis
        </h3>

        <form onSubmit={handleSearch} className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Ask questions about uploaded filings (e.g. 'What are the main risk disclosures regarding supply chain?')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#0b0f19] text-xs text-white placeholder-gray-500 pl-9 pr-4 py-3 rounded-xl border border-[#1f2937] focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="px-5 py-3 rounded-xl gradient-ai hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-40 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            {searching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Retrieve Evidence</span>
          </button>
        </form>

        {/* Query Results & Citations */}
        {queryResult && (
          <div className="mt-6 space-y-4 pt-6 border-t border-[#1f2937]">
            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Synthesized Evidence Answer</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Confidence: {(queryResult.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line">
                {queryResult.answer}
              </p>
            </div>

            {/* Citations List */}
            {queryResult.citations.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <Quote className="w-3 h-3 text-indigo-400" />
                  <span>Verified Document Citations</span>
                </h4>
                <div className="space-y-2">
                  {queryResult.citations.map((c, i) => (
                    <div key={i} className="bg-[#0b0f19] border border-[#1f2937] rounded-lg p-3 text-xs">
                      <div className="flex items-center justify-between text-indigo-300 font-semibold text-[11px] mb-1">
                        <span>{c.source_filename} ({c.page_or_section})</span>
                        <span className="text-gray-500 font-mono">Similarity: {(c.relevance_score * 100).toFixed(1)}%</span>
                      </div>
                      <p className="text-gray-400 italic">"{c.snippet}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Indexed Documents Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          Indexed Workspace Documents ({documents.length})
        </h3>

        {documents.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400">
            No documents in active collection. Upload a document above to enable vector search.
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="font-bold text-white">{doc.filename}</div>
                    <div className="text-[10px] text-gray-500">
                      {(doc.size_bytes / 1024).toFixed(1)} KB • {doc.chunk_count} text chunks embedded
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-950/50 text-gray-500 hover:text-rose-400 transition-colors"
                  title="Remove Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
