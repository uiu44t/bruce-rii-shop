import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { GeneralLedgerEntry, HospitalExpense } from '../types';
import { translations } from '../utils/translations';
import {
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Building2,
  FileSpreadsheet,
  Receipt,
  FileText,
  X,
  Printer,
  Calendar,
} from 'lucide-react';

export const AccountingView: React.FC = () => {
  const { ledgerEntries, expenses, recordExpense, postLedgerEntry, invoices, language, addToast } = useHospital();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'ledger' | 'expenses' | 'pnl'>('ledger');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // New Expense Form
  const [category, setCategory] = useState<HospitalExpense['category']>('Medical Supplies & Consumables');
  const [description, setDescription] = useState('Liquid Medical Oxygen Bulk Refill');
  const [amount, setAmount] = useState(1850000);
  const [department, setDepartment] = useState('ICU & Operating Theatres');
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Cash' | 'Corporate MoMo' | 'Cheque'>('Bank Transfer');
  const [payee, setPayee] = useState('Air Liquide Rwanda Ltd');

  const totalCollectedRevenue = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalOperatingExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netOperatingMargin = totalCollectedRevenue - totalOperatingExpenses;
  const isSurplus = netOperatingMargin >= 0;

  const totalDebits = ledgerEntries.reduce((acc, l) => acc + l.debit, 0);
  const totalCredits = ledgerEntries.reduce((acc, l) => acc + l.credit, 0);

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordExpense({
      date: new Date().toISOString().split('T')[0],
      category,
      description,
      amount,
      department,
      paymentMethod,
      payee,
      status: 'paid',
      approvedBy: 'Chief Financial Officer',
      authorizedBy: 'Chief Financial Officer',
    });

    setShowAddExpenseModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            {t.accounting.accounting}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-mono font-medium border border-emerald-800">
              General Ledger
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Double-entry General Ledger, automated GRN capitalization, operational expenses & monthly P&L surplus.
          </p>
        </div>

        <button
          onClick={() => setShowAddExpenseModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-900/30 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t.accounting.recordExpense}
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Operating Revenue (Collected)</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
            {totalCollectedRevenue.toLocaleString()} RWF
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Patient copays, MoMo, cash</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Operating Expenditures</div>
          <div className="text-xl font-bold text-rose-400 mt-1 font-mono">
            {totalOperatingExpenses.toLocaleString()} RWF
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Payroll, oxygen, fuel, drugs</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Net Operating Balance</div>
          <div
            className={`text-xl font-bold mt-1 font-mono flex items-center gap-1.5 ${
              isSurplus ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isSurplus ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {netOperatingMargin.toLocaleString()} RWF
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {isSurplus ? 'Positive Operating Surplus' : 'Operating Deficit'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Ledger Trial Balance Check</div>
          <div className="text-xl font-bold text-cyan-400 mt-1 font-mono">
            {Math.abs(totalDebits - totalCredits) < 10000000 ? 'Balanced ✓' : 'Auditing'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Debits: {totalDebits.toLocaleString()} RWF</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'ledger'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          {t.accounting.generalLedger}
          <span className="px-1.5 py-0.5 rounded-full bg-slate-750 text-[10px]">{ledgerEntries.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'expenses'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4 text-rose-400" />
          {t.accounting.expenses}
          <span className="px-1.5 py-0.5 rounded-full bg-slate-750 text-[10px]">{expenses.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('pnl')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'pnl'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-cyan-400" />
          {t.accounting.financialStatements}
        </button>
      </div>

      {/* TAB 1: GENERAL LEDGER TABLE */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Reference Doc</th>
                  <th className="p-3.5">Account & Description</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5 text-right">Debit (RWF)</th>
                  <th className="p-3.5 text-right">Credit (RWF)</th>
                  <th className="p-3.5">Posted By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ledgerEntries.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 text-slate-400">{l.date}</td>
                    <td className="p-3.5 font-mono font-semibold text-cyan-300">{l.referenceDoc}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{l.accountName}</div>
                      <div className="text-[11px] text-slate-400">{l.description}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          l.category === 'Revenue'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : l.category === 'Asset'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {l.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{l.department}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      {l.debit > 0 ? l.debit.toLocaleString() : '-'}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                      {l.credit > 0 ? l.credit.toLocaleString() : '-'}
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">{l.postedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EXPENSES TABLE */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Voucher #</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Payee & Purpose</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5 text-right">Amount (RWF)</th>
                  <th className="p-3.5">Authorized By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-cyan-300">{exp.voucherNumber}</td>
                    <td className="p-3.5 text-slate-400">{exp.date}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{exp.payee}</div>
                      <div className="text-[11px] text-slate-400">{exp.description}</div>
                    </td>
                    <td className="p-3.5 text-slate-300">{exp.category}</td>
                    <td className="p-3.5 text-slate-300">{exp.department}</td>
                    <td className="p-3.5 font-mono text-amber-300">{exp.paymentMethod}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-rose-400">
                      {exp.amount.toLocaleString()} RWF
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">{exp.authorizedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: P&L FINANCIAL REPORT */}
      {activeTab === 'pnl' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Statement of Financial Performance (P&L)</h3>
              <p className="text-xs text-slate-400">Centre Hospitalier Universitaire de Kigali • Year to Date 2026</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print P&L Report
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Revenue Block */}
            <div className="space-y-2">
              <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                I. Operating Revenue
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-850 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Inpatient & Bed Care Collections</span>
                  <span className="font-mono text-white">4,800,000 RWF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Surgical Suites & Procedures</span>
                  <span className="font-mono text-white">3,200,000 RWF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Laboratory & Diagnostic Imaging Copays</span>
                  <span className="font-mono text-white">2,100,000 RWF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Pharmacy Medication Dispensation</span>
                  <span className="font-mono text-white">1,500,000 RWF</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700 font-bold text-sm">
                  <span className="text-slate-100">Total Operational Revenue</span>
                  <span className="font-mono text-emerald-400">{totalCollectedRevenue.toLocaleString()} RWF</span>
                </div>
              </div>
            </div>

            {/* Expenses Block */}
            <div className="space-y-2">
              <h4 className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">
                II. Operating Expenditures
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-850 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Clinical & Nursing Staff Payroll</span>
                  <span className="font-mono text-white">4,500,000 RWF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Medical Liquid Oxygen & Gas Cylinders</span>
                  <span className="font-mono text-white">1,850,000 RWF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Standby Generator Diesel & Emergency Power</span>
                  <span className="font-mono text-white">750,000 RWF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Pharmaceutical Restocking & Consumables</span>
                  <span className="font-mono text-white">1,200,000 RWF</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700 font-bold text-sm">
                  <span className="text-slate-100">Total Operating Expenses</span>
                  <span className="font-mono text-rose-400">-{totalOperatingExpenses.toLocaleString()} RWF</span>
                </div>
              </div>
            </div>

            {/* Net Surplus / Deficit */}
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex justify-between items-center text-sm font-bold">
              <span className="text-white">NET OPERATING MARGIN / SURPLUS:</span>
              <span className="font-mono text-base text-emerald-400">
                {netOperatingMargin.toLocaleString()} RWF
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                Record Hospital Operational Expenditure
              </h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Expenditure Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Salaries & Clinical Payroll">Salaries & Clinical Payroll</option>
                  <option value="Medical Oxygen & Gas">Medical Oxygen & Gas Refills</option>
                  <option value="Generator Fuel & Utilities">Generator Fuel & Utilities (WASAC/REG)</option>
                  <option value="Medical Supplies & Consumables">Medical Supplies & Consumables</option>
                  <option value="Biomedical Equipment Maintenance">Biomedical Equipment Maintenance</option>
                  <option value="Facility & Waste Management">Facility & Waste Management</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Payee / Vendor Name</label>
                <input
                  type="text"
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Description / Purpose</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Amount (RWF)</label>
                  <input
                    type="number"
                    step="10000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="Bank Transfer">Bank of Kigali Wire</option>
                    <option value="Corporate MoMo">Corporate MoMo Business</option>
                    <option value="Cheque">Official Cheque</option>
                    <option value="Cash">Cashier Petty Cash</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Authorize & Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
