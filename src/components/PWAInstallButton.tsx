import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="min-h-[38px] px-3.5 py-1.5 bg-[#E50920] hover:bg-[#FF263F] text-[#F5F5F5] font-display font-semibold text-xs tracking-wide rounded-sm transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 red-glow-sm focus-visible:outline-2 focus-visible:outline-[#FF263F]"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="min-h-[38px] px-3 py-1.5 bg-[#1D1D1D] hover:bg-[#262626] border border-[#E50920] text-[#F5F5F5] font-display font-semibold text-xs rounded-sm transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-[#E50920]" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 bg-[#090909]/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm bg-[#151515] border border-[#E50920] rounded-sm p-6 space-y-4 red-glow-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-[#F5F5F5]">
                  Install Redline Cleaner
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close install instructions"
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#999999] hover:text-[#F5F5F5]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-[#999999] leading-relaxed">
                1. Tap the <strong className="text-[#F5F5F5]">Share</strong> button in your Safari toolbar.
                <br />
                2. Scroll down and select <strong className="text-[#F5F5F5]">Add to Home Screen</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[42px] bg-[#E50920] hover:bg-[#FF263F] text-[#F5F5F5] font-display font-semibold text-sm rounded-sm transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
