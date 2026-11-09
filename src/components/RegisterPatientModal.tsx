import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { X, UserPlus, Heart, AlertTriangle, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';

interface RegisterPatientModalProps {
  onClose: () => void;
  onPatientCreated?: (patientId: string) => void;
}

export const RegisterPatientModal: React.FC<RegisterPatientModalProps> = ({
  onClose,
  onPatientCreated,
}) => {
  const { doctors, beds, registerPatient, admitPatientToBed, verifyNationalPatientNIN, verifyPatientInsurance, addToast } = useHospital();

  // NIDA National ID Integration
  const [nin, setNin] = useState('');
  const [isVerifyingNin, setIsVerifyingNin] = useState(false);
  const [ninVerified, setNinVerified] = useState(false);
  const [insuranceVerified, setInsuranceVerified] = useState(false);

  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('1991-05-15');
  const [phone, setPhone] = useState('+250 788 000 000');
  const [bloodGroup, setBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('O+');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [medicalHistoryInput, setMedicalHistoryInput] = useState('');

  // Emergency contact
  const [contactName, setContactName] = useState('');
  const [contactRel, setContactRel] = useState('Spouse');
  const [contactPhone, setContactPhone] = useState('');

  // Insurance
  const [insuranceProvider, setInsuranceProvider] = useState('RSSB / RAMA');
  const [policyNumber, setPolicyNumber] = useState('RAMA-2026-99');
  const [coveragePercent, setCoveragePercent] = useState<number>(85);
  const [patientCopayPercent, setPatientCopayPercent] = useState<number>(15);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const handleNINLookup = async (manualNin?: string) => {
    const targetNin = (manualNin || nin).trim();
    if (!targetNin) {
      addToast({
        type: 'warning',
        title: 'Missing National ID',
        message: 'Please enter a 16-digit Rwandan National ID (NIN).',
      });
      return;
    }
    setIsVerifyingNin(true);
    try {
      const citizen = await verifyNationalPatientNIN(targetNin);
      if (citizen) {
        setName(citizen.full_name);
        setAge(citizen.age);
        setGender(citizen.gender === 'Female' ? 'Female' : 'Male');
        setDob(citizen.dob);
        setPhone(citizen.phone);
        setBloodGroup(citizen.blood_group as any);
        if (citizen.photo_url) {
          setPhotoUrl(citizen.photo_url);
        }
        if (citizen.emergency_contact) {
          setContactName(citizen.emergency_contact.name);
          setContactRel(citizen.emergency_contact.relationship);
          setContactPhone(citizen.emergency_contact.phone);
        }

        // Automatic RSSB / Mutuelle / Private Insurance Check
        const insCheck = await verifyPatientInsurance(citizen.nin, undefined, citizen.full_name);
        if (insCheck) {
          setInsuranceProvider(insCheck.provider_display_name || 'RSSB / RAMA');
          setPolicyNumber(insCheck.policy_number);
          setCoveragePercent(insCheck.coverage_percentage || 85);
          setPatientCopayPercent(100 - (insCheck.coverage_percentage || 85));
          setInsuranceVerified(true);
        } else {
          setInsuranceProvider('RSSB / RAMA');
          setPolicyNumber(`RAMA-${citizen.nin.slice(-6)}`);
          setCoveragePercent(85);
          setPatientCopayPercent(15);
        }
        setNinVerified(true);
      }
    } finally {
      setIsVerifyingNin(false);
    }
  };

  // Doctor & Admission
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [admitNow, setAdmitNow] = useState(false);
  const [selectedBedId, setSelectedBedId] = useState('');

  // Initial Vitals
  const [bp, setBp] = useState('120/80');
  const [hr, setHr] = useState(72);
  const [temp, setTemp] = useState(98.6);
  const [spo2, setSpo2] = useState(98);

  const availableBeds = beds.filter((b) => b.status === 'available');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const doctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
    const allergies = allergiesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const history = medicalHistoryInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newPatient = registerPatient({
      name,
      age: Number(age),
      gender,
      dob,
      phone,
      bloodGroup,
      allergies,
      nin: nin || undefined,
      nationalVerified: ninVerified,
      emergencyContact: {
        name: contactName || 'Next of Kin',
        relationship: contactRel,
        phone: contactPhone || phone,
      },
      insurance: {
        provider: insuranceProvider,
        policyNumber,
        coveragePercent: Number(coveragePercent),
      },
      status: admitNow ? 'inpatient' : 'outpatient',
      admissionDate: new Date().toISOString(),
      attendingDoctorId: doctor.id,
      attendingDoctorName: doctor.name,
      primaryDiagnosis: primaryDiagnosis || 'General Clinical Evaluation',
      vitals: {
        bp,
        hr: Number(hr),
        temp: Number(temp),
        spo2: Number(spo2),
        rr: 16,
        lastRecorded: 'At Registration',
      },
      medicalHistory: history,
    });

    if (admitNow && selectedBedId) {
      admitPatientToBed(newPatient.id, selectedBedId, primaryDiagnosis);
    }

    if (onPatientCreated) {
      onPatientCreated(newPatient.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Register New Patient</h2>
              <p className="text-xs text-slate-400">Electronic Medical Record (EMR) Intake Form</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Rwanda NIDA Autofill Bar */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Rwanda NIDA National ID Quick Lookup</span>
              </div>
              {ninVerified && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Identity Verified
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={nin}
                onChange={(e) => {
                  const val = e.target.value;
                  setNin(val);
                  setNinVerified(false);
                  const clean = val.replace(/[^0-9]/g, '');
                  if (clean.length === 16) {
                    handleNINLookup(val);
                  }
                }}
                placeholder="Enter 16-digit Rwandan NIN (e.g. 1199080012345120)"
                className="flex-1 bg-slate-850 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleNINLookup()}
                disabled={isVerifyingNin}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {isVerifyingNin ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                {isVerifyingNin ? 'Checking...' : 'Autofill via NIDA'}
              </button>
            </div>
            <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-1.5">
              <span>Quick test IDs:</span>
              <button
                type="button"
                onClick={() => {
                  setNin('1199080012345120');
                  handleNINLookup('1199080012345120');
                }}
                className="text-cyan-400 hover:underline font-mono bg-slate-800 px-1.5 py-0.5 rounded"
              >
                1199080012345120 (Mugisha)
              </button>
              <button
                type="button"
                onClick={() => {
                  setNin('1198570045612115');
                  handleNINLookup('1198570045612115');
                }}
                className="text-cyan-400 hover:underline font-mono bg-slate-800 px-1.5 py-0.5 rounded"
              >
                1198570045612115 (Uwase)
              </button>
            </div>
          </div>

          {/* Immediate Citizen Photo & Biometrics Card */}
          {photoUrl && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/50 border border-emerald-500/60 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="relative shrink-0">
                <img
                  src={photoUrl}
                  alt={name}
                  className="w-16 h-20 object-cover object-top rounded-xl border-2 border-emerald-400 shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter">
                  NIDA
                </span>
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> NIDA Verified Photo
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">({nin})</span>
                </div>
                <div className="font-black text-white text-base truncate">{name}</div>
                <div className="text-[11px] text-slate-300">
                  {gender} • {age} yrs • DOB: {dob} • Blood: <strong className="text-rose-400">{bloodGroup}</strong>
                </div>
                <div className="text-[10px] text-emerald-300 font-medium flex items-center gap-1 pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Eligible under {insuranceProvider} • Copay: {patientCopayPercent}% (Covered: {coveragePercent}%)
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Demographics */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
              1. Patient Demographics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-300 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jonathan Doe"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-slate-300 block mb-1">Primary Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Known Allergies</label>
                <input
                  type="text"
                  value={allergiesInput}
                  onChange={(e) => setAllergiesInput(e.target.value)}
                  placeholder="e.g. Penicillin, Latex, NSAIDs"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-rose-300"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Presentation & Diagnosis */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
              2. Clinical Diagnosis & Attending Physician
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Primary Clinical Diagnosis *</label>
                <input
                  type="text"
                  value={primaryDiagnosis}
                  onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Bronchitis, Type 2 Diabetes"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Attending Physician</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-slate-300 block mb-1">
                  Past Medical History (comma separated)
                </label>
                <input
                  type="text"
                  value={medicalHistoryInput}
                  onChange={(e) => setMedicalHistoryInput(e.target.value)}
                  placeholder="e.g. Hypertension, Asthma, Prior Appendectomy"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Baseline Intake Vitals */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              3. Baseline Triage Vitals
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">BP (mmHg)</label>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Pulse (bpm)</label>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Inpatient Ward Admission Option */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="admit-checkbox"
                  checked={admitNow}
                  onChange={(e) => setAdmitNow(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-900"
                />
                <label htmlFor="admit-checkbox" className="text-xs font-semibold text-white cursor-pointer">
                  Admit Directly to Hospital Bed (Inpatient)
                </label>
              </div>
            </div>

            {admitNow && (
              <div className="mt-3">
                <label className="text-xs text-slate-300 block mb-1">Select Available Bed</label>
                <select
                  value={selectedBedId}
                  onChange={(e) => setSelectedBedId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required={admitNow}
                >
                  <option value="">-- Choose Bed --</option>
                  {availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.ward} - Bed {b.bedNumber} (${b.dailyRate}/day)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Section 5: Emergency Contact & Insurance */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
              4. Emergency Contact & Insurance Provider
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Contact Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Mary Doe"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Relationship</label>
                <input
                  type="text"
                  value={contactRel}
                  onChange={(e) => setContactRel(e.target.value)}
                  placeholder="e.g. Spouse, Parent"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Insurance Scheme & Payer</label>
                <select
                  value={insuranceProvider}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInsuranceProvider(val);
                    if (val.includes('Mutuelle')) {
                      setCoveragePercent(90);
                      setPatientCopayPercent(10);
                    } else if (val.includes('MMI')) {
                      setCoveragePercent(90);
                      setPatientCopayPercent(10);
                    } else if (val.includes('Private') || val.includes('Sanlam') || val.includes('Britam')) {
                      setCoveragePercent(80);
                      setPatientCopayPercent(20);
                    } else {
                      setCoveragePercent(85);
                      setPatientCopayPercent(15);
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="RSSB / RAMA">RSSB / RAMA (Civil Servants & Formal Sector)</option>
                  <option value="CBHI / Mutuelle de Santé">CBHI / Mutuelle de Santé (Community)</option>
                  <option value="Military Medical Insurance (MMI)">Military Medical Insurance (MMI)</option>
                  <option value="Sanlam Assurance Rwanda">Sanlam Assurance Rwanda (Private)</option>
                  <option value="Britam Insurance Rwanda">Britam Insurance Rwanda (Private)</option>
                  <option value="Radiant Insurance">Radiant Insurance (Private)</option>
                  <option value="Eden Care Medical">Eden Care Medical (Digital Health)</option>
                  <option value="Self-Pay / Cash">Self-Pay / Cash (No Insurance)</option>
                </select>
              </div>
            </div>

            {/* Instant Insurance Co-pay Calculation Banner */}
            <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-cyan-400 font-bold">Policy: {policyNumber}</span>
                {insuranceVerified && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    Active Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">
                  Insurer Pays: <strong className="text-emerald-400">{coveragePercent}%</strong>
                </span>
                <span className="text-slate-400">
                  Patient Co-Pay: <strong className="text-amber-400">{patientCopayPercent}%</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/30 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Complete Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
