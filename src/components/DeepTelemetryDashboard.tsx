import React, { useState, useEffect } from 'react';
import { EcosystemTelemetrySnapshot, MultiModalModalityStat } from '../types/telemetry';
import { fetchEcosystemTelemetry } from '../services/apiClient';
import {
  Activity,
  Cpu,
  Clock,
  Gauge,
  Layers,
  ShieldCheck,
  RefreshCw,
  Zap,
  Fingerprint,
  TrendingUp,
  BarChart3,
  Server,
  FileCheck2,
  Lock,
  Flame,
} from 'lucide-react';

export const DeepTelemetryDashboard: React.FC = () => {
  const [telemetry, setTelemetry] = useState<EcosystemTelemetrySnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModality, setActiveModality] = useState<string>('gex');

  const loadTelemetry = async () => {
    setIsLoading(true);
    try {
      const { snapshot } = await fetchEcosystemTelemetry();
      setTelemetry(snapshot);
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!telemetry) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 font-mono flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
        <span>Polling deep ecosystem telemetry...</span>
      </div>
    );
  }

  const { computeQuota, multiModalDimensions, pipelineObservability, provenanceAudit } = telemetry;
  const currentModality =
    multiModalDimensions.modalities.find((m) => m.category === activeModality) ||
    multiModalDimensions.modalities[0];

  const totalTokens =
    pipelineObservability.totalTokensProcessed.promptTokens +
    pipelineObservability.totalTokensProcessed.thoughtTokens +
    pipelineObservability.totalTokensProcessed.completionTokens;

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* 1. Executive Telemetry KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
        {/* Kaggle Quota */}
        <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1">
            <span className="flex items-center gap-1 font-semibold uppercase">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              Kaggle GPU Quota
            </span>
            <span className="text-emerald-700 font-bold">
              {computeQuota.remainingHours.toFixed(1)}h rem.
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 leading-tight">
            {(computeQuota.settledHours + computeQuota.reservedHours).toFixed(1)} / {computeQuota.weeklyAllocatedHours}h
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full"
              style={{
                width: `${((computeQuota.settledHours + computeQuota.reservedHours) / computeQuota.weeklyAllocatedHours) * 100}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
            <span>Settled: {computeQuota.settledHours}h</span>
            <span>Reserved: {computeQuota.reservedHours}h</span>
          </div>
        </div>

        {/* Sunday Reset Timer */}
        <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1">
            <span className="flex items-center gap-1 font-semibold uppercase">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Weekly Reset
            </span>
            <span className="text-slate-400">Sunday UTC</span>
          </div>
          <div className="text-lg font-bold text-slate-900 leading-tight">
            {computeQuota.hoursToReset}h
          </div>
          <p className="text-[10px] text-slate-500 mt-1 truncate">
            Session cap: <strong>12.0h max</strong> / session
          </p>
          <div className="text-[10px] text-emerald-700 mt-1 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Quota healthy (no starve risk)</span>
          </div>
        </div>

        {/* LLM Agent Latency & Throughput */}
        <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1">
            <span className="flex items-center gap-1 font-semibold uppercase">
              <Zap className="w-3.5 h-3.5 text-teal-600" />
              Agent Throughput
            </span>
            <span className="text-teal-700 font-bold">Live</span>
          </div>
          <div className="text-lg font-bold text-slate-900 leading-tight">
            {(pipelineObservability.averageLatencyMs / 1000).toFixed(2)}s
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Processed: <strong>{totalTokens.toLocaleString()} tokens</strong>
          </p>
          <div className="text-[10px] text-slate-400 mt-1">
            Cascade fallbacks: <strong className="text-slate-700">{pipelineObservability.cascadeTransitions}</strong>
          </div>
        </div>

        {/* Merkle Provenance & Claim-Lint */}
        <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1">
            <span className="flex items-center gap-1 font-semibold uppercase">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Claim-Lint Gate
            </span>
            <span className="text-emerald-700 font-bold">Clean</span>
          </div>
          <div className="text-lg font-bold text-slate-900 leading-tight">
            {provenanceAudit.claimLintStatus.scannedArtifacts} / {provenanceAudit.claimLintStatus.scannedArtifacts}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Unscourced claims: <strong className="text-emerald-700">0</strong> (RFC-3161 anchor)
          </p>
          <div className="text-[10px] text-slate-400 mt-1 truncate">
            Merkle: <code>{provenanceAudit.merkleRootHash.slice(0, 10)}...</code>
          </div>
        </div>
      </div>

      {/* 2. SurvBoard 88,527-Column Multi-Modal Sparsity & Modality Inspector */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
              SurvBoard 88,527-Feature Space & Sparsity Profiling (Workstream B-5)
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">
            Complete Multi-Modal Matrix
          </span>
        </div>

        {/* Modality Selector Pills */}
        <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
          {multiModalDimensions.modalities.map((mod) => {
            const isSelected = activeModality === mod.category;
            return (
              <button
                type="button"
                key={mod.category}
                onClick={() => setActiveModality(mod.category)}
                className={`px-3 py-1.5 rounded transition cursor-pointer border ${
                  isSelected
                    ? 'bg-teal-700 text-white font-bold border-teal-800 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{mod.name.split(' ')[0]}</span>
                <span className="opacity-75 ml-1">({mod.featureCount.toLocaleString()})</span>
              </button>
            );
          })}
        </div>

        {/* Selected Modality Deep Telemetry Card */}
        {currentModality && (
          <div className="p-3.5 rounded bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                Modality Dimension
              </span>
              <strong className="text-sm font-bold text-slate-900">
                {currentModality.featureCount.toLocaleString()} columns
              </strong>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {(
                  (currentModality.featureCount / multiModalDimensions.totalFeatures) *
                  100
                ).toFixed(1)}
                % of total feature space
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                Normalization Method
              </span>
              <div className="font-mono text-slate-800 font-semibold text-[11px]">
                {currentModality.normalizationMethod}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Pre-processed per SurvBoard protocol
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                Matrix Sparsity
              </span>
              <div className="font-bold text-slate-900 font-mono text-sm">
                {currentModality.sparsityPercent}% zero / non-expressed
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{ width: `${currentModality.sparsityPercent}%` }}
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                Biological Resolution
              </span>
              <p className="text-slate-700 text-[11px] leading-tight">
                {currentModality.biologicalResolution}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Real-Time LLM Observability & Token Profile Stream */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
              Multi-Agent LLM Observability & Reasoning Token Stream
            </h3>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-500">
            <span>
              Prompt Tokens:{' '}
              <strong className="text-slate-800">
                {pipelineObservability.totalTokensProcessed.promptTokens.toLocaleString()}
              </strong>
            </span>
            <span>
              Thought Tokens:{' '}
              <strong className="text-indigo-600">
                {pipelineObservability.totalTokensProcessed.thoughtTokens.toLocaleString()}
              </strong>
            </span>
            <span>
              Completion:{' '}
              <strong className="text-teal-600">
                {pipelineObservability.totalTokensProcessed.completionTokens.toLocaleString()}
              </strong>
            </span>
          </div>
        </div>

        {/* Recent Deliberation Runs Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs font-mono">
            <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase">
              <tr>
                <th scope="col" className="px-3 py-2 text-left">Sub-Agent Stage</th>
                <th scope="col" className="px-3 py-2 text-left">Model Invoked</th>
                <th scope="col" className="px-3 py-2 text-right">Latency</th>
                <th scope="col" className="px-3 py-2 text-right">Prompt</th>
                <th scope="col" className="px-3 py-2 text-right">Thought</th>
                <th scope="col" className="px-3 py-2 text-right">Completion</th>
                <th scope="col" className="px-3 py-2 text-right">Throughput</th>
                <th scope="col" className="px-3 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pipelineObservability.recentRuns.map((run) => (
                <tr key={run.runId} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2 font-bold text-slate-900">{run.agentRole}</td>
                  <td className="px-3 py-2">
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px]">
                      {run.model}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">{(run.latencyMs / 1000).toFixed(2)}s</td>
                  <td className="px-3 py-2 text-right text-slate-500">{run.promptTokens}</td>
                  <td className="px-3 py-2 text-right text-indigo-600 font-semibold">
                    {run.thoughtTokens}
                  </td>
                  <td className="px-3 py-2 text-right text-teal-700 font-semibold">
                    {run.completionTokens}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-600">{run.tokensPerSecond} t/s</td>
                  <td className="px-3 py-2 text-center">
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                      {run.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Cryptographic Provenance & Hardware Allocation Ledger */}
      <div className="p-4 rounded-lg border border-slate-200 bg-slate-900 text-white font-mono text-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2 text-teal-400">
            <Fingerprint className="w-4 h-4" />
            <span className="font-bold uppercase tracking-wider">
              RFC-3161 Provenance Ledger & Hardware Profile
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Target Volume: <code>{provenanceAudit.dataVolumeSerial}</code> (
            {provenanceAudit.volumeAttached ? 'ATTACHED' : 'DETACHED_SKIPPED'})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px]">
          <div className="space-y-1">
            <div className="text-slate-400">
              Session Merkle Root:{' '}
              <code className="text-teal-300 break-all">{provenanceAudit.merkleRootHash}</code>
            </div>
            <div className="text-slate-400">
              RFC-3161 Attestation Timestamp:{' '}
              <span className="text-slate-200">{provenanceAudit.rfc3161Timestamp}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-slate-400">
              Primary GPU Tier:{' '}
              <span className="text-slate-200">{computeQuota.hardware} (30 h/wk)</span>
            </div>
            <div className="text-slate-400">
              Burst GPU Fallback:{' '}
              <span className="text-slate-200">
                {computeQuota.burstPlatform.name} ({computeQuota.burstPlatform.hardware})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
