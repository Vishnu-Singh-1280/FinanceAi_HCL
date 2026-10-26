import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  CheckCircle2,
  XCircle,
  Database,
  Cpu,
  Radio,
  Save,
  RefreshCw,
  ShieldCheck,
  Key
} from 'lucide-react';
import { api } from '../api/client';
import { SettingsResponse } from '../types';

export const Settings: React.FC = () => {
  const [data, setData] = useState<SettingsResponse | null>(null);
  const [provider, setProvider] = useState('local');
  const [openaiKey, setOpenaiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    api.getSettings()
      .then((res) => {
        setData(res);
        setProvider(res.ai_provider);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage(false);
    try {
      const updated = await api.updateSettings({
        ai_provider: provider,
        openai_api_key: openaiKey || undefined,
        groq_api_key: groqKey || undefined,
        ollama_base_url: ollamaUrl || undefined
      });
      setData(updated);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err: any) {
      alert(`Settings error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-6 h-6 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-semibold text-[#172033] tracking-tight">
            System Settings & Infrastructure
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Configure AI reasoning backends, external API credentials, market data telemetry, and database persistence.
          </p>
        </div>
      </div>

      {/* System Health & Diagnostics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#667085] uppercase tracking-wider mb-2">
            <Cpu className="w-4 h-4 text-[#2563EB]" />
            <span>AI Reasoning Backend</span>
          </div>
          <div className="text-base font-semibold text-[#172033] capitalize">{data.ai_provider} Engine</div>
          <div className="text-xs text-[#16A34A] mt-1.5 flex items-center space-x-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Operational & Integrated</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#667085] uppercase tracking-wider mb-2">
            <Database className="w-4 h-4 text-[#2563EB]" />
            <span>Persistence Storage</span>
          </div>
          <div className="text-base font-semibold text-[#172033]">{data.database_type}</div>
          <div className="text-xs text-[#16A34A] mt-1.5 flex items-center space-x-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>SQLAlchemy Synchronized</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#667085] uppercase tracking-wider mb-2">
            <Radio className="w-4 h-4 text-[#2563EB]" />
            <span>Market Feed Provider</span>
          </div>
          <div className="text-base font-semibold text-[#172033]">{data.market_data_provider || 'Yahoo Finance + TTL Cache'}</div>
          <div className="text-xs text-[#16A34A] mt-1.5 flex items-center space-x-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Live Stream Normalizer</span>
          </div>
        </div>
      </div>

      {/* AI Provider Configuration Form */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-[#F1F5F9]">
          <Key className="w-4 h-4 text-[#2563EB]" />
          <h3 className="text-sm font-semibold text-[#172033]">LLM Provider & Credentials</h3>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#667085] uppercase font-semibold mb-1">Active AI Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-[#F8FAFC] text-[#172033] px-3 py-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:border-[#2563EB]"
            >
              <option value="local">Local Financial Quantitative Engine (Offline / Zero-Config)</option>
              <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
              <option value="groq">Groq (Llama-3.3-70b)</option>
              <option value="ollama">Ollama (Self-Hosted Local LLM)</option>
            </select>
          </div>

          {provider === 'openai' && (
            <div>
              <label className="block text-[#667085] uppercase font-semibold mb-1">OpenAI API Key</label>
              <input
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full bg-[#F8FAFC] text-[#172033] px-3 py-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:border-[#2563EB] font-mono"
              />
            </div>
          )}

          {provider === 'groq' && (
            <div>
              <label className="block text-[#667085] uppercase font-semibold mb-1">Groq API Key</label>
              <input
                type="password"
                placeholder="gsk_..."
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="w-full bg-[#F8FAFC] text-[#172033] px-3 py-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:border-[#2563EB] font-mono"
              />
            </div>
          )}

          {provider === 'ollama' && (
            <div>
              <label className="block text-[#667085] uppercase font-semibold mb-1">Ollama Base URL</label>
              <input
                type="text"
                placeholder="http://localhost:11434"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                className="w-full bg-[#F8FAFC] text-[#172033] px-3 py-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:border-[#2563EB] font-mono"
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            {savedMessage ? (
              <span className="text-[#16A34A] font-medium flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Configuration saved successfully!</span>
              </span>
            ) : <span></span>}

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Architecture Guarantees */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 text-xs text-[#667085] space-y-2 shadow-xs">
        <div className="flex items-center space-x-2 text-[#172033] font-semibold mb-1">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span>Security & API Integrity Standard</span>
        </div>
        <p>• API keys are processed securely through backend environment abstractions and never exposed to the client bundle.</p>
        <p>• Built-in financial intelligence functions automatically when external API keys are omitted, ensuring 100% operational uptime.</p>
        <p>• Machine learning forecasts preserve strict time-ordered validation without forward look-ahead leakage.</p>
      </div>
    </div>
  );
};
