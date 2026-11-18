import { useState, useEffect } from 'react';
import {
  Copy,
  Film,
  HardDrive,
  Layers,
  ScanLine,
  ArrowRight,
  RotateCw,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { CleanupLogEntry, ScreenId } from '../types';

interface HomeDashboardProps {
  totalStorageGB: number;
  usedStorageGB: number;
  reclaimableMB: number;
  duplicateCount: number;
  duplicateMB: number;
  similarCount: number;
  similarMB: number;
  videoCount: number;
  videoMB: number;
  swipeRemaining: number;
  totalReclaimedSessionMB: number;
  activityLog: CleanupLogEntry[];
  onNavigate: (screen: ScreenId) => void;
}

export function HomeDashboard({
  totalStorageGB,
  usedStorageGB,
  reclaimableMB,
  duplicateCount,
  duplicateMB,
  similarCount,
  similarMB,
  videoCount,
  videoMB,
  swipeRemaining,
  totalReclaimedSessionMB,
  activityLog,
  onNavigate,
}: HomeDashboardProps) {
  const [isQuickScanning, setIsQuickScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [lastScanTime, setLastScanTime] = useState('2 mins ago');

  useEffect(() => {
    if (!isQuickScanning) return;
    const interval = window.setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(interval);
          setIsQuickScanning(false);
          setLastScanTime('Just now');
          return 100;
        }
        return prev + 4;
      });
    }, 55);
    return () => window.clearInterval(interval);
  }, [isQuickScanning]);

  const handleQuickScan = () => {
    setScanProgress(0);
    setIsQuickScanning(true);
  };

  const usedPercent = Math.min(100, Math.round((usedStorageGB / totalStorageGB) * 100));
  const freeStorageGB = Math.max(0, totalStorageGB - usedStorageGB);
  const reclaimableGB = reclaimableMB / 1024;

  // SVG gauge geometry
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (usedPercent / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Primary Control Center Hero Panel */}
      <section className="bg-[#151515] border border-[#383838] rounded-sm p-5 md:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Storage Gauge */}
          <div className="lg:col-span-4 flex items-center gap-6">
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 152 152" aria-hidden="true">
                <circle
                  cx="76"
                  cy="76"
                  r={radius}
                  fill="none"
                  stroke="#1D1D1D"
                  strokeWidth="10"
                />
                <circle
                  cx="76"
                  cy="76"
                  r={radius}
                  fill="none"
                  stroke="#383838"
                  strokeWidth="10"
                  strokeDasharray="3 5"
                />
                <circle
                  cx="76"
                  cy="76"
                  r={radius}
                  fill="none"
                  stroke="#E50920"
                  strokeWidth="10"
                  strokeLinecap="butt"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(229, 9, 32, 0.45))' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono tabular-nums text-2xl font-semibold text-[#F5F5F5]">
                  {usedPercent}%
                </span>
                <span className="text-[11px] font-mono text-[#999999] mt-0.5">
                  Allocated
                </span>
              </div>
            </div>

            <div className="space-y-2 min-w-0">
              <p className="text-xs font-mono text-[#999999]">Internal Storage</p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-[#F5F5F5] tabular-nums">
                {usedStorageGB.toFixed(1)}{' '}
                <span className="text-base font-normal text-[#999999]">
                  / {totalStorageGB} GB
                </span>
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#999999]">
                <span className="tabular-nums">{freeStorageGB.toFixed(1)} GB free</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#FF263F] tabular-nums">
                  {reclaimableMB >= 1024
                    ? `${reclaimableGB.toFixed(2)} GB reclaimable`
                    : `${reclaimableMB.toFixed(0)} MB reclaimable`}
                </span>
              </div>
            </div>
          </div>

          {/* Storage Allocation Bar + Quick Scan Action */}
          <div className="lg:col-span-8 space-y-5 lg:border-l lg:border-[#383838] lg:pl-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-xl md:text-2xl font-semibold text-[#F5F5F5] tracking-tight">
                  Storage Diagnostic Control
                </h1>
                <p className="text-sm text-[#999999] mt-1">
                  Last full index: {lastScanTime} · {duplicateCount + similarCount} redundant photos and {videoCount} videos indexed
                </p>
              </div>
              <button
                type="button"
                onClick={handleQuickScan}
                disabled={isQuickScanning}
                className="min-h-[46px] px-6 py-2.5 bg-[#E50920] hover:bg-[#FF263F] disabled:opacity-70 text-[#F5F5F5] font-display font-semibold text-sm tracking-wide rounded-sm transition-all duration-150 flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0 red-glow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF263F]"
              >
                <RotateCw className={`w-4 h-4 ${isQuickScanning ? 'animate-spin' : ''}`} />
                {isQuickScanning ? `Scanning ${scanProgress}%` : 'Run Smart Scan'}
              </button>
            </div>

            {/* Segmented Hardware Storage Meter */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-[#090909] border border-[#383838] p-0.5 flex gap-0.5 overflow-hidden">
                <div
                  className="h-full bg-[#E50920] transition-all duration-500"
                  style={{ width: `${Math.max(4, Math.min(35, (reclaimableGB / totalStorageGB) * 100 * 12))}%` }}
                  title="Reclaimable Media"
                />
                <div
                  className="h-full bg-[#750011] transition-all duration-500"
                  style={{ width: '28%' }}
                  title="Photos & Videos"
                />
                <div
                  className="h-full bg-[#383838] transition-all duration-500"
                  style={{ width: '34%' }}
                  title="System & Apps"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#999999]">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#E50920] inline-block" />
                    Reclaimable ({reclaimableMB.toFixed(0)} MB)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#750011] inline-block" />
                    Media Library
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#383838] inline-block" />
                    System
                  </span>
                </div>
                {totalReclaimedSessionMB > 0 && (
                  <span className="text-[#F5F5F5] tabular-nums">
                    Session freed: {totalReclaimedSessionMB.toFixed(1)} MB
                  </span>
                )}
              </div>
            </div>

            {/* Active Scan Progress Indicator */}
            {isQuickScanning && (
              <div className="pt-1 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#FF263F]">Verifying perceptual hashes and file headers</span>
                  <span className="text-[#F5F5F5] tabular-nums">{scanProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#090909] overflow-hidden">
                  <div
                    className="h-full bg-[#FF263F] transition-all duration-75"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4-Column Metric Summary Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1D1D1D] border border-[#383838] rounded-sm p-4 space-y-2">
          <div className="flex items-center justify-between text-[#999999]">
            <span className="text-xs font-mono">Exact Duplicates</span>
            <Copy className="w-4 h-4 text-[#E50920]" strokeWidth={1.75} />
          </div>
          <p className="font-mono tabular-nums text-2xl font-semibold text-[#F5F5F5]">
            {duplicateCount}
          </p>
          <p className="text-xs font-mono text-[#999999] tabular-nums">
            {duplicateMB.toFixed(1)} MB recoverable
          </p>
        </div>

        <div className="bg-[#1D1D1D] border border-[#383838] rounded-sm p-4 space-y-2">
          <div className="flex items-center justify-between text-[#999999]">
            <span className="text-xs font-mono">Similar Shots</span>
            <ScanLine className="w-4 h-4 text-[#E50920]" strokeWidth={1.75} />
          </div>
          <p className="font-mono tabular-nums text-2xl font-semibold text-[#F5F5F5]">
            {similarCount}
          </p>
          <p className="text-xs font-mono text-[#999999] tabular-nums">
            {similarMB.toFixed(1)} MB recoverable
          </p>
        </div>

        <div className="bg-[#1D1D1D] border border-[#383838] rounded-sm p-4 space-y-2">
          <div className="flex items-center justify-between text-[#999999]">
            <span className="text-xs font-mono">Large & Dup Videos</span>
            <Film className="w-4 h-4 text-[#E50920]" strokeWidth={1.75} />
          </div>
          <p className="font-mono tabular-nums text-2xl font-semibold text-[#F5F5F5]">
            {videoCount}
          </p>
          <p className="text-xs font-mono text-[#999999] tabular-nums">
            {videoMB >= 1024 ? `${(videoMB / 1024).toFixed(2)} GB` : `${videoMB.toFixed(0)} MB`} indexed
          </p>
        </div>

        <div className="bg-[#1D1D1D] border border-[#383838] rounded-sm p-4 space-y-2">
          <div className="flex items-center justify-between text-[#999999]">
            <span className="text-xs font-mono">Swipe Queue</span>
            <Layers className="w-4 h-4 text-[#E50920]" strokeWidth={1.75} />
          </div>
          <p className="font-mono tabular-nums text-2xl font-semibold text-[#F5F5F5]">
            {swipeRemaining}
          </p>
          <p className="text-xs font-mono text-[#999999]">
            Pending review
          </p>
        </div>
      </section>

      {/* Primary Action Modules Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-[#F5F5F5]">
            Cleanup Modules
          </h2>
          <span className="text-xs font-mono text-[#999999]">
            Select a module to inspect and clean
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onNavigate('duplicates')}
            className="group text-left bg-[#1D1D1D] hover:bg-[#22191A] border border-[#383838] hover:border-[#E50920] rounded-sm p-5 transition-all duration-150 flex items-center justify-between gap-4 min-h-[96px] focus-visible:outline-2 focus-visible:outline-[#FF263F]"
          >
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-11 h-11 rounded-sm bg-[#151515] border border-[#383838] group-hover:border-[#E50920] flex items-center justify-center shrink-0 transition-colors">
                <Copy className="w-5 h-5 text-[#E50920]" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold text-[#F5F5F5] group-hover:text-[#FF263F] transition-colors">
                  Duplicate Results
                </h3>
                <p className="text-sm text-[#999999] mt-0.5">
                  Review byte-matched photo groups and clear copies with one tap.
                </p>
                <p className="text-xs font-mono text-[#F5F5F5] mt-2 tabular-nums">
                  {duplicateCount} duplicates · {duplicateMB.toFixed(1)} MB
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#999999] group-hover:text-[#FF263F] group-hover:translate-x-1 transition-all shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('swipe')}
            className="group text-left bg-[#1D1D1D] hover:bg-[#22191A] border border-[#383838] hover:border-[#E50920] rounded-sm p-5 transition-all duration-150 flex items-center justify-between gap-4 min-h-[96px] focus-visible:outline-2 focus-visible:outline-[#FF263F]"
          >
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-11 h-11 rounded-sm bg-[#151515] border border-[#383838] group-hover:border-[#E50920] flex items-center justify-center shrink-0 transition-colors">
                <Layers className="w-5 h-5 text-[#E50920]" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold text-[#F5F5F5] group-hover:text-[#FF263F] transition-colors">
                  Photo Swipe Review
                </h3>
                <p className="text-sm text-[#999999] mt-0.5">
                  Triage camera roll shots with fast swipe gestures and instant undo.
                </p>
                <p className="text-xs font-mono text-[#F5F5F5] mt-2 tabular-nums">
                  {swipeRemaining} photos in deck
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#999999] group-hover:text-[#FF263F] group-hover:translate-x-1 transition-all shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('similar')}
            className="group text-left bg-[#1D1D1D] hover:bg-[#22191A] border border-[#383838] hover:border-[#E50920] rounded-sm p-5 transition-all duration-150 flex items-center justify-between gap-4 min-h-[96px] focus-visible:outline-2 focus-visible:outline-[#FF263F]"
          >
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-11 h-11 rounded-sm bg-[#151515] border border-[#383838] group-hover:border-[#E50920] flex items-center justify-center shrink-0 transition-colors">
                <ScanLine className="w-5 h-5 text-[#E50920]" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold text-[#F5F5F5] group-hover:text-[#FF263F] transition-colors">
                  Similar Image Scanner
                </h3>
                <p className="text-sm text-[#999999] mt-0.5">
                  Detect burst frames, near-duplicates, and slight exposure shifts.
                </p>
                <p className="text-xs font-mono text-[#F5F5F5] mt-2 tabular-nums">
                  {similarCount} similar shots · {similarMB.toFixed(1)} MB
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#999999] group-hover:text-[#FF263F] group-hover:translate-x-1 transition-all shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('videos')}
            className="group text-left bg-[#1D1D1D] hover:bg-[#22191A] border border-[#383838] hover:border-[#E50920] rounded-sm p-5 transition-all duration-150 flex items-center justify-between gap-4 min-h-[96px] focus-visible:outline-2 focus-visible:outline-[#FF263F]"
          >
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-11 h-11 rounded-sm bg-[#151515] border border-[#383838] group-hover:border-[#E50920] flex items-center justify-center shrink-0 transition-colors">
                <Film className="w-5 h-5 text-[#E50920]" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold text-[#F5F5F5] group-hover:text-[#FF263F] transition-colors">
                  Video Cleaner
                </h3>
                <p className="text-sm text-[#999999] mt-0.5">
                  Inspect 4K clips, duplicate renders, and heavy screen recordings.
                </p>
                <p className="text-xs font-mono text-[#F5F5F5] mt-2 tabular-nums">
                  {videoCount} clips · {(videoMB / 1024).toFixed(2)} GB total
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#999999] group-hover:text-[#FF263F] group-hover:translate-x-1 transition-all shrink-0" />
          </button>
        </div>
      </section>

      {/* Recent Cleanup Log */}
      <section className="bg-[#151515] border border-[#383838] rounded-sm p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#383838]">
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-4 h-4 text-[#E50920]" strokeWidth={1.75} />
            <h2 className="font-display text-base font-semibold text-[#F5F5F5]">
              Recent Cleanup Activity
            </h2>
          </div>
          <span className="text-xs font-mono text-[#999999] tabular-nums">
            {activityLog.length} entries
          </span>
        </div>

        {activityLog.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#999999]">
            No cleanup actions recorded yet. Start by reviewing duplicates or large videos.
          </div>
        ) : (
          <div className="divide-y divide-[#383838]/60">
            {activityLog.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {entry.reclaimedMB > 0 ? (
                    <Trash2 className="w-4 h-4 text-[#E50920] shrink-0" strokeWidth={1.75} />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#999999] shrink-0" strokeWidth={1.75} />
                  )}
                  <span className="text-[#F5F5F5] truncate">{entry.action}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-[#999999] shrink-0 pl-7 sm:pl-0">
                  <span className="tabular-nums">{entry.itemsRemoved} files</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#FF263F] tabular-nums">
                    +{entry.reclaimedMB.toFixed(1)} MB
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{entry.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
