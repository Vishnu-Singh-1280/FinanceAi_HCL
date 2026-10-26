import React, { useState, useEffect } from 'react';
import { X, Download, Monitor, Smartphone, CheckCircle2, Shield, Laptop, ArrowRight } from 'lucide-react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert("To install FinanceAI directly:\n• In Chrome/Edge: Click the 'Install' icon in your browser URL bar (top right)\n• Or click Menu (⋮) -> 'Install FinanceAI...' to pin to your Taskbar or Desktop.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#172033] tracking-tight">
                Download & Install FinanceAI
              </h2>
              <p className="text-xs text-[#667085]">
                Install as a high-performance desktop or mobile application with offline telemetry.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#98A2B3] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Main Action Banner */}
          <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-sm text-[#1E40AF] block">
                {isInstalled ? 'Application Already Installed' : 'Standalone Native App Experience'}
              </span>
              <p className="text-xs text-[#2563EB] mt-0.5">
                Launches in dedicated window without browser borders, with instant startup and desktop notifications.
              </p>
            </div>

            <button
              onClick={handleInstallClick}
              className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg shadow-xs transition-colors shrink-0 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalled ? 'Installed' : 'Install App'}</span>
            </button>
          </div>

          {/* Installation Instructions by Device */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
              Installation Guides by Platform:
            </span>

            <div className="space-y-2">
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB] flex items-start space-x-3">
                <Laptop className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#172033] block">Windows Desktop & Mac (Chrome / Edge / Brave)</span>
                  <p className="text-[#667085] mt-0.5">
                    Click the <strong>Install icon</strong> in your browser address bar (right side), or open browser menu <strong>(⋮) → Install FinanceAI</strong>. It pins directly to your Taskbar or Start Menu.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB] flex items-start space-x-3">
                <Smartphone className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#172033] block">Mobile (iOS & Android)</span>
                  <p className="text-[#667085] mt-0.5">
                    In Safari (iOS), tap the <strong>Share</strong> button and choose <strong>Add to Home Screen</strong>. On Android Chrome, tap Menu <strong>(⋮) → Add to Home screen</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features list */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#475569] pt-2 border-t border-[#F1F5F9]">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Ultra-fast local caching</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Zero install overhead</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Dedicated window workspace</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Auto-updating telemetry</span>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#E5E7EB] hover:bg-[#F8FAFC] text-[#667085] font-medium rounded-lg transition-colors cursor-pointer text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
