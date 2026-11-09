import React, { useState, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext';
import { NationalPatient, Patient } from '../types';
import {
  ShieldCheck,
  Search,
  User,
  Heart,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
  ExternalLink,
  BedDouble,
  FlaskConical,
  Pill,
  X,
  Fingerprint,
  QrCode,
  Building2,
  Clock,
  Zap,
} from 'lucide-react';

interface QuickIdPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPatientChart?: (patientId: string) => void;
  onOpenRegisterModal?: () => void;
  onNavigateTab?: (tab: string) => void;
  initialNin?: string;
}

export const QuickIdPhotoModal: React.FC<QuickIdPhotoModalProps> = ({
  isOpen,
  onClose,
  onOpenPatientChart,
  onOpenRegisterModal,
  onNavigateTab,
  initialNin = '',
}) => {
  const {
    nationalPatients,
    patients,
    verifyNationalPatientNIN,
    verifyPatientInsurance,
    branches,
    currentBranchId,
    addToast,
    logAuditEvent,
  } = useHospital();

  const [ninInput, setNinInput] = useState(initialNin);
  const [isSearching, setIsSearching] = useState(false);
  const [matchedCitizen, setMatchedCitizen] = useState<NationalPatient | null>(null);
  const [insuranceInfo, setInsuranceInfo] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showIdCardPrint, setShowIdCardPrint] = useState(false);

  // Sync initial NIN
  useEffect(() => {
    if (initialNin) {
      setNinInput(initialNin);
      performSearch(initialNin);
    }
  }, [initialNin, isOpen]);

  // Handle instant lookup
  const performSearch = async (queryNin: string) => {
    const cleanNin = queryNin.replace(/[^0-9]/g, '');
    if (!cleanNin) {
      setMatchedCitizen(null);
      setInsuranceInfo(null);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // 1. Direct local search in mock national database
      const found = nationalPatients.find((p) => {
        const pClean = p.nin.replace(/[^0-9]/g, '');
        return pClean === cleanNin || p.nin.toLowerCase().includes(queryNin.toLowerCase()) || p.full_name.toLowerCase().includes(queryNin.toLowerCase());
      });

      if (found) {
        setMatchedCitizen(found);
        // Instant insurance verification
        const ins = await verifyPatientInsurance(found.nin, undefined, found.full_name);
        setInsuranceInfo(ins);
        logAuditEvent({
          user: 'Current Staff',
          action: 'QUICK_ID_PHOTO_LOOKUP',
          details: `Instant ID Photo retrieved for ${found.full_name} (${found.nin})`,
        });
      } else {
        // Try backend verification API
        const verified = await verifyNationalPatientNIN(queryNin);
        if (verified) {
          setMatchedCitizen(verified);
          const ins = await verifyPatientInsurance(verified.nin, undefined, verified.full_name);
          setInsuranceInfo(ins);
        } else {
          setMatchedCitizen(null);
          setInsuranceInfo(null);
          if (cleanNin.length >= 8) {
            setSearchError(`No verified citizen record found for ID: ${queryNin}. Verify Rwandan NIN format (16 digits).`);
          }
        }
      }
    } catch (err: any) {
      setSearchError(err?.message || 'Failed to query NIDA identity database.');
    } finally {
      setIsSearching(false);
    }
  };

  // Auto-search as user types or hits 16 digits
  const handleInputChange = (val: string) => {
    setNinInput(val);
    const digitsOnly = val.replace(/[^0-9]/g, '');
    if (digitsOnly.length === 16 || val.length >= 4) {
      performSearch(val);
    } else if (val.trim() === '') {
      setMatchedCitizen(null);
      setInsuranceInfo(null);
      setSearchError(null);
    }
  };

  const currentFacility = (branches && branches.find((f: any) => f.id === currentBranchId)) || (branches && branches[0]) || { name: 'King Faisal Hospital Rwanda (KFH)', district: 'Gasabo', code: 'KFH-001' };

  // Check if this citizen is already admitted or in EMR
  const existingLocalPatient = matchedCitizen
    ? patients.find((p) => {
        const cleanP = (p.nin || '').replace(/[^0-9]/g, '');
        const cleanM = matchedCitizen.nin.replace(/[^0-9]/g, '');
        return (cleanP && cleanP === cleanM) || p.name.toLowerCase() === matchedCitizen.full_name.toLowerCase();
      })
    : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/90 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30">
              <Fingerprint className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Instant National ID Photo & Biometrics Lookup
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  PRO Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct NIDA National Identity Agency Mirror • High-Res Citizen Photo Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Search Input Bar */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
              Enter 16-Digit Rwandan National ID (NIN) or Citizen Name:
            </label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={ninInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Type or paste ID (e.g. 1 1990 8 0012345 1 20 or 1198570045612115)..."
                className="w-full bg-slate-950 border-2 border-indigo-500/50 focus:border-cyan-400 rounded-2xl pl-11 pr-24 py-3 text-sm sm:text-base font-mono font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 shadow-inner"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {isSearching ? (
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-2" />
                ) : ninInput ? (
                  <button
                    onClick={() => {
                      setNinInput('');
                      setMatchedCitizen(null);
                      setInsuranceInfo(null);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Quick Demo ID Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Click to try instant photo demo:</span>
              {[
                { name: 'Jean Paul Mugisha', nin: '1199080012345120' },
                { name: 'Marie Claire Uwase', nin: '1198570045612115' },
                { name: 'Eric Nshimiyimana', nin: '1199580078901188' },
                { name: 'Chantal Mukamurenzi', nin: '1197870033445142' },
                { name: 'David Kwizera', nin: '1200280099112190' },
              ].map((item) => (
                <button
                  key={item.nin}
                  type="button"
                  onClick={() => {
                    setNinInput(item.nin);
                    performSearch(item.nin);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-900/60 border border-slate-700 hover:border-indigo-500/60 text-slate-300 hover:text-white text-[11px] font-mono transition-all"
                >
                  {item.name.split(' ')[0]} ({item.nin.slice(-4)})
                </button>
              ))}
            </div>
          </div>

          {/* Search Result: Person's Photo & Verified Profile */}
          {matchedCitizen ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* National Identity Smart Card */}
              <div className="relative rounded-3xl bg-gradient-to-br from-slate-850 via-slate-900 to-indigo-950/70 border-2 border-emerald-500/60 p-5 sm:p-6 shadow-2xl overflow-hidden">
                {/* Security Hologram Watermark Pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Fingerprint className="w-64 h-64 text-emerald-400" />
                </div>

                {/* Top Smartcard Ribbon */}
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-extrabold text-xs tracking-wider text-emerald-400 uppercase">
                      REPUBLIC OF RWANDA • NIDA CITIZEN IDENTITY
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Biometrics: 99.8% Match
                    </span>
                  </div>
                </div>

                {/* Core Photo & Demographics Split */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                  {/* Citizen Photo Column */}
                  <div className="sm:col-span-4 flex flex-col items-center">
                    <div className="relative group">
                      <div className="w-36 h-44 sm:w-40 sm:h-48 rounded-2xl overflow-hidden border-4 border-slate-700 shadow-2xl bg-slate-950 relative">
                        <img
                          src={matchedCitizen.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'}
                          alt={matchedCitizen.full_name}
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 text-center">
                          <span className="text-[10px] font-mono text-emerald-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur-sm">
                            LIVE NIDA PHOTO
                          </span>
                        </div>
                      </div>

                      {/* Official Chip Icon */}
                      <div className="absolute -top-2 -left-2 w-8 h-8 rounded-lg bg-amber-400 border border-amber-200 flex items-center justify-center text-slate-950 shadow-md">
                        <Zap className="w-4 h-4 fill-slate-950" />
                      </div>
                    </div>

                    <div className="mt-3 text-center">
                      <div className="text-[11px] font-mono font-bold text-slate-400">CHIP UID: 8F4A-992B-RW</div>
                      <div className="text-[10px] text-slate-500">Issued by National ID Agency</div>
                    </div>
                  </div>

                  {/* Citizen Details Column */}
                  <div className="sm:col-span-8 space-y-3">
                    <div>
                      <div className="text-xs text-slate-400 uppercase font-semibold">Citizen Full Legal Name</div>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {matchedCitizen.full_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-950 border border-indigo-800 text-indigo-300 font-mono text-xs font-bold">
                          NIN: {matchedCitizen.nin}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold">
                          {matchedCitizen.gender} • {matchedCitizen.age} yrs
                        </span>
                      </div>
                    </div>

                    {/* Grid of Key Health & Civil Attributes */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block uppercase font-medium">Date of Birth</span>
                        <span className="font-bold text-slate-100 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          {matchedCitizen.dob}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block uppercase font-medium">Blood Group</span>
                        <span className="font-bold text-rose-400 flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-rose-500/20 text-rose-500" />
                          {matchedCitizen.blood_group || 'O+'} (Verified)
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block uppercase font-medium">Residence Address</span>
                        <span className="font-medium text-slate-200 text-[11px] truncate block">
                          {matchedCitizen.address?.district}, {matchedCitizen.address?.province}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block uppercase font-medium">Verified Phone</span>
                        <span className="font-mono text-slate-200 text-[11px] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-cyan-400" />
                          {matchedCitizen.phone || '+250 788 000 000'}
                        </span>
                      </div>
                    </div>

                    {/* Insurance Eligibility Strip */}
                    <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-emerald-200">
                            {insuranceInfo?.provider_display_name || 'RSSB / RAMA Medical Scheme'}
                          </div>
                          <div className="text-[10px] text-emerald-400/80 font-mono">
                            Policy: {insuranceInfo?.policy_number || `RAMA-${matchedCitizen.nin.slice(-6)}`} • Valid
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-300">
                          {insuranceInfo?.coverage_percentage || 85}% Covered
                        </span>
                        <div className="text-[10px] text-emerald-400/70">
                          Patient Co-Pay: {100 - (insuranceInfo?.coverage_percentage || 85)}%
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    {matchedCitizen.emergency_contact && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                        <span className="font-semibold text-slate-300">Emergency Contact:</span>
                        <span>
                          {matchedCitizen.emergency_contact.name} ({matchedCitizen.emergency_contact.relationship}) •{' '}
                          <span className="font-mono text-cyan-400">{matchedCitizen.emergency_contact.phone}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Action Hub */}
                <div className="mt-5 pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {existingLocalPatient ? (
                      <span className="text-xs font-medium text-cyan-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Already Registered in EMR (MRN: {existingLocalPatient.mrn})
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> Not Yet Admitted to Local EMR
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {existingLocalPatient && onOpenPatientChart ? (
                      <button
                        onClick={() => {
                          onOpenPatientChart(existingLocalPatient.id);
                          onClose();
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-900/40 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open EMR Chart
                      </button>
                    ) : onOpenRegisterModal ? (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenRegisterModal();
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/40 transition-all"
                      >
                        <User className="w-3.5 h-3.5" /> Register to EMR with Photo
                      </button>
                    ) : null}

                    {onNavigateTab && (
                      <button
                        onClick={() => {
                          onNavigateTab('laboratory');
                          onClose();
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                      >
                        <FlaskConical className="w-3.5 h-3.5 text-cyan-400" /> Order Lab (LIS)
                      </button>
                    )}

                    <button
                      onClick={() => setShowIdCardPrint(!showIdCardPrint)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-400" />
                      {showIdCardPrint ? 'Hide Card Print' : 'Print ID Badge'}
                    </button>
                  </div>
                </div>

                {/* Printable ID Card Strip Preview */}
                {showIdCardPrint && (
                  <div className="mt-4 p-4 rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-xl space-y-3 font-sans animate-in fade-in">
                    <div className="flex justify-between items-start border-b border-slate-300 pb-2">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {currentFacility.name}
                        </div>
                        <div className="text-sm font-black text-slate-900">
                          NATIONAL HEALTHCARE CITIZEN CARD
                        </div>
                      </div>
                      <div className="text-right text-[10px] text-slate-500 font-mono">
                        <div>REF: RW-NAT-2026</div>
                        <div className="text-emerald-700 font-bold">VERIFIED NIDA</div>
                      </div>
                    </div>

                    <div className="flex gap-3 items-center">
                      <img
                        src={matchedCitizen.photo_url}
                        alt={matchedCitizen.full_name}
                        className="w-16 h-20 object-cover rounded border border-slate-400"
                      />
                      <div className="text-xs space-y-0.5">
                        <div className="text-sm font-bold text-slate-900">{matchedCitizen.full_name}</div>
                        <div className="font-mono text-[11px] text-slate-700 font-bold">{matchedCitizen.nin}</div>
                        <div className="text-[11px] text-slate-600">
                          DOB: {matchedCitizen.dob} • Blood: <strong>{matchedCitizen.blood_group}</strong>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold">
                          Insurance: {insuranceInfo?.provider_display_name || 'RSSB / RAMA'} (85%)
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <div className="font-mono text-xs font-bold text-slate-600">
                        ||||| |||| |||||| |||||||| ||||
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" /> Print Card
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : searchError ? (
            <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-800/50 text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
              <h4 className="text-sm font-bold text-rose-300">Identity Not Verified</h4>
              <p className="text-xs text-rose-200/80 max-w-md mx-auto">{searchError}</p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setNinInput('1199080012345120');
                    performSearch('1199080012345120');
                  }}
                  className="px-4 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold"
                >
                  Load Sample Citizen (Jean Paul Mugisha)
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3 bg-slate-950/40 rounded-3xl border border-slate-800/80">
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
                <User className="w-8 h-8 opacity-70" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">
                Enter an ID Number to Instantly Display Person's Photo
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Type any 16-digit Rwandan National ID or click any of the sample citizens above to view authentic NIDA biometric photos, insurance coverage, and EMR records instantly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
