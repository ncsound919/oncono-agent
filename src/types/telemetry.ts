export interface ComputeQuotaTelemetry {
  platform: 'kaggle-remote';
  weeklyAllocatedHours: number; // 30.0
  reservedHours: number;
  settledHours: number;
  remainingHours: number;
  sessionCapHours: number; // 12.0
  hardware: string; // "NVIDIA T4 16GB / P100 16GB"
  weeklyResetDay: string; // "Sunday 00:00 UTC"
  hoursToReset: number;
  activeSessionDurationMinutes: number;
  burstPlatform: {
    name: string; // "Hugging Face Spaces GPU / Colab Pro+"
    hardware: string;
    vramGb: number;
    hourlyRateUsd: number;
    status: 'standby' | 'active' | 'drained';
  };
}

export interface MultiModalModalityStat {
  name: string;
  category: 'gex' | 'cnv' | 'meth' | 'mut' | 'mirna' | 'rppa';
  featureCount: number;
  normalizationMethod: string;
  sparsityPercent: number;
  biologicalResolution: string;
}

export interface SurvBoardMultiModalDimensions {
  totalFeatures: number; // 88,527
  completeModalitiesAvailable: boolean;
  modalities: MultiModalModalityStat[];
  activeCohortPatients: number;
  clinicalSurvivalEndpoints: string[]; // ["OS", "OS_days", "PFI", "PFI_days"]
}

export interface AgentTelemetryRun {
  runId: string;
  agentRole: string;
  model: string;
  latencyMs: number;
  promptTokens: number;
  thoughtTokens: number;
  completionTokens: number;
  tokensPerSecond: number;
  cascadeFallbackUsed: boolean;
  timestamp: string;
  status: 'SUCCESS' | 'RETRIED' | 'FAILED';
}

export interface PipelineObservabilityTelemetry {
  totalDeliberations: number;
  averageLatencyMs: number;
  totalTokensProcessed: {
    promptTokens: number;
    thoughtTokens: number;
    completionTokens: number;
  };
  cascadeTransitions: number;
  recentRuns: AgentTelemetryRun[];
}

export interface ProvenanceAuditTelemetry {
  merkleRootHash: string;
  rfc3161Timestamp: string;
  claimLintStatus: {
    scannedArtifacts: number;
    unscourcedClaims: number;
    allClaimsVerified: boolean;
  };
  registeredManifestCount: number;
  dataVolumeSerial: string;
  volumeAttached: boolean;
}

export interface EcosystemTelemetrySnapshot {
  timestamp: string;
  computeQuota: ComputeQuotaTelemetry;
  multiModalDimensions: SurvBoardMultiModalDimensions;
  pipelineObservability: PipelineObservabilityTelemetry;
  provenanceAudit: ProvenanceAuditTelemetry;
}
