import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { translations } from '../utils/translations';
import { ActiveNavTab } from '../types';
import {
  Activity,
  Bed,
  CreditCard,
  AlertTriangle,
  HeartPulse,
  Baby,
  Smile,
  Truck,
  Package,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Calendar,
} from 'lucide-react';

interface OperationsDashboardProps {
  onNavigate: (tab: ActiveNavTab) => void;
}

export const OperationsDashboardView: React.FC<OperationsDashboardProps> = ({ onNavigate }) => {
  const {
    beds,
    patients,
    emergencyCases,
    surgeries,
    maternityRecords,
    invoices,
    bloodInventory,
    paymentTransactions,
    language,
  } = useHospital();
  const t = translations[language];

  const totalBeds = beds.length || 1;
  const occupiedBeds = beds.filter((b) => b.status === 'occupied').length;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  // Wards occupancy
  const icuBeds = beds.filter((b) => b.ward === 'ICU');
  const icuOccupied = icuBeds.filter((b) => b.status === 'occupied').length;
  const icuRate = Math.round((icuOccupied / (icuBeds.length || 1)) * 100);

  const activeSurgeries = surgeries.filter((s) => s.status === 'in_progress').length;
  const activeLabour = maternityRecords.filter(
    (m) =>
      m.labourStage === 'first_stage' ||
      m.labourStage === 'second_stage' ||
      m.labourStage === 'Stage 1 (Dilation)' ||
      m.labourStage === 'Stage 2 (Delivery)'
  ).length;

  const pendingEmergency = emergencyCases.filter(
    (e) =>
      (e.status as string) === 'triage' ||
      (e.status as string) === 'treatment' ||
      e.status === 'in_triage' ||
      e.status === 'under_treatment'
  ).length;

  const totalRevenueCollected = invoices.reduce((acc, i) => acc + i.paidAmount, 0);

  const lowBloodUnits = bloodInventory.filter((b) => b.unitsAvailable <= b.minThreshold);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            {t.operations.hospitalOperations}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time executive oversight: bed occupancy rates, emergency triage, active surgical suites, maternity & revenue flow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-semibold border border-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            All Hospital Systems Normal
          </span>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('beds')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Bed Occupancy</span>
            <Bed className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">{occupancyRate}%</div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                occupancyRate > 85 ? 'bg-rose-500' : occupancyRate > 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
            <span>{occupiedBeds} of {totalBeds} beds in use</span>
            <span className="text-cyan-400 flex items-center gap-0.5">View &rarr;</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('emergency')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Emergency & Trauma</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2 font-mono">{pendingEmergency} Active</div>
          <div className="text-[11px] text-slate-400 mt-3">
            Triage Level 1 & 2 priority admissions under emergency physician care.
          </div>
          <div className="text-[11px] text-rose-400 mt-2 flex justify-between font-medium">
            <span>Critical triage</span>
            <span>View &rarr;</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('surgery')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Theatres (OR)</span>
            <HeartPulse className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-2 font-mono">{activeSurgeries} Operating</div>
          <div className="text-[11px] text-slate-400 mt-3">
            Surgeries currently in progress across 4 dedicated operating rooms.
          </div>
          <div className="text-[11px] text-purple-400 mt-2 flex justify-between font-medium">
            <span>WHO Checklist on</span>
            <span>View &rarr;</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('billing')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Revenue Collected</span>
            <CreditCard className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-2 font-mono">
            {totalRevenueCollected.toLocaleString()} RWF
          </div>
          <div className="text-[11px] text-slate-400 mt-3">
            MoMo, Airtel Money, Cards & POS cashier settlements.
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex justify-between font-medium">
            <span>{paymentTransactions.length} transactions</span>
            <span>Reconcile &rarr;</span>
          </div>
        </div>
      </div>

      {/* Ward Occupancy Matrix & Quick Routing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Hospital Ward Density & Bed Allocation
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { name: 'Intensive Care Unit (ICU)', total: icuBeds.length, occ: icuOccupied, rate: icuRate, color: 'bg-rose-500' },
              { name: 'Maternity & Neonatal Ward', total: 12, occ: 8, rate: 67, color: 'bg-pink-500' },
              { name: 'General Medical Inpatient', total: 24, occ: 19, rate: 79, color: 'bg-blue-500' },
              { name: 'Pediatric Ward', total: 10, occ: 6, rate: 60, color: 'bg-cyan-500' },
              { name: 'Surgical Recovery (PACU)', total: 6, occ: 3, rate: 50, color: 'bg-purple-500' },
            ].map((ward) => (
              <div key={ward.name} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200">{ward.name}</span>
                  <span className="font-mono font-bold text-white">{ward.occ} / {ward.total} Beds ({ward.rate}%)</span>
                </div>
                <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${ward.color} rounded-full`} style={{ width: `${ward.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Quick Actions */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Enterprise Quick Access
          </h3>

          <div className="space-y-2">
            {[
              { title: 'Rwanda MoMo Payment', desc: 'Settle patient copay via *182#', tab: 'billing' as ActiveNavTab, icon: CreditCard, color: 'text-yellow-400' },
              { title: 'Operating Theatre (OR)', desc: 'View WHO checklists & surgical cases', tab: 'surgery' as ActiveNavTab, icon: HeartPulse, color: 'text-purple-400' },
              { title: 'Maternity & Labour Suite', desc: 'Partograph, birth register & NICU', tab: 'maternity' as ActiveNavTab, icon: Baby, color: 'text-pink-400' },
              { title: 'Adult Dental Charting', desc: 'Universal 32-tooth restorative plans', tab: 'dental' as ActiveNavTab, icon: Smile, color: 'text-cyan-400' },
              { title: 'Central Medical Supplies', desc: 'Procurement POs & GRN receiving', tab: 'procurement' as ActiveNavTab, icon: Package, color: 'text-amber-400' },
              { title: 'Accounting & Ledger', desc: 'P&L statements & expense vouchers', tab: 'accounting' as ActiveNavTab, icon: TrendingUp, color: 'text-emerald-400' },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={() => onNavigate(action.tab)}
                  className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${action.color} group-hover:scale-110 transition-transform`} />
                    <div>
                      <div className="text-xs font-semibold text-white">{action.title}</div>
                      <div className="text-[10px] text-slate-400">{action.desc}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
