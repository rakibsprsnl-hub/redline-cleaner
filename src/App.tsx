/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Layers,
  Copy,
  ScanLine,
  Film,
  Settings,
  Info,
  HardDrive,
  CheckCircle2,
} from 'lucide-react';
import {
  AppSettings,
  CleanupLogEntry,
  DuplicateGroup,
  ScreenId,
  SimilarGroup,
  SwipePhoto,
  VideoItem,
} from './types';
import {
  INITIAL_ACTIVITY_LOG,
  INITIAL_DUPLICATE_GROUPS,
  INITIAL_SETTINGS,
  INITIAL_SIMILAR_GROUPS,
  INITIAL_SWIPE_PHOTOS,
  INITIAL_VIDEOS,
} from './data/mockLibrary';
import { HomeDashboard } from './components/HomeDashboard';
import { PhotoSwipe } from './components/PhotoSwipe';
import { DuplicateResults } from './components/DuplicateResults';
import { SimilarScanner } from './components/SimilarScanner';
import { VideoCleaner } from './components/VideoCleaner';
import { SettingsPanel } from './components/SettingsPanel';
import { AboutScreen } from './components/AboutScreen';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

const TOTAL_STORAGE_GB = 256;
const BASE_USED_STORAGE_GB = 184.6;

interface NavItem {
  id: ScreenId;
  label: string;
  shortLabel: string;
  icon: typeof LayoutDashboard;
  mobileTab?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Home Dashboard', shortLabel: 'Home', icon: LayoutDashboard, mobileTab: true },
  { id: 'swipe', label: 'Photo Swipe', shortLabel: 'Swipe', icon: Layers, mobileTab: true },
  { id: 'duplicates', label: 'Duplicate Results', shortLabel: 'Duplicates', icon: Copy, mobileTab: true },
  { id: 'similar', label: 'Similar Scanner', shortLabel: 'Scanner', icon: ScanLine, mobileTab: true },
  { id: 'videos', label: 'Video Cleaner', shortLabel: 'Videos', icon: Film, mobileTab: true },
  { id: 'settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
  { id: 'about', label: 'About', shortLabel: 'About', icon: Info },
];

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('dashboard');
  const [swipePhotos, setSwipePhotos] = useState<SwipePhoto[]>(INITIAL_SWIPE_PHOTOS);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>(INITIAL_DUPLICATE_GROUPS);
  const [similarGroups, setSimilarGroups] = useState<SimilarGroup[]>(INITIAL_SIMILAR_GROUPS);
  const [videos, setVideos] = useState<VideoItem[]>(INITIAL_VIDEOS);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [activityLog, setActivityLog] = useState<CleanupLogEntry[]>(INITIAL_ACTIVITY_LOG);
  const [totalReclaimedMB, setTotalReclaimedMB] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  const addLogEntry = (action: string, itemsRemoved: number, reclaimedMB: number) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const entry: CleanupLogEntry = {
      id: `log-${Date.now()}`,
      action,
      itemsRemoved,
      reclaimedMB,
      timestamp: `Today · ${timeStr}`,
    };
    setActivityLog((prev) => [entry, ...prev]);
    setTotalReclaimedMB((prev) => prev + reclaimedMB);
  };

  // Derived Storage & Item Counts
  const stats = useMemo(() => {
    const dupNonOriginals = duplicateGroups.flatMap((g) =>
      g.items.filter((i) => !i.isOriginal)
    );
    const duplicateCount = dupNonOriginals.length;
    const duplicateMB = dupNonOriginals.reduce((sum, i) => sum + i.sizeMB, 0);

    const simNonBest = similarGroups.flatMap((g) =>
      g.items.filter((i) => !i.isBestShot)
    );
    const similarCount = simNonBest.length;
    const similarMB = simNonBest.reduce((sum, i) => sum + i.sizeMB, 0);

    const videoCount = videos.length;
    const videoMB = videos.reduce((sum, v) => sum + v.sizeMB, 0);
    const dupVideoMB = videos
      .filter((v) => v.category === 'duplicate')
      .reduce((sum, v) => sum + v.sizeMB, 0);

    const reclaimableMB = duplicateMB + similarMB + dupVideoMB;
    const usedStorageGB = Math.max(
      42,
      BASE_USED_STORAGE_GB - totalReclaimedMB / 1024
    );

    return {
      duplicateCount,
      duplicateMB,
      similarCount,
      similarMB,
      videoCount,
      videoMB,
      reclaimableMB,
      usedStorageGB,
    };
  }, [duplicateGroups, similarGroups, videos, totalReclaimedMB]);

  // Handlers: Photo Swipe
  const handleCommitSwipeDeletions = (deletedIds: string[], totalMB: number) => {
    setSwipePhotos((prev) => prev.filter((p) => !deletedIds.includes(p.id)));
    addLogEntry('Cleaned photos via Swipe Review', deletedIds.length, totalMB);
    showToast(`Cleaned ${deletedIds.length} photos · Freed ${totalMB.toFixed(1)} MB`);
  };

  // Handlers: Duplicate Results
  const handleToggleDuplicateItem = (groupId: string, itemId: string) => {
    setDuplicateGroups((prev) =>
      prev.map((group) =>
        group.id !== groupId
          ? group
          : {
              ...group,
              items: group.items.map((item) =>
                item.id === itemId ? { ...item, selected: !item.selected } : item
              ),
            }
      )
    );
  };

  const handleSmartSelectDuplicates = () => {
    setDuplicateGroups((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          selected: !item.isOriginal,
        })),
      }))
    );
    showToast('Auto-selected all duplicate copies while protecting originals');
  };

  const handleClearDuplicateSelection = () => {
    setDuplicateGroups((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) => ({ ...item, selected: false })),
      }))
    );
  };

  const handleCleanDuplicates = () => {
    const selected = duplicateGroups.flatMap((g) => g.items.filter((i) => i.selected));
    if (selected.length === 0) return;
    const reclaimed = selected.reduce((sum, i) => sum + i.sizeMB, 0);

    setDuplicateGroups((prev) =>
      prev
        .map((group) => ({
          ...group,
          items: group.items.filter((i) => !i.selected),
        }))
        .filter((group) => group.items.length > 1)
    );

    addLogEntry('Cleaned exact duplicate photos', selected.length, reclaimed);
    showToast(`Removed ${selected.length} duplicates · Freed ${reclaimed.toFixed(1)} MB`);
  };

  // Handlers: Similar Scanner
  const handleToggleSimilarItem = (groupId: string, itemId: string) => {
    setSimilarGroups((prev) =>
      prev.map((group) =>
        group.id !== groupId
          ? group
          : {
              ...group,
              items: group.items.map((item) =>
                item.id === itemId ? { ...item, selected: !item.selected } : item
              ),
            }
      )
    );
  };

  const handleCleanSimilar = () => {
    const selected = similarGroups.flatMap((g) => g.items.filter((i) => i.selected));
    if (selected.length === 0) return;
    const reclaimed = selected.reduce((sum, i) => sum + i.sizeMB, 0);

    setSimilarGroups((prev) =>
      prev
        .map((group) => ({
          ...group,
          items: group.items.filter((i) => !i.selected),
        }))
        .filter((group) => group.items.length > 1)
    );

    addLogEntry('Cleaned similar burst images', selected.length, reclaimed);
    showToast(`Removed ${selected.length} similar shots · Freed ${reclaimed.toFixed(1)} MB`);
  };

  // Handlers: Video Cleaner
  const handleToggleVideo = (id: string) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, selected: !v.selected } : v))
    );
  };

  const handleCleanVideos = () => {
    const selected = videos.filter((v) => v.selected);
    if (selected.length === 0) return;
    const reclaimed = selected.reduce((sum, v) => sum + v.sizeMB, 0);

    setVideos((prev) => prev.filter((v) => !v.selected));
    addLogEntry('Cleaned large & duplicate videos', selected.length, reclaimed);
    showToast(`Removed ${selected.length} video clips · Freed ${reclaimed.toFixed(0)} MB`);
  };

  // Handlers: Settings & Library Reset
  const handleUpdateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetLibrary = () => {
    setSwipePhotos(INITIAL_SWIPE_PHOTOS);
    setDuplicateGroups(INITIAL_DUPLICATE_GROUPS);
    setSimilarGroups(INITIAL_SIMILAR_GROUPS);
    setVideos(INITIAL_VIDEOS);
    setTotalReclaimedMB(0);
    setActivityLog(INITIAL_ACTIVITY_LOG);
    showToast('Sample media library restored to initial state');
  };

  const activeNav = NAV_ITEMS.find((n) => n.id === activeScreen) ?? NAV_ITEMS[0];
  const mobileTabs = NAV_ITEMS.filter((n) => n.mobileTab);

  return (
    <div
      className={`min-h-screen bg-[#090909] text-[#F5F5F5] flex flex-col lg:flex-row relative ${
        settings.retroGrid ? 'retro-grid-bg' : ''
      }`}
    >
      {/* Optional Subtle CRT Scanline Layer */}
      {settings.crtScanlines && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 crt-scanlines opacity-20"
        />
      )}

      {/* Desktop Left Control Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-[#151515] border-r border-[#383838] z-30">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-[#383838] flex items-center gap-3">
          <div className="w-8 h-8 rounded-[2px] bg-[#E50920] flex items-center justify-center shrink-0 red-glow-sm">
            <HardDrive className="w-4 h-4 text-[#F5F5F5]" strokeWidth={2} />
          </div>
          <span className="font-display text-lg font-bold tracking-wider text-[#F5F5F5] whitespace-nowrap">
            REDLINE
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            const countBadge =
              item.id === 'duplicates'
                ? stats.duplicateCount
                : item.id === 'similar'
                ? stats.similarCount
                : item.id === 'videos'
                ? stats.videoCount
                : item.id === 'swipe'
                ? swipePhotos.length
                : null;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveScreen(item.id)}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-sm flex items-center justify-between gap-3 text-sm font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#FF263F] ${
                  isActive
                    ? 'bg-[#1D1D1D] text-[#F5F5F5] border border-[#E50920] red-glow-sm'
                    : 'text-[#999999] hover:text-[#F5F5F5] hover:bg-[#1D1D1D]/70 border border-transparent'
                }`}
              >
                <span className="flex items-center gap-3 whitespace-nowrap">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#E50920]' : 'text-[#999999]'
                    }`}
                    strokeWidth={1.75}
                  />
                  <span className="font-display tracking-wide">{item.label}</span>
                </span>
                {countBadge !== null && countBadge > 0 && (
                  <span
                    className={`text-xs font-mono tabular-nums ${
                      isActive ? 'text-[#FF263F]' : 'text-[#999999]'
                    }`}
                  >
                    {countBadge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Compact Storage Readout Footer */}
        <div className="p-4 border-t border-[#383838] bg-[#090909]/50 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#999999]">Storage Used</span>
            <span className="text-[#F5F5F5] tabular-nums">
              {stats.usedStorageGB.toFixed(1)} / {TOTAL_STORAGE_GB} GB
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#1D1D1D] overflow-hidden">
            <div
              className="h-full bg-[#E50920] transition-all duration-500"
              style={{
                width: `${Math.min(100, (stats.usedStorageGB / TOTAL_STORAGE_GB) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[11px] font-mono text-[#999999] pt-1">
            Developed by Rakib Jaman.
          </p>
        </div>
      </aside>

      {/* Main Viewport Shell */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Bar (Desktop & Mobile) */}
        <header className="sticky top-0 z-30 h-14 lg:h-16 bg-[#090909]/95 backdrop-blur-sm border-b border-[#383838] px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Brand Icon */}
            <div className="lg:hidden w-7 h-7 rounded-[2px] bg-[#E50920] flex items-center justify-center shrink-0">
              <HardDrive className="w-3.5 h-3.5 text-[#F5F5F5]" />
            </div>
            <h1 className="font-display text-base lg:text-xl font-semibold text-[#F5F5F5] truncate">
              {activeNav.label}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <PWAInstallButton />

            <span className="hidden sm:inline text-xs font-mono text-[#999999] tabular-nums whitespace-nowrap">
              Reclaimable:{' '}
              <strong className="text-[#FF263F] font-semibold">
                {stats.reclaimableMB >= 1024
                  ? `${(stats.reclaimableMB / 1024).toFixed(2)} GB`
                  : `${stats.reclaimableMB.toFixed(0)} MB`}
              </strong>
            </span>

            {/* Mobile Quick Access to Settings & About */}
            <div className="flex lg:hidden items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveScreen('settings')}
                aria-label="Settings"
                className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-sm border transition-colors ${
                  activeScreen === 'settings'
                    ? 'bg-[#1D1D1D] border-[#E50920] text-[#E50920]'
                    : 'border-transparent text-[#999999] hover:text-[#F5F5F5]'
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveScreen('about')}
                aria-label="About"
                className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-sm border transition-colors ${
                  activeScreen === 'about'
                    ? 'bg-[#1D1D1D] border-[#E50920] text-[#E50920]'
                    : 'border-transparent text-[#999999] hover:text-[#F5F5F5]'
                }`}
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Active Screen Content */}
        <main className="flex-1 px-4 py-5 lg:px-8 lg:py-7 pb-24 lg:pb-10 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeScreen === 'dashboard' && (
                <HomeDashboard
                  totalStorageGB={TOTAL_STORAGE_GB}
                  usedStorageGB={stats.usedStorageGB}
                  reclaimableMB={stats.reclaimableMB}
                  duplicateCount={stats.duplicateCount}
                  duplicateMB={stats.duplicateMB}
                  similarCount={stats.similarCount}
                  similarMB={stats.similarMB}
                  videoCount={stats.videoCount}
                  videoMB={stats.videoMB}
                  swipeRemaining={swipePhotos.length}
                  totalReclaimedSessionMB={totalReclaimedMB}
                  activityLog={activityLog}
                  onNavigate={setActiveScreen}
                />
              )}

              {activeScreen === 'swipe' && (
                <PhotoSwipe
                  photos={swipePhotos}
                  onCommitDeletions={handleCommitSwipeDeletions}
                  onResetDeck={() => setSwipePhotos(INITIAL_SWIPE_PHOTOS)}
                />
              )}

              {activeScreen === 'duplicates' && (
                <DuplicateResults
                  groups={duplicateGroups}
                  onToggleItem={handleToggleDuplicateItem}
                  onSmartSelect={handleSmartSelectDuplicates}
                  onClearSelection={handleClearDuplicateSelection}
                  onCleanSelected={handleCleanDuplicates}
                  onResetLibrary={handleResetLibrary}
                />
              )}

              {activeScreen === 'similar' && (
                <SimilarScanner
                  groups={similarGroups}
                  defaultThreshold={settings.defaultSimilarityThreshold}
                  onToggleItem={handleToggleSimilarItem}
                  onCleanSelected={handleCleanSimilar}
                />
              )}

              {activeScreen === 'videos' && (
                <VideoCleaner
                  videos={videos}
                  onToggleVideo={handleToggleVideo}
                  onCleanSelected={handleCleanVideos}
                />
              )}

              {activeScreen === 'settings' && (
                <SettingsPanel
                  settings={settings}
                  onUpdateSetting={handleUpdateSetting}
                  onResetLibrary={handleResetLibrary}
                />
              )}

              {activeScreen === 'about' && <AboutScreen />}
            </motion.div>
          </AnimatePresence>

          <footer className="mt-10 pt-5 border-t border-[#383838]/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[#999999]">
            <span>Redline Cleaner</span>
            <span>
              Developed by <span className="text-[#F5F5F5]">Rakib Jaman</span>
            </span>
          </footer>
        </main>
      </div>

      {/* Mobile / Android Bottom Tab Bar */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-[#151515]/95 backdrop-blur-md border-t border-[#383838] grid grid-cols-5"
      >
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveScreen(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors relative ${
                isActive ? 'text-[#FF263F]' : 'text-[#999999] hover:text-[#F5F5F5]'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 inset-x-3 h-[2px] bg-[#E50920]" />
              )}
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.75} />
              <span className="text-[10px] font-mono tracking-tight">
                {tab.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Action Feedback Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            role="status"
            className="fixed bottom-20 lg:bottom-6 right-4 lg:right-8 z-50 bg-[#1D1D1D] border border-[#E50920] text-[#F5F5F5] px-4 py-3 rounded-sm shadow-2xl flex items-center gap-2.5 text-xs font-mono red-glow-sm max-w-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-[#E50920] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
