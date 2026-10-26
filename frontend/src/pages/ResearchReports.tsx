import React, { useEffect, useState } from 'react';
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  Sparkles,
  RefreshCw,
  Download,
  Clock,
  Building,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api/client';
import { ReportSummaryResponse } from '../types';

interface ResearchReportsProps {
  currentSymbol: string;
}

export const ResearchReports: React.FC<ResearchReportsProps> = ({ currentSymbol }) => {
  const [reports, setReports] = useState<ReportSummaryResponse[]>([]);
  const [targetSymbol, setTargetSymbol] = useState(currentSymbol);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchReports = () => {
    setLoading(true);
    api.getReports()
      .then((res) => {
        setReports(res);
        setLoading(false);
      })
      .catch(() => {
        setReports([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSymbol || generating) return;

    setGenerating(true);
    try {
      await api.generateReport(targetSymbol.trim().toUpperCase());
      fetchReports();
    } catch (err: any) {
      alert(`Report error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-1">
              <span className="p-1.5 rounded-lg gradient-ai text-white">
                <FileDown className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Institutional Financial Research Report Generator
              </h1>
            </div>
            <p className="text-xs text-gray-400">
              Compile comprehensive equity research reports with valuation multiples, ML forecast trajectory, risk factors, and downloadable PDF & Excel models.
            </p>
          </div>
        </div>

        {/* Generate Report Form */}
        <form onSubmit={handleGenerate} className="flex items-center space-x-3 mt-5 pt-4 border-t border-[#1f2937] max-w-lg">
          <input
            type="text"
            placeholder="Enter ticker (e.g. AAPL, NVDA, MSFT)..."
            value={targetSymbol}
            onChange={(e) => setTargetSymbol(e.target.value)}
            className="flex-1 bg-[#0b0f19] text-xs text-white px-4 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:border-indigo-500 uppercase font-bold"
          />
          <button
            type="submit"
            disabled={generating || !targetSymbol.trim()}
            className="px-5 py-2.5 rounded-xl gradient-ai hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-40 transition-all flex items-center space-x-2 cursor-pointer"
          >
            {generating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Report</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Reports Archive Feed */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Saved Institutional Reports</h3>
          <span className="text-xs text-gray-400">{reports.length} generated documents</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 space-x-3">
            <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
            <span className="text-xs text-gray-400">Loading saved research reports...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400">
            No research reports found. Enter a stock symbol above to generate your first institutional research dossier.
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="bg-[#0b0f19] border border-[#1f2937] hover:border-[#374151] rounded-xl p-5 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-base text-white">{rep.symbol}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 font-semibold">
                        Comprehensive Equity Dossier
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-200">{rep.title}</h4>
                    <div className="flex items-center space-x-2 text-[10px] text-gray-500 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(rep.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Download Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <a
                      href={api.downloadReportPdfUrl(rep.id)}
                      download
                      className="px-3.5 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-900 text-rose-300 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>

                    <a
                      href={api.downloadReportExcelUrl(rep.id)}
                      download
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-900 text-emerald-300 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Export Excel</span>
                    </a>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed bg-[#111827] p-3 rounded-lg border border-[#1f2937]">
                  {rep.summary}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
