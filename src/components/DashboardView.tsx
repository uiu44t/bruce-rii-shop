import React from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Users,
  BedDouble,
  Flame,
  UserCheck,
  Pill,
  Receipt,
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  Heart,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { ActiveNavTab, Patient } from '../types';
import { translations } from '../utils/translations';

interface DashboardViewProps {
  onNavigateTab: (tab: ActiveNavTab) => void;
  onSelectPatient: (patient: Patient) => void;
  onOpenRegisterModal: () => void;
  onOpenTriageModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onSelectPatient,
  onOpenRegisterModal,
  onOpenTriageModal,
}) => {
  const { patients, beds, doctors, emergencyCases, pharmacy, appointments, invoices, language } = useHospital();
  const t = translations[language] || translations.en;

  const totalPatients = patients.length;
  const inpatients = patients.filter((p) => p.status === 'inpatient').length;
  const emergencyCount = emergencyCases.filter((c) => c.status !== 'admitted').length;
  const occupiedBeds = beds.filter((b) => b.status === 'occupied').length;
  const occupancyRate = Math.round((occupiedBeds / beds.length) * 100);
  const activeDoctors = doctors.filter((d) => d.status === 'on_duty').length;
  const lowStockCount = pharmacy.filter((p) => p.stock <= p.minThreshold).length;

  const totalBilled = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);

  // Group beds by ward
  const wardBreakdown = ['ICU', 'Emergency Bay', 'General Ward A', 'General Ward B', 'Pediatrics', 'Surgical Unit'].map(
    (wardName) => {
      const wardBeds = beds.filter((b) => b.ward.includes(wardName.split(' ')[0]));
      const occupied = wardBeds.filter((b) => b.status === 'occupied').length;
      return {
        name: wardName,
        total: wardBeds.length,
        occupied,
        percent: wardBeds.length > 0 ? Math.round((occupied / wardBeds.length) * 100) : 0,
      };
    }
  );

  return (
    <div className="dashboard-view space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="dashboard-card flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
              {t.dashboard.commandCenter}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            {t.dashboard.title}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {t.dashboard.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenTriageModal}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 transition-colors"
          >
            <Flame className="w-4 h-4" />
            {t.dashboard.triage}
          </button>
          <button
            onClick={onOpenRegisterModal}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.dashboard.register}
          </button>
          <button
            onClick={() => onNavigateTab('ai_assistant')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            {t.dashboard.aiSupport}
          </button>
        </div>
      </div>

      {/* Urgent Clinical Alerts Ticker */}
      <div className="dashboard-card p-3 rounded-xl flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          {t.dashboard.alerts}
        </div>
        <div className="overflow-x-auto text-slate-300 flex items-center gap-6 whitespace-nowrap scrollbar-none font-medium">
          <span className="flex items-center gap-1 text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            <strong>Gerald K. Vance:</strong> Code STEMI alert in Emergency (STAT 12-lead ECG)
          </span>
          <span className="flex items-center gap-1 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <strong>Pharmacy:</strong> Ceftriaxone & Nicardipine IV below safety threshold
          </span>
          <span className="flex items-center gap-1 text-sky-300">
            <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
            <strong>ICU Wing:</strong> 2 beds available (ICU-03, ICU-04 in cleaning)
          </span>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Inpatients */}
        <div
          onClick={() => onNavigateTab('patients')}
          className="dashboard-card p-4 rounded-xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Inpatients</span>
            <Users className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">{inpatients}</div>
          <div className="text-[11px] text-slate-400 mt-1">{totalPatients} registered in EMR</div>
        </div>

        {/* Bed Occupancy Rate */}
        <div
          onClick={() => onNavigateTab('wards')}
          className="dashboard-card p-4 rounded-xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Bed Occupancy</span>
            <BedDouble className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {occupancyRate}%
          </div>
          <div className="text-[11px] text-sky-400 mt-1">
            {occupiedBeds}/{beds.length} beds occupied
          </div>
        </div>

        {/* Emergency Queue */}
        <div
          onClick={() => onNavigateTab('emergency')}
          className="dashboard-card p-4 rounded-xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Emergency Queue</span>
            <Flame className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2 font-mono">
            {emergencyCount}
          </div>
          <div className="text-[11px] text-rose-400 mt-1">
            Average wait: ~12 mins
          </div>
        </div>

        {/* Doctors On Duty */}
        <div
          onClick={() => onNavigateTab('staff')}
          className="dashboard-card p-4 rounded-xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Doctors On Duty</span>
            <UserCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">{activeDoctors}</div>
          <div className="text-[11px] text-slate-400 mt-1">{doctors.length} staff on roster</div>
        </div>

        {/* Pharmacy Low Stock */}
        <div
          onClick={() => onNavigateTab('pharmacy')}
          className="dashboard-card p-4 rounded-xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Formulary Stock</span>
            <Pill className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">{pharmacy.length}</div>
          <div className="text-[11px] text-amber-400 mt-1">
            {lowStockCount > 0 ? `${lowStockCount} need restock` : 'Stock optimal'}
          </div>
        </div>

        {/* Total Billing */}
        <div
          onClick={() => onNavigateTab('billing')}
          className="dashboard-card p-4 rounded-xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Revenue</span>
            <Receipt className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold text-cyan-300 mt-2 font-mono">
            ${(totalCollected / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            of ${(totalBilled / 1000).toFixed(1)}k billed
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Recent Admissions & Emergency) & Right Column (Ward Capacities & Appointments) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Admissions & Inpatient List */}
          <div className="dashboard-card p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Active Inpatient Census & Monitoring
                </h3>
                <p className="text-xs text-slate-400">Patients admitted across hospital units</p>
              </div>
              <button
                onClick={() => onNavigateTab('patients')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                View All EMRs <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="text-[10px] text-slate-400 uppercase tracking-wider bg-slate-800/60">
                  <tr>
                    <th className="p-3 rounded-l-lg">Patient & MRN</th>
                    <th className="p-3">Ward & Bed</th>
                    <th className="p-3">Primary Diagnosis</th>
                    <th className="p-3">Current Vitals</th>
                    <th className="p-3">Attending</th>
                    <th className="p-3 rounded-r-lg text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {patients
                    .filter((p) => p.status === 'inpatient' || p.status === 'emergency')
                    .slice(0, 5)
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-white">{p.name}</div>
                          <div className="text-[11px] font-mono text-cyan-400">{p.mrn}</div>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-slate-300">
                            {p.ward || 'Triage'} - {p.bedNumber || 'Bay'}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs truncate text-slate-300">
                          {p.primaryDiagnosis}
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-xs">
                            <span className="text-cyan-300 font-semibold">{p.vitals.bp}</span> •{' '}
                            <span className="text-rose-400 font-semibold">{p.vitals.hr}</span> bpm
                          </div>
                          <div className="text-[10px] text-slate-400">SpO2: {p.vitals.spo2}%</div>
                        </td>
                        <td className="p-3 text-slate-400 truncate">
                          {p.attendingDoctorName.split(',')[0]}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => onSelectPatient(p)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 font-medium text-xs transition-colors"
                          >
                            Open Chart
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Emergency Triage Live Cases */}
          <div className="dashboard-card p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500" />
                  Emergency Department Live Queue
                </h3>
                <p className="text-xs text-slate-400">Patients categorized by Emergency Severity Index</p>
              </div>
              <button
                onClick={() => onNavigateTab('emergency')}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
              >
                Open Trauma Bay <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {emergencyCases.slice(0, 4).map((c) => {
                const esiBadgeColors = {
                  1: 'bg-rose-600 text-white',
                  2: 'bg-orange-600 text-white',
                  3: 'bg-amber-600 text-white',
                  4: 'bg-sky-600 text-white',
                  5: 'bg-emerald-600 text-white',
                };

                return (
                  <div
                    key={c.id}
                    className="dashboard-card p-3 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          esiBadgeColors[c.esiLevel]
                        }`}
                      >
                        L{c.esiLevel}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-white flex items-center gap-2 truncate">
                          {c.patientName} ({c.age}y, {c.gender})
                          <span className="text-[10px] text-slate-400 font-normal">
                            Arr: {c.arrivalTime}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs truncate mt-0.5">{c.chiefComplaint}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="font-mono text-cyan-300 font-semibold">{c.vitals.bp}</div>
                        <div className="text-[10px] text-slate-400">{c.vitals.hr} bpm • {c.vitals.spo2}%</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Ward Bed Distribution & Today's Appointments */}
        <div className="space-y-6">
          {/* Ward Bed Capacity Card */}
          <div className="dashboard-card p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-sky-400" />
                Ward Bed Capacity
              </h3>
              <button
                onClick={() => onNavigateTab('wards')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium"
              >
                Bed Matrix →
              </button>
            </div>

            <div className="space-y-3.5">
              {wardBreakdown.map((w, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">{w.name}</span>
                    <span className="font-mono text-slate-400">
                      {w.occupied}/{w.total} ({w.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        w.percent >= 80
                          ? 'bg-rose-500'
                          : w.percent >= 50
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${w.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="dashboard-card p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Scheduled Consultations
              </h3>
              <button
                onClick={() => onNavigateTab('appointments')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Schedule →
              </button>
            </div>

            <div className="space-y-3">
              {appointments.slice(0, 4).map((apt) => (
                <div
                  key={apt.id}
                  className="dashboard-card p-3 rounded-xl text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{apt.patientName}</span>
                    <span className="text-[11px] font-mono text-cyan-300">{apt.time}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {apt.doctorName} • {apt.department}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-300 text-[11px] truncate max-w-[160px]">
                      {apt.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        apt.status === 'checked_in'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {apt.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
