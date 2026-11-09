import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  ShieldAlert,
  Building2,
  FileText,
  Bell,
  Database,
  Download,
  Upload,
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Send,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { UserRole } from '../types';

export const EnterpriseAdminView: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    branches,
    currentBranchId,
    setCurrentBranchId,
    auditLogs,
    notifications,
    sendNotification,
    exportBackupData,
    restoreBackupData,
    resetAllData,
    addToast,
    logAuditEvent,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'audit' | 'rbac' | 'branches' | 'notifications' | 'backup'>('audit');

  // Audit search & filters
  const [auditSearch, setAuditSearch] = useState('');
  const [auditRoleFilter, setAuditRoleFilter] = useState('all');

  // SMS & Alert Broadcast
  const [notifRecipient, setNotifRecipient] = useState('All Medical Staff');
  const [notifTitle, setNotifTitle] = useState('Hospital Emergency Preparedness Drill');
  const [notifMessage, setNotifMessage] = useState('Mass casualty protocol drill scheduled for 14:00 at Trauma Bay.');
  const [notifChannel, setNotifChannel] = useState<'in_app' | 'sms' | 'email'>('sms');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase());
    const matchesRole = auditRoleFilter === 'all' || log.actorRole === auditRoleFilter;
    return matchesSearch && matchesRole;
  });

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    sendNotification({
      recipientName: notifRecipient,
      recipientType: notifRecipient.includes('Staff') ? 'staff' : notifRecipient.includes('Patient') ? 'patient' : 'all',
      type: 'emergency',
      channel: notifChannel,
      title: notifTitle,
      message: notifMessage,
    });
    setNotifTitle('');
    setNotifMessage('');
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Hospital_Enterprise_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      title: 'Backup Downloaded',
      message: 'Full JSON system archive has been exported.',
    });
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = restoreBackupData(content);
      if (success) {
        addToast({
          type: 'success',
          title: 'Database Restored',
          message: 'System database restored successfully from JSON backup file.',
        });
      }
    };
    reader.readAsText(file);
  };

  // RBAC definitions
  const rbacPermissions: Record<UserRole, string[]> = {
    super_admin: ['Full System Admin', 'Manage All Branches', 'Audit Trail', 'Role Assignment', 'Disaster Recovery', 'Clinical Override'],
    doctor: ['Full Patient EMR Access', 'Write Prescriptions', 'Order Lab & Imaging', 'Approve Test Results', 'Triage Intake'],
    nurse: ['Vitals Recording', 'Bed Management', 'Administer Medications', 'Patient Intake', 'Emergency Triage'],
    pharmacist: ['Dispense Medications', 'Inventory Reorder', 'Batch Expiry Tracking', 'Prescription Verification'],
    laboratory: ['Sample Collection', 'Enter Lab Results', 'Equipment Calibration', 'Critical Value Alerts'],
    radiology: ['PACS Image Upload', 'Write Imaging Reports', 'Radiology Schedule', 'Diagnostic Verification'],
    reception: ['Patient Registration', 'Appointment Scheduling', 'Queue Management', 'Check-in Desk'],
    accountant: ['Billing & Invoicing', 'Insurance Claims Gateway', 'Payment Reconciliation', 'Financial Audits'],
    patient: ['View Personal Health Record', 'View Prescriptions & Labs', 'Request Appointments', 'View Invoices & Copay'],
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 via-indigo-700 to-cyan-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Ubuyobozi Bukuru & Umutekano / Enterprise System Administration
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Role: {currentRole.toUpperCase()}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit Trail • Role-Based Access Control • Multi-Branch Operations • Broadcast SMS • Disaster Recovery
              </p>
            </div>
          </div>

          {/* Quick Role Switcher Simulation */}
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 self-start sm:self-auto">
            <UserCheck className="w-4 h-4 text-cyan-400 ml-1 shrink-0" />
            <span className="text-xs text-slate-400 hidden md:inline">Simulate Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-white font-medium focus:ring-1 focus:ring-cyan-500"
            >
              <option value="super_admin">Super Admin</option>
              <option value="doctor">Medical Doctor</option>
              <option value="nurse">Registered Nurse</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="lab_technician">Lab Technician</option>
              <option value="radiologist">Radiologist</option>
              <option value="accountant">Hospital Accountant</option>
              <option value="patient">Patient Portal User</option>
            </select>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium">
          {[
            { id: 'audit', label: 'Audit Trail / Logs', icon: FileText, count: auditLogs.length },
            { id: 'rbac', label: 'RBAC Access Matrix', icon: Lock },
            { id: 'branches', label: 'Multi-Branch Operations', icon: Building2, count: branches.length },
            { id: 'notifications', label: 'SMS & Broadcast Center', icon: Bell, count: notifications.length },
            { id: 'backup', label: 'Backup & Recovery', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Inyandiko z'Umutekano / Immutable Audit Trail
              </h3>
              <p className="text-xs text-slate-400">
                All clinical updates, lab approvals, medication dispensations, and user logins are logged automatically.
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative min-w-[180px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Shakisha logs..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500"
                />
              </div>

              <select
                value={auditRoleFilter}
                onChange={(e) => setAuditRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="laboratory">Laboratory</option>
                <option value="radiology">Radiology</option>
                <option value="reception">Reception</option>
                <option value="accountant">Accountant</option>
                <option value="patient">Patient</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-xl">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor / User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target Entity</th>
                  <th className="p-3">Details / Audit Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 text-[11px]">
                    <td className="p-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3 font-semibold text-white font-sans">{log.actorName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-amber-300">{log.action}</td>
                    <td className="p-3 text-slate-300 font-sans">{log.targetName || log.targetType}</td>
                    <td className="p-3 text-slate-400 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RBAC ACCESS MATRIX */}
      {activeTab === 'rbac' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              Role-Based Access Control (RBAC) Hierarchy
            </h3>
            <p className="text-xs text-slate-400">
              Permissions enforced across the hospital system for patient data privacy and clinical safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(rbacPermissions) as UserRole[]).map((role) => {
              const isCurrent = currentRole === role;
              return (
                <div
                  key={role}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-950/40'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-white uppercase text-xs tracking-wider">
                      {role.replace('_', ' ')}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {rbacPermissions[role].map((perm, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{perm}</span>
                      </li>
                    ))}
                  </ul>

                  {!isCurrent && (
                    <button
                      onClick={() => {
                        setCurrentRole(role);
                        addToast({
                          type: 'info',
                          title: 'Role Switched',
                          message: `Active session now running as ${role.replace('_', ' ')}.`,
                        });
                      }}
                      className="w-full mt-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      Switch to this Role
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MULTI-BRANCH OPERATIONS */}
      {activeTab === 'branches' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                Ibitaro n'Amashami / Multi-Branch Hospital Network
              </h3>
              <p className="text-xs text-slate-400">
                Connected referral branches sharing clinical records, laboratory inventory, and ambulance routing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {branches.map((branch) => {
              const isSelected = currentBranchId === branch.id;
              return (
                <div
                  key={branch.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500 shadow-xl shadow-emerald-950/30'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400">{branch.code}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isSelected ? 'ACTIVE BRANCH' : 'Connected'}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-base mt-2">{branch.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{branch.city}, {branch.district}</p>

                  <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Total Beds:</span>
                      <div className="font-bold text-white font-mono text-sm">{branch.totalBeds}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Active Doctors:</span>
                      <div className="font-bold text-cyan-400 font-mono text-sm">{branch.activeDoctorsCount}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
                    <span>Contact: <strong>{branch.emergencyContact}</strong></span>
                    <span>Emergency: <strong className="font-mono text-rose-400">{branch.phone}</strong></span>
                  </div>

                  {!isSelected && (
                    <button
                      onClick={() => {
                        setCurrentBranchId(branch.id);
                        addToast({
                          type: 'info',
                          title: 'Branch Switched',
                          message: `Switched operational context to ${branch.name}.`,
                        });
                      }}
                      className="w-full mt-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                    >
                      Select Active Branch
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SMS & BROADCAST CENTER */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Dispatch SMS form */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-cyan-400" />
              Kohereza Ubutumwa (SMS / Alert Broadcast)
            </h3>

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Uwakira / Recipient</label>
                <select
                  value={notifRecipient}
                  onChange={(e) => setNotifRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="All Medical Staff">All Medical Staff (Abakozi b'ibitaro bose)</option>
                  <option value="Emergency Department On-Call">Emergency Department On-Call</option>
                  <option value="Patients with Upcoming Appointments">Patients with Upcoming Appointments (SMS)</option>
                  <option value="Blood Bank Donors">Blood Bank Donors (Urgent Appeal)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Channel</label>
                <div className="flex gap-2">
                  {(['sms', 'in_app', 'email'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setNotifChannel(ch)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold uppercase ${
                        notifChannel === ch
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Umutwe w'Ubutumwa / Title</label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ubutumwa / Message Body</label>
                <textarea
                  rows={4}
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                Ohereza Ubutumwa / Send Broadcast
              </button>
            </form>
          </div>

          {/* Notifications Log */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              Inyandiko z'Ubutumwa Bwoherejwe / Sent Notifications
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{n.title}</span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-cyan-300 uppercase">
                        {n.channel}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{n.sentAt}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{n.message}</p>
                  <div className="text-[11px] text-slate-500">To: {n.recipientName || n.recipientContact || 'All Medical Staff'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BACKUP & DISASTER RECOVERY */}
      {activeTab === 'backup' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              Kubika & Kugarura Amakuru / Backup & Disaster Recovery
            </h3>
            <p className="text-xs text-slate-400">
              Download complete database snapshots for offsite cold-storage compliance or restore from previous archive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Export Backup */}
            <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Export Full Database</h4>
              <p className="text-xs text-slate-400">
                Downloads an encrypted JSON archive of all patients, lab records, radiology orders, blood bank inventory, and audit logs.
              </p>
              <button
                onClick={handleDownloadBackup}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download JSON Backup
              </button>
            </div>

            {/* Restore Backup */}
            <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Restore from File</h4>
              <p className="text-xs text-slate-400">
                Upload a verified backup JSON file to restore the entire hospital database to a previous point in time.
              </p>
              <label className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Choose Backup File
                <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
              </label>
            </div>

            {/* Factory Reset */}
            <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Factory Reset Baseline</h4>
              <p className="text-xs text-slate-400">
                Resets the local database to the pristine clinical seed state with default patients, wards, and inventory.
              </p>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset all records to default clinical sample data?')) {
                    resetAllData();
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Seed Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
