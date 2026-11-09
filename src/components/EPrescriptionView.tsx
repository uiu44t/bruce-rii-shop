import React, { useState } from 'react';
import {
  Pill,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Plus,
  QrCode,
  Printer,
  User,
  Clock,
  Send,
  Trash2,
  Check,
  Building,
} from 'lucide-react';
import { MOCK_E_PRESCRIPTIONS } from '../data/mockRwandaNationalData';
import { EPrescription, EPrescriptionItem } from '../types';
import { useHospital } from '../context/HospitalContext';

// Common drug interactions rule engine
const DRUG_INTERACTION_RULES: { drugA: string; drugB: string; severity: 'HIGH' | 'MODERATE'; warning: string }[] = [
  {
    drugA: 'warfarin',
    drugB: 'ibuprofen',
    severity: 'HIGH',
    warning: 'Severe risk of major gastrointestinal hemorrhage and bleeding events.',
  },
  {
    drugA: 'ciprofloxacin',
    drugB: 'theophylline',
    severity: 'HIGH',
    warning: 'Inhibition of hepatic metabolism causes elevated theophylline toxicity.',
  },
  {
    drugA: 'metformin',
    drugB: 'contrast',
    severity: 'HIGH',
    warning: 'Lactic acidosis risk with iodinated radiocontrast media.',
  },
  {
    drugA: 'amlodipine',
    drugB: 'simvastatin',
    severity: 'MODERATE',
    warning: 'Increased serum levels of simvastatin; cap dose at 20mg daily.',
  },
  {
    drugA: 'ceftriaxone',
    drugB: 'calcium',
    severity: 'HIGH',
    warning: 'Precipitation risk in intravenous infusion lines.',
  },
];

