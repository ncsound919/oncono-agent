import React from 'react';
import { PatientCase } from '../types/oncology';
import { BENCHMARK_CASES } from '../data/benchmarkCases';
import {
  Activity,
  Dna,
  FileText,
  Download,
  Printer,
  PlusCircle,
  Database,
  Brain,
  ShieldAlert,
} from 'lucide-react';

interface HeaderProps {
  currentCase: PatientCase;
  onSelectCase: (c: PatientCase) => void;
  onOpenNewCaseModal: () => void;
  isSynthesizing: boolean;
  onTriggerSynthesize: () => void;
  hasSynthesis: boolean;
  onExportReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCase,
  onSelectCase,
  onOpenNewCaseModal,
  isSynthesizing,
  onTriggerSynthesize,
  hasSynthesis,
  onExportReport,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Workstation Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center shadow-inner">
              <Dna className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white font-mono">
                  ONCO AGENT
                </span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-blue-900/70 text-blue-300 border border-blue-700/60 uppercase">
                  v2.6 Precision MTB
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Molecular Tumor Board & Precision Oncology Decision Support System
              </p>
            </div>
          </div>

          {/* Quick Case Switcher & Actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-1.5 bg-slate-800/80 p-1 rounded border border-slate-700/60">
              <span className="text-[10px] uppercase font-mono text-slate-400 px-2 font-semibold">
                Case:
              </span>
              <select
                value={currentCase.id}
                onChange={(e) => {
                  const found = BENCHMARK_CASES.find((b) => b.id === e.target.value);
                  if (found) onSelectCase(found);
                }}
                className="bg-slate-900 text-slate-200 text-xs font-mono rounded px-2.5 py-1 border border-slate-700 focus:outline-none focus:border-blue-500"
              >
                {BENCHMARK_CASES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.patientRef} - {b.cancerType} (
                    {b.genomicAlterations.map((g) => `${g.gene} ${g.hgvsProtein.split(' ')[0]}`).join(', ')}
                    )
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onOpenNewCaseModal}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Input or edit patient case profile"
            >
              <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
              <span>Edit / New Case</span>
            </button>

            <button
              type="button"
              onClick={onTriggerSynthesize}
              disabled={isSynthesizing}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded text-xs font-semibold shadow transition cursor-pointer ${
                isSynthesizing
                  ? 'bg-blue-800 text-blue-200 cursor-not-allowed opacity-80'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <Brain className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
              <span>{isSynthesizing ? 'Synthesizing...' : 'Run Tumor Board AI'}</span>
            </button>

            {hasSynthesis && (
              <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
                <button
                  type="button"
                  onClick={onExportReport}
                  className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Export / Copy Clinical Note"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Print Tumor Board Report"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sub-bar: Real Integrations Status & Epistemic Disclaimer */}
        <div className="border-t border-slate-800/80 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>NCBI ClinVar: Live API</span>
            </span>
            <span className="flex items-center space-x-1 text-teal-400">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>ClinicalTrials.gov v2: Live API</span>
            </span>
            <span className="flex items-center space-x-1 text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>NCBI PubMed: Live API</span>
            </span>
            <span className="flex items-center space-x-1 text-indigo-400">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Gemini 3.8 Flash Engine</span>
            </span>
          </div>

          <div className="flex items-center space-x-1 text-amber-300/90">
            <ShieldAlert className="w-3 h-3 flex-shrink-0" />
            <span>Clinical Decision Support & MTB Research Workbench • Not an autonomous prescription</span>
          </div>
        </div>
      </div>
    </header>
  );
};
