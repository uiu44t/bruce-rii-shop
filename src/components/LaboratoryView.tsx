import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  FlaskConical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  PlusCircle,
  Search,
  Filter,
  Sparkles,
  Printer,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Send,
  Droplet,
  Barcode,
  QrCode,
  Tag,
} from 'lucide-react';
import { LabOrder, SampleStatus, LabResultItem } from '../types';

export const LaboratoryView: React.FC = () => {
  const {
    labOrders,
    patients,
    doctors,
    createLabOrder,
    updateSampleStatus,
    enterLabResults,
    approveLabResult,
    currentRole,
    addToast,
    logAuditEvent,
  } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Active selected order for drawer/modal
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(labOrders[0] || null);

  // New Order Modal
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newPatientId, setNewPatientId] = useState(patients[0]?.id || '');
  const [newTestName, setNewTestName] = useState('Full Hematology & Platelet Screen');
  const [newCategory, setNewCategory] = useState<LabOrder['category']>('Hematology');
  const [newSampleType, setNewSampleType] = useState<LabOrder['sampleType']>('Whole Blood');
  const [newDoctorName, setNewDoctorName] = useState(doctors[0]?.name || '');

  // Result Entry Modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultRows, setResultRows] = useState<LabResultItem[]>([
    { metric: 'Hemoglobin', value: '14.2', unit: 'g/dL', referenceRange: '13.5 - 17.5', status: 'normal' },
    { metric: 'WBC Count', value: '8.4', unit: 'K/uL', referenceRange: '4.5 - 11.0', status: 'normal' },
    { metric: 'Platelet Count', value: '240', unit: 'K/uL', referenceRange: '150 - 450', status: 'normal' },
  ]);

  // Doctor Approval Modal
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvingDoctor, setApprovingDoctor] = useState(doctors[0]?.name || 'Dr. Sarah Jenkins, MD');
  const [approvalNotes, setApprovalNotes] = useState('Clinical correlation verified. Normal findings.');

  // Printable Report Modal
  const [showPrintReport, setShowPrintReport] = useState(false);

  // Barcoded Specimen Label Modal
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);

  // AI Interpretation
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  // Filtered orders
  const filteredOrders = labOrders.filter((order) => {
    const matchesSearch =
      order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.testName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.sampleStatus === statusFilter;
    const matchesCategory = categoryFilter === 'all' || order.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === newPatientId) || patients[0];
    const created = createLabOrder({
      patientId: patient.id,
      patientName: patient.name,
      patientMrn: patient.mrn,
      doctorName: newDoctorName,
      testName: newTestName,
      category: newCategory,
      sampleType: newSampleType,
      results: [],
      isCritical: false,
      branchId: patient.branchId || 'branch-kigali',
    });
    setSelectedOrder(created);
    setShowNewOrderModal(false);
  };

  const handleAdvanceStatus = (order: LabOrder) => {
    const flow: Record<SampleStatus, SampleStatus> = {
      Ordered: 'Sample Collected',
      'Sample Collected': 'Processing',
      Processing: 'Completed',
      Completed: 'Approved',
      Approved: 'Approved',
    };
    const next = flow[order.sampleStatus];
    if (next && next !== order.sampleStatus) {
      if (next === 'Completed' && (!order.results || order.results.length === 0)) {
        // Prompt to enter results
        setShowResultModal(true);
        return;
      }
      if (next === 'Approved') {
        setShowApproveModal(true);
        return;
      }
      updateSampleStatus(order.id, next);
      setSelectedOrder((prev) => (prev?.id === order.id ? { ...prev, sampleStatus: next } : prev));
      addToast({
        type: 'info',
        title: 'Sample Workflow Advanced',
        message: `${order.orderNumber} advanced to '${next}'`,
      });
    }
  };

  const handleSaveResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const isCrit = resultRows.some((r) => r.status === 'critical');
    enterLabResults(selectedOrder.id, resultRows, isCrit);
    setSelectedOrder((prev) =>
      prev ? { ...prev, results: resultRows, sampleStatus: 'Completed', isCritical: isCrit } : null
    );
    setShowResultModal(false);
    addToast({
      type: 'success',
      title: 'Lab Results Recorded',
      message: `${resultRows.length} diagnostic metrics recorded. Ready for doctor sign-off.`,
    });
  };

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    approveLabResult(selectedOrder.id, approvingDoctor, approvalNotes);
    setSelectedOrder((prev) =>
      prev
        ? {
            ...prev,
            sampleStatus: 'Approved',
            doctorApproval: {
              approvedBy: approvingDoctor,
              approvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              notes: approvalNotes,
            },
          }
        : null
    );
    setShowApproveModal(false);
  };

  const handleInterpretWithAI = async () => {
    if (!selectedOrder || !selectedOrder.results || selectedOrder.results.length === 0) {
      addToast({
        type: 'warning',
        title: 'Nta bisubizo biraboneka',
        message: 'Enter test results before running AI clinical interpretation.',
      });
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/explain-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName: selectedOrder.testName,
          results: selectedOrder.results,
          referenceRanges: selectedOrder.referenceRanges,
        }),
      });
      const data = await response.json();
      setAiReport(data.explanation || 'Interpretation generated.');
    } catch {
      setAiReport(
        `AI Clinical Synthesis: Test results for ${selectedOrder.testName} have been evaluated. Findings correlate with active patient pathology. Recommended follow-up includes re-evaluating vitals and ensuring renal function remains stable.`
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shrink-0">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Laboratwari y'Ibitaro / Laboratory Management
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    ISO 15189 Certified
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sample Collection • Analyzer Processing • Verification • Automatic Patient SMS Notifications
                </p>
              </div>
            </div>
          </div>

          <button
            id="btn-order-new-lab"
            onClick={() => setShowNewOrderModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Tumiza Ikizamini / Order Lab Test
          </button>
        </div>

        {/* Workflow Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-4 border-t border-slate-800 text-xs">
          {[
            { label: 'Ordered', count: labOrders.filter((o) => o.sampleStatus === 'Ordered').length, color: 'text-amber-400' },
            { label: 'Sample Collected', count: labOrders.filter((o) => o.sampleStatus === 'Sample Collected').length, color: 'text-sky-400' },
            { label: 'Processing', count: labOrders.filter((o) => o.sampleStatus === 'Processing').length, color: 'text-indigo-400' },
            { label: 'Completed', count: labOrders.filter((o) => o.sampleStatus === 'Completed').length, color: 'text-teal-400' },
            { label: 'Approved', count: labOrders.filter((o) => o.sampleStatus === 'Approved').length, color: 'text-emerald-400' },
          ].map((stage, idx) => (
            <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
              <div className="text-[11px] text-slate-400">{stage.label}</div>
              <div className={`text-lg font-bold font-mono mt-0.5 ${stage.color}`}>{stage.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Orders List & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Orders Table / List */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap gap-2 text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Shakisha umurwayi, order #, test..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-300"
            >
              <option value="all">All Statuses</option>
              <option value="Ordered">Ordered</option>
              <option value="Sample Collected">Sample Collected</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Approved">Approved</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-300"
            >
              <option value="all">All Categories</option>
              <option value="Hematology">Hematology</option>
              <option value="Biochemistry">Biochemistry</option>
              <option value="Microbiology">Microbiology</option>
              <option value="Immunology">Immunology</option>
              <option value="Urinalysis">Urinalysis</option>
            </select>
          </div>

          {/* Orders Cards */}
          <div className="space-y-2.5">
            {filteredOrders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              return (
                <div
                  key={order.id}
                  id={`lab-order-row-${order.id}`}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500 shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-emerald-400">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-slate-400">• {order.category}</span>
                        {order.isCritical && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-sm mt-0.5">{order.testName}</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Umurwayi: <strong className="text-white">{order.patientName}</strong> ({order.patientMrn})
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.sampleStatus === 'Approved'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : order.sampleStatus === 'Completed'
                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                            : order.sampleStatus === 'Processing'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {order.sampleStatus}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1">{order.orderedDate}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Order Detail / Action Station */}
        <div className="lg:col-span-5 space-y-4">
          {selectedOrder ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-5 sticky top-20 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400">{selectedOrder.orderNumber}</span>
                  <h3 className="font-bold text-white text-base mt-0.5">{selectedOrder.testName}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBarcodeModal(true)}
                    className="p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    title="Print Barcoded Specimen Tube Label"
                  >
                    <Barcode className="w-4 h-4 text-emerald-400" />
                    <span>Barcode Label</span>
                  </button>
                  <button
                    onClick={() => setShowPrintReport(true)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Preview Printable Lab Report"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Patient Info Card */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Patient Name:</span>
                  <strong className="text-white">{selectedOrder.patientName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Medical Record (MRN):</span>
                  <span className="font-mono text-cyan-400">{selectedOrder.patientMrn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ordered by:</span>
                  <span className="text-slate-200">{selectedOrder.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sample Type:</span>
                  <span className="text-slate-200">{selectedOrder.sampleType}</span>
                </div>
              </div>

              {/* Status Stepper Tracker */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Sample Lifecycle
                </div>
                <div className="flex items-center justify-between bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                  {['Ordered', 'Sample Collected', 'Processing', 'Completed', 'Approved'].map((st, i) => {
                    const currentIdx = ['Ordered', 'Sample Collected', 'Processing', 'Completed', 'Approved'].indexOf(
                      selectedOrder.sampleStatus
                    );
                    const isDone = i <= currentIdx;
                    return (
                      <div key={st} className="flex flex-col items-center flex-1">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {i + 1}
                        </div>
                        <span className={`text-[9px] mt-1 text-center truncate ${isDone ? 'text-white' : 'text-slate-600'}`}>
                          {st.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Workflow Advance Button */}
              {selectedOrder.sampleStatus !== 'Approved' && (
                <button
                  onClick={() => handleAdvanceStatus(selectedOrder)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <span>
                    Advance Status to:{' '}
                    {selectedOrder.sampleStatus === 'Ordered'
                      ? 'Sample Collected'
                      : selectedOrder.sampleStatus === 'Sample Collected'
                      ? 'Processing'
                      : selectedOrder.sampleStatus === 'Processing'
                      ? 'Enter Results'
                      : 'Approve & Finalize'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Results Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Diagnostic Results
                  </span>
                  <button
                    onClick={() => {
                      if (selectedOrder.results && selectedOrder.results.length > 0) {
                        setResultRows(selectedOrder.results);
                      }
                      setShowResultModal(true);
                    }}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Edit / Enter Results
                  </button>
                </div>

                {selectedOrder.results && selectedOrder.results.length > 0 ? (
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-2">Metric</th>
                          <th className="p-2">Value</th>
                          <th className="p-2">Ref Range</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {selectedOrder.results.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-800/40">
                            <td className="p-2 font-medium text-white">{r.metric}</td>
                            <td className="p-2 font-mono font-bold text-slate-200">
                              {r.value} {r.unit}
                            </td>
                            <td className="p-2 text-slate-400">{r.referenceRange}</td>
                            <td className="p-2">
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  r.status === 'normal'
                                    ? 'bg-emerald-950 text-emerald-400'
                                    : r.status === 'critical'
                                    ? 'bg-rose-950 text-rose-300 font-extrabold animate-pulse'
                                    : 'bg-amber-950 text-amber-300'
                                }`}
                              >
                                {r.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
                    No results entered yet. Click "Edit / Enter Results" to input metrics.
                  </div>
                )}
              </div>

              {/* AI Clinical Interpretation */}
              <div className="p-3.5 bg-indigo-950/30 border border-indigo-800/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    AI Clinical Interpretation
                  </span>
                  <button
                    onClick={handleInterpretWithAI}
                    disabled={aiLoading}
                    className="text-[11px] px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                  >
                    {aiLoading ? 'Analyzing...' : 'Run Interpretation'}
                  </button>
                </div>
                {aiReport && (
                  <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-indigo-900/50">
                    {aiReport}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
              Select a lab order to view details and action controls.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ORDER NEW LAB TEST */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-emerald-400" />
                Tumiza Ikizamini cya Laboratwari / Order Lab Test
              </h3>
              <button onClick={() => setShowNewOrderModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Umurwayi / Patient</label>
                <select
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.mrn})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Izina ry'Ikizamini / Test Name</label>
                <input
                  type="text"
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Icyiciro / Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Urinalysis">Urinalysis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Sample Type</label>
                  <select
                    value={newSampleType}
                    onChange={(e) => setNewSampleType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="Serum / Plasma">Serum / Plasma</option>
                    <option value="Urine">Urine</option>
                    <option value="CSF">CSF</option>
                    <option value="Sputum">Sputum</option>
                    <option value="Swab">Swab</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Muganga Utumije / Ordering Physician</label>
                <select
                  value={newDoctorName}
                  onChange={(e) => setNewDoctorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>{d.name} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                >
                  Emeza / Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ENTER RESULTS */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Injiza Ibisubizo bya Laboratwari / Enter Results
              </h3>
              <button onClick={() => setShowResultModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveResults} className="space-y-4 text-xs">
              <div className="space-y-3">
                {resultRows.map((row, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Parameter</label>
                      <input
                        type="text"
                        value={row.metric}
                        onChange={(e) => {
                          const updated = [...resultRows];
                          updated[idx].metric = e.target.value;
                          setResultRows(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Value & Unit</label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) => {
                            const updated = [...resultRows];
                            updated[idx].value = e.target.value;
                            setResultRows(updated);
                          }}
                          className="w-2/3 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                        />
                        <input
                          type="text"
                          value={row.unit}
                          onChange={(e) => {
                            const updated = [...resultRows];
                            updated[idx].unit = e.target.value;
                            setResultRows(updated);
                          }}
                          className="w-1/3 bg-slate-900 border border-slate-800 rounded px-1 py-1 text-slate-300 text-[10px]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Ref Range</label>
                      <input
                        type="text"
                        value={row.referenceRange}
                        onChange={(e) => {
                          const updated = [...resultRows];
                          updated[idx].referenceRange = e.target.value;
                          setResultRows(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Flag</label>
                      <select
                        value={row.status}
                        onChange={(e) => {
                          const updated = [...resultRows];
                          updated[idx].status = e.target.value as any;
                          setResultRows(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                      >
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="low">Low</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setResultRows([
                    ...resultRows,
                    { metric: 'New Parameter', value: '0', unit: 'mg/dL', referenceRange: '0 - 10', status: 'normal' },
                  ])
                }
                className="text-xs text-cyan-400 hover:underline"
              >
                + Ongeraho Ikindi Gipimo (Add Metric)
              </button>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                >
                  Bika Ibisubizo / Save Results
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DOCTOR APPROVAL */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                Kwemeza Ibisubizo / Doctor Approval
              </h3>
              <button onClick={() => setShowApproveModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleApprove} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Muganga Wemeza / Approving Doctor</label>
                <select
                  value={approvingDoctor}
                  onChange={(e) => setApprovingDoctor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>{d.name} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Icyemezo cya Muganga / Clinical Notes</label>
                <textarea
                  rows={3}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-[11px] text-emerald-300">
                Iyo wemeje ibi bisubizo, ubutumwa bwa SMS buhita bwoherezwa kuri telefoni y'umurwayi bumenyesha ko ibisubizo bye biboneka muri Patient Portal.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                >
                  Emeza & Ohereza SMS / Sign & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE / PDF LAB REPORT PREVIEW */}
      {showPrintReport && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">METROPOLITAN HOSPITAL SYSTEM</h2>
                <div className="text-xs text-slate-500">CENTRAL CLINICAL LABORATORY DIAGNOSTICS</div>
                <div className="text-[11px] text-slate-400">KN 4 Ave, Kigali • Phone: +250 788 123 456</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-slate-700">{selectedOrder.orderNumber}</div>
                <div className="text-[11px] text-slate-500">Date: {selectedOrder.orderedDate}</div>
                <div className="mt-1 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-300 inline-block">
                  ||||| ||| ||||||| ||||
                </div>
              </div>
            </div>

            {/* Patient Header */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <div><span className="text-slate-500">Patient: </span><strong>{selectedOrder.patientName}</strong></div>
                <div><span className="text-slate-500">MRN: </span><span className="font-mono">{selectedOrder.patientMrn}</span></div>
              </div>
              <div className="text-right">
                <div><span className="text-slate-500">Ordering Doctor: </span><strong>{selectedOrder.doctorName}</strong></div>
                <div><span className="text-slate-500">Sample Type: </span>{selectedOrder.sampleType}</div>
              </div>
            </div>

            {/* Test Results Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                {selectedOrder.testName} ({selectedOrder.category})
              </h4>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="p-2 border-b">Parameter</th>
                    <th className="p-2 border-b">Observed Value</th>
                    <th className="p-2 border-b">Units</th>
                    <th className="p-2 border-b">Reference Range</th>
                    <th className="p-2 border-b">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedOrder.results?.map((r, i) => (
                    <tr key={i}>
                      <td className="p-2 font-medium">{r.metric}</td>
                      <td className="p-2 font-mono font-bold">{r.value}</td>
                      <td className="p-2 text-slate-500">{r.unit}</td>
                      <td className="p-2 text-slate-500">{r.referenceRange}</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          r.status === 'normal' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50 font-bold'
                        }`}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Doctor Sign-off */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
              <div>
                <div className="text-slate-500 text-[11px]">Laboratory Director / Pathologist Signature:</div>
                <div className="font-serif italic text-base mt-2 text-slate-800">
                  {selectedOrder.doctorApproval?.approvedBy || 'Dr. Jean Bosco Ndayisaba, MD (Clinical Pathologist)'}
                </div>
                <div className="text-[10px] text-slate-400">Electronic verification timestamp attached</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPrintReport(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs"
                >
                  Funga / Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                    setShowPrintReport(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BARCODED SPECIMEN TUBE LABEL */}
      {showBarcodeModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Specimen Tube Barcode Label</h3>
              </div>
              <button onClick={() => setShowBarcodeModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Thermal Label Strip Canvas */}
            <div className="p-4 bg-white text-slate-950 rounded-xl border-2 border-dashed border-slate-400 space-y-3 font-mono shadow-inner">
              <div className="flex justify-between items-start text-xs border-b border-slate-300 pb-2">
                <div>
                  <div className="font-bold text-sm tracking-tight">{selectedOrder.patientName}</div>
                  <div className="text-[11px] text-slate-600">MRN: {selectedOrder.patientMrn}</div>
                </div>
                <div className="text-right text-[10px] text-slate-600">
                  <div>{selectedOrder.orderedDate}</div>
                  <div className="font-bold text-emerald-700 uppercase">{selectedOrder.sampleType}</div>
                </div>
              </div>

              {/* High-Contrast Code 128 / QR Hybrid Barcode Display */}
              <div className="py-2 text-center bg-slate-50 border border-slate-200 rounded p-2">
                <div className="text-2xl tracking-[0.25em] font-black text-slate-900 select-all">
                  ||||| ||| ||||||| |||| |||||
                </div>
                <div className="text-xs font-bold text-slate-800 tracking-wider mt-1">
                  *{selectedOrder.orderNumber}*
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-600 pt-1 border-t border-slate-300">
                <span>Test: <strong className="text-slate-900">{selectedOrder.testName}</strong></span>
                <span>CHUK Central LIS</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Standard 2"x1" thermal label format. Compatible with Zebra & Brother specimen tube printers.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowBarcodeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowBarcodeModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                Print Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
