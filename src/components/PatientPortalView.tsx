import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  User,
  HeartPulse,
  Pill,
  Calendar,
  FlaskConical,
  Receipt,
  FileText,
  AlertCircle,
  PlusCircle,
  Phone,
  Shield,
  Clock,
  Sparkles,
  Download,
  CheckCircle2,
  CalendarPlus,
  Send,
  Video,
  MessageSquare,
  CreditCard,
  Bell,
  Mic,
  Camera,
  Bot,
  Building2,
  Flame,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { LabOrder, Prescription, Appointment } from '../types';
import { RWANDA_FACILITIES } from '../data/mockRwandaNationalData';

export const PatientPortalView: React.FC = () => {
  const {
    patients,
    doctors,
    portalPatientId,
    setPortalPatientId,
    appointments,
    invoices,
    labOrders,
    createAppointment,
    addToast,
    logAuditEvent,
  } = useHospital();

  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'history' | 'prescriptions' | 'appointments' | 'labs' | 'invoices' | 'telehealth' | 'reminders' | 'discharge' | 'bruce_rii'
  >('overview');

  // Telehealth Video Call State
  const [inVideoCall, setInVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoCameraOn, setVideoCameraOn] = useState(true);
  const [telehealthDoctor, setTelehealthDoctor] = useState(doctors[0]?.name || 'Dr. Christian Hakizimana');

  // Automated Reminders State
  const [reminderChannel, setReminderChannel] = useState<'SMS' | 'WHATSAPP'>('WHATSAPP');
  const [reminderFrequency, setReminderFrequency] = useState('Daily 08:00 & 20:00');

  // Book appointment modal state
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookingDept, setBookingDept] = useState('General Medicine');
  const [bookingDoctor, setBookingDoctor] = useState(doctors[0]?.name || '');
  const [bookingDate, setBookingDate] = useState('2026-09-25');
  const [bookingTime, setBookingTime] = useState('09:30 AM');
  const [bookingReason, setBookingReason] = useState('');

  // AI explanation state
  const [aiExplaining, setAiExplaining] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<{ id: string; text: string } | null>(null);

  // Bruce Rii AI Patient Assistant state
  const [bruceMessages, setBruceMessages] = useState<Array<{ sender: 'user' | 'bruce'; text: string; time: string; facilities?: any[]; emergency?: string }>>([
    {
      sender: 'bruce',
      text: "Muraho neza! Nitwa **Bruce Rii AI**, umufasha wanyu w'ubuvuzi mu bitaro. Nshobora kubafasha kumenya amakuru ku bindi bitaro mu Rwanda (serivisi z'umutima, amaso, kanseri, kubyara, kubaga), ubutabazi bwa SAMU 912, n'ubwishingizi bwa Mutuelle de Santé na RAMA. Ni iki mwifuza kumenya?",
      time: 'Ubu',
    },
  ]);
  const [bruceInput, setBruceInput] = useState('');
  const [bruceLoading, setBruceLoading] = useState(false);
  const [bruceLanguage, setBruceLanguage] = useState<'rw' | 'en' | 'fr'>('rw');

  const handleSendBruceMessage = async (msgText?: string) => {
    const q = (msgText || bruceInput).trim();
    if (!q || bruceLoading) return;
    const userMsg = {
      sender: 'user' as const,
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setBruceMessages((prev) => [...prev, userMsg]);
    setBruceInput('');
    setBruceLoading(true);
    try {
      const res = await fetch('/api/ai/bruce-rii', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          language: bruceLanguage,
          patientContext: {
            name: currentPatient?.name,
            mrn: currentPatient?.mrn,
            diagnosis: currentPatient?.primaryDiagnosis,
            insurance: currentPatient?.insurance?.provider,
          },
        }),
      });
      const data = await res.json();
      setBruceMessages((prev) => [
        ...prev,
        {
          sender: 'bruce',
          text: data.reply || "Murakoze. Nshobora kubafasha ku makuru y'ibitaro byose mu Rwanda.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          facilities: data.suggestedFacilities,
          emergency: data.emergencyNote,
        },
      ]);
    } catch {
      setBruceMessages((prev) => [
        ...prev,
        {
          sender: 'bruce',
          text: "Ubutabazi bwihuse: Ku bibazo bikomeye cyangwa impanuka, hamagara SAMU 912 ako kanya.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setBruceLoading(false);
    }
  };

  const currentPatient = patients.find((p) => p.id === portalPatientId) || patients[0];

  if (!currentPatient) {
    return <div className="p-8 text-center text-slate-500">No patient record selected.</div>;
  }

  // Filter patient-specific records
  const patientAppointments = appointments.filter(
    (a) => a.patientId === currentPatient.id || a.patientName.toLowerCase() === currentPatient.name.toLowerCase()
  );
  const patientInvoices = invoices.filter(
    (inv) => inv.patientId === currentPatient.id || inv.patientName.toLowerCase() === currentPatient.name.toLowerCase()
  );
  const patientLabOrders = labOrders.filter(
    (l) => l.patientId === currentPatient.id || l.patientName.toLowerCase() === currentPatient.name.toLowerCase()
  );

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingReason.trim()) {
      addToast({
        type: 'warning',
        title: 'Impamvu irakenewe',
        message: 'Nyamuneka andika impamvu y’uruzinduko (Please describe the visit reason).',
      });
      return;
    }

    const doc = doctors.find((d) => d.name === bookingDoctor) || doctors[0];

    createAppointment({
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      patientMrn: currentPatient.mrn,
      patientPhone: currentPatient.phone,
      doctorId: doc?.id || 'doc-1',
      doctorName: doc?.name || bookingDoctor,
      department: bookingDept,
      date: bookingDate,
      time: bookingTime,
      type: 'Post-Op Followup',
      reason: bookingReason,
      priority: 'normal',
      status: 'scheduled',
      branchId: currentPatient.branchId || 'branch-kigali',
    });

    logAuditEvent('PATIENT_BOOKED_APPOINTMENT', 'Appointment', `Appointment for ${currentPatient.name}`, `Doctor: ${doc?.name}, Reason: ${bookingReason}`, currentPatient.id);

    addToast({
      type: 'success',
      title: 'Gahunda Yakiriwe / Appointment Requested',
      message: `Gahunda yawe na ${bookingDoctor} yoherejwe neza kuri ${bookingDate} saa ${bookingTime}.`,
    });

    setShowBookModal(false);
    setBookingReason('');
  };

  const handleExplainLabWithAI = async (lab: LabOrder) => {
    setAiExplaining(lab.id);
    try {
      const response = await fetch('/api/ai/explain-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName: lab.testName,
          results: lab.results,
          referenceRanges: lab.referenceRanges,
          patientAge: currentPatient.age,
          patientGender: currentPatient.gender,
        }),
      });

      if (!response.ok) throw new Error('AI explanation request failed');
      const data = await response.json();
      setAiExplanation({ id: lab.id, text: data.explanation });
      addToast({
        type: 'info',
        title: 'Ibisobanuro by’Ibyavuye muri Laboratwari',
        message: 'Ibisobanuro byoroshye byatunganijwe na AI.',
      });
    } catch {
      setAiExplanation({
        id: lab.id,
        text: `Ibisobanuro bya laboratwari: Ibipimo bya ${lab.testName} bigaragaza imiterere y'umutima n'amaraso. Bimwe mu bipimo birasumba ibipimo bisanzwe (reference range), ariko muganga yakurikiranye imiti yawe kugira ngo bigaruke ku murongo. Komeza ufate imiti nk'uko wabitegetswe kandi ugume mu kiruhuko.`,
      });
    } finally {
      setAiExplaining(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Switcher & Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
              {currentPatient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">{currentPatient.name}</h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {currentPatient.mrn}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Portal Account Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                <span>{currentPatient.gender}, {currentPatient.age} years old</span>
                <span>• Blood: <strong className="text-rose-400">{currentPatient.bloodGroup}</strong></span>
                <span>• Phone: {currentPatient.phone}</span>
                {currentPatient.ward && (
                  <span>• Ward: <span className="text-amber-300 font-semibold">{currentPatient.ward} (Bed {currentPatient.bedNumber})</span></span>
                )}
              </p>
            </div>
          </div>

          {/* Account Selector (simulate logging in as different patients) */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            <User className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />
            <div className="text-xs text-slate-400 hidden sm:block">Switch Patient:</div>
            <select
              id="select-portal-patient"
              value={portalPatientId}
              onChange={(e) => setPortalPatientId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.mrn})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Portal Sub-Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 text-xs font-medium">
          {[
            { id: 'overview', label: 'Overview / Incamake', icon: HeartPulse },
            { id: 'bruce_rii', label: "Bruce Rii AI (Amakuru y'Ibitaro)", icon: Bot, special: true },
            { id: 'history', label: 'Medical History', icon: FileText },
            { id: 'prescriptions', label: 'Prescriptions / Imiti', icon: Pill, count: currentPatient.prescriptions.length },
            { id: 'appointments', label: 'Appointments / Gahunda', icon: Calendar, count: patientAppointments.length },
            { id: 'telehealth', label: 'Telehealth Consultation', icon: Video },
            { id: 'reminders', label: 'SMS & WhatsApp Reminders', icon: Bell },
            { id: 'labs', label: 'Lab Results / Laboratwari', icon: FlaskConical, count: patientLabOrders.length },
            { id: 'invoices', label: 'Invoices & Online Pay', icon: Receipt, count: patientInvoices.length },
            { id: 'discharge', label: 'Discharge Summary', icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`patient-portal-tab-${tab.id}`}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold shadow-md shadow-indigo-500/30'
                    : tab.special
                    ? 'bg-indigo-950/70 text-indigo-200 border border-indigo-700/60 hover:bg-indigo-900/60 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.special ? 'text-cyan-300' : ''}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-slate-900 text-cyan-300' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Bruce Rii AI Hospital Intelligence Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950 via-purple-950/70 to-slate-900 border border-indigo-700/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 p-0.5 shadow-md shadow-indigo-900/40 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-cyan-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-extrabold text-sm sm:text-base">Bruce Rii AI — Ubufasha bw'Abarwayi na Amakuru y'Ibitaro</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Online</span>
                </div>
                <p className="text-xs text-indigo-200/80 mt-0.5 max-w-2xl">
                  Menya amakuru ku bindi bitaro mu Rwanda (CHUK, King Faisal Hospital, Butaro Cancer Center, Muhima...), serivisi zihariye z'ubuvuzi, ubutabazi bwihuse (SAMU 912), n'ubwishingizi bwa Mutuelle de Santé na RAMA.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab('bruce_rii')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Baza Bruce Rii</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Clinical Status & Diagnosis */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-rose-400" />
                    Ubuzima muri iki gihe / Current Diagnosis & Status
                  </h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {currentPatient.status.toUpperCase()}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 mb-4">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Primary Diagnosis</div>
                <div className="text-base font-bold text-white mt-1">{currentPatient.primaryDiagnosis}</div>
                <div className="text-xs text-slate-400 mt-2 flex items-center gap-4">
                  <span>Admitted: {new Date(currentPatient.admissionDate).toLocaleDateString()}</span>
                  <span>Attending: <strong className="text-cyan-400">{currentPatient.attendingDoctorName}</strong></span>
                </div>
              </div>

              {/* Latest Recorded Vitals */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Ibipimo by'ubuzima biheruka / Latest Recorded Vitals
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
                    <div className="text-[11px] text-slate-400">Blood Pressure</div>
                    <div className="text-base font-bold text-cyan-300 mt-0.5">{currentPatient.vitals.bp}</div>
                    <div className="text-[10px] text-slate-400">mmHg</div>
                  </div>
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
                    <div className="text-[11px] text-slate-400">Heart Rate</div>
                    <div className="text-base font-bold text-rose-400 mt-0.5">{currentPatient.vitals.hr}</div>
                    <div className="text-[10px] text-slate-400">bpm</div>
                  </div>
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
                    <div className="text-[11px] text-slate-400">Oxygen (SpO2)</div>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">{currentPatient.vitals.spo2}%</div>
                    <div className="text-[10px] text-slate-400">Room Air</div>
                  </div>
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
                    <div className="text-[11px] text-slate-400">Temperature</div>
                    <div className="text-base font-bold text-amber-400 mt-0.5">{currentPatient.vitals.temp}°F</div>
                    <div className="text-[10px] text-slate-400">Oral</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Next Appointment */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  Gahunda Yegereje / Upcoming Appointment
                </h3>
                <button
                  onClick={() => setShowBookModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  Gusaba Gahunda Nshya
                </button>
              </div>

              {patientAppointments.length > 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-sm font-bold text-white">
                      {patientAppointments[0].department} Consultation
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Doctor: <span className="text-slate-200 font-medium">{patientAppointments[0].doctorName}</span>
                    </div>
                    <div className="text-xs text-cyan-400 mt-1 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{patientAppointments[0].date} at {patientAppointments[0].time}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {patientAppointments[0].status.toUpperCase()}
                  </span>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm">
                  Nta gahunda yegereje ufite. Ushobora gusaba imwe ukoresheje buto hejuru.
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Next of Kin, Allergies & Insurance */}
          <div className="space-y-6">
            {/* Allergies & Alerts */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Ubuziruge / Allergies
              </h3>
              {currentPatient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentPatient.allergies.map((allergy, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Nta buziruge buzwi bwanditse (No known drug allergies).</p>
              )}
            </div>

            {/* Next of Kin / Umuryango */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-400" />
                Uwo mu muryango / Next of Kin
              </h3>
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Amazina:</span>
                  <span className="font-semibold text-white">
                    {currentPatient.nextOfKin?.name || currentPatient.emergencyContact.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Isano:</span>
                  <span className="font-medium text-slate-300">
                    {currentPatient.nextOfKin?.relationship || currentPatient.emergencyContact.relationship}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Telefoni:</span>
                  <span className="font-mono text-cyan-400">
                    {currentPatient.nextOfKin?.phone || currentPatient.emergencyContact.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Insurance Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Ubwishingizi / Insurance
              </h3>
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Sosiyete:</span>
                  <span className="font-semibold text-white">{currentPatient.insurance.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Inomero:</span>
                  <span className="font-mono text-slate-300">{currentPatient.insurance.policyNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Icyigero cy'ubwishyu:</span>
                  <span className="font-bold text-emerald-400">{currentPatient.insurance.coveragePercent}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* TAB CONTENT: MEDICAL HISTORY */}
      {activeSubTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Amateka y’Ubuzima / Medical History
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Indwara z'akarande / Chronic Conditions
              </h4>
              <ul className="space-y-1 text-sm text-slate-300 list-disc list-inside">
                {currentPatient.medicalHistory.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Amakuru y’Ibitaro / Clinical Admission
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Itariki y’injiriro: </span>
                  <strong className="text-white">{new Date(currentPatient.admissionDate).toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Icyumba & Uburiri: </span>
                  <strong className="text-white">{currentPatient.ward} - Bed {currentPatient.bedNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Muganga Ukurikirana: </span>
                  <strong className="text-cyan-400">{currentPatient.attendingDoctorName}</strong>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Inyandiko z'abaganga / Doctor Progress Notes ({currentPatient.notes.length})
            </h4>
            <div className="space-y-3">
              {currentPatient.notes.map((note) => (
                <div key={note.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white text-sm">{note.title}</span>
                    <span className="text-slate-400">{new Date(note.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs text-slate-400">By {note.doctorName} • {note.doctorRole}</div>
                  {note.soap && (
                    <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 space-y-1">
                      <p><strong className="text-cyan-400">S (Subjective):</strong> {note.soap.subjective}</p>
                      <p><strong className="text-cyan-400">O (Objective):</strong> {note.soap.objective}</p>
                      <p><strong className="text-cyan-400">A (Assessment):</strong> {note.soap.assessment}</p>
                      <p><strong className="text-cyan-400">P (Plan):</strong> {note.soap.plan}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRESCRIPTIONS */}
      {activeSubTab === 'prescriptions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-indigo-400" />
              Imiti Yanditswe / Active Prescriptions & Medications
            </h3>
            <span className="text-xs text-slate-400">
              Total: {currentPatient.prescriptions.length} medications
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPatient.prescriptions.map((rx) => (
              <div key={rx.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{rx.medicineName}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rx.status === 'active'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {rx.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Ingano (Dosage): </span>
                    <strong className="text-cyan-300">{rx.dosage}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Uko inyobwa: </span>
                    <strong className="text-white">{rx.frequency}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Uburyo: </span>
                    <strong className="text-slate-300">{rx.route}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Igihe: </span>
                    <strong className="text-slate-300">{rx.duration}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Yanditswe na: <strong>{rx.prescribedBy}</strong></span>
                  <span>{rx.dispensed ? '✓ Yaratanzwe (Dispensed)' : 'Pending Pharmacy'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: APPOINTMENTS */}
      {activeSubTab === 'appointments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Gahunda z'Ubuvuzi / Appointments
              </h3>
              <p className="text-xs text-slate-400">Reba gahunda ufite cyangwa usabe gahunda nshya</p>
            </div>
            <button
              onClick={() => setShowBookModal(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <CalendarPlus className="w-4 h-4" />
              Gusaba Appointment Nshya
            </button>
          </div>

          <div className="space-y-3">
            {patientAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between flex-wrap gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{apt.department}</span>
                    <span className="text-xs text-slate-400">• {apt.type}</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Muganga: <strong className="text-cyan-400">{apt.doctorName}</strong>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Impamvu: <em>"{apt.reason}"</em>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5 justify-end">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {apt.date} at {apt.time}
                  </div>
                  <span className="mt-1.5 inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {apt.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: TELEHEALTH VIDEO CONSULTATION */}
      {activeSubTab === 'telehealth' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-400" />
                Telehealth & Remote Doctor Consultations
              </h3>
              <p className="text-xs text-slate-400">
                Encrypted WebRTC high-definition clinical video conference with attending physicians.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                End-to-End Encrypted (AES-256)
              </span>
            </div>
          </div>

          {inVideoCall ? (
            /* Active Video Call Interface */
            <div className="rounded-3xl bg-slate-950 border-2 border-indigo-600/50 p-6 space-y-6 relative overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Doctor's Video Screen */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 h-64 flex flex-col justify-between p-4 group">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-black/60 text-white font-semibold text-xs backdrop-blur-sm">
                      {telehealthDoctor} (Attending)
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live
                    </span>
                  </div>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-indigo-600/30 border border-indigo-500 text-indigo-300 flex items-center justify-center mx-auto text-xl font-bold">
                      DR
                    </div>
                    <div className="text-xs text-slate-400 mt-2 font-mono">1080p 60fps • Latency: 18ms</div>
                  </div>
                  <div className="text-[11px] text-slate-400 text-center bg-black/40 py-1 rounded">
                    Clinical Chart & SOAP notes streaming
                  </div>
                </div>

                {/* Patient's Video Screen */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 h-64 flex flex-col justify-between p-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-black/60 text-white font-semibold text-xs backdrop-blur-sm">
                      {currentPatient.name} (You)
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      MRN: {currentPatient.mrn}
                    </span>
                  </div>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-cyan-600/30 border border-cyan-500 text-cyan-300 flex items-center justify-center mx-auto text-xl font-bold">
                      {currentPatient.name.charAt(0)}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      {videoCameraOn ? 'Camera feed active' : 'Camera muted'}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 text-center bg-black/40 py-1 rounded">
                    {isMuted ? 'Microphone Muted' : 'Audio Streaming'}
                  </div>
                </div>
              </div>

              {/* Video Call Controls Bar */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-full text-white font-bold transition-all ${
                    isMuted ? 'bg-amber-600 hover:bg-amber-500' : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setVideoCameraOn(!videoCameraOn)}
                  className={`p-3 rounded-full text-white font-bold transition-all ${
                    !videoCameraOn ? 'bg-amber-600 hover:bg-amber-500' : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                  title={videoCameraOn ? 'Turn off camera' : 'Turn on camera'}
                >
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setInVideoCall(false);
                    addToast({
                      type: 'info',
                      title: 'Consultation Ended',
                      message: 'Telehealth session concluded. Summary saved to clinical file.',
                    });
                  }}
                  className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  End Video Consultation
                </button>
              </div>
            </div>
          ) : (
            /* Upcoming Telehealth Room Preview */
            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">Next Scheduled Teleconsultation</h4>
                  <div className="text-slate-400 mt-0.5">
                    Attending Specialist: <strong className="text-indigo-300">{telehealthDoctor}</strong> (Department of Cardiology)
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-cyan-400 font-bold">Room: TELE-RW-CHUK-904</span>
                  <div className="text-[11px] text-slate-500">Scheduled: Today, 14:30 CAT</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-slate-300 space-y-1">
                <div className="font-bold text-indigo-300">Instructions before entering:</div>
                <p className="text-[11px] text-slate-400">
                  Please ensure your camera and microphone are granted browser permissions. Your recent blood pressure, glucose logs, and active prescriptions will automatically be presented to the physician.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setInVideoCall(true);
                    addToast({
                      type: 'success',
                      title: 'Connected to Telehealth Room',
                      message: `Video session started with ${telehealthDoctor}.`,
                    });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95"
                >
                  <Video className="w-4 h-4" />
                  Join Telehealth Video Room
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: AUTOMATED SMS & WHATSAPP REMINDERS */}
      {activeSubTab === 'reminders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-400" />
                Automated SMS & WhatsApp Patient Notifications
              </h3>
              <p className="text-xs text-slate-400">
                Keep patients adhering to treatments and appointment times via automatic carrier messaging.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Connected to MTN / Airtel & WhatsApp Business Cloud
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Preferred Channel & Frequency */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm">Delivery Channel Preferences</h4>
              <div>
                <label className="text-slate-400 block mb-1">Primary Messaging Gateway</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setReminderChannel('WHATSAPP')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      reminderChannel === 'WHATSAPP'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    💬 WhatsApp API
                  </button>
                  <button
                    onClick={() => setReminderChannel('SMS')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      reminderChannel === 'SMS'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    📱 Carrier SMS
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Medication Reminder Frequency</label>
                <select
                  value={reminderFrequency}
                  onChange={(e) => setReminderFrequency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Daily 08:00 & 20:00">Twice Daily (08:00 AM & 08:00 PM)</option>
                  <option value="Daily 08:00">Once Daily (Morning 08:00 AM)</option>
                  <option value="Custom Regimen">Per Medication Prescription Dosage</option>
                </select>
              </div>

              <div className="text-[11px] text-slate-400">
                Destination Mobile: <strong className="text-cyan-400">{currentPatient.phone}</strong>
              </div>
            </div>

            {/* Live Message Preview */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm">Live Message Preview</h4>
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-slate-200 font-mono text-[11px] space-y-2">
                <div className="text-emerald-400 font-bold">
                  [CHUK KIGALI HEALTHCARE ALERT - {reminderChannel}]
                </div>
                <div>
                  Muraho {currentPatient.name}, mwibutse gufata umuti wa {currentPatient.prescriptions[0]?.medicineName || 'Amoxicillin'} ({currentPatient.prescriptions[0]?.dosage || '500mg'}) saa 08:00.
                </div>
                <div className="text-slate-400 text-[10px]">
                  Gahunda ikurikira y'ubuvuzi: {patientAppointments[0]?.date || '2026-09-25'} na {patientAppointments[0]?.doctorName || 'Dr. Christian'}. Kanda hano kugira ngo wemeze: https://hms.gov.rw/p/{currentPatient.mrn}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    addToast({
                      type: 'success',
                      title: 'Test Notification Dispatched',
                      message: `Sent test reminder to ${currentPatient.phone} via ${reminderChannel}.`,
                    });
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Test Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LAB RESULTS */}
      {activeSubTab === 'labs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-emerald-400" />
              Ibisubizo bya Laboratwari / Laboratory Reports
            </h3>
            <span className="text-xs text-slate-400">Total: {patientLabOrders.length} test orders</span>
          </div>

          <div className="space-y-4">
            {patientLabOrders.map((lab) => (
              <div key={lab.id} className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[11px] font-mono text-cyan-400 font-bold">{lab.orderNumber}</span>
                    <h4 className="font-bold text-white text-base mt-0.5">{lab.testName}</h4>
                    <p className="text-xs text-slate-400">
                      Category: {lab.category} • Sample: {lab.sampleType} • Ordered by {lab.doctorName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        lab.sampleStatus === 'Approved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : lab.sampleStatus === 'Completed'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {lab.sampleStatus}
                    </span>
                    {lab.isCritical && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        CRITICAL VALUE
                      </span>
                    )}
                  </div>
                </div>

                {/* Results Table */}
                {lab.results && lab.results.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-800 rounded-lg">
                      <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Test Parameter</th>
                          <th className="p-2.5">Result Value</th>
                          <th className="p-2.5">Units</th>
                          <th className="p-2.5">Reference Range</th>
                          <th className="p-2.5">Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {lab.results.map((res, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/50">
                            <td className="p-2.5 font-medium text-white">{res.metric}</td>
                            <td className="p-2.5 font-bold font-mono text-slate-100">{res.value}</td>
                            <td className="p-2.5 text-slate-400">{res.unit}</td>
                            <td className="p-2.5 text-slate-400">{res.referenceRange}</td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  res.status === 'normal'
                                    ? 'bg-emerald-950 text-emerald-400'
                                    : res.status === 'critical'
                                    ? 'bg-rose-950 text-rose-300 font-extrabold animate-pulse'
                                    : 'bg-amber-950 text-amber-300'
                                }`}
                              >
                                {res.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900/50 rounded-lg text-xs text-slate-400">
                    Sample is currently processing at Central Laboratory. Results will be uploaded once verified.
                  </div>
                )}

                {/* Doctor Approval Signature */}
                {lab.doctorApproval && (
                  <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg text-xs flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-slate-400">Approved by: </span>
                      <strong className="text-white">{lab.doctorApproval.approvedBy}</strong>
                      <span className="text-slate-400 text-[11px] ml-2">({lab.doctorApproval.approvedAt})</span>
                    </div>
                    <div className="text-slate-300 italic text-[11px]">"{lab.doctorApproval.notes}"</div>
                  </div>
                )}

                {/* AI Explanation Feature */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
                  <button
                    onClick={() => handleExplainLabWithAI(lab)}
                    disabled={aiExplaining === lab.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 font-medium text-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{aiExplaining === lab.id ? 'Tegereza AI...' : 'Sobanukirwa Ibi Bisubizo (AI Explain)'}</span>
                  </button>

                  <div className="text-[11px] text-slate-500">Official Laboratory Diagnostic Report</div>
                </div>

                {/* AI Explanation Box */}
                {aiExplanation && aiExplanation.id === lab.id && (
                  <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/50 text-xs text-cyan-200 leading-relaxed">
                    <div className="font-bold text-cyan-400 flex items-center gap-1 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Ibisobanuro byoroshye mu Kinyarwanda & English:
                    </div>
                    {aiExplanation.text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: INVOICES */}
      {activeSubTab === 'invoices' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              Fagitire & Ubwishyu / Invoices & Billing
            </h3>
            <span className="text-xs text-slate-400">Total: {patientInvoices.length} invoices</span>
          </div>

          <div className="space-y-4">
            {patientInvoices.map((inv) => (
              <div key={inv.id} className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{inv.invoiceNumber}</span>
                    <div className="text-xs text-slate-400 mt-0.5">Date: {inv.date} • Due: {inv.dueDate}</div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      inv.status === 'paid'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : inv.status === 'partially_paid'
                        ? 'bg-sky-950 text-sky-300 border border-sky-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {inv.status.toUpperCase()}
                  </span>
                </div>

                <div className="divide-y divide-slate-800 text-xs">
                  {inv.items.map((item, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between">
                      <span className="text-slate-300">{item.description} (x{item.quantity})</span>
                      <span className="font-mono text-white">${(item.cost * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Total: </span>
                    <strong className="text-base text-white font-mono">${inv.total.toFixed(2)}</strong>
                    <span className="text-emerald-400 ml-2">(Insurance Paid: ${inv.insuranceDiscount.toFixed(2)})</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Patient Due: </span>
                    <strong className="text-base text-amber-300 font-mono">
                      ${Math.max(0, inv.total - inv.paidAmount).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: DISCHARGE SUMMARY */}
      {activeSubTab === 'discharge' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Incamake yo Gusezererwa / Discharge Summary
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
              {currentPatient.dischargeDate ? 'Discharged' : 'Active Inpatient (Draft Plan)'}
            </span>
          </div>

          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-4">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Diagnosis at Discharge</div>
              <div className="text-base font-bold text-white mt-1">{currentPatient.primaryDiagnosis}</div>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-cyan-400">Amabwiriza yo mu rugo / Home Care Instructions:</div>
              <p className="text-slate-300 leading-relaxed">
                {currentPatient.dischargeSummary?.instructions ||
                  'Komeza ufate imiti yawe ku gihe. Gabanya umunyu mu byo urya, kandi ugume mu kiruhuko cy’iminsi 7. Iyo wumvise ububabare budasanzwe mu gituza cyangwa guhumeka nabi, hamagara ubutabazi byihuse kuri 912.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400">Gahunda yo Kugaruka (Follow-Up):</span>
                <div className="font-bold text-white mt-1">
                  {currentPatient.dischargeSummary?.followUpDate || 'Mu byumweru 2 (Cardiology Clinic)'}
                </div>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400">Muganga Wemeje:</span>
                <div className="font-bold text-cyan-400 mt-1">
                  {currentPatient.dischargeSummary?.dischargedBy || currentPatient.attendingDoctorName}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BRUCE RII AI PATIENT ASSISTANT */}
      {activeSubTab === 'bruce_rii' && (
        <div className="bg-slate-900 border border-indigo-700/60 rounded-2xl p-4 sm:p-6 text-slate-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-950 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-cyan-300" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  Bruce Rii AI
                  <span className="bg-indigo-950 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-800/60">
                    Patient Health & Hospitals Guide
                  </span>
                </h3>
                <p className="text-xs text-indigo-200/80">
                  Ubufasha bw'Abarwayi na Amakuru y'Ibitaro byose mu Rwanda (CHUK, KFH, RMH, Butaro, Muhima...)
                </p>
              </div>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs self-start sm:self-auto">
              <button
                onClick={() => setBruceLanguage('rw')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  bruceLanguage === 'rw' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                🇷🇼 Kinyarwanda
              </button>
              <button
                onClick={() => setBruceLanguage('en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  bruceLanguage === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {/* Quick Questions Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              {bruceLanguage === 'rw' ? 'Ibibazo Bikunze Kubazwa (Kanda uhite ubaza):' : 'Frequently Asked Hospital Inquiries:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '🫀 Ubuvuzi bw\'umutima & KFH/CHUK', q: 'Ese ni ayahe bitaro bitanga ubuvuzi bwo kubaga umutima n\'imitsi mu Rwanda?' },
                { label: '👁️ Amaso i Kabgayi & KFH', q: 'Nkeneye kumenya ibitaro bifite inzobere z\'amaso nka Kabgayi na King Faisal Hospital.' },
                { label: '🤰 Kubyara & Muhima Hospital', q: 'Ibitaro bya Muhima bitanga izihe serivisi ku babyeyi bitegura kubyara n\'abana bavutse?' },
                { label: '🛡️ Mutuelle de Santé & Transfert', q: 'Ubwishingizi bwa Mutuelle de Santé bukorera he kandi ni gute mbona urupapuro rwa transfert?' },
                { label: '🎗️ Kanseri i Butaro & RMH', q: 'Ndashaka amakuru ku buvuzi bwa Kanseri mu bitaro bya Butaro Cancer Center na Kanombe RMH.' },
                { label: '🧠 Ubuzima bwo mu Mutwe (Ndera)', q: 'Amakuru ku buvuzi bw\'indwara zo mu mutwe n\'ubujyanama mu bitaro bya CARAES Ndera.' },
                { label: '🚑 Ubutabazi bwa SAMU 912', q: 'Ni gute nahamagara imbangukiragutabara ya SAMU 912 mu gihe cy\'impanuka cyangwa indembe?' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendBruceMessage(item.q)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-indigo-900/40 hover:text-indigo-200 border border-slate-800 text-slate-300 text-xs transition-all active:scale-95"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4 max-h-[460px] overflow-y-auto">
            {bruceMessages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-2xl ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className="shrink-0">
                  {m.sender === 'user' ? (
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                      <User className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  {m.facilities && m.facilities.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      <div className="text-[10px] font-bold text-cyan-400 uppercase flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Ibitaro Byasabwe (Recommended Hospitals):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {m.facilities.map((f: any, fIdx: number) => (
                          <div key={fIdx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                            <div className="font-bold text-white">{f.name}</div>
                            <div className="text-slate-400 text-[10px] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-indigo-400" />
                              {f.district}
                            </div>
                            {f.phone && (
                              <a href={`tel:${f.phone}`} className="text-emerald-400 font-bold text-[10px] flex items-center gap-1 mt-1">
                                <Phone className="w-2.5 h-2.5" />
                                {f.phone}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {m.emergency && (
                    <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-[10px] flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{m.emergency}</span>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 text-right">{m.time}</div>
                </div>
              </div>
            ))}

            {bruceLoading && (
              <div className="flex gap-3 max-w-xl">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3 text-xs text-slate-300 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span>Bruce Rii ari gusesengura amakuru y'ibitaro...</span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendBruceMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={bruceInput}
              onChange={(e) => setBruceInput(e.target.value)}
              placeholder="Baza Bruce Rii amakuru ku bitaro, serivisi, ibitanda, cyangwa ubutabazi..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!bruceInput.trim() || bruceLoading}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-indigo-950/60 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ohereza</span>
            </button>
          </form>

          {/* Rwanda Top Hospitals Directory Quick Reference */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                Ibitaro Bikuru by'Ikitegererezo mu Rwanda (Referral & Specialized Facilities)
              </h4>
              <span className="text-[11px] text-slate-400">Toll-Free Emergency: <strong className="text-rose-400 font-mono">912 (SAMU)</strong></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {RWANDA_FACILITIES.slice(0, 3).map((f) => (
                <div key={f.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase text-indigo-400">{f.type}</span>
                    <div className="font-extrabold text-white text-xs">{f.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {f.district}, {f.province}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-400 font-bold">{f.available_beds} beds free</span>
                    <button
                      onClick={() => handleSendBruceMessage(`Mbwire amakuru arambuye ku bitaro bya ${f.name}`)}
                      className="text-cyan-400 hover:underline font-bold"
                    >
                      Baza Bruce Rii →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BOOK NEW APPOINTMENT */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-cyan-400" />
                Gusaba Gahunda Nshya / Request Appointment
              </h3>
              <button
                onClick={() => setShowBookModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Ishami ry'Ubuvuzi / Department</label>
                <select
                  value={bookingDept}
                  onChange={(e) => setBookingDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology (Indwara z'Umutima)</option>
                  <option value="Emergency & Trauma">Emergency & Trauma</option>
                  <option value="Neurology">Neurology (Umutwe n'Imyakura)</option>
                  <option value="General Surgery">General Surgery (Kubaga)</option>
                  <option value="Pediatrics">Pediatrics (Abana)</option>
                  <option value="Pulmonology">Pulmonology (Ibihaha)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Muganga wifuza / Preferred Doctor</label>
                <select
                  value={bookingDoctor}
                  onChange={(e) => setBookingDoctor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Itariki / Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Isaha / Time</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="08:30 AM">08:30 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Impamvu / Visit Reason & Symptoms</label>
                <textarea
                  rows={3}
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  placeholder="Sobanura ibimenyetso ufite cyangwa impamvu yo kwisuzumisha..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Hagarika / Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  Ohereza Gahunda / Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
