import React, { useState, useEffect } from 'react';
import { GenomicAlteration, ClinVarApiVariant } from '../types/oncology';
import { fetchClinVar, fetchEnsembl } from '../services/apiClient';
import {
  Dna,
  Search,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';

interface GenomicInspectorProps {
  initialAlteration?: GenomicAlteration;
  alterationsList: GenomicAlteration[];
}

export const GenomicInspector: React.FC<GenomicInspectorProps> = ({
  initialAlteration,
  alterationsList,
}) => {
  const [gene, setGene] = useState(initialAlteration?.gene || alterationsList[0]?.gene || 'EGFR');
  const [variant, setVariant] = useState(
    initialAlteration?.hgvsProtein.split(' ')[0] || 'L858R'
  );

  const [clinVarResults, setClinVarResults] = useState<ClinVarApiVariant[]>([]);
  const [ensemblData, setEnsemblData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync if initialAlteration changes from outside
  useEffect(() => {
    if (initialAlteration) {
      setGene(initialAlteration.gene);
      // Clean up notation for query e.g. "p.Leu858Arg (L858R)" -> "L858R" or "Leu858Arg"
      const match = initialAlteration.hgvsProtein.match(/\(([^)]+)\)/);
      const cleanVar = match ? match[1] : initialAlteration.hgvsProtein.replace(/^p\./, '');
      setVariant(cleanVar);
    }
  }, [initialAlteration]);

  const runInspection = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [clinVarRes, ensRes] = await Promise.allSettled([
        fetchClinVar(gene, variant),
        fetchEnsembl(gene),
      ]);

      if (clinVarRes.status === 'fulfilled') {
        setClinVarResults(clinVarRes.value.results);
      } else {
        setClinVarResults([]);
      }

      if (ensRes.status === 'fulfilled') {
        setEnsemblData(ensRes.value);
      } else {
        setEnsemblData(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inspecting variant');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runInspection();
  }, [gene, variant]);

  // Construct AlphaGenome Atlas deep-link
  const alphaGenomeUrl = `https://deepmind.google.com/science/alphagenome/atlas?q=${encodeURIComponent(
    gene
  )}&m=locus`;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100 font-sans">
      {/* Header & Query Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <Dna className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
              Genomic & ClinVar Live Evidence Inspector
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            NCBI ClinVar + Ensembl REST APIs
          </span>
        </div>

        {/* Preset quick buttons from patient case */}
        {alterationsList.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Patient Variants:</span>
            {alterationsList.map((alt) => {
              const match = alt.hgvsProtein.match(/\(([^)]+)\)/);
              const label = match ? `${alt.gene} ${match[1]}` : `${alt.gene} ${alt.hgvsProtein}`;

              return (
                <button
                  type="button"
                  key={alt.id}
                  onClick={() => {
                    setGene(alt.gene);
                    setVariant(match ? match[1] : alt.hgvsProtein.replace(/^p\./, ''));
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] border transition cursor-pointer ${
                    gene === alt.gene
                      ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Search Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
          <div className="sm:col-span-4">
            <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-semibold">
              Gene Symbol
            </label>
            <input
              type="text"
              value={gene}
              onChange={(e) => setGene(e.target.value.toUpperCase())}
              placeholder="e.g. EGFR, KRAS, BRAF"
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none uppercase"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-semibold">
              Variant Nomenclature (HGVS / Protein / Codon)
            </label>
            <input
              type="text"
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              placeholder="e.g. T790M, G12D, V600E"
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              type="button"
              onClick={runInspection}
              disabled={isLoading}
              className="w-full py-1.5 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-mono font-semibold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Querying...' : 'Query NCBI'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ensembl Annotation Banner */}
      {ensemblData && (
        <div className="p-3.5 sm:px-5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-900">{ensemblData.gene}</span>
            <span className="text-slate-500">ID: {ensemblData.id}</span>
            <span className="text-slate-500">
              Locus: Chr{ensemblData.chromosome}:{ensemblData.start?.toLocaleString()}-{ensemblData.end?.toLocaleString()} ({ensemblData.strand})
            </span>
            {ensemblData.canonicalTranscript && (
              <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 text-[10px]">
                MANE/Canonical: {ensemblData.canonicalTranscript}
              </span>
            )}
          </div>

          <a
            href={alphaGenomeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 text-[11px] underline inline-flex items-center gap-1"
          >
            <span>AlphaGenome Atlas View</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      )}

      {/* Results Container */}
      <div className="p-4 sm:p-5">
        {error && (
          <div className="p-3 mb-4 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-500 space-y-2">
            <RefreshCw className="w-5 h-5 mx-auto animate-spin text-blue-600" />
            <p>Querying NCBI ClinVar E-utilities for assertion records...</p>
          </div>
        ) : clinVarResults.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono space-y-1">
            <p>No ClinVar records matched &quot;{gene} {variant}&quot;.</p>
            <p className="text-[11px] text-slate-400">
              Try adjusting HGVS representation or searching the gene symbol alone.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-[11px] font-mono text-slate-500 mb-2">
              Found {clinVarResults.length} authoritative ClinVar variation records:
            </div>

            {clinVarResults.map((item) => (
              <div
                key={item.variationId}
                className="p-3.5 rounded border border-slate-200 hover:border-slate-300 bg-white transition text-xs space-y-2"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 font-mono">
                      <a
                        href={item.ncbiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-blue-700 hover:text-blue-900 underline inline-flex items-center gap-1"
                      >
                        <span>ClinVar ID: {item.variationId}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          item.clinicalSignificance.toLowerCase().includes('pathogenic')
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : item.clinicalSignificance.toLowerCase().includes('uncertain')
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {item.clinicalSignificance}
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-900">{item.title}</h4>
                  </div>

                  <div className="text-right font-mono text-[11px]">
                    <div className="text-amber-500 font-semibold">
                      {'★'.repeat(item.stars)}
                      {'☆'.repeat(4 - item.stars)}
                      <span className="text-slate-500 ml-1">({item.stars} Stars)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.reviewStatus}</div>
                  </div>
                </div>

                {item.conditions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono text-slate-600">
                    <span className="font-semibold text-slate-700">Associated Phenotypes:</span>
                    {item.conditions.map((cond, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[10px]"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
