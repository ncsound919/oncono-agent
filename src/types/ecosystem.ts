import { PatientCase } from './oncology';

export interface DataVolumeStatus {
  serial: string; // "0x466A5450"
  targetRoot: string;
  isAttached: boolean;
  status: 'attached' | 'absent' | 'overridden';
  reasonIfAbsent: string;
  registeredSubtrees: Array<{
    name: string;
    expectedFiles: number;
    expectedSizeGb: number;
    description: string;
    status: 'present' | 'absent';
  }>;
}

export interface RecourseComputePlatform {
  platformId: 'kaggle-remote' | 'hf-remote' | 'e2b-remote' | 'local';
  name: string;
  hardware: string;
  status: 'up' | 'quota_exhausted' | 'not_configured';
  weeklyQuotaHours: number;
  remainingHours: number;
  activeJobs: number;
  maxSessionHours: number;
}

export interface ExternalSourceStatus {
  sourceId: string;
  name: string;
  category: 'Imaging' | 'Single-Cell' | 'Organoids & Models' | 'Proteomics' | 'Functional Genomics';
  status: 'configured' | 'not_configured' | 'skipped' | 'live';
  lastMetric?: {
    count: number;
    unit: string;
    verifiedAt: string;
  };
  licenseType: string;
  notes: string;
}

export interface KaggleDatasetManifest {
  slug: string;
  ref: string;
  sourceVolume: string;
  fileCount: number;
  byteSize: number;
  files: string[];
  downloadedAt: string;
  sha256Tree: string;
  license: string;
  notes: string;
}

export interface SurvboardCohortSample {
  sampleId: string;
  cohort: string; // e.g. "TCGA-LUAD", "TCGA-COAD", "TCGA-GBM", "TCGA-OV", "METABRIC"
  primaryDiagnosis: string;
  stage: string;
  vitalStatus: 'Alive' | 'Dead';
  osDays: number;
  keyMutations: Array<{
    gene: string;
    alteration: string;
    vaf?: number;
  }>;
  tmb?: number;
  msi?: string;
  patientCaseEquivalent: PatientCase;
}

export interface RecourseJobSubmission {
  jobId: string;
  experimentId: string; // e.g. "survival-cox", "tumor-immune-ensemble", "conformal-response"
  hardware: 'cpu' | 'gpu' | 'tpu';
  status: 'queued' | 'running' | 'completed' | 'failed';
  resultEnvelope?: {
    __RECOURSE_RESULT__: {
      experimentId: string;
      exitCode: number;
      metrics: Record<string, number>;
      provenanceHash: string;
      timestamp: string;
    };
  };
}
