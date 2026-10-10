import React, { useState } from 'react';
import {
  PatientCase,
  CancerType,
  Stage,
  LineOfTherapy,
  GenomicAlteration,
  SomaticVariantType,
  AMPTier,
} from '../types/oncology';
import { X, Plus, Trash2, Check, Dna } from 'lucide-react';

interface EditCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseToEdit: PatientCase;
  onSaveCase: (updatedCase: PatientCase) => void;
}

const CANCER_TYPES: CancerType[] = [
  'Non-Small Cell Lung Cancer',
  'Colorectal Cancer',
  'Breast Cancer',
  'Ovarian Cancer',
  'Melanoma',
  'Pancreatic Cancer',
  'Prostate Cancer',
  'Gastric / Gastroesophageal',
  'Glioblastoma',
  'Acute Myeloid Leukemia',
];

const STAGES: Stage[] = [
  'Stage I',
  'Stage II',
  'Stage III',
  'Stage IIIA',
  'Stage IIIB',
  'Stage IIIC',
  'Stage IVA',
  'Stage IVB',
  'Recurrent / Metastatic',
];

const LINES: LineOfTherapy[] = [
  '1st Line (Treatment Naive)',
  '2nd Line (Post-Progression)',
  '3rd Line+',
  'Neoadjuvant',
  'Adjuvant / Maintenance',
];

const VARIANT_TYPES: SomaticVariantType[] = [
  'Missense',
  'Frameshift',
  'Nonsense',
  'In-frame Deletion',
  'Splice Site',
  'Amplification',
  'Deletional Loss',
  'Gene Fusion',
];

const AMP_TIERS: AMPTier[] = ['Tier I', 'Tier II', 'Tier III', 'Tier IV'];

