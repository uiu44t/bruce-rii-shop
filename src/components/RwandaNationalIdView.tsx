import React, { useState, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  NationalPatient,
  InsuranceVerification,
  Facility,
  PatientReferral,
  ReferralPriority,
} from '../types';
import { RWANDA_FACILITIES } from '../data/mockRwandaNationalData';
import {
  ShieldCheck,
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Send,
  FileText,
  Clock,
  Ambulance,
  ExternalLink,
  ChevronRight,
  Shield,
  CreditCard,
  RefreshCw,
  PlusCircle,
  Eye,
  Hospital,
  QrCode,
  Camera,
  Download,
  ZoomIn,
  Sparkles,
  Copy,
  BadgeCheck,
  FileCheck,
  Award,
  Printer,
  Sliders,
  Check,
} from 'lucide-react';

interface RwandaNationalIdViewProps {
  onOpenPatientChart?: (patientId: string) => void;
}

export const RwandaNationalIdView: React.FC<RwandaNationalIdViewProps> = () => {
  const {
    nationalPatients,
    patientReferrals,
    accessAuditLogs,
    verifyNationalPatientNIN,
    verifyPatientInsurance,
    recordPatientConsent,
    createPatientReferral,
    updateReferralStatus,
    createNationalEncounter,
    doctors,
    addToast,
  } = useHospital();

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<
    'verification' | 'directory' | 'referrals' | 'audit_log'
  >('verification');

  // Verification state
  const [ninInput, setNinInput] = useState('1199080012345120');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedPatient, setVerifiedPatient] = useState<NationalPatient | null>(null);
  const [insuranceData, setInsuranceData] = useState<InsuranceVerification | null>(null);
  const [isCheckingInsurance, setIsCheckingInsurance] = useState(false);

  // Pro Features State
  const [showPhotoZoomModal, setShowPhotoZoomModal] = useState(false);
  const [showSmartIdCardModal, setShowSmartIdCardModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [instantSearchEnabled, setInstantSearchEnabled] = useState(true);
  const [biometricMatchScore, setBiometricMatchScore] = useState<number>(99.4);

  // Consent modal state
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentType, setConsentType] = useState<'TREATMENT' | 'REFERRAL' | 'RESEARCH'>('TREATMENT');
  const [consentChannel, setConsentChannel] = useState<'VERBAL_WITNESSED' | 'WRITTEN_FORM' | 'DIGITAL_SMS_OTP'>('VERBAL_WITNESSED');
  const [consentPurpose, setConsentPurpose] = useState('Medical diagnosis and inpatient/outpatient clinical care under Rwanda Law N° 058/2021');
  const [isSubmittingConsent, setIsSubmittingConsent] = useState(false);
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);

  // Referral modal state
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralDestFacility, setReferralDestFacility] = useState('fac-kfh');
  const [referralPriority, setReferralPriority] = useState<ReferralPriority>('URGENT');
  const [referralDiagnosis, setReferralDiagnosis] = useState('');
  const [referralReason, setReferralReason] = useState('');
  const [referralAmbulance, setReferralAmbulance] = useState(false);

  // Hospital Directory state
  const [directorySearch, setDirectorySearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [selectedFacilityType, setSelectedFacilityType] = useState<string>('ALL');
  const [activeFacilityId, setActiveFacilityId] = useState<string>('fac-chuk');

  // Auto-load first mock patient on mount if available
  useEffect(() => {
    if (nationalPatients.length > 0 && !verifiedPatient) {
      const initial = nationalPatients[0];
      setVerifiedPatient(initial);
      setNinInput(initial.nin);
    }
  }, [nationalPatients, verifiedPatient]);

  // Pro Feature: Auto-verify immediately as user finishes typing or pastes ID
  useEffect(() => {
    if (!instantSearchEnabled) return;
    const clean = ninInput.replace(/[^0-9]/g, '');
    if (clean.length === 16) {
      if (verifiedPatient && verifiedPatient.nin.replace(/[^0-9]/g, '') === clean) {
        return;
      }
      handleVerifyNIN(ninInput);
    }
  }, [ninInput, instantSearchEnabled]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: `${fieldName}: ${text}`,
    });
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Handle Verify NIN
  const handleVerifyNIN = async (ninToVerify?: string) => {
    const targetNin = (ninToVerify || ninInput).trim();
    if (!targetNin) {
      addToast({
        type: 'warning',
        title: 'Missing National ID',
        message: 'Please enter a 16-digit Rwandan National Identification Number (NIN).',
      });
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyNationalPatientNIN(targetNin);
      if (result) {
        setVerifiedPatient(result);
        // Automatically check insurance for the verified citizen
        setIsCheckingInsurance(true);
        const ins = await verifyPatientInsurance(result.nin, undefined, result.full_name);
        setInsuranceData(ins);
      }
    } catch {
      // Handled in context toast
    } finally {
      setIsVerifying(false);
      setIsCheckingInsurance(false);
    }
  };

  // Check Insurance Manual trigger
  const handleCheckInsurance = async () => {
    if (!verifiedPatient) return;
    setIsCheckingInsurance(true);
    try {
      const ins = await verifyPatientInsurance(verifiedPatient.nin, undefined, verifiedPatient.full_name);
      setInsuranceData(ins);
      if (ins) {
        addToast({
          type: 'success',
          title: 'Insurance Eligibility Verified',
          message: `${ins.provider_display_name} verified (${ins.coverage_percentage}% coverage).`,
        });
      }
    } finally {
      setIsCheckingInsurance(false);
    }
  };

  // Create Hospital EMR Encounter
  const handleCreateEncounter = async () => {
    if (!verifiedPatient) return;
    try {
      await createNationalEncounter({
        patientNin: verifiedPatient.nin,
        patientName: verifiedPatient.full_name,
        department: 'General Internal Medicine',
        diagnosis: 'General Outpatient Consultation',
      });
    } catch {
      // Error handled by context toast
    }
  };

  // Submit Consent
  const handleSubmitConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedPatient) return;
    const activeDoc = doctors[0];
    setIsSubmittingConsent(true);
    try {
      await recordPatientConsent({
        patient_nin: verifiedPatient.nin,
        patient_name: verifiedPatient.full_name,
        consent_type: consentType,
        channel: consentChannel,
        status: 'GRANTED',
        purpose: consentPurpose,
        valid_until: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        recorded_by_staff_id: activeDoc?.id || 'doc-001',
        recorded_by_staff_name: activeDoc?.name || 'Dr. Christian Hakizimana',
        facility_id: activeFacilityId,
      });
      setShowConsentModal(false);
    } catch {
      // Context surfaces errors via toast
    } finally {
      setIsSubmittingConsent(false);
    }
  };

  // Submit Referral
  const handleSubmitReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedPatient) return;
    const activeDoc = doctors[0];
    const dest = RWANDA_FACILITIES.find((f) => f.id === referralDestFacility);

    setIsSubmittingReferral(true);
    try {
      await createPatientReferral({
        patient_nin: verifiedPatient.nin,
        patient_name: verifiedPatient.full_name,
        patient_gender: verifiedPatient.gender,
        patient_age: verifiedPatient.age,
        patient_phone: verifiedPatient.phone,
        source_facility_id: activeFacilityId,
        source_facility_name: RWANDA_FACILITIES.find((f) => f.id === activeFacilityId)?.name || 'CHUK Kigali',
        destination_facility_id: referralDestFacility,
        destination_facility_name: dest ? dest.name : 'King Faisal Hospital',
        destination_country: 'Rwanda',
        referral_type: 'FACILITY_TO_FACILITY',
        priority: referralPriority,
        status: 'PENDING',
        primary_diagnosis: referralDiagnosis || 'Specialized clinical assessment required',
        clinical_summary: `Referred from outpatient department for specialized tertiary evaluation. Initial vitals stable.`,
        transfer_reason: referralReason || 'Tertiary surgical or intensive consultation',
        required_services: ['Specialist Consultation', 'Advanced Imaging'],
        referring_doctor_id: activeDoc?.id || 'doc-001',
        referring_doctor_name: activeDoc?.name || 'Dr. Christian Hakizimana',
        referring_department: 'Inpatient Department',
        ambulance_required: referralAmbulance,
      });

      setShowReferralModal(false);
      setActiveSubTab('referrals');
    } catch {
      // Context surfaces errors via toast
    } finally {
      setIsSubmittingReferral(false);
    }
  };

  // Filtered facilities for directory
  const filteredFacilities = RWANDA_FACILITIES.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
      f.district.toLowerCase().includes(directorySearch.toLowerCase()) ||
      f.province.toLowerCase().includes(directorySearch.toLowerCase()) ||
      (f.city ? f.city.toLowerCase().includes(directorySearch.toLowerCase()) : false);

    const matchesProvince =
      selectedProvince === 'ALL' ||
      f.province.toLowerCase().includes(selectedProvince.toLowerCase());

    const matchesType =
      selectedFacilityType === 'ALL' || f.type === selectedFacilityType;

    return matchesSearch && matchesProvince && matchesType;
  });

  const activeFacility = RWANDA_FACILITIES.find((f) => f.id === activeFacilityId) || RWANDA_FACILITIES[0];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 p-5 sm:p-6 rw-hero-glow">
        <div className="absolute inset-x-0 top-0 rw-accent-bar" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">Indangamuntu, Ubwishingizi & RHIE mu Rwanda</h2>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/25">Demo</span>
              </div>
              <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-300">
                Kugenzura indangamuntu (NIDA), kureba ubwishingizi (RSSB/Mutuelle), kohereza abarwayi mu bindi bitaro, no kubika ibikorwa mu buryo bwubahiriza Itegeko N° 058/2021.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-xs">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Ikigo gikora</div>
              <div className="font-bold text-slate-100 max-w-[220px] truncate">{activeFacility.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            id="tab-nin-verification"
            type="button"
            onClick={() => setActiveSubTab('verification')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'verification'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            NIDA Citizen Verification & RSSB
          </button>

          <button
            id="tab-hospital-directory"
            type="button"
            onClick={() => setActiveSubTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'directory'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Hospital className="w-4 h-4" />
            Rwanda Hospital Directory ({RWANDA_FACILITIES.length})
          </button>

          <button
            id="tab-referrals"
            type="button"
            onClick={() => setActiveSubTab('referrals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'referrals'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Send className="w-4 h-4" />
            Inter-Facility Referrals ({patientReferrals.length})
          </button>

          <button
            id="tab-audit-trail"
            type="button"
            onClick={() => setActiveSubTab('audit_log')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'audit_log'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Law N° 058/2021 Access Trail
          </button>
        </div>

        {/* Quick NIN preset test buttons */}
        {activeSubTab === 'verification' && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="hidden sm:inline text-[11px]">Quick Tests:</span>
            {nationalPatients.slice(0, 3).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setNinInput(p.nin);
                  handleVerifyNIN(p.nin);
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono border border-slate-700 transition-colors"
                title={`Test with ${p.full_name}`}
              >
                {p.first_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. CITIZEN IDENTITY & INSURANCE VERIFICATION SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'verification' && (
        <div className="space-y-6">
          {/* NIN Search Box Card - Upgraded Pro Version */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-900/40 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-slate-950" /> Pro Real-Time Identification
                </span>
                <span className="text-xs font-bold text-slate-200">
                  Rwanda NIDA Direct Photo & Biometrics Registry
                </span>
              </div>

              {/* Instant Photo Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={instantSearchEnabled}
                  onChange={(e) => setInstantSearchEnabled(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-[11px] font-medium text-cyan-300">Instant Photo Lookup (as you type)</span>
              </label>
            </div>

            <div className="max-w-3xl">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Enter 16-Digit Rwandan National ID Number (Indangamuntu)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="nin-search-input"
                    type="text"
                    value={ninInput}
                    onChange={(e) => setNinInput(e.target.value)}
                    placeholder="e.g. 1 1990 8 0012345 1 20"
                    className="w-full pl-11 pr-24 py-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-500 shadow-inner"
                  />
                  {/* Clean digits count helper */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                    <span className={ninInput.replace(/[^0-9]/g, '').length === 16 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {ninInput.replace(/[^0-9]/g, '').length}
                    </span>
                    /16 digits
                  </div>
                </div>
                <button
                  id="btn-verify-nin"
                  type="button"
                  onClick={() => handleVerifyNIN()}
                  disabled={isVerifying}
                  className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  {isVerifying ? 'Searching NIDA...' : 'Verify & Show Photo'}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5">
                <span className="flex items-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Official Civil ID format: 1 YYYY G NNNNNNN C CC
                </span>
                <span className="text-slate-500 hidden sm:inline">
                  Instant biometrics validation • Match Score: {biometricMatchScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Verified Citizen Details Grid */}
          {verifiedPatient && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Demographics & Rwanda Administrative Address */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
                  {/* Citizen Header Banner - Upgraded Pro Interactive Photo Display */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                    <div className="flex items-center gap-4">
                      {/* Photo Container with Pro Hover Zoom & Biometrics Ring */}
                      <div className="relative group cursor-pointer" onClick={() => setShowPhotoZoomModal(true)}>
                        <img
                          src={verifiedPatient.photo_url}
                          alt={verifiedPatient.full_name}
                          referrerPolicy="no-referrer"
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-cyan-400 shadow-xl shadow-cyan-500/20 group-hover:scale-105 group-hover:border-indigo-400 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                          <ZoomIn className="w-6 h-6 text-cyan-300 animate-pulse" />
                        </div>
                        <span className="absolute -bottom-1.5 -right-1.5 p-1 rounded-lg bg-emerald-500 text-slate-950 shadow-md" title="Facial Biometrics Match">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            {verifiedPatient.full_name}
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> NIDA DIRECT MATCH
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Biometrics: {biometricMatchScore}%
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <div className="text-xs text-slate-300 font-mono flex items-center gap-1.5 bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-700/80">
                            <span className="text-slate-400">NIN:</span>
                            <strong className="text-cyan-300 tracking-wider">{verifiedPatient.nin}</strong>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(verifiedPatient.nin, 'National ID');
                              }}
                              className="text-slate-400 hover:text-white ml-1 transition-colors"
                              title="Copy NIN"
                            >
                              {copiedField === 'National ID' ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">
                            RHIE ID: <span className="text-indigo-300">{verifiedPatient.rhie_id}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      {/* Pro Smart Digital ID Pass Button */}
                      <button
                        type="button"
                        onClick={() => setShowSmartIdCardModal(true)}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-800/60 text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
                        title="View printable digital ID card with photo and QR"
                      >
                        <QrCode className="w-4 h-4 text-cyan-400" />
                        Smart Digital ID Pass
                      </button>

                      <button
                        type="button"
                        onClick={handleCreateEncounter}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all whitespace-nowrap"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Create EMR Encounter
                      </button>
                    </div>
                  </div>

                  {/* Demographics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Gender</div>
                      <div className="text-sm font-bold text-white mt-0.5">{verifiedPatient.gender}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Age & DOB</div>
                      <div className="text-sm font-bold text-white mt-0.5">{verifiedPatient.age} yrs ({verifiedPatient.dob})</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Blood Group</div>
                      <div className="text-sm font-bold text-rose-400 mt-0.5">{verifiedPatient.blood_group}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Registry Status</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">{verifiedPatient.status}</div>
                    </div>
                  </div>

                  {/* Rwanda Administrative Address Breakdown */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      Rwanda Administrative Residence Hierarchy
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3.5 rounded-xl bg-slate-850/70 border border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Province</span>
                        <span className="text-slate-200 font-bold">{verifiedPatient.address.province}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">District</span>
                        <span className="text-slate-200 font-bold">{verifiedPatient.address.district}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Sector</span>
                        <span className="text-slate-200 font-bold">{verifiedPatient.address.sector}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Cell</span>
                        <span className="text-slate-200 font-bold">{verifiedPatient.address.cell}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Village (Umudugudu)</span>
                        <span className="text-indigo-300 font-bold">{verifiedPatient.address.village}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Emergency Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="text-[10px] text-slate-400">Citizen Phone</div>
                          <div className="text-xs font-bold text-slate-200">{verifiedPatient.phone}</div>
                        </div>
                      </div>
                      {verifiedPatient.email && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[120px]">{verifiedPatient.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400">Emergency Contact</div>
                        <div className="text-xs font-bold text-slate-200">
                          {verifiedPatient.emergency_contact.name} ({verifiedPatient.emergency_contact.relationship}) - {verifiedPatient.emergency_contact.phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap gap-2.5 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowConsentModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Shield className="w-4 h-4 text-indigo-400" />
                      Record Consent (Law N° 058/2021)
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowReferralModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Send className="w-4 h-4 text-cyan-400" />
                      Create Inter-Facility Referral
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Col: RSSB / Mutuelle Insurance Card */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-900/50 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      Insurance Eligibility (RSSB / RAMA)
                    </h3>
                    <button
                      type="button"
                      onClick={handleCheckInsurance}
                      disabled={isCheckingInsurance}
                      className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCheckingInsurance ? 'animate-spin' : ''}`} />
                      Re-Check
                    </button>
                  </div>

                  {insuranceData ? (
                    <div className="space-y-4">
                      {/* Provider Header Box */}
                      <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-800/60">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">
                            {insuranceData.provider_display_name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              insuranceData.status === 'ACTIVE'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {insuranceData.status}
                          </span>
                        </div>
                        <div className="text-xs text-indigo-200 font-mono mt-1">
                          Policy: {insuranceData.policy_number}
                        </div>
                      </div>

                      {/* Coverage Breakdown */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Insurance Pays</span>
                          <div className="text-base font-bold text-emerald-400 mt-0.5">
                            {insuranceData.coverage_percentage}%
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Patient Copay</span>
                          <div className="text-base font-bold text-amber-400 mt-0.5">
                            {insuranceData.copay_amount_rwf ? `${insuranceData.copay_amount_rwf.toLocaleString()} RWF` : `${100 - insuranceData.coverage_percentage}%`}
                          </div>
                        </div>
                      </div>

                      {/* Details List */}
                      <div className="space-y-2 text-xs text-slate-300 pt-1">
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Auth Code:</span>
                          <span className="font-mono text-cyan-300 font-bold">{insuranceData.verification_code}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Expiration Date:</span>
                          <span className="font-mono">{insuranceData.expires_at}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Eligibility Notes:</span>
                          <span className="text-[11px] text-slate-300 truncate max-w-[160px]">{insuranceData.eligibility_notes}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Verified At:</span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {new Date(insuranceData.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 space-y-3">
                      <CreditCard className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs">No active insurance query loaded.</p>
                      <button
                        type="button"
                        onClick={handleCheckInsurance}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                      >
                        Verify Insurance via RSSB
                      </button>
                    </div>
                  )}
                </div>

                {/* Patient Consents summary for verified citizen */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Recorded Consent (Law N° 058/2021)
                  </h4>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Under Rwanda Law N° 058/2021 relating to the protection of personal data and privacy, patient records accessed through the national identity and health exchange infrastructure are strictly logged.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Consent:</span>
                      <span className="text-emerald-400 font-bold">GRANTED</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Channel:</span>
                      <span>Verbal Witnessed Intake</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RWANDA HOSPITAL DIRECTORY SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'directory' && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  placeholder="Search by hospital name, district, or city..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
                />
              </div>

              {/* Type Select */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400">Type:</label>
                <select
                  value={selectedFacilityType}
                  onChange={(e) => setSelectedFacilityType(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">All Facility Types</option>
                  <option value="TEACHING">Teaching Hospital</option>
                  <option value="REFERRAL">Referral Hospital</option>
                  <option value="SPECIALIZED">Specialized Hospital</option>
                  <option value="DISTRICT">District Hospital</option>
                  <option value="PRIVATE">Private Hospital</option>
                </select>
              </div>
            </div>

            {/* Province Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-semibold mr-1">Provinces:</span>
              {['ALL', 'Kigali City', 'Northern', 'Southern', 'Eastern', 'Western'].map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setSelectedProvince(prov)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedProvince === prov
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                  }`}
                >
                  {prov === 'ALL' ? 'All Rwanda' : prov}
                </button>
              ))}
            </div>
          </div>

          {/* Hospitals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFacilities.map((facility: Facility) => {
              const isCurrent = facility.id === activeFacilityId;
              return (
                <div
                  key={facility.id}
                  className={`p-5 rounded-2xl bg-slate-900 border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl shadow-indigo-950/50'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          facility.type === 'REFERRAL' || facility.type === 'TEACHING'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : facility.type === 'SPECIALIZED'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {facility.type}
                      </span>
                      {facility.emergency_available && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 flex items-center gap-1">
                          <Ambulance className="w-3 h-3" /> STAT 24/7
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">{facility.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{facility.district}, {facility.province}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono">{facility.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{facility.email}</span>
                      </div>
                    </div>

                    {/* Supported Insurances */}
                    <div className="pt-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Supported Insurances
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {facility.insurance_supported.slice(0, 4).map((ins) => (
                          <span
                            key={ins}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700"
                          >
                            {ins.replace('_', ' ')}
                          </span>
                        ))}
                        {facility.insurance_supported.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                            +{facility.insurance_supported.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Context Switcher button */}
                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">Code: {facility.code}</span>
                    {isCurrent ? (
                      <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Active Context
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveFacilityId(facility.id);
                          addToast({
                            type: 'info',
                            title: 'Facility Context Updated',
                            message: `Active clinical facility switched to ${facility.name}.`,
                          });
                        }}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Set as Active Facility →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. INTER-FACILITY REFERRALS SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'referrals' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">RHIE National Referral Network</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track inter-hospital patient transfers and specialized tertiary consultations across Rwanda.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowReferralModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              New Patient Referral
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 font-bold">
                  <tr>
                    <th className="p-4">Patient & NIN</th>
                    <th className="p-4">Origin Facility</th>
                    <th className="p-4">Destination</th>
                    <th className="p-4">Diagnosis & Reason</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {patientReferrals.map((ref: PatientReferral) => (
                    <tr key={ref.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{ref.patient_name}</div>
                        <div className="text-[11px] font-mono text-indigo-300">{ref.patient_nin}</div>
                      </td>
                      <td className="p-4 text-slate-300">
                        <div className="font-medium">{ref.source_facility_name}</div>
                        <div className="text-[10px] text-slate-400">{ref.referring_doctor_name}</div>
                      </td>
                      <td className="p-4 text-slate-300 font-medium">
                        <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                          <Building2 className="w-3.5 h-3.5" />
                          {ref.destination_facility_name}
                        </div>
                        {ref.ambulance_required && (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                            <Ambulance className="w-3 h-3" /> Ambulance Required
                          </span>
                        )}
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="font-bold text-slate-200 truncate">{ref.primary_diagnosis}</div>
                        <div className="text-[11px] text-slate-400 truncate">{ref.transfer_reason}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ref.priority === 'EMERGENCY'
                              ? 'bg-rose-500/20 text-rose-400'
                              : ref.priority === 'URGENT'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {ref.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ref.status === 'ACCEPTED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : ref.status === 'IN_TRANSIT'
                              ? 'bg-sky-500/20 text-sky-400'
                              : ref.status === 'COMPLETED'
                              ? 'bg-indigo-500/20 text-indigo-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {ref.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {ref.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => updateReferralStatus(ref.id, 'ACCEPTED', 'Accepted by destination receiving team')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[11px]"
                            >
                              Accept
                            </button>
                          )}
                          {ref.status === 'ACCEPTED' && (
                            <button
                              type="button"
                              onClick={() => updateReferralStatus(ref.id, 'IN_TRANSIT', 'Patient in ambulance dispatch')}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded text-[11px]"
                            >
                              In-Transit
                            </button>
                          )}
                          {ref.status === 'IN_TRANSIT' && (
                            <button
                              type="button"
                              onClick={() => updateReferralStatus(ref.id, 'COMPLETED', 'Patient safely received at destination ICU')}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-[11px]"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. LAW N° 058/2021 AUDIT TRAIL SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'audit_log' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Rwanda Law N° 058/2021 Data Protection Compliance Log
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  Every query to the NIDA National Identity provider, RSSB insurance verification API, and Rwanda Health Information Exchange (RHIE) is recorded for forensic security and regulatory compliance.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
                Audited & Encrypted
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 font-bold">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Staff / Practitioner</th>
                    <th className="p-4">Facility</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Target Citizen NIN</th>
                    <th className="p-4">Clinical Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
                  {accessAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/50">
                      <td className="p-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4 font-sans font-medium text-slate-200">
                        {log.staff_name} <span className="text-[10px] text-slate-400">({log.staff_role})</span>
                      </td>
                      <td className="p-4 font-sans text-slate-300">{log.facility_name}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-bold text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-indigo-300 font-bold">{log.patient_nin}</td>
                      <td className="p-4 font-sans text-slate-400 max-w-xs truncate">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD PATIENT CONSENT (LAW N° 058/2021) */}
      {/* ========================================================================= */}
      {showConsentModal && verifiedPatient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                Record Patient Consent
              </h3>
              <button
                type="button"
                onClick={() => setShowConsentModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitConsent} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block font-semibold mb-1">Citizen</label>
                <div className="p-2.5 rounded-xl bg-slate-850 font-bold text-white border border-slate-800">
                  {verifiedPatient.full_name} ({verifiedPatient.nin})
                </div>
              </div>

              <div>
                <label className="text-slate-400 block font-semibold mb-1">Consent Scope</label>
                <select
                  value={consentType}
                  onChange={(e) => setConsentType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="TREATMENT">Medical Treatment & Diagnostics</option>
                  <option value="REFERRAL">Inter-Facility Transfer & RHIE Exchange</option>
                  <option value="RESEARCH">Anonymized Clinical Quality Research</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block font-semibold mb-1">Verification Channel</label>
                <select
                  value={consentChannel}
                  onChange={(e) => setConsentChannel(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="VERBAL_WITNESSED">Verbal Witnessed Intake</option>
                  <option value="WRITTEN_FORM">Physical Signed Consent Form</option>
                  <option value="DIGITAL_SMS_OTP">Digital Mobile Money / SMS OTP Verification</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block font-semibold mb-1">Specific Clinical Purpose</label>
                <textarea
                  rows={3}
                  value={consentPurpose}
                  onChange={(e) => setConsentPurpose(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/50 text-[11px] text-indigo-300">
                Data recorded is safeguarded in conformity with Rwanda Law N° 058/2021.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowConsentModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingConsent}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
                >
                  {isSubmittingConsent ? 'Recording...' : 'Record Consent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE INTER-FACILITY REFERRAL */}
      {/* ========================================================================= */}
      {showReferralModal && verifiedPatient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-400" />
                Create Inter-Facility Referral (RHIE)
              </h3>
              <button
                type="button"
                onClick={() => setShowReferralModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReferral} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block font-semibold mb-1">Patient</label>
                <div className="p-2.5 rounded-xl bg-slate-850 font-bold text-white border border-slate-800">
                  {verifiedPatient.full_name} • Age {verifiedPatient.age} ({verifiedPatient.gender})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block font-semibold mb-1">Destination Facility</label>
                  <select
                    value={referralDestFacility}
                    onChange={(e) => setReferralDestFacility(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {RWANDA_FACILITIES.filter((f) => f.id !== activeFacilityId).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block font-semibold mb-1">Priority</label>
                  <select
                    value={referralPriority}
                    onChange={(e) => setReferralPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value="ROUTINE">Routine (Next Available)</option>
                    <option value="URGENT">Urgent (Within 24 Hours)</option>
                    <option value="EMERGENCY">Emergency (STAT Transfer)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block font-semibold mb-1">Primary Clinical Diagnosis</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Intracranial Hemorrhage / Complex Fractures"
                  value={referralDiagnosis}
                  onChange={(e) => setReferralDiagnosis(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block font-semibold mb-1">Reason for Transfer</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Requires Tertiary Neurosurgery and ICU bed..."
                  value={referralReason}
                  onChange={(e) => setReferralReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ambulance className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-bold text-slate-200">Dispatch Ambulance Fleet</div>
                    <div className="text-[10px] text-slate-400">Request mobile critical transport team</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={referralAmbulance}
                  onChange={(e) => setReferralAmbulance(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReferralModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReferral}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  {isSubmittingReferral ? 'Submitting...' : 'Submit Referral'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* PRO FEATURE: ULTRA-HIGH-RES BIOMETRIC PHOTO INSPECTION MODAL */}
      {/* ========================================================================= */}
      {showPhotoZoomModal && verifiedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg p-6 shadow-2xl text-slate-100 space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">NIDA Facial Biometric Verification</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoZoomModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* High-Res Photo with Biometric Overlay Ring */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/50 bg-slate-950 p-2 text-center group">
              <img
                src={verifiedPatient.photo_url}
                alt={verifiedPatient.full_name}
                referrerPolicy="no-referrer"
                className="w-full h-80 object-cover rounded-xl shadow-2xl mx-auto"
              />

              {/* Facial recognition bounding box indicator */}
              <div className="absolute inset-x-12 inset-y-8 border-2 border-dashed border-cyan-400/60 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between text-[10px] font-mono text-cyan-300">
                  <span>FACIAL_ID_LENS</span>
                  <span>ISO/IEC 19794-5</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-emerald-400">
                  <span>MATCH: {biometricMatchScore}%</span>
                  <span>CONFIRMED</span>
                </div>
              </div>
            </div>

            {/* Citizen Biometric Summary */}
            <div className="space-y-2 text-xs bg-slate-850 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Citizen Name:</span>
                <span className="font-bold text-white">{verifiedPatient.full_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">National ID:</span>
                <span className="font-mono text-cyan-300 font-bold">{verifiedPatient.nin}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Date of Birth & Gender:</span>
                <span className="text-slate-200">{verifiedPatient.dob} ({verifiedPatient.age} yrs) • {verifiedPatient.gender}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Registry Facility:</span>
                <span className="text-slate-200">{verifiedPatient.registered_facility_name}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Verification Source:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> NIDA National Biometrics Registry
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPhotoZoomModal(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPhotoZoomModal(false);
                  setShowSmartIdCardModal(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all"
              >
                <QrCode className="w-4 h-4" />
                Generate Smart Digital ID Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRO FEATURE: PRINTABLE SMART DIGITAL PATIENT ID CARD PASS */}
      {/* ========================================================================= */}
      {showSmartIdCardModal && verifiedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl text-slate-100 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Rwanda Smart Patient Digital Pass</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSmartIdCardModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Smart Card Printable Canvas */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950/80 border-2 border-cyan-500/40 shadow-2xl space-y-4 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                    RW
                  </div>
                  <div>
                    <div className="text-xs font-black text-white uppercase tracking-wider">
                      Republic of Rwanda
                    </div>
                    <div className="text-[10px] text-cyan-300 font-mono">
                      Ministry of Health • National Patient Pass
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  VERIFIED CITIZEN
                </span>
              </div>

              {/* Photo & Demographics */}
              <div className="flex items-center gap-4">
                <img
                  src={verifiedPatient.photo_url}
                  alt={verifiedPatient.full_name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-cyan-400 shadow-xl"
                />
                <div className="space-y-1 min-w-0">
                  <h4 className="text-lg font-black text-white tracking-tight truncate">
                    {verifiedPatient.full_name}
                  </h4>
                  <div className="text-xs font-mono text-cyan-300 font-bold">
                    NIN: {verifiedPatient.nin}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    DOB: <strong>{verifiedPatient.dob}</strong> ({verifiedPatient.age} yrs) • Gender: {verifiedPatient.gender}
                  </div>
                  <div className="text-[11px] text-rose-400 font-bold">
                    Blood Group: {verifiedPatient.blood_group}
                  </div>
                </div>
              </div>

              {/* Insurance & QR Code strip */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Insurance Scheme</div>
                  <div className="font-bold text-white mt-0.5">
                    {insuranceData?.provider_display_name || 'RSSB / Mutuelle de Santé'}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                    Policy: {insuranceData?.policy_number || 'ACTIVE-2026'} ({insuranceData?.coverage_percentage || 85}% Coverage)
                  </div>
                </div>

                {/* Simulated QR Code matrix */}
                <div className="w-16 h-16 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
                  <QrCode className="w-14 h-14 text-slate-900" />
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                <span>RHIE: {verifiedPatient.rhie_id}</span>
                <span>Security Token: NIDA-2026-RW-PRO</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Law N° 058/2021 Compliant
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSmartIdCardModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Print Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
