import { useState, useEffect } from 'react';
import {
  ScanLine,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  CheckSquare,
  Square,
  SlidersHorizontal,
} from 'lucide-react';
import { SimilarGroup } from '../types';
import { MediaThumb } from './MediaThumb';
import { IMG_COASTLINE, IMG_TOKYO, IMG_BRUTALIST } from '../data/mockLibrary';

interface SimilarScannerProps {
  groups: SimilarGroup[];
  defaultThreshold: number;
  onToggleItem: (groupId: string, itemId: string) => void;
  onCleanSelected: () => void;
}

const PREVIEW_FRAMES = [IMG_COASTLINE, IMG_TOKYO, IMG_BRUTALIST];
const TOTAL_LIBRARY_FILES = 1482;

export function SimilarScanner({
  groups,
  defaultThreshold,
  onToggleItem,
  onCleanSelected,
}: SimilarScannerProps) {
  const [threshold, setThreshold] = useState(defaultThreshold);
  const [isScanning, setIsScanning] = useState(true);
  const [progress, setProgress] = useState(0);
  const [filesProcessed, setFilesProcessed] = useState(0);
  const [hashesCompared, setHashesCompared] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);

  // Sync default threshold if changed in settings
  useEffect(() => {
    setThreshold(defaultThreshold);
  }, [defaultThreshold]);

  // Real-time vintage scanning simulation
  useEffect(() => {
    if (!isScanning) return;

    const timer = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(timer);
          setIsScanning(false);
          setFilesProcessed(TOTAL_LIBRARY_FILES);
          setHashesCompared(TOTAL_LIBRARY_FILES * 16);
          return 100;
        }
        const next = Math.min(100, prev + 2);
        setFilesProcessed(Math.round((next / 100) * TOTAL_LIBRARY_FILES));
        setHashesCompared(Math.round((next / 100) * TOTAL_LIBRARY_FILES * 16));
        if (next % 24 === 0) {
          setFrameIndex((f) => (f + 1) % PREVIEW_FRAMES.length);
        }
        return next;
      });
    }, 65);

    return () => window.clearInterval(timer);
  }, [isScanning]);

  const handleRestartScan = () => {
    setProgress(0);
    setFilesProcessed(0);
    setHashesCompared(0);
    setIsScanning(true);
  };

  const visibleGroups = groups.filter((g) => g.averageSimilarity >= threshold);
  const selectedItems = visibleGroups.flatMap((g) => g.items.filter((i) => i.selected));
  const selectedCount = selectedItems.length;
  const selectedMB = selectedItems.reduce((sum, item) => sum + item.sizeMB, 0);

  return (
    <div className="space-y-6">
      {/* Vintage CRT Scanning Console */}
      <section className="bg-[#151515] border border-[#383838] rounded-sm p-5 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Active CRT Optical Viewport with Animated Red Scan Line */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] bg-[#090909] border border-[#383838] rounded-sm overflow-hidden">
              <MediaThumb
                src={PREVIEW_FRAMES[frameIndex]}
                alt="Active perceptual scan frame"
                className="w-full h-full object-cover opacity-80"
              />

              {/* Subtle Dark CRT Vignette */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at center, transparent 48%, rgba(9, 9, 9, 0.72) 100%)',
                }}
              />

              {/* Animated Red CRT Scanning Line */}
              {isScanning && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="w-full h-full animate-crt-sweep">
                    <div className="w-full h-[2px] bg-[#FF263F] shadow-[0_0_16px_3px_rgba(255,38,63,0.85)]" />
                    <div className="w-full h-14 bg-gradient-to-b from-[#E50920]/25 to-transparent" />
                  </div>
                </div>
              )}

              {/* Corner Alignment Marks */}
              <div className="pointer-events-none absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t border-l border-[#E50920]" />
              <div className="pointer-events-none absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t border-r border-[#E50920]" />
              <div className="pointer-events-none absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b border-l border-[#E50920]" />
              <div className="pointer-events-none absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b border-r border-[#E50920]" />

              {/* Viewport Caption */}
              <div className="absolute inset-x-0 bottom-0 px-3 py-2 bg-[#090909]/85 border-t border-[#383838] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#FF263F]">
                  {isScanning ? 'Scanning perceptual matrix' : 'Scan complete'}
                </span>
                <span className="text-[#F5F5F5] tabular-nums">{progress}%</span>
              </div>
            </div>
          </div>

          {/* Processing Counters, Progress Indicator, and Controls */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-[#F5F5F5] flex items-center gap-2.5">
                  <ScanLine className="w-5 h-5 text-[#E50920]" />
                  Perceptual Image Scanner
                </h2>
                <p className="text-sm text-[#999999] mt-1">
                  Detects burst sequences, exposure variations, and visually similar frames.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {progress < 100 ? (
                  <button
                    type="button"
                    onClick={() => setIsScanning((prev) => !prev)}
                    className="min-h-[42px] px-4 py-2 bg-[#E50920] hover:bg-[#FF263F] text-[#F5F5F5] font-display font-semibold text-sm rounded-sm flex items-center gap-2 transition-colors red-glow-sm"
                  >
                    {isScanning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isScanning ? 'Pause' : 'Resume'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRestartScan}
                    className="min-h-[42px] px-4 py-2 bg-[#E50920] hover:bg-[#FF263F] text-[#F5F5F5] font-display font-semibold text-sm rounded-sm flex items-center gap-2 transition-colors red-glow-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Rescan Library
                  </button>
                )}
              </div>
            </div>

            {/* 3-Column Processing Counter Readout */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#1D1D1D] border border-[#383838] rounded-sm p-3.5">
                <p className="text-[11px] font-mono text-[#999999]">Files Scanned</p>
                <p className="font-mono tabular-nums text-lg sm:text-xl font-semibold text-[#F5F5F5] mt-1">
                  {filesProcessed.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#1D1D1D] border border-[#383838] rounded-sm p-3.5">
                <p className="text-[11px] font-mono text-[#999999]">Hashes Checked</p>
                <p className="font-mono tabular-nums text-lg sm:text-xl font-semibold text-[#F5F5F5] mt-1">
                  {hashesCompared.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#1D1D1D] border border-[#383838] rounded-sm p-3.5">
                <p className="text-[11px] font-mono text-[#999999]">Similar Sets</p>
                <p className="font-mono tabular-nums text-lg sm:text-xl font-semibold text-[#FF263F] mt-1">
                  {progress === 100 ? visibleGroups.length : Math.min(visibleGroups.length, Math.floor(progress / 30))}
                </p>
              </div>
            </div>

            {/* Real-Time Segmented Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#999999]">Scan Progress</span>
                <span className="text-[#F5F5F5] tabular-nums">
                  {filesProcessed} / {TOTAL_LIBRARY_FILES} files ({progress}%)
                </span>
              </div>
              <div className="h-3 bg-[#090909] border border-[#383838] p-0.5">
                <div
                  className="h-full bg-[#E50920] transition-all duration-100"
                  style={{
                    width: `${progress}%`,
                    boxShadow: '0 0 12px rgba(229, 9, 32, 0.5)',
                  }}
                />
              </div>
            </div>

            {/* Similarity Threshold Slider */}
            <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3 justify-between border-t border-[#383838]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#999999]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#E50920]" />
                <span>Similarity Threshold:</span>
                <span className="text-[#F5F5F5] font-semibold tabular-nums">{threshold}%</span>
              </div>
              <input
                type="range"
                min={75}
                max={96}
                step={1}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                aria-label="Similarity threshold percentage"
                className="retro-slider w-full sm:w-56"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Discovered Similar Clusters */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-[#F5F5F5]">
              Matched Similar Clusters
            </h3>
            <p className="text-xs font-mono text-[#999999] tabular-nums">
              Showing {visibleGroups.length} sets at ≥ {threshold}% similarity
            </p>
          </div>

          {selectedCount > 0 && (
            <button
              type="button"
              onClick={onCleanSelected}
              className="min-h-[42px] px-5 py-2 bg-[#E50920] hover:bg-[#FF263F] text-[#F5F5F5] font-display font-bold text-sm rounded-sm flex items-center gap-2 transition-colors red-glow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clean {selectedCount} Similar ({selectedMB.toFixed(1)} MB)
            </button>
          )}
        </div>

        {visibleGroups.length === 0 ? (
          <div className="bg-[#151515] border border-[#383838] rounded-sm p-10 text-center text-sm text-[#999999]">
            No similar photo sets match the {threshold}% threshold. Lower the threshold slider to inspect looser matches.
          </div>
        ) : (
          <div className="space-y-4">
            {visibleGroups.map((group) => (
              <div
                key={group.id}
                className="bg-[#1D1D1D] border border-[#383838] rounded-sm p-4 sm:p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#383838]">
                  <div className="flex items-center gap-3">
                    <h4 className="font-display text-base font-semibold text-[#F5F5F5]">
                      {group.title}
                    </h4>
                    <span className="text-xs font-mono text-[#999999]">{group.capturedAt}</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#FF263F] tabular-nums">
                    {group.averageSimilarity}% visual match
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onToggleItem(group.id, item.id)}
                      role="checkbox"
                      aria-checked={item.selected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          onToggleItem(group.id, item.id);
                        }
                      }}
                      className={`cursor-pointer bg-[#151515] border rounded-sm overflow-hidden transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#FF263F] ${
                        item.selected
                          ? 'border-[#E50920] red-border-glow'
                          : 'border-[#383838] hover:border-[#999999]'
                      }`}
                    >
                      <div className="relative aspect-[4/3] bg-[#090909] overflow-hidden">
                        <MediaThumb
                          src={item.src}
                          alt={item.filename}
                          filterClass={item.filterClass}
                        />
                        <div className="absolute inset-x-0 top-0 p-2.5 flex items-center justify-between bg-gradient-to-b from-[#090909]/85 to-transparent">
                          <span
                            className={`px-2 py-0.5 text-[11px] font-mono font-semibold tracking-wider rounded-[2px] ${
                              item.isBestShot
                                ? 'bg-[#E50920] text-[#F5F5F5]'
                                : 'bg-[#090909]/90 border border-[#383838] text-[#F5F5F5]'
                            }`}
                          >
                            {item.isBestShot ? 'BEST SHOT' : `${item.similarity}% MATCH`}
                          </span>

                          <div
                            className={`w-6 h-6 rounded-[2px] flex items-center justify-center ${
                              item.selected
                                ? 'bg-[#E50920] text-[#F5F5F5]'
                                : 'bg-[#090909]/85 text-[#999999] border border-[#383838]'
                            }`}
                            aria-hidden="true"
                          >
                            {item.selected ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 flex items-center justify-between text-xs font-mono">
                        <span className="text-[#F5F5F5] truncate pr-2">{item.filename}</span>
                        <span className="text-[#999999] tabular-nums shrink-0">
                          {item.sizeMB.toFixed(1)} MB
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
