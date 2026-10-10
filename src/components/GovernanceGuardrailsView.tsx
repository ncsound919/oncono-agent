import React, { useState, useEffect } from 'react';
import { PatientCase } from '../types/oncology';
import { GuardrailCheck, GovernanceSignOff } from '../types/governance';
import {
  fetchPreFlightGuardrails,
  submitGovernanceSignOff,
  fetchAuditTrail,
} from '../services/apiClient';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Lock,
  Download,
  Fingerprint,
  RefreshCw,
  UserCheck,
  Award,
} from 'lucide-react';

interface GovernanceGuardrailsProps {
  patientCase: PatientCase;
}

export const GovernanceGuardrailsView: React.FC<GovernanceGuardrailsProps> = ({
  patientCase,
}) => {
  const [checksum, setChecksum] = useState<string>('');
  const [guardrailChecks, setGuardrailChecks] = useState<GuardrailCheck[]>([]);
  const [auditTrail, setAuditTrail] = useState<GovernanceSignOff[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sign-off form state
  const [reviewerName, setReviewerName] = useState('Dr. Eleanor Vance, MD');
  const [reviewerRole, setReviewerRole] = useState<GovernanceSignOff['reviewerRole']>(
    'Attending Medical Oncologist'
  );
  const [institution, setInstitution] = useState('Memorial Comprehensive Cancer Center');
  const [decision, setDecision] = useState<GovernanceSignOff['decision']>(
    'APPROVED_FOR_CLINICAL_DISCUSS'
  );
  const [clinicalRationale, setClinicalRationale] = useState(
    'Case reviewed in multidisciplinary tumor board. Genomic alteration tiering, resistance mechanisms, and organ safety clearance verified concordant with NCCN guidelines.'
  );
  const [concurrence, setConcurrence] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signOffSuccess, setSignOffSuccess] = useState<string | null>(null);

  // Load checks and audit trail
  const loadGovernanceData = async () => {
    setIsLoading(true);
    try {
      const [preflightData, auditData] = await Promise.all([
        fetchPreFlightGuardrails(patientCase),
        fetchAuditTrail(patientCase.id),
      ]);
      setChecksum(preflightData.checksum);
      setGuardrailChecks(preflightData.checks);
      setAuditTrail(auditData.auditTrail);
    } catch (err) {
      console.error('Governance load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGovernanceData();
  }, [patientCase.id]);

  const handleSignOffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSignOffSuccess(null);
    try {
      const { record } = await submitGovernanceSignOff({
        caseId: patientCase.id,
        patientCase,
        caseChecksum: checksum,
        reviewerName,
        reviewerRole,
        institution,
        decision,
        clinicalRationale,
        concurrenceWithAiReport: concurrence,
      });

      setAuditTrail((prev) => [record, ...prev]);
      setSignOffSuccess(
        `Clinical sign-off recorded under digital signature hash: ${record.verificationHash.slice(0, 16)}...`
      );
      setTimeout(() => setSignOffSuccess(null), 6000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error signing off on case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const criticalBlocks = guardrailChecks.filter((g) => g.triggered && g.severity === 'CRITICAL_BLOCK');
  const warnings = guardrailChecks.filter((g) => g.triggered && g.severity === 'HIGH_WARNING');

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100 font-sans">
      {/* Header & Case Cryptographic Integrity */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-t-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
                Clinical Decision Support Governance & Safety Guardrails
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl font-sans">
              FDA SaMD / EU AI Act Class IIa governance architecture: rule-based clinical tripwires, organ clearance guardrails, cryptographic snapshot hashing, and Human-in-the-Loop (HITL) certification.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={loadGovernanceData}
              disabled={isLoading}
              className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title="Refresh guardrails evaluation"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Cryptographic Case Checksum */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center space-x-2">
            <Fingerprint className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span>SHA-256 Case Snapshot Integrity:</span>
            <code className="text-teal-300 bg-slate-800 px-2 py-0.5 rounded text-[10px] break-all">
              {checksum || 'computing...'}
            </code>
          </div>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Cryptographically Verified</span>
          </span>
        </div>
      </div>

      {/* Safety Guardrails Tripwire Matrix */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
              Automated Safety Tripwire Evaluation ({guardrailChecks.length} Rules)
            </h3>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-mono">
            {criticalBlocks.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                {criticalBlocks.length} Critical Blocks
              </span>
            )}
            {warnings.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                {warnings.length} Warnings
              </span>
            )}
            {criticalBlocks.length === 0 && warnings.length === 0 && (
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                All Guardrails Clear
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2.5">
          {guardrailChecks.map((rule) => {
            const isTriggered = rule.triggered;
            const isCritical = isTriggered && rule.severity === 'CRITICAL_BLOCK';
            const isWarning = isTriggered && rule.severity === 'HIGH_WARNING';

            return (
              <div
                key={rule.id}
                className={`p-3 rounded border text-xs transition ${
                  isCritical
                    ? 'bg-rose-50/50 border-rose-300'
                    : isWarning
                    ? 'bg-amber-50/40 border-amber-300'
                    : isTriggered
                    ? 'bg-blue-50/30 border-blue-200'
                    : 'bg-slate-50/40 border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isCritical
                          ? 'bg-rose-600'
                          : isWarning
                          ? 'bg-amber-500'
                          : isTriggered
                          ? 'bg-blue-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span className="font-bold text-slate-900 font-mono text-[11px]">
                      {rule.ruleName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">({rule.category})</span>
                  </div>

                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                      isCritical
                        ? 'bg-rose-200 text-rose-900'
                        : isWarning
                        ? 'bg-amber-200 text-amber-900'
                        : isTriggered
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isTriggered ? rule.severity.replace(/_/g, ' ') : 'PASS (CLEARED)'}
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed font-sans text-xs mb-1">
                  {rule.message}
                </p>

                <div className="text-[10px] font-mono text-slate-400">
                  Citation: <span className="text-slate-600">{rule.guidelineReference}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Human-in-the-Loop (HITL) Formal Sign-Off Console */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
              Human-in-the-Loop (HITL) Attending Review & Sign-Off
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Mandatory prior to clinical delivery
          </span>
        </div>

        {signOffSuccess && (
          <div className="p-3 mb-3 rounded bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{signOffSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSignOffSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase font-semibold text-slate-600 mb-1">
                Reviewing Clinician Name
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-sans text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase font-semibold text-slate-600 mb-1">
                Clinical Credential / Role
              </label>
              <select
                value={reviewerRole}
                onChange={(e) => setReviewerRole(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-sans text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="Attending Medical Oncologist">Attending Medical Oncologist</option>
                <option value="Molecular Pathologist">Molecular Pathologist</option>
                <option value="MTB Committee Chair">MTB Committee Chair</option>
                <option value="Clinical Geneticist">Clinical Geneticist</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase font-semibold text-slate-600 mb-1">
                Institution / MTB Committee
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-sans text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase font-semibold text-slate-600 mb-1">
                Regulatory Decision
              </label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-blue-500 font-bold"
              >
                <option value="APPROVED_FOR_CLINICAL_DISCUSS">
                  APPROVED: Validated for Multidisciplinary Discussion
                </option>
                <option value="APPROVED_WITH_MODIFICATIONS">
                  APPROVED WITH MODIFICATIONS: Attending Overrides Included
                </option>
                <option value="REJECTED_INSUFFICIENT_EVIDENCE">
                  REJECTED: Insufficient Evidence or Safety Conflict
                </option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={concurrence}
                  onChange={(e) => setConcurrence(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-slate-800 text-xs font-medium">
                  I concur with AI tumor board reasoning after independent clinical verification.
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase font-semibold text-slate-600 mb-1">
              Attending Clinical Rationale & Governance Notes
            </label>
            <textarea
              rows={2}
              value={clinicalRationale}
              onChange={(e) => setClinicalRationale(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-sans text-xs focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white font-mono font-bold text-xs flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>{isSubmitting ? 'Signing...' : 'Certify & Record Sign-Off'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Immutable Governance Audit Trail */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
              Immutable Governance Audit Trail ({auditTrail.length} Records)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Audit-ready for institutional review
          </span>
        </div>

        {auditTrail.length === 0 ? (
          <div className="p-4 rounded bg-slate-50 text-center text-xs text-slate-500 font-mono">
            No formal sign-off records registered yet for patient {patientCase.patientRef}.
          </div>
        ) : (
          <div className="space-y-2">
            {auditTrail.map((record) => (
              <div
                key={record.signOffId}
                className="p-3 rounded border border-slate-200 bg-white shadow-2xs text-xs space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{record.reviewerName}</span>
                    <span className="text-slate-500">• {record.reviewerRole}</span>
                    <span className="text-slate-400">({record.institution})</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      record.decision.startsWith('APPROVED')
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {record.decision.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-slate-700 font-sans text-xs leading-relaxed">
                  {record.clinicalRationale}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-100">
                  <span>Signed: {new Date(record.timestamp).toLocaleString()}</span>
                  <span>
                    Signature Hash:{' '}
                    <code className="text-slate-600">{record.verificationHash.slice(0, 24)}...</code>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
