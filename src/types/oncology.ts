export type CancerType =
  | 'Non-Small Cell Lung Cancer'
  | 'Colorectal Cancer'
  | 'Breast Cancer'
  | 'Ovarian Cancer'
  | 'Melanoma'
  | 'Pancreatic Cancer'
  | 'Prostate Cancer'
  | 'Gastric / Gastroesophageal'
  | 'Glioblastoma'
  | 'Acute Myeloid Leukemia';

export type Stage =
  | 'Stage I'
  | 'Stage II'
  | 'Stage III'
  | 'Stage IIIA'
  | 'Stage IIIB'
  | 'Stage IIIC'
  | 'Stage IVA'
  | 'Stage IVB'
  | 'Recurrent / Metastatic';

export type LineOfTherapy =
  | '1st Line (Treatment Naive)'
  | '2nd Line (Post-Progression)'
  | '3rd Line+'
  | 'Neoadjuvant'
  | 'Adjuvant / Maintenance';

export type SomaticVariantType =
  | 'Missense'
  | 'Frameshift'
  | 'Nonsense'
  | 'In-frame Deletion'
  | 'Splice Site'
  | 'Amplification'
  | 'Deletional Loss'
  | 'Gene Fusion';

export type AMPTier = 'Tier I' | 'Tier II' | 'Tier III' | 'Tier IV';

export interface GenomicAlteration {
  id: string;
  gene: string;
  hgvsProtein: string;
  hgvsCdna?: string;
  variantType: SomaticVariantType;
  vafPercent: number; // Variant Allele Frequency e.g. 35.4%
  readDepth?: number;
  clinVarSignificance?: string;
  clinVarStars?: number;
  tier: AMPTier;
  actionabilityNote?: string;
}

export interface PatientCase {
  id: string;
  patientRef: string;
  age: number;
  sex: 'Female' | 'Male';
  cancerType: CancerType;
  histology: string;
  stage: Stage;
  ecogScore: number; // 0, 1, 2, 3, 4
  lineOfTherapy: LineOfTherapy;
  smokingStatus: 'Never' | 'Former' | 'Current';
  priorTherapies: Array<{
    regimen: string;
    setting: string;
    durationMonths: number;
    bestResponse: 'Complete Response' | 'Partial Response' | 'Stable Disease' | 'Progressive Disease';
    notes?: string;
  }>;
  genomicAlterations: GenomicAlteration[];
  biomarkers: {
    msiStatus: 'MSI-H / dMMR' | 'MSS / pMMR' | 'Equivocal' | 'Not Tested';
    tmbMutMb?: number; // Mutations per megabase
    pdL1TpsPercent?: number; // Tumor Proportion Score 0-100%
    pdL1CpsScore?: number; // Combined Positive Score
    hrdStatus?: 'Positive (HRD+)' | 'Negative (HRD-)' | 'Not Tested';
  };
  labs: {
    eGfr?: number; // mL/min/1.73m2
    totalBilirubin?: number; // mg/dL
    ast?: number; // U/L
    alt?: number; // U/L
    platelets?: number; // 10^9/L
    anc?: number; // Absolute Neutrophil Count 10^9/L
    hemoglobin?: number; // g/dL
    qtcIntervalMs?: number; // ms
  };
  clinicalNotes?: string;
}

export interface RegimenRecommendation {
  name: string;
  category: 'Tier 1 Standard of Care' | 'Tier 2 Emerging / Off-Label' | 'Clinical Trial Prioritized';
  evidenceLevel: 'Level A (FDA Approved / Phase 3)' | 'Level B (Phase 2 / Well-Powered)' | 'Level C (Preclinical / Case Series)';
  rationale: string;
  targetMechanism: string;
  supportingTrialsOrPMIDs: string[];
  monitoringGuidance: string[];
}

export interface ToxicityAlert {
  severity: 'High' | 'Moderate' | 'Low';
  title: string;
  mechanism: string;
  management: string;
}

export interface TumorBoardReport {
  timestamp: string;
  caseId: string;
  executiveSummary: string;
  molecularDrivers: Array<{
    gene: string;
    alteration: string;
    functionalConsequence: string;
    actionabilityLevel: string;
  }>;
  resistanceMechanismAnalysis: {
    identifiedMechanisms: string[];
    bypassCircuits: string[];
    overcomingStrategies: string;
  };
  recommendedRegimens: RegimenRecommendation[];
  toxicityAndDDI: ToxicityAlert[];
  immunotherapyAssessment: {
    candidacy: 'Strong Candidate' | 'Intermediate / Biomarker Dependent' | 'Low Likelihood of Benefit / Contraindicated';
    biomarkerRationale: string;
  };
  nextSteps: string[];
  scientificDisclaimer: string;
}

export interface ClinVarApiVariant {
  variationId: string;
  title: string;
  gene: string;
  clinicalSignificance: string;
  reviewStatus: string;
  stars: number;
  conditions: string[];
  lastEvaluated?: string;
  accession?: string;
  ncbiUrl: string;
}

export interface ClinicalTrialItem {
  nctId: string;
  briefTitle: string;
  overallStatus: string;
  phase: string;
  conditions: string[];
  interventions: string[];
  briefSummary: string;
  eligibilitySnippet?: string;
  studyType?: string;
  url: string;
}

export interface PubMedArticle {
  pmid: string;
  title: string;
  journal: string;
  pubDate: string;
  authors: string[];
  doi?: string;
  url: string;
}
