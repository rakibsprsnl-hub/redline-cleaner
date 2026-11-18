import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 lg:bottom-6 left-4 lg:left-72 z-50 bg-[#1D1D1D] border border-[#E50920] text-[#F5F5F5] px-3.5 py-2 rounded-sm shadow-2xl flex items-center gap-2 text-xs font-mono red-glow-sm"
    >
      <WifiOff className="w-3.5 h-3.5 text-[#FF263F] shrink-0" />
      <span>Offline Mode — Local cache active</span>
    </div>
  );
}
