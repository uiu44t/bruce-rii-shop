import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { SurgeryRecord, SurgeryStatus } from '../types';
import { translations } from '../utils/translations';
import {
  Activity,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  ShieldCheck,
  Stethoscope,
  X,
  Calendar,
  Receipt,
  FileText,
  Check,
} from 'lucide-react';

export const SurgeryView: React.FC = () => {
  const { surgeries, scheduleSurgery, updateSurgeryStatus, billSurgery, patients, doctors, language, addToast } =
    useHospital();
  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSurgery, setSelectedSurgery] = useState<SurgeryRecord | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // New Surgery Form
  const [patientId, setPatientId] = useState('');
  const [procedureName, setProcedureName] = useState('');
  const [operatingRoom, setOperatingRoom] = useState('OR-1 (Trauma & Emergency)');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [leadSurgeon, setLeadSurgeon] = useState('Dr. Emmanuel Nkurunziza');
  const [anesthesiologist, setAnesthesiologist] = useState('Dr. Eric Maniragaba');
  const [scrubNurse, setScrubNurse] = useState('Nurse Keza Diane');
  const [estimatedCost, setEstimatedCost] = useState(350000);

  const filteredSurgeries = surgeries.filter((s) => {
    const matchesSearch =
      s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.procedureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.operatingRoom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.leadSurgeon.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const inProgressCount = surgeries.filter((s) => s.status === 'in_progress').length;
  const scheduledCount = surgeries.filter((s) => s.status === 'scheduled').length;
  const pacuCount = surgeries.filter((s) => s.status === 'pacu').length;
  const completedCount = surgeries.filter((s) => s.status === 'completed').length;

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === patientId);
    if (!pat) return;

    scheduleSurgery({
      patientId: pat.id,
      patientName: pat.name,
      patientMrn: pat.mrn,
      procedureName,
      operatingRoom,
      scheduledDate,
      scheduledTime,
      durationMinutes,
      leadSurgeon,
      anesthesiologist,
      scrubNurse,
      circulatingNurse: 'Nurse Alice Uwimana',
      estimatedCost,
      status: 'scheduled',
      billed: false,
      preOpChecklist: {
        consentSigned: true,
        fastingConfirmed: true,
        surgicalSiteMarked: true,
        anesthesiaSafetyCheck: true,
        pulseOximeterFunctioning: true,
        knownAllergiesChecked: true,
        difficultAirwayEvaluated: false,
        bloodProductsAvailable: true,
      },
    });

    setShowScheduleModal(false);
    resetForm();
  };

  const resetForm = () => {
    setPatientId('');
    setProcedureName('');
    setEstimatedCost(350000);
  };

  const handleBillSurgery = (surgId: string) => {
    billSurgery(surgId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-rose-400" />
            {t.surgery.operatingRooms}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 font-mono font-medium border border-rose-800">
              {surgeries.length} Cases
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Surgical schedule, WHO surgical safety checklists, intra-op documentation & Post-Anesthesia Care Unit (PACU).
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-900/30 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t.surgery.scheduleSurgery}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">In Progress (Active OR)</div>
          <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">{inProgressCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Sterile field open</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Scheduled Today</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{scheduledCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Pre-op preparation</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">PACU / Recovery</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">{pacuCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Extubated & monitoring</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Completed Surgeries</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{completedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Discharged to ward</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search procedure, patient name, lead surgeon, or room..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {['all', 'scheduled', 'in_progress', 'pacu', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Surgeries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSurgeries.map((surg) => {
          const isChecklistComplete =
            surg.preOpChecklist.consentSigned &&
            surg.preOpChecklist.fastingConfirmed &&
            surg.preOpChecklist.surgicalSiteMarked &&
            surg.preOpChecklist.anesthesiaSafetyCheck &&
            surg.preOpChecklist.pulseOximeterFunctioning &&
            surg.preOpChecklist.bloodProductsAvailable;

          return (
            <div
              key={surg.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-rose-300 font-semibold border border-slate-700">
                      {surg.operatingRoom}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5 line-clamp-1">{surg.procedureName}</h3>
                    <div className="text-xs text-slate-300">
                      {surg.patientName} <span className="text-slate-500 font-mono">({surg.patientMrn})</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                      surg.status === 'in_progress'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                        : surg.status === 'pacu'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : surg.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {surg.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-[11px] text-slate-400">
                  <div>
                    <span className="text-slate-500 block">Surgeon:</span>
                    <strong className="text-slate-200">{surg.leadSurgeon}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Anesthesiologist:</span>
                    <span className="text-slate-300">{surg.anesthesiologist}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Schedule:</span>
                    <span className="text-slate-300">
                      {surg.scheduledDate} @ {surg.scheduledTime} ({surg.durationMinutes}m)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Cost / Billed:</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {surg.estimatedCost.toLocaleString()} RWF {surg.billed ? '✓' : ''}
                    </span>
                  </div>
                </div>

                {/* WHO Checklist Badge */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck
                      className={`w-4 h-4 ${isChecklistComplete ? 'text-emerald-400' : 'text-amber-400'}`}
                    />
                    <span className={isChecklistComplete ? 'text-emerald-400 text-[11px]' : 'text-amber-400 text-[11px]'}>
                      {isChecklistComplete ? 'WHO Checklist Verified' : 'Checklist Pending'}
                    </span>
                  </div>
                  {surg.aldreteScore !== undefined && (
                    <span className="text-[11px] text-cyan-300 font-mono">
                      Aldrete: {surg.aldreteScore}/10
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedSurgery(surg)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  WHO Details
                </button>

                <div className="flex items-center gap-1.5">
                  {surg.status === 'scheduled' && (
                    <button
                      onClick={() => updateSurgeryStatus(surg.id, 'in_progress')}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-all"
                    >
                      Start Surgery
                    </button>
                  )}
                  {surg.status === 'in_progress' && (
                    <button
                      onClick={() => updateSurgeryStatus(surg.id, 'pacu')}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white transition-all"
                    >
                      Transfer PACU
                    </button>
                  )}
                  {surg.status === 'pacu' && (
                    <button
                      onClick={() => updateSurgeryStatus(surg.id, 'completed')}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
                    >
                      Discharge PACU
                    </button>
                  )}
                  {!surg.billed && surg.status === 'completed' && (
                    <button
                      onClick={() => handleBillSurgery(surg.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1"
                    >
                      <Receipt className="w-3 h-3" />
                      Bill
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* WHO Checklist & Post-Op Modal */}
      {selectedSurgery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-400" />
                  WHO Surgical Safety Protocol & Documentation
                </h3>
                <div className="text-xs text-slate-400">
                  {selectedSurgery.procedureName} • {selectedSurgery.patientName} ({selectedSurgery.operatingRoom})
                </div>
              </div>
              <button onClick={() => setSelectedSurgery(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* WHO Checklist Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Sign In (Before Induction) & Time Out Verification
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(selectedSurgery.preOpChecklist).map(([key, val]) => (
                  <div
                    key={key}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      val
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    {val ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1">
                <span className="font-bold text-slate-200">Post-Operative Surgeon Note:</span>
                <p className="text-slate-400">
                  {selectedSurgery.postOpNotes ||
                    'Procedure completed without surgical complications. Hemostasis achieved. Sponge and needle count correct.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1">
                <span className="font-bold text-cyan-300">PACU Recovery Metrics:</span>
                <p className="text-slate-400">
                  {selectedSurgery.pacuRecoveryVitals ||
                    'BP 120/75 mmHg, HR 72 bpm, SpO2 99% on 2L O2. Aldrete recovery score: 9/10.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedSurgery(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Surgery Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl text-slate-100 space-y-4 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-400" />
                Schedule Operating Theatre Procedure
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Select Patient *</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.mrn}) - Blood: {p.bloodGroup}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Procedure Name *</label>
                <input
                  type="text"
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                  placeholder="e.g. Laparoscopic Cholecystectomy / Emergency C-Section"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Operating Theatre Room</label>
                  <select
                    value={operatingRoom}
                    onChange={(e) => setOperatingRoom(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="OR-1 (Trauma & Emergency)">OR-1 (Trauma & Emergency)</option>
                    <option value="OR-2 (Laparoscopy & Minimally Invasive)">OR-2 (Laparoscopy)</option>
                    <option value="OR-3 (Obstetric & Gynecologic OT)">OR-3 (Obstetric OT)</option>
                    <option value="OR-4 (Orthopedic & Neuro)">OR-4 (Orthopedic & Neuro)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Lead Surgeon</label>
                  <input
                    type="text"
                    value={leadSurgeon}
                    onChange={(e) => setLeadSurgeon(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Estimated Cost (RWF)</label>
                  <input
                    type="number"
                    step="10000"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Confirm Surgical Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
