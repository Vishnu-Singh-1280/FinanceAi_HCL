import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../api/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(email, password);
      localStorage.setItem('fai_user', JSON.stringify(res.user));
      localStorage.setItem('fai_token', res.token);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(userEmail, userPass);
      localStorage.setItem('fai_user', JSON.stringify(res.user));
      localStorage.setItem('fai_token', res.token);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl max-w-md w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#F1F5F9] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#172033] tracking-tight">
              {isRegister ? 'Create FinanceAI Account' : 'Sign in to FinanceAI'}
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Access institutional portfolio management and predictive analytics.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#98A2B3] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Logins Bar */}
        <div className="px-6 py-3 bg-[#F8FAFC] border-b border-[#E5E7EB] text-xs">
          <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block mb-2">
            One-Click Demo Credentials:
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@financeai.com', 'admin')}
              className="flex-1 py-1.5 px-2 bg-white hover:bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-lg font-medium text-xs transition-colors cursor-pointer text-center"
            >
              👑 Admin (Vishnu Singh)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('analyst@financeai.com', 'analyst')}
              className="flex-1 py-1.5 px-2 bg-white hover:bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] rounded-lg font-medium text-xs transition-colors cursor-pointer text-center"
            >
              📊 Senior Analyst
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg text-[#991B1B] text-xs leading-relaxed">
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-[#667085] uppercase font-medium mb-1 tracking-wider text-[11px]">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                <input
                  type="text"
                  placeholder="Vishnu Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-[#172033] pl-9 pr-3 py-2.5 rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:border-[#2563EB]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[#667085] uppercase font-medium mb-1 tracking-wider text-[11px]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
              <input
                type="email"
                required
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F8FAFC] text-[#172033] pl-9 pr-3 py-2.5 rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#667085] uppercase font-medium mb-1 tracking-wider text-[11px]">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F8FAFC] text-[#172033] pl-9 pr-3 py-2.5 rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:border-[#2563EB]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2 text-[#667085]">
            {isRegister ? (
              <span>
                Already have credentials?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-[#2563EB] font-semibold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            ) : (
              <span>
                Need access?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-[#2563EB] font-semibold hover:underline cursor-pointer"
                >
                  Register an account
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
