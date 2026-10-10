import React, { useState, useEffect } from 'react';
import { PatientCase, PubMedArticle } from '../types/oncology';
import { fetchPubMed } from '../services/apiClient';
import { BookOpen, ExternalLink, RefreshCw, AlertCircle, Bookmark } from 'lucide-react';

interface PubMedExplorerProps {
  patientCase: PatientCase;
}

export const PubMedExplorer: React.FC<PubMedExplorerProps> = ({ patientCase }) => {
  const initialGene = patientCase.genomicAlterations[0]?.gene || 'EGFR';
  const defaultTerm = `${patientCase.cancerType} ${initialGene} clinical trial`;

  const [term, setTerm] = useState(defaultTerm);
  const [articles, setArticles] = useState<PubMedArticle[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const gene = patientCase.genomicAlterations[0]?.gene || '';
    setTerm(`${patientCase.cancerType} ${gene} targeted therapy`.trim());
  }, [patientCase.cancerType, patientCase.id]);

  const runQuery = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPubMed(term);
      setArticles(data.articles);
      setTotalCount(data.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error querying PubMed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (term) runQuery();
  }, [term]);

  const presetQueries = [
    { label: 'Phase 3 Trials', query: `${patientCase.cancerType} phase 3 clinical trial` },
    {
      label: 'Resistance Mechanisms',
      query: `${patientCase.cancerType} ${patientCase.genomicAlterations.map((a) => a.gene).join(' ')} resistance`,
    },
    {
      label: 'Immunotherapy',
      query: `${patientCase.cancerType} checkpoint inhibitor PD-1 TMB`,
    },
    {
      label: 'Targeted Sequencing',
      query: `${patientCase.cancerType} next-generation sequencing actionable mutations`,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100 font-sans">
      {/* Header & Query Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
              NCBI PubMed Peer-Reviewed Literature Navigator
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {totalCount > 0 ? `${totalCount} PubMed citations retrieved` : 'NCBI E-utilities Live API'}
          </span>
        </div>

        {/* Query Input */}
        <div className="flex flex-col sm:flex-row gap-2 text-xs">
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search PubMed citations (e.g. osimertinib T790M phase 3)..."
            className="flex-1 px-3 py-1.5 rounded border border-slate-300 font-sans text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />

          <button
            type="button"
            onClick={runQuery}
            disabled={isLoading}
            className="py-1.5 px-3.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-semibold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Searching...' : 'Search PubMed'}</span>
          </button>
        </div>

        {/* Presets */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Evidence Presets:</span>
          {presetQueries.map((pq) => (
            <button
              type="button"
              key={pq.label}
              onClick={() => setTerm(pq.query)}
              className="px-2 py-0.5 rounded text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
            >
              {pq.label}
            </button>
          ))}
        </div>
      </div>

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
            <RefreshCw className="w-5 h-5 mx-auto animate-spin text-indigo-600" />
            <p>Querying NCBI Entrez PubMed for peer-reviewed literature...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono">
            No PubMed citations returned for &quot;{term}&quot;.
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((art) => (
              <div
                key={art.pmid}
                className="p-3.5 rounded border border-slate-200 hover:border-slate-300 bg-white transition text-xs space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                  <a
                    href={art.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-indigo-700 hover:text-indigo-900 underline inline-flex items-center gap-1"
                  >
                    <span>PMID: {art.pmid}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{art.journal}</span>
                    {art.pubDate && <span> • {art.pubDate}</span>}
                  </div>
                </div>

                <h4 className="font-semibold text-slate-900 leading-snug text-xs font-sans">
                  {art.title}
                </h4>

                {art.authors.length > 0 && (
                  <div className="text-[11px] text-slate-500 font-mono">
                    Authors: {art.authors.join(', ')}
                    {art.authors.length >= 4 ? ' et al.' : ''}
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
