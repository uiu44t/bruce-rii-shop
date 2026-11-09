import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  FileScan,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Contrast,
  Upload,
  User,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  Eye,
  Filter,
  Search,
} from 'lucide-react';
import { RadiologyOrder } from '../types';

export const RadiologyView: React.FC = () => {
  const {
    radiologyOrders,
    patients,
    doctors,
    createRadiologyOrder,
    submitRadiologyReport,
    addToast,
    logAuditEvent,
  } = useHospital();

  const [selectedOrder, setSelectedOrder] = useState<RadiologyOrder | null>(radiologyOrders[0] || null);
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Image viewer state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);

  // New Request Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [modality, setModality] = useState<RadiologyOrder['modality']>('X-Ray');
  const [bodyPart, setBodyPart] = useState('Chest (PA & Lateral)');
  const [urgency, setUrgency] = useState<RadiologyOrder['urgency']>('Urgent');
  const [doctorName, setDoctorName] = useState(doctors[0]?.name || '');

  // Report Entry Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [radiologistName, setRadiologistName] = useState('Dr. Marcus Aurelius, MD (Radiology)');
  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const filteredOrders = radiologyOrders.filter((o) => {
    const matchesSearch =
      o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.bodyPart.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModality = modalityFilter === 'all' || o.modality === modalityFilter;
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesModality && matchesStatus;
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId) || patients[0];
    const created = createRadiologyOrder({
      patientId: patient.id,
      patientName: patient.name,
      patientMrn: patient.mrn,
      doctorName,
      modality,
      bodyPart,
      urgency,
      branchId: patient.branchId || 'branch-kigali',
    });
    setSelectedOrder(created);
    setShowNewModal(false);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    submitRadiologyReport(selectedOrder.id, {
      radiologistName,
      findings,
      impression,
      recommendations: recommendation,
    });
    setSelectedOrder((prev) =>
      prev
        ? {
            ...prev,
            status: 'Reported',
            radiologistName,
            findings,
            impression,
            recommendations: recommendation,
            imageUrl:
              imageUrl ||
              prev.imageUrl ||
              'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
          }
        : null
    );
    setShowReportModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <FileScan className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Radiology & Diagnostic Imaging (PACS)
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  DICOM Compliant
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                X-Ray, CT Scan, MRI, Ultrasound • Radiologist Reports • High-Definition Digital Viewer
              </p>
            </div>
          </div>

          <button
            id="btn-new-imaging-order"
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Tumiza Icyuma / New Imaging Request
          </button>
        </div>

        {/* Modality Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800 text-xs">
          {(['X-Ray', 'CT Scan', 'MRI', 'Ultrasound'] as const).map((mod) => (
            <div key={mod} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
              <div className="text-[11px] text-slate-400">{mod}</div>
              <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
                {radiologyOrders.filter((r) => r.modality === mod).length}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Orders List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap gap-2 text-xs">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Shakisha imaging order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-300"
            >
              <option value="all">All Modalities</option>
              <option value="X-Ray">X-Ray</option>
              <option value="CT Scan">CT Scan</option>
              <option value="MRI">MRI</option>
              <option value="Ultrasound">Ultrasound</option>
            </select>
          </div>

          <div className="space-y-2.5">
            {filteredOrders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              return (
                <div
                  key={order.id}
                  id={`radiology-order-${order.id}`}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-950/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">{order.orderNumber}</span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {order.modality}
                        </span>
                        {order.urgency === 'Emergency STAT' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                            STAT
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-sm mt-1">{order.bodyPart}</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Umurwayi: <strong className="text-white">{order.patientName}</strong> ({order.patientMrn})
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'Reported'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : order.status === 'Completed'
                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1">{order.requestedDate}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: PACS Viewer & Radiologist Report */}
        <div className="lg:col-span-7 space-y-4">
          {selectedOrder ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">{selectedOrder.orderNumber}</span>
                    <span className="text-xs text-slate-400">• {selectedOrder.modality}</span>
                  </div>
                  <h3 className="font-bold text-white text-lg mt-0.5">{selectedOrder.bodyPart}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedOrder.findings) {
                        setFindings(selectedOrder.findings);
                        setImpression(selectedOrder.impression || '');
                        setRecommendation(selectedOrder.recommendations || '');
                      }
                      setShowReportModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{selectedOrder.status === 'Reported' ? 'Edit Report' : 'Submit Report'}</span>
                  </button>
                </div>
              </div>

              {/* Clinical Indication */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1.5">
                <div className="text-slate-400 flex justify-between text-[11px]">
                  <span>Ordering Physician: <strong className="text-white">{selectedOrder.doctorName}</strong></span>
                  <span>Patient: <strong className="text-white">{selectedOrder.patientName}</strong> ({selectedOrder.patientMrn})</span>
                </div>
                <div className="text-slate-400 flex justify-between text-[11px]">
                  <span>Urgency: <strong className={selectedOrder.urgency === 'Emergency STAT' ? 'text-rose-400 font-bold' : 'text-slate-200'}>{selectedOrder.urgency}</strong></span>
                  <span>Requested: <strong className="text-slate-200">{selectedOrder.requestedDate}</strong></span>
                </div>
              </div>

              {/* DICOM PACS IMAGE VIEWER */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    Diagnostic Digital Imaging Stage
                  </span>
                  {/* Controls Toolbar */}
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.2))}
                      className="p-1 hover:text-white"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono px-1">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                      className="p-1 hover:text-white"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="p-1 hover:text-white ml-1"
                      title="Rotate 90deg"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setZoomLevel(1);
                        setRotation(0);
                        setBrightness(100);
                        setContrast(100);
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 ml-1"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Viewport Canvas */}
                <div className="relative w-full h-80 bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center select-none">
                  {selectedOrder.imageUrl ? (
                    <img
                      src={selectedOrder.imageUrl}
                      alt={selectedOrder.bodyPart}
                      className="max-h-full max-w-full object-contain transition-transform duration-150"
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                      }}
                    />
                  ) : (
                    <div className="text-center text-slate-600 text-xs">
                      <FileScan className="w-12 h-12 mx-auto mb-2 text-slate-700" />
                      Scan acquisition in progress in Imaging Suite B.
                    </div>
                  )}

                  {/* Anatomical Orientation Marker */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[10px] font-mono text-cyan-400 border border-cyan-800/40">
                    R | SUP | 120kVp
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[10px] font-mono text-slate-400 border border-slate-800">
                    {selectedOrder.modality} • {selectedOrder.bodyPart}
                  </div>
                </div>
              </div>

              {/* RADIOLOGIST REPORT SECTION */}
              {selectedOrder.findings ? (
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Official Radiologist Findings
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      By {selectedOrder.radiologistName || 'Radiologist'} {selectedOrder.completedDate ? `at ${selectedOrder.completedDate}` : ''}
                    </span>
                  </div>

                  <div>
                    <div className="font-semibold text-cyan-300 text-[11px] uppercase tracking-wider">Findings:</div>
                    <p className="text-slate-300 mt-1 leading-relaxed">{selectedOrder.findings}</p>
                  </div>

                  {selectedOrder.impression && (
                    <div>
                      <div className="font-semibold text-cyan-300 text-[11px] uppercase tracking-wider">Impression:</div>
                      <p className="text-slate-200 mt-1 font-medium leading-relaxed">
                        {selectedOrder.impression}
                      </p>
                    </div>
                  )}

                  {selectedOrder.recommendations && (
                    <div>
                      <div className="font-semibold text-cyan-300 text-[11px] uppercase tracking-wider">
                        Recommendation:
                      </div>
                      <p className="text-slate-300 mt-1 leading-relaxed">
                        {selectedOrder.recommendations}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
                  No radiologist report attached yet. Click "Submit Report" above to enter findings.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
              Select an imaging request to view the digital scan and official radiologist findings.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: NEW IMAGING REQUEST */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileScan className="w-5 h-5 text-cyan-400" />
                Tumiza Icyuma / New Imaging Request
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Umurwayi / Patient</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.mrn})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Modality</label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="X-Ray">X-Ray</option>
                    <option value="CT Scan">CT Scan</option>
                    <option value="MRI">MRI</option>
                    <option value="Ultrasound">Ultrasound</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Urgency / Priority</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency STAT">Emergency STAT (Code Red)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Muganga Utumije / Ordering Physician</label>
                <select
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Igice cy'Umubiri / Body Part / Region</label>
                <input
                  type="text"
                  value={bodyPart}
                  onChange={(e) => setBodyPart(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  placeholder="e.g. Chest (PA & Lateral), Brain with Contrast..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold"
                >
                  Tumiza / Request Scan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT RADIOLOGY REPORT */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                Injiza Raporo ya Radiologiste / Submit Radiologist Report
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Radiologist Name</label>
                <input
                  type="text"
                  value={radiologistName}
                  onChange={(e) => setRadiologistName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Scan Image URL (or sample scan)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or leave blank for sample scan"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ibyabonetse / Findings</label>
                <textarea
                  rows={3}
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="Sobanura ibyo wabonye ku ifoto..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Impression / Final Diagnosis</label>
                <input
                  type="text"
                  value={impression}
                  onChange={(e) => setImpression(e.target.value)}
                  placeholder="Impression..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Inama / Recommendation</label>
                <input
                  type="text"
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  placeholder="Recommendation..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Bika Raporo / Save & Link to Patient EMR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
