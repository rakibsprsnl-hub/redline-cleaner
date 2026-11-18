import { Cpu, Lock, Layers, HardDrive } from 'lucide-react';

export function AboutScreen() {
  return (
    <div className="max-w-3xl space-y-6">
      {/* Primary Developer Attribution & Identity Card */}
      <section className="bg-[#151515] border border-[#383838] rounded-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#383838]">
          <div className="space-y-2">
            <p className="text-xs font-mono text-[#E50920]">
              DUPLICATE MEDIA CONTROL SYSTEM
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F5F5] tracking-tight">
              Redline Cleaner
            </h1>
            <p className="text-sm text-[#999999] max-w-xl leading-relaxed">
              Precision duplicate photo, similar image, and large video management crafted for high-speed storage recovery with a dark retro-futuristic instrument aesthetic.
            </p>
          </div>
          <div className="w-14 h-14 shrink-0 bg-[#1D1D1D] border border-[#E50920] rounded-sm flex items-center justify-center red-glow-sm">
            <HardDrive className="w-7 h-7 text-[#E50920]" strokeWidth={1.75} />
          </div>
        </div>

        {/* Required Developer Credit */}
        <div className="bg-[#1D1D1D] border border-[#E50920]/60 rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 red-border-glow">
          <div className="space-y-1">
            <p className="text-xs font-mono text-[#999999]">Creator & Lead Engineer</p>
            <p className="font-display text-xl sm:text-2xl font-semibold text-[#F5F5F5]">
              Developed by Rakib Jaman.
            </p>
          </div>
          <span className="text-xs font-mono text-[#FF263F] shrink-0">
            Android & Web Utility
          </span>
        </div>

        {/* Technical Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-[#1D1D1D] border border-[#383838] rounded-sm p-4 space-y-2">
            <Cpu className="w-4 h-4 text-[#E50920]" strokeWidth={1.75} />
            <h3 className="font-display text-sm font-semibold text-[#F5F5F5]">
              Perceptual Hashing
            </h3>
            <p className="text-xs text-[#999999] leading-relaxed">
              Combines exact SHA-256 byte matching with difference-hash optical comparison for burst shots.
            </p>
          </div>

          <div className="bg-[#1D1D1D] border border-[#383838] rounded-sm p-4 space-y-2">
            <Lock className="w-4 h-4 text-[#E50920]" strokeWidth={1.75} />
            <h3 className="font-display text-sm font-semibold text-[#F5F5F5]">
              100% On-Device Privacy
            </h3>
            <p className="text-xs text-[#999999] leading-relaxed">
              Every photo and video scan executes locally on device storage without external cloud uploads.
            </p>
          </div>

          <div className="bg-[#1D1D1D] border border-[#383838] rounded-sm p-4 space-y-2">
            <Layers className="w-4 h-4 text-[#E50920]" strokeWidth={1.75} />
            <h3 className="font-display text-sm font-semibold text-[#F5F5F5]">
              Safe Original Lock
            </h3>
            <p className="text-xs text-[#999999] leading-relaxed">
              Automatically identifies and protects highest-resolution originals while queuing redundant copies.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
