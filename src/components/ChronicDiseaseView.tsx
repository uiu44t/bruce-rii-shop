import React, { useState } from 'react';
import {
  HeartPulse,
  Activity,
  AlertTriangle,
  Calendar,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Pill,
  Send,
  User,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { MOCK_CHRONIC_CARE } from '../data/mockRwandaNationalData';
import { ChronicCareProgram } from '../types';
import { useHospital } from '../context/HospitalContext';

export const ChronicDiseaseView: React.FC = () => {
  const { patients, showToast } = useHospital();
  const [programs, setPrograms] = useState<ChronicCareProgram[]>(MOCK_CHRONIC_CARE);
  const [selectedCondition, setSelectedCondition] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Enroll modal
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);
  const [enrollPatientId, setEnrollPatientId] = useState<string>(patients[0]?.id || 'p-001');
  const [condition, setCondition] = useState<ChronicCareProgram['condition']>('Diabetes');
  const [stageOrType, setStageOrType] = useState<string>('Type 2 Diabetes Mellitus');
  const [carePlan, setCarePlan] = useState<string>('Bi-monthly fasting blood sugar, low carbohydrate diet, regular physical exercise.');
  const [nextAppointment, setNextAppointment] = useState<string>('2026-04-20');
  const [nextLab, setNextLab] = useState<string>('HbA1c & Fasting Lipid Panel');
  const [medsList, setMedsList] = useState<string>('Metformin 850mg BID, Glimepiride 2mg OD');

  const filteredPrograms = programs.filter((prog) => {
    if (selectedCondition !== 'ALL' && prog.condition !== selectedCondition) return false;
    if (selectedStatus !== 'ALL' && prog.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = prog.patient_name.toLowerCase().includes(q);
      const matchMrn = prog.patient_mrn.toLowerCase().includes(q);
      const matchNin = prog.patient_nin ? prog.patient_nin.toLowerCase().includes(q) : false;
      const matchStage = prog.stage_or_type.toLowerCase().includes(q);
      if (!matchName && !matchMrn && !matchNin && !matchStage) return false;
    }
    return true;
  });

  const stableCount = programs.filter((p) => p.status === 'STABLE').length;
  const attentionCount = programs.filter((p) => p.status === 'ATTENTION_NEEDED').length;
  const criticalCount = programs.filter((p) => p.status === 'CRITICAL').length;
  const avgAdherence = Math.round(
    programs.reduce((acc, curr) => acc + curr.adherence_rate_pct, 0) / programs.length
  );

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === enrollPatientId) || patients[0];

    const newProg: ChronicCareProgram = {
      id: `ch-prog-${Date.now()}`,
      patient_id: pat.id,
      patient_name: pat.name,
      patient_mrn: pat.mrn,
      patient_nin: pat.nin || '1 1990 8 0012345 1 20',
      condition,
      stage_or_type: stageOrType,
      diagnosis_date: new Date().toISOString().split('T')[0],
      attending_clinician: 'Dr. Jean de Dieu Habumugisha, MD',
      facility_name: 'CHUK Chronic Care Center',
      latest_vitals: {
        bp: pat.vitals.bp,
        blood_glucose: '124 mg/dL',
      },
      active_medications: medsList.split(',').map((m) => m.trim()),
      care_plan: carePlan,
      next_appointment_date: nextAppointment,
      next_lab_due: nextLab,
      status: 'STABLE',
      adherence_rate_pct: 90,
      last_consult_notes: 'Initial chronic disease cohort enrollment completed. SMS appointment alerts dispatched.',
    };

    setPrograms((prev) => [newProg, ...prev]);
    setShowEnrollModal(false);
    showToast({
      title: 'Patient Enrolled',
      message: `${pat.name} registered into ${condition} management registry.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <HeartPulse className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  Chronic Disease Management Programs
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    National Registry
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Longitudinal care pathways for Diabetes, Hypertension, Asthma, HIV, Tuberculosis, Chronic Kidney Disease, and Heart Disease.
                </p>
              </div>
            </div>
          </div>

          <button
            id="enroll-chronic-patient-btn"
            onClick={() => setShowEnrollModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/40"
          >
            <Plus className="w-3.5 h-3.5" />
            Enroll Patient in Program
          </button>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Enrolled Cohort</div>
            <div className="text-lg font-black text-slate-100 mt-0.5">{programs.length} Patients</div>
            <div className="text-[10px] text-slate-400">In 7 National Programs</div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-400">Stable Condition</div>
            <div className="text-lg font-black text-emerald-300 mt-0.5">{stableCount}</div>
            <div className="text-[10px] text-slate-400">Biomarkers on target</div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-400">Attention Needed</div>
            <div className="text-lg font-black text-amber-300 mt-0.5">{attentionCount}</div>
            <div className="text-[10px] text-slate-400">Dose titration / Low adherence</div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/50 text-center">
            <div className="text-[10px] uppercase font-bold text-cyan-400">Cohort Adherence Rate</div>
            <div className="text-lg font-black text-cyan-300 mt-0.5">{avgAdherence}%</div>
            <div className="text-[10px] text-slate-400">Average medication compliance</div>
          </div>
        </div>

        {/* Condition Filter Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="search-chronic-input"
                type="text"
                placeholder="Search patient, MRN, diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-60"
              />
            </div>

            <select
              id="select-condition-filter"
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Conditions ({programs.length})</option>
              <option value="Diabetes">Diabetes Mellitus</option>
              <option value="Hypertension">Hypertension</option>
              <option value="Asthma">Asthma / COPD</option>
              <option value="HIV">HIV Care</option>
              <option value="Tuberculosis">Tuberculosis (TB)</option>
              <option value="Kidney disease">Chronic Kidney Disease</option>
              <option value="Heart disease">Heart Disease</option>
            </select>

            <select
              id="select-chronic-status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Clinical Statuses</option>
              <option value="STABLE">Stable</option>
              <option value="ATTENTION_NEEDED">Attention Needed</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cohort Patient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrograms.map((prog) => {
          const isStable = prog.status === 'STABLE';
          const isAttention = prog.status === 'ATTENTION_NEEDED';
          const isCritical = prog.status === 'CRITICAL';

          return (
            <div
              key={prog.id}
              id={`chronic-prog-card-${prog.id}`}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      {prog.condition}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isStable
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isAttention
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {prog.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mt-1">{prog.patient_name}</h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    MRN: {prog.patient_mrn} | NIN: {prog.patient_nin}
                  </div>
                </div>

                {/* Adherence Rate */}
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Adherence</div>
                  <div className="text-base font-black text-cyan-400">{prog.adherence_rate_pct}%</div>
                </div>
              </div>

              {/* Diagnosis & Staging */}
              <div className="text-xs">
                <span className="text-slate-400">Diagnosis & Stage:</span>{' '}
                <strong className="text-slate-200">{prog.stage_or_type}</strong>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Diagnosed on: {prog.diagnosis_date} • Attending: {prog.attending_clinician}
                </div>
              </div>

              {/* Biomarkers / Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-800/60 border border-slate-800 rounded-xl p-2.5 text-center text-xs">
                {prog.latest_vitals.blood_glucose && (
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Blood Sugar</div>
                    <div className="font-bold text-slate-200 mt-0.5">{prog.latest_vitals.blood_glucose}</div>
                  </div>
                )}
                {prog.latest_vitals.hba1c && (
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">HbA1c</div>
                    <div className="font-bold text-emerald-400 mt-0.5">{prog.latest_vitals.hba1c}</div>
                  </div>
                )}
                {prog.latest_vitals.bp && (
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Blood Pressure</div>
                    <div className="font-bold text-slate-200 mt-0.5">{prog.latest_vitals.bp}</div>
                  </div>
                )}
                {prog.latest_vitals.peak_flow && (
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Peak Flow</div>
                    <div className="font-bold text-cyan-300 mt-0.5">{prog.latest_vitals.peak_flow}</div>
                  </div>
                )}
                {prog.latest_vitals.egfr && (
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">eGFR Function</div>
                    <div className="font-bold text-slate-200 mt-0.5">{prog.latest_vitals.egfr}</div>
                  </div>
                )}
              </div>

              {/* Active Chronic Medications */}
              <div className="text-xs space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Pill className="w-3 h-3 text-purple-400" /> Active Maintenance Medications:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {prog.active_medications.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-200 border border-slate-700"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Care Plan & Next Appointment */}
              <div className="pt-2 border-t border-slate-800 text-xs space-y-2">
                <div className="text-slate-300">
                  <span className="text-slate-400">Care Plan:</span> {prog.care_plan}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-800/40 p-2 rounded-xl text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Next Consult: <strong className="text-slate-200">{prog.next_appointment_date}</strong></span>
                  </div>
                  {prog.next_lab_due && (
                    <div className="flex items-center gap-1.5 text-cyan-300">
                      <Activity className="w-3.5 h-3.5" />
                      <span>Lab: {prog.next_lab_due}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <HeartPulse className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">Enroll Patient in Chronic Disease Program</h3>
              </div>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Patient</label>
                <select
                  value={enrollPatientId}
                  onChange={(e) => setEnrollPatientId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.mrn}) — {p.age}y
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Condition Program</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  >
                    <option value="Diabetes">Diabetes Mellitus</option>
                    <option value="Hypertension">Hypertension</option>
                    <option value="Asthma">Asthma / COPD</option>
                    <option value="HIV">HIV Care</option>
                    <option value="Tuberculosis">Tuberculosis (TB)</option>
                    <option value="Kidney disease">Chronic Kidney Disease</option>
                    <option value="Heart disease">Heart Disease</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Diagnosis & Clinical Stage</label>
                  <input
                    type="text"
                    required
                    value={stageOrType}
                    onChange={(e) => setStageOrType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Maintenance Medications (comma separated)</label>
                <input
                  type="text"
                  required
                  value={medsList}
                  onChange={(e) => setMedsList(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Clinical Care Plan</label>
                <textarea
                  rows={2}
                  value={carePlan}
                  onChange={(e) => setCarePlan(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Next Clinic Date</label>
                  <input
                    type="date"
                    required
                    value={nextAppointment}
                    onChange={(e) => setNextAppointment(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Next Laboratory Test</label>
                  <input
                    type="text"
                    value={nextLab}
                    onChange={(e) => setNextLab(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-enroll-chronic"
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-900/40"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enroll into Cohort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
