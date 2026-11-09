import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Patient, Vitals, Bed } from '../types';
import {
  X,
  Activity,
  Heart,
  Thermometer,
  Wind,
  FileText,
  Pill,
  FlaskConical,
  Receipt,
  BedDouble,
  AlertTriangle,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
} from 'lucide-react';

interface PatientDetailModalProps {
  patient: Patient;
  onClose: () => void;
  onAdmitToBed?: (patientId: string) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  onClose,
  onAdmitToBed,
}) => {
  const {
    dischargePatient,
    addPatientVitals,
    addClinicalNote,
    addPrescription,
    dispensePrescription,
    doctors,
    beds,
    admitPatientToBed,
    invoices,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'vitals' | 'notes' | 'prescriptions' | 'labs' | 'billing'
  >('overview');

  // Vitals form state
  const [newVitals, setNewVitals] = useState<Vitals>({
    bp: patient.vitals.bp || '120/80',
    hr: patient.vitals.hr || 75,
    temp: patient.vitals.temp || 98.6,
    spo2: patient.vitals.spo2 || 98,
    rr: patient.vitals.rr || 16,
    weight: patient.vitals.weight || 70,
    height: patient.vitals.height || 170,
    lastRecorded: 'Just now',
  });
  const [showVitalForm, setShowVitalForm] = useState(false);

  // New Note form state
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState('Daily Physician Progress Note');
  const [selectedDoctorId, setSelectedDoctorId] = useState(patient.attendingDoctorId || doctors[0]?.id || '');
  const [noteType, setNoteType] = useState<'progress' | 'rounds' | 'consultation' | 'discharge'>('progress');
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [aiGeneratingSoap, setAiGeneratingSoap] = useState(false);
  const [aiRoughNotes, setAiRoughNotes] = useState('');

  // New Prescription form state
  const [showRxForm, setShowRxForm] = useState(false);
  const [rxMedicine, setRxMedicine] = useState('');
  const [rxDosage, setRxDosage] = useState('');
  const [rxFrequency, setRxFrequency] = useState('BID (Twice Daily)');
  const [rxRoute, setRxRoute] = useState('Oral');
  const [rxDuration, setRxDuration] = useState('7 Days');

  // Bed allocation modal state
  const [showBedSelect, setShowBedSelect] = useState(false);
  const [selectedBedId, setSelectedBedId] = useState('');

  const patientInvoices = invoices.filter((i) => i.patientId === patient.id || i.patientMrn === patient.mrn);
  const availableBeds = beds.filter((b) => b.status === 'available');

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    addPatientVitals(patient.id, {
      ...newVitals,
      lastRecorded: 'Just now',
    });
    setShowVitalForm(false);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
    addClinicalNote(patient.id, {
      doctorId: doc.id,
      doctorName: doc.name,
      doctorRole: doc.specialty,
      title: noteTitle,
      type: noteType,
      soap: {
        subjective: subjective || 'Patient interviewed. Symptom report recorded.',
        objective: objective || `Vitals: BP ${patient.vitals.bp}, HR ${patient.vitals.hr}, SpO2 ${patient.vitals.spo2}%.`,
        assessment: assessment || patient.primaryDiagnosis,
        plan: plan || 'Continue current treatment and monitoring protocol.',
      },
    });
    setShowNoteForm(false);
    setSubjective('');
    setObjective('');
    setAssessment('');
    setPlan('');
    setAiRoughNotes('');
  };

  const handleGenerateAiSoap = async () => {
    if (!aiRoughNotes.trim()) return;
    setAiGeneratingSoap(true);
    try {
      const res = await fetch('/api/ai/soap-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorNotes: aiRoughNotes,
          patientInfo: {
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            diagnosis: patient.primaryDiagnosis,
            vitals: patient.vitals,
            allergies: patient.allergies,
          },
        }),
      });
      const data = await res.json();
      if (data.soapNote) {
        setSubjective(data.soapNote.subjective || '');
        setObjective(data.soapNote.objective || '');
        setAssessment(data.soapNote.assessment || '');
        setPlan(data.soapNote.plan || '');
      }
    } catch (err) {
      console.error('Failed to run AI Scribe:', err);
    } finally {
      setAiGeneratingSoap(false);
    }
  };

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxMedicine || !rxDosage) return;
    addPrescription(patient.id, {
      medicineName: rxMedicine,
      dosage: rxDosage,
      frequency: rxFrequency,
      route: rxRoute,
      duration: rxDuration,
      prescribedBy: patient.attendingDoctorName || 'Attending Physician',
    });
    setShowRxForm(false);
    setRxMedicine('');
    setRxDosage('');
  };

  const handleAssignBed = () => {
    if (!selectedBedId) return;
    admitPatientToBed(patient.id, selectedBedId);
    setShowBedSelect(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 bg-slate-800/80 border-b border-slate-700 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-lg text-white shadow-md shrink-0">
              {patient.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">{patient.name}</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-700 text-cyan-300 font-semibold border border-slate-600">
                  {patient.mrn}
                </span>
                {/* Status Badge */}
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    patient.status === 'inpatient'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : patient.status === 'emergency'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                      : patient.status === 'discharged'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {patient.status.toUpperCase()}
                </span>
              </div>

              {/* Patient Core Demographics */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1.5">
                <span>
                  <strong>Age/Gender:</strong> {patient.age} yrs • {patient.gender}
                </span>
                <span>
                  <strong>DOB:</strong> {patient.dob}
                </span>
                <span>
                  <strong>Blood Group:</strong>{' '}
                  <span className="font-semibold text-rose-400">{patient.bloodGroup}</span>
                </span>
                <span>
                  <strong>Phone:</strong> {patient.phone}
                </span>
                {patient.ward && patient.bedNumber && (
                  <span className="text-sky-300 font-medium flex items-center gap-1">
                    <BedDouble className="w-3.5 h-3.5 inline" /> {patient.ward} • Bed {patient.bedNumber}
                  </span>
                )}
              </div>

              {/* Allergy Warning Alert */}
              {patient.allergies && patient.allergies.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-300 bg-rose-950/40 px-2.5 py-1 rounded-md border border-rose-800/40">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>
                    <strong>Known Allergies:</strong> {patient.allergies.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Bed / Discharge Actions & Close */}
          <div className="flex items-center gap-2">
            {patient.status === 'inpatient' && (
              <button
                onClick={() => {
                  if (window.confirm(`Discharge patient ${patient.name}?`)) {
                    dischargePatient(patient.id);
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                Discharge Patient
              </button>
            )}

            {patient.status !== 'inpatient' && (
              <button
                onClick={() => setShowBedSelect(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white transition-colors flex items-center gap-1"
              >
                <BedDouble className="w-3.5 h-3.5" />
                Admit / Assign Bed
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 border-b border-slate-800 bg-slate-900/50 overflow-x-auto text-xs sm:text-sm font-medium">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'vitals', label: 'Vitals & Measurements', icon: Heart },
            { id: 'notes', label: `Clinical SOAP Notes (${patient.notes?.length || 0})`, icon: FileText },
            { id: 'prescriptions', label: `Prescriptions (${patient.prescriptions?.length || 0})`, icon: Pill },
            { id: 'labs', label: `Diagnostic Labs (${patient.labReports?.length || 0})`, icon: FlaskConical },
            { id: 'billing', label: `Financials & Invoices (${patientInvoices.length})`, icon: Receipt },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary Diagnosis & Doctor Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Primary Diagnosis
                  </span>
                  <div className="text-base font-bold text-white mt-1">
                    {patient.primaryDiagnosis || 'Under Clinical Evaluation'}
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    <strong>Admission Date:</strong> {new Date(patient.admissionDate).toLocaleString()}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Attending Physician
                  </span>
                  <div className="text-base font-bold text-white mt-1">
                    {patient.attendingDoctorName || 'Unassigned'}
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    <strong>Insurance:</strong> {patient.insurance.provider} ({patient.insurance.coveragePercent}% Coverage)
                  </div>
                </div>
              </div>

              {/* Current Vitals Snapshot Card */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Latest Vitals Summary
                    <span className="text-xs font-normal text-slate-400">
                      (Last recorded: {patient.vitals.lastRecorded})
                    </span>
                  </h3>
                  <button
                    onClick={() => setShowVitalForm(true)}
                    className="text-xs font-medium text-cyan-400 hover:text-cyan-300 underline"
                  >
                    + Record New Vitals
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <div className="text-slate-400 text-xs">Blood Pressure</div>
                    <div className="text-base font-bold text-cyan-300 mt-1">{patient.vitals.bp || '120/80'}</div>
                    <div className="text-[10px] text-slate-500">mmHg</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <div className="text-slate-400 text-xs">Heart Rate</div>
                    <div className="text-base font-bold text-rose-400 mt-1">{patient.vitals.hr || 72}</div>
                    <div className="text-[10px] text-slate-500">bpm</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <div className="text-slate-400 text-xs">Oxygen (SpO2)</div>
                    <div className="text-base font-bold text-emerald-400 mt-1">{patient.vitals.spo2 || 98}%</div>
                    <div className="text-[10px] text-slate-500">pulse ox</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <div className="text-slate-400 text-xs">Temperature</div>
                    <div className="text-base font-bold text-amber-300 mt-1">{patient.vitals.temp || 98.6}°F</div>
                    <div className="text-[10px] text-slate-500">oral/tympanic</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <div className="text-slate-400 text-xs">Resp. Rate</div>
                    <div className="text-base font-bold text-purple-300 mt-1">{patient.vitals.rr || 16}</div>
                    <div className="text-[10px] text-slate-500">breaths/min</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <div className="text-slate-400 text-xs">Weight & Height</div>
                    <div className="text-xs font-bold text-slate-200 mt-1">
                      {patient.vitals.weight || 70}kg / {patient.vitals.height || 175}cm
                    </div>
                    <div className="text-[10px] text-slate-500">BMI: ~24.2</div>
                  </div>
                </div>
              </div>

              {/* Medical History & Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <h4 className="text-xs uppercase font-semibold text-slate-400 mb-2">Past Medical History</h4>
                  {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                    <ul className="space-y-1 text-xs text-slate-200">
                      {patient.medicalHistory.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-slate-500">No prior chronic illnesses noted.</div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <h4 className="text-xs uppercase font-semibold text-slate-400 mb-2">Emergency Contact</h4>
                  <div className="text-xs text-slate-200 space-y-1">
                    <div>
                      <strong>Name:</strong> {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
                    </div>
                    <div>
                      <strong>Phone:</strong> {patient.emergencyContact.phone}
                    </div>
                    <div className="text-slate-400 pt-1">
                      Insurance Policy: {patient.insurance.provider} #{patient.insurance.policyNumber}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VITALS & MEASUREMENTS */}
          {activeTab === 'vitals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Clinical Vital Signs & Trends</h3>
                <button
                  onClick={() => setShowVitalForm(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Record New Vitals
                </button>
              </div>

              {/* Vitals Form Inline */}
              {showVitalForm && (
                <form
                  onSubmit={handleSaveVitals}
                  className="p-4 rounded-xl bg-slate-800 border border-cyan-500/40 space-y-3"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Record New Patient Vital Signs
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Blood Pressure (mmHg)</label>
                      <input
                        type="text"
                        value={newVitals.bp}
                        onChange={(e) => setNewVitals({ ...newVitals, bp: e.target.value })}
                        placeholder="120/80"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Heart Rate (bpm)</label>
                      <input
                        type="number"
                        value={newVitals.hr}
                        onChange={(e) => setNewVitals({ ...newVitals, hr: Number(e.target.value) })}
                        placeholder="72"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Temperature (°F)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newVitals.temp}
                        onChange={(e) => setNewVitals({ ...newVitals, temp: Number(e.target.value) })}
                        placeholder="98.6"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Oxygen Saturation (%)</label>
                      <input
                        type="number"
                        value={newVitals.spo2}
                        onChange={(e) => setNewVitals({ ...newVitals, spo2: Number(e.target.value) })}
                        placeholder="98"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowVitalForm(false)}
                      className="px-3 py-1 rounded text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Save Vitals
                    </button>
                  </div>
                </form>
              )}

              {/* Vitals Summary Card */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-400">Current Blood Pressure</div>
                    <div className="text-xl font-bold text-cyan-300 mt-1">{patient.vitals.bp}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Norm: 90/60 - 120/80</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-400">Pulse / Heart Rate</div>
                    <div className="text-xl font-bold text-rose-400 mt-1">{patient.vitals.hr} bpm</div>
                    <div className="text-[11px] text-slate-500 mt-1">Norm: 60 - 100 bpm</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-400">Oxygen Saturation</div>
                    <div className="text-xl font-bold text-emerald-400 mt-1">{patient.vitals.spo2}%</div>
                    <div className="text-[11px] text-slate-500 mt-1">Target: &gt; 95%</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-400">Core Temperature</div>
                    <div className="text-xl font-bold text-amber-300 mt-1">{patient.vitals.temp}°F</div>
                    <div className="text-[11px] text-slate-500 mt-1">Norm: 97.8°F - 99.1°F</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLINICAL SOAP NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Physician Clinical Progress Notes (SOAP)</h3>
                  <p className="text-xs text-slate-400">Formal Electronic Medical Record (EMR) documentation</p>
                </div>
                <button
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Write SOAP Note
                </button>
              </div>

              {/* Note Form with Gemini AI Scribe Assistant */}
              {showNoteForm && (
                <form onSubmit={handleSaveNote} className="p-4 rounded-xl bg-slate-800 border border-indigo-500/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                      New Clinical SOAP Entry
                    </h4>
                    <span className="text-[11px] text-cyan-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 inline" /> AI Medical Scribe Powered
                    </span>
                  </div>

                  {/* AI Quick Dictation / Scribe Box */}
                  <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40 space-y-2">
                    <label className="text-xs font-medium text-indigo-200 block">
                      Dictate or Type Rough Clinical Observations:
                    </label>
                    <textarea
                      value={aiRoughNotes}
                      onChange={(e) => setAiRoughNotes(e.target.value)}
                      placeholder="e.g., Patient feeling much better today, chest pain resolved, walked in hallway without shortness of breath, plan to step down to general telemetry and discharge in 48 hours..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white resize-y"
                      rows={2}
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleGenerateAiSoap}
                        disabled={aiGeneratingSoap || !aiRoughNotes.trim()}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {aiGeneratingSoap ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Formatting SOAP...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Generate Formal SOAP with AI
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Title</label>
                      <input
                        type="text"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Author / Physician</label>
                      <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        {doctors.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.specialty})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Encounter Type</label>
                      <select
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="progress">Daily Progress Note</option>
                        <option value="rounds">Attending Rounds</option>
                        <option value="consultation">Specialist Consultation</option>
                        <option value="discharge">Discharge Summary</option>
                      </select>
                    </div>
                  </div>

                  {/* SOAP Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-cyan-300 block mb-1">
                        [S] Subjective (Patient Report & Symptoms)
                      </label>
                      <textarea
                        value={subjective}
                        onChange={(e) => setSubjective(e.target.value)}
                        placeholder="Patient stated complaints, onset, pain scale, review of systems..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-emerald-300 block mb-1">
                        [O] Objective (Physical Exam & Labs)
                      </label>
                      <textarea
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        placeholder="Vital signs, physical exam findings, telemetry, lab values..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-amber-300 block mb-1">
                        [A] Assessment (Clinical Diagnosis & Evolution)
                      </label>
                      <textarea
                        value={assessment}
                        onChange={(e) => setAssessment(e.target.value)}
                        placeholder="Primary diagnosis, stability, differential considerations..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-purple-300 block mb-1">
                        [P] Plan (Therapeutics, Orders & Followup)
                      </label>
                      <textarea
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                        placeholder="Medication changes, diagnostics ordered, consults, diet, discharge goal..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNoteForm(false)}
                      className="px-3 py-1 rounded text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Sign & Save to Medical Record
                    </button>
                  </div>
                </form>
              )}

              {/* Notes List */}
              <div className="space-y-3">
                {patient.notes && patient.notes.length > 0 ? (
                  patient.notes.map((note) => (
                    <div key={note.id} className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
                        <div>
                          <div className="font-semibold text-sm text-white">{note.title}</div>
                          <div className="text-xs text-slate-400">
                            {note.doctorName} • {note.doctorRole}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Date(note.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>

                      {/* SOAP Breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                          <span className="font-bold text-cyan-400 block mb-0.5">Subjective:</span>
                          <p className="text-slate-300 leading-relaxed">{note.soap.subjective}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                          <span className="font-bold text-emerald-400 block mb-0.5">Objective:</span>
                          <p className="text-slate-300 leading-relaxed">{note.soap.objective}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                          <span className="font-bold text-amber-400 block mb-0.5">Assessment:</span>
                          <p className="text-slate-300 leading-relaxed">{note.soap.assessment}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                          <span className="font-bold text-purple-400 block mb-0.5">Plan:</span>
                          <p className="text-slate-300 leading-relaxed">{note.soap.plan}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No clinical SOAP notes written yet. Click &quot;Write SOAP Note&quot; to begin documentation.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Active Prescriptions & Medication Administration</h3>
                  <p className="text-xs text-slate-400">Medication Orders sent to hospital pharmacy</p>
                </div>
                <button
                  onClick={() => setShowRxForm(!showRxForm)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Prescribe Drug
                </button>
              </div>

              {/* Prescription Form */}
              {showRxForm && (
                <form onSubmit={handleSavePrescription} className="p-4 rounded-xl bg-slate-800 border border-emerald-500/40 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Order New Medication
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Medication Name</label>
                      <input
                        type="text"
                        value={rxMedicine}
                        onChange={(e) => setRxMedicine(e.target.value)}
                        placeholder="e.g. Amoxicillin, Lisinopril"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Dosage</label>
                      <input
                        type="text"
                        value={rxDosage}
                        onChange={(e) => setRxDosage(e.target.value)}
                        placeholder="e.g. 500 mg, 10 mL, 2.5 mg"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Frequency</label>
                      <select
                        value={rxFrequency}
                        onChange={(e) => setRxFrequency(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="Once Daily (Q24H)">Once Daily (Q24H)</option>
                        <option value="BID (Twice Daily)">BID (Twice Daily)</option>
                        <option value="TID (Three Times Daily)">TID (Three Times Daily)</option>
                        <option value="Q4H PRN Pain/Wheezing">Q4H PRN Pain/Wheezing</option>
                        <option value="Continuous IV Infusion">Continuous IV Infusion</option>
                        <option value="Stat (Immediate One-Time)">Stat (Immediate One-Time)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Route</label>
                      <select
                        value={rxRoute}
                        onChange={(e) => setRxRoute(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="Oral">Oral (PO)</option>
                        <option value="IV">Intravenous (IV)</option>
                        <option value="Subcutaneous">Subcutaneous (SubQ)</option>
                        <option value="Inhalation">Inhalation</option>
                        <option value="Topical">Topical</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Duration</label>
                      <input
                        type="text"
                        value={rxDuration}
                        onChange={(e) => setRxDuration(e.target.value)}
                        placeholder="e.g. 7 Days, Indefinite, 3 doses"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRxForm(false)}
                      className="px-3 py-1 rounded text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Submit Prescription Order
                    </button>
                  </div>
                </form>
              )}

              {/* Medication Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-800/40">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Medication</th>
                      <th className="p-3">Dosage & Route</th>
                      <th className="p-3">Schedule</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Pharmacy Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {patient.prescriptions && patient.prescriptions.length > 0 ? (
                      patient.prescriptions.map((rx) => (
                        <tr key={rx.id} className="hover:bg-slate-800/50">
                          <td className="p-3 font-semibold text-white">
                            {rx.medicineName}
                            <div className="text-[10px] text-slate-400 font-normal">
                              Rx by: {rx.prescribedBy} • {rx.datePrescribed}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-cyan-300 font-medium">{rx.dosage}</span> ({rx.route})
                          </td>
                          <td className="p-3">{rx.frequency}</td>
                          <td className="p-3 text-slate-400">{rx.duration}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                rx.status === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-slate-700 text-slate-400'
                              }`}
                            >
                              {rx.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {rx.dispensed ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Dispensed
                              </span>
                            ) : (
                              <button
                                onClick={() => dispensePrescription(patient.id, rx.id)}
                                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px]"
                              >
                                Dispense Now
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          No medications prescribed yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: DIAGNOSTIC LABS & RADIOLOGY */}
          {activeTab === 'labs' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Laboratory Panels & Imaging Diagnostics</h3>
              {patient.labReports && patient.labReports.length > 0 ? (
                <div className="space-y-4">
                  {patient.labReports.map((lab) => (
                    <div key={lab.id} className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-2">
                            {lab.testName}
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                              {lab.category}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            Ordered by {lab.doctorName} • {new Date(lab.date).toLocaleDateString()}
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            lab.status === 'critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {lab.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Results breakdown */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/50">
                            <tr>
                              <th className="p-2">Analyte / Metric</th>
                              <th className="p-2">Observed Value</th>
                              <th className="p-2">Reference Range</th>
                              <th className="p-2">Flag</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/40">
                            {lab.results.map((r, i) => (
                              <tr key={i}>
                                <td className="p-2 font-medium text-slate-200">{r.metric}</td>
                                <td className="p-2 font-mono font-bold text-white">
                                  {r.value} {r.unit}
                                </td>
                                <td className="p-2 text-slate-400 font-mono text-[11px]">{r.referenceRange}</td>
                                <td className="p-2">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      r.status === 'critical' || r.status === 'high'
                                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                        : r.status === 'low'
                                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                        : 'text-emerald-400'
                                    }`}
                                  >
                                    {r.status.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {lab.conclusion && (
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                          <strong className="text-cyan-300">Radiologist / Pathologist Impression:</strong> {lab.conclusion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No diagnostic labs on file for this patient.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: BILLING & INVOICES */}
          {activeTab === 'billing' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Patient Invoices & Statements</h3>
              {patientInvoices.length > 0 ? (
                <div className="space-y-4">
                  {patientInvoices.map((inv) => (
                    <div key={inv.id} className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                        <div>
                          <div className="font-bold text-sm text-white font-mono">{inv.invoiceNumber}</div>
                          <div className="text-xs text-slate-400">Date: {inv.date} • Due: {inv.dueDate}</div>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            inv.status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : inv.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-sky-500/20 text-sky-300'
                          }`}
                        >
                          {inv.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1 text-xs">
                        {inv.items.map((item) => (
                          <div key={item.id} className="flex justify-between py-1 text-slate-300">
                            <span>
                              {item.description} (x{item.quantity})
                            </span>
                            <span className="font-mono text-white">${(item.cost * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-700/60 flex justify-between text-xs">
                        <div className="text-slate-400">
                          Insurance Covered: <span className="text-emerald-400 font-mono">-${inv.insuranceDiscount.toFixed(2)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 mr-2">Patient Total:</span>
                          <span className="text-base font-bold text-cyan-300 font-mono">${inv.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No billing statements currently generated for this patient.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bed Allocation Modal Overlay if active */}
        {showBedSelect && (
          <div className="p-4 bg-slate-800 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-sky-400" />
              <span className="text-xs text-slate-200 font-medium">Select Available Bed:</span>
              <select
                value={selectedBedId}
                onChange={(e) => setSelectedBedId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                <option value="">-- Choose a Bed --</option>
                {availableBeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.ward} - {b.bedNumber} (${b.dailyRate}/day)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBedSelect(false)}
                className="px-3 py-1 rounded text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignBed}
                disabled={!selectedBedId}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50"
              >
                Confirm Admission
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
