import React from 'react';
import { TumorBoardReport, RegimenRecommendation, ToxicityAlert } from '../types/oncology';
import {
  Brain,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  ListOrdered,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Flame,
  CheckCircle,
  Stethoscope,
} from 'lucide-react';

interface TumorBoardSynthesisProps {
  report: TumorBoardReport | null;
  isLoading: boolean;
  onSelectInterventionFilter?: (drug: string) => void;
}

export const TumorBoardSynthesis: React.FC<TumorBoardSynthesisProps> = ({
  report,
  isLoading,
  onSelectInterventionFilter,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 animate-spin">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wide">
            Synthesizing Molecular Tumor Board Report...
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Gemini 3.8 Flash is integrating somatic alterations, resistance mechanisms, guideline-concordant regimens, and clinical trial matches.
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white rounded-lg border border-dashed border-slate-300 p-8 text-center space-y-3">
        <Stethoscope className="w-8 h-8 text-slate-400 mx-auto" />
        <div>
          <h3 className="text-sm font-bold font-mono text-slate-700 uppercase">
            No Synthesis Generated Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Click <strong>"Run Tumor Board AI"</strong> in the top header to trigger an evidence-based oncology consensus report for this patient.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100 font-sans">
      {/* 1. Executive Consensus Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-t-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-teal-400" />
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-teal-300">
              Executive Molecular Tumor Board Consensus
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-300">
            Synthesized {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-slate-100 font-sans">
          {report.executiveSummary}
        </p>
      </div>

      {/* 2. Molecular Drivers & Functional Consequences */}
      <div className="p-4 sm:p-5">
        <h4 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <FileCheck2 className="w-4 h-4 text-blue-600" />
          <span>Molecular Drivers & Oncogenic Classification</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {report.molecularDrivers.map((driver, idx) => (
            <div
              key={idx}
              className="p-3 rounded border border-slate-200 bg-slate-50/50 space-y-1"
            >
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-slate-900 text-sm">
                  {driver.gene} {driver.alteration}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-semibold">
                  {driver.actionabilityLevel}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {driver.functionalConsequence}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Resistance Mechanism & Bypass Signaling Circuits */}
      <div className="p-4 sm:p-5 bg-amber-50/30">
        <h4 className="text-xs font-bold font-mono text-amber-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-600" />
          <span>Resistance Mechanism & Bypass Circuit Analysis</span>
        </h4>

        <div className="space-y-2 text-xs">
          {report.resistanceMechanismAnalysis.identifiedMechanisms.length > 0 && (
            <div>
              <span className="font-mono text-[11px] font-semibold text-slate-700">
                Identified Molecular Mechanisms:
              </span>
              <ul className="list-disc list-inside mt-1 space-y-1 text-slate-600">
                {report.resistanceMechanismAnalysis.identifiedMechanisms.map((mech, i) => (
                  <li key={i}>{mech}</li>
                ))}
              </ul>
            </div>
          )}

          {report.resistanceMechanismAnalysis.bypassCircuits.length > 0 && (
            <div className="mt-2">
              <span className="font-mono text-[11px] font-semibold text-slate-700">
                Potential Bypass Signaling Pathways:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {report.resistanceMechanismAnalysis.bypassCircuits.map((bp, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-amber-100/80 text-amber-800 text-[11px] font-mono border border-amber-200"
                  >
                    {bp}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-2.5 rounded bg-white border border-amber-200/80 text-slate-700 mt-2">
            <strong className="font-semibold text-amber-900">Overcoming Strategy: </strong>
            {report.resistanceMechanismAnalysis.overcomingStrategies}
          </div>
        </div>
      </div>

      {/* 4. Guideline-Directed Regimens (Tiered) */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <ListOrdered className="w-4 h-4 text-indigo-600" />
            <span>Prioritized Therapeutic Options & Regimen Rationale</span>
          </h4>
          <span className="text-[11px] font-mono text-slate-500">
            NCCN / ESMO Tier-Aligned
          </span>
        </div>

        <div className="space-y-3">
          {report.recommendedRegimens.map((reg, idx) => {
            const isTier1 = reg.category.includes('Tier 1');
            const isTrial = reg.category.includes('Clinical Trial');

            return (
              <div
                key={idx}
                className={`p-3.5 rounded border text-xs transition ${
                  isTier1
                    ? 'bg-emerald-50/30 border-emerald-300'
                    : isTrial
                    ? 'bg-blue-50/40 border-blue-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm font-mono">{reg.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        isTier1
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isTrial
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {reg.category}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-600 font-semibold px-2 py-0.5 rounded bg-white border border-slate-200">
                    {reg.evidenceLevel}
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed mb-2 font-sans">
                  <strong>Rationale: </strong>{reg.rationale}
                </p>

                <div className="p-2 rounded bg-white/80 border border-slate-200/60 text-[11px] space-y-1 mb-2 font-mono">
                  <div className="text-slate-600">
                    <span className="font-semibold text-slate-800">Target Mechanism:</span> {reg.targetMechanism}
                  </div>
                  {reg.supportingTrialsOrPMIDs.length > 0 && (
                    <div className="text-slate-600 flex flex-wrap items-center gap-1">
                      <span className="font-semibold text-slate-800">Landmark Evidence:</span>
                      {reg.supportingTrialsOrPMIDs.map((trial, i) => (
                        <span key={i} className="px-1.5 py-0.2 rounded bg-slate-100 border text-[10px] text-slate-700">
                          {trial}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {reg.monitoringGuidance.length > 0 && (
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <span className="font-semibold text-slate-700">Safety & Monitoring:</span>{' '}
                    {reg.monitoringGuidance.join('; ')}
                  </div>
                )}

                {onSelectInterventionFilter && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onSelectInterventionFilter(reg.name.split(' ')[0])}
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-mono text-[11px] font-semibold"
                    >
                      <span>Search Clinical Trials for this Regimen</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Immunotherapy & Pharmacogenomic Safety Alerts */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Immunotherapy Assessment */}
        <div className="p-3.5 rounded border border-teal-200 bg-teal-50/30 text-xs space-y-2">
          <div className="flex items-center space-x-1.5 text-teal-900 font-mono font-bold uppercase text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Checkpoint Immunotherapy Candidacy</span>
          </div>
          <div className="font-bold text-sm text-slate-900 font-mono">
            {report.immunotherapyAssessment.candidacy}
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            {report.immunotherapyAssessment.biomarkerRationale}
          </p>
        </div>

        {/* Toxicity & Drug-Drug Interactions */}
        <div className="p-3.5 rounded border border-rose-200 bg-rose-50/20 text-xs space-y-2">
          <div className="flex items-center space-x-1.5 text-rose-900 font-mono font-bold uppercase text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Toxicity, Organ Clearance & DDI Alerts</span>
          </div>

          {report.toxicityAndDDI.length === 0 ? (
            <p className="text-slate-500 text-[11px]">No critical organ toxicity alerts identified.</p>
          ) : (
            <div className="space-y-1.5">
              {report.toxicityAndDDI.map((tox, i) => (
                <div key={i} className="p-2 rounded bg-white border border-rose-200/80 text-[11px]">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-slate-900">{tox.title}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                        tox.severity === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : tox.severity === 'Moderate'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tox.severity} Severity
                    </span>
                  </div>
                  <div className="text-slate-600 mt-0.5">{tox.mechanism}</div>
                  <div className="text-rose-900 font-medium mt-1">Management: {tox.management}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. Concrete Actionable Next Steps */}
      {report.nextSteps.length > 0 && (
        <div className="p-4 sm:p-5 bg-slate-50/50">
          <h4 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Actionable MTB Clinical Directives</span>
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {report.nextSteps.map((step, idx) => (
              <li
                key={idx}
                className="p-2.5 rounded bg-white border border-slate-200 text-slate-700 flex items-start gap-2"
              >
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-[11px] leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 7. Scientific Disclaimer */}
      <div className="p-3 bg-slate-100/70 text-[10px] text-slate-500 font-mono rounded-b-lg border-t border-slate-200">
        <strong className="text-slate-700">Governance & Epistemic Notice: </strong>
        {report.scientificDisclaimer}
      </div>
    </div>
  );
};