export const EditCaseModal: React.FC<EditCaseModalProps> = ({
  isOpen,
  onClose,
  caseToEdit,
  onSaveCase,
}) => {
  const [patientRef, setPatientRef] = useState(caseToEdit.patientRef);
  const [age, setAge] = useState(caseToEdit.age);
  const [sex, setSex] = useState(caseToEdit.sex);
  const [cancerType, setCancerType] = useState<CancerType>(caseToEdit.cancerType);
  const [histology, setHistology] = useState(caseToEdit.histology);
  const [stage, setStage] = useState<Stage>(caseToEdit.stage);
  const [ecogScore, setEcogScore] = useState(caseToEdit.ecogScore);
  const [lineOfTherapy, setLineOfTherapy] = useState<LineOfTherapy>(caseToEdit.lineOfTherapy);
  const [smokingStatus, setSmokingStatus] = useState(caseToEdit.smokingStatus);
  const [clinicalNotes, setClinicalNotes] = useState(caseToEdit.clinicalNotes || '');

  // Alterations
  const [alterations, setAlterations] = useState<GenomicAlteration[]>([...caseToEdit.genomicAlterations]);

  // Biomarkers
  const [msiStatus, setMsiStatus] = useState(caseToEdit.biomarkers.msiStatus);
  const [tmbMutMb, setTmbMutMb] = useState<number | undefined>(caseToEdit.biomarkers.tmbMutMb);
  const [pdL1Tps, setPdL1Tps] = useState<number | undefined>(caseToEdit.biomarkers.pdL1TpsPercent);
  const [hrdStatus, setHrdStatus] = useState(caseToEdit.biomarkers.hrdStatus || 'Not Tested');

  // Labs
  const [eGfr, setEGfr] = useState(caseToEdit.labs.eGfr || 85);
  const [totalBilirubin, setTotalBilirubin] = useState(caseToEdit.labs.totalBilirubin || 0.8);
  const [ast, setAst] = useState(caseToEdit.labs.ast || 25);
  const [alt, setAlt] = useState(caseToEdit.labs.alt || 30);
  const [platelets, setPlatelets] = useState(caseToEdit.labs.platelets || 220);
  const [anc, setAnc] = useState(caseToEdit.labs.anc || 4.0);
  const [qtcIntervalMs, setQtcIntervalMs] = useState(caseToEdit.labs.qtcIntervalMs || 420);

  if (!isOpen) return null;

  const handleAddAlteration = () => {
    const newAlt: GenomicAlteration = {
      id: `alt-${Date.now()}`,
      gene: 'EGFR',
      hgvsProtein: 'p.Leu858Arg (L858R)',
      hgvsCdna: 'c.2573T>G',
      variantType: 'Missense',
      vafPercent: 30.0,
      readDepth: 750,
      clinVarSignificance: 'Pathogenic',
      clinVarStars: 3,
      tier: 'Tier I',
      actionabilityNote: '',
    };
    setAlterations((prev) => [...prev, newAlt]);
  };

  const handleRemoveAlteration = (id: string) => {
    setAlterations((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdateAlteration = (id: string, updates: Partial<GenomicAlteration>) => {
    setAlterations((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PatientCase = {
      ...caseToEdit,
      id: caseToEdit.id.startsWith('custom') ? caseToEdit.id : `custom-${Date.now()}`,
      patientRef,
      age: Number(age),
      sex,
      cancerType,
      histology,
      stage,
      ecogScore: Number(ecogScore),
      lineOfTherapy,
      smokingStatus,
      clinicalNotes,
      genomicAlterations: alterations,
      biomarkers: {
        msiStatus,
        tmbMutMb: tmbMutMb !== undefined ? Number(tmbMutMb) : undefined,
        pdL1TpsPercent: pdL1Tps !== undefined ? Number(pdL1Tps) : undefined,
        hrdStatus: hrdStatus as any,
      },
      labs: {
        eGfr: Number(eGfr),
        totalBilirubin: Number(totalBilirubin),
        ast: Number(ast),
        alt: Number(alt),
        platelets: Number(platelets),
        anc: Number(anc),
        qtcIntervalMs: Number(qtcIntervalMs),
      },
    };

    onSaveCase(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-300 shadow-xl max-w-4xl w-full max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dna className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-wide">
              Patient Case & Molecular Profile Editor
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
          {/* 1. Demographics & Staging */}
          <div>
            <h3 className="font-mono font-bold text-slate-800 uppercase text-[11px] mb-3 pb-1 border-b border-slate-200">
              1. Clinical Diagnosis & Patient Demographics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-mono text-[10px] uppercase font-semibold mb-1">
                  Patient Ref ID
                </label>
                <input
                  type="text"
                  value={patientRef}
                  onChange={(e) => setPatientRef(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-mono text-[10px] uppercase font-semibold mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  min={1}
                  max={120}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-mono text-[10px] uppercase font-semibold mb-1">
                  Biological Sex
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-mono text-[10px] uppercase font-semibold mb-1">
                  ECOG Score
                </label>
                <select
                  value={ecogScore}
                  onChange={(e) => setEcogScore(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value={0}>0 - Fully active</option>
                  <option value={1}>1 - Restricted strenuous activity</option>
                  <option value={2}>2 - Ambulatory, self-care</option>
                  <option value={3}>3 - Limited self-care, in bed &gt;50%</option>
                  <option value={4}>4 - Completely disabled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-slate-600 font-mono text-[10px] uppercase font-semibold mb-1">
                  Primary Malignancy
                </label>
                <select
                  value={cancerType}
                  onChange={(e) => setCancerType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  {CANCER_TYPES.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-mono text-[10px] uppercase font-semibold mb-1">
                  Stage
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-blue-500"
                >
                  {STAGES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-mono text-[10px] uppercase font-semibold mb-1">
                  Line of Therapy
                </label>
                <select
                  value={lineOfTherapy}
                  onChange={(e) => setLineOfTherapy(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  {LINES.map((lt) => (
                    <option key={lt} value={lt}>
                      {lt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-slate-600 font-mono text-[10px] uppercase font-semibold mb-1">
                Histology & Pathologic Description
              </label>
              <input
                type="text"
                value={histology}
                onChange={(e) => setHistology(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* 2. Somatic Genomic Alteration Panel */}
          <div>
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 mb-3">
              <h3 className="font-mono font-bold text-slate-800 uppercase text-[11px]">
                2. Somatic Genomic Alterations ({alterations.length})
              </h3>
              <button
                type="button"
                onClick={handleAddAlteration}
                className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono text-[11px] font-semibold border border-blue-200 inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-3">
              {alterations.map((alt) => (
                <div
                  key={alt.id}
                  className="p-3 rounded border border-slate-200 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-mono text-slate-500 uppercase">Gene</label>
                    <input
                      type="text"
                      value={alt.gene}
                      onChange={(e) =>
                        handleUpdateAlteration(alt.id, { gene: e.target.value.toUpperCase() })
                      }
                      className="w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs uppercase"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[9px] font-mono text-slate-500 uppercase">HGVS Protein</label>
                    <input
                      type="text"
                      value={alt.hgvsProtein}
                      onChange={(e) => handleUpdateAlteration(alt.id, { hgvsProtein: e.target.value })}
                      className="w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-mono text-slate-500 uppercase">Type</label>
                    <select
                      value={alt.variantType}
                      onChange={(e) =>
                        handleUpdateAlteration(alt.id, { variantType: e.target.value as any })
                      }
                      className="w-full px-2 py-1 rounded border border-slate-300 text-[11px]"
                    >
                      {VARIANT_TYPES.map((vt) => (
                        <option key={vt} value={vt}>
                          {vt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-mono text-slate-500 uppercase">VAF %</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100"
                      value={alt.vafPercent}
                      onChange={(e) =>
                        handleUpdateAlteration(alt.id, { vafPercent: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-mono text-slate-500 uppercase">AMP Tier</label>
                    <select
                      value={alt.tier}
                      onChange={(e) => handleUpdateAlteration(alt.id, { tier: e.target.value as any })}
                      className="w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs"
                    >
                      {AMP_TIERS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-1 flex justify-end items-end pt-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveAlteration(alt.id)}
                      className="p-1.5 text-rose-600 hover:text-rose-800 transition"
                      title="Remove variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Biomarkers & Safety Clearance */}
          <div>
            <h3 className="font-mono font-bold text-slate-800 uppercase text-[11px] mb-3 pb-1 border-b border-slate-200">
              3. Pan-Tumor Biomarkers & Organ Function Labs
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-mono text-[10px] uppercase font-semibold mb-1">
                  MSI Status
                </label>
                <select
                  value={msiStatus}
                  onChange={(e) => setMsiStatus(e.target.value as any)}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 text-xs"
                >
                  <option value="MSS / pMMR">MSS / pMMR</option>
                  <option value="MSI-H / dMMR">MSI-H / dMMR</option>
                  <option value="Equivocal">Equivocal</option>
                  <option value="Not Tested">Not Tested</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-mono text-[10px] uppercase font-semibold mb-1">
                  TMB (mut/Mb)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={tmbMutMb ?? ''}
                  onChange={(e) => setTmbMutMb(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g. 8.4"
                  className="w-full px-2 py-1.5 rounded border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-mono text-[10px] uppercase font-semibold mb-1">
                  PD-L1 TPS (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={pdL1Tps ?? ''}
                  onChange={(e) => setPdL1Tps(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g. 50"
                  className="w-full px-2 py-1.5 rounded border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-mono text-[10px] uppercase font-semibold mb-1">
                  HRD Status
                </label>
                <select
                  value={hrdStatus}
                  onChange={(e) => setHrdStatus(e.target.value as any)}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 text-xs"
                >
                  <option value="Not Tested">Not Tested</option>
                  <option value="Positive (HRD+)">Positive (HRD+)</option>
                  <option value="Negative (HRD-)">Negative (HRD-)</option>
                </select>
              </div>
            </div>

            {/* Labs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mt-3 font-mono">
              <div>
                <label className="block text-[9px] text-slate-500 uppercase">eGFR</label>
                <input
                  type="number"
                  value={eGfr}
                  onChange={(e) => setEGfr(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 uppercase">T. Bili</label>
                <input
                  type="number"
                  step="0.1"
                  value={totalBilirubin}
                  onChange={(e) => setTotalBilirubin(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 uppercase">AST</label>
                <input
                  type="number"
                  value={ast}
                  onChange={(e) => setAst(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 uppercase">ALT</label>
                <input
                  type="number"
                  value={alt}
                  onChange={(e) => setAlt(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 uppercase">Platelets</label>
                <input
                  type="number"
                  value={platelets}
                  onChange={(e) => setPlatelets(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 uppercase">ANC</label>
                <input
                  type="number"
                  step="0.1"
                  value={anc}
                  onChange={(e) => setAnc(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 uppercase">QTc (ms)</label>
                <input
                  type="number"
                  value={qtcIntervalMs}
                  onChange={(e) => setQtcIntervalMs(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* 4. Clinical Presentation Notes */}
          <div>
            <label className="block text-slate-600 font-mono text-[10px] uppercase font-semibold mb-1">
              Clinical Case Notes / Presentation
            </label>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Enter patient narrative, recent imaging findings, symptoms, or prior line progression notes..."
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-mono text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-mono font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Load Case</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
