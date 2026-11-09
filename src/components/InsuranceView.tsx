import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  ShieldCheck,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  PlusCircle,
  Search,
  Filter,
  AlertCircle,
  FileText,
  DollarSign,
  User,
  ArrowRight,
} from 'lucide-react';
import { InsuranceClaim, InsuranceProvider } from '../types';

export const InsuranceView: React.FC = () => {
  const {
    insuranceClaims,
    patients,
    invoices,
    submitInsuranceClaim,
    processInsuranceClaim,
    addToast,
    logAuditEvent,
  } = useHospital();

  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Submit Claim Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [provider, setProvider] = useState<string>('RSSB / RAMA');
  const [policyNumber, setPolicyNumber] = useState('RAMA-2026-9041');
  const [claimAmount, setClaimAmount] = useState(850);
  const [diagnosisCode, setDiagnosisCode] = useState('ICD-10 I21.0 - Acute Myocardial Infarction');

  const filteredClaims = insuranceClaims.filter((c) => {
    const matchesSearch =
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.policyNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = providerFilter === 'all' || c.insuranceProvider === providerFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesProvider && matchesStatus;
  });

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId) || patients[0];
    const coveragePercent = provider.includes('Mutuelle') ? 90 : 85;
    const claimed = Number((claimAmount * (coveragePercent / 100)).toFixed(2));
    const payable = Number((claimAmount - claimed).toFixed(2));

    submitInsuranceClaim({
      invoiceId: invoices[0]?.id || 'inv-1',
      patientId: patient.id,
      patientName: patient.name,
      patientMrn: patient.mrn,
      insuranceProvider: provider,
      policyNumber,
      totalAmount: claimAmount,
      coveragePercent,
      claimedAmount: claimed,
      patientPayableAmount: payable,
      branchId: patient.branchId || 'branch-kigali',
    });
    setShowSubmitModal(false);
  };

  const handleApproveClaim = (claim: InsuranceClaim) => {
    processInsuranceClaim(claim.id, 'Approved');
  };

  const handleRejectClaim = (claim: InsuranceClaim) => {
    const reason = prompt('Enter rejection reason for insurance claim:', 'Pre-authorization requirement not met');
    if (reason) {
      processInsuranceClaim(claim.id, 'Rejected', undefined, reason);
    }
  };

  const totalClaimed = insuranceClaims.reduce((acc, c) => acc + c.totalAmount, 0);
  const totalApproved = insuranceClaims
    .filter((c) => c.status === 'Approved')
    .reduce((acc, c) => acc + c.claimedAmount, 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-lg shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Ubwishingizi & Imisanzu / Insurance & Claims Management
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  e-Billing Gateway Active
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                RSSB / RAMA • Mutuelle de Santé • MMI • Sanlam • Cigna • Direct Electronic Adjudication
              </p>
            </div>
          </div>

          <button
            id="btn-new-insurance-claim"
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Ohereza Fagitire mu Bwishingizi / New Claim
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
            <div className="text-[11px] text-slate-400">Total Claims</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5">{insuranceClaims.length}</div>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
            <div className="text-[11px] text-slate-400">Total Claimed Value</div>
            <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">${totalClaimed.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
            <div className="text-[11px] text-slate-400">Approved & Reimbursed</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">${totalApproved.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
            <div className="text-[11px] text-slate-400">Pending Adjudication</div>
            <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
              {insuranceClaims.filter((c) => c.status === 'Pending' || c.status === 'Under Review').length}
            </div>
          </div>
        </div>
      </div>

      {/* Claims List & Filter Bar */}
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap gap-2 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Shakisha claim #, umurwayi, policy #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-300"
          >
            <option value="all">All Providers</option>
            <option value="RSSB / RAMA">RSSB / RAMA</option>
            <option value="Mutuelle de Santé">Mutuelle de Santé</option>
            <option value="MMI (Military Medical)">MMI (Military)</option>
            <option value="Sanlam Insurance">Sanlam Insurance</option>
            <option value="Cigna Global">Cigna Global</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-300"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-emerald-400">{claim.claimNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    {claim.insuranceProvider}
                  </span>
                  <span className="font-mono text-xs text-slate-400">Policy: {claim.policyNumber}</span>
                </div>
                <h4 className="font-bold text-white text-base mt-1">{claim.patientName}</h4>
                <div className="text-[11px] text-slate-400">
                  Coverage: {claim.coveragePercent}% • Patient Co-pay: ${claim.patientPayableAmount.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500">Submitted on {claim.submissionDate}</div>
              </div>

              <div className="flex items-center gap-6 self-end md:self-auto flex-wrap">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Bill</div>
                  <div className="text-base font-bold font-mono text-white">${claim.totalAmount.toFixed(2)}</div>
                  <div className="text-xs text-emerald-400 font-mono">Claimed: ${claim.claimedAmount.toFixed(2)}</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      claim.status === 'Approved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : claim.status === 'Rejected'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {claim.status}
                  </span>

                  {claim.status !== 'Approved' && claim.status !== 'Rejected' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleApproveClaim(claim)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectClaim(claim)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: SUBMIT CLAIM */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Ohereza Fagitire mu Bwishingizi / Submit Claim
              </h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateClaim} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Umurwayi / Patient</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.mrn}) • {p.insurance.provider}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Insurance Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="RSSB / RAMA">RSSB / RAMA</option>
                    <option value="Mutuelle de Santé">Mutuelle de Santé</option>
                    <option value="MMI (Military Medical)">MMI (Military)</option>
                    <option value="Sanlam Insurance">Sanlam Insurance</option>
                    <option value="Cigna Global">Cigna Global</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Policy / Member ID</label>
                  <input
                    type="text"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Claim Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ICD-10 Diagnostic & Tariff Code</label>
                <input
                  type="text"
                  value={diagnosisCode}
                  onChange={(e) => setDiagnosisCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                >
                  Ohereza Claim / Submit to Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
