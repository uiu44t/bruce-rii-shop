import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { MaternityRecord, NewbornRecord } from '../types';
import { translations } from '../utils/translations';
import {
  Baby,
  Plus,
  Search,
  Heart,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  X,
  Stethoscope,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const MaternityView: React.FC = () => {
  const {
    maternityRecords,
    registerMaternityAdmission,
    recordDelivery,
    updateLabourStage,
    patients,
    language,
    addToast,
  } = useHospital();
  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [selectedMaternity, setSelectedMaternity] = useState<MaternityRecord | null>(null);
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [targetForDelivery, setTargetForDelivery] = useState<MaternityRecord | null>(null);

  // Admission Form State
  const [patientId, setPatientId] = useState('');
  const [gravida, setGravida] = useState(1);
  const [para, setPara] = useState(0);
  const [gestationalWeeks, setGestationalWeeks] = useState(39);
  const [edd, setEdd] = useState(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
  const [highRisk, setHighRisk] = useState(false);
  const [riskFactors, setRiskFactors] = useState('');

  // Delivery Form State
  const [deliveryMethod, setDeliveryMethod] = useState<'Spontaneous Vaginal Delivery (SVD)' | 'Cesarean Section' | 'Vacuum Extraction'>('Spontaneous Vaginal Delivery (SVD)');
  const [deliveryTime, setDeliveryTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [attendingDoctor, setAttendingDoctor] = useState('Dr. Alice Mukamana (Obstetrician)');
  const [attendingMidwife, setAttendingMidwife] = useState('Midwife Marie Claire');
  const [bloodLossMl, setBloodLossMl] = useState(250);
  const [placentaComplete, setPlacentaComplete] = useState(true);

  // Newborn Details
  const [babyGender, setBabyGender] = useState<'Male' | 'Female'>('Female');
  const [birthWeightKg, setBirthWeightKg] = useState(3.2);
  const [apgar1Min, setApgar1Min] = useState(9);
  const [apgar5Min, setApgar5Min] = useState(10);
  const [babyStatus, setBabyStatus] = useState<'Healthy Rooming-in' | 'Transferred to NICU'>('Healthy Rooming-in');
  const [nicuReason, setNicuReason] = useState('');

  const filteredRecords = maternityRecords.filter((rec) => {
    const pName = (rec.patientName || rec.motherName || '').toLowerCase();
    const pMrn = (rec.patientMrn || rec.motherMrn || '').toLowerCase();
    const matchesSearch =
      pName.includes(searchTerm.toLowerCase()) ||
      pMrn.includes(searchTerm.toLowerCase()) ||
      (rec.bedNumber && rec.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStage = filterStage === 'all' || rec.labourStage === filterStage;
    return matchesSearch && matchesStage;
  });

  const activeLabourCount = maternityRecords.filter(
    (r) => r.labourStage === 'first_stage' || r.labourStage === 'second_stage'
  ).length;
  const postPartumCount = maternityRecords.filter((r) => r.labourStage === 'postpartum').length;
  const nicuTransfers = maternityRecords.flatMap((r) => r.newborns).filter((b) => b.status === 'Transferred to NICU').length;

  const handleAdmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === patientId);
    if (!pat) return;

    registerMaternityAdmission({
      patientId: pat.id,
      patientName: pat.name,
      patientMrn: pat.mrn,
      admissionDate: new Date().toISOString().split('T')[0],
      gravida,
      para,
      gestationalWeeks,
      expectedDeliveryDate: edd,
      isHighRisk: highRisk,
      highRiskFactors: highRisk ? riskFactors.split(',').map((s) => s.trim()) : undefined,
      labourStage: 'latent_phase',
      newborns: [],
      bedNumber: 'L&D-Bed 02',
    });

    setShowAdmissionModal(false);
    setPatientId('');
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetForDelivery) return;

    const newborn: NewbornRecord = {
      babyId: `baby-${Date.now()}`,
      gender: babyGender,
      birthWeightKg,
      headCircumferenceCm: 34.5,
      apgar1Min,
      apgar5Min,
      timeOfBirth: deliveryTime,
      deliveryMethod,
      cryingAtBirth: true,
      vitaminKAdministered: true,
      eyeProphylaxisGiven: true,
      status: babyStatus,
      nicuReason: babyStatus === 'Transferred to NICU' ? nicuReason : undefined,
    };

    recordDelivery(
      targetForDelivery.id,
      {
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveryTime,
        deliveryMethod,
        bloodLossMl,
        placentaComplete,
        attendingDoctor,
        attendingMidwife,
      },
      newborn
    );

    setShowDeliveryModal(false);
    setTargetForDelivery(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Baby className="w-6 h-6 text-pink-400" />
            {t.maternity.maternityWard}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-950/80 text-pink-300 font-mono font-medium border border-pink-800">
              {maternityRecords.length} Mothers
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Antenatal monitoring (ANC), partograph labor progression, delivery documentation, APGAR scoring & NICU.
          </p>
        </div>

        <button
          onClick={() => setShowAdmissionModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-900/30 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t.maternity.registerMother}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Active Labour Suite</div>
          <div className="text-2xl font-bold text-pink-400 mt-1 font-mono">{activeLabourCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Partograph monitoring</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Post-Partum Ward</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{postPartumCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Mother & baby rooming-in</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">NICU Admissions</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{nicuTransfers}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Incubator observation</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Deliveries This Week</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">
            {maternityRecords.flatMap((r) => r.newborns).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Safe maternity rate: 100%</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search mother name, MRN, bed number..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {['all', 'latent_phase', 'first_stage', 'second_stage', 'postpartum'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStage(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                filterStage === st
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Maternity Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecords.map((mat) => (
          <div
            key={mat.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-pink-300 font-semibold border border-slate-700">
                      {mat.bedNumber || 'Maternity Triage'}
                    </span>
                    {mat.isHighRisk && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> High Risk
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white mt-1.5">{mat.patientName}</h3>
                  <div className="text-xs text-slate-400">
                    MRN: <span className="font-mono text-slate-300">{mat.patientMrn}</span> • G{mat.gravida}P{mat.para} •{' '}
                    {mat.gestationalWeeks}w
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                    mat.labourStage === 'second_stage'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                      : mat.labourStage === 'first_stage'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : mat.labourStage === 'postpartum'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-blue-950 text-blue-300 border border-blue-800'
                  }`}
                >
                  {mat.labourStage.replace('_', ' ')}
                </span>
              </div>

              {/* Partograph Snapshot */}
              {mat.partograph && mat.labourStage !== 'postpartum' && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Dilation</span>
                    <strong className="text-pink-300 text-sm">{mat.partograph.cervicalDilationCm} cm</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Fetal HR</span>
                    <strong className="text-emerald-300 text-sm">{mat.partograph.fetalHeartRateBpm} bpm</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Contractions</span>
                    <strong className="text-white text-sm">{mat.partograph.contractionsPer10Min}/10m</strong>
                  </div>
                </div>
              )}

              {/* Newborn Summary (if delivered) */}
              {mat.newborns && mat.newborns.length > 0 && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs space-y-1">
                  <div className="flex items-center justify-between text-emerald-300 font-bold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      Newborn ({mat.newborns[0].gender})
                    </span>
                    <span>APGAR: {mat.newborns[0].apgar1Min}/{mat.newborns[0].apgar5Min}</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Weight: {mat.newborns[0].birthWeightKg} kg • Status:{' '}
                    <span className={mat.newborns[0].status === 'Transferred to NICU' ? 'text-amber-400' : 'text-emerald-400'}>
                      {mat.newborns[0].status}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedMaternity(mat)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                ANC & History
              </button>

              <div className="flex items-center gap-1.5">
                {mat.labourStage === 'latent_phase' && (
                  <button
                    onClick={() => updateLabourStage(mat.id, 'first_stage')}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    Active Labour
                  </button>
                )}
                {mat.labourStage === 'first_stage' && (
                  <button
                    onClick={() => updateLabourStage(mat.id, 'second_stage')}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    Second Stage
                  </button>
                )}
                {mat.labourStage === 'second_stage' && (
                  <button
                    onClick={() => {
                      setTargetForDelivery(mat);
                      setShowDeliveryModal(true);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                  >
                    <Baby className="w-3.5 h-3.5" />
                    Record Birth
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ANC & Mother Clinical Details Modal */}
      {selectedMaternity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Baby className="w-5 h-5 text-pink-400" />
                  Maternity Clinical Dossier
                </h3>
                <div className="text-xs text-slate-400">
                  {selectedMaternity.patientName} ({selectedMaternity.patientMrn})
                </div>
              </div>
              <button onClick={() => setSelectedMaternity(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <span className="text-slate-500 block">Obstetric History</span>
                <div className="font-semibold text-white mt-1">
                  Gravida {selectedMaternity.gravida}, Para {selectedMaternity.para}
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">Gestational Age: {selectedMaternity.gestationalWeeks} Weeks</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <span className="text-slate-500 block">Estimated Due Date</span>
                <div className="font-semibold text-white mt-1">{selectedMaternity.expectedDeliveryDate}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Admitted: {selectedMaternity.admissionDate}</div>
              </div>
            </div>

            {selectedMaternity.isHighRisk && selectedMaternity.highRiskFactors && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-xs">
                <span className="font-bold text-rose-300 block mb-1">High-Risk Obstetric Alerts:</span>
                <ul className="list-disc pl-4 text-slate-300 space-y-0.5">
                  {selectedMaternity.highRiskFactors.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedMaternity.deliveryRecord && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-1">
                <span className="font-bold text-emerald-400 block">Delivery Summary:</span>
                <div>Method: <strong>{selectedMaternity.deliveryRecord.deliveryMethod}</strong></div>
                <div>Attending: {selectedMaternity.deliveryRecord.attendingDoctor} & {selectedMaternity.deliveryRecord.attendingMidwife}</div>
                <div>Estimated Blood Loss: {selectedMaternity.deliveryRecord.bloodLossMl} mL (Placenta Complete: {selectedMaternity.deliveryRecord.placentaComplete ? 'Yes' : 'No'})</div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedMaternity(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Birth Modal */}
      {showDeliveryModal && targetForDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl text-slate-100 space-y-4 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Baby className="w-5 h-5 text-emerald-400" />
                Record Safe Delivery & Newborn Examination
              </h3>
              <button onClick={() => setShowDeliveryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeliverySubmit} className="space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Delivery Method</label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Spontaneous Vaginal Delivery (SVD)">Spontaneous Vaginal Delivery (SVD)</option>
                  <option value="Cesarean Section">Cesarean Section (C-Section)</option>
                  <option value="Vacuum Extraction">Vacuum Assisted Delivery</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Baby Gender</label>
                  <select
                    value={babyGender}
                    onChange={(e) => setBabyGender(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Birth Weight (kg)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={birthWeightKg}
                    onChange={(e) => setBirthWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              {/* APGAR Scoring (1 min & 5 min) */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                <div className="text-xs font-bold text-slate-200">APGAR Score (Appearance, Pulse, Grimace, Activity, Respiration)</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">1-Minute APGAR (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={apgar1Min}
                      onChange={(e) => setApgar1Min(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">5-Minute APGAR (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={apgar5Min}
                      onChange={(e) => setApgar5Min(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Newborn Status & Ward Routing</label>
                <select
                  value={babyStatus}
                  onChange={(e) => setBabyStatus(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Healthy Rooming-in">Healthy Rooming-in with Mother</option>
                  <option value="Transferred to NICU">Transfer to Neonatal Intensive Care (NICU)</option>
                </select>
              </div>

              {babyStatus === 'Transferred to NICU' && (
                <div>
                  <label className="text-xs text-slate-300 block mb-1">NICU Indication</label>
                  <input
                    type="text"
                    value={nicuReason}
                    onChange={(e) => setNicuReason(e.target.value)}
                    placeholder="e.g. Respiratory distress / Prematurity / Low birth weight"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeliveryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Save Delivery & Discharge to Ward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Admission Modal */}
      {showAdmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Baby className="w-5 h-5 text-pink-400" />
                Register Mother for Maternity Admission
              </h3>
              <button onClick={() => setShowAdmissionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdmissionSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Select Patient *</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                >
                  <option value="">-- Choose Mother --</option>
                  {patients.filter((p) => p.gender === 'Female').map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.mrn}) - Age: {p.age}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Gravida</label>
                  <input
                    type="number"
                    min="1"
                    value={gravida}
                    onChange={(e) => setGravida(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Para</label>
                  <input
                    type="number"
                    min="0"
                    value={para}
                    onChange={(e) => setPara(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Weeks (GA)</label>
                  <input
                    type="number"
                    min="20"
                    max="43"
                    value={gestationalWeeks}
                    onChange={(e) => setGestationalWeeks(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="hrCheck"
                  checked={highRisk}
                  onChange={(e) => setHighRisk(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-pink-600"
                />
                <label htmlFor="hrCheck" className="text-xs text-slate-200">
                  Mark as High-Risk Pregnancy (Preeclampsia, previous C-section, etc.)
                </label>
              </div>

              {highRisk && (
                <div>
                  <label className="text-xs text-slate-300 block mb-1">High Risk Conditions (Comma separated)</label>
                  <input
                    type="text"
                    value={riskFactors}
                    onChange={(e) => setRiskFactors(e.target.value)}
                    placeholder="e.g. Mild preeclampsia, Gestational Diabetes, Rh negative"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdmissionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!patientId}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-50"
                >
                  Confirm Maternity Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
