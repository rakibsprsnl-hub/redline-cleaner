export type ScreenId =
  | 'dashboard'
  | 'swipe'
  | 'duplicates'
  | 'similar'
  | 'videos'
  | 'settings'
  | 'about';

export interface SwipePhoto {
  id: string;
  filename: string;
  src: string;
  sizeMB: number;
  resolution: string;
  date: string;
  location: string;
  camera: string;
  filterClass?: string;
}

export interface DuplicateItem {
  id: string;
  filename: string;
  src: string;
  sizeMB: number;
  resolution: string;
  date: string;
  isOriginal: boolean;
  selected: boolean;
  filterClass?: string;
}

export interface DuplicateGroup {
  id: string;
  title: string;
  hashSignature: string;
  items: DuplicateItem[];
}

export interface SimilarItem {
  id: string;
  filename: string;
  src: string;
  sizeMB: number;
  resolution: string;
  similarity: number;
  isBestShot: boolean;
  selected: boolean;
  filterClass?: string;
}

export interface SimilarGroup {
  id: string;
  title: string;
  capturedAt: string;
  averageSimilarity: number;
  items: SimilarItem[];
}

export type VideoCategory = 'all' | 'large' | 'duplicate' | 'recording';

export interface VideoItem {
  id: string;
  filename: string;
  thumbnail: string;
  sizeMB: number;
  duration: string;
  durationSec: number;
  resolution: string;
  codec: string;
  fps: number;
  date: string;
  category: Exclude<VideoCategory, 'all'>;
  selected: boolean;
  filterClass?: string;
}

export interface AppSettings {
  crtScanlines: boolean;
  retroGrid: boolean;
  autoSelectDuplicates: boolean;
  keepHighestResolution: boolean;
  moveToTrashFirst: boolean;
  includeScreenshots: boolean;
  includeBurstPhotos: boolean;
  hapticFeedback: boolean;
  defaultSimilarityThreshold: number;
  minVideoSizeMB: number;
}

export interface CleanupLogEntry {
  id: string;
  action: string;
  itemsRemoved: number;
  reclaimedMB: number;
  timestamp: string;
}
