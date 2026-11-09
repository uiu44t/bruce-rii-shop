import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Sparkles,
  FileText,
  Pill,
  Flame,
  FileCheck2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Copy,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Heart,
} from 'lucide-react';

export const AiAssistantView: React.FC = () => {
  const { patients, doctors, addClinicalNote } = useHospital();

  const [activeTool, setActiveTool] = useState<'soap' | 'drug' | 'triage' | 'discharge'>('soap');

  // Tool 1: SOAP Scribe State
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [doctorDictation, setDoctorDictation] = useState(
    'Patient feeling improved, chest tightness subsided after second dose of sublingual nitro. Telemetry shows NSR with resolved ST elevation. Vitals stable. Plan to transfer out of ICU to general step-down telemetry unit tomorrow morning, repeat troponin at 0800.'
  );
  const [soapLoading, setSoapLoading] = useState(false);
  const [soapResult, setSoapResult] = useState<any>(null);
  const [soapSaved, setSoapSaved] = useState(false);

  // Tool 2: Drug Interaction State
  const [drugInput, setDrugInput] = useState('Warfarin, Aspirin, Ibuprofen, Omeprazole');
  const [allergiesInput, setAllergiesInput] = useState('NSAIDs, Penicillin');
  const [drugLoading, setDrugLoading] = useState(false);
  const [drugResult, setDrugResult] = useState<any>(null);

  // Tool 3: Triage Assist State
  const [triageComplaint, setTriageComplaint] = useState(
    'Sudden onset severe crushing substernal chest pressure radiating to left arm and jaw. Diaphoretic, pale, mild shortness of breath.'
  );
  const [triageAge, setTriageAge] = useState(58);
  const [triageGender, setTriageGender] = useState('Male');
  const [triageBp, setTriageBp] = useState('165/100');
  const [triageHr, setTriageHr] = useState(105);
  const [triageSpo2, setTriageSpo2] = useState(94);
  const [triageTemp, setTriageTemp] = useState(98.8);
  const [triageRr, setTriageRr] = useState(24);
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<any>(null);

  // Tool 4: Discharge Summary State
  const [dischargePatientId, setDischargePatientId] = useState(patients[0]?.id || '');
  const [courseNotes, setCourseNotes] = useState(
    'Admitted with Non-ST Elevation Myocardial Infarction. Underwent diagnostic cardiac catheterization with drug-eluting stent to LAD. Patient tolerated procedure well without vascular complications. Daily telemetry unremarkable.'
  );
  const [dischargeLoading, setDischargeLoading] = useState(false);
  const [dischargeResult, setDischargeResult] = useState<any>(null);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const dischargePatient = patients.find((p) => p.id === dischargePatientId) || patients[0];

  // Tool Handlers
  const handleGenerateSoap = async () => {
    if (!doctorDictation.trim()) return;
    setSoapLoading(true);
    setSoapResult(null);
    setSoapSaved(false);
    try {
      const res = await fetch('/api/ai/soap-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorNotes: doctorDictation,
          patientInfo: {
            name: selectedPatient.name,
            age: selectedPatient.age,
            gender: selectedPatient.gender,
            diagnosis: selectedPatient.primaryDiagnosis,
            vitals: selectedPatient.vitals,
            allergies: selectedPatient.allergies,
          },
        }),
      });
      const data = await res.json();
      setSoapResult(data.soapNote);
    } catch (err) {
      console.error(err);
    } finally {
      setSoapLoading(false);
    }
  };

  const handleSaveSoapToPatient = () => {
    if (!soapResult || !selectedPatient) return;
    const doc = doctors[0];
    addClinicalNote(selectedPatient.id, {
      doctorId: doc.id,
      doctorName: doc.name,
      doctorRole: doc.specialty,
      title: 'AI Assisted Physician Progress Note',
      type: 'progress',
      soap: {
        subjective: soapResult.subjective,
        objective: soapResult.objective,
        assessment: soapResult.assessment,
        plan: soapResult.plan,
      },
    });
    setSoapSaved(true);
  };

  const handleCheckDrugInteractions = async () => {
    if (!drugInput.trim()) return;
    setDrugLoading(true);
    setDrugResult(null);
    try {
      const drugs = drugInput.split(',').map((s) => s.trim()).filter(Boolean);
      const allergies = allergiesInput.split(',').map((s) => s.trim()).filter(Boolean);

      const res = await fetch('/api/ai/drug-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugs, patientAllergies: allergies }),
      });
      const data = await res.json();
      setDrugResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDrugLoading(false);
    }
  };

  const handleRunTriageAssist = async () => {
    if (!triageComplaint.trim()) return;
    setTriageLoading(true);
    setTriageResult(null);
    try {
      const res = await fetch('/api/ai/triage-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chiefComplaint: triageComplaint,
          vitals: {
            bp: triageBp,
            hr: Number(triageHr),
            temp: Number(triageTemp),
            spo2: Number(triageSpo2),
            rr: Number(triageRr),
          },
          age: Number(triageAge),
          gender: triageGender,
        }),
      });
      const data = await res.json();
      setTriageResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTriageLoading(false);
    }
  };

  const handleGenerateDischarge = async () => {
    if (!dischargePatient) return;
    setDischargeLoading(true);
    setDischargeResult(null);
    try {
      const res = await fetch('/api/ai/discharge-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: dischargePatient,
          hospitalCourse: courseNotes,
        }),
      });
      const data = await res.json();
      setDischargeResult(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setDischargeLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-cyan-950/50 border border-cyan-800/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              Gemini 3.8 Flash Clinical Suite
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            AI Clinical Decision Support & Medical Scribe
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Automate clinical documentation, screen pharmacologic regimens for contraindications, and assess emergency triage severity.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Server-Side Isolated • HIPAA Safe</span>
        </div>
      </div>

      {/* Tool Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: 'soap', label: '1. SOAP Note Scribe', icon: FileText, desc: 'Transforms dictation to formal EMR notes' },
          { id: 'drug', label: '2. Drug Interactions', icon: Pill, desc: 'Multi-drug contraindications & allergy audit' },
          { id: 'triage', label: '3. ESI Triage Classifier', icon: Flame, desc: 'Calculates ESI level from vitals & symptoms' },
          { id: 'discharge', label: '4. Discharge Summary', icon: FileCheck2, desc: 'Generates comprehensive home care guide' },
        ].map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as any)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-indigo-900/60 to-slate-900 border-cyan-500/60 shadow-lg text-white ring-1 ring-cyan-500/30'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tool.label}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{tool.desc}</p>
            </button>
          );
        })}
      </div>

      {/* TOOL 1: SOAP CLINICAL SCRIBE */}
      {activeTool === 'soap' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Clinical Observation Input
            </h3>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Select Hospital Patient Context</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.mrn}) • {p.age}y {p.gender} • {p.primaryDiagnosis}
                  </option>
                ))}
              </select>
            </div>

            {selectedPatient && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 space-y-1">
                <div>
                  <strong>Primary Diagnosis:</strong> {selectedPatient.primaryDiagnosis}
                </div>
                <div>
                  <strong>Allergies:</strong>{' '}
                  <span className="text-rose-400">{selectedPatient.allergies.join(', ') || 'None noted'}</span>
                </div>
                <div className="text-[11px] font-mono text-cyan-300">
                  Vitals: BP {selectedPatient.vitals.bp}, HR {selectedPatient.vitals.hr} bpm, SpO2 {selectedPatient.vitals.spo2}%
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-300 block mb-1">
                Physician Dictation / Unstructured Observation
              </label>
              <textarea
                value={doctorDictation}
                onChange={(e) => setDoctorDictation(e.target.value)}
                rows={5}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white resize-y leading-relaxed"
                placeholder="Type or paste rough physician impressions, patient reports, examination findings..."
              />
            </div>

            <button
              onClick={handleGenerateSoap}
              disabled={soapLoading || !doctorDictation.trim()}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {soapLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Synthesizing SOAP Note...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Formal SOAP Note
                </>
              )}
            </button>
          </div>

          {/* Output Panel */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Formatted Medical Record Output
                </h3>
                {soapResult && !soapSaved && (
                  <button
                    onClick={handleSaveSoapToPatient}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Save into Patient EMR
                  </button>
                )}
                {soapSaved && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved to Chart!
                  </span>
                )}
              </div>

              {soapResult ? (
                <div className="space-y-3 mt-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <strong className="text-cyan-400 block mb-1 font-bold">[S] Subjective:</strong>
                    <p className="text-slate-200 leading-relaxed">{soapResult.subjective}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <strong className="text-emerald-400 block mb-1 font-bold">[O] Objective:</strong>
                    <p className="text-slate-200 leading-relaxed">{soapResult.objective}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <strong className="text-amber-400 block mb-1 font-bold">[A] Assessment:</strong>
                    <p className="text-slate-200 leading-relaxed">{soapResult.assessment}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <strong className="text-purple-400 block mb-1 font-bold">[P] Plan:</strong>
                    <p className="text-slate-200 leading-relaxed">{soapResult.plan}</p>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-500 text-xs">
                  Enter dictation notes on the left and click &quot;Generate Formal SOAP Note&quot;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOOL 2: DRUG INTERACTIONS */}
      {activeTool === 'drug' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-400" />
              Pharmacology Safety & Interaction Engine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cross-references multiple drug combinations against cytochrome P450 pathways, QT prolongation, bleeding risks, and allergic profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Medications to Cross-Reference</label>
              <input
                type="text"
                value={drugInput}
                onChange={(e) => setDrugInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                placeholder="e.g. Warfarin, Ciprofloxacin, Amiodarone"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Patient Known Drug Allergies</label>
              <input
                type="text"
                value={allergiesInput}
                onChange={(e) => setAllergiesInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-rose-300"
                placeholder="e.g. Sulfa, Penicillin, NSAIDs"
              />
            </div>
          </div>

          <button
            onClick={handleCheckDrugInteractions}
            disabled={drugLoading || !drugInput.trim()}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {drugLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Screening Pharmacodynamics...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run Drug Interaction Audit
              </>
            )}
          </button>

          {/* Results */}
          {drugResult && (
            <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-4 mt-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Clinical Safety Summary</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    drugResult.overallRisk === 'High'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : drugResult.overallRisk === 'Moderate'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {drugResult.overallRisk} Interaction Risk
                </span>
              </div>

              {drugResult.summary && (
                <p className="text-slate-300 leading-relaxed">{drugResult.summary}</p>
              )}

              {/* Individual Interactions */}
              {drugResult.interactions && drugResult.interactions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="font-semibold text-slate-200">Specific Interactions Flagged:</h4>
                  {drugResult.interactions.map((item: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">
                          {item.drugs?.join(' + ')}
                        </span>
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          {item.severity} SEVERITY
                        </span>
                      </div>
                      <div className="text-slate-300">
                        <strong className="text-rose-400">Clinical Consequence:</strong> {item.effect}
                      </div>
                      <div className="text-slate-400">
                        <strong className="text-cyan-300">Pharmacist Recommendation:</strong>{' '}
                        {item.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TOOL 3: EMERGENCY TRIAGE ADVISOR */}
      {activeTool === 'triage' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              Emergency Severity Index (ESI) Triage Advisor
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Assesses physiologic instability, high-risk conditions, and anticipated diagnostic resource utilization to grade patients from Level 1 (Resuscitation) to Level 5.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-300 block mb-1">Presenting Chief Complaint</label>
              <textarea
                value={triageComplaint}
                onChange={(e) => setTriageComplaint(e.target.value)}
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Age</label>
              <input
                type="number"
                value={triageAge}
                onChange={(e) => setTriageAge(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Gender</label>
              <select
                value={triageGender}
                onChange={(e) => setTriageGender(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">BP (mmHg)</label>
              <input
                type="text"
                value={triageBp}
                onChange={(e) => setTriageBp(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Pulse (bpm)</label>
              <input
                type="number"
                value={triageHr}
                onChange={(e) => setTriageHr(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Oxygen SpO2 (%)</label>
              <input
                type="number"
                value={triageSpo2}
                onChange={(e) => setTriageSpo2(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Temp (°F)</label>
              <input
                type="number"
                step="0.1"
                value={triageTemp}
                onChange={(e) => setTriageTemp(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Resp. Rate</label>
              <input
                type="number"
                value={triageRr}
                onChange={(e) => setTriageRr(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleRunTriageAssist}
            disabled={triageLoading || !triageComplaint.trim()}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {triageLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Physiologic Severity...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Compute ESI Triage Score
              </>
            )}
          </button>

          {/* Results */}
          {triageResult && (
            <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-4 mt-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-slate-400 text-xs uppercase tracking-wider block">Recommended Triage</span>
                  <div className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                    ESI Level {triageResult.esiLevel}: {triageResult.esiCategory}
                  </div>
                </div>
                <span className="font-mono text-xs px-3 py-1 rounded-lg bg-slate-900 text-cyan-300 font-bold border border-slate-700">
                  {triageResult.resourcesExpected} Resource(s)
                </span>
              </div>

              {triageResult.redFlags && triageResult.redFlags.length > 0 && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 space-y-1">
                  <strong className="font-bold flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-400 inline" /> Red Flag Clinical Warnings:
                  </strong>
                  <ul className="list-disc list-inside space-y-0.5">
                    {triageResult.redFlags.map((flag: string, idx: number) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {triageResult.differentialDiagnoses && (
                <div>
                  <strong className="text-cyan-300 block mb-1">Suspected Differentials:</strong>
                  <div className="flex flex-wrap gap-1.5">
                    {triageResult.differentialDiagnoses.map((d: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 text-[11px]">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {triageResult.recommendedWorkup && (
                <div>
                  <strong className="text-emerald-300 block mb-1">Recommended Stat Emergency Workup:</strong>
                  <div className="flex flex-wrap gap-1.5">
                    {triageResult.recommendedWorkup.map((w: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 text-[11px]">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TOOL 4: DISCHARGE SUMMARY GENERATOR */}
      {activeTool === 'discharge' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-sky-400" />
              Patient Discharge Protocol & Instructions Synthesizer
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Produces a complete, professional discharge package including hospital course, medication changes, and plain-language return-to-ER guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Select Patient to Discharge</label>
              <select
                value={dischargePatientId}
                onChange={(e) => setDischargePatientId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.mrn}) • {p.primaryDiagnosis}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Physician Hospital Course Summary</label>
              <textarea
                value={courseNotes}
                onChange={(e) => setCourseNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                placeholder="Briefly state hospital interventions and clinical progress..."
              />
            </div>
          </div>

          <button
            onClick={handleGenerateDischarge}
            disabled={dischargeLoading}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {dischargeLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Compiling Comprehensive Discharge...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Patient Discharge Package
              </>
            )}
          </button>

          {/* Results */}
          {dischargeResult && (
            <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-4 mt-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <h4 className="text-sm font-bold text-white">Discharge Summary & Home Care Instructions</h4>
                <button
                  onClick={() => alert('Discharge package formatted for printing.')}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Print Patient Copy
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <strong className="text-cyan-300 block mb-1">Hospital Course & Recovery:</strong>
                  <p className="text-slate-300 leading-relaxed">{dischargeResult.hospitalCourse}</p>
                </div>

                {dischargeResult.medicationInstructions && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <strong className="text-emerald-300 block mb-1">Home Medication Schedule:</strong>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {dischargeResult.medicationInstructions.map((m: string, i: number) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {dischargeResult.warningSignsToReturn && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-rose-900/40 text-rose-300">
                    <strong className="text-rose-400 block mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 inline" /> Red-Flag Symptoms (Seek Immediate Emergency Care):
                    </strong>
                    <ul className="list-disc list-inside space-y-1">
                      {dischargeResult.warningSignsToReturn.map((w: string, i: number) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {dischargeResult.followUp && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <strong className="text-purple-300 block mb-1">Follow-Up Consultations:</strong>
                    <p className="text-slate-300">{dischargeResult.followUp}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
