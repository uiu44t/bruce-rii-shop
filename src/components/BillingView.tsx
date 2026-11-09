import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Invoice, InvoiceItem, PaymentTransaction } from '../types';
import { RwandaPaymentModal } from './RwandaPaymentModal';
import { translations } from '../utils/translations';
import {
  Receipt,
  Plus,
  CreditCard,
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  X,
  Smartphone,
  Building2,
  Banknote,
  RotateCcw,
  QrCode,
  Send,
  Filter,
  Check,
  RefreshCw,
} from 'lucide-react';

export const BillingView: React.FC = () => {
  const {
    invoices,
    createInvoice,
    patients,
    paymentTransactions,
    verifyPayment,
    language,
    sendNotification,
    addToast,
  } = useHospital();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'invoices' | 'transactions' | 'reconciliation'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Rwanda Payment modal state
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  // New Invoice form state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 'item-1', description: 'Specialist Physician Consultation', category: 'consultation', cost: 10000, quantity: 1 },
    { id: 'item-2', description: 'Laboratory Diagnostic Comprehensive Panel', category: 'lab', cost: 25000, quantity: 1 },
    { id: 'item-3', description: 'Inpatient Ward Bed (2 Days)', category: 'bed', cost: 30000, quantity: 1 },
  ]);
  const [insuranceCoverPercent, setInsuranceCoverPercent] = useState<number>(85);

  const totalBilled = invoices.reduce((acc, i) => acc + i.total, 0);
  const totalCollected = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalOutstanding = Math.max(0, totalBilled - totalCollected);

  // Payment transactions KPIs
  const momoTotal = paymentTransactions
    .filter((p) => (p.provider === 'MTN MoMo' || p.provider === 'Airtel Money') && p.status === 'SUCCESS')
    .reduce((acc, p) => acc + p.amount, 0);

  const cardBankTotal = paymentTransactions
    .filter((p) => (p.provider === 'Visa' || p.provider === 'Mastercard' || p.provider === 'Bank Transfer') && p.status === 'SUCCESS')
    .reduce((acc, p) => acc + p.amount, 0);

  const cashTotal = paymentTransactions
    .filter((p) => p.provider === 'Cash' && p.status === 'SUCCESS')
    .reduce((acc, p) => acc + p.amount, 0);

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.patientMrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTransactions = paymentTransactions.filter((tx) => {
    return (
      tx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.transactionReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.provider.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handlePatientSelectChange = (patId: string) => {
    setSelectedPatientId(patId);
    const pat = patients.find((p) => p.id === patId);
    if (pat) {
      setInsuranceCoverPercent(pat.insurance.coveragePercent || 85);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        description: 'Pharmaceutical Dispensation & IV',
        category: 'pharmacy',
        cost: 15000,
        quantity: 1,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === selectedPatientId);
    if (!pat) return;

    createInvoice(pat.id, items, insuranceCoverPercent);
    setShowCreateModal(false);
    setSelectedPatientId('');
    addToast({
      type: 'success',
      title: 'Invoice Generated',
      message: `Invoice created for ${pat.name}`,
    });
  };

  const handleManualVerifyTx = async (txId: string) => {
    try {
      await verifyPayment(txId);
      addToast({
        type: 'success',
        title: 'Payment Verified',
        message: 'Transaction successfully reconciled with telecom switch.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Verification Error',
        message: err.message || 'Could not verify transaction.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {t.nav.billing}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-mono font-medium border border-emerald-800">
              {invoices.length} Invoices
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Rwanda MoMo & Airtel Gateway, Mutuelle/RAMA insurance copay adjudication, cashier shifts & revenue ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-900/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            {t.billing.createInvoice}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'invoices'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4 text-cyan-400" />
          {t.billing.invoices}
          <span className="px-1.5 py-0.5 rounded-full bg-slate-750 text-[10px]">{invoices.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'transactions'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          {t.payment.transactions} (MoMo/Cards)
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px]">
            {paymentTransactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'reconciliation'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-purple-400" />
          Cashier Shift Reconciliation
        </button>
      </div>

      {/* Financial Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Invoiced (Gross)</div>
          <div className="text-xl font-bold text-white mt-1 font-mono">{totalBilled.toLocaleString()} RWF</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all clinical departments</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Collected Revenue</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
            {totalCollected.toLocaleString()} RWF
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5">
            {Math.round((totalCollected / (totalBilled || 1)) * 100)}% collection efficiency
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Outstanding Balances</div>
          <div className="text-xl font-bold text-amber-400 mt-1 font-mono">
            {totalOutstanding.toLocaleString()} RWF
          </div>
          <div className="text-[11px] text-amber-400/80 mt-0.5">Pending cashier payment or insurer review</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Mobile Money (MoMo/Airtel)</div>
          <div className="text-xl font-bold text-yellow-400 mt-1 font-mono">
            {momoTotal.toLocaleString()} RWF
          </div>
          <div className="text-[11px] text-yellow-400/80 mt-0.5">Fast telecom settlement</div>
        </div>
      </div>

      {/* TAB 1: INVOICES LIST */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient name, MRN, or invoice number..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {['all', 'paid', 'pending', 'partially_paid', 'insurance_claim'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Invoices Table */}
          <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Patient / MRN</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Subtotal</th>
                  <th className="p-3.5 text-right">Insurance Copay</th>
                  <th className="p-3.5 text-right">Net Due</th>
                  <th className="p-3.5 text-right">Paid</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInvoices.map((inv) => {
                  const isPaid = inv.status === 'paid';
                  const balance = Math.max(0, inv.total - inv.paidAmount);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-cyan-300">{inv.invoiceNumber}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{inv.patientName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{inv.patientMrn}</div>
                      </td>
                      <td className="p-3.5 text-slate-400">{inv.date}</td>
                      <td className="p-3.5 text-right font-mono text-slate-300">{inv.subtotal.toLocaleString()} RWF</td>
                      <td className="p-3.5 text-right font-mono text-emerald-400">
                        -{inv.insuranceDiscount.toLocaleString()} RWF
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-white">
                        {inv.total.toLocaleString()} RWF
                      </td>
                      <td className="p-3.5 text-right font-mono text-emerald-300">
                        {inv.paidAmount.toLocaleString()} RWF
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isPaid
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : inv.status === 'partially_paid'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {inv.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewInvoice(inv)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View Statement & Print Receipt"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                          {!isPaid && (
                            <button
                              onClick={() => setPayingInvoice(inv)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-sm transition-all"
                            >
                              <Smartphone className="w-3 h-3" />
                              MoMo / Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RWANDA PAYMENT TRANSACTIONS */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transaction reference, patient, invoice or provider..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500"
              />
            </div>
            <div className="text-xs text-slate-400">
              Showing {filteredTransactions.length} transactions
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Tx Reference</th>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Patient</th>
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5">Payer Details</th>
                  <th className="p-3.5 text-right">Amount (RWF)</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-cyan-300">{tx.transactionReference}</td>
                    <td className="p-3.5 font-mono text-slate-300">{tx.invoiceNumber}</td>
                    <td className="p-3.5 font-medium text-white">{tx.patientName}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-200">
                        {tx.provider === 'MTN MoMo' && <span className="w-2 h-2 rounded-full bg-yellow-400" />}
                        {tx.provider === 'Airtel Money' && <span className="w-2 h-2 rounded-full bg-red-500" />}
                        {tx.provider === 'Visa' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                        {tx.provider === 'Cash' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                        {tx.provider}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">{tx.payerPhone || 'Cashier Desk'}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                      {tx.amount.toLocaleString()} RWF
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">{tx.verifiedAt || tx.createdAt}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          tx.status === 'SUCCESS'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : tx.status === 'PROCESSING'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800 animate-pulse'
                            : tx.status === 'REFUNDED'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {tx.status === 'PROCESSING' || tx.status === 'PENDING' ? (
                        <button
                          onClick={() => handleManualVerifyTx(tx.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-700 text-slate-200 hover:text-white text-[11px] font-medium flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Verify
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Reconciled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CASHIER SHIFT RECONCILIATION */}
      {activeTab === 'reconciliation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                Shift End Payment Distribution
              </h3>
              <p className="text-xs text-slate-400">
                Summary of collections grouped by provider for current active cashier shift.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <div className="text-[11px] text-yellow-400 font-medium">MTN MoMo & Airtel</div>
                  <div className="text-lg font-bold text-white font-mono mt-1">{momoTotal.toLocaleString()} RWF</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Automated settlement</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <div className="text-[11px] text-blue-400 font-medium">Cards & Bank Transfer</div>
                  <div className="text-lg font-bold text-white font-mono mt-1">
                    {cardBankTotal.toLocaleString()} RWF
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">POS terminal settlement</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <div className="text-[11px] text-emerald-400 font-medium">Cash in Drawer</div>
                  <div className="text-lg font-bold text-white font-mono mt-1">{cashTotal.toLocaleString()} RWF</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Physical cash count</div>
                </div>
              </div>

              {/* Progress Distribution Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Channel Contribution</span>
                  <span>{totalCollected.toLocaleString()} RWF Total</span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-yellow-500 h-full"
                    style={{ width: `${(momoTotal / (totalCollected || 1)) * 100}%` }}
                    title="Mobile Money"
                  />
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${(cardBankTotal / (totalCollected || 1)) * 100}%` }}
                    title="Cards & Banks"
                  />
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${(cashTotal / (totalCollected || 1)) * 100}%` }}
                    title="Cash"
                  />
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-yellow-500" /> MoMo / Airtel (
                    {Math.round((momoTotal / (totalCollected || 1)) * 100)}%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-blue-500" /> Cards & POS (
                    {Math.round((cardBankTotal / (totalCollected || 1)) * 100)}%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Cash Drawer (
                    {Math.round((cashTotal / (totalCollected || 1)) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Rwanda MoMo Merchant Info
              </h4>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">MoMo Code:</span>
                  <span className="font-mono font-bold text-yellow-400">*182*8*1*29381#</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Merchant Name:</span>
                  <span className="font-semibold text-white">CHUK - RECEIVING</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">RRA TIN Number:</span>
                  <span className="font-mono text-cyan-300">100029381</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Shift:</span>
                  <span className="text-slate-200">Day Shift (07:00 - 15:00)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cashier:</span>
                  <span className="text-slate-200">Uwase Claudine</span>
                </div>
              </div>

              <button
                onClick={() => {
                  addToast({
                    type: 'success',
                    title: 'Shift Report Exported',
                    message: 'Cashier shift balance sheet generated and signed.',
                  });
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Cashier Shift Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rwanda Payment Modal */}
      {payingInvoice && (
        <RwandaPaymentModal
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onPaymentCompleted={() => {
            // Updated automatically via context
          }}
        />
      )}

      {/* Itemized Hospital Statement / Printable Receipt Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                  Official Hospital Invoice & Statement
                </h3>
                <div className="text-xs font-mono text-cyan-300">{viewInvoice.invoiceNumber}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Statement
                </button>
                <button
                  onClick={() => {
                    sendNotification({
                      recipientType: 'patient',
                      recipientId: viewInvoice.patientId,
                      recipientName: viewInvoice.patientName,
                      title: 'Invoice Statement Shared',
                      message: `CHUK Statement for ${viewInvoice.invoiceNumber}: Total ${viewInvoice.total.toLocaleString()} RWF. Status: ${viewInvoice.status.toUpperCase()}.`,
                      type: 'billing',
                      channel: 'sms',
                    });
                    addToast({
                      type: 'success',
                      title: 'Statement Sent',
                      message: `SMS link sent to patient`,
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send SMS
                </button>
                <button onClick={() => setViewInvoice(null)} className="p-1.5 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Header Banner */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-white text-sm">CENTRE HOSPITALIER UNIVERSITAIRE DE KIGALI</div>
                  <div className="text-slate-400 text-[11px]">KN 4 Ave, Kigali, Rwanda • TIN: 100029381</div>
                  <div className="text-slate-400 text-[11px]">Ministry of Health (MINISANTE) Accredited Hospital</div>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <div className="text-slate-400">Date: {viewInvoice.date}</div>
                  <div className="text-slate-400">Due: {viewInvoice.dueDate}</div>
                  <div className="text-emerald-400 font-bold mt-1 uppercase">
                    Status: {viewInvoice.status.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 pt-2 border-t border-slate-700/80 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Patient: </span>
                  <strong className="text-white">{viewInvoice.patientName}</strong> ({viewInvoice.patientMrn})
                </div>
                <div>
                  <span className="text-slate-400">Insurance: </span>
                  <span className="text-emerald-300 font-medium">Mutuelle de Santé / RSSB (RAMA)</span>
                </div>
                <div>
                  <span className="text-slate-400">Department: </span>
                  <span className="text-slate-200">Internal Medicine & Diagnostics</span>
                </div>
                <div>
                  <span className="text-slate-400">Attending Doctor: </span>
                  <span className="text-slate-200">Dr. Emmanuel Nkurunziza</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Service / Supply Description</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-right">Unit Rate</th>
                    <th className="p-2.5 text-right">Qty</th>
                    <th className="p-2.5 text-right">Total (RWF)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {viewInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2.5 font-medium text-white">{item.description}</td>
                      <td className="p-2.5 text-slate-400 uppercase text-[10px]">{item.category}</td>
                      <td className="p-2.5 text-right font-mono text-slate-300">{item.cost.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-mono text-slate-300">{item.quantity}</td>
                      <td className="p-2.5 text-right font-mono font-semibold text-white">
                        {(item.cost * item.quantity).toLocaleString()} RWF
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="space-y-1.5 text-xs text-right border-t border-slate-800 pt-3">
              <div className="text-slate-400">
                Gross Hospital Charge: <span className="font-mono text-white">{viewInvoice.subtotal.toLocaleString()} RWF</span>
              </div>
              <div className="text-emerald-400">
                Insurance Copay (85%): <span className="font-mono">-{viewInvoice.insuranceDiscount.toLocaleString()} RWF</span>
              </div>
              <div className="text-sm font-bold text-white pt-1">
                Net Patient Payable: <span className="font-mono text-cyan-300 text-base">{viewInvoice.total.toLocaleString()} RWF</span>
              </div>
              <div className="text-emerald-400 text-xs font-mono font-semibold">
                Amount Cleared: {viewInvoice.paidAmount.toLocaleString()} RWF
              </div>
              <div className="text-amber-400 text-xs font-mono font-bold">
                Remaining Balance: {Math.max(0, viewInvoice.total - viewInvoice.paidAmount).toLocaleString()} RWF
              </div>
            </div>

            {/* MoMo Pay Quick CTA */}
            {viewInvoice.status !== 'paid' && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    const inv = viewInvoice;
                    setViewInvoice(null);
                    setPayingInvoice(inv);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30"
                >
                  <Smartphone className="w-4 h-4" />
                  Proceed to MoMo / Card Payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-5 shadow-2xl text-slate-100 space-y-4 max-h-[92vh] flex flex-col my-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                {t.billing.createInvoice}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Select Patient *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handlePatientSelectChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.mrn}) - {p.insurance.provider}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Insurance Copay Deduction (%)</label>
                <input
                  type="number"
                  value={insuranceCoverPercent}
                  onChange={(e) => setInsuranceCoverPercent(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              {/* Items List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">Billable Services & Fees (RWF)</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    + Add Charge Line
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].description = e.target.value;
                          setItems(updated);
                        }}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white"
                        placeholder="Description"
                        required
                      />
                      <input
                        type="number"
                        step="500"
                        value={item.cost}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].cost = Number(e.target.value);
                          setItems(updated);
                        }}
                        className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                        placeholder="Cost (RWF)"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedPatientId || items.length === 0}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                >
                  Generate Statement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
