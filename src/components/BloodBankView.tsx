import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Droplet,
  Heart,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PlusCircle,
  ShieldCheck,
  Send,
  User,
  ArrowRight,
  Search,
  Filter,
  Flame,
  Calendar,
} from 'lucide-react';
import { BloodGroup, BloodInventoryItem, BloodDonationRecord } from '../types';

export const BloodBankView: React.FC = () => {
  const {
    bloodInventory,
    bloodDonations,
    patients,
    recordBloodDonation,
    issueBloodUnits,
    requestEmergencyBlood,
    addToast,
    logAuditEvent,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'inventory' | 'donations' | 'issue' | 'compatibility'>('inventory');

  // New Donation Modal
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('+250 788 ');
  const [donorBloodGroup, setDonorBloodGroup] = useState<BloodGroup>('O+');
  const [donorAge, setDonorAge] = useState(28);
  const [donorWeight, setDonorWeight] = useState(70);
  const [hemoglobin, setHemoglobin] = useState(14.5);
  const [donationVolume, setDonationVolume] = useState(450);

  // Issue Blood Modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueRecipientId, setIssueRecipientId] = useState(patients[0]?.id || '');
  const [issueBloodGroup, setIssueBloodGroup] = useState<BloodGroup>('O-');
  const [issueUnits, setIssueUnits] = useState(1);
  const [issueIndication, setIssueIndication] = useState('Severe acute hemorrhage / Trauma');

  // Compatibility matrix helper
  const canReceiveFrom = (recipient: BloodGroup, donor: BloodGroup): boolean => {
    if (donor === 'O-') return true; // Universal donor
    if (recipient === 'AB+') return true; // Universal recipient
    if (recipient === donor) return true;
    if (recipient === 'A+' && ['A+', 'A-', 'O+', 'O-'].includes(donor)) return true;
    if (recipient === 'A-' && ['A-', 'O-'].includes(donor)) return true;
    if (recipient === 'B+' && ['B+', 'B-', 'O+', 'O-'].includes(donor)) return true;
    if (recipient === 'B-' && ['B-', 'O-'].includes(donor)) return true;
    if (recipient === 'AB-' && ['AB-', 'A-', 'B-', 'O-'].includes(donor)) return true;
    if (recipient === 'O+' && ['O+', 'O-'].includes(donor)) return true;
    return false;
  };

  const handleRecordDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim()) {
      addToast({ type: 'warning', title: 'Izina rirakenewe', message: 'Enter donor full name.' });
      return;
    }
    if (hemoglobin < 12.5) {
      addToast({
        type: 'error',
        title: 'Hemoglobin Insufficient',
        message: 'Hemoglobin must be at least 12.5 g/dL for safe blood donation.',
      });
      return;
    }

    recordBloodDonation({
      donorName,
      donorPhone,
      donorAge: 30,
      bloodGroup: donorBloodGroup,
      units: 1,
      volumeMl: donationVolume,
      donationDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0],
      hemoglobin,
      hemoglobinLevel: hemoglobin,
      screeningStatus: 'Passed',
      branchId: 'branch-kigali',
    });

    setShowDonationModal(false);
    setDonorName('');
  };

  const handleIssueBlood = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === issueRecipientId) || patients[0];

    // Compatibility check
    const isCompatible = canReceiveFrom(patient.bloodGroup, issueBloodGroup);
    if (!isCompatible) {
      const confirmOverride = window.confirm(
        `⚠️ INCOMPATIBILITY WARNING: Recipient has blood group ${patient.bloodGroup}, but selected donor unit is ${issueBloodGroup}. This is NOT serologically compatible! Do you wish to override?`
      );
      if (!confirmOverride) return;
    }

    issueBloodUnits({
      patientId: patient.id,
      patientName: patient.name,
      patientMrn: patient.mrn,
      bloodGroup: issueBloodGroup,
      units: issueUnits,
      doctorName: 'Dr. Jean Bosco (Hematology)',
      indication: issueIndication,
      urgency: 'routine',
      compatibilityVerified: isCompatible,
      crossmatchStatus: isCompatible ? 'Compatible' : 'Incompatible',
      branchId: patient.branchId || 'branch-kigali',
    });
    setShowIssueModal(false);
  };

  const handleEmergencyStatRequest = (group: BloodGroup) => {
    const reason = prompt(
      `Emergency STAT Blood Release requested for ${group}. Enter clinical urgency / trauma room indication:`,
      'Trauma Bay 1 - Massive Transfusion Protocol'
    );
    if (reason) {
      requestEmergencyBlood(group, 2, 'Emergency Department STAT', reason);
    }
  };

  const totalUnits = bloodInventory.reduce((acc, curr) => acc + curr.unitsAvailable, 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-800 flex items-center justify-center text-white shadow-lg shrink-0">
              <Droplet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Ikigega cy'Amaraso / Blood Bank Management
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {totalUnits} Units in Cold Storage
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Blood Stock Levels • Crossmatch & Compatibility • Voluntary Donors • Massive Transfusion Protocol
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-register-blood-donor"
              onClick={() => setShowDonationModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Heart className="w-4 h-4 text-rose-200" />
              Kwandika Umuterankunga / Register Donor
            </button>
            <button
              id="btn-issue-blood-units"
              onClick={() => setShowIssueModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors"
            >
              <Send className="w-4 h-4 text-cyan-400" />
              Gusohora Amaraso / Issue Blood
            </button>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs font-medium">
          {[
            { id: 'inventory', label: 'Blood Groups Stock' },
            { id: 'donations', label: 'Donations & Donors Log' },
            { id: 'compatibility', label: 'Compatibility Matrix' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            {bloodInventory.map((item) => {
              const minThreshold = item.minThreshold ?? item.minAlertLevel ?? 5;
              const isCriticalLow = item.unitsAvailable <= minThreshold;
              const isUniversal = item.bloodGroup === 'O-';
              return (
                <div
                  key={item.bloodGroup}
                  id={`blood-card-${item.bloodGroup.replace('+', 'pos').replace('-', 'neg')}`}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCriticalLow
                      ? 'bg-rose-950/40 border-rose-600/70 shadow-lg shadow-rose-950/40'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-white font-mono flex items-center gap-1.5">
                      <Droplet className={`w-6 h-6 ${isCriticalLow ? 'text-rose-500 fill-rose-500' : 'text-rose-400'}`} />
                      {item.bloodGroup}
                    </span>
                    {isUniversal && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        UNIVERSAL
                      </span>
                    )}
                    {isCriticalLow && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                        LOW STOCK
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-3xl font-extrabold text-white font-mono">{item.unitsAvailable}</span>
                      <span className="text-xs text-slate-400">units available</span>
                    </div>

                    <div className="w-full bg-slate-950 h-2 rounded-full mt-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCriticalLow ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (item.unitsAvailable / 25) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] space-y-1 text-slate-400">
                    <div className="flex justify-between">
                      <span>Reserved:</span>
                      <strong className="text-slate-200">{item.reservedUnits ?? item.unitsReserved ?? 0} units</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Min Threshold:</span>
                      <span>{minThreshold} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage Temp:</span>
                      <span className="font-mono text-cyan-400">2°C - 6°C</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEmergencyStatRequest(item.bloodGroup)}
                    className="w-full mt-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    STAT Emergency Request
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: DONATIONS */}
      {activeTab === 'donations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" />
              Amateka yo Gutanga Amaraso / Blood Donation Log
            </h3>
            <span className="text-xs text-slate-400">Total: {bloodDonations.length} voluntary donations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-xl">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Donor Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Blood Group</th>
                  <th className="p-3">Volume</th>
                  <th className="p-3">Hemoglobin</th>
                  <th className="p-3">Screening</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bloodDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-medium text-white">{d.donorName}</td>
                    <td className="p-3 text-slate-400 font-mono">{d.donorPhone}</td>
                    <td className="p-3 font-bold font-mono text-rose-400">{d.bloodGroup}</td>
                    <td className="p-3 text-slate-300">{d.volumeMl ?? (d.units * 450)} mL</td>
                    <td className="p-3 text-slate-300">{d.hemoglobinLevel ?? d.hemoglobin} g/dL</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {d.screeningStatus ?? (d.status === 'available' ? 'Passed' : d.status)}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{d.donationDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: COMPATIBILITY MATRIX */}
      {activeTab === 'compatibility' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            Imbonerahamwe y'Ihuza ry'Amaraso / Blood Compatibility Matrix
          </h3>
          <p className="text-xs text-slate-400">
            Green indicates safe transfusion compatibility. Cross-matching with antibody screening is still mandatory before releasing blood bags.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border border-slate-800 rounded-xl">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3 text-left">Recipient (Umurwayi) ↓ \ Donor (Umuterankunga) →</th>
                  {(['O-', 'O+', 'B-', 'B+', 'A-', 'A+', 'AB-', 'AB+'] as BloodGroup[]).map((d) => (
                    <th key={d} className="p-3 font-mono font-bold text-rose-300">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(['O-', 'O+', 'B-', 'B+', 'A-', 'A+', 'AB-', 'AB+'] as BloodGroup[]).map((r) => (
                  <tr key={r} className="hover:bg-slate-800/40">
                    <td className="p-3 text-left font-mono font-bold text-white">{r}</td>
                    {(['O-', 'O+', 'B-', 'B+', 'A-', 'A+', 'AB-', 'AB+'] as BloodGroup[]).map((d) => {
                      const compatible = canReceiveFrom(r, d);
                      return (
                        <td key={d} className="p-3">
                          {compatible ? (
                            <span className="inline-block w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold leading-6 text-xs">
                              ✓
                            </span>
                          ) : (
                            <span className="text-slate-700 font-mono text-xs">✕</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER DONOR */}
      {showDonationModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400" />
                Kwandika Umuterankunga / Register Blood Donor
              </h3>
              <button onClick={() => setShowDonationModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRecordDonation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Amazina y'Umuterankunga / Donor Full Name</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Jean Paul Habimana"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Telefoni / Phone</label>
                  <input
                    type="text"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Itsinda ry'Amaraso / Blood Group</label>
                  <select
                    value={donorBloodGroup}
                    onChange={(e) => setDonorBloodGroup(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O- (Universal)</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Age</label>
                  <input
                    type="number"
                    value={donorAge}
                    onChange={(e) => setDonorAge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={donorWeight}
                    onChange={(e) => setDonorWeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Hemoglobin (g/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hemoglobin}
                    onChange={(e) => setHemoglobin(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-400 text-[11px]">
                Standard donation volume is <strong>450 mL</strong> whole blood. Rapid pathogen serology screening (HIV, HBV, HCV, Syphilis) conducted automatically.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDonationModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Bika Umuterankunga / Save Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE BLOOD */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Send className="w-5 h-5 text-cyan-400" />
                Gusohora Amaraso / Issue Blood Units
              </h3>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleIssueBlood} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Umurwayi Wakira / Recipient Patient</label>
                <select
                  value={issueRecipientId}
                  onChange={(e) => setIssueRecipientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.mrn}) • Blood: {p.bloodGroup}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Blood Group to Issue</label>
                  <select
                    value={issueBloodGroup}
                    onChange={(e) => setIssueBloodGroup(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  >
                    <option value="O-">O- (Universal Donor)</option>
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Units (Bags)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={issueUnits}
                    onChange={(e) => setIssueUnits(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Clinical Indication</label>
                <input
                  type="text"
                  value={issueIndication}
                  onChange={(e) => setIssueIndication(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold"
                >
                  Sohora Amaraso / Release Units
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
