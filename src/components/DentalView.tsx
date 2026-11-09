import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { DentalRecord, DentalTooth, ToothCondition } from '../types';
import { translations } from '../utils/translations';
import {
  Smile,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Receipt,
  FileText,
  X,
  Stethoscope,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const DentalView: React.FC = () => {
  const { dentalRecords, recordDentalExamination, billDentalProcedure, patients, language, addToast } = useHospital();
  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<DentalRecord>(
    dentalRecords[0] || null
  );
  const [selectedTooth, setSelectedTooth] = useState<DentalTooth | null>(null);
  const [showNewExamModal, setShowNewExamModal] = useState(false);

  // New Exam Form State
  const [patientId, setPatientId] = useState('');
  const [dentistName, setDentistName] = useState('Dr. Patrick Mugisha (DDS)');
  const [treatmentPlanTitle, setTreatmentPlanTitle] = useState('Root Canal Therapy & Crown');
  const [treatmentCost, setTreatmentCost] = useState(120000);

  const conditionColors: Record<ToothCondition, string> = {
    healthy: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30',
    caries: 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30',
    missing: 'bg-slate-800 border-slate-700 text-slate-500 line-through',
    root_canal: 'bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30',
    crown: 'bg-blue-500/20 border-blue-500/40 text-blue-300 hover:bg-blue-500/30',
    extracted: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
    impacted: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
  };

  const handleToothClick = (tooth: DentalTooth) => {
    setSelectedTooth(tooth);
  };

  const handleUpdateToothCondition = (newCondition: ToothCondition) => {
    if (!selectedRecord || !selectedTooth) return;
    const teethList = (selectedRecord.teeth || []) as DentalTooth[];
    const updatedTeeth = teethList.map((t: any) =>
      t.toothNumber === selectedTooth.toothNumber ? { ...t, condition: newCondition } : t
    );
    setSelectedRecord({ ...selectedRecord, teeth: updatedTeeth });
    setSelectedTooth({ ...selectedTooth, condition: newCondition });
    addToast({
      type: 'info',
      title: 'Tooth Updated',
      message: `Tooth #${selectedTooth.toothNumber} updated to ${String(newCondition).replace('_', ' ')}`,
    });
  };

  const handleBillPlan = (_planId: string) => {
    if (!selectedRecord) return;
    billDentalProcedure(selectedRecord.id);
  };

  const handleNewExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === patientId);
    if (!pat) return;

    // Generate 32 teeth default
    const teethList: DentalTooth[] = Array.from({ length: 32 }, (_, i) => ({
      toothNumber: i + 1,
      condition: i === 2 ? 'caries' : i === 18 ? 'crown' : 'healthy',
      notes: i === 2 ? 'Occlusal enamel caries detected' : undefined,
    }));

    recordDentalExamination({
      patientId: pat.id,
      patientName: pat.name,
      patientMrn: pat.mrn,
      date: new Date().toISOString().split('T')[0],
      examinationDate: new Date().toISOString().split('T')[0],
      dentistName,
      teeth: teethList,
      treatmentPlans: [
        {
          id: `plan-${Date.now()}`,
          procedureName: treatmentPlanTitle,
          toothNumbers: [3],
          estimatedCost: treatmentCost,
          status: 'proposed',
          priority: 'medium',
        },
      ],
      periodontalScore: 'Mild Gingivitis / Calculus Grade 1',
    });

    setShowNewExamModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Smile className="w-6 h-6 text-cyan-400" />
            {t.dental.dentalClinic}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 font-mono font-medium border border-cyan-800">
              {dentalRecords.length} Charts
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Adult 32-tooth interactive charting (FDI / Universal), periodontal evaluation, restorative treatment planning & copay billing.
          </p>
        </div>

        <button
          onClick={() => setShowNewExamModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-900/30 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t.dental.newExamination}
        </button>
      </div>

      {/* Patient Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs">
        <span className="text-slate-400 shrink-0 font-medium">{t.dental.patientDentalChart}:</span>
        {dentalRecords.map((rec) => (
          <button
            key={rec.id}
            onClick={() => {
              setSelectedRecord(rec);
              setSelectedTooth(null);
            }}
            className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all flex items-center gap-2 ${
              selectedRecord?.id === rec.id
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            {rec.patientName} ({rec.patientMrn})
          </button>
        ))}
      </div>

      {selectedRecord ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 32-Tooth Interactive Chart */}
          <div className="lg:col-span-2 space-y-5">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {t.dental.teethChart} (Universal 1 - 32)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any tooth to examine pathology or update restorative status.
                  </p>
                </div>
                <div className="text-xs font-mono text-cyan-300">
                  Dentist: {selectedRecord.dentistName}
                </div>
              </div>

              {/* Upper Arch (Maxilla) 1 to 16 */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <span>Right Maxilla (1-8)</span>
                  <span className="text-slate-400 font-normal">Upper Arch</span>
                  <span>Left Maxilla (9-16)</span>
                </div>
                <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 sm:gap-1.5 p-3 rounded-xl bg-slate-850/80 border border-slate-700/60">
                  {((selectedRecord.teeth || []) as DentalTooth[]).slice(0, 16).map((t) => (
                    <button
                      key={t.toothNumber}
                      type="button"
                      onClick={() => handleToothClick(t)}
                      className={`p-1 sm:p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-between min-h-[58px] ${
                        conditionColors[t.condition]
                      } ${selectedTooth?.toothNumber === t.toothNumber ? 'ring-2 ring-white scale-105 shadow-lg' : ''}`}
                    >
                      <span className="text-[10px] font-mono font-bold">{t.toothNumber}</span>
                      <div className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[8px]">
                        {t.condition[0].toUpperCase()}
                      </div>
                      <span className="text-[9px] capitalize truncate max-w-full font-medium">
                        {t.condition === 'root_canal' ? 'RCT' : t.condition}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Midline Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-px bg-slate-850 flex-1" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Occlusal Plane</span>
                <div className="h-px bg-slate-850 flex-1" />
              </div>

              {/* Lower Arch (Mandible) 32 down to 17 */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <span>Right Mandible (32-25)</span>
                  <span className="text-slate-400 font-normal">Lower Arch</span>
                  <span>Left Mandible (24-17)</span>
                </div>
                <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 sm:gap-1.5 p-3 rounded-xl bg-slate-850/80 border border-slate-700/60">
                  {((selectedRecord.teeth || []) as DentalTooth[]).slice(16, 32).map((t) => (
                    <button
                      key={t.toothNumber}
                      type="button"
                      onClick={() => handleToothClick(t)}
                      className={`p-1 sm:p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-between min-h-[58px] ${
                        conditionColors[t.condition]
                      } ${selectedTooth?.toothNumber === t.toothNumber ? 'ring-2 ring-white scale-105 shadow-lg' : ''}`}
                    >
                      <span className="text-[10px] font-mono font-bold">{t.toothNumber}</span>
                      <div className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[8px]">
                        {t.condition[0].toUpperCase()}
                      </div>
                      <span className="text-[9px] capitalize truncate max-w-full font-medium">
                        {t.condition === 'root_canal' ? 'RCT' : t.condition}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend Strip */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Healthy
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Caries / Cavity
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Root Canal (RCT)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Crown / Cap
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Extracted
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> Impacted
                </span>
              </div>
            </div>

            {/* Treatment Plans Table */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-cyan-400" />
                  {t.dental.treatmentPlan}
                </h3>
                <span className="text-xs text-slate-400">
                  Periodontal: <strong className="text-slate-200">{selectedRecord.periodontalScore}</strong>
                </span>
              </div>

              <div className="space-y-2">
                {(selectedRecord.treatmentPlans || []).map((plan: any) => (
                  <div
                    key={plan.id}
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        {plan.procedureName}
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-cyan-300 font-mono">
                          Teeth: {plan.toothNumbers.join(', ')}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Priority: <strong className="capitalize text-slate-300">{plan.priority}</strong> • Status:{' '}
                        <span className="text-emerald-400 font-medium capitalize">{plan.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        {plan.estimatedCost.toLocaleString()} RWF
                      </span>
                      <button
                        onClick={() => handleBillPlan(plan.id)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Receipt className="w-3 h-3" />
                        {t.dental.billProcedure}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tooth Inspector / Inspector Drawer */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smile className="w-4 h-4 text-cyan-400" />
                Tooth Clinical Inspector
              </h3>

              {selectedTooth ? (
                <div className="space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Tooth Number:</span>
                      <span className="text-base font-bold font-mono text-white">#{selectedTooth.toothNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Current Status:</span>
                      <span className="font-bold capitalize text-cyan-300">
                        {selectedTooth.condition.replace('_', ' ')}
                      </span>
                    </div>
                    {selectedTooth.notes && (
                      <div className="pt-1 text-slate-400 border-t border-slate-700">
                        Notes: <span className="text-slate-200">{selectedTooth.notes}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-2">Update Pathology / Intervention:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'healthy', label: 'Healthy' },
                        { id: 'caries', label: 'Caries (Cavity)' },
                        { id: 'root_canal', label: 'Root Canal' },
                        { id: 'crown', label: 'Crown / Cap' },
                        { id: 'extracted', label: 'Extracted' },
                        { id: 'impacted', label: 'Impacted' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleUpdateToothCondition(item.id as ToothCondition)}
                          className={`p-2 rounded-xl border text-left font-medium transition-all ${
                            selectedTooth.condition === item.id
                              ? 'bg-cyan-600 border-cyan-400 text-white'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                  <Smile className="w-8 h-8 mx-auto text-slate-600" />
                  <p>Click on any tooth in the arch to inspect details or assign restorative procedures.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-xs">No dental examination records available.</div>
      )}

      {/* New Dental Exam Modal */}
      {showNewExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smile className="w-5 h-5 text-cyan-400" />
                New Dental Consultation & Charting
              </h3>
              <button onClick={() => setShowNewExamModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNewExamSubmit} className="space-y-4">
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
                      {p.name} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Attending Dental Surgeon</label>
                <input
                  type="text"
                  value={dentistName}
                  onChange={(e) => setDentistName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Proposed Treatment Plan</label>
                <input
                  type="text"
                  value={treatmentPlanTitle}
                  onChange={(e) => setTreatmentPlanTitle(e.target.value)}
                  placeholder="e.g. Scaling, Root Planing & Composite Filling"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Estimated Plan Cost (RWF)</label>
                <input
                  type="number"
                  step="5000"
                  value={treatmentCost}
                  onChange={(e) => setTreatmentCost(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewExamModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!patientId}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50"
                >
                  Create Dental Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
