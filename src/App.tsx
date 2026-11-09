import React, { useState } from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { DashboardView } from './components/DashboardView';
import { PatientsView } from './components/PatientsView';
import { WardsView } from './components/WardsView';
import { EmergencyView } from './components/EmergencyView';
import { AppointmentsView } from './components/AppointmentsView';
import { PharmacyView } from './components/PharmacyView';
import { BillingView } from './components/BillingView';
import { StaffView } from './components/StaffView';
import { AiAssistantView } from './components/AiAssistantView';
import { PatientPortalView } from './components/PatientPortalView';
import { LaboratoryView } from './components/LaboratoryView';
import { RadiologyView } from './components/RadiologyView';
import { BloodBankView } from './components/BloodBankView';
import { AmbulanceView } from './components/AmbulanceView';
import { InsuranceView } from './components/InsuranceView';
import { EnterpriseAdminView } from './components/EnterpriseAdminView';
import { RwandaNationalIdView } from './components/RwandaNationalIdView';
import { SurgeryView } from './components/SurgeryView';
import { MaternityView } from './components/MaternityView';
import { DentalView } from './components/DentalView';
import { OphthalmologyView } from './components/OphthalmologyView';
import { ProcurementView } from './components/ProcurementView';
import { AccountingView } from './components/AccountingView';
import { AnalyticsView } from './components/AnalyticsView';
import { EmergencyLocatorView } from './components/EmergencyLocatorView';
import { BedExchangeView } from './components/BedExchangeView';
import { EPrescriptionView } from './components/EPrescriptionView';
import { ChronicDiseaseView } from './components/ChronicDiseaseView';
import { ImmunizationRegistryView } from './components/ImmunizationRegistryView';
import { InternationalMedicalTravelView } from './components/InternationalMedicalTravelView';
import { IntegrationHubView } from './components/IntegrationHubView';
import { SecurityCenterView } from './components/SecurityCenterView';
import { PatientDetailModal } from './components/PatientDetailModal';
import { RegisterPatientModal } from './components/RegisterPatientModal';
import { RapidTriageModal } from './components/RapidTriageModal';
import { QuickIdPhotoModal } from './components/QuickIdPhotoModal';
import { BruceRiiAiModal } from './components/BruceRiiAiModal';
import { Bot, Sparkles } from 'lucide-react';
import { ActiveNavTab, Patient } from './types';

const HospitalAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [showTriageModal, setShowTriageModal] = useState<boolean>(false);
  const [showQuickIdModal, setShowQuickIdModal] = useState<boolean>(false);
  const [quickIdInitialNin, setQuickIdInitialNin] = useState<string>('');
  const [showBruceRiiModal, setShowBruceRiiModal] = useState<boolean>(false);
  const [bruceRiiInitialQuestion, setBruceRiiInitialQuestion] = useState<string>('');

  const { patients } = useHospital();

  // If a patient is open in modal, keep its state synced with context
  const currentModalPatient = selectedPatient
    ? patients.find((p) => p.id === selectedPatient.id) || selectedPatient
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500/30 selection:text-white">
      {/* Top Bar with Live Hospital Telemetry */}
      <Header
        onOpenRegisterModal={() => setShowRegisterModal(true)}
        onOpenTriageModal={() => setShowTriageModal(true)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenQuickIdModal={(nin) => {
          setQuickIdInitialNin(nin || '');
          setShowQuickIdModal(true);
        }}
        onOpenBruceRiiModal={(q) => {
          setBruceRiiInitialQuestion(q || '');
          setShowBruceRiiModal(true);
        }}
      />

      {/* Main Layout Area: Sidebar + Active Module Screen */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

        {/* Dynamic Viewport */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto rwanda-star-background ${
            activeTab === 'dashboard' ? 'dashboard-background' : ''
          }`}
        >
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSelectPatient={(p) => setSelectedPatient(p)}
              onOpenRegisterModal={() => setShowRegisterModal(true)}
              onOpenTriageModal={() => setShowTriageModal(true)}
            />
          )}

          {activeTab === 'rwanda_national_id' && (
            <RwandaNationalIdView
              onOpenPatientChart={(pId) => {
                const p = patients.find((pat) => pat.id === pId || pat.mrn === pId);
                if (p) setSelectedPatient(p);
              }}
            />
          )}

          {activeTab === 'emergency_locator' && <EmergencyLocatorView />}

          {activeTab === 'bed_exchange' && <BedExchangeView />}

          {activeTab === 'patient_portal' && <PatientPortalView />}

          {activeTab === 'patients' && (
            <PatientsView
              onSelectPatient={(p) => setSelectedPatient(p)}
              onOpenRegisterModal={() => setShowRegisterModal(true)}
            />
          )}

          {activeTab === 'wards' && (
            <WardsView onSelectPatient={(p) => setSelectedPatient(p)} />
          )}

          {activeTab === 'emergency' && (
            <EmergencyView
              onOpenTriageModal={() => setShowTriageModal(true)}
              onSelectPatient={(p) => setSelectedPatient(p)}
            />
          )}

          {activeTab === 'surgery' && <SurgeryView />}

          {activeTab === 'maternity' && <MaternityView />}

          {activeTab === 'dental' && <DentalView />}

          {activeTab === 'ophthalmology' && <OphthalmologyView />}

          {activeTab === 'chronic_disease' && <ChronicDiseaseView />}

          {activeTab === 'immunization' && <ImmunizationRegistryView />}

          {activeTab === 'medical_travel' && <InternationalMedicalTravelView />}

          {activeTab === 'laboratory' && <LaboratoryView />}

          {activeTab === 'radiology' && <RadiologyView />}

          {activeTab === 'blood_bank' && <BloodBankView />}

          {activeTab === 'ambulances' && <AmbulanceView />}

          {activeTab === 'appointments' && <AppointmentsView />}

          {activeTab === 'e_prescription' && <EPrescriptionView />}

          {activeTab === 'pharmacy' && <PharmacyView />}

          {activeTab === 'procurement' && <ProcurementView />}

          {activeTab === 'billing' && <BillingView />}

          {activeTab === 'accounting' && <AccountingView />}

          {activeTab === 'insurance' && <InsuranceView />}

          {activeTab === 'integration_hub' && <IntegrationHubView />}

          {activeTab === 'security_center' && <SecurityCenterView />}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'staff' && <StaffView />}

          {(activeTab === 'audit_logs' || activeTab === 'system_settings') && <EnterpriseAdminView />}

          {activeTab === 'ai_assistant' && <AiAssistantView />}
        </main>
      </div>

      {/* Floating System Notifications */}
      <ToastContainer />

      {/* Patient Detail / EMR Chart Modal */}
      {currentModalPatient && (
        <PatientDetailModal
          patient={currentModalPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}

      {/* Register New Patient Modal */}
      {showRegisterModal && (
        <RegisterPatientModal
          onClose={() => setShowRegisterModal(false)}
          onPatientCreated={(newId) => {
            const p = patients.find((pat) => pat.id === newId);
            if (p) setSelectedPatient(p);
          }}
        />
      )}

      {/* Emergency Rapid Triage Intake Modal */}
      {showTriageModal && (
        <RapidTriageModal onClose={() => setShowTriageModal(false)} />
      )}

      {/* Instant National ID Photo & Biometrics Modal (PRO) */}
      <QuickIdPhotoModal
        isOpen={showQuickIdModal}
        onClose={() => setShowQuickIdModal(false)}
        initialNin={quickIdInitialNin}
        onOpenPatientChart={(pId) => {
          const p = patients.find((pat) => pat.id === pId || pat.mrn === pId);
          if (p) setSelectedPatient(p);
        }}
        onOpenRegisterModal={() => setShowRegisterModal(true)}
        onNavigateTab={(tab) => setActiveTab(tab as ActiveNavTab)}
      />

      {/* Bruce Rii AI — Rwandan Patient Companion & Hospital Intelligence Modal */}
      <BruceRiiAiModal
        isOpen={showBruceRiiModal}
        onClose={() => setShowBruceRiiModal(false)}
        initialQuestion={bruceRiiInitialQuestion}
      />

      {/* Persistent Floating Bruce Rii AI Quick Assistant Trigger */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          id="floating-btn-bruce-rii"
          onClick={() => {
            setBruceRiiInitialQuestion('');
            setShowBruceRiiModal(true);
          }}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-2xl shadow-indigo-950/90 border border-white/20 transition-all hover:scale-105 active:scale-95 group"
          title="Bruce Rii AI: Rwandan Patient Health & Hospitals Navigator"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-cyan-200 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <div className="text-left">
            <span className="block leading-tight font-black tracking-wide flex items-center gap-1">
              Bruce Rii AI
              <span className="bg-white/20 text-[9px] px-1 py-0.2 rounded font-sans font-normal">RW/EN</span>
            </span>
            <span className="block text-[10px] text-indigo-100 font-normal">Amakuru y'Ibitaro & Ubuzima</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppErrorBoundary>
      <HospitalProvider>
        <HospitalAppContent />
      </HospitalProvider>
    </AppErrorBoundary>
  );
}
