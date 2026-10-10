import {
  PatientCase,
  TumorBoardReport,
  ClinVarApiVariant,
  ClinicalTrialItem,
  PubMedArticle,
} from '../types/oncology';
import {
  OrchestrationResult,
  GuardrailCheck,
  GovernanceSignOff,
} from '../types/governance';
import {
  DataVolumeStatus,
  RecourseComputePlatform,
  ExternalSourceStatus,
  KaggleDatasetManifest,
  SurvboardCohortSample,
  RecourseJobSubmission,
} from '../types/ecosystem';
import { EcosystemTelemetrySnapshot } from '../types/telemetry';

export async function fetchHealth(): Promise<{ status: string; geminiKeyConfigured: boolean }> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchClinVar(
  gene: string,
  variant: string
): Promise<{ results: ClinVarApiVariant[]; total: number }> {
  const params = new URLSearchParams({ gene, variant });
  const res = await fetch(`/api/external/clinvar?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch ClinVar records');
  }
  return res.json();
}

export async function fetchClinicalTrials(
  condition: string,
  intervention?: string,
  status = 'RECRUITING,ACTIVE_NOT_RECRUITING',
  pageSize = 12
): Promise<{ totalCount: number; studies: ClinicalTrialItem[] }> {
  const params = new URLSearchParams({
    condition,
    ...(intervention ? { intervention } : {}),
    status,
    pageSize: String(pageSize),
  });
  const res = await fetch(`/api/external/trials?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to query ClinicalTrials.gov');
  }
  return res.json();
}

export async function fetchPubMed(
  term: string
): Promise<{ articles: PubMedArticle[]; total: number }> {
  const params = new URLSearchParams({ term });
  const res = await fetch(`/api/external/pubmed?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to query PubMed');
  }
  return res.json();
}

export async function fetchEnsembl(gene: string): Promise<{
  gene: string;
  id: string;
  biotype: string;
  chromosome: string;
  start: number;
  end: number;
  strand: string;
  canonicalTranscript?: string;
  description?: string;
}> {
  const params = new URLSearchParams({ gene });
  const res = await fetch(`/api/external/ensembl?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to query Ensembl');
  }
  return res.json();
}

export async function generateTumorBoardAnalysis(
  patientCase: PatientCase
): Promise<{ report: TumorBoardReport }> {
  const res = await fetch('/api/onco-agent/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientCase }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate Tumor Board synthesis');
  }
  return res.json();
}

export async function askTumorBoardAgent(
  patientCase: PatientCase,
  query: string,
  history: Array<{ role: 'user' | 'model'; content: string }>
): Promise<{ answer: string }> {
  const res = await fetch('/api/onco-agent/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientCase, query, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate tumor board response');
  }
  return res.json();
}

export async function runOrchestration(
  patientCase: PatientCase
): Promise<{ result: OrchestrationResult }> {
  const res = await fetch('/api/onco-agent/orchestrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientCase }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to run orchestration pipeline');
  }
  return res.json();
}

export async function fetchPreFlightGuardrails(
  patientCase: PatientCase
): Promise<{ checksum: string; checks: GuardrailCheck[] }> {
  const res = await fetch('/api/onco-agent/governance/pre-flight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientCase }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to evaluate pre-flight guardrails');
  }
  return res.json();
}

export async function submitGovernanceSignOff(
  signOffData: Partial<GovernanceSignOff> & { patientCase: PatientCase }
): Promise<{ success: boolean; record: GovernanceSignOff }> {
  const res = await fetch('/api/onco-agent/governance/sign-off', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signOffData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to register clinical sign-off');
  }
  return res.json();
}

export async function fetchAuditTrail(
  caseId?: string
): Promise<{ auditTrail: GovernanceSignOff[] }> {
  const url = caseId
    ? `/api/onco-agent/governance/audit-trail?caseId=${encodeURIComponent(caseId)}`
    : '/api/onco-agent/governance/audit-trail';
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch governance audit trail');
  }
  return res.json();
}

// Ecosystem Bridge Endpoints
export async function fetchEcosystemStatus(): Promise<{
  timestamp: string;
  dataVolume: DataVolumeStatus;
  computePlatforms: RecourseComputePlatform[];
  wetLabSources: ExternalSourceStatus[];
}> {
  const res = await fetch('/api/ecosystem/status');
  if (!res.ok) throw new Error('Failed to fetch ecosystem status');
  return res.json();
}

export async function fetchKaggleManifests(): Promise<{ manifests: KaggleDatasetManifest[] }> {
  const res = await fetch('/api/ecosystem/kaggle-manifests');
  if (!res.ok) throw new Error('Failed to fetch Kaggle manifests');
  return res.json();
}

export async function fetchSurvboardCohorts(): Promise<{ cohorts: SurvboardCohortSample[] }> {
  const res = await fetch('/api/ecosystem/survboard/cohorts');
  if (!res.ok) throw new Error('Failed to fetch SurvBoard cohorts');
  return res.json();
}

export async function submitRecourseExperiment(
  experimentId: string,
  hardware: 'cpu' | 'gpu' | 'tpu' = 'cpu'
): Promise<{ submission: RecourseJobSubmission }> {
  const res = await fetch('/api/ecosystem/recourse/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ experimentId, hardware }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit Recourse experiment');
  }
  return res.json();
}

export async function fetchEcosystemTelemetry(): Promise<{
  snapshot: EcosystemTelemetrySnapshot;
}> {
  const res = await fetch('/api/ecosystem/telemetry');
  if (!res.ok) throw new Error('Failed to fetch ecosystem telemetry');
  return res.json();
}

export async function fetchHarmonizedPriors(): Promise<{
  priors: Record<string, any>;
}> {
  const res = await fetch('/api/ecosystem/harmonized-priors');
  if (!res.ok) throw new Error('Failed to fetch harmonized priors');
  return res.json();
}

export async function scorePatientAnomaly(
  patientCase: PatientCase
): Promise<{
  result: any;
}> {
  const res = await fetch('/api/ecosystem/detection/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientCase }),
  });
  if (!res.ok) throw new Error('Failed to score patient anomaly');
  return res.json();
}
