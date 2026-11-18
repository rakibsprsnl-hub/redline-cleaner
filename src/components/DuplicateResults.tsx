import { Check, CheckSquare, Square, Trash2, Sparkles, RotateCcw } from 'lucide-react';
import { DuplicateGroup } from '../types';
import { MediaThumb } from './MediaThumb';

interface DuplicateResultsProps {
  groups: DuplicateGroup[];
  onToggleItem: (groupId: string, itemId: string) => void;
  onSmartSelect: () => void;
  onClearSelection: () => void;
  onCleanSelected: () => void;
  onResetLibrary: () => void;
}

export function DuplicateResults({
  groups,
  onToggleItem,
  onSmartSelect,
  onClearSelection,
  onCleanSelected,
  onResetLibrary,
}: DuplicateResultsProps) {
  const selectedItems = groups.flatMap((g) => g.items.filter((i) => i.selected));
  const selectedCount = selectedItems.length;
  const selectedMB = selectedItems.reduce((acc, i) => acc + i.sizeMB, 0);

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Control Toolbar */}
      <div className="bg-[#151515] border border-[#383838] rounded-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-[#F5F5F5]">
            Grouped Duplicate Sets
          </h2>
          <p className="text-xs font-mono text-[#999999] mt-0.5 tabular-nums">
            {groups.length} active sets · {selectedCount} files selected ({selectedMB.toFixed(1)} MB)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onSmartSelect}
            className="min-h-[40px] px-3.5 py-2 bg-[#1D1D1D] hover:bg-[#252525] border border-[#383838] hover:border-[#E50920] text-[#F5F5F5] text-xs font-mono rounded-sm transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E50920]" />
            Auto-Select Duplicates
          </button>

          <button
            type="button"
            onClick={onClearSelection}
            disabled={selectedCount === 0}
            className="min-h-[40px] px-3.5 py-2 bg-[#1D1D1D] hover:bg-[#252525] disabled:opacity-40 border border-[#383838] text-[#999999] hover:text-[#F5F5F5] text-xs font-mono rounded-sm transition-colors whitespace-nowrap"
          >
            Clear All
          </button>

          <button
            type="button"
            onClick={onCleanSelected}
            disabled={selectedCount === 0}
            className="min-h-[42px] px-5 py-2 bg-[#E50920] hover:bg-[#FF263F] disabled:opacity-40 disabled:cursor-not-allowed text-[#F5F5F5] font-display font-bold text-sm tracking-wider rounded-sm transition-all flex items-center gap-2 whitespace-nowrap red-glow-sm"
          >
            <Trash2 className="w-4 h-4" />
            CLEAN {selectedCount > 0 ? `(${selectedMB.toFixed(1)} MB)` : ''}
          </button>
        </div>
      </div>

      {/* Duplicate Groups List */}
      {groups.length === 0 ? (
        <div className="bg-[#151515] border border-[#383838] rounded-sm p-12 text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-[#1D1D1D] border border-[#E50920] rounded-sm flex items-center justify-center">
            <Check className="w-6 h-6 text-[#E50920]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-xl font-semibold text-[#F5F5F5]">
              Zero Duplicates Remaining
            </h3>
            <p className="text-sm text-[#999999] max-w-md mx-auto">
              All exact duplicate photo sets have been removed and your storage index is clean.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetLibrary}
            className="min-h-[44px] px-5 py-2 bg-[#1D1D1D] hover:bg-[#262626] border border-[#383838] text-[#F5F5F5] text-sm font-display font-medium rounded-sm inline-flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-[#E50920]" />
            Restore Sample Duplicates
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => {
            const groupReclaimable = group.items
              .filter((i) => i.selected)
              .reduce((sum, i) => sum + i.sizeMB, 0);

            return (
              <article
                key={group.id}
                className="bg-[#1D1D1D] border border-[#383838] rounded-sm p-4 sm:p-5 space-y-4"
              >
                {/* Group Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#383838]">
                  <div className="flex items-center gap-3 min-w-0">
                    <h3 className="font-display text-base font-semibold text-[#F5F5F5] truncate">
                      {group.title}
                    </h3>
                    <span className="text-xs font-mono text-[#999999]">
                      {group.hashSignature}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-[#999999] tabular-nums">
                    {group.items.length} files ·{' '}
                    <span className="text-[#FF263F]">
                      {groupReclaimable.toFixed(1)} MB marked
                    </span>
                  </div>
                </div>

                {/* Grouped Photo Thumbnails */}
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
                      className={`group cursor-pointer bg-[#151515] border rounded-sm overflow-hidden transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#FF263F] ${
                        item.selected
                          ? 'border-[#E50920] red-border-glow'
                          : 'border-[#383838] hover:border-[#999999]'
                      }`}
                    >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-[4/3] bg-[#090909] overflow-hidden">
                        <MediaThumb
                          src={item.src}
                          alt={item.filename}
                          filterClass={item.filterClass}
                          className="w-full h-full object-cover group-hover:scale-[1.02]"
                        />

                        {/* Top Bar Overlay: RED ORIGINAL / DUPLICATE Label + Checkbox */}
                        <div className="absolute inset-x-0 top-0 p-2.5 flex items-center justify-between bg-gradient-to-b from-[#090909]/85 to-transparent">
                          <span
                            className={`px-2 py-0.5 text-[11px] font-mono font-semibold tracking-wider rounded-[2px] ${
                              item.isOriginal
                                ? 'bg-[#E50920] text-[#F5F5F5]'
                                : 'bg-[#090909]/90 border border-[#E50920]/70 text-[#FF263F]'
                            }`}
                          >
                            {item.isOriginal ? 'ORIGINAL' : 'DUPLICATE'}
                          </span>

                          <div
                            className={`w-6 h-6 rounded-[2px] flex items-center justify-center transition-colors ${
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

                      {/* File Metadata */}
                      <div className="p-3 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-mono font-medium text-[#F5F5F5] truncate">
                            {item.filename}
                          </p>
                          <span className="text-xs font-mono font-semibold text-[#FF263F] tabular-nums shrink-0">
                            {item.sizeMB.toFixed(1)} MB
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#999999] tabular-nums">
                          <span>{item.resolution}</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Sticky Bottom Clean CTA for Mobile / Android Thumb Ergonomics */}
      {selectedCount > 0 && (
        <div className="lg:hidden fixed bottom-[68px] inset-x-0 px-4 py-2.5 bg-gradient-to-t from-[#090909] via-[#090909]/95 to-transparent z-30">
          <button
            type="button"
            onClick={onCleanSelected}
            className="w-full min-h-[48px] bg-[#E50920] hover:bg-[#FF263F] active:scale-[0.99] text-[#F5F5F5] font-display font-bold text-sm tracking-wider rounded-sm flex items-center justify-center gap-2 red-glow-md"
          >
            <Trash2 className="w-4 h-4" />
            CLEAN {selectedCount} SELECTED · {selectedMB.toFixed(1)} MB
          </button>
        </div>
      )}
    </div>
  );
}
