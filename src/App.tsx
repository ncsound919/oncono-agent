import React, { useState, useEffect } from 'react';
import { PatientCase, TumorBoardReport, GenomicAlteration } from './types/oncology';
import { BENCHMARK_CASES } from './data/benchmarkCases';
import { Header } from './components/Header';
import { PatientDossier } from './components/PatientDossier';
import { TumorBoardSynthesis } from './components/TumorBoardSynthesis';
import { ClinicalTrialsExplorer } from './components/ClinicalTrialsExplorer';
import { GenomicInspector } from './components/GenomicInspector';
import { PubMedExplorer } from './components/PubMedExplorer';
import { TumorBoardChat } from './components/TumorBoardChat';
import { EditCaseModal } from './components/EditCaseModal';
import { generateTumorBoardAnalysis } from './services/apiClient';
import {
  FileText,
  Brain,
  Search,
  Dna,
  BookOpen,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Layers,
  ChevronRight,
  Check,
  Download,
  Workflow,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { OrchestrationResult } from './types/governance';
import { OrchestrationPipelineView } from './components/OrchestrationPipelineView';
import { GovernanceGuardrailsView } from './components/GovernanceGuardrailsView';
import { EcosystemBridgeView } from './components/EcosystemBridgeView';

type WorkspaceTab =
  | 'dossier'
  | 'synthesis'
  | 'orchestration'
  | 'governance'
  | 'trials'
  | 'genomics'
  | 'pubmed'
  | 'chat'
  | 'ecosystem';

export default function App() {
  const [currentCase, setCurrentCase] = useState<PatientCase>(BENCHMARK_CASES[0]);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dossier');
  const [report, setReport] = useState<TumorBoardReport | null>(null);
  const [orchestrationResult, setOrchestrationResult] = useState<OrchestrationResult | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);

  // Inspector and Trial state cross-linking
  const [selectedAlteration, setSelectedAlteration] = useState<GenomicAlteration | undefined>(
    currentCase.genomicAlterations[0]
  );
  const [trialFilterIntervention, setTrialFilterIntervention] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // When patient case changes, update selected alteration and clear previous report
  const handleCaseChange = (newCase: PatientCase) => {
    setCurrentCase(newCase);
    setSelectedAlteration(newCase.genomicAlterations[0]);
    setReport(null);
    setSynthesisError(null);
  };

  // Run Tumor Board AI synthesis
  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    setSynthesisError(null);
    try {
      const { report: generatedReport } = await generateTumorBoardAnalysis(currentCase);
      setReport(generatedReport);
      setActiveTab('synthesis');
    } catch (err: unknown) {
      setSynthesisError(
        err instanceof Error ? err.message : 'Error generating Tumor Board report'
      );
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Auto-trigger synthesis on initial mount so the user never lands on an empty state
  useEffect(() => {
    handleSynthesize();
  }, [currentCase.id]);

  // Click on alteration inside dossier jumps to Genomic Inspector
  const handleSelectAlterationForInspection = (alt: GenomicAlteration) => {
    setSelectedAlteration(alt);
    setActiveTab('genomics');
  };

  // Jump from synthesis regimen to clinical trials
  const handleSelectInterventionForTrials = (drug: string) => {
    setTrialFilterIntervention(drug);
    setActiveTab('trials');
  };

  // Export report to clipboard / JSON
  const handleExportReport = () => {
    if (!report) return;
    const summaryText = `ONCO AGENT - MOLECULAR TUMOR BOARD REPORT
============================================================
CASE REF: ${currentCase.patientRef} | ${currentCase.age}yo ${currentCase.sex}
DIAGNOSIS: ${currentCase.cancerType} (${currentCase.histology}) - ${currentCase.stage}
ECOG: ${currentCase.ecogScore} | LINE: ${currentCase.lineOfTherapy}

SOMATIC ALTERATIONS:
${currentCase.genomicAlterations.map((a) => `- ${a.gene} ${a.hgvsProtein} (${a.variantType}, VAF ${a.vafPercent}%, Tier ${a.tier})`).join('\n')}

BIOMARKERS:
- MSI: ${currentCase.biomarkers.msiStatus}
- TMB: ${currentCase.biomarkers.tmbMutMb ?? 'N/A'} mut/Mb
- PD-L1: ${currentCase.biomarkers.pdL1TpsPercent ?? 'N/A'}% TPS
- HRD: ${currentCase.biomarkers.hrdStatus ?? 'N/A'}

EXECUTIVE CONSENSUS:
${report.executiveSummary}

RECOMMENDED REGIMENS:
${report.recommendedRegimens.map((r) => `[${r.category}] ${r.name} (${r.evidenceLevel})\nRationale: ${r.rationale}\nLandmarks: ${r.supportingTrialsOrPMIDs.join(', ')}`).join('\n\n')}

DISCLAIMER:
${report.scientificDisclaimer}`;

    navigator.clipboard.writeText(summaryText);
    setExportNotice('Tumor Board report summary copied to clipboard!');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-200">
      {/* 1. Global Navigation Header */}
      <Header
        currentCase={currentCase}
        onSelectCase={handleCaseChange}
        onOpenNewCaseModal={() => setIsEditModalOpen(true)}
        isSynthesizing={isSynthesizing}
        onTriggerSynthesize={handleSynthesize}
        hasSynthesis={Boolean(report)}
        onExportReport={handleExportReport}
      />

      {/* Export notification toast */}
      {exportNotice && (
        <div className="bg-emerald-600 text-white text-xs font-mono py-1.5 px-4 text-center sticky top-16 z-30 shadow-md flex items-center justify-center gap-2">
          <Check className="w-3.5 h-3.5" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 2. Benchmark Case Quick Selector Strip */}
      <div className="bg-slate-200/90 border-b border-slate-300/80 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">
              Select Case Benchmark:
            </span>
            {BENCHMARK_CASES.map((b) => {
              const isActive = currentCase.id === b.id;
              const primaryAlt = b.genomicAlterations[0]
                ? `${b.genomicAlterations[0].gene} ${b.genomicAlterations[0].hgvsProtein.split(' ')[0]}`
                : '';

              return (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => handleCaseChange(b)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer border ${
                    isActive
                      ? 'bg-blue-700 text-white border-blue-800 font-bold shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  <span className="font-semibold">{b.cancerType.split(' ')[0]}</span>
                  <span className="text-[10px] opacity-80 ml-1">({primaryAlt})</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-600 font-mono hidden md:block">
            Target Malignancy: <strong className="text-slate-900">{currentCase.cancerType}</strong> • {currentCase.stage}
          </div>
        </div>
      </div>

      {/* 3. Main Clinical Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Synthesis error alert if any */}
        {synthesisError && (
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <div className="space-y-1">
                <strong className="font-mono uppercase font-bold text-amber-950 flex items-center gap-1.5">
                  <span>Gemini Reasoning Notice</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-mono">
                    High Demand Spike
                  </span>
                </strong>
                <p className="text-amber-800 leading-relaxed font-sans">
                  {synthesisError.includes('503') || synthesisError.includes('demand')
                    ? 'The primary Gemini reasoning endpoint experienced a momentary peak traffic spike. Click Retry below to trigger the resilient multi-model cascade.'
                    : synthesisError}
                </p>
                <p className="text-[11px] text-amber-700 font-mono">
                  All live data (ClinVar, ClinicalTrials.gov, PubMed, Ensembl) remains fully operational.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-mono font-semibold text-xs flex-shrink-0 shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Brain className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
              <span>{isSynthesizing ? 'Retrying...' : 'Retry Synthesis'}</span>
            </button>
          </div>
        )}

        {/* Workspace Tab Selector Bar */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-1 flex flex-wrap gap-1 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('dossier')}
            className={`flex-1 min-w-[150px] py-2 px-3 rounded flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'dossier'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Patient & Genomics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('synthesis')}
            className={`flex-1 min-w-[140px] py-2 px-2.5 rounded flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'synthesis'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>2. Tumor Board AI {report ? '✓' : ''}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orchestration')}
            className={`flex-1 min-w-[140px] py-2 px-2.5 rounded flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'orchestration'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>3. Multi-Agent DAG</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('governance')}
            className={`flex-1 min-w-[140px] py-2 px-2.5 rounded flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'governance'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. Governance & Safety</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trials')}
            className={`flex-1 min-w-[140px] py-2 px-2.5 rounded flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'trials'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>5. ClinicalTrials.gov v2</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('genomics')}
            className={`flex-1 min-w-[140px] py-2 px-2.5 rounded flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'genomics'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>6. ClinVar & Ensembl</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pubmed')}
            className={`flex-1 min-w-[140px] py-2 px-2.5 rounded flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'pubmed'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>7. PubMed</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex-1 min-w-[140px] py-2 px-2.5 rounded flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>8. MTB Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ecosystem')}
            className={`flex-1 min-w-[140px] py-2 px-2.5 rounded flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'ecosystem'
                ? 'bg-teal-700 text-white font-bold shadow-xs'
                : 'text-teal-700 hover:text-teal-900 hover:bg-teal-50/60 font-semibold'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>9. Ecosystem (0x466A5450)</span>
          </button>
        </div>

        {/* 4. Active Tab Content Views */}
        <div>
          {activeTab === 'dossier' && (
            <PatientDossier
              patientCase={currentCase}
              onSelectAlterationForInspection={handleSelectAlterationForInspection}
              selectedAltId={selectedAlteration?.id}
            />
          )}

          {activeTab === 'synthesis' && (
            <TumorBoardSynthesis
              report={report}
              isLoading={isSynthesizing}
              onSelectInterventionFilter={handleSelectInterventionForTrials}
            />
          )}

          {activeTab === 'orchestration' && (
            <OrchestrationPipelineView
              patientCase={currentCase}
              orchestrationResult={orchestrationResult}
              onOrchestrationComplete={(res) => setOrchestrationResult(res)}
            />
          )}

          {activeTab === 'governance' && (
            <GovernanceGuardrailsView patientCase={currentCase} />
          )}

          {activeTab === 'trials' && (
            <ClinicalTrialsExplorer
              patientCase={currentCase}
              preselectedIntervention={trialFilterIntervention}
            />
          )}

          {activeTab === 'genomics' && (
            <GenomicInspector
              initialAlteration={selectedAlteration}
              alterationsList={currentCase.genomicAlterations}
            />
          )}

          {activeTab === 'pubmed' && <PubMedExplorer patientCase={currentCase} />}

          {activeTab === 'chat' && <TumorBoardChat patientCase={currentCase} />}

          {activeTab === 'ecosystem' && (
            <EcosystemBridgeView onLoadPatientCase={handleCaseChange} />
          )}
        </div>
      </main>

      {/* 5. Custom Patient Case Edit Modal */}
      <EditCaseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        caseToEdit={currentCase}
        onSaveCase={(updated) => {
          handleCaseChange(updated);
        }}
      />

      {/* 6. Footer & Provenance Documentation */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-5 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong className="text-white">ONCO AGENT</strong> • Precision Oncology Decision Support System
          </div>
          <div className="text-[11px] text-slate-400">
            Authoritative APIs: NCBI ClinVar • ClinicalTrials.gov v2 • NCBI PubMed • Ensembl REST • Google Gemini 3.8 Flash
          </div>
        </div>
      </footer>
    </div>
  );
}
