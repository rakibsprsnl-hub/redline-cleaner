import { RotateCcw, Shield, Sliders, Monitor, HardDrive } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onResetLibrary: () => void;
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

function RetroToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="py-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#F5F5F5]">{label}</p>
        <p className="text-xs text-[#999999] mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-12 h-7 rounded-[2px] border transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF263F] ${
          checked
            ? 'bg-[#750011] border-[#E50920] red-glow-sm'
            : 'bg-[#090909] border-[#383838]'
        }`}
      >
        <span
          className={`block w-5 h-5 rounded-[1px] transition-transform duration-150 ${
            checked
              ? 'translate-x-[22px] bg-[#E50920]'
              : 'translate-x-[3px] bg-[#999999]'
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsPanel({
  settings,
  onUpdateSetting,
  onResetLibrary,
}: SettingsPanelProps) {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Section 1: Display & CRT Interface */}
      <section className="bg-[#151515] border border-[#383838] rounded-sm p-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#383838]">
          <Monitor className="w-4 h-4 text-[#E50920]" strokeWidth={1.75} />
          <h2 className="font-display text-base font-semibold text-[#F5F5F5]">
            Display & CRT Interface
          </h2>
        </div>
        <div className="divide-y divide-[#383838]/60">
          <RetroToggleRow
            label="CRT Scanline Overlay"
            description="Render subtle horizontal cathode-ray scanlines across the interface."
            checked={settings.crtScanlines}
            onChange={(val) => onUpdateSetting('crtScanlines', val)}
          />
          <RetroToggleRow
            label="Retro Coordinate Grid"
            description="Display subtle dark drafting grid lines on the primary background."
            checked={settings.retroGrid}
            onChange={(val) => onUpdateSetting('retroGrid', val)}
          />
          <RetroToggleRow
            label="Haptic Swipe Feedback"
            description="Trigger subtle tactile vibration when swiping photos on Android devices."
            checked={settings.hapticFeedback}
            onChange={(val) => onUpdateSetting('hapticFeedback', val)}
          />
        </div>
      </section>

      {/* Section 2: Scan Engine Parameters */}
      <section className="bg-[#151515] border border-[#383838] rounded-sm p-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#383838]">
          <Sliders className="w-4 h-4 text-[#E50920]" strokeWidth={1.75} />
          <h2 className="font-display text-base font-semibold text-[#F5F5F5]">
            Scan Engine Parameters
          </h2>
        </div>
        <div className="divide-y divide-[#383838]/60">
          <RetroToggleRow
            label="Auto-Select Duplicate Copies"
            description="Automatically mark non-original duplicate copies for faster batch cleanup."
            checked={settings.autoSelectDuplicates}
            onChange={(val) => onUpdateSetting('autoSelectDuplicates', val)}
          />
          <RetroToggleRow
            label="Keep Highest Resolution Original"
            description="Always preserve the sharpest, largest file as the protected ORIGINAL."
            checked={settings.keepHighestResolution}
            onChange={(val) => onUpdateSetting('keepHighestResolution', val)}
          />
          <RetroToggleRow
            label="Include Screenshots"
            description="Index device screenshot folders during duplicate and similar image scans."
            checked={settings.includeScreenshots}
            onChange={(val) => onUpdateSetting('includeScreenshots', val)}
          />
          <RetroToggleRow
            label="Include Burst Photo Sequences"
            description="Group rapid camera burst shots inside the Similar Image Scanner."
            checked={settings.includeBurstPhotos}
            onChange={(val) => onUpdateSetting('includeBurstPhotos', val)}
          />

          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#F5F5F5]">Default Similarity Threshold</p>
              <p className="text-xs text-[#999999] mt-0.5">
                Minimum visual match percentage required to group similar shots.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={75}
                max={96}
                step={1}
                value={settings.defaultSimilarityThreshold}
                onChange={(e) =>
                  onUpdateSetting('defaultSimilarityThreshold', Number(e.target.value))
                }
                aria-label="Default similarity threshold"
                className="retro-slider w-36 sm:w-44"
              />
              <span className="font-mono text-sm font-semibold text-[#FF263F] tabular-nums w-11 text-right">
                {settings.defaultSimilarityThreshold}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Safety & Storage Controls */}
      <section className="bg-[#151515] border border-[#383838] rounded-sm p-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#383838]">
          <Shield className="w-4 h-4 text-[#E50920]" strokeWidth={1.75} />
          <h2 className="font-display text-base font-semibold text-[#F5F5F5]">
            Safety & Trash Handling
          </h2>
        </div>
        <div className="divide-y divide-[#383838]/60">
          <RetroToggleRow
            label="Move to System Trash First"
            description="Keep cleaned items recoverable in device trash for 30 days before permanent erase."
            checked={settings.moveToTrashFirst}
            onChange={(val) => onUpdateSetting('moveToTrashFirst', val)}
          />

          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <HardDrive className="w-4 h-4 text-[#999999] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#F5F5F5]">Reset Sample Media Library</p>
                <p className="text-xs text-[#999999] mt-0.5">
                  Restore all cleaned duplicates, swipe deck photos, and videos to initial state.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onResetLibrary}
              className="min-h-[42px] px-4 py-2 bg-[#1D1D1D] hover:bg-[#750011] border border-[#383838] hover:border-[#E50920] text-[#F5F5F5] text-xs font-mono rounded-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#E50920]" />
              Reset Library
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
