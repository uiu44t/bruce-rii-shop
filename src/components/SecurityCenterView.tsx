import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Database,
  Key,
  Users,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  HardDrive,
  Download,
  AlertTriangle,
  FileText,
  Activity,
} from 'lucide-react';
import { MOCK_SECURITY_LOGS } from '../data/mockRwandaNationalData';
import { SecurityAuditLog } from '../types';
import { useHospital } from '../context/HospitalContext';

export const SecurityCenterView: React.FC = () => {
  const { showToast } = useHospital();
  const [logs, setLogs] = useState<SecurityAuditLog[]>(MOCK_SECURITY_LOGS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [lastBackupTime, setLastBackupTime] = useState<string>('Today at 03:00 AM (Automated)');

  const filteredLogs = logs.filter((log) => {
    const actionText = log.action || log.event_type;
    if (filterAction !== 'ALL' && !actionText.toLowerCase().includes(filterAction.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchUser = (log.user_name || log.user_email).toLowerCase().includes(q);
      const matchRole = (log.user_role || log.facility || '').toLowerCase().includes(q);
      const matchAction = actionText.toLowerCase().includes(q);
      const matchPatient = log.patient_mrn ? log.patient_mrn.toLowerCase().includes(q) : false;
      const matchReason = (log.access_justification || log.details).toLowerCase().includes(q);
      if (!matchUser && !matchRole && !matchAction && !matchPatient && !matchReason) return false;
    }
    return true;
  });

  const handleRunBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      const now = new Date().toLocaleTimeString();
      setLastBackupTime(`Just now at ${now} (Encrypted Snapshot)`);
      showToast({
        title: 'AES-256 Snapshot Completed',
        message: 'Replicated to Kigali National Data Center & Rubavu Disaster Recovery Vault.',
        type: 'success',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Title & Compliance Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Lock className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  Security, Compliance & Data Protection Center
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Rwanda Law N° 058/2021 Compliant
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Strict adherence to personal data privacy, mandatory access audit trails, role-based controls (RBAC), and dual-datacenter automated backups.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="run-backup-snapshot"
              disabled={isBackingUp}
              onClick={handleRunBackup}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-900/40 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
              {isBackingUp ? 'Encrypting & Mirroring...' : 'Run Backup Snapshot'}
            </button>
          </div>
        </div>

        {/* 4 Pillars of National Healthcare Compliance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Data Encryption
            </div>
            <div className="text-sm font-bold text-slate-100">AES-256 & TLS 1.3</div>
            <div className="text-[11px] text-slate-400">Zero cleartext data at rest or in transit</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" /> Access Control (RBAC)
            </div>
            <div className="text-sm font-bold text-slate-100">Granular Role Scopes</div>
            <div className="text-[11px] text-slate-400">Doctor, Nurse, Pharmacist, Lab, Admin</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-400" /> Automated Nightly Backup
            </div>
            <div className="text-sm font-bold text-slate-100">Dual-Vault Mirror</div>
            <div className="text-[11px] text-slate-400">{lastBackupTime}</div>
          </div>

          <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Patient Consent & Opt-In
            </div>
            <div className="text-sm font-bold text-slate-100">Enforced by Default</div>
            <div className="text-[11px] text-slate-400">Auditable consent token for RHIE</div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="search-audit-logs"
                type="text"
                placeholder="Search staff, MRN, action, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
              />
            </div>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Audit Actions</option>
              <option value="VIEW">EMR Dossier Views</option>
              <option value="DISPENSE">Pharmacy Dispenses</option>
              <option value="NIDA">National ID Lookups</option>
              <option value="RESERVE">Bed Reservations</option>
              <option value="EXPORT">Data Exports</option>
            </select>
          </div>
        </div>
      </div>

      {/* Forensic Audit Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Immutable Forensic Access Audit Trail (Who • When • What • Why)
          </h2>
          <span className="text-xs text-slate-400">Showing {filteredLogs.length} verified access events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-[10px] uppercase font-bold text-slate-400">
                <th className="py-2.5 px-4">Timestamp & IP</th>
                <th className="py-2.5 px-4">Staff Member & Role</th>
                <th className="py-2.5 px-4">Action Performed</th>
                <th className="py-2.5 px-4">Patient MRN</th>
                <th className="py-2.5 px-4">Mandatory Clinical Justification (Why)</th>
                <th className="py-2.5 px-4 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <div className="font-mono text-slate-300">{log.timestamp}</div>
                    <div className="font-mono text-[10px] text-slate-500">{log.ip_address}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100">{log.user_name || log.user_email}</div>
                    <div className="text-[10px] text-indigo-400 uppercase font-bold">{log.user_role || log.facility}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-cyan-300">{log.action || log.event_type}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{log.patient_mrn || 'N/A'}</td>
                  <td className="py-3 px-4 text-slate-300 max-w-sm">{log.access_justification || log.details}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Signed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
