import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  User,
  Tag,
  Info
} from 'lucide-react';
import { api } from '../api/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  detectedSymbols?: string[];
  timestamp: string;
}

interface AIAdvisorProps {
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

const SUGGESTED_QUESTIONS = [
  "Analyze the fundamentals of AAPL.",
  "Summarize recent financial results using available data.",
  "Compare MSFT and AAPL valuation multiples.",
  "Explain important financial ratios (P/E, ROE, Margins).",
  "Summarize the risks associated with an investment in NVDA."
];

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ currentSymbol, onSelectSymbol }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Welcome to the **FinanceAI Research Assistant**.\n\nI can help you review fundamental metrics, summarize wire news, compare peer valuations, and evaluate quantitative indicators for active securities like **${currentSymbol}**.\n\nSelect a suggested topic below or type a query to begin.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.chatWithAdvisor(text, currentSymbol);
      const asstMsg: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: res.content,
        detectedSymbols: res.detected_symbols,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, asstMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `Advisory Service Notice: ${err.message || 'Unable to connect to financial reasoning engine. Please check configuration settings.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'init-cleared',
        role: 'assistant',
        content: `Conversation cleared. Ask any research question regarding **${currentSymbol}** or global market dynamics.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-semibold text-[#172033] tracking-tight">
            AI Research Assistant
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Institutional research co-pilot providing financial analysis, ratio explanations, and portfolio commentary.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F8FAFC] text-xs font-medium text-[#667085] hover:text-[#172033] transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Main Conversation Container */}
      <div className="flex flex-col h-[calc(100vh-230px)] min-h-[500px] bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-xs">
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#172033] flex items-center space-x-2">
                <span>Quantitative Research Assistant</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] font-medium">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-[#667085]">Context active on {currentSymbol}</p>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-[#F8FAFC] text-[#172033] border border-[#E5E7EB]'
                }`}
              >
                <div
                  className={`flex items-center justify-between mb-1.5 pb-1 text-[10px] ${
                    msg.role === 'user' ? 'border-b border-white/20 text-blue-100' : 'border-b border-[#E5E7EB] text-[#667085]'
                  }`}
                >
                  <span className="font-semibold">{msg.role === 'user' ? 'You' : 'Research Assistant'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="space-y-1.5 whitespace-pre-line font-sans">
                  {msg.content}
                </div>

                {/* Analyzed Equities Pills */}
                {msg.detectedSymbols && msg.detectedSymbols.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#E5E7EB] flex items-center space-x-1.5 flex-wrap">
                    <span className="text-[11px] text-[#667085] flex items-center space-x-1">
                      <Tag className="w-3 h-3 text-[#2563EB]" />
                      <span>Referenced Tickers:</span>
                    </span>
                    {msg.detectedSymbols.map((s) => (
                      <button
                        key={s}
                        onClick={() => onSelectSymbol(s)}
                        className="text-[11px] px-2 py-0.5 rounded bg-white hover:bg-[#EFF6FF] text-[#2563EB] font-bold border border-[#DBEAFE] transition-colors cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {msg.role === 'assistant' && (
                  <div className="mt-2.5 flex justify-end">
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="p-1 rounded hover:bg-white text-[#667085] hover:text-[#172033] transition-colors cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-[#E2E8F0] text-[#475569] flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3 text-xs text-[#667085] flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2563EB]" />
                <span>Synthesizing financial analysis and evaluating metrics...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Research Questions */}
        <div className="px-5 py-2.5 border-t border-[#F1F5F9] bg-[#F8FAFC] flex items-center space-x-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[11px] font-semibold text-[#667085] shrink-0">Suggested:</span>
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-[#EFF6FF] text-[#475569] hover:text-[#2563EB] border border-[#E5E7EB] shrink-0 transition-colors cursor-pointer text-[11px] font-medium"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#E5E7EB] bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-3"
          >
            <input
              type="text"
              placeholder={`Ask about ${currentSymbol}, balance sheets, valuation ratios, or portfolio risks...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-[#F8FAFC] text-xs text-[#172033] placeholder-[#98A2B3] px-4 py-2.5 rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:border-[#2563EB] transition-all font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold disabled:opacity-40 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send Query</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
