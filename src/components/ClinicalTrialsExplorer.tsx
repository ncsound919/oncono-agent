import React, { useState, useEffect } from 'react';
import { PatientCase, ClinicalTrialItem } from '../types/oncology';
import { fetchClinicalTrials } from '../services/apiClient';
import {
  Search,
  ExternalLink,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface ClinicalTrialsExplorerProps {
  patientCase: PatientCase;
  preselectedIntervention?: string;
}

export const ClinicalTrialsExplorer: React.FC<ClinicalTrialsExplorerProps> = ({
  patientCase,
  preselectedIntervention,
}) => {
  const [condition, setCondition] = useState<string>(patientCase.cancerType);
  const [intervention, setIntervention] = useState(preselectedIntervention || '');
  const [status, setStatus] = useState('RECRUITING,ACTIVE_NOT_RECRUITING');
  const [studies, setStudies] = useState<ClinicalTrialItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedNctId, setExpandedNctId] = useState<string | null>(null);

  // Sync default condition when case changes
  useEffect(() => {
    setCondition(patientCase.cancerType);
    if (preselectedIntervention) {
      setIntervention(preselectedIntervention);
    }
  }, [patientCase.cancerType, preselectedIntervention]);

  const runQuery = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchClinicalTrials(condition, intervention, status, 12);
      setStudies(data.studies);
      setTotalCount(data.totalCount);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching clinical trials');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    runQuery();
  }, [condition, intervention, status]);

  // Suggested keywords based on patient case alterations
  const suggestedInterventions = [
    ...patientCase.genomicAlterations.map((a) => a.gene),
    ...(patientCase.cancerType.includes('Lung') ? ['osimertinib', 'amivantamab', 'lazertinib'] : []),
    ...(patientCase.cancerType.includes('Colorectal') ? ['sotorasib', 'adagrasib', 'cetuximab', 'trifluridine'] : []),
    ...(patientCase.cancerType.includes('Ovarian') ? ['olaparib', 'rucaparib', 'mirvetuximab'] : []),
    ...(patientCase.cancerType.includes('Melanoma') ? ['encorafenib', 'binimetinib', 'nivolumab', 'ipilimumab'] : []),
    ...(patientCase.cancerType.includes('Pancreatic') ? ['nab-paclitaxel', 'FOLFIRINOX', 'KRAS G12D'] : []),
  ];
  const uniqueSuggestions = Array.from(new Set(suggestedInterventions)).slice(0, 6);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100 font-sans">
      {/* Header & Query Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
              ClinicalTrials.gov Protocol Explorer (Live API v2)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {totalCount > 0 ? `${totalCount} actively registered trials` : 'Searching trials...'}
          </span>
        </div>

        {/* Search Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
          <div className="sm:col-span-5">
            <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-semibold">
              Condition / Malignancy
            </label>
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g. Non-Small Cell Lung Cancer"
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-sans text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase font-semibold">
              Intervention / Target
            </label>
            <input
              type="text"
              value={intervention}
              onChange={(e) => setIntervention(e.target.value)}
              placeholder="e.g. osimertinib, KRAS, PARP"
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-sans text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              type="button"
              onClick={runQuery}
              disabled={isLoading}
              className="w-full py-1.5 px-3 rounded bg-teal-600 hover:bg-teal-700 text-white font-mono font-semibold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Searching...' : 'Refresh Trials'}</span>
            </button>
          </div>
        </div>

        {/* Suggested Target Chips */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-500">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Quick Filters:</span>
          {uniqueSuggestions.map((sug) => (
            <button
              type="button"
              key={sug}
              onClick={() => setIntervention(sug)}
              className={`px-2 py-0.5 rounded text-[10px] transition border cursor-pointer ${
                intervention === sug
                  ? 'bg-teal-100 text-teal-800 border-teal-300 font-semibold'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {sug}
            </button>
          ))}
          {intervention && (
            <button
              type="button"
              onClick={() => setIntervention('')}
              className="text-[10px] text-slate-400 hover:text-slate-600 underline ml-1"
            >
              Clear
            </button>
          )}
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
            <RefreshCw className="w-5 h-5 mx-auto animate-spin text-teal-600" />
            <p>Querying ClinicalTrials.gov API v2 for active protocols...</p>
          </div>
        ) : studies.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono">
            No matching active clinical trials found for &quot;{condition}&quot; {intervention ? `with &quot;${intervention}&quot;` : ''}.
          </div>
        ) : (
          <div className="space-y-3">
            {studies.map((study) => {
              const isExpanded = expandedNctId === study.nctId;

              return (
                <div
                  key={study.nctId}
                  className="p-3.5 rounded border border-slate-200 hover:border-slate-300 bg-white transition text-xs space-y-2"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 font-mono">
                        <a
                          href={study.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-teal-700 hover:text-teal-900 underline inline-flex items-center gap-1"
                        >
                          <span>{study.nctId}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                          {study.phase}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                            study.overallStatus === 'RECRUITING'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {study.overallStatus.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <h4 className="font-semibold text-slate-900 leading-snug">
                        {study.briefTitle}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedNctId(isExpanded ? null : study.nctId)}
                      className="text-[11px] font-mono text-teal-700 hover:text-teal-900 underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Criteria' : 'Eligibility Criteria'}</span>
                    </button>
                  </div>

                  {study.interventions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono text-slate-600">
                      <span className="font-semibold text-slate-700">Interventions:</span>
                      {study.interventions.map((intr, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[10px]"
                        >
                          {intr}
                        </span>
                      ))}
                    </div>
                  )}

                  {study.briefSummary && (
                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans line-clamp-2">
                      {study.briefSummary}
                    </p>
                  )}

                  {isExpanded && study.eligibilitySnippet && (
                    <div className="p-3 mt-2 rounded bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 space-y-1">
                      <div className="font-bold text-slate-900 uppercase text-[10px]">
                        Eligibility Criteria Extract:
                      </div>
                      <p className="whitespace-pre-line leading-relaxed font-sans text-xs">
                        {study.eligibilitySnippet}
                      </p>
                      <div className="pt-1 text-[10px] text-slate-400">
                        View complete inclusion/exclusion criteria on ClinicalTrials.gov via link above.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
