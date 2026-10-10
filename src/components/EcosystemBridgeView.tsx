import React, { useState, useEffect } from 'react';
import { PatientCase } from '../types/oncology';
import {
  DataVolumeStatus,
  RecourseComputePlatform,
  ExternalSourceStatus,
  KaggleDatasetManifest,
  SurvboardCohortSample,
  RecourseJobSubmission,
} from '../types/ecosystem';
import {
  fetchEcosystemStatus,
  fetchKaggleManifests,
  fetchSurvboardCohorts,
  submitRecourseExperiment,
} from '../services/apiClient';
import {
  HardDrive,
  Cpu,
  Layers,
  FileText,
  Play,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  Terminal,
  Database,
  ShieldCheck,
  Award,
  Zap,
  Activity,
  Gauge,
  Scale,
} from 'lucide-react';
import { DeepTelemetryDashboard } from './DeepTelemetryDashboard';
import { MultiAgentDetectionCoreView } from './MultiAgentDetectionCoreView';

interface EcosystemBridgeProps {
  onLoadPatientCase: (patientCase: PatientCase) => void;
  currentPatientCase?: PatientCase;
}

export const EcosystemBridgeView: React.FC<EcosystemBridgeProps> = ({
  onLoadPatientCase,
  currentPatientCase,
}) => {
  const [activeSubView, setActiveSubView] = useState<'detection' | 'telemetry' | 'infrastructure'>('detection');
  const [volumeStatus, setVolumeStatus] = useState<DataVolumeStatus | null>(null);
  const [computePlatforms, setComputePlatforms] = useState<RecourseComputePlatform[]>([]);
  const [wetLabSources, setWetLabSources] = useState<ExternalSourceStatus[]>([]);
  const [kaggleManifests, setKaggleManifests] = useState<KaggleDatasetManifest[]>([]);
  const [survboardCohorts, setSurvboardCohorts] = useState<SurvboardCohortSample[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Recourse job submission state
  const [selectedExperiment, setSelectedExperiment] = useState('survival-cox');
  const [selectedHardware, setSelectedHardware] = useState<'cpu' | 'gpu' | 'tpu'>('cpu');
  const [isDispatchingJob, setIsDispatchingJob] = useState(false);
  const [jobSubmission, setJobSubmission] = useState<RecourseJobSubmission | null>(null);
  const [importedNotice, setImportedNotice] = useState<string | null>(null);

  const loadAllEcosystemData = async () => {
    setIsLoading(true);
    try {
      const [statusRes, kaggleRes, cohortsRes] = await Promise.all([
        fetchEcosystemStatus(),
        fetchKaggleManifests(),
        fetchSurvboardCohorts(),
      ]);

      setVolumeStatus(statusRes.dataVolume);
      setComputePlatforms(statusRes.computePlatforms);
      setWetLabSources(statusRes.wetLabSources);
      setKaggleManifests(kaggleRes.manifests);
      setSurvboardCohorts(cohortsRes.cohorts);
    } catch (err) {
      console.error('Failed to load ecosystem data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllEcosystemData();
  }, []);

  const handleDispatchJob = async () => {
    setIsDispatchingJob(true);
    try {
      const { submission } = await submitRecourseExperiment(selectedExperiment, selectedHardware);
      setJobSubmission(submission);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Job dispatch failed');
    } finally {
      setIsDispatchingJob(false);
    }
  };

  const handleImportSample = (sample: SurvboardCohortSample) => {
    onLoadPatientCase(sample.patientCaseEquivalent);
    setImportedNotice(
      `Imported ${sample.sampleId} (${sample.cohort} - ${sample.primaryDiagnosis}) into active Tumor Board!`
    );
    setTimeout(() => setImportedNotice(null), 5000);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100 font-sans">
      {/* 1. Ecosystem Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-t-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-teal-400" />
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
                Ecosystem Integration Bridge & Infrastructure
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-900/80 text-teal-300 border border-teal-700/60 uppercase">
                Serial 0x466A5450
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl font-sans">
              Connects Onco Agent with the removable oncology data volume, the Recourse remote compute lane (Kaggle/HF/E2B), the wet-lab external data ledger, and the SurvBoard TCGA multi-modal benchmark.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-slate-800 p-0.5 rounded flex text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveSubView('detection')}
                className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center space-x-1.5 ${
                  activeSubView === 'detection'
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Detection Core (Wet-Lab)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubView('telemetry')}
                className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center space-x-1.5 ${
                  activeSubView === 'telemetry'
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>Telemetry & Quota</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubView('infrastructure')}
                className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center space-x-1.5 ${
                  activeSubView === 'infrastructure'
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Volume & Ingest</span>
              </button>
            </div>

            <button
              type="button"
              onClick={loadAllEcosystemData}
              disabled={isLoading}
              className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title="Refresh ecosystem status"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {importedNotice && (
          <div className="mt-3 p-2.5 rounded bg-emerald-950/80 border border-emerald-500/80 text-xs text-emerald-200 flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{importedNotice}</span>
          </div>
        )}
      </div>

      {activeSubView === 'telemetry' ? (
        <div className="p-4 sm:p-5">
          <DeepTelemetryDashboard />
        </div>
      ) : (
        <>
          {/* 2. Removable Oncology Data Volume (0x466A5450) Status */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
              1. Oncology Data Volume Resolver (Serial 0x466A5450)
            </h3>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                volumeStatus?.isAttached
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {volumeStatus?.isAttached ? 'Volume Attached' : 'Volume Detached (Expected)'}
            </span>
            <span className="text-slate-400 text-[10px]">
              Override: <code>ONCOLOGY_DATA_ROOT</code>
            </span>
          </div>
        </div>

        <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 font-sans mb-3">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 font-medium">Fail-Closed Resolution Rule: </strong>
              The 114.6 GB removable data volume is expected to be detached during cloud container runs. Per ecosystem protocol, missing media raises <code className="font-mono text-[11px] bg-slate-200 px-1 py-0.2 rounded">DataVolumeAbsent</code> and callers mark operations as <span className="font-semibold text-slate-800">skipped</span> (never a system failure or false alert).
            </div>
          </div>
        </div>

        {/* Subtree Registry Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs font-mono">
            <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase">
              <tr>
                <th scope="col" className="px-3 py-2 text-left">Registered Subtree</th>
                <th scope="col" className="px-3 py-2 text-right">Expected Files</th>
                <th scope="col" className="px-3 py-2 text-right">Size</th>
                <th scope="col" className="px-3 py-2 text-left">Manifest Contents</th>
                <th scope="col" className="px-3 py-2 text-center">Volume Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {volumeStatus?.registeredSubtrees.map((st) => (
                <tr key={st.name}>
                  <td className="px-3 py-2 font-bold text-slate-900">{st.name}</td>
                  <td className="px-3 py-2 text-right">{st.expectedFiles.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{st.expectedSizeGb} GB</td>
                  <td className="px-3 py-2 text-slate-600 font-sans text-[11px]">{st.description}</td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] ${
                        st.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {st.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. SurvBoard TCGA Multi-Modal Ingest to Tumor Board */}
      <div className="p-4 sm:p-5 bg-slate-50/50">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <FolderTree className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
              2. SurvBoard TCGA Multi-Modal Cohort Ingest (Workstream B-5)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            88,527-column multimodal matrices (gex, cnv, meth, mut, OS)
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-3 font-sans">
          Click <strong>&quot;Import into Tumor Board&quot;</strong> on any benchmark sample to instantly map TCGA somatic mutations, VAFs, TMB, and clinical labs into Onco Agent for full multi-agent DAG deliberation and safety guardrail evaluation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {survboardCohorts.map((sample) => (
            <div
              key={sample.sampleId}
              className="p-3 rounded border border-slate-200 bg-white shadow-2xs text-xs space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between font-mono mb-1">
                  <span className="font-bold text-slate-900">{sample.sampleId}</span>
                  <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                    {sample.cohort}
                  </span>
                </div>

                <div className="text-slate-800 font-semibold text-xs">{sample.primaryDiagnosis}</div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {sample.stage} • OS: <strong>{sample.osDays} days</strong> ({sample.vitalStatus})
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                    Key Somatic Mutations:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {sample.keyMutations.map((m, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 text-[10px] font-mono border border-slate-200"
                      >
                        {m.gene} {m.alteration} {m.vaf ? `(${m.vaf}%)` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleImportSample(sample)}
                className="w-full mt-2 py-1.5 px-2 rounded bg-teal-600 hover:bg-teal-700 text-white font-mono font-bold text-[11px] flex items-center justify-center space-x-1 transition cursor-pointer shadow-2xs"
              >
                <span>Import into Tumor Board</span>
                <Zap className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recourse Remote Compute Lane (Kaggle/HF/E2B) */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
              3. Recourse Remote Compute Lane & Experiment Dispatcher
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Kaggle 30h/wk GPU ledger • Envelope: <code className="text-slate-700">__RECOURSE_RESULT__</code>
          </span>
        </div>

        {/* Compute Platforms Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-xs font-mono">
          {computePlatforms.map((plat) => (
            <div key={plat.platformId} className="p-2.5 rounded border border-slate-200 bg-slate-50/60">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">{plat.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    plat.status === 'up'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {plat.status.toUpperCase()}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-sans truncate">{plat.hardware}</div>
              <div className="mt-1 text-[10px] text-slate-600">
                Quota: <strong>{plat.remainingHours}h</strong> / {plat.weeklyQuotaHours}h
              </div>
            </div>
          ))}
        </div>

        {/* Dispatch Recourse Job Box */}
        <div className="p-3.5 rounded border border-indigo-200 bg-indigo-50/30 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 font-mono">
            <span className="font-bold text-indigo-950 uppercase text-[11px]">
              Execute Remote Experiment (E1–E10 Allocation):
            </span>
            <span className="text-slate-500 text-[10px]">Returns verified JSON envelope</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-3">
            <div className="sm:col-span-5">
              <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                Experiment ID
              </label>
              <select
                value={selectedExperiment}
                onChange={(e) => setSelectedExperiment(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs bg-white"
              >
                <option value="survival-cox">E9: survival-cox (Cox Proportional Hazards)</option>
                <option value="tumor-immune-ensemble">E7: tumor-immune-ensemble (Bayesian Posterior)</option>
                <option value="conformal-response">E4: conformal-response (Conformal Abstention)</option>
                <option value="fm-embed">E2: fm-embed (Pathology Slide Embedding)</option>
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                Hardware Target
              </label>
              <select
                value={selectedHardware}
                onChange={(e) => setSelectedHardware(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs bg-white"
              >
                <option value="cpu">CPU (Xeon 4-core, scipy/numpy, Free)</option>
                <option value="gpu">GPU (NVIDIA T4 16GB, Kaggle Quota)</option>
                <option value="tpu">TPU (Kaggle TPU v3-8)</option>
              </select>
            </div>

            <div className="sm:col-span-3 flex items-end">
              <button
                type="button"
                onClick={handleDispatchJob}
                disabled={isDispatchingJob}
                className="w-full py-1.5 px-3 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isDispatchingJob ? 'Dispatching...' : 'Dispatch Recourse'}</span>
              </button>
            </div>
          </div>

          {/* Result Envelope */}
          {jobSubmission?.resultEnvelope && (
            <div className="p-3 rounded bg-slate-900 text-slate-100 font-mono text-[11px] space-y-1">
              <div className="flex items-center justify-between text-teal-400 font-bold border-b border-slate-800 pb-1">
                <span>__RECOURSE_RESULT__ Envelope</span>
                <span>Job ID: {jobSubmission.jobId}</span>
              </div>
              <div className="pt-1 text-slate-300">
                Experiment: <strong className="text-white">{jobSubmission.resultEnvelope.__RECOURSE_RESULT__.experimentId}</strong> | Exit Code: 0
              </div>
              <div className="text-slate-300">
                Metrics: C-Index: <strong className="text-teal-300">{jobSubmission.resultEnvelope.__RECOURSE_RESULT__.metrics.c_index}</strong> • Brier Score: <strong className="text-teal-300">{jobSubmission.resultEnvelope.__RECOURSE_RESULT__.metrics.brier_score}</strong> • Integrated AUC: <strong className="text-teal-300">{jobSubmission.resultEnvelope.__RECOURSE_RESULT__.metrics.integrated_auc}</strong>
              </div>
              <div className="text-slate-400 text-[10px] truncate">
                Provenance SHA-256: {jobSubmission.resultEnvelope.__RECOURSE_RESULT__.provenanceHash}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. External Wet-Lab Public Data Ledger & Kaggle Manifests */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wet-Lab Sources */}
        <div>
          <div className="flex items-center space-x-2 mb-2 font-mono">
            <ExternalLink className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase">
              4. External Wet-Lab Data Ledger
            </h3>
          </div>
          <div className="space-y-2">
            {wetLabSources.map((src) => (
              <div
                key={src.sourceId}
                className="p-2.5 rounded border border-slate-200 bg-white text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-slate-900">{src.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      src.status === 'live' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {src.status.toUpperCase()}
                  </span>
                </div>
                {src.lastMetric && (
                  <div className="text-[11px] font-mono text-teal-700 font-semibold">
                    Count: {src.lastMetric.count.toLocaleString()} {src.lastMetric.unit}
                  </div>
                )}
                <div className="text-[10px] text-slate-500 font-sans">{src.notes}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ingested Kaggle Manifests */}
        <div>
          <div className="flex items-center space-x-2 mb-2 font-mono">
            <Award className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase">
              5. Ingested Kaggle Artifact Manifests
            </h3>
          </div>
          <div className="space-y-2">
            {kaggleManifests.map((k) => (
              <div
                key={k.slug}
                className="p-2.5 rounded border border-slate-200 bg-white text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-slate-900 truncate">{k.slug}</span>
                  <span className="text-[10px] text-slate-500">{k.fileCount} files</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Files: {k.files.join(', ')} • ({(k.byteSize / 1024).toFixed(0)} KB)
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  SHA-256 Tree: {k.sha256Tree.slice(0, 24)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )}
</div>
);
};
