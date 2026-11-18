import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import {
  Trash2,
  Undo2,
  Check,
  RotateCcw,
  Camera,
  MapPin,
  Calendar,
} from 'lucide-react';
import { SwipePhoto } from '../types';
import { MediaThumb } from './MediaThumb';

interface PhotoSwipeProps {
  photos: SwipePhoto[];
  onCommitDeletions: (deletedIds: string[], totalMB: number) => void;
  onResetDeck: () => void;
}

interface SwipeHistoryItem {
  photo: SwipePhoto;
  decision: 'delete' | 'keep';
}

export function PhotoSwipe({
  photos,
  onCommitDeletions,
  onResetDeck,
}: PhotoSwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<SwipeHistoryItem[]>([]);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  // Keep index valid if photos reset
  useEffect(() => {
    if (currentIndex > photos.length) {
      setCurrentIndex(0);
      setHistory([]);
    }
  }, [photos.length, currentIndex]);

  const activePhoto = photos[currentIndex];
  const deletedItems = history.filter((h) => h.decision === 'delete');
  const keptItems = history.filter((h) => h.decision === 'keep');
  const pendingReclaimMB = deletedItems.reduce((sum, item) => sum + item.photo.sizeMB, 0);

  const handleDecision = useCallback(
    (decision: 'delete' | 'keep') => {
      if (!activePhoto) return;
      setExitDirection(decision === 'delete' ? 'left' : 'right');
      setHistory((prev) => [...prev, { photo: activePhoto, decision }]);
      setCurrentIndex((prev) => prev + 1);
      setDragOffset(0);
    },
    [activePhoto]
  );

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    setExitDirection(null);
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setDragOffset(0);
  }, [history.length]);

  // Keyboard shortcuts for desktop ergonomics
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleDecision('delete');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleDecision('keep');
      } else if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey || !e.shiftKey)) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleDecision, handleUndo]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -95 || info.velocity.x < -450) {
      handleDecision('delete');
    } else if (info.offset.x > 95 || info.velocity.x > 450) {
      handleDecision('keep');
    } else {
      setDragOffset(0);
    }
  };

  const handleCommit = () => {
    if (deletedItems.length === 0) return;
    onCommitDeletions(
      deletedItems.map((i) => i.photo.id),
      pendingReclaimMB
    );
    setHistory([]);
    setCurrentIndex(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Top Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151515] border border-[#383838] rounded-sm px-4 py-3">
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#F5F5F5] tabular-nums">
            Queue: {Math.min(currentIndex + 1, photos.length)} / {photos.length}
          </span>
          <span aria-hidden="true" className="text-[#383838]">|</span>
          <span className="text-[#FF263F] tabular-nums">
            Marked Delete: {deletedItems.length} ({pendingReclaimMB.toFixed(1)} MB)
          </span>
          <span aria-hidden="true" className="text-[#383838] hidden sm:inline">|</span>
          <span className="text-[#999999] hidden sm:inline tabular-nums">
            Kept: {keptItems.length}
          </span>
        </div>

        {deletedItems.length > 0 && (
          <button
            type="button"
            onClick={handleCommit}
            className="min-h-[36px] px-4 py-1.5 bg-[#E50920] hover:bg-[#FF263F] text-[#F5F5F5] text-xs font-display font-semibold rounded-sm transition-colors whitespace-nowrap"
          >
            Clean {deletedItems.length} Marked ({pendingReclaimMB.toFixed(1)} MB)
          </button>
        )}
      </div>

      {/* Main Swipe Stage */}
      {activePhoto ? (
        <div className="space-y-5">
          <div className="relative h-[420px] sm:h-[490px] w-full flex items-center justify-center overflow-hidden bg-[#151515] border border-[#383838] rounded-sm p-4">
            {/* Subtle CRT corner reticles */}
            <div className="pointer-events-none absolute top-3 left-3 w-4 h-4 border-t border-l border-[#E50920]/60" />
            <div className="pointer-events-none absolute top-3 right-3 w-4 h-4 border-t border-r border-[#E50920]/60" />
            <div className="pointer-events-none absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#E50920]/60" />
            <div className="pointer-events-none absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#E50920]/60" />

            <AnimatePresence mode="popLayout" custom={exitDirection}>
              <motion.div
                key={activePhoto.id}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.85}
                onDrag={(_, info) => setDragOffset(info.offset.x)}
                onDragEnd={handleDragEnd}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  x: 0,
                  rotate: dragOffset * 0.035,
                }}
                exit={{
                  x: exitDirection === 'left' ? -360 : 360,
                  opacity: 0,
                  rotate: exitDirection === 'left' ? -12 : 12,
                  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-2xl h-full bg-[#1D1D1D] border border-[#383838] rounded-sm overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-2xl"
              >
                <MediaThumb
                  src={activePhoto.src}
                  alt={activePhoto.filename}
                  filterClass={activePhoto.filterClass}
                  className="w-full h-full object-cover"
                />

                {/* Swipe Direction Stamp Indicators */}
                {dragOffset < -30 && (
                  <div
                    className="absolute inset-0 bg-[#E50920]/20 flex items-center justify-center pointer-events-none"
                    style={{ opacity: Math.min(1, Math.abs(dragOffset) / 110) }}
                  >
                    <div className="px-6 py-2.5 bg-[#090909]/90 border-2 border-[#FF263F] text-[#FF263F] font-display text-2xl font-bold tracking-widest -rotate-6">
                      DELETE
                    </div>
                  </div>
                )}

                {dragOffset > 30 && (
                  <div
                    className="absolute inset-0 bg-[#090909]/25 flex items-center justify-center pointer-events-none"
                    style={{ opacity: Math.min(1, Math.abs(dragOffset) / 110) }}
                  >
                    <div className="px-6 py-2.5 bg-[#090909]/90 border-2 border-[#E50920] text-[#F5F5F5] font-display text-2xl font-bold tracking-widest rotate-6">
                      KEEP
                    </div>
                  </div>
                )}

                {/* Bottom Measured Contrast Scrim Metadata */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#090909] via-[#090909]/80 to-transparent p-5 pt-14">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-sm sm:text-base font-semibold text-[#F5F5F5] truncate">
                        {activePhoto.filename}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#999999] mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#E50920]" />
                          {activePhoto.date}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#E50920]" />
                          {activePhoto.location}
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right font-mono text-xs shrink-0">
                      <p className="text-[#FF263F] font-semibold tabular-nums">
                        {activePhoto.sizeMB.toFixed(1)} MB
                      </p>
                      <p className="text-[#999999] tabular-nums">
                        {activePhoto.resolution}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Camera Technical Details Bar */}
          <div className="flex items-center justify-between text-xs font-mono text-[#999999] px-1">
            <span className="inline-flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#E50920]" />
              {activePhoto.camera}
            </span>
            <span className="hidden sm:inline">
              Drag card or use Left / Right keys · Z to Undo
            </span>
          </div>

          {/* Tactile Action Buttons: Red Delete | Dark Grey Undo | Red Keep */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-xl mx-auto">
            <button
              type="button"
              onClick={() => handleDecision('delete')}
              className="min-h-[54px] px-4 py-3 bg-[#E50920] hover:bg-[#FF263F] active:scale-[0.98] text-[#F5F5F5] font-display font-semibold text-sm sm:text-base rounded-sm transition-all duration-150 flex items-center justify-center gap-2 red-glow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF263F]"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Delete</span>
            </button>

            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length === 0}
              className="min-h-[54px] px-4 py-3 bg-[#1D1D1D] hover:bg-[#2A2A2A] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-[#F5F5F5] border border-[#383838] font-display font-semibold text-sm sm:text-base rounded-sm transition-all duration-150 flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#999999]"
            >
              <Undo2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#999999]" />
              <span>Undo</span>
            </button>

            <button
              type="button"
              onClick={() => handleDecision('keep')}
              className="min-h-[54px] px-4 py-3 bg-[#750011] hover:bg-[#E50920] active:scale-[0.98] text-[#F5F5F5] border border-[#E50920] font-display font-semibold text-sm sm:text-base rounded-sm transition-all duration-150 flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF263F]"
            >
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Keep</span>
            </button>
          </div>
        </div>
      ) : (
        /* Completion State */
        <div className="bg-[#151515] border border-[#383838] rounded-sm p-8 sm:p-12 text-center space-y-6">
          <div className="w-14 h-14 mx-auto bg-[#1D1D1D] border border-[#E50920] rounded-sm flex items-center justify-center red-glow-sm">
            <Check className="w-7 h-7 text-[#E50920]" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="font-display text-2xl font-semibold text-[#F5F5F5]">
              Swipe Queue Complete
            </h2>
            <p className="text-sm text-[#999999]">
              You reviewed all photos in this session. {deletedItems.length} files are queued for removal totaling{' '}
              <span className="font-mono text-[#FF263F] tabular-nums">
                {pendingReclaimMB.toFixed(1)} MB
              </span>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {deletedItems.length > 0 && (
              <button
                type="button"
                onClick={handleCommit}
                className="min-h-[46px] px-6 py-2.5 bg-[#E50920] hover:bg-[#FF263F] text-[#F5F5F5] font-display font-semibold text-sm rounded-sm transition-colors flex items-center gap-2 red-glow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Confirm Clean ({pendingReclaimMB.toFixed(1)} MB)
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setHistory([]);
                setCurrentIndex(0);
                onResetDeck();
              }}
              className="min-h-[46px] px-6 py-2.5 bg-[#1D1D1D] hover:bg-[#262626] text-[#F5F5F5] border border-[#383838] font-display font-semibold text-sm rounded-sm transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-[#999999]" />
              Reload Queue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
