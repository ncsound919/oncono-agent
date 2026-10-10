import React, { useState, useEffect } from 'react';
import { PatientCase } from '../types/oncology';
import { fetchHarmonizedPriors, scorePatientAnomaly } from '../services/apiClient';
import {
  ShieldAlert,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  RefreshCw,
  Cpu,
  Fingerprint,
  TrendingUp,
  FileCheck2,
  Flame,
  ArrowRight,
  Eye,
  Scale,
  Sparkles,
} from 'lucide-react';

interface MultiAgentDetectionCoreProps {
  patientCase: PatientCase;
}

export const MultiAgentDetectionCoreView: React.FC<MultiAgentDetectionCoreProps> = ({
  patientCase,
}) => {
  const [priors, setPriors] = useState<Record<string, any>>({});
  const [detectionResult, setDetectionResult] = useState<any | null>(null);
  const [isLoadingPriors, setIsLoadingPriors] = useState(false);
  const [isScoring, setIsScoring] = useState(false);

  const loadPriors = async () => {
    setIsLoadingPriors(true);
    try {
      const { priors: p } = await fetchHarmonizedPriors();
      setPriors(p);
    } catch (err) {
      console.error('Failed to load priors:', err);
    } finally {
      setIsLoadingPriors(false);
    }
  };

  const handleRunDetection = async () => {
    setIsScoring(true);
    try {
      const { result } = await scorePatientAnomaly(patientCase);
      setDetectionResult(result);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Detection scoring failed');
    } finally {
      setIsScoring(false);
    }
  };

  useEffect(() => {
    loadPriors();
    handleRunDetection();
  }, [patientCase.id]);

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* 1. Architecture Flow Banner */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white font-mono shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Multi-Agent Anomaly Detection Core & Metric Harmonizer
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-teal-900/80 text-teal-300 border border-teal-700/60 uppercase">
              Wet-Lab Driven Priors
            </span>
          </div>

          <button
            type="button"
            onClick={handleRunDetection}
            disabled={isScoring}
            className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs ${
              isScoring
                ? 'bg-blue-800 text-blue-200 cursor-not-allowed'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
            }`}
          >
            {isScoring ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Modulating Priors...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Re-Score Anomaly Vector</span>
              </>
            )}
          </button>
        </div>

        <p className="text-slate-300 font-sans text-xs max-w-3xl leading-relaxed">
          Wires external wet-lab ledger counts (IDC 166.7k studies, CELLxGENE 397 collections, CMP 30 models) into dynamic reference priors. Automatically applies unit-of-analysis corrections (Study UIDs vs Patient counts) and pagination discount penalties.
        </p>

        {/* Dynamic Architecture Flow Pipeline */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">
            Supplementary Ledger
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-teal-700/40 font-bold">
            Metric Harmonizer & Normalizer
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-indigo-700/40 font-bold">
            Multi-Agent Detection Core
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-emerald-700/40 font-bold">
            Global Lens & Debate
          </span>
        </div>
      </div>

      {/* 2. Harmonized Cohort Priors Table */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <h4 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
              Harmonized Wet-Lab Cohort Priors (Ingestion Guard)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Drops undefined/NaN • Calibrated via <code>LedgerHarmonizer</code>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono text-xs">
          {Object.entries(priors).map(([expId, prior]: [string, any]) => (
            <div
              key={expId}
              className={`p-3 rounded border space-y-1.5 ${
                !prior.isUnitOfAnalysisValid
                  ? 'bg-amber-50/60 border-amber-200'
                  : prior.dataQualityScore < 0.9
                  ? 'bg-slate-50 border-slate-300'
                  : 'bg-emerald-50/40 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{expId}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    !prior.isUnitOfAnalysisValid
                      ? 'bg-amber-200 text-amber-900'
                      : prior.dataQualityScore < 0.9
                      ? 'bg-slate-200 text-slate-800'
                      : 'bg-emerald-200 text-emerald-900'
                  }`}
                >
                  Quality: {prior.dataQualityScore * 100}%
                </span>
              </div>

              <div className="text-slate-700 text-[11px] truncate">{prior.sourceId}</div>

              <div className="text-sm font-bold text-slate-900">
                {prior.sampleBaselineSize.toLocaleString()}{' '}
                <span className="text-[10px] font-normal text-slate-500">baseline N</span>
              </div>

              <div className="pt-1 border-t border-slate-200/80 text-[10px] space-y-0.5">
                <div className="flex justify-between text-slate-600">
                  <span>Sample weight:</span>
                  <strong className="text-teal-700">{prior.sampleWeight}x</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Confidence factor:</span>
                  <strong className="text-indigo-700">{prior.effectiveConfidenceFactor}x</strong>
                </div>
              </div>

              <div className="text-[9px] text-slate-500 font-sans leading-tight mt-1">
                {prior.unitOfAnalysisNote}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Multi-Agent Detection Results */}
      {detectionResult && (
        <div className="space-y-3">
          {/* Composite Anomaly Header */}
          <div className="p-3.5 rounded-lg border border-indigo-200 bg-indigo-50/40 flex flex-wrap items-center justify-between gap-3 font-mono">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-950 block">
                Composite Clinical Anomaly Score (Patient {patientCase.patientRef}):
              </span>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-2xl font-bold text-indigo-900">
                  {detectionResult.compositeClinicalAnomalyScore}
                </span>
                <span className="text-xs text-indigo-700 font-sans font-medium">
                  / 100 (Dynamically weighted across ctDNA, Radiomics & Wet-Lab Priors)
                </span>
              </div>
            </div>

            <div className="text-right text-[11px]">
              <span className="px-2.5 py-1 rounded bg-indigo-700 text-white font-bold inline-block shadow-2xs">
                CLINICAL DRIFT DETECTED
              </span>
            </div>
          </div>

          {/* Three Agent Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {detectionResult.agentScores.map((agent: any) => (
              <div
                key={agent.agentName}
                className="p-3.5 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between font-mono mb-1">
                    <span className="font-bold text-slate-900 text-[11px]">{agent.agentName}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {agent.domainKey}
                    </span>
                  </div>

                  {/* Signal Score Modulation */}
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 font-mono text-[11px] my-2 space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Raw Signal Score:</span>
                      <strong className="text-slate-800">{agent.rawSignalScore}</strong>
                    </div>
                    <div className="flex justify-between text-teal-700 font-semibold">
                      <span>Wet-Lab Adjusted:</span>
                      <strong className="text-teal-900 text-xs">{agent.adjustedScore}</strong>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Prior Multiplier:</span>
                      <span>{agent.confidenceMultiplier}x</span>
                    </div>
                  </div>

                  {agent.unitOfAnalysisCaveat && (
                    <div className="p-1.5 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-900 mb-2 font-mono flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.2" />
                      <span>{agent.unitOfAnalysisCaveat}</span>
                    </div>
                  )}

                  <div className="space-y-1 text-slate-700 font-sans text-[11px]">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">
                      Agent Findings:
                    </span>
                    <ul className="space-y-1">
                      {agent.findings.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                          <span className="leading-tight">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">Significance:</span>
                  <span className="font-bold text-rose-700 uppercase">
                    {agent.clinicalSignificance.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 4. Global Lens Ledger & Adversarial Debate Output */}
          <div className="p-4 rounded-lg border border-slate-900 bg-slate-950 text-white font-mono space-y-2.5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2 text-teal-400">
                <FileCheck2 className="w-4 h-4" />
                <h4 className="font-bold text-xs uppercase tracking-wider">
                  Global Lens Ledger & Adversarial Debate Dossier
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/60 text-[10px] font-bold">
                {detectionResult.globalLensDebate.globalLensStatus}
              </span>
            </div>

            <div className="text-xs space-y-2">
              <div>
                <span className="text-[10px] uppercase font-semibold text-teal-300 block mb-0.5">
                  Winning Multi-Agent Hypothesis:
                </span>
                <p className="text-slate-200 font-sans leading-relaxed">
                  {detectionResult.globalLensDebate.winningHypothesis}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-amber-400 block mb-0.5">
                  Adversarial Referee Unit-of-Analysis Probe:
                </span>
                <p className="text-slate-300 font-sans leading-relaxed">
                  {detectionResult.globalLensDebate.adversarialCritique}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 flex flex-wrap justify-between gap-2">
                <span>
                  Unit Resolution:{' '}
                  <strong className="text-slate-200 font-sans">
                    {detectionResult.globalLensDebate.unitOfAnalysisResolution}
                  </strong>
                </span>
                <span>Debate ID: {detectionResult.globalLensDebate.debateId}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
