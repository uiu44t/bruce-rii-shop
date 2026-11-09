import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Bed, BedStatus, Patient } from '../types';
import {
  BedDouble,
  Activity,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Clock,
  UserPlus,
  RefreshCw,
  LogOut,
  ChevronRight,
  Filter,
  LayoutGrid,
  Box,
  Layers,
  CalendarCheck,
  ShieldCheck,
} from 'lucide-react';

interface WardsViewProps {
  onSelectPatient: (patient: Patient) => void;
}

export const WardsView: React.FC<WardsViewProps> = ({ onSelectPatient }) => {
  const { beds, patients, updateBedStatus, dischargePatient, admitPatientToBed } = useHospital();

  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewPerspective, setViewPerspective] = useState<'2D_GRID' | '3D_ISOMETRIC'>('2D_GRID');
  const [specializedQueue, setSpecializedQueue] = useState<'ALL' | 'ICU' | 'MATERNITY' | 'SURGICAL_SUITE' | 'DISCHARGE_PENDING'>('ALL');

  // Admit modal state
  const [admitModalBed, setAdmitModalBed] = useState<Bed | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const wardsList = ['ICU', 'Emergency Bay', 'General Ward A', 'General Ward B', 'Pediatrics', 'Surgical Unit'];

  const filteredBeds = beds.filter((b) => {
    const matchesWard = selectedWard === 'all' || b.ward.toLowerCase().includes(selectedWard.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || b.status === selectedStatus;
    return matchesWard && matchesStatus;
  });

  const availablePatients = patients.filter((p) => p.status !== 'inpatient');

  const handleConfirmAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitModalBed || !selectedPatientId) return;
    admitPatientToBed(selectedPatientId, admitModalBed.id);
    setAdmitModalBed(null);
    setSelectedPatientId('');
  };

  const statusBadges = {
    available: { label: 'Available', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    occupied: { label: 'Occupied', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    cleaning: { label: 'Cleaning', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    maintenance: { label: 'Maintenance', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    reserved: { label: 'Reserved', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Wards & Inpatient Bed Allocation
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-sky-400 font-mono font-medium border border-slate-700">
              {beds.filter((b) => b.status === 'occupied').length} / {beds.length} Occupied
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time visual telemetry, ward capacity management, and bed sanitization states.
          </p>
        </div>

        {/* Status Legend & 2D/3D View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewPerspective('2D_GRID')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewPerspective === '2D_GRID'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>2D Grid</span>
            </button>
            <button
              onClick={() => setViewPerspective('3D_ISOMETRIC')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewPerspective === '3D_ISOMETRIC'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Isometric Ward</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {Object.entries(statusBadges).map(([statusKey, val]) => (
              <span key={statusKey} className={`px-2 py-0.5 rounded-md border text-[11px] font-medium ${val.color}`}>
                {val.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Specialized Unit Queues & Discharge Planning Bar */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/40 border border-indigo-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">Specialized Unit Queues:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Units' },
            { id: 'ICU', label: 'Intensive Care (ICU)', count: beds.filter((b) => b.ward.includes('ICU')).length },
            { id: 'MATERNITY', label: 'Maternity Unit', count: beds.filter((b) => b.ward.includes('Pediatrics') || b.ward.includes('General')).length },
            { id: 'SURGICAL_SUITE', label: 'Surgical Suites (OT)', count: beds.filter((b) => b.ward.includes('Surgical')).length },
            { id: 'DISCHARGE_PENDING', label: 'Discharge Planning Ready', count: beds.filter((b) => b.status === 'occupied').length > 0 ? 2 : 0, highlight: true },
          ].map((q) => {
            const isActive = specializedQueue === q.id;
            return (
              <button
                key={q.id}
                onClick={() => setSpecializedQueue(q.id as any)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/40'
                    : q.highlight
                    ? 'bg-amber-950/40 border border-amber-700/60 text-amber-300 hover:bg-amber-900/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{q.label}</span>
                {q.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-400'}`}>
                    {q.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ward Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setSelectedWard('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedWard === 'all'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Wards ({beds.length})
          </button>
          {wardsList.map((w) => {
            const count = beds.filter((b) => b.ward.includes(w.split(' ')[0])).length;
            const occupied = beds.filter((b) => b.ward.includes(w.split(' ')[0]) && b.status === 'occupied').length;
            return (
              <button
                key={w}
                onClick={() => setSelectedWard(w)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                  selectedWard === w
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{w}</span>
                <span className="text-[10px] opacity-80 font-mono">
                  {occupied}/{count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
          >
            <option value="all">All Bed States</option>
            <option value="available">Available Only</option>
            <option value="occupied">Occupied Only</option>
            <option value="cleaning">Cleaning / Decon</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Bed Cards Grid with 2D or 3D Isometric View */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-all duration-500 ${
          viewPerspective === '3D_ISOMETRIC'
            ? 'perspective-[1200px] transform-gpu'
            : ''
        }`}
      >
        {filteredBeds
          .filter((bed) => {
            if (specializedQueue === 'ALL') return true;
            if (specializedQueue === 'ICU') return bed.ward.includes('ICU');
            if (specializedQueue === 'MATERNITY') return bed.ward.includes('Pediatrics') || bed.ward.includes('General');
            if (specializedQueue === 'SURGICAL_SUITE') return bed.ward.includes('Surgical');
            if (specializedQueue === 'DISCHARGE_PENDING') return bed.status === 'occupied';
            return true;
          })
          .map((bed, idx) => {
          const patient = bed.patientId ? patients.find((p) => p.id === bed.patientId) : null;
          const badge = statusBadges[bed.status];
          const isDischargeCandidate = bed.status === 'occupied' && idx % 2 === 0;

          return (
            <div
              key={bed.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                viewPerspective === '3D_ISOMETRIC'
                  ? 'rotate-x-[15deg] -rotate-y-[10deg] shadow-2xl hover:rotate-x-[0deg] hover:rotate-y-[0deg] hover:scale-105'
                  : 'hover:border-slate-600'
              } ${
                bed.status === 'occupied'
                  ? 'bg-slate-900/90 border-indigo-500/40 shadow-indigo-950/20'
                  : bed.status === 'available'
                  ? 'bg-slate-900/90 border-emerald-600/40 shadow-emerald-950/20'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              {/* Discharge Planning Flag */}
              {isDischargeCandidate && (
                <div className="mb-2 px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <CalendarCheck className="w-3 h-3 text-amber-400" />
                    Discharge Target: Today 15:00
                  </span>
                  <span className="font-mono">Step 4/5</span>
                </div>
              )}

              {/* Bed Header */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        bed.status === 'occupied'
                          ? 'bg-indigo-600 text-white'
                          : bed.status === 'available'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <BedDouble className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm font-mono">{bed.bedNumber}</div>
                      <div className="text-[10px] text-slate-400 truncate">{bed.ward}</div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Bed Content */}
                <div className="py-3 text-xs">
                  {bed.status === 'occupied' && (
                    <div className="space-y-1.5">
                      <div className="font-semibold text-white flex items-center justify-between">
                        <span className="truncate">{bed.patientName || 'Admitted Patient'}</span>
                        {patient && (
                          <span className="text-[10px] font-mono text-cyan-300 font-normal">
                            {patient.mrn}
                          </span>
                        )}
                      </div>

                      {patient ? (
                        <>
                          <div className="text-[11px] text-slate-400 truncate">
                            Dx: <span className="text-slate-300">{patient.primaryDiagnosis}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 pt-1 flex items-center justify-between">
                            <span className="text-cyan-300 font-semibold">{patient.vitals.bp}</span>
                            <span className="text-rose-400 font-semibold">{patient.vitals.hr} bpm</span>
                            <span className="text-emerald-400 font-semibold">{patient.vitals.spo2}% O2</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-400 text-xs">Admitted to Unit</div>
                      )}

                      <div className="text-[10px] text-slate-400 pt-1">
                        Daily Rate: <span className="text-slate-200 font-mono">${bed.dailyRate}/day</span>
                      </div>
                    </div>
                  )}

                  {bed.status === 'available' && (
                    <div className="text-slate-400 space-y-1">
                      <p className="text-emerald-300 text-xs font-medium">Sanitized & Ready for Intake</p>
                      <p className="text-[11px]">Daily Rate: ${bed.dailyRate}/day</p>
                    </div>
                  )}

                  {bed.status === 'cleaning' && (
                    <div className="text-amber-300 space-y-1">
                      <p className="text-xs font-medium flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Deep Clean in Progress
                      </p>
                      <p className="text-[11px] text-slate-400">Terminal sanitation protocol active</p>
                    </div>
                  )}

                  {bed.status === 'maintenance' && (
                    <div className="text-rose-300 space-y-1">
                      <p className="text-xs font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Equipment Servicing
                      </p>
                      <p className="text-[11px] text-slate-400">Biomedical engineering flagged</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bed Action Footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1 text-xs">
                {bed.status === 'occupied' && (
                  <>
                    {patient && (
                      <button
                        onClick={() => onSelectPatient(patient)}
                        className="px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[11px] font-medium"
                      >
                        Chart
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (bed.patientId && window.confirm(`Discharge patient from ${bed.bedNumber}?`)) {
                          dischargePatient(bed.patientId);
                        }
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-300 text-[11px]"
                    >
                      Discharge
                    </button>
                    <button
                      onClick={() => updateBedStatus(bed.id, 'cleaning')}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px]"
                      title="Set to Cleaning"
                    >
                      Clean
                    </button>
                  </>
                )}

                {bed.status === 'available' && (
                  <>
                    <button
                      onClick={() => setAdmitModalBed(bed)}
                      className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Admit Patient
                    </button>
                  </>
                )}

                {(bed.status === 'cleaning' || bed.status === 'maintenance') && (
                  <button
                    onClick={() => updateBedStatus(bed.id, 'available')}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium text-xs flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Mark Available
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Admit to Bed Modal */}
      {admitModalBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Admit Patient to Bed</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {admitModalBed.ward} • Bed {admitModalBed.bedNumber}
                </p>
              </div>
              <button
                onClick={() => setAdmitModalBed(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAdmission} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Select Registered Patient (Outpatient/Emergency)
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                >
                  <option value="">-- Choose Patient to Admit --</option>
                  {availablePatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.mrn}) - {p.primaryDiagnosis}
                    </option>
                  ))}
                </select>
                {availablePatients.length === 0 && (
                  <p className="text-[11px] text-amber-400 mt-1">
                    No unadmitted patients found. Register a new patient first.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdmitModalBed(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedPatientId}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50"
                >
                  Confirm Bed Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
