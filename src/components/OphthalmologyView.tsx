import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { OphthalmologyRecord, EyeRefraction } from '../types';
import { INITIAL_OPHTHALMOLOGY_RECORDS } from '../data/mockHospitalEnterprise';
import {
  Eye,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Sparkles,
  Glasses,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Clock,
  User,
  X,
  Stethoscope,
} from 'lucide-react';

export const OphthalmologyView: React.FC = () => {
  const { patients, addToast, logAuditEvent } = useHospital();

  const [records, setRecords] = useState<OphthalmologyRecord[]>(() => {
    const saved = localStorage.getItem('hospital_ophthalmology_records_v1');
    return saved ? JSON.parse(saved) : INITIAL_OPHTHALMOLOGY_RECORDS;
  });

  const [selectedRecord, setSelectedRecord] = useState<OphthalmologyRecord>(records[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewExamModal, setShowNewExamModal] = useState(false);
  const [showRxPrintModal, setShowRxPrintModal] = useState(false);

  // New Exam Form State
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [optometristName, setOptometristName] = useState('Dr. Fabrice Kayitare (Ophthalmologist)');
  const [odUnaided, setOdUnaided] = useState('20/60');
  const [osUnaided, setOsUnaided] = useState('20/60');
  const [ouUnaided, setOuUnaided] = useState('20/50');
  const [odCorrected, setOdCorrected] = useState('20/20');
  const [osCorrected, setOsCorrected] = useState('20/20');
  const [ouCorrected, setOuCorrected] = useState('20/15');

  // Refraction State
  const [odSph, setOdSph] = useState(-1.50);
  const [odCyl, setOdCyl] = useState(-0.50);
  const [odAxis, setOdAxis] = useState(180);
  const [odAdd, setOdAdd] = useState(0);

  const [osSph, setOsSph] = useState(-1.75);
  const [osCyl, setOsCyl] = useState(-0.50);
  const [osAxis, setOsAxis] = useState(175);
  const [osAdd, setOsAdd] = useState(0);

  const [pdMm, setPdMm] = useState(63);

  // IOP State
  const [odIop, setOdIop] = useState(16);
  const [osIop, setOsIop] = useState(17);
  const [iopMethod, setIopMethod] = useState<'Goldmann Applanation' | 'Non-Contact Tonometer (Air-Puff)' | 'Tono-Pen'>('Goldmann Applanation');

  // Clinical findings
  const [diagnosis, setDiagnosis] = useState('Compound Myopic Astigmatism');
  const [lensStatus, setLensStatus] = useState<'Clear' | 'Early Nuclear Sclerosis' | 'Cortical Cataract' | 'Pseudophakic (IOL)'>('Clear');
  const [cdrOd, setCdrOd] = useState(0.35);
  const [cdrOs, setCdrOs] = useState(0.35);
  const [eyeglassNotes, setEyeglassNotes] = useState('Single vision anti-reflective polycarbonate lenses');
  const [drops, setDrops] = useState('Lubricant eye drops PRN');

  const filteredRecords = records.filter((r) => {
    return (
      r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.patientMrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.primaryDiagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === patientId) || patients[0];
    const glaucomaAlert = odIop > 21 || osIop > 21 || cdrOd >= 0.6 || cdrOs >= 0.6;

    const newRecord: OphthalmologyRecord = {
      id: `oph-${Date.now()}`,
      patientId: pat.id,
      patientName: pat.name,
      patientMrn: pat.mrn,
      examinationDate: new Date().toISOString().split('T')[0],
      optometristName,
      visualAcuity: {
        odUnaided,
        osUnaided,
        ouUnaided,
        odCorrected,
        osCorrected,
        ouCorrected,
        pinholeOd: '20/25',
        pinholeOs: '20/25',
      },
      refraction: {
        od: { sphere: odSph, cylinder: odCyl, axis: odAxis, add: odAdd },
        os: { sphere: osSph, cylinder: osCyl, axis: osAxis, add: osAdd },
        pupillaryDistanceMm: pdMm,
      },
      intraocularPressure: {
        odMmHg: odIop,
        osMmHg: osIop,
        method: iopMethod,
        timeRecorded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        glaucomaRiskAlert: glaucomaAlert,
      },
      anteriorSegment: {
        cornea: 'Clear, healthy endothelial reflex',
        anteriorChamber: 'Quiet, deep angles',
        lensStatus,
        iris: 'Normal pattern, brisk pupillary response',
      },
      fundusExamination: {
        cupToDiscRatioOd: cdrOd,
        cupToDiscRatioOs: cdrOs,
        macula: 'Healthy fovea reflex',
        retinalVessels: 'Normal A/V ratio',
        periphery: 'Flat, attached retina',
      },
      primaryDiagnosis: diagnosis,
      eyeglassPrescriptionIssued: true,
      eyeglassNotes,
      medicatedEyeDrops: drops,
      followUpWeeks: glaucomaAlert ? 4 : 52,
      branchId: 'branch-kigali',
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    localStorage.setItem('hospital_ophthalmology_records_v1', JSON.stringify(updated));
    setSelectedRecord(newRecord);
    setShowNewExamModal(false);

    logAuditEvent({
      user: optometristName,
      action: 'OPHTHALMOLOGY_EXAM_RECORDED',
      details: `Comprehensive vision and refraction examination completed for ${pat.name} (${pat.mrn})`,
    });

    addToast({
      type: 'success',
      title: 'Vision Examination Saved',
      message: `Visual acuity & refraction chart stored for ${pat.name}.`,
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Eye className="w-64 h-64 text-cyan-400" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-cyan-900/30 shrink-0">
              <Eye className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Ophthalmology & Vision Care Suite
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  OD / OS Refraction
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Visual acuity recording (OD/OS/OU), refraction charting, Goldmann tonometry (IOP), and digital eyeglass prescriptions.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowNewExamModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-900/40 transition-all self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Eye Examination
          </button>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
            <div className="text-[11px] text-slate-400">Total Eye Exams</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5">{records.length}</div>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
            <div className="text-[11px] text-slate-400">Eyeglass Rx Issued</div>
            <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
              {records.filter((r) => r.eyeglassPrescriptionIssued).length}
            </div>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
            <div className="text-[11px] text-slate-400">Glaucoma / High IOP Alerts</div>
            <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">
              {records.filter((r) => r.intraocularPressure?.glaucomaRiskAlert).length} Elevated
            </div>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
            <div className="text-[11px] text-slate-400">Normal 20/20 Corrected</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              {records.filter((r) => r.visualAcuity?.odCorrected === '20/20' && r.visualAcuity?.osCorrected === '20/20').length} Patients
            </div>
          </div>
        </div>
      </div>

      {/* Main Examination & Patient Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Records List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, MRN, diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredRecords.map((rec) => {
              const isSelected = selectedRecord?.id === rec.id;
              const hasGlaucoma = rec.intraocularPressure?.glaucomaRiskAlert;

              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/80 shadow-md shadow-cyan-950/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{rec.patientName}</h4>
                      <div className="text-[11px] font-mono text-cyan-400">{rec.patientMrn}</div>
                    </div>
                    {hasGlaucoma ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                        High IOP
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Exam OK
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-slate-300 line-clamp-1">{rec.primaryDiagnosis}</div>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>OD: {rec.refraction?.od?.sphere > 0 ? `+${rec.refraction?.od?.sphere}` : rec.refraction?.od?.sphere}</span>
                    <span>OS: {rec.refraction?.os?.sphere > 0 ? `+${rec.refraction?.os?.sphere}` : rec.refraction?.os?.sphere}</span>
                    <span className="font-mono text-[10px]">{rec.examinationDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected Patient Optical Chart */}
        <div className="lg:col-span-8">
          {selectedRecord ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 space-y-6 shadow-xl">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedRecord.patientName}</h3>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                      {selectedRecord.patientMrn}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Examined by {selectedRecord.optometristName} on {selectedRecord.examinationDate}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRxPrintModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 border border-slate-700 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5 text-cyan-400" />
                    Print Eyeglass Rx
                  </button>
                </div>
              </div>

              {/* 1. Visual Acuity Charting (OD / OS / OU) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    1. Visual Acuity (Snellen Scale)
                  </h4>
                  <span className="text-[10px] text-slate-400">OD = Oculus Dexter (Right) • OS = Oculus Sinister (Left)</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Right Eye (OD)</span>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Unaided:</span>
                      <strong className="font-mono text-white text-sm">{selectedRecord.visualAcuity?.odUnaided}</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Corrected:</span>
                      <strong className="font-mono text-emerald-400 text-sm">{selectedRecord.visualAcuity?.odCorrected}</strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Left Eye (OS)</span>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Unaided:</span>
                      <strong className="font-mono text-white text-sm">{selectedRecord.visualAcuity?.osUnaided}</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Corrected:</span>
                      <strong className="font-mono text-emerald-400 text-sm">{selectedRecord.visualAcuity?.osCorrected}</strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Binocular (OU)</span>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Unaided:</span>
                      <strong className="font-mono text-white text-sm">{selectedRecord.visualAcuity?.ouUnaided}</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Corrected:</span>
                      <strong className="font-mono text-emerald-400 text-sm">{selectedRecord.visualAcuity?.ouCorrected}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Refraction Charting Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Glasses className="w-4 h-4 text-cyan-400" />
                    2. Objective & Subjective Refraction
                  </h4>
                  <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                    PD: {selectedRecord.refraction?.pupillaryDistanceMm || 63} mm
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Eye</th>
                        <th className="p-3">Sphere (SPH)</th>
                        <th className="p-3">Cylinder (CYL)</th>
                        <th className="p-3">Axis (°)</th>
                        <th className="p-3">Near Add</th>
                        <th className="p-3">Prism</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-xs">
                      <tr>
                        <td className="p-3 font-sans font-bold text-slate-200">OD (Right Eye)</td>
                        <td className="p-3 text-cyan-300 font-bold">
                          {selectedRecord.refraction?.od?.sphere > 0 ? `+${selectedRecord.refraction?.od?.sphere.toFixed(2)}` : selectedRecord.refraction?.od?.sphere.toFixed(2)}
                        </td>
                        <td className="p-3 text-slate-300">{selectedRecord.refraction?.od?.cylinder.toFixed(2)}</td>
                        <td className="p-3 text-slate-300">{selectedRecord.refraction?.od?.axis}°</td>
                        <td className="p-3 text-slate-400">{selectedRecord.refraction?.od?.add ? `+${selectedRecord.refraction?.od?.add.toFixed(2)}` : '0.00'}</td>
                        <td className="p-3 text-slate-500">{selectedRecord.refraction?.od?.prism || '—'}</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-sans font-bold text-slate-200">OS (Left Eye)</td>
                        <td className="p-3 text-cyan-300 font-bold">
                          {selectedRecord.refraction?.os?.sphere > 0 ? `+${selectedRecord.refraction?.os?.sphere.toFixed(2)}` : selectedRecord.refraction?.os?.sphere.toFixed(2)}
                        </td>
                        <td className="p-3 text-slate-300">{selectedRecord.refraction?.os?.cylinder.toFixed(2)}</td>
                        <td className="p-3 text-slate-300">{selectedRecord.refraction?.os?.axis}°</td>
                        <td className="p-3 text-slate-400">{selectedRecord.refraction?.os?.add ? `+${selectedRecord.refraction?.os?.add.toFixed(2)}` : '0.00'}</td>
                        <td className="p-3 text-slate-500">{selectedRecord.refraction?.os?.prism || '—'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Tonometry & Intraocular Pressure (IOP) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-cyan-400" />
                    3. Intraocular Pressure (IOP) & Tonometry
                  </h4>
                  <span className="text-[10px] text-slate-400">Normal Range: 10 – 21 mmHg</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-4 rounded-2xl border ${selectedRecord.intraocularPressure?.odMmHg > 21 ? 'bg-rose-950/40 border-rose-600/60' : 'bg-slate-950/70 border-slate-800'}`}>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Right Eye (OD) Pressure</div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className={`text-2xl font-black font-mono ${selectedRecord.intraocularPressure?.odMmHg > 21 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {selectedRecord.intraocularPressure?.odMmHg}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">mmHg</span>
                    </div>
                    {selectedRecord.intraocularPressure?.odMmHg > 21 && (
                      <span className="text-[10px] font-bold text-rose-300 mt-1 block">⚠️ Ocular Hypertension</span>
                    )}
                  </div>

                  <div className={`p-4 rounded-2xl border ${selectedRecord.intraocularPressure?.osMmHg > 21 ? 'bg-rose-950/40 border-rose-600/60' : 'bg-slate-950/70 border-slate-800'}`}>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Left Eye (OS) Pressure</div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className={`text-2xl font-black font-mono ${selectedRecord.intraocularPressure?.osMmHg > 21 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {selectedRecord.intraocularPressure?.osMmHg}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">mmHg</span>
                    </div>
                    {selectedRecord.intraocularPressure?.osMmHg > 21 && (
                      <span className="text-[10px] font-bold text-rose-300 mt-1 block">⚠️ Ocular Hypertension</span>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Method & Protocol</span>
                    <div className="font-semibold text-slate-200">{selectedRecord.intraocularPressure?.method}</div>
                    <div className="text-[11px] text-slate-400">Timestamp: {selectedRecord.intraocularPressure?.timeRecorded}</div>
                  </div>
                </div>
              </div>

              {/* 4. Slit Lamp & Fundus Biomicroscopy */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  4. Slit Lamp & Fundus Examination
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Lens Status</span>
                    <span className="font-semibold text-white">{selectedRecord.anteriorSegment?.lensStatus}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Cup-to-Disc Ratio (C/D)</span>
                    <span className="font-mono font-bold text-cyan-300">
                      OD: {selectedRecord.fundusExamination?.cupToDiscRatioOd} • OS: {selectedRecord.fundusExamination?.cupToDiscRatioOs}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Cornea & Anterior Chamber</span>
                    <span className="text-slate-300 text-[11px]">{selectedRecord.anteriorSegment?.cornea}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Diagnosis: </span>
                  <strong className="text-white">{selectedRecord.primaryDiagnosis}</strong>
                  {selectedRecord.medicatedEyeDrops && (
                    <div className="text-[11px] text-cyan-300 mt-1">
                      Medication: {selectedRecord.medicatedEyeDrops}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 bg-slate-900 rounded-3xl border border-slate-800">
              Select an examination or click 'New Eye Examination' to begin.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: PRINTABLE EYEGLASS RX */}
      {showRxPrintModal && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white text-slate-950 rounded-3xl w-full max-w-xl p-8 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-300 pb-4">
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">METROPOLITAN HOSPITAL OPHTHALMOLOGY</h3>
                <div className="text-xs text-slate-600">DEPARTMENT OF VISION CARE & REFRACTIVE SURGERY</div>
                <div className="text-[11px] text-slate-400">KN 4 Ave, Kigali • Optical Clinic Wing</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-slate-700">RX-{selectedRecord.id.toUpperCase()}</div>
                <div className="text-[11px] text-slate-500">Date: {selectedRecord.examinationDate}</div>
              </div>
            </div>

            {/* Patient Bar */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
              <div>
                <span className="text-slate-500">Patient: </span>
                <strong className="text-slate-900">{selectedRecord.patientName}</strong>
              </div>
              <div>
                <span className="text-slate-500">MRN: </span>
                <span className="font-mono font-bold">{selectedRecord.patientMrn}</span>
              </div>
              <div>
                <span className="text-slate-500">PD: </span>
                <strong className="font-mono">{selectedRecord.refraction?.pupillaryDistanceMm || 63} mm</strong>
              </div>
            </div>

            {/* Prescription Table */}
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                <tr>
                  <th className="p-2.5 border-b border-slate-300">Eye</th>
                  <th className="p-2.5 border-b border-slate-300">Sphere</th>
                  <th className="p-2.5 border-b border-slate-300">Cylinder</th>
                  <th className="p-2.5 border-b border-slate-300">Axis</th>
                  <th className="p-2.5 border-b border-slate-300">Add</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                <tr>
                  <td className="p-2.5 font-sans font-bold">OD (Right Eye)</td>
                  <td className="p-2.5 font-bold">
                    {selectedRecord.refraction?.od?.sphere > 0 ? `+${selectedRecord.refraction?.od?.sphere.toFixed(2)}` : selectedRecord.refraction?.od?.sphere.toFixed(2)}
                  </td>
                  <td className="p-2.5">{selectedRecord.refraction?.od?.cylinder.toFixed(2)}</td>
                  <td className="p-2.5">{selectedRecord.refraction?.od?.axis}°</td>
                  <td className="p-2.5">{selectedRecord.refraction?.od?.add ? `+${selectedRecord.refraction?.od?.add.toFixed(2)}` : '—'}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-bold">OS (Left Eye)</td>
                  <td className="p-2.5 font-bold">
                    {selectedRecord.refraction?.os?.sphere > 0 ? `+${selectedRecord.refraction?.os?.sphere.toFixed(2)}` : selectedRecord.refraction?.os?.sphere.toFixed(2)}
                  </td>
                  <td className="p-2.5">{selectedRecord.refraction?.os?.cylinder.toFixed(2)}</td>
                  <td className="p-2.5">{selectedRecord.refraction?.os?.axis}°</td>
                  <td className="p-2.5">{selectedRecord.refraction?.os?.add ? `+${selectedRecord.refraction?.os?.add.toFixed(2)}` : '—'}</td>
                </tr>
              </tbody>
            </table>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">Lens Recommendations: </span>
              <span className="text-slate-900 font-semibold">{selectedRecord.eyeglassNotes || 'Anti-reflective polycarbonate lenses.'}</span>
            </div>

            {/* Doctor Signature */}
            <div className="pt-4 border-t border-slate-300 flex justify-between items-end text-xs">
              <div>
                <div className="text-[10px] text-slate-500">Authorized Optometrist / Ophthalmologist:</div>
                <div className="font-serif italic text-base font-bold text-slate-900 mt-1">
                  {selectedRecord.optometristName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">License: RW-MOH-OPT-9021</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowRxPrintModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                    setShowRxPrintModal(false);
                  }}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW EYE EXAMINATION */}
      {showNewExamModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 text-white shadow-2xl space-y-4 my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                Record New Comprehensive Eye Examination
              </h3>
              <button onClick={() => setShowNewExamModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Patient *</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.mrn})</option>
                  ))}
                </select>
              </div>

              {/* Visual Acuity */}
              <div className="p-3.5 bg-slate-850 rounded-2xl border border-slate-800 space-y-2">
                <div className="font-bold text-cyan-400 uppercase text-[11px]">Visual Acuity (Snellen)</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px]">OD Unaided</label>
                    <input
                      type="text"
                      value={odUnaided}
                      onChange={(e) => setOdUnaided(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px]">OS Unaided</label>
                    <input
                      type="text"
                      value={osUnaided}
                      onChange={(e) => setOsUnaided(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px]">OU Unaided</label>
                    <input
                      type="text"
                      value={ouUnaided}
                      onChange={(e) => setOuUnaided(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Refraction */}
              <div className="p-3.5 bg-slate-850 rounded-2xl border border-slate-800 space-y-2">
                <div className="font-bold text-cyan-400 uppercase text-[11px]">Refraction (Sphere / Cylinder / Axis)</div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px]">OD SPH</label>
                    <input
                      type="number"
                      step="0.25"
                      value={odSph}
                      onChange={(e) => setOdSph(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px]">OD CYL</label>
                    <input
                      type="number"
                      step="0.25"
                      value={odCyl}
                      onChange={(e) => setOdCyl(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px]">OD Axis (°)</label>
                    <input
                      type="number"
                      value={odAxis}
                      onChange={(e) => setOdAxis(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px]">PD (mm)</label>
                    <input
                      type="number"
                      value={pdMm}
                      onChange={(e) => setPdMm(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Intraocular Pressure */}
              <div className="p-3.5 bg-slate-850 rounded-2xl border border-slate-800 space-y-2">
                <div className="font-bold text-cyan-400 uppercase text-[11px]">Intraocular Pressure (Tonometry)</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px]">OD Pressure (mmHg)</label>
                    <input
                      type="number"
                      value={odIop}
                      onChange={(e) => setOdIop(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px]">OS Pressure (mmHg)</label>
                    <input
                      type="number"
                      value={osIop}
                      onChange={(e) => setOsIop(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px]">Method</label>
                    <select
                      value={iopMethod}
                      onChange={(e) => setIopMethod(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white"
                    >
                      <option value="Goldmann Applanation">Goldmann</option>
                      <option value="Non-Contact Tonometer (Air-Puff)">Air-Puff</option>
                      <option value="Tono-Pen">Tono-Pen</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Diagnosis and Notes */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Primary Diagnosis *</label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Compound Myopic Astigmatism"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Eyeglass Prescription & Lens Notes</label>
                <input
                  type="text"
                  value={eyeglassNotes}
                  onChange={(e) => setEyeglassNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewExamModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 text-white rounded-xl font-bold"
                >
                  Save & Issue Optical Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
