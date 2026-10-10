import React from 'react';
import { PatientCase, GenomicAlteration } from '../types/oncology';
import { VafSpectrumChart } from './VafSpectrumChart';
import {
  User,
  HeartPulse,
  Activity,
  History,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

interface PatientDossierProps {
  patientCase: PatientCase;
  onSelectAlterationForInspection?: (alt: GenomicAlteration) => void;
  selectedAltId?: string;
}

export const PatientDossier: React.FC<PatientDossierProps> = ({
  patientCase,
  onSelectAlterationForInspection,
  selectedAltId,
}) => {
  const { labs, biomarkers } = patientCase;

  // Lab alert checks
  const isGfrWarning = labs.eGfr !== undefined && labs.eGfr < 60;
  const isBilirubinWarning = labs.totalBilirubin !== undefined && labs.totalBilirubin > 1.5;
  const isAltAstWarning =
    (labs.alt !== undefined && labs.alt > 50) || (labs.ast !== undefined && labs.ast > 50);
  const isQtcWarning = labs.qtcIntervalMs !== undefined && labs.qtcIntervalMs > 450;
  const isPltWarning = labs.platelets !== undefined && labs.platelets < 100;
  const isAncWarning = labs.anc !== undefined && labs.anc < 1.5;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100">
      {/* 1. Header Banner: Patient Core Identity */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-base text-slate-900">
                {patientCase.patientRef}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-mono">
                {patientCase.age} yo {patientCase.sex}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold font-mono">
                ECOG {patientCase.ecogScore}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-medium">
                {patientCase.lineOfTherapy}
              </span>
            </div>

            <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span>{patientCase.cancerType}</span>
              <span className="text-slate-400 font-normal">•</span>
              <span className="text-rose-700 font-mono text-xs font-bold uppercase">
                {patientCase.stage}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-mono">
              Histology: <span className="font-sans text-slate-800">{patientCase.histology}</span>
            </p>
          </div>

          <div className="text-right text-xs font-mono text-slate-500 space-y-1">
            <div>Smoking: <strong className="text-slate-700">{patientCase.smokingStatus}</strong></div>
            <div>
              Somatic Targets: <strong className="text-blue-700 font-bold">{patientCase.genomicAlterations.length} identified</strong>
            </div>
          </div>
        </div>

        {patientCase.clinicalNotes && (
          <div className="mt-3 p-2.5 rounded bg-blue-50/70 border border-blue-200/60 text-xs text-slate-700 leading-relaxed font-sans">
            <strong className="text-blue-900 font-medium">Clinical Presentation: </strong>
            {patientCase.clinicalNotes}
          </div>
        )}
      </div>

      {/* 2. Somatic Genomic Architecture & VAF Clonality */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
              Somatic Genomic Alteration Panel & Clonality
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Click alteration to inspect live in ClinVar & Ensembl
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* VAF Spectrum & Clonal Architecture */}
          <div className="lg:col-span-5 bg-slate-50/70 p-3.5 rounded border border-slate-200">
            <h4 className="text-[11px] font-bold font-mono text-slate-700 mb-2 uppercase flex items-center justify-between">
              <span>VAF & Clonal Distribution</span>
              <span className="text-slate-400 font-normal">Allelic Frequency</span>
            </h4>
            <VafSpectrumChart
              alterations={patientCase.genomicAlterations}
              onSelectAlteration={onSelectAlterationForInspection}
              selectedId={selectedAltId}
            />
          </div>

          {/* Somatic Alteration Table */}
          <div className="lg:col-span-7 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 font-mono text-[10px] text-slate-500 uppercase">
                <tr>
                  <th scope="col" className="px-2.5 py-2 text-left font-semibold">Gene & HGVS</th>
                  <th scope="col" className="px-2.5 py-2 text-left font-semibold">Class / Type</th>
                  <th scope="col" className="px-2.5 py-2 text-center font-semibold">VAF %</th>
                  <th scope="col" className="px-2.5 py-2 text-left font-semibold">ClinVar</th>
                  <th scope="col" className="px-2.5 py-2 text-center font-semibold">AMP Tier</th>
                  <th scope="col" className="px-2.5 py-2 text-right font-semibold">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {patientCase.genomicAlterations.map((alt) => {
                  const isSelected = selectedAltId === alt.id;
                  return (
                    <tr
                      key={alt.id}
                      onClick={() => onSelectAlterationForInspection?.(alt)}
                      className={`hover:bg-blue-50/50 cursor-pointer transition ${
                        isSelected ? 'bg-blue-50/80 font-medium' : ''
                      }`}
                    >
                      <td className="px-2.5 py-2.5">
                        <div className="font-mono font-bold text-slate-900">{alt.gene}</div>
                        <div className="font-mono text-[11px] text-slate-600">{alt.hgvsProtein}</div>
                        {alt.hgvsCdna && (
                          <div className="font-mono text-[10px] text-slate-400">{alt.hgvsCdna}</div>
                        )}
                      </td>
                      <td className="px-2.5 py-2.5 text-slate-700">
                        <span>{alt.variantType}</span>
                        {alt.readDepth && (
                          <div className="text-[10px] text-slate-400 font-mono">{alt.readDepth}x depth</div>
                        )}
                      </td>
                      <td className="px-2.5 py-2.5 text-center font-mono font-bold text-slate-800">
                        {alt.vafPercent.toFixed(1)}%
                      </td>
                      <td className="px-2.5 py-2.5">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            alt.clinVarSignificance?.includes('Pathogenic')
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : alt.clinVarSignificance?.includes('Uncertain')
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {alt.clinVarSignificance || 'Unreviewed'}
                        </span>
                        {alt.clinVarStars !== undefined && (
                          <div className="text-[10px] text-amber-500 font-mono mt-0.5">
                            {'★'.repeat(alt.clinVarStars)}
                            {'☆'.repeat(4 - alt.clinVarStars)}
                          </div>
                        )}
                      </td>
                      <td className="px-2.5 py-2.5 text-center font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                            alt.tier === 'Tier I'
                              ? 'bg-rose-100 text-rose-800'
                              : alt.tier === 'Tier II'
                              ? 'bg-blue-100 text-blue-800'
                              : alt.tier === 'Tier III'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {alt.tier}
                        </span>
                      </td>
                      <td className="px-2.5 py-2.5 text-right">
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800 font-mono text-[11px] underline inline-flex items-center gap-1"
                        >
                          <span>Explore</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Biomarkers & Immunophenotyping Profile */}
      <div className="p-4 sm:p-5 bg-slate-50/40">
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
            Pan-Tumor Biomarkers & Immunophenotyping
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* MSI */}
          <div className="p-3 bg-white rounded border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase">MSI / MMR Status</div>
            <div className="font-bold text-sm text-slate-900 mt-1 font-mono">{biomarkers.msiStatus}</div>
            <div className="text-[10px] text-slate-500 mt-1">
              {biomarkers.msiStatus.includes('MSI-H')
                ? 'High microsatellite instability; strong checkpoint candidacy'
                : 'Microsatellite stable (pMMR)'}
            </div>
          </div>

          {/* TMB */}
          <div className="p-3 bg-white rounded border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Tumor Mutational Burden</div>
            <div className="font-bold text-sm text-slate-900 mt-1 font-mono">
              {biomarkers.tmbMutMb !== undefined ? `${biomarkers.tmbMutMb} mut/Mb` : 'Not Measured'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {biomarkers.tmbMutMb !== undefined && biomarkers.tmbMutMb >= 10
                ? 'TMB-High (≥10 mut/Mb); FDA pan-tumor pembrolizumab cutoff met'
                : 'TMB-Low / Intermediate (<10 mut/Mb)'}
            </div>
          </div>

          {/* PD-L1 */}
          <div className="p-3 bg-white rounded border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase">PD-L1 Expression</div>
            <div className="font-bold text-sm text-slate-900 mt-1 font-mono">
              {biomarkers.pdL1TpsPercent !== undefined
                ? `${biomarkers.pdL1TpsPercent}% TPS`
                : biomarkers.pdL1CpsScore !== undefined
                ? `CPS ${biomarkers.pdL1CpsScore}`
                : 'Not Measured'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {biomarkers.pdL1TpsPercent !== undefined && biomarkers.pdL1TpsPercent >= 50
                ? 'High Expression (TPS ≥ 50%)'
                : biomarkers.pdL1TpsPercent !== undefined && biomarkers.pdL1TpsPercent >= 1
                ? 'Low Expression (TPS 1-49%)'
                : 'Negative (<1%)'}
            </div>
          </div>

          {/* HRD */}
          <div className="p-3 bg-white rounded border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase">HRD Status</div>
            <div className="font-bold text-sm text-slate-900 mt-1 font-mono">
              {biomarkers.hrdStatus || 'Not Tested'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {biomarkers.hrdStatus?.includes('Positive')
                ? 'Homologous recombination deficiency; high PARP inhibitor sensitivity'
                : 'Homologous recombination proficient'}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Prior Systemic Therapies Timeline */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center space-x-2 mb-3">
          <History className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
            Prior Systemic Regimens & Resistance Timeline
          </h3>
        </div>

        {patientCase.priorTherapies.length === 0 ? (
          <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono">
            No prior systemic cancer therapies recorded. Treatment-naive in this setting.
          </div>
        ) : (
          <div className="space-y-2.5">
            {patientCase.priorTherapies.map((p, idx) => (
              <div
                key={idx}
                className="p-3 rounded bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900">{p.regimen}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                      {p.setting}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                      {p.durationMonths} months
                    </span>
                  </div>
                  {p.notes && <p className="text-slate-600 text-[11px] mt-1">{p.notes}</p>}
                </div>

                <div className="sm:text-right flex-shrink-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                      p.bestResponse === 'Complete Response'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.bestResponse === 'Partial Response'
                        ? 'bg-teal-100 text-teal-800'
                        : p.bestResponse === 'Stable Disease'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Best Response: {p.bestResponse}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Clinical Safety & Organ Function Markers */}
      <div className="p-4 sm:p-5 bg-slate-50/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
              Baseline Organ Function & Safety Clearance
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Critical for trial eligibility & dosing
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 text-xs font-mono">
          <div className={`p-2.5 rounded border ${isGfrWarning ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'}`}>
            <div className="text-[10px] text-slate-500">eGFR</div>
            <div className="font-bold text-slate-900">{labs.eGfr ?? 'N/A'} <span className="text-[10px] font-normal text-slate-500">mL/min</span></div>
            {isGfrWarning && <div className="text-[9px] text-amber-700 font-sans mt-0.5">Renal caution</div>}
          </div>

          <div className={`p-2.5 rounded border ${isBilirubinWarning ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'}`}>
            <div className="text-[10px] text-slate-500">T. Bilirubin</div>
            <div className="font-bold text-slate-900">{labs.totalBilirubin ?? 'N/A'} <span className="text-[10px] font-normal text-slate-500">mg/dL</span></div>
            {isBilirubinWarning && <div className="text-[9px] text-amber-700 font-sans mt-0.5">Hepatic caution</div>}
          </div>

          <div className={`p-2.5 rounded border ${isAltAstWarning ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'}`}>
            <div className="text-[10px] text-slate-500">AST / ALT</div>
            <div className="font-bold text-slate-900">{labs.ast ?? 'N/A'} / {labs.alt ?? 'N/A'} <span className="text-[10px] font-normal text-slate-500">U/L</span></div>
            {isAltAstWarning && <div className="text-[9px] text-amber-700 font-sans mt-0.5">Transaminases elevated</div>}
          </div>

          <div className={`p-2.5 rounded border ${isAncWarning ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'}`}>
            <div className="text-[10px] text-slate-500">ANC</div>
            <div className="font-bold text-slate-900">{labs.anc ?? 'N/A'} <span className="text-[10px] font-normal text-slate-500">x10⁹/L</span></div>
            {isAncWarning && <div className="text-[9px] text-rose-700 font-sans mt-0.5">Neutropenic</div>}
          </div>

          <div className={`p-2.5 rounded border ${isPltWarning ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'}`}>
            <div className="text-[10px] text-slate-500">Platelets</div>
            <div className="font-bold text-slate-900">{labs.platelets ?? 'N/A'} <span className="text-[10px] font-normal text-slate-500">x10⁹/L</span></div>
            {isPltWarning && <div className="text-[9px] text-rose-700 font-sans mt-0.5">Thrombocytopenia</div>}
          </div>

          <div className="p-2.5 rounded border bg-white border-slate-200">
            <div className="text-[10px] text-slate-500">Hemoglobin</div>
            <div className="font-bold text-slate-900">{labs.hemoglobin ?? 'N/A'} <span className="text-[10px] font-normal text-slate-500">g/dL</span></div>
          </div>

          <div className={`p-2.5 rounded border ${isQtcWarning ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'}`}>
            <div className="text-[10px] text-slate-500">QTc Interval</div>
            <div className="font-bold text-slate-900">{labs.qtcIntervalMs ?? 'N/A'} <span className="text-[10px] font-normal text-slate-500">ms</span></div>
            {isQtcWarning && <div className="text-[9px] text-rose-700 font-sans mt-0.5">Prolonged QTc</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
