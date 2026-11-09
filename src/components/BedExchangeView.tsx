import React, { useState } from 'react';
import {
  BedDouble,
  Activity,
  CheckCircle2,
  AlertCircle,
  Wind,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Send,
  Building,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { MOCK_BED_EXCHANGE_DATA, RWANDA_FACILITIES } from '../data/mockRwandaNationalData';
import { BedExchangeItem } from '../types';
import { useHospital } from '../context/HospitalContext';

export const BedExchangeView: React.FC = () => {
  const { patients } = useHospital();
  const [bedList, setBedList] = useState<BedExchangeItem[]>(MOCK_BED_EXCHANGE_DATA);
  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reserve Modal
  const [reservingBed, setReservingBed] = useState<BedExchangeItem | null>(null);
  const [reservePatientName, setReservePatientName] = useState<string>('');
  const [reservePatientMrn, setReservePatientMrn] = useState<string>('');
  const [reserveReferralRef, setReserveReferralRef] = useState<string>('REF-2026-RW-0098');
  const [reserveSuccess, setReserveSuccess] = useState<boolean>(false);

  const filteredBeds = bedList.filter((bed) => {
    if (selectedFacility !== 'ALL' && bed.facility_id !== selectedFacility) return false;
    if (selectedWard !== 'ALL' && bed.ward_type !== selectedWard) return false;
    if (statusFilter !== 'ALL' && bed.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBed = bed.bed_number.toLowerCase().includes(q);
      const matchFac = bed.facility_name.toLowerCase().includes(q);
      const matchPat = bed.patient_name?.toLowerCase().includes(q);
      if (!matchBed && !matchFac && !matchPat) return false;
    }
    return true;
  });

  const availableCount = bedList.filter((b) => b.status === 'AVAILABLE').length;
  const occupiedCount = bedList.filter((b) => b.status === 'OCCUPIED').length;
  const reservedCount = bedList.filter((b) => b.status === 'RESERVED').length;
  const cleaningCount = bedList.filter((b) => b.status === 'CLEANING').length;
  const maintenanceCount = bedList.filter((b) => b.status === 'MAINTENANCE').length;
  const icuAvailable = bedList.filter((b) => b.ward_type === 'ICU' && b.status === 'AVAILABLE').length;

  const handleQuickStatusChange = (bedId: string, newStatus: BedExchangeItem['status']) => {
    setBedList((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status: newStatus,
              last_updated: new Date().toISOString(),
              patient_name: newStatus === 'AVAILABLE' ? undefined : b.patient_name,
              patient_mrn: newStatus === 'AVAILABLE' ? undefined : b.patient_mrn,
              reserved_for_referral: newStatus === 'AVAILABLE' ? undefined : b.reserved_for_referral,
            }
          : b
      )
    );
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservingBed) return;

    setBedList((prev) =>
      prev.map((b) =>
        b.id === reservingBed.id
          ? {
              ...b,
              status: 'RESERVED',
              patient_name: reservePatientName || 'Referral Patient',
              patient_mrn: reservePatientMrn || 'MRN-PENDING',
              reserved_for_referral: reserveReferralRef,
              last_updated: new Date().toISOString(),
            }
          : b
      )
    );

    setReserveSuccess(true);
    setTimeout(() => {
      setReserveSuccess(false);
      setReservingBed(null);
      setReservePatientName('');
      setReservePatientMrn('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <BedDouble className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  Real-Time National Bed Exchange Network
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live RHIE Sync
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Inter-facility live bed telemetry across ICU, Emergency, Surgery, Pediatrics, and Maternity. Instant reservation for clinical referrals.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="refresh-bed-telemetry"
              onClick={() => {
                setBedList((prev) => [...prev]);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Telemetry
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div
            onClick={() => setStatusFilter(statusFilter === 'AVAILABLE' ? 'ALL' : 'AVAILABLE')}
            className={`cursor-pointer p-3 rounded-xl border transition-all text-center ${
              statusFilter === 'AVAILABLE'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-emerald-400">Available</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{availableCount}</div>
            <div className="text-[10px] text-slate-400">Ready for intake</div>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'OCCUPIED' ? 'ALL' : 'OCCUPIED')}
            className={`cursor-pointer p-3 rounded-xl border transition-all text-center ${
              statusFilter === 'OCCUPIED'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-rose-400">Occupied</div>
            <div className="text-lg font-black text-rose-400 mt-0.5">{occupiedCount}</div>
            <div className="text-[10px] text-slate-400">Active patients</div>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'RESERVED' ? 'ALL' : 'RESERVED')}
            className={`cursor-pointer p-3 rounded-xl border transition-all text-center ${
              statusFilter === 'RESERVED'
                ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                : 'bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-blue-400">Reserved</div>
            <div className="text-lg font-black text-blue-400 mt-0.5">{reservedCount}</div>
            <div className="text-[10px] text-slate-400">In-transit transfers</div>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'CLEANING' ? 'ALL' : 'CLEANING')}
            className={`cursor-pointer p-3 rounded-xl border transition-all text-center ${
              statusFilter === 'CLEANING'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-amber-400">Cleaning</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">{cleaningCount}</div>
            <div className="text-[10px] text-slate-400">Sterilization underway</div>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'MAINTENANCE' ? 'ALL' : 'MAINTENANCE')}
            className={`cursor-pointer p-3 rounded-xl border transition-all text-center ${
              statusFilter === 'MAINTENANCE'
                ? 'bg-slate-600/30 border-slate-500 text-slate-300'
                : 'bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-slate-400">Maintenance</div>
            <div className="text-lg font-black text-slate-300 mt-0.5">{maintenanceCount}</div>
            <div className="text-[10px] text-slate-400">Technical servicing</div>
          </div>

          <div className="p-3 rounded-xl border bg-cyan-950/40 border-cyan-800/60 text-center">
            <div className="text-[10px] uppercase font-bold text-cyan-400">ICU Available</div>
            <div className="text-lg font-black text-cyan-300 mt-0.5">{icuAvailable} Beds</div>
            <div className="text-[10px] text-slate-400">Ventilator ready</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="search-beds-input"
                type="text"
                placeholder="Search bed ID, patient or hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-60"
              />
            </div>

            <select
              id="filter-bed-facility"
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Hospitals & Clinics</option>
              {RWANDA_FACILITIES.filter((f) => f.total_beds && f.total_beds > 0).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>

            <select
              id="filter-bed-ward"
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Wards</option>
              <option value="ICU">ICU (Intensive Care)</option>
              <option value="NICU">NICU (Neonatal ICU)</option>
              <option value="Emergency">Emergency Bay</option>
              <option value="Surgery">Surgery / Post-Op</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Maternity">Maternity</option>
              <option value="General Ward">General Ward</option>
            </select>
          </div>

          {statusFilter !== 'ALL' && (
            <button
              onClick={() => setStatusFilter('ALL')}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Clear Status Filter ({statusFilter})
            </button>
          )}
        </div>
      </div>

      {/* Bed Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBeds.map((bed) => {
          const isAvailable = bed.status === 'AVAILABLE';
          const isOccupied = bed.status === 'OCCUPIED';
          const isReserved = bed.status === 'RESERVED';
          const isCleaning = bed.status === 'CLEANING';
          const isMaintenance = bed.status === 'MAINTENANCE';

          return (
            <div
              key={bed.id}
              id={`bed-exchange-card-${bed.id}`}
              className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between transition-all shadow-md ${
                isAvailable
                  ? 'border-emerald-500/40 hover:border-emerald-500'
                  : isOccupied
                  ? 'border-rose-500/30'
                  : isReserved
                  ? 'border-blue-500/40'
                  : isCleaning
                  ? 'border-amber-500/30'
                  : 'border-slate-800'
              }`}
            >
              <div>
                {/* Bed Header & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sm font-bold text-slate-100">{bed.bed_number}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {bed.ward_type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-1">{bed.facility_name}</div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      isAvailable
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isOccupied
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : isReserved
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        : isCleaning
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                    }`}
                  >
                    {bed.status}
                  </span>
                </div>

                {/* Equipment Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {bed.oxygen_support && (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/50">
                      <Wind className="w-3 h-3" /> High-Flow O2
                    </span>
                  )}
                  {bed.ventilator_support && (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
                      <Activity className="w-3 h-3" /> Mechanical Ventilator
                    </span>
                  )}
                </div>

                {/* Patient / Referral info */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 text-xs">
                  {isOccupied && (
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Inpatient</div>
                      <div className="font-semibold text-slate-200">{bed.patient_name || 'Anonymous Patient'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{bed.patient_mrn || 'MRN-N/A'}</div>
                    </div>
                  )}

                  {isReserved && (
                    <div>
                      <div className="text-[10px] text-blue-400 uppercase font-semibold">Reserved for Referral</div>
                      <div className="font-semibold text-slate-200">{bed.patient_name}</div>
                      <div className="text-[11px] text-blue-300 font-mono">{bed.reserved_for_referral}</div>
                    </div>
                  )}

                  {isAvailable && (
                    <div className="text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready for emergency or transfer intake
                    </div>
                  )}

                  {isCleaning && (
                    <div className="text-amber-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" /> Decontamination in progress (~15m)
                    </div>
                  )}

                  {isMaintenance && (
                    <div className="text-slate-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> Sensor calibration underway
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                {isAvailable ? (
                  <button
                    id={`reserve-bed-${bed.id}`}
                    onClick={() => {
                      setReservingBed(bed);
                      if (patients.length > 0) {
                        setReservePatientName(patients[0].name);
                        setReservePatientMrn(patients[0].mrn);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-indigo-900/40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Reserve for Transfer
                  </button>
                ) : isCleaning ? (
                  <button
                    onClick={() => handleQuickStatusChange(bed.id, 'AVAILABLE')}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Cleaned & Available
                  </button>
                ) : isReserved ? (
                  <button
                    onClick={() => handleQuickStatusChange(bed.id, 'OCCUPIED')}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-all"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    Admit Arrived Patient
                  </button>
                ) : isOccupied ? (
                  <button
                    onClick={() => handleQuickStatusChange(bed.id, 'CLEANING')}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition-all"
                  >
                    Discharge & Request Clean
                  </button>
                ) : (
                  <button
                    onClick={() => handleQuickStatusChange(bed.id, 'AVAILABLE')}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
                  >
                    Complete Maintenance
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bed Reservation Modal */}
      {reservingBed && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <BedDouble className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">Reserve Bed for Clinical Referral</h3>
              </div>
              <button
                id="close-reserve-modal"
                onClick={() => setReservingBed(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800"
              >
                Cancel
              </button>
            </div>

            {reserveSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-100">Bed Successfully Reserved</h4>
                <p className="text-xs text-slate-400">
                  {reservingBed.bed_number} ({reservingBed.ward_type}) at {reservingBed.facility_name} is locked for{' '}
                  <strong className="text-slate-200">{reservePatientName}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmReservation} className="space-y-4 text-xs">
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Target Bed & Facility</div>
                  <div className="text-sm font-bold text-slate-200">
                    {reservingBed.bed_number} ({reservingBed.ward_type})
                  </div>
                  <div className="text-xs text-slate-400">{reservingBed.facility_name}</div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Select Patient or Enter Name</label>
                  <input
                    type="text"
                    required
                    value={reservePatientName}
                    onChange={(e) => setReservePatientName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
                    placeholder="Patient full name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Patient MRN</label>
                    <input
                      type="text"
                      required
                      value={reservePatientMrn}
                      onChange={(e) => setReservePatientMrn(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                      placeholder="MRN-2026-..."
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Referral Reference No.</label>
                    <input
                      type="text"
                      required
                      value={reserveReferralRef}
                      onChange={(e) => setReserveReferralRef(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setReservingBed(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="submit-reserve-bed"
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-900/40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Lock & Reserve Bed
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
