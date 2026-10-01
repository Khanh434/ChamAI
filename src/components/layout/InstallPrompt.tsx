'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setIsVisible(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible || isInstalled) return null;

  return (
    <aside aria-label="PWA Installation" className="relative isolate z-30 border-b border-blue-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-4 py-3 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Cài đặt ứng dụng ChamAI</p>
            <p className="text-xs text-blue-100">
              Cài đặt lên điện thoại để chấm bài nhanh không cần mở trình duyệt và dùng mượt mà hơn.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            Cài đặt
          </button>
          <button
            onClick={() => setIsVisible(false)}
            aria-label="Đóng thông báo cài đặt"
            className="rounded-lg p-1.5 text-blue-200 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
