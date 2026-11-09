import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Doctor } from '../types';
import {
  UserCheck,
  Stethoscope,
  Phone,
  Mail,
  Clock,
  Search,
  Filter,
  Users,
  Fingerprint,
  Camera,
  DollarSign,
  Receipt,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';

interface AttendancePunch {
  id: string;
  doctorName: string;
  role: string;
  department: string;
  punchTime: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT';
  method: 'FINGERPRINT_BIOMETRICS' | 'FACIAL_RECOGNITION_AI';
  terminalId: string;
  confidenceScore: number;
}

export const StaffView: React.FC = () => {
  const { doctors, toggleDoctorStatus, patients, surgeries, branches, addToast, logAuditEvent } = useHospital();

  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'timeclock' | 'payroll' | 'transfers'>('roster');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Biometric Terminal State
  const [isScanningBiometric, setIsScanningBiometric] = useState(false);
  const [scanType, setScanType] = useState<'FINGERPRINT' | 'FACIAL'>('FINGERPRINT');
  const [selectedStaffForClock, setSelectedStaffForClock] = useState(doctors[0]?.name || 'Dr. Christian Hakizimana');
  const [attendancePunches, setAttendancePunches] = useState<AttendancePunch[]>([
    {
      id: 'att-1',
      doctorName: 'Dr. Christian Hakizimana',
      role: 'Chief Medical Officer',
      department: 'Cardiology',
      punchTime: '06:58 AM (Today)',
      type: 'CLOCK_IN',
      method: 'FACIAL_RECOGNITION_AI',
      terminalId: 'BIO-TERMINAL-01-ENTRANCE',
      confidenceScore: 99.8,
    },
    {
      id: 'att-2',
      doctorName: 'Dr. Patrick Mugisha',
      role: 'Oral & Maxillofacial Surgeon',
      department: 'Dental Surgery',
      punchTime: '07:15 AM (Today)',
      type: 'CLOCK_IN',
      method: 'FINGERPRINT_BIOMETRICS',
      terminalId: 'BIO-TERMINAL-02-SURGICAL-SUITE',
      confidenceScore: 99.4,
    },
    {
      id: 'att-3',
      doctorName: 'Dr. Sarah Jenkins',
      role: 'Clinical Pathologist',
      department: 'Laboratory & Pathology',
      punchTime: '07:22 AM (Today)',
      type: 'CLOCK_IN',
      method: 'FACIAL_RECOGNITION_AI',
      terminalId: 'BIO-TERMINAL-03-LAB-AIRLOCK',
      confidenceScore: 99.6,
    },
  ]);

  // Selected Doctor for Payslip Modal
  const [selectedDocForPayslip, setSelectedDocForPayslip] = useState<any | null>(null);

  // Inter-facility staff transfer state
  const [transferDocName, setTransferDocName] = useState(doctors[0]?.name || '');
  const [targetBranch, setTargetBranch] = useState('branch-butare');
  const [transferReason, setTransferReason] = useState('Emergency specialist surgical coverage');
  const [transferDuration, setTransferDuration] = useState('2 Weeks Temporary Assignment');

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'all' || doc.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set(doctors.map((d) => d.department)));

  // Simulate Biometric Terminal Punch
  const handleBiometricPunch = () => {
    setIsScanningBiometric(true);
    setTimeout(() => {
      setIsScanningBiometric(false);
      const newPunch: AttendancePunch = {
        id: `att-${Date.now()}`,
        doctorName: selectedStaffForClock,
        role: 'Attending Physician',
        department: doctors.find((d) => d.name === selectedStaffForClock)?.department || 'Clinical Services',
        punchTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Now)',
        type: 'CLOCK_IN',
        method: scanType === 'FINGERPRINT' ? 'FINGERPRINT_BIOMETRICS' : 'FACIAL_RECOGNITION_AI',
        terminalId: 'BIO-TERMINAL-01-ENTRANCE',
        confidenceScore: Number((98.5 + Math.random() * 1.4).toFixed(1)),
      };
      setAttendancePunches([newPunch, ...attendancePunches]);
      addToast({
        type: 'success',
        title: 'Biometric Duty Verified',
        message: `${selectedStaffForClock} clocked in successfully via ${scanType === 'FINGERPRINT' ? 'Fingerprint Scanner' : 'Facial Recognition'}.`,
      });
      logAuditEvent({
        user: selectedStaffForClock,
        action: 'BIOMETRIC_CLOCK_IN',
        details: `Duty roster punch confirmed. Terminal ID: BIO-TERMINAL-01-ENTRANCE. Score: ${newPunch.confidenceScore}%`,
      });
    }, 1200);
  };

  // Calculate Doctor Payroll Breakdown
  const computeDoctorPayroll = (doc: Doctor) => {
    const baseSalary = 950000; // RWF base
    const assignedCount = patients.filter((p) => p.attendingDoctorId === doc.id).length;
    const consultationsCommission = Math.max(8, assignedCount * 3) * 3500; // 3,500 RWF per consultation
    const isSurgeon = doc.specialty.toLowerCase().includes('surg') || doc.department.toLowerCase().includes('surg');
    const surgeryCount = isSurgeon ? 4 : 0;
    const surgeryBonus = surgeryCount * 45000; // 45,000 RWF per surgery
    const nightShiftsCount = doc.status === 'on_duty' ? 3 : 1;
    const nightShiftAllowance = nightShiftsCount * 25000; // 25,000 RWF per night shift

    const grossSalary = baseSalary + consultationsCommission + surgeryBonus + nightShiftAllowance;
    const rssbPension = Math.round(grossSalary * 0.03); // 3% RSSB
    const ramaInsurance = Math.round(grossSalary * 0.075); // 7.5% RAMA
    const payeTax = Math.round(grossSalary * 0.18); // PAYE Tax estimate
    const totalDeductions = rssbPension + ramaInsurance + payeTax;
    const netTakeHome = grossSalary - totalDeductions;

    return {
      doc,
      baseSalary,
      consultationsCommission,
      consultationsCount: Math.max(8, assignedCount * 3),
      surgeryCount,
      surgeryBonus,
      nightShiftsCount,
      nightShiftAllowance,
      grossSalary,
      rssbPension,
      ramaInsurance,
      payeTax,
      totalDeductions,
      netTakeHome,
    };
  };

  const payrollList = doctors.map((d) => computeDoctorPayroll(d));
  const totalHospitalPayroll = payrollList.reduce((acc, p) => acc + p.grossSalary, 0);
  const totalCommissions = payrollList.reduce((acc, p) => acc + p.consultationsCommission + p.surgeryBonus, 0);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const branchObj = branches.find((b) => b.id === targetBranch) || branches[0];
    addToast({
      type: 'success',
      title: 'Inter-Facility Transfer Approved',
      message: `${transferDocName} dispatched to ${branchObj.name} for ${transferDuration}.`,
    });
    logAuditEvent({
      user: 'Hospital HR Director',
      action: 'STAFF_INTERFACILITY_TRANSFER',
      details: `${transferDocName} redeployed to ${branchObj.name}. Reason: ${transferReason}`,
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Human Resources, Biometrics & Automated Payroll
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              HR Suite Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Biometric time-clock terminals, shift salary calculations, consultation commissions, and multi-hospital staff redeployment.
          </p>
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="flex flex-wrap items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('roster')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeSubTab === 'roster' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Staff Directory
          </button>
          <button
            onClick={() => setActiveSubTab('timeclock')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'timeclock' ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            Biometric Time-Clock
          </button>
          <button
            onClick={() => setActiveSubTab('payroll')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'payroll' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Payroll & Commissions
          </button>
          <button
            onClick={() => setActiveSubTab('transfers')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'transfers' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Facility Transfers
          </button>
        </div>
      </div>

      {/* SUBTAB 1: STAFF DIRECTORY & SHIFT ROSTER */}
      {activeSubTab === 'roster' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by physician name, specialty, or department..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doc) => {
              const assignedPatients = patients.filter((p) => p.attendingDoctorId === doc.id);

              return (
                <div
                  key={doc.id}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 shadow-md hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-600 flex items-center justify-center font-bold text-white shadow-md text-base shrink-0">
                          {doc.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">{doc.name}</h3>
                          <p className="text-xs text-cyan-300 font-medium">{doc.specialty}</p>
                          <span className="text-[10px] text-slate-400">{doc.department}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleDoctorStatus(doc.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                          doc.status === 'on_duty'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            : doc.status === 'on_call'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                        title="Click to toggle status"
                      >
                        {doc.status.replace('_', ' ').toUpperCase()}
                      </button>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-400">{doc.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-[11px] text-slate-400">Shift: {doc.shift || doc.schedule}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Current Patients:
                    </span>
                    <span className="font-mono font-bold text-white">{assignedPatients.length} Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: BIOMETRIC TIME-CLOCK TERMINALS */}
      {activeSubTab === 'timeclock' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Terminal Simulator Box */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 space-y-5 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Biometric Duty Roster Terminal</h3>
                <p className="text-xs text-slate-400">Hardware Gateway: Model BIO-ENTRY-X9 (Kigali Campus)</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Physician / Medical Staff</label>
                <select
                  value={selectedStaffForClock}
                  onChange={(e) => setSelectedStaffForClock(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>{d.name} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Verification Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScanType('FINGERPRINT')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                      scanType === 'FINGERPRINT'
                        ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300 shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Fingerprint className="w-4 h-4" />
                    Fingerprint Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanType('FACIAL')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                      scanType === 'FACIAL'
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    Facial Recognition AI
                  </button>
                </div>
              </div>

              {/* Hardware Scanner Graphic */}
              <div className="p-6 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-center space-y-3">
                {isScanningBiometric ? (
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-cyan-400 font-bold text-xs">
                      SCANNING
                    </div>
                  </div>
                ) : scanType === 'FINGERPRINT' ? (
                  <div className="w-20 h-20 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-inner">
                    <Fingerprint className="w-10 h-10 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-inner">
                    <Camera className="w-10 h-10 animate-pulse" />
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    {isScanningBiometric ? 'Verifying Optical Biometric Template...' : 'Terminal Optical Sensor Ready'}
                  </div>
                  <div className="text-[10px] text-slate-400">Place finger on glass prism or align face with IR lens</div>
                </div>
              </div>

              <button
                type="button"
                disabled={isScanningBiometric}
                onClick={handleBiometricPunch}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:from-cyan-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-cyan-950/60 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {isScanningBiometric ? 'Validating Biometrics...' : 'Trigger Biometric Punch-In (Clock Duty)'}
              </button>
            </div>
          </div>

          {/* Real-time Punch Stream Log */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Live Shift Attendance Stream</h3>
                <p className="text-xs text-slate-400">Cryptographically signed biometric punch logs</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Punctuality Rate: 98.6%
              </span>
            </div>

            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {attendancePunches.map((punch) => (
                <div
                  key={punch.id}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                      {punch.method === 'FINGERPRINT_BIOMETRICS' ? (
                        <Fingerprint className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Camera className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{punch.doctorName}</h4>
                      <div className="text-[11px] text-slate-400">
                        {punch.role} • {punch.department}
                      </div>
                      <div className="text-[10px] font-mono text-cyan-400 mt-0.5">
                        {punch.terminalId} • Confidence: {punch.confidenceScore}%
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {punch.type}
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">{punch.punchTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: AUTOMATED SHIFT SALARY & PAYROLL ENGINE */}
      {activeSubTab === 'payroll' && (
        <div className="space-y-6">
          {/* Payroll KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Monthly Gross Physician Payroll</span>
              <div className="text-2xl font-black font-mono text-white">
                {totalHospitalPayroll.toLocaleString()} RWF
              </div>
              <p className="text-[11px] text-emerald-400">Automated month-end processing active</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Earned Clinical Commissions & Bonuses</span>
              <div className="text-2xl font-black font-mono text-cyan-400">
                {totalCommissions.toLocaleString()} RWF
              </div>
              <p className="text-[11px] text-slate-400">Consultation + Surgery + Night shift incentives</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Statutory Tax & Pension Remittance</span>
              <div className="text-2xl font-black font-mono text-indigo-400">
                {Math.round(totalHospitalPayroll * 0.285).toLocaleString()} RWF
              </div>
              <p className="text-[11px] text-slate-400">RRA PAYE + RSSB Social Security Scheme (3%)</p>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="overflow-x-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Physician Salary & Commission Ledger</h3>
                <p className="text-xs text-slate-400">Calculated in real-time from clinical encounters, surgery logs, and night shifts</p>
              </div>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" /> Print Master Payroll
              </button>
            </div>

            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Doctor & Specialty</th>
                  <th className="p-3.5">Base Retainer</th>
                  <th className="p-3.5">Consultations Commission</th>
                  <th className="p-3.5">Surgeries Done</th>
                  <th className="p-3.5">Night Shift Diff</th>
                  <th className="p-3.5 font-bold text-white">Gross Salary</th>
                  <th className="p-3.5 font-bold text-emerald-400">Net Take-Home</th>
                  <th className="p-3.5 text-right">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payrollList.map((item) => (
                  <tr key={item.doc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{item.doc.name}</div>
                      <div className="text-[10px] text-slate-400">{item.doc.specialty}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{item.baseSalary.toLocaleString()} RWF</td>
                    <td className="p-3.5 font-mono text-cyan-300">
                      +{item.consultationsCommission.toLocaleString()} RWF
                      <div className="text-[10px] text-slate-500">({item.consultationsCount} visits)</div>
                    </td>
                    <td className="p-3.5 font-mono text-indigo-300">
                      +{item.surgeryBonus.toLocaleString()} RWF
                      <div className="text-[10px] text-slate-500">({item.surgeryCount} OT sessions)</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      +{item.nightShiftAllowance.toLocaleString()} RWF
                      <div className="text-[10px] text-slate-500">({item.nightShiftsCount} shifts)</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-white">{item.grossSalary.toLocaleString()} RWF</td>
                    <td className="p-3.5 font-mono font-black text-emerald-400 text-sm">
                      {item.netTakeHome.toLocaleString()} RWF
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedDocForPayslip(item)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold"
                      >
                        Payslip →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: INTER-FACILITY STAFF & INVENTORY TRANSFERS */}
      {activeSubTab === 'transfers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Deploy Medical Staff to Regional Facility</h3>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Staff Member</label>
                <select
                  value={transferDocName}
                  onChange={(e) => setTransferDocName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Destination Hospital Branch</label>
                <select
                  value={targetBranch}
                  onChange={(e) => setTargetBranch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Clinical Justification & Case Coverage</label>
                <input
                  type="text"
                  required
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assignment Duration</label>
                <input
                  type="text"
                  value={transferDuration}
                  onChange={(e) => setTransferDuration(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-900/40"
              >
                Issue Inter-Facility Deployment Authorization
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Active Hospital Multi-Branch Network Coverage
            </h3>
            <div className="space-y-3 text-xs">
              {branches.map((branch) => (
                <div key={branch.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{branch.name}</h4>
                    <div className="text-slate-400 text-[11px]">{branch.address}, {branch.city}</div>
                    <div className="text-cyan-400 font-mono text-[10px] mt-0.5">Capacity: {branch.totalBeds} Inpatient Beds</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Online & Linked
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: OFFICIAL INDIVIDUAL PAYSLIP */}
      {selectedDocForPayslip && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white text-slate-950 rounded-3xl w-full max-w-lg p-8 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex justify-between items-start border-b border-slate-300 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">METROPOLITAN HOSPITAL ENTERPRISE</h3>
                <div className="text-xs text-slate-500">MONTHLY STAFF PAYSLIP & REMUNERATION ADVICE</div>
              </div>
              <div className="text-right text-[11px] font-mono text-slate-500">
                <div>PERIOD: SEPTEMBER 2026</div>
                <div className="text-emerald-700 font-bold">DISBURSED VIA BNR/BK</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>Employee Name: <strong>{selectedDocForPayslip.doc.name}</strong></div>
              <div>Position: <span>{selectedDocForPayslip.doc.specialty} ({selectedDocForPayslip.doc.department})</span></div>
              <div className="text-slate-500 font-mono text-[11px]">TIN: 100482910 • RSSB No: 88204918</div>
            </div>

            {/* Earnings Breakdown */}
            <div className="space-y-1.5 text-xs border-b border-slate-200 pb-3">
              <div className="font-bold text-slate-700 uppercase text-[10px]">Earnings Breakdown</div>
              <div className="flex justify-between">
                <span>Base Retainer Salary:</span>
                <span className="font-mono">{selectedDocForPayslip.baseSalary.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between text-cyan-800">
                <span>Consultation Commissions ({selectedDocForPayslip.consultationsCount} patients):</span>
                <span className="font-mono">+{selectedDocForPayslip.consultationsCommission.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between text-indigo-800">
                <span>Surgical Procedures Commission ({selectedDocForPayslip.surgeryCount} OT sessions):</span>
                <span className="font-mono">+{selectedDocForPayslip.surgeryBonus.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between">
                <span>Night Shift Differential ({selectedDocForPayslip.nightShiftsCount} shifts):</span>
                <span className="font-mono">+{selectedDocForPayslip.nightShiftAllowance.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Gross Remuneration:</span>
                <span className="font-mono">{selectedDocForPayslip.grossSalary.toLocaleString()} RWF</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="space-y-1.5 text-xs border-b border-slate-200 pb-3 text-rose-900">
              <div className="font-bold text-slate-700 uppercase text-[10px]">Statutory Deductions</div>
              <div className="flex justify-between">
                <span>RSSB Pension Scheme (3%):</span>
                <span className="font-mono">-{selectedDocForPayslip.rssbPension.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between">
                <span>RAMA Medical Insurance (7.5%):</span>
                <span className="font-mono">-{selectedDocForPayslip.ramaInsurance.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between">
                <span>RRA PAYE Tax:</span>
                <span className="font-mono">-{selectedDocForPayslip.payeTax.toLocaleString()} RWF</span>
              </div>
            </div>

            {/* Net Salary */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 flex justify-between items-center text-emerald-950 font-black">
              <span>NET TAKE-HOME SALARY:</span>
              <span className="text-base font-mono">{selectedDocForPayslip.netTakeHome.toLocaleString()} RWF</span>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setSelectedDocForPayslip(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setSelectedDocForPayslip(null);
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