export const EPrescriptionView: React.FC = () => {
  const { patients, currentUser, showToast } = useHospital();
  const [prescriptions, setPrescriptions] = useState<EPrescription[]>(MOCK_E_PRESCRIPTIONS);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Write Prescription Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || 'p-001');
  const [medItems, setMedItems] = useState<EPrescriptionItem[]>([
    {
      id: 'item-1',
      medicine: 'Amoxicillin/Clavulanate 625mg Tablets',
      dose: '625mg',
      frequency: 'TID (Every 8h)',
      duration: '7 days',
      quantity: 21,
      route: 'Oral',
      instructions: 'Take with food to reduce GI upset',
      is_dispensed: false,
    },
  ]);
  const [patientNotes, setPatientNotes] = useState<string>('Complete the full course as prescribed.');
  const [refillsAllowed, setRefillsAllowed] = useState<number>(0);

  // Selected prescription for receipt inspection
  const [activeReceipt, setActiveReceipt] = useState<EPrescription | null>(null);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Dynamic Safety Checks on Current Form
  const safetyWarnings = React.useMemo(() => {
    const allergyWarnings: string[] = [];
    const interactionWarnings: string[] = [];
    const duplicateWarnings: string[] = [];

    if (!selectedPatient) return { allergyWarnings, interactionWarnings, duplicateWarnings };

    // 1. Allergy check
    const patientAllergies = selectedPatient.allergies.map((a) => a.toLowerCase());
    medItems.forEach((item) => {
      const medLower = item.medicine.toLowerCase();
      if (
        (patientAllergies.some((a) => a.includes('penicillin') || a.includes('beta-lactam')) &&
          (medLower.includes('amoxicillin') || medLower.includes('ampicillin') || medLower.includes('penicillin'))) ||
        (patientAllergies.some((a) => a.includes('sulfa')) &&
          (medLower.includes('bactrim') || medLower.includes('sulfamethoxazole') || medLower.includes('cotrimoxazole'))) ||
        (patientAllergies.some((a) => a.includes('nsaid') || a.includes('aspirin')) &&
          (medLower.includes('ibuprofen') || medLower.includes('diclofenac') || medLower.includes('aspirin')))
      ) {
        allergyWarnings.push(
          `ALLERGY CONTRAINDICATION: Patient is allergic to [${selectedPatient.allergies.join(', ')}] which cross-reacts with "${item.medicine}"!`
        );
      }
    });

    // 2. Drug-Drug interaction check
    for (let i = 0; i < medItems.length; i++) {
      for (let j = i + 1; j < medItems.length; j++) {
        const med1 = medItems[i].medicine.toLowerCase();
        const med2 = medItems[j].medicine.toLowerCase();

        DRUG_INTERACTION_RULES.forEach((rule) => {
          if (
            (med1.includes(rule.drugA) && med2.includes(rule.drugB)) ||
            (med1.includes(rule.drugB) && med2.includes(rule.drugA))
          ) {
            interactionWarnings.push(
              `DRUG INTERACTION [${rule.severity}]: ${medItems[i].medicine} + ${medItems[j].medicine} — ${rule.warning}`
            );
          }
        });
      }
    }

    // 3. Duplicate checks
    const counts: Record<string, number> = {};
    medItems.forEach((m) => {
      const generic = m.medicine.split(' ')[0].toLowerCase();
      counts[generic] = (counts[generic] || 0) + 1;
      if (counts[generic] > 1) {
        duplicateWarnings.push(`DUPLICATE WARNING: Multiple items prescribed containing "${generic}"`);
      }
    });

    return { allergyWarnings, interactionWarnings, duplicateWarnings };
  }, [selectedPatient, medItems]);

  const handleAddMedItem = () => {
    setMedItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        medicine: 'Paracetamol 500mg Tablets',
        dose: '1g (2 tablets)',
        frequency: 'TID',
        duration: '5 days',
        quantity: 30,
        route: 'Oral',
        instructions: 'Take after meals for fever or pain',
        is_dispensed: false,
      },
    ]);
  };

  const handleRemoveMedItem = (index: number) => {
    setMedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateMedItem = (index: number, field: keyof EPrescriptionItem, val: any) => {
    setMedItems((prev) => {
      const clone = [...prev];
      clone[index] = { ...clone[index], [field]: val };
      return clone;
    });
  };

  const handleSubmitPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const newPrescription: EPrescription = {
      id: `epres-${Date.now()}`,
      prescription_number: `RX-2026-RW-${Math.floor(10000 + Math.random() * 90000)}`,
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.name,
      patient_mrn: selectedPatient.mrn,
      patient_nin: selectedPatient.nin || '1 1990 8 0012345 1 20',
      patient_allergies: selectedPatient.allergies,
      doctor_id: currentUser.id || 'doc-001',
      doctor_name: currentUser.name || 'Dr. Jean de Dieu Habumugisha, MD',
      facility_id: 'fac-chuk',
      facility_name: 'Centre Hospitalier Universitaire de Kigali (CHUK)',
      created_at: new Date().toISOString(),
      status: 'PRESCRIBED',
      medications: medItems,
      allergy_warnings: safetyWarnings.allergyWarnings,
      interaction_warnings: safetyWarnings.interactionWarnings,
      duplicate_warnings: safetyWarnings.duplicateWarnings,
      refills_allowed: refillsAllowed,
      refills_used: 0,
      patient_notes: patientNotes,
    };

    setPrescriptions((prev) => [newPrescription, ...prev]);
    setShowCreateModal(false);
    showToast({
      title: 'E-Prescription Issued',
      message: `${newPrescription.prescription_number} transmitted to pharmacy queue.`,
      type: 'success',
    });
  };

  const handleDispensePrescription = (presId: string) => {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === presId
          ? {
              ...p,
              status: 'DISPENSED',
              dispensed_at: new Date().toISOString(),
              dispensed_by: `${currentUser.name} (License RPh-2026-KGL)`,
              receipt_number: `RCP-PHARM-${Math.floor(1000 + Math.random() * 9000)}`,
              medications: p.medications.map((m) => ({ ...m, is_dispensed: true })),
            }
          : p
      )
    );

    showToast({
      title: 'Pharmacy Dispense Completed',
      message: 'Automatic stock deducted and digital receipt generated.',
      type: 'success',
    });
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRx = p.prescription_number.toLowerCase().includes(q);
      const matchPat = p.patient_name.toLowerCase().includes(q);
      const matchDoc = p.doctor_name.toLowerCase().includes(q);
      const matchMed = p.medications.some((m) => m.medicine.toLowerCase().includes(q));
      if (!matchRx && !matchPat && !matchDoc && !matchMed) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Pill className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  E-Prescription & Clinical Safety Suite
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Interaction Engine
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Doctor prescription ordering, automated cross-allergy checks, drug-drug interaction screening, and pharmacy dispense audit.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="new-prescription-button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-900/40"
            >
              <Plus className="w-3.5 h-3.5" />
              Write E-Prescription
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="search-prescriptions-input"
                type="text"
                placeholder="Search RX number, patient, or medicine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 w-64"
              />
            </div>

            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                filterStatus === 'ALL'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              All RX ({prescriptions.length})
            </button>

            <button
              onClick={() => setFilterStatus('PRESCRIBED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                filterStatus === 'PRESCRIBED'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              ⏳ Pharmacy Queue ({prescriptions.filter((p) => p.status === 'PRESCRIBED').length})
            </button>

            <button
              onClick={() => setFilterStatus('DISPENSED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                filterStatus === 'DISPENSED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              ✅ Dispensed ({prescriptions.filter((p) => p.status === 'DISPENSED').length})
            </button>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {filteredPrescriptions.map((rx) => {
          const isDispensed = rx.status === 'DISPENSED';
          const hasSafetyWarning =
            rx.allergy_warnings.length > 0 || rx.interaction_warnings.length > 0 || rx.duplicate_warnings.length > 0;

          return (
            <div
              key={rx.id}
              id={`prescription-card-${rx.id}`}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-100">{rx.prescription_number}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isDispensed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {rx.status}
                      </span>
                      {hasSafetyWarning && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                          <AlertTriangle className="w-3 h-3" /> Safety Alert
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Prescribed by <strong className="text-slate-300">{rx.doctor_name}</strong> at {rx.facility_name}
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="text-slate-200 font-semibold">{rx.patient_name}</div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    MRN: {rx.patient_mrn} | NIN: {rx.patient_nin}
                  </div>
                </div>
              </div>

              {/* Safety Alerts if flagged */}
              {hasSafetyWarning && (
                <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl p-3 space-y-1.5 text-xs">
                  <div className="text-[11px] font-bold text-rose-300 uppercase flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" /> Clinical Safety Warning Logged
                  </div>
                  {rx.allergy_warnings.map((w, idx) => (
                    <div key={idx} className="text-rose-200 font-medium pl-5 text-[11px]">
                      • {w}
                    </div>
                  ))}
                  {rx.interaction_warnings.map((w, idx) => (
                    <div key={idx} className="text-amber-200 font-medium pl-5 text-[11px]">
                      • {w}
                    </div>
                  ))}
                  {rx.duplicate_warnings.map((w, idx) => (
                    <div key={idx} className="text-cyan-200 font-medium pl-5 text-[11px]">
                      • {w}
                    </div>
                  ))}
                </div>
              )}

              {/* Medications Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                      <th className="py-2 px-3">Medicine & Strength</th>
                      <th className="py-2 px-3">Dose & Frequency</th>
                      <th className="py-2 px-3">Route</th>
                      <th className="py-2 px-3">Duration</th>
                      <th className="py-2 px-3">Qty</th>
                      <th className="py-2 px-3">Instructions</th>
                      <th className="py-2 px-3 text-right">Dispense Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {rx.medications.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-semibold text-slate-100">{m.medicine}</td>
                        <td className="py-2.5 px-3">
                          {m.dose} — {m.frequency}
                        </td>
                        <td className="py-2.5 px-3">{m.route}</td>
                        <td className="py-2.5 px-3">{m.duration}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">{m.quantity}</td>
                        <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">{m.instructions}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.is_dispensed || isDispensed
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {m.is_dispensed || isDispensed ? 'DISPENSED' : 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card Footer Actions & Pharmacy Audit */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
                <div className="text-slate-400 flex items-center gap-3">
                  <span>
                    Refills:{' '}
                    <strong className="text-slate-200">
                      {rx.refills_used} / {rx.refills_allowed}
                    </strong>
                  </span>
                  {isDispensed && rx.receipt_number && (
                    <span className="font-mono text-emerald-400">Receipt: {rx.receipt_number}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveReceipt(rx)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium border border-slate-700 transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                    Digital Receipt & QR
                  </button>

                  {!isDispensed && (
                    <button
                      id={`dispense-rx-${rx.id}`}
                      onClick={() => handleDispensePrescription(rx.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-900/30"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Dispense & Deduct Stock
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Prescription Form Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Pill className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">Write Electronic Prescription (E-Prescription)</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmitPrescription} className="space-y-4 text-xs">
              {/* Patient Selection & Allergies preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Select Patient</label>
                  <select
                    id="select-prescription-patient"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 text-xs"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.mrn}) — {p.age}y {p.gender}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Known Patient Allergies</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPatient.allergies.length > 0 ? (
                      selectedPatient.allergies.map((alg, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        >
                          {alg}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs">No known allergies (NKDA)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Real-Time Safety Warning Banner */}
              {(safetyWarnings.allergyWarnings.length > 0 ||
                safetyWarnings.interactionWarnings.length > 0 ||
                safetyWarnings.duplicateWarnings.length > 0) && (
                <div className="bg-rose-950/40 border border-rose-700/80 rounded-xl p-3.5 space-y-2">
                  <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5 uppercase">
                    <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                    Clinical Safety Alert Detected
                  </div>
                  {safetyWarnings.allergyWarnings.map((w, idx) => (
                    <div key={idx} className="text-rose-200 text-xs font-medium pl-5">
                      ⚠️ {w}
                    </div>
                  ))}
                  {safetyWarnings.interactionWarnings.map((w, idx) => (
                    <div key={idx} className="text-amber-200 text-xs font-medium pl-5">
                      ⚠️ {w}
                    </div>
                  ))}
                  {safetyWarnings.duplicateWarnings.map((w, idx) => (
                    <div key={idx} className="text-cyan-200 text-xs font-medium pl-5">
                      ℹ️ {w}
                    </div>
                  ))}
                </div>
              )}

              {/* Medication Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Prescribed Medications</span>
                  <button
                    type="button"
                    onClick={handleAddMedItem}
                    className="flex items-center gap-1 px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Drug
                  </button>
                </div>

                {medItems.map((med, index) => (
                  <div key={med.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300">Item #{index + 1}</span>
                      {medItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedItem(index)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 uppercase font-semibold">Medicine Name & Formulation</label>
                        <input
                          type="text"
                          required
                          value={med.medicine}
                          onChange={(e) => handleUpdateMedItem(index, 'medicine', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-semibold">Dose</label>
                        <input
                          type="text"
                          required
                          value={med.dose}
                          onChange={(e) => handleUpdateMedItem(index, 'dose', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                          placeholder="e.g. 500mg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-semibold">Frequency</label>
                        <select
                          value={med.frequency}
                          onChange={(e) => handleUpdateMedItem(index, 'frequency', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100 text-xs"
                        >
                          <option value="Once Daily (OD)">Once Daily (OD)</option>
                          <option value="Twice Daily (BID)">Twice Daily (BID)</option>
                          <option value="TID (Every 8h)">TID (Every 8h)</option>
                          <option value="QID (Every 6h)">QID (Every 6h)</option>
                          <option value="PRN (As Needed)">PRN (As Needed)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-semibold">Route</label>
                        <select
                          value={med.route}
                          onChange={(e) => handleUpdateMedItem(index, 'route', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100 text-xs"
                        >
                          <option value="Oral">Oral</option>
                          <option value="IV Infusion">IV Infusion</option>
                          <option value="IM Injection">IM Injection</option>
                          <option value="Inhalation">Inhalation</option>
                          <option value="Topical">Topical</option>
                          <option value="Sublingual">Sublingual</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-semibold">Duration</label>
                        <input
                          type="text"
                          required
                          value={med.duration}
                          onChange={(e) => handleUpdateMedItem(index, 'duration', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs"
                          placeholder="e.g. 7 days"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-semibold">Total Quantity</label>
                        <input
                          type="number"
                          required
                          value={med.quantity}
                          onChange={(e) => handleUpdateMedItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">Pharmacist & Patient Instructions</label>
                      <input
                        type="text"
                        value={med.instructions}
                        onChange={(e) => handleUpdateMedItem(index, 'instructions', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs"
                        placeholder="e.g. Take with full glass of water after food"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Extra instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Prescription Notes / Warnings</label>
                  <input
                    type="text"
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Authorized Refills</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={refillsAllowed}
                    onChange={(e) => setRefillsAllowed(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-create-prescription"
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-md shadow-purple-900/40"
                >
                  <Send className="w-3.5 h-3.5" />
                  Sign & Transmit to Pharmacy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Receipt & QR Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <QrCode className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">Official Rwanda Digital Prescription</h3>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="bg-white text-slate-950 rounded-xl p-5 space-y-3 font-sans shadow-inner">
              <div className="text-center border-b border-slate-200 pb-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Republic of Rwanda • Ministry of Health
                </div>
                <div className="text-xs font-black uppercase mt-0.5">{activeReceipt.facility_name}</div>
                <div className="font-mono text-[11px] font-bold text-indigo-700 mt-1">
                  {activeReceipt.prescription_number}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Patient:</span> <strong>{activeReceipt.patient_name}</strong>
                </div>
                <div>
                  <span className="text-slate-500">NIN:</span> <strong className="font-mono">{activeReceipt.patient_nin}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Prescriber:</span> <span>{activeReceipt.doctor_name}</span>
                </div>
                <div>
                  <span className="text-slate-500">Status:</span>{' '}
                  <strong className={activeReceipt.status === 'DISPENSED' ? 'text-emerald-700' : 'text-amber-700'}>
                    {activeReceipt.status}
                  </strong>
                </div>
              </div>

              <div className="border-t border-b border-slate-200 py-2 space-y-1 text-[11px]">
                <div className="text-[10px] font-bold uppercase text-slate-500">Prescribed Items</div>
                {activeReceipt.medications.map((m, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {m.medicine} ({m.dose})
                    </span>
                    <strong className="font-mono">Qty: {m.quantity}</strong>
                  </div>
                ))}
              </div>

              {/* QR Mock code */}
              <div className="py-2 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-100 border border-slate-300 rounded p-1 flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-slate-800" />
                </div>
                <div className="text-[9px] font-mono text-slate-500 mt-1">
                  RHIE-VERIFIED: {activeReceipt.prescription_number}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                <Printer className="w-3.5 h-3.5" /> Print E-Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
