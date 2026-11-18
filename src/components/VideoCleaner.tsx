import { useState, useEffect } from 'react';
import {
  Film,
  Clapperboard,
  Play,
  Pause,
  Trash2,
  CheckSquare,
  Square,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { VideoCategory, VideoItem } from '../types';
import { MediaThumb } from './MediaThumb';

interface VideoCleanerProps {
  videos: VideoItem[];
  onToggleVideo: (id: string) => void;
  onCleanSelected: () => void;
}

const FILTER_TABS: { id: VideoCategory; label: string }[] = [
  { id: 'all', label: 'All Clips' },
  { id: 'large', label: 'Large 4K' },
  { id: 'duplicate', label: 'Duplicates' },
  { id: 'recording', label: 'Screen Recs' },
];

export function VideoCleaner({
  videos,
  onToggleVideo,
  onCleanSelected,
}: VideoCleanerProps) {
  const [filter, setFilter] = useState<VideoCategory>('all');
  const [sortBy, setSortBy] = useState<'size' | 'duration'>('size');
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadSec, setPlayheadSec] = useState(0);

  useEffect(() => {
    if (!previewVideo || !isPlaying) return;
    const interval = window.setInterval(() => {
      setPlayheadSec((prev) => {
        if (prev >= previewVideo.durationSec) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [previewVideo, isPlaying]);

  const filteredVideos = videos
    .filter((v) => (filter === 'all' ? true : v.category === filter))
    .sort((a, b) =>
      sortBy === 'size' ? b.sizeMB - a.sizeMB : b.durationSec - a.durationSec
    );

  const selectedVideos = videos.filter((v) => v.selected);
  const selectedCount = selectedVideos.length;
  const selectedMB = selectedVideos.reduce((sum, v) => sum + v.sizeMB, 0);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-[#151515] border border-[#383838] rounded-sm p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Segmented Filter */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#090909] border border-[#383838] p-1 rounded-sm">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`min-h-[36px] px-3.5 py-1.5 text-xs font-mono rounded-[2px] transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-[#E50920] text-[#F5F5F5] font-semibold'
                  : 'text-[#999999] hover:text-[#F5F5F5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort + Clean Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSortBy((prev) => (prev === 'size' ? 'duration' : 'size'))}
            className="min-h-[40px] px-3.5 py-2 bg-[#1D1D1D] hover:bg-[#252525] border border-[#383838] text-xs font-mono text-[#F5F5F5] rounded-sm flex items-center gap-2 whitespace-nowrap transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#E50920]" />
            Sort: {sortBy === 'size' ? 'Largest Size' : 'Longest Duration'}
          </button>

          <button
            type="button"
            onClick={onCleanSelected}
            disabled={selectedCount === 0}
            className="min-h-[42px] px-5 py-2 bg-[#E50920] hover:bg-[#FF263F] disabled:opacity-40 disabled:cursor-not-allowed text-[#F5F5F5] font-display font-bold text-sm rounded-sm flex items-center gap-2 whitespace-nowrap transition-colors red-glow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clean {selectedCount > 0 ? `${selectedCount} (${selectedMB.toFixed(0)} MB)` : 'Videos'}
          </button>
        </div>
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <div className="bg-[#151515] border border-[#383838] rounded-sm p-12 text-center space-y-2">
          <Film className="w-8 h-8 text-[#E50920] mx-auto" strokeWidth={1.5} />
          <h3 className="font-display text-lg font-semibold text-[#F5F5F5]">
            No Video Clips Found
          </h3>
          <p className="text-sm text-[#999999]">
            No remaining clips match the selected category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredVideos.map((video) => (
            <article
              key={video.id}
              className={`bg-[#1D1D1D] border rounded-sm overflow-hidden transition-all duration-150 ${
                video.selected
                  ? 'border-[#E50920] red-border-glow'
                  : 'border-[#383838] hover:border-[#999999]'
              }`}
            >
              {/* Retro Film Strip Perforation Top Bar */}
              <div className="h-3 bg-[#090909] border-b border-[#383838] px-2 flex items-center justify-between">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <span
                    key={idx}
                    className="w-2.5 h-1.5 bg-[#1D1D1D] border border-[#383838]/60 rounded-[1px]"
                  />
                ))}
              </div>

              {/* Preview Frame */}
              <div className="relative aspect-video bg-[#090909] overflow-hidden group">
                <MediaThumb
                  src={video.thumbnail}
                  alt={video.filename}
                  filterClass={video.filterClass}
                  isVideo
                />

                {/* Center Play Preview Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setPreviewVideo(video);
                    setPlayheadSec(0);
                    setIsPlaying(true);
                  }}
                  aria-label={`Preview ${video.filename}`}
                  className="absolute inset-0 flex items-center justify-center bg-[#090909]/35 group-hover:bg-[#090909]/50 transition-colors"
                >
                  <span className="w-12 h-12 rounded-sm bg-[#090909]/90 border border-[#E50920] group-hover:bg-[#E50920] text-[#F5F5F5] flex items-center justify-center transition-colors red-glow-sm">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </span>
                </button>

                {/* Top Left Category Label & Top Right Checkbox */}
                <div className="absolute top-2.5 left-2.5 pointer-events-none">
                  <span
                    className={`px-2 py-0.5 text-[11px] font-mono font-semibold tracking-wider rounded-[2px] ${
                      video.category === 'duplicate'
                        ? 'bg-[#E50920] text-[#F5F5F5]'
                        : 'bg-[#090909]/90 border border-[#383838] text-[#F5F5F5]'
                    }`}
                  >
                    {video.category === 'duplicate'
                      ? 'DUPLICATE'
                      : video.category === 'large'
                      ? '4K MASTER'
                      : 'SCREEN REC'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleVideo(video.id)}
                  aria-label={`Select ${video.filename}`}
                  className="absolute top-2 right-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                  <span
                    className={`w-6 h-6 rounded-[2px] flex items-center justify-center transition-colors ${
                      video.selected
                        ? 'bg-[#E50920] text-[#F5F5F5]'
                        : 'bg-[#090909]/90 text-[#999999] border border-[#383838] hover:border-[#F5F5F5]'
                    }`}
                  >
                    {video.selected ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {/* Bottom Duration Stamp */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#090909]/90 border border-[#383838] text-[11px] font-mono text-[#F5F5F5] tabular-nums">
                  {video.duration}
                </div>
              </div>

              {/* Card Metadata */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Clapperboard className="w-4 h-4 text-[#E50920] shrink-0" strokeWidth={1.75} />
                    <h3 className="text-xs font-mono font-semibold text-[#F5F5F5] truncate">
                      {video.filename}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#FF263F] tabular-nums shrink-0">
                    {video.sizeMB.toFixed(1)} MB
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#999999] pt-1 border-t border-[#383838]/70 tabular-nums">
                  <span>{video.resolution} · {video.fps}fps</span>
                  <span>{video.codec}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Retro CRT Video Preview Modal */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-50 bg-[#090909]/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            setIsPlaying(false);
            setPreviewVideo(null);
          }}
        >
          <div
            className="w-full max-w-2xl bg-[#151515] border border-[#E50920] rounded-sm overflow-hidden red-glow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 bg-[#090909] border-b border-[#383838] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <Film className="w-4 h-4 text-[#E50920] shrink-0" />
                <span className="font-mono text-xs sm:text-sm text-[#F5F5F5] truncate">
                  {previewVideo.filename}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setPreviewVideo(null);
                }}
                aria-label="Close video preview"
                className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#999999] hover:text-[#F5F5F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-[#090909]">
              <MediaThumb
                src={previewVideo.thumbnail}
                alt={previewVideo.filename}
                filterClass={previewVideo.filterClass}
                isVideo
              />
              <div className="pointer-events-none absolute top-3 left-3 px-2 py-0.5 bg-[#090909]/85 border border-[#383838] text-[11px] font-mono text-[#FF263F] tabular-nums">
                {isPlaying ? 'PLAYING' : 'PAUSED'} · {formatTime(playheadSec)} / {previewVideo.duration}
              </div>
            </div>

            <div className="p-4 space-y-3 bg-[#151515]">
              <input
                type="range"
                min={0}
                max={previewVideo.durationSec}
                value={playheadSec}
                onChange={(e) => setPlayheadSec(Number(e.target.value))}
                aria-label="Video playback timeline"
                className="retro-slider w-full"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="min-h-[40px] px-4 py-1.5 bg-[#E50920] hover:bg-[#FF263F] text-[#F5F5F5] font-display font-semibold text-sm rounded-sm flex items-center gap-2 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <span className="text-xs font-mono text-[#999999] tabular-nums">
                  {previewVideo.resolution} · {previewVideo.sizeMB.toFixed(1)} MB · {previewVideo.codec}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
