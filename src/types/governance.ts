export type AgentRole =
  | 'molecular_pathology'
  | 'mechanism_resistance'
  | 'therapeutic_guidelines'
  | 'trial_matching'
  | 'pharmacovigilance'
  | 'consensus_chair';

export interface AgentExecutionTrace {
  agentRole: AgentRole;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'flagged';
  latencyMs: number;
  modelUsed: string;
  timestamp: string;
  findings: string[];
  keyDirective: string;
  confidenceScore: number; // 0 to 100%
  discordanceNotes?: string;
}

export type GuardrailSeverity = 'CRITICAL_BLOCK' | 'HIGH_WARNING' | 'ADVISORY';

export interface GuardrailCheck {
  id: string;
  ruleName: string;
  category: 'Contraindication' | 'Biomarker Incompatibility' | 'Organ Clearance' | 'Regulatory';
  severity: GuardrailSeverity;
  triggered: boolean;
  message: string;
  guidelineReference: string;
}

export interface GovernanceSignOff {
  signOffId: string;
  caseId: string;
  caseChecksum: string;
  reviewerName: string;
  reviewerRole: 'Attending Medical Oncologist' | 'Molecular Pathologist' | 'MTB Committee Chair' | 'Clinical Geneticist';
  institution: string;
  decision: 'APPROVED_FOR_CLINICAL_DISCUSS' | 'APPROVED_WITH_MODIFICATIONS' | 'REJECTED_INSUFFICIENT_EVIDENCE';
  clinicalRationale: string;
  concurrenceWithAiReport: boolean;
  overriddenRecommendations?: string[];
  timestamp: string;
  verificationHash: string;
}

export interface OrchestrationResult {
  orchestrationId: string;
  caseId: string;
  caseChecksum: string;
  timestamp: string;
  executionTraces: AgentExecutionTrace[];
  guardrailChecks: GuardrailCheck[];
  overallConsensusConfidence: number;
  pipelineStatus: 'COMPLETED_CLEAN' | 'COMPLETED_WITH_WARNINGS' | 'FLAGGED_BLOCKED';
  chairSynthesis: string;
}
