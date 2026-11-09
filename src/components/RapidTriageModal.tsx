import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { X, Flame, Sparkles, Loader2, AlertOctagon, Heart, Stethoscope } from 'lucide-react';

interface RapidTriageModalProps {
  onClose: () => void;
}

export const RapidTriageModal: React.FC<RapidTriageModalProps> = ({ onClose }) => {
  const { addEmergencyCase, beds, admitPatientToBed, registerPatient } = useHospital();

  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [esiLevel, setEsiLevel] = useState<1 | 2 | 3 | 4 | 5>(3);

  // Vitals
  const [bp, setBp] = useState('130/85');
  const [hr, setHr] = useState<number>(88);
  const [temp, setTemp] = useState<number>(98.6);
  const [spo2, setSpo2] = useState<number>(97);
  const [rr, setRr] = useState<number>(18);
  const [triageNotes, setTriageNotes] = useState('');

  // AI Evaluation state
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  const handleRunAiTriage = async () => {
    if (!chiefComplaint.trim()) return;
    setAnalyzingAi(true);
    try {
      const res = await fetch('/api/ai/triage-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chiefComplaint,
          vitals: { bp, hr, temp, spo2, rr },
          age,
          gender,
        }),
      });
      const data = await res.json();
      setAiSuggestions(data);
      if (data.esiLevel && [1, 2, 3, 4, 5].includes(data.esiLevel)) {
        setEsiLevel(data.esiLevel);
      }
      if (data.triageNotes) {
        setTriageNotes(data.triageNotes);
      }
    } catch (err) {
      console.error('Failed to run AI Triage Assist:', err);
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !chiefComplaint.trim()) return;

    addEmergencyCase({
      patientName,
      age: Number(age),
      gender,
      chiefComplaint,
      esiLevel,
      vitals: {
        bp,
        hr: Number(hr),
        temp: Number(temp),
        spo2: Number(spo2),
        rr: Number(rr),
      },
      status: 'in_triage',
      triageNotes: triageNotes || 'Assessed by Emergency Triage coordinator.',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-900/40">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Emergency Rapid Intake & ESI Triage
                <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                  STAT
                </span>
              </h2>
              <p className="text-xs text-slate-400">Emergency Severity Index 5-Tier Assessment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-300 block mb-1">Patient Name *</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Johnathan Doe (or Trauma Doe #4)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                required
              />
            </div>
          </div>

          {/* Chief Complaint */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-300">Presenting Chief Complaint / Symptoms *</label>
              <button
                type="button"
                onClick={handleRunAiTriage}
                disabled={analyzingAi || !chiefComplaint.trim()}
                className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 disabled:opacity-50"
              >
                {analyzingAi ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Calculating ESI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    Evaluate ESI with AI
                  </>
                )}
              </button>
            </div>
            <textarea
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g., Crushing retrosternal chest pain radiating to left jaw, onset 45 min ago with diaphoresis and nausea..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white resize-y"
              rows={2}
              required
            />
          </div>

          {/* AI Clinical Diagnostic Insights if analyzed */}
          {aiSuggestions && (
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-cyan-500/40 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  AI Emergency Severity Evaluation
                </span>
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-900 text-white">
                  ESI Level {aiSuggestions.esiLevel}: {aiSuggestions.esiCategory}
                </span>
              </div>

              {aiSuggestions.redFlags && aiSuggestions.redFlags.length > 0 && (
                <div className="text-rose-300 bg-rose-950/40 p-2 rounded border border-rose-800/40 flex items-start gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Critical Red Flags:</strong> {aiSuggestions.redFlags.join(' • ')}
                  </div>
                </div>
              )}

              {aiSuggestions.differentialDiagnoses && (
                <div className="text-slate-300">
                  <strong className="text-slate-400">Differentials:</strong>{' '}
                  {aiSuggestions.differentialDiagnoses.join(', ')}
                </div>
              )}

              {aiSuggestions.recommendedWorkup && (
                <div className="text-slate-300">
                  <strong className="text-slate-400">Immediate Orders:</strong>{' '}
                  {aiSuggestions.recommendedWorkup.join(' | ')}
                </div>
              )}
            </div>
          )}

          {/* Emergency Severity Index Level Selector */}
          <div>
            <label className="text-xs text-slate-300 block mb-2 font-semibold">
              Emergency Severity Index (ESI) Triage Classification
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { level: 1, label: 'Resuscitation', desc: 'Immediate Life Threat', color: 'bg-rose-600 text-white' },
                { level: 2, label: 'Emergent', desc: 'High Risk / Severe Pain', color: 'bg-orange-600 text-white' },
                { level: 3, label: 'Urgent', desc: 'Multiple Resources', color: 'bg-amber-600 text-white' },
                { level: 4, label: 'Less Urgent', desc: 'Single Resource', color: 'bg-sky-600 text-white' },
                { level: 5, label: 'Non-Urgent', desc: 'Routine / 0 Resources', color: 'bg-emerald-600 text-white' },
              ].map((tier) => (
                <button
                  key={tier.level}
                  type="button"
                  onClick={() => setEsiLevel(tier.level as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    esiLevel === tier.level
                      ? `${tier.color} border-white/40 ring-2 ring-white/20 shadow-md`
                      : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-xs">Level {tier.level}</div>
                  <div className="text-[11px] font-semibold">{tier.label}</div>
                  <div className="text-[9px] opacity-80 truncate">{tier.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Triage Vitals */}
          <div>
            <label className="text-xs text-slate-300 block mb-1.5 font-semibold">Triage Vital Signs</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">BP (mmHg)</label>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Pulse (bpm)</label>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Resp. Rate</label>
                <input
                  type="number"
                  value={rr}
                  onChange={(e) => setRr(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-slate-300 block mb-1">Triage Nurse Clinical Remarks</label>
            <input
              type="text"
              value={triageNotes}
              onChange={(e) => setTriageNotes(e.target.value)}
              placeholder="e.g. Immediate cardiac telemetry initiated, IV cannula 18G placed in right antecubital"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-900/40 flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4" />
              Enqueue Emergency Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
