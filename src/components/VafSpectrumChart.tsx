import React from 'react';
import { GenomicAlteration } from '../types/oncology';

interface VafSpectrumProps {
  alterations: GenomicAlteration[];
  onSelectAlteration?: (alt: GenomicAlteration) => void;
  selectedId?: string;
}

export const VafSpectrumChart: React.FC<VafSpectrumProps> = ({
  alterations,
  onSelectAlteration,
  selectedId,
}) => {
  if (!alterations || alterations.length === 0) {
    return (
      <div className="text-xs text-slate-500 py-3 text-center border border-dashed border-slate-200 rounded">
        No somatic alterations registered in panel.
      </div>
    );
  }

  // Sort descending by VAF
  const sorted = [...alterations].sort((a, b) => b.vafPercent - a.vafPercent);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono text-slate-500 border-b border-slate-100 pb-1">
        <span>GENE & ALTERATION</span>
        <span className="flex items-center gap-4">
          <span>CLONALITY</span>
          <span>VAF %</span>
        </span>
      </div>

      <div className="space-y-2.5">
        {sorted.map((alt) => {
          const isSelected = selectedId === alt.id;
          const isTruncal = alt.vafPercent >= 35;
          const isSubclonal = alt.vafPercent < 25;
          const clonalityLabel = isTruncal
            ? 'Truncal Driver'
            : isSubclonal
            ? 'Subclonal / Acquired'
            : 'Major Subclone';

          const barColor =
            alt.tier === 'Tier I'
              ? 'bg-rose-600'
              : alt.tier === 'Tier II'
              ? 'bg-blue-600'
              : alt.tier === 'Tier III'
              ? 'bg-amber-500'
              : 'bg-emerald-600';

          return (
            <button
              type="button"
              key={alt.id}
              onClick={() => onSelectAlteration?.(alt)}
              className={`w-full text-left p-2.5 rounded border transition-all text-xs cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/60 border-blue-400 ring-1 ring-blue-300'
                  : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 font-medium">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{alt.gene}</span>
                  <span className="text-slate-700 font-mono text-[11px]">{alt.hgvsProtein}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
                      alt.tier === 'Tier I'
                        ? 'bg-rose-100 text-rose-800'
                        : alt.tier === 'Tier II'
                        ? 'bg-blue-100 text-blue-800'
                        : alt.tier === 'Tier III'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {alt.tier}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span
                    className={`text-[10px] px-1.5 py-0.2 border rounded ${
                      isTruncal
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                        : isSubclonal
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-slate-200 bg-slate-100 text-slate-700'
                    }`}
                  >
                    {clonalityLabel}
                  </span>
                  <span className="font-bold text-slate-900 w-12 text-right">
                    {alt.vafPercent.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* VAF progress track */}
              <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${barColor}`}
                  style={{ width: `${Math.min(alt.vafPercent, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>
                  Type: {alt.variantType}
                  {alt.readDepth ? ` | Depth: ${alt.readDepth}x` : ''}
                </span>
                <span>
                  ClinVar:{' '}
                  <strong className="text-slate-700 font-semibold">
                    {alt.clinVarSignificance || 'Unreviewed'}
                  </strong>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-2 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-600" /> Tier I (Actionable)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-600" /> Tier II (Investigational)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500" /> Tier III (VUS)
        </span>
      </div>
    </div>
  );
};
