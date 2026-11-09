import React, { useState } from 'react';
import {
  Baby,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  Printer,
  Search,
  Plus,
  PhoneCall,
  Send,
  FileCheck,
  Bell,
  Syringe,
} from 'lucide-react';
import { MOCK_IMMUNIZATION_RECORDS } from '../data/mockRwandaNationalData';
import { ChildImmunizationRecord, ChildVaccineEntry } from '../types';
import { useHospital } from '../context/HospitalContext';

export const ImmunizationRegistryView: React.FC = () => {
  const { showToast } = useHospital();
  const [records, setRecords] = useState<ChildImmunizationRecord[]>(MOCK_IMMUNIZATION_RECORDS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChild, setSelectedChild] = useState<ChildImmunizationRecord | null>(null);

  // Administer Vaccine modal
  const [administeringChild, setAdministeringChild] = useState<ChildImmunizationRecord | null>(null);
  const [selectedDoseName, setSelectedDoseName] = useState<string>('Pentavalent 1, 2, 3 & PCV');
  const [batchNumber, setBatchNumber] = useState<string>('PNT-2026-RW-882');
  const [vaccineCenter, setVaccineCenter] = useState<string>('Kigali Health Center (Centre de Santé)');

  const filteredRecords = records.filter((rec) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchChild = rec.child_name.toLowerCase().includes(q);
      const matchId = rec.child_id.toLowerCase().includes(q);
      const matchMother = rec.mother_name.toLowerCase().includes(q);
      const matchNin = rec.mother_nin ? rec.mother_nin.toLowerCase().includes(q) : false;
      if (!matchChild && !matchId && !matchMother && !matchNin) return false;
    }
    return true;
  });

  const handleSendSmsReminder = (child: ChildImmunizationRecord) => {
    showToast({
      title: 'SMS Reminder Sent',
      message: `Vaccine alert dispatched to mother (${child.phone}) for ${child.child_name}.`,
      type: 'success',
    });
  };

  const handleAdministerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!administeringChild) return;

    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== administeringChild.id) return rec;

        const updatedVaccinations = rec.vaccinations.map((entry: ChildVaccineEntry) => {
          if (entry.vaccine_name.toLowerCase().includes(selectedDoseName.toLowerCase())) {
            return {
              ...entry,
              status: 'GIVEN' as const,
              date_given: new Date().toISOString().split('T')[0],
              batch_number: batchNumber,
              administered_by: 'Nurse Claudine Mukamana, RN',
            };
          }
          return entry;
        });

        return {
          ...rec,
          vaccinations: updatedVaccinations,
          is_overdue: false,
          next_vaccine_due: 'Scheduled booster on target',
        };
      })
    );

    showToast({
      title: 'Vaccination Recorded & Logged',
      message: `${selectedDoseName} recorded in Rwanda National Child Registry. Batch: ${batchNumber}.`,
      type: 'success',
    });

    setAdministeringChild(null);
  };

  return (
    <div className="space-y-6">
      {/* Title & Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                <Baby className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  Rwanda National Child Immunization Registry (EPI)
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    WHO / MINISANTE Standard
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Track expanded program of immunization schedules (BCG, Polio, Pentavalent, Rotavirus, PCV, MR, HPV), batch traceability, cold chain, and digital QR vaccination cards.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="search-child-registry"
                type="text"
                placeholder="Search child, mother, or NIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500 w-64"
              />
            </div>
          </div>
        </div>

        {/* EPI Milestone Schedule Overview */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
            Official Rwanda Child Vaccination Timeline
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
            <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-2">
              <div className="text-[10px] text-pink-400 font-bold">At Birth</div>
              <div className="text-slate-200 font-semibold text-[11px] mt-0.5">BCG & OPV 0</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-2">
              <div className="text-[10px] text-pink-400 font-bold">6 Weeks</div>
              <div className="text-slate-200 font-semibold text-[11px] mt-0.5">Penta 1, PCV 1, Rota 1</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-2">
              <div className="text-[10px] text-pink-400 font-bold">10 Weeks</div>
              <div className="text-slate-200 font-semibold text-[11px] mt-0.5">Penta 2, PCV 2, Rota 2</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-2">
              <div className="text-[10px] text-pink-400 font-bold">14 Weeks</div>
              <div className="text-slate-200 font-semibold text-[11px] mt-0.5">Penta 3, PCV 3, IPV</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-2">
              <div className="text-[10px] text-pink-400 font-bold">9 Months</div>
              <div className="text-slate-200 font-semibold text-[11px] mt-0.5">MR 1 & Vit A</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-2">
              <div className="text-[10px] text-pink-400 font-bold">15 Months</div>
              <div className="text-slate-200 font-semibold text-[11px] mt-0.5">MR 2 Booster</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-2">
              <div className="text-[10px] text-pink-400 font-bold">12 Years</div>
              <div className="text-slate-200 font-semibold text-[11px] mt-0.5">HPV (Cervical CA)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Children Vaccination Cards */}
      <div className="space-y-4">
        {filteredRecords.map((child) => {
          const completedCount = child.vaccinations.filter((v: ChildVaccineEntry) => v.status === 'GIVEN').length;
          const totalCount = child.vaccinations.length;
          const pct = Math.round((completedCount / (totalCount || 1)) * 100);

          return (
            <div
              key={child.id}
              id={`child-record-${child.id}`}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    <Baby className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-100">{child.child_name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {child.gender} • Born {child.dob} ({child.birth_weight_kg} kg)
                      </span>
                      {child.is_overdue && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Mother: <strong className="text-slate-300">{child.mother_name}</strong>{' '}
                      {child.mother_nin && `(NIN: ${child.mother_nin})`} • Tel: {child.phone} • {child.facility_name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">EPI Progress</div>
                    <div className="text-sm font-bold text-emerald-400">
                      {completedCount} / {totalCount} Doses ({pct}%)
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendSmsReminder(child)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition-all"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    SMS Reminder
                  </button>

                  <button
                    onClick={() => setSelectedChild(child)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    E-Certificate
                  </button>
                </div>
              </div>

              {/* Vaccine Milestones Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                      <th className="py-2 px-3">Vaccine Dose</th>
                      <th className="py-2 px-3">Target Disease</th>
                      <th className="py-2 px-3">Scheduled Age</th>
                      <th className="py-2 px-3">Date Given</th>
                      <th className="py-2 px-3">Batch Number</th>
                      <th className="py-2 px-3">Clinician</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {child.vaccinations.map((entry: ChildVaccineEntry, idx: number) => {
                      const isGiven = entry.status === 'GIVEN';
                      const isOverdue = entry.status === 'OVERDUE';

                      return (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-semibold text-slate-100 flex items-center gap-1.5">
                            <Syringe className="w-3.5 h-3.5 text-pink-400" />
                            {entry.vaccine_name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">{entry.target_disease}</td>
                          <td className="py-2.5 px-3 text-slate-300">{entry.scheduled_age}</td>
                          <td className="py-2.5 px-3">{entry.date_given || '—'}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-cyan-300">
                            {entry.batch_number || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">{entry.administered_by || '—'}</td>
                          <td className="py-2.5 px-3 text-right">
                            {isGiven ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> Given
                              </span>
                            ) : isOverdue ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 animate-pulse">
                                <AlertTriangle className="w-3 h-3" /> Overdue
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                <Clock className="w-3 h-3" /> Scheduled
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Quick Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                <div>
                  Next Action: <strong className="text-slate-200">{child.next_vaccine_due}</strong>
                </div>
                <button
                  id={`administer-btn-${child.id}`}
                  onClick={() => {
                    setAdministeringChild(child);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold transition-all shadow-md shadow-pink-900/30"
                >
                  <Syringe className="w-3.5 h-3.5" />
                  Administer Vaccine
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Administer Vaccine Modal */}
      {administeringChild && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-pink-400">
                <Syringe className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">Administer Vaccine (EPI Verification)</h3>
              </div>
              <button
                onClick={() => setAdministeringChild(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAdministerSubmit} className="space-y-4 text-xs">
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Child Name & ID</div>
                <div className="text-sm font-bold text-slate-200">{administeringChild.child_name}</div>
                <div className="text-xs text-slate-400">{administeringChild.child_id}</div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Vaccine Dose to Administer</label>
                <select
                  value={selectedDoseName}
                  onChange={(e) => setSelectedDoseName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                >
                  {administeringChild.vaccinations.map((entry: ChildVaccineEntry, idx: number) => (
                    <option key={idx} value={entry.vaccine_name}>
                      {entry.vaccine_name} ({entry.scheduled_age}) — {entry.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Vaccine Lot / Batch Number</label>
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Health Facility Center</label>
                  <input
                    type="text"
                    required
                    value={vaccineCenter}
                    onChange={(e) => setVaccineCenter(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdministeringChild(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-vaccination-administer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold transition-all shadow-md shadow-pink-900/40"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Sign & Record in EPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Digital Certificate Modal */}
      {selectedChild && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">Rwanda Digital Vaccination Certificate</h3>
              </div>
              <button
                onClick={() => setSelectedChild(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="bg-white text-slate-950 rounded-xl p-5 space-y-3 font-sans shadow-inner">
              <div className="text-center border-b border-slate-200 pb-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  REPUBLIC OF RWANDA • MINISTRY OF HEALTH
                </div>
                <div className="text-sm font-black uppercase text-pink-700 mt-0.5">
                  Official Child Health & Immunization Record
                </div>
                <div className="text-[9px] text-slate-400 font-mono">
                  ID: {selectedChild.child_id} • EPI-RW-{new Date().getFullYear()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Child:</span> <strong>{selectedChild.child_name}</strong>
                </div>
                <div>
                  <span className="text-slate-500">DOB:</span> <span>{selectedChild.dob}</span>
                </div>
                <div>
                  <span className="text-slate-500">Mother:</span> <span>{selectedChild.mother_name}</span>
                </div>
                <div>
                  <span className="text-slate-500">Mother NIN:</span>{' '}
                  <span className="font-mono">{selectedChild.mother_nin || '—'}</span>
                </div>
              </div>

              <div className="border-t border-b border-slate-200 py-2 space-y-1 text-[11px]">
                <div className="text-[10px] font-bold uppercase text-slate-500">Completed Vaccines</div>
                {selectedChild.vaccinations
                  .filter((v: ChildVaccineEntry) => v.status === 'GIVEN')
                  .map((v: ChildVaccineEntry, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-[10px]">
                      <span>
                        • {v.vaccine_name} ({v.date_given})
                      </span>
                      <span className="font-mono text-slate-500">Lot: {v.batch_number || 'N/A'}</span>
                    </div>
                  ))}
              </div>

              {/* QR Verification */}
              <div className="py-2 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-100 border border-slate-300 rounded p-1 flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-slate-900" />
                </div>
                <div className="text-[9px] font-mono text-emerald-700 font-bold mt-1">
                  RHIE-IMMUNIZATION-VERIFIED: {selectedChild.child_id}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                <Printer className="w-3.5 h-3.5" /> Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
