import React, { useState } from 'react';
import {
  Globe,
  Plane,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Building,
  User,
  ShieldCheck,
  Send,
  Calendar,
  Printer,
  Sparkles,
} from 'lucide-react';
import { MOCK_MEDICAL_TRAVEL_CASES } from '../data/mockRwandaNationalData';
import { MedicalTravelCase } from '../types';
import { useHospital } from '../context/HospitalContext';

export const InternationalMedicalTravelView: React.FC = () => {
  const { showToast } = useHospital();
  const [cases, setCases] = useState<MedicalTravelCase[]>(MOCK_MEDICAL_TRAVEL_CASES);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Letter & Modal
  const [activeLetterCase, setActiveLetterCase] = useState<MedicalTravelCase | null>(null);
  const [showInquiryModal, setShowInquiryModal] = useState<boolean>(false);

  // New Inquiry form
  const [patientName, setPatientName] = useState<string>('');
  const [passportNumber, setPassportNumber] = useState<string>('A08761234');
  const [originCountry, setOriginCountry] = useState<string>('DR Congo (Goma / Bukavu)');
  const [specialty, setSpecialty] = useState<MedicalTravelCase['specialty']>('Cardiology');
  const [facilityName, setFacilityName] = useState<string>('King Faisal Hospital Rwanda (KFH)');
  const [doctorName, setDoctorName] = useState<string>('Dr. Ezechiel Gasana, Senior Interventional Cardiologist');
  const [diagnosis, setDiagnosis] = useState<string>('Coronary Artery Disease requiring urgent PCI / Stenting');
  const [costUsd, setCostUsd] = useState<number>(6500);

  const filteredCases = cases.filter((c) => {
    if (selectedSpecialty !== 'ALL' && c.specialty !== selectedSpecialty) return false;
    if (selectedStage !== 'ALL' && c.stage !== selectedStage) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.patient_name.toLowerCase().includes(q);
      const matchPass = c.passport_number ? c.passport_number.toLowerCase().includes(q) : false;
      const matchCountry = (c.origin_country || c.destination_country || '').toLowerCase().includes(q);
      const matchDiag = (c.diagnosis || c.specialty || '').toLowerCase().includes(q);
      if (!matchName && !matchPass && !matchCountry && !matchDiag) return false;
    }
    return true;
  });

  const handleStageAdvance = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const stages: MedicalTravelCase['stage'][] = [
          'INQUIRY',
          'RECORD_REVIEW',
          'TREATMENT_PLAN',
          'VISA_SUPPORT',
          'ADMITTED',
          'FOLLOW_UP',
        ];
        const nextIndex = Math.min(stages.indexOf(c.stage) + 1, stages.length - 1);
        return {
          ...c,
          stage: stages[nextIndex],
          visa_status: nextIndex >= 3 ? 'ISSUED' : c.visa_status,
        };
      })
    );

    showToast({
      title: 'Medical Travel Stage Advanced',
      message: 'Case status updated and protocol notification dispatched.',
      type: 'success',
    });
  };

  const handleCreateInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const newCase: MedicalTravelCase = {
      id: `mt-${Date.now()}`,
      case_number: `IMT-2026-RW-${Math.floor(1000 + Math.random() * 9000)}`,
      patient_id: `p-int-${Date.now()}`,
      patient_name: patientName,
      patient_mrn: `MRN-INT-${Math.floor(1000 + Math.random() * 9000)}`,
      patient_nin: 'N/A (International Passport)',
      destination_country: 'Rwanda',
      hospital_name: facilityName,
      specialist_name: doctorName,
      passport_number: passportNumber,
      origin_country: originCountry,
      specialty,
      target_facility: facilityName,
      attending_specialist: doctorName,
      diagnosis,
      stage: 'TREATMENT_PLAN',
      estimated_cost_usd: costUsd,
      estimated_cost_rwf: costUsd * 1320,
      insurance_covered_amount: 0,
      patient_share_amount: costUsd * 1320,
      medical_visa_status: 'APPROVED',
      fit_to_fly_certified: true,
      visa_status: 'ISSUED',
      visa_support_letter_ref: `MINAFFET-MED-${Math.floor(1000 + Math.random() * 9000)}/2026`,
      arrival_date: '2026-04-12',
      medical_summary: diagnosis,
      created_at: new Date().toISOString(),
      notes: diagnosis,
    };

    setCases((prev) => [newCase, ...prev]);
    setShowInquiryModal(false);
    showToast({
      title: 'International Patient Enrolled',
      message: `${patientName} registered into Rwanda Medical Tourism Hub.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Hub Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Globe className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  Rwanda International Medical Travel & Regional Referral Hub
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Visa & Concierge
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Coordinating cross-border specialist referrals for Cardiology (KFH), Oncology (Butaro), Robotic Surgery (IRCAD Africa), Organ Transplants, and Fertility.
                </p>
              </div>
            </div>
          </div>

          <button
            id="new-inquiry-btn"
            onClick={() => setShowInquiryModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-900/40"
          >
            <Plus className="w-3.5 h-3.5" />
            New International Inquiry
          </button>
        </div>

        {/* 6-Stage Process Flow Indicator */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
            Clinical Concierge Protocol
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
            <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase">1. Inquiry</div>
              <div className="text-slate-200 text-xs font-semibold mt-0.5">Initial Contact</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase">2. Records</div>
              <div className="text-slate-200 text-xs font-semibold mt-0.5">DICOM / EHR Review</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase">3. Plan & Cost</div>
              <div className="text-slate-200 text-xs font-semibold mt-0.5">USD Quote & Regimen</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase">4. Visa Letter</div>
              <div className="text-slate-200 text-xs font-semibold mt-0.5">MINAFFET Endorsed</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase">5. Admission</div>
              <div className="text-slate-200 text-xs font-semibold mt-0.5">Hospital Inpatient</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase">6. Follow-up</div>
              <div className="text-slate-200 text-xs font-semibold mt-0.5">Telemedicine Post-Op</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="search-travel-cases"
                type="text"
                placeholder="Search patient, passport, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
              />
            </div>

            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Specialties ({cases.length})</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Oncology">Oncology</option>
              <option value="Orthopedic Surgery">Orthopedic Surgery</option>
              <option value="Organ Transplant">Organ Transplant</option>
              <option value="IVF / Fertility">IVF / Fertility</option>
              <option value="Cosmetic Surgery">Cosmetic Surgery</option>
            </select>

            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Pipeline Stages</option>
              <option value="INQUIRY">Inquiry</option>
              <option value="RECORD_REVIEW">Record Review</option>
              <option value="TREATMENT_PLAN">Treatment Plan</option>
              <option value="VISA_SUPPORT">Visa Support</option>
              <option value="ADMITTED">Admitted</option>
              <option value="FOLLOW_UP">Follow-up</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCases.map((c) => {
          const isVisaIssued = c.visa_status === 'ISSUED';

          return (
            <div
              key={c.id}
              id={`travel-case-${c.id}`}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                      {c.specialty}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                      Stage: {c.stage.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-1">{c.patient_name}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      {c.origin_country} • Passport: <strong className="font-mono text-slate-300">{c.passport_number}</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Estimated Cost</div>
                  <div className="text-base font-black text-emerald-400">
                    ${c.estimated_cost_usd.toLocaleString()} USD
                  </div>
                  <div className="text-[10px] text-slate-500">
                    ~{(c.estimated_cost_rwf / 1000000).toFixed(1)}M RWF
                  </div>
                </div>
              </div>

              {/* Clinical Details */}
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-slate-400">Diagnosis:</span>{' '}
                  <strong className="text-slate-200">{c.diagnosis}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Facility:</span>{' '}
                  <strong className="text-slate-300">{c.target_facility}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Specialist:</span>{' '}
                  <span className="text-slate-300">{c.attending_specialist}</span>
                </div>
              </div>

              {/* Visa & Arrival Status Box */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Medical Visa Status</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isVisaIssued ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Letter Issued ({c.visa_support_letter_ref})
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium">Pending Clinician Review</span>
                    )}
                  </div>
                </div>

                {c.arrival_date && (
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Scheduled Arrival</div>
                    <div className="text-slate-200 font-semibold">{c.arrival_date}</div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <button
                  onClick={() => setActiveLetterCase(c)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium border border-slate-700 transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Medical Visa Letter
                </button>

                <button
                  id={`advance-stage-${c.id}`}
                  onClick={() => handleStageAdvance(c.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-900/30"
                >
                  Advance Stage →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Official Medical Visa Letter Modal */}
      {activeLetterCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <FileText className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">Official Medical Visa Support Letter</h3>
              </div>
              <button
                onClick={() => setActiveLetterCase(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="bg-white text-slate-950 rounded-xl p-6 space-y-4 font-serif shadow-inner text-xs leading-relaxed">
              <div className="text-center border-b border-slate-300 pb-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                  REPUBLIC OF RWANDA
                </div>
                <div className="text-xs font-black uppercase text-indigo-950 mt-0.5">
                  {activeLetterCase.target_facility}
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  Directorate of Clinical Services & International Patient Concierge
                </div>
                <div className="font-mono text-[10px] font-bold text-slate-600 mt-1">
                  Ref: {activeLetterCase.visa_support_letter_ref} • Date: {new Date().toLocaleDateString()}
                </div>
              </div>

              <div>
                <p>
                  <strong>TO:</strong> The Directorate General of Immigration and Emigration (MINAFFET)
                  <br />
                  Kigali, Republic of Rwanda
                </p>
                <p className="mt-2 font-bold uppercase text-[11px] underline">
                  SUBJECT: OFFICIAL MEDICAL VISA FACILITATION & INVITATION FOR {activeLetterCase.patient_name}
                </p>
              </div>

              <p>
                This letter confirms that <strong>{activeLetterCase.patient_name}</strong>, holder of Passport No.{' '}
                <strong className="font-mono">{activeLetterCase.passport_number}</strong> from{' '}
                <strong>{activeLetterCase.origin_country}</strong>, has been officially scheduled for specialized
                inpatient medical management at our institution.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1 font-sans text-[11px]">
                <div>
                  <strong>Primary Diagnosis:</strong> {activeLetterCase.diagnosis}
                </div>
                <div>
                  <strong>Specialty Department:</strong> {activeLetterCase.specialty}
                </div>
                <div>
                  <strong>Attending Consultant:</strong> {activeLetterCase.attending_specialist}
                </div>
                <div>
                  <strong>Estimated Treatment Package:</strong> ${activeLetterCase.estimated_cost_usd.toLocaleString()}{' '}
                  USD
                </div>
              </div>

              <p>
                We kindly request your esteemed office to grant the patient and one authorized medical escort a Special
                Entry Medical Visa to enter Rwanda for their procedure.
              </p>

              <div className="pt-4 flex justify-between items-end border-t border-slate-200 font-sans text-[10px]">
                <div>
                  <div className="font-bold">Medical Director & CMO</div>
                  <div>Republic of Rwanda National Referral Council</div>
                </div>
                <div className="text-right text-emerald-800 font-bold border border-emerald-600 px-2 py-1 rounded">
                  APPROVED & VERIFIED
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Export PDF Letter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Globe className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-100">Register International Patient Inquiry</h3>
              </div>
              <button
                onClick={() => setShowInquiryModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateInquiry} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                    placeholder="e.g. Kasongo Mwamba"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Passport Number</label>
                  <input
                    type="text"
                    required
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Country of Residence / Origin</label>
                  <input
                    type="text"
                    required
                    value={originCountry}
                    onChange={(e) => setOriginCountry(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                    placeholder="e.g. DR Congo, Burundi, Kenya"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Specialty</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  >
                    <option value="Cardiology">Cardiology (King Faisal)</option>
                    <option value="Oncology">Oncology (Butaro / KFH)</option>
                    <option value="Orthopedic Surgery">Orthopedic Surgery</option>
                    <option value="Organ Transplant">Organ Transplant (RMH / KFH)</option>
                    <option value="IVF / Fertility">IVF / Fertility</option>
                    <option value="Cosmetic Surgery">Cosmetic Surgery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Diagnosis & Clinical Reason</label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Rwandan Facility</label>
                  <input
                    type="text"
                    required
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Estimated Cost (USD)</label>
                  <input
                    type="number"
                    required
                    value={costUsd}
                    onChange={(e) => setCostUsd(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInquiryModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-travel-inquiry"
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-900/40"
                >
                  <Send className="w-3.5 h-3.5" />
                  Initiate Concierge Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
