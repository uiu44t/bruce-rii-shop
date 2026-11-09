import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { PharmacyItem } from '../types';
import {
  Pill,
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Sparkles,
  Loader2,
  ShieldCheck,
  Package,
} from 'lucide-react';

export const PharmacyView: React.FC = () => {
  const {
    pharmacy,
    restockPharmacyItem,
    addPharmacyItem,
    patients,
    dispensePrescription,
    addToast,
    logAuditEvent,
  } = useHospital();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New drug form state
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState<PharmacyItem['category']>('Cardiovascular');
  const [form, setForm] = useState<PharmacyItem['form']>('Tablet');
  const [dosage, setDosage] = useState('500 mg');
  const [stock, setStock] = useState<number>(100);
  const [minThreshold, setMinThreshold] = useState<number>(20);
  const [unitPrice, setUnitPrice] = useState<number>(5.5);

  // AI Drug Interaction quick tool state
  const [checkDrugsInput, setCheckDrugsInput] = useState('Aspirin, Warfarin, Ibuprofen');
  const [checkAllergiesInput, setCheckAllergiesInput] = useState('NSAIDs');
  const [runningInteractionCheck, setRunningInteractionCheck] = useState(false);
  const [interactionResult, setInteractionResult] = useState<any>(null);

  const isExpired = (expiryDateStr?: string) => {
    if (!expiryDateStr) return false;
    return new Date(expiryDateStr) < new Date();
  };

  const isExpiringSoon = (expiryDateStr?: string) => {
    if (!expiryDateStr) return false;
    const exp = new Date(expiryDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = (exp - now) / (1000 * 3600 * 24);
    return diffDays > 0 && diffDays <= 60;
  };

  const belowThresholdItems = pharmacy.filter((item) => item.stock <= item.minThreshold);

  const handleTriggerAutomatedReorder = () => {
    if (belowThresholdItems.length === 0) {
      addToast({
        type: 'info',
        title: 'Stock Levels Optimal',
        message: 'All formulary items are currently above their safety thresholds.',
      });
      return;
    }
    belowThresholdItems.forEach((item) => {
      restockPharmacyItem(item.id, 100);
    });
    logAuditEvent({
      user: 'Head Pharmacist',
      action: 'PHARMACY_SAFETY_AUTOREORDER',
      details: `Automated replenishment PO generated for ${belowThresholdItems.length} medications below safety threshold.`,
    });
    addToast({
      type: 'success',
      title: 'Automated Safety Re-Order Triggered',
      message: `Replenishment PO executed for ${belowThresholdItems.length} items (${belowThresholdItems.map((i) => i.name).join(', ')}).`,
    });
  };

  const handleDispense = (patientId: string, rxId: string, medicineName: string) => {
    const matchedItem = pharmacy.find(
      (p) =>
        p.name.toLowerCase().includes(medicineName.toLowerCase()) ||
        medicineName.toLowerCase().includes(p.name.toLowerCase())
    );

    if (matchedItem && isExpired(matchedItem.expiryDate)) {
      addToast({
        type: 'error',
        title: 'DISPENSING BLOCKED: Batch Expired',
        message: `Safety Protocol Violation: Batch ${matchedItem.batchNumber || 'BATCH-770'} expired on ${matchedItem.expiryDate}. Quarantine medication immediately!`,
      });
      return;
    }

    dispensePrescription(patientId, rxId, matchedItem?.id);
  };

  const filteredPharmacy = pharmacy.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStock = filterLowStock ? item.stock <= item.minThreshold : true;
    return matchesSearch && matchesStock;
  });

  // Collect all pending prescriptions from patients
  const pendingPrescriptions = patients.flatMap((p) =>
    (p.prescriptions || [])
      .filter((rx) => !rx.dispensed && rx.status === 'active')
      .map((rx) => ({
        ...rx,
        patientName: p.name,
        patientMrn: p.mrn,
        patientId: p.id,
      }))
  );

  const handleAddDrugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addPharmacyItem({
      name,
      genericName: genericName || name,
      category,
      form,
      dosage: dosage || '500 mg',
      stock: Number(stock),
      minThreshold: Number(minThreshold),
      unitPrice: Number(unitPrice),
      batchNumber: `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      location: 'Central Pharmacy Shelf A-1',
      expiryDate: '2027-12-31',
    });

    setShowAddModal(false);
    setName('');
    setGenericName('');
  };

  const handleRunDrugCheck = async () => {
    if (!checkDrugsInput.trim()) return;
    setRunningInteractionCheck(true);
    setInteractionResult(null);
    try {
      const drugs = checkDrugsInput.split(',').map((s) => s.trim()).filter(Boolean);
      const allergies = checkAllergiesInput.split(',').map((s) => s.trim()).filter(Boolean);

      const res = await fetch('/api/ai/drug-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugs, patientAllergies: allergies }),
      });
      const data = await res.json();
      setInteractionResult(data);
    } catch (err) {
      console.error('Failed to run drug interaction check:', err);
    } finally {
      setRunningInteractionCheck(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Hospital Pharmacy & Formulary Inventory
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono font-medium border border-slate-700">
              {pharmacy.length} Medications
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time drug stocks, prescription dispensary queue, and AI interaction contraindication checking.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-900/30 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Medication to Formulary
        </button>
      </div>

      {/* AI Drug Safety Quick Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/40 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            AI Drug Interaction & Contraindication Screener
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Gemini 3.8 Flash Clinical Safety</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-[11px] text-slate-300 block mb-1">Medication Regimen (comma separated)</label>
            <input
              type="text"
              value={checkDrugsInput}
              onChange={(e) => setCheckDrugsInput(e.target.value)}
              placeholder="e.g. Warfarin, Aspirin, Nicardipine"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-300 block mb-1">Patient Known Allergies</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={checkAllergiesInput}
                onChange={(e) => setCheckAllergiesInput(e.target.value)}
                placeholder="e.g. Penicillin, NSAIDs"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleRunDrugCheck}
                disabled={runningInteractionCheck}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shrink-0 flex items-center gap-1 disabled:opacity-50"
              >
                {runningInteractionCheck ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Check'}
              </button>
            </div>
          </div>
        </div>

        {/* AI Interaction Check Result */}
        {interactionResult && (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs space-y-2 mt-2">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-white">Safety Status:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  interactionResult.overallRisk === 'High'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : interactionResult.overallRisk === 'Moderate'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {interactionResult.overallRisk} Risk
              </span>
            </div>

            {interactionResult.interactions && interactionResult.interactions.length > 0 ? (
              <div className="space-y-1.5">
                {interactionResult.interactions.map((item: any, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-slate-800 text-slate-300 text-[11px] leading-relaxed">
                    <strong className="text-rose-400">[{item.severity}]</strong>{' '}
                    <span className="text-white font-medium">{item.drugs?.join(' + ')}:</span>{' '}
                    {item.effect} ({item.recommendation})
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-emerald-400 text-[11px]">
                No severe drug interactions detected among the specified regimens.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Pending Prescriptions Dispensary Queue */}
      {pendingPrescriptions.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-400" />
              Pending Prescription Orders for Dispensing ({pendingPrescriptions.length})
            </h3>
            <span className="text-xs text-indigo-300 font-medium">Auto-deducts inventory upon dispensing</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-800/60">
                <tr>
                  <th className="p-2.5">Patient</th>
                  <th className="p-2.5">Medication Order</th>
                  <th className="p-2.5">Schedule</th>
                  <th className="p-2.5">Prescribed By</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {pendingPrescriptions.map((rx) => (
                  <tr key={rx.id} className="hover:bg-slate-800/40">
                    <td className="p-2.5">
                      <span className="font-semibold text-white">{rx.patientName}</span>
                      <div className="text-[10px] font-mono text-cyan-400">{rx.patientMrn}</div>
                    </td>
                    <td className="p-2.5">
                      <span className="font-medium text-emerald-300">{rx.medicineName}</span> •{' '}
                      <span className="font-mono text-slate-300">{rx.dosage}</span> ({rx.route})
                    </td>
                    <td className="p-2.5 text-slate-300">{rx.frequency}</td>
                    <td className="p-2.5 text-slate-400">{rx.prescribedBy}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => dispensePrescription(rx.patientId, rx.id)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                      >
                        Dispense & Log
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pharmacy Formulary Search & Low Stock Toggle */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search formulary by brand, generic name, or class..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white"
          />
        </div>

        <button
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
            filterLowStock
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Low Stock Alerts Only
        </button>
      </div>

      {/* Formulary Stock Table */}
      <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <table className="w-full text-left text-xs text-slate-200">
          <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5">Medication & Generic</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Dosage Form</th>
              <th className="p-3.5">Unit Price</th>
              <th className="p-3.5">Stock Level</th>
              <th className="p-3.5">Expiry Date</th>
              <th className="p-3.5 text-right">Quick Restock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredPharmacy.map((item) => {
              const isLow = item.stock <= item.minThreshold;

              return (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      {item.name}
                      <span className="font-mono text-[10px] px-1.5 rounded bg-slate-800 text-slate-300">
                        {item.dosage || item.strength}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 italic">{item.genericName}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">{item.form || item.dosageForm}</td>
                  <td className="p-3.5 font-mono text-cyan-300 font-semibold">${item.unitPrice.toFixed(2)}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold ${
                          isLow ? 'text-rose-400' : 'text-white'
                        }`}
                      >
                        {item.stock} units
                      </span>
                      {isLow && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          LOW
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">Min: {item.minThreshold}</div>
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono text-[11px]">{item.expiryDate}</td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => restockPharmacyItem(item.id, 25)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono font-semibold text-[11px]"
                      >
                        +25
                      </button>
                      <button
                        onClick={() => restockPharmacyItem(item.id, 100)}
                        className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-semibold text-[11px]"
                      >
                        +100
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-400" />
                Add Medication to Formulary
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDrugSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Brand Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lipitor"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Generic Name</label>
                <input
                  type="text"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  placeholder="e.g. Atorvastatin Calcium"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Analgesic">Analgesic</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Antidiabetic">Antidiabetic</option>
                    <option value="Sedative">Sedative</option>
                    <option value="IV Fluid">IV Fluid</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Dosage</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="20 mg"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Dosage Form</label>
                <select
                  value={form}
                  onChange={(e) => setForm(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Injection/IV">Injection/IV</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Inhaler">Inhaler</option>
                  <option value="Ointment">Ointment</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Save to Formulary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
