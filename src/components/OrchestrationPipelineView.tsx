import React, { useState } from 'react';
import { PatientCase } from '../types/oncology';
import { OrchestrationResult, AgentExecutionTrace } from '../types/governance';
import { runOrchestration } from '../services/apiClient';
import {
  Workflow,
  CheckCircle2,
  AlertTriangle,
  Play,
  RefreshCw,
  Cpu,
  Clock,
  Layers,
  ShieldCheck,
  Brain,
  ChevronRight,
  Flame,
  FileCheck2,
  ListOrdered,
  Search,
  HeartPulse,
} from 'lucide-react';

interface OrchestrationPipelineProps {
  patientCase: PatientCase;
  orchestrationResult: OrchestrationResult | null;
  onOrchestrationComplete: (result: OrchestrationResult) => void;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  molecular_pathology: <FileCheck2 className="w-4 h-4 text-blue-600" />,
  mechanism_resistance: <Flame className="w-4 h-4 text-amber-600" />,
  therapeutic_guidelines: <ListOrdered className="w-4 h-4 text-emerald-600" />,
  trial_matching: <Search className="w-4 h-4 text-teal-600" />,
  pharmacovigilance: <HeartPulse className="w-4 h-4 text-rose-600" />,
  consensus_chair: <Brain className="w-4 h-4 text-indigo-600" />,
};

export const OrchestrationPipelineView: React.FC<OrchestrationPipelineProps> = ({
  patientCase,
  orchestrationResult,
  onOrchestrationComplete,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTraceIndex, setActiveTraceIndex] = useState<number>(0);

  const handleRunPipeline = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const { result } = await runOrchestration(patientCase);
      onOrchestrationComplete(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Orchestration execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const traces = orchestrationResult?.executionTraces || [];
  const activeTrace = traces[activeTraceIndex] || traces[0];

  const totalLatencyMs = traces.reduce((acc, t) => acc + t.latencyMs, 0);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100 font-sans">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-t-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Workflow className="w-5 h-5 text-teal-400" />
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
                Multi-Agent Tumor Board Orchestration Pipeline
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-900/80 text-teal-300 border border-teal-700/60 uppercase">
                DAG Workflow v2.4
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl font-sans">
              Coordinates 6 specialized AI sub-agents in sequential and cross-reconciled deliberation to evaluate somatic tiering, bypass circuits, guideline regimens, trial eligibility, and pharmacovigilance.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunPipeline}
            disabled={isRunning}
            className={`px-4 py-2 rounded text-xs font-mono font-bold shadow transition flex items-center space-x-2 cursor-pointer ${
              isRunning
                ? 'bg-blue-800 text-blue-200 cursor-not-allowed opacity-80'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Orchestrating Sub-Agents...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Multi-Agent Deliberation</span>
              </>
            )}
          </button>
        </div>

        {/* Telemetry bar */}
        {orchestrationResult && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-300 gap-3">
            <div className="flex items-center space-x-4">
              <span>
                Status:{' '}
                <strong
                  className={
                    orchestrationResult.pipelineStatus === 'COMPLETED_CLEAN'
                      ? 'text-emerald-400'
                      : orchestrationResult.pipelineStatus === 'COMPLETED_WITH_WARNINGS'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }
                >
                  {orchestrationResult.pipelineStatus.replace(/_/g, ' ')}
                </strong>
              </span>
              <span>
                Cumulative Latency:{' '}
                <strong className="text-white">{(totalLatencyMs / 1000).toFixed(2)}s</strong>
              </span>
              <span>
                Consensus Confidence:{' '}
                <strong className="text-teal-400">
                  {orchestrationResult.overallConsensusConfidence}%
                </strong>
              </span>
            </div>

            <div className="text-[10px] text-slate-400">
              Run ID: <code className="text-slate-300">{orchestrationResult.orchestrationId}</code>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-800 text-xs flex items-center gap-2 border-b border-rose-200">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* DAG Flow Visualization */}
      <div className="p-4 sm:p-5 bg-slate-50/70">
        <h3 className="text-xs font-bold font-mono text-slate-800 uppercase tracking-wide mb-3 flex items-center justify-between">
          <span>1. Sub-Agent Execution Topology</span>
          <span className="text-[11px] font-normal text-slate-500">
            Click agent to inspect telemetry & findings
          </span>
        </h3>

        {traces.length === 0 ? (
          <div className="p-8 text-center bg-white rounded border border-dashed border-slate-300 text-xs text-slate-500 space-y-2">
            <Cpu className="w-6 h-6 mx-auto text-slate-400" />
            <p>Pipeline is ready to execute.</p>
            <p className="text-[11px] text-slate-400">
              Click &quot;Run Multi-Agent Deliberation&quot; above to trigger parallel pathology, mechanism, guideline, and trial reasoning.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {traces.map((trace, idx) => {
              const isActive = activeTraceIndex === idx;

              return (
                <button
                  type="button"
                  key={trace.agentRole}
                  onClick={() => setActiveTraceIndex(idx)}
                  className={`p-3 rounded border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-300 shadow-xs'
                      : 'bg-white hover:bg-slate-100/70 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1 rounded bg-slate-100">
                      {AGENT_ICONS[trace.agentRole] || <Cpu className="w-3.5 h-3.5" />}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {(trace.latencyMs / 1000).toFixed(1)}s
                    </span>
                  </div>

                  <div className="font-bold text-[11px] text-slate-900 leading-tight mb-1 truncate">
                    {trace.title.split(' ')[0]} {trace.title.split(' ')[1]}
                  </div>

                  <div className="text-[10px] text-slate-500 line-clamp-1">
                    {trace.agentRole.replace(/_/g, ' ')}
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{trace.confidenceScore}%</span>
                    </span>
                    <span className="text-slate-400">{trace.modelUsed.split('-')[1]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Agent Detailed Execution Trace */}
      {activeTrace && (
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded bg-blue-100 text-blue-800">
                {AGENT_ICONS[activeTrace.agentRole] || <Cpu className="w-4 h-4" />}
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{activeTrace.title}</h4>
                <p className="text-[11px] text-slate-500 font-mono">{activeTrace.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                Model: <strong>{activeTrace.modelUsed}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold">
                Confidence: {activeTrace.confidenceScore}%
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded bg-blue-50/40 border border-blue-200/80 mb-3 text-xs leading-relaxed">
            <strong className="text-blue-950 font-mono uppercase text-[10px] block mb-1">
              Primary Agent Directive:
            </strong>
            <p className="text-slate-800 font-medium font-sans">{activeTrace.keyDirective}</p>
          </div>

          {activeTrace.findings.length > 0 && (
            <div>
              <h5 className="text-[11px] font-mono uppercase font-semibold text-slate-700 mb-2">
                Deliberation Findings & Evidence Assertions:
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {activeTrace.findings.map((f, i) => (
                  <li
                    key={i}
                    className="p-2 rounded bg-slate-50 border border-slate-200 flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Chair Consensus Synthesis */}
      {orchestrationResult?.chairSynthesis && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/60 to-white">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-4 h-4 text-indigo-700" />
            <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-indigo-950">
              Tumor Board Chair Reconciled Synthesis
            </h4>
          </div>
          <p className="text-xs leading-relaxed text-slate-800 font-sans">
            {orchestrationResult.chairSynthesis}
          </p>
        </div>
      )}
    </div>
  );
};
