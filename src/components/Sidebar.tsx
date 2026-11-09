import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { ActiveNavTab, UserRole } from '../types';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BedDouble,
  Flame,
  Pill,
  Receipt,
  UserCheck,
  Sparkles,
  HeartPulse,
  FlaskConical,
  FileScan,
  Droplet,
  Siren,
  ShieldCheck,
  ShieldAlert,
  User,
  Activity,
  Baby,
  Smile,
  ShoppingBag,
  BookOpen,
  BarChart3,
  Scissors,
  MapPin,
  Globe,
  Lock,
  Cpu,
  FileText,
  Eye,
  EyeOff,
  ChevronDown,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
}

// Granular RBAC Permission Matrix for Hospital Staff Roles
const ROLE_PERMITTED_TABS: Record<UserRole, ActiveNavTab[]> = {
  super_admin: [
    'dashboard', 'rwanda_national_id', 'emergency_locator', 'bed_exchange', 'patient_portal',
    'patients', 'emergency', 'wards', 'surgery', 'maternity', 'dental', 'ophthalmology', 'chronic_disease',
    'immunization', 'medical_travel', 'appointments', 'laboratory', 'radiology', 'blood_bank',
    'ambulances', 'e_prescription', 'pharmacy', 'billing', 'accounting', 'procurement',
    'insurance', 'analytics', 'staff', 'integration_hub', 'security_center', 'system_settings', 'ai_assistant'
  ],
  doctor: [
    'dashboard', 'rwanda_national_id', 'emergency_locator', 'bed_exchange',
    'patients', 'emergency', 'wards', 'surgery', 'maternity', 'dental', 'ophthalmology', 'chronic_disease',
    'immunization', 'medical_travel', 'appointments', 'laboratory', 'radiology', 'blood_bank',
    'e_prescription', 'ai_assistant', 'integration_hub'
  ],
  nurse: [
    'dashboard', 'rwanda_national_id', 'patients', 'emergency', 'wards',
    'maternity', 'immunization', 'appointments', 'laboratory', 'blood_bank',
    'bed_exchange', 'e_prescription'
  ],
  pharmacist: [
    'dashboard', 'pharmacy', 'e_prescription', 'procurement', 'patients',
    'ai_assistant', 'integration_hub'
  ],
  laboratory: [
    'dashboard', 'laboratory', 'blood_bank', 'patients', 'ai_assistant'
  ],
  radiology: [
    'dashboard', 'radiology', 'patients', 'ai_assistant'
  ],
  reception: [
    'dashboard', 'rwanda_national_id', 'emergency_locator', 'bed_exchange',
    'patients', 'appointments', 'billing'
  ],
  accountant: [
    'dashboard', 'billing', 'accounting', 'insurance', 'procurement', 'analytics'
  ],
  patient: [
    'patient_portal', 'appointments'
  ],
};

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const {
    emergencyCases,
    beds,
    pharmacy,
    labOrders,
    radiologyOrders,
    bloodInventory,
    ambulances,
    currentRole,
    language,
  } = useHospital();

  const isRw = language === 'rw';

  const [enforceStrictRbac, setEnforceStrictRbac] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    clinical: false,
    diagnostics: false,
    enterprise: false,
  });

  const emergencyCount = emergencyCases.filter((c) => c.status !== 'admitted').length;
  const occupiedBeds = beds.filter((b) => b.status === 'occupied').length;
  const lowStockCount = pharmacy.filter((p) => p.stock <= p.minThreshold).length;
  const pendingLabs = labOrders.filter((l) => l.sampleStatus === 'Ordered' || l.sampleStatus === 'Processing').length;
  const pendingScans = radiologyOrders.filter((r) => r.status === 'Requested').length;
  const dispatchedAmbulances = ambulances.filter((a) => a.currentStatus === 'Dispatched' || a.currentStatus === 'In-Transit').length;
  const lowBloodCount = bloodInventory.filter((b) => b.unitsAvailable <= b.minThreshold).length;

  interface NavItem {
    id: ActiveNavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: React.ReactNode;
    special?: boolean;
  }

  const nationalNav: NavItem[] = [
    { id: 'dashboard', label: isRw ? 'Ikibaho rusange' : 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'rwanda_national_id', label: isRw ? 'Indangamuntu & RHIE' : 'Rwanda National ID & RHIE', icon: ShieldCheck, badge: 'NIDA', special: true },
    { id: 'emergency_locator', label: isRw ? 'Gushaka ibitaro by’ubutabazi' : 'Emergency Facility Locator', icon: MapPin, badge: 'GPS', special: true },
    { id: 'bed_exchange', label: isRw ? 'Ihuriro ry’ibitanda' : 'Real-Time Bed Exchange', icon: BedDouble, badge: 'Live' },
    { id: 'patient_portal', label: isRw ? 'Urubuga rw’umurwayi' : 'Patient Portal', icon: User, badge: 'Bruce Rii', special: true },
  ];

  const clinicalNav: NavItem[] = [
    { id: 'patients', label: isRw ? 'Abarwayi & EMR' : 'Patients & EMR', icon: Users, badge: null },
    { id: 'emergency', label: isRw ? 'Ubutabazi & Triage' : 'Emergency & Triage', icon: Flame, badge: emergencyCount > 0 ? emergencyCount : null },
    { id: 'wards', label: isRw ? 'Ibyumba & ibitanda' : 'Wards & Beds', icon: BedDouble, badge: `${occupiedBeds}/${beds.length}` },
    { id: 'surgery', label: isRw ? 'Kubaga (OT)' : 'Surgery (OT)', icon: Scissors, badge: null },
    { id: 'maternity', label: isRw ? 'Kubyara & abana' : 'Maternity & Neonatal', icon: Baby, badge: null },
    { id: 'dental', label: isRw ? 'Amenyo' : 'Dental', icon: Smile, badge: null },
    { id: 'ophthalmology', label: isRw ? 'Amaso' : 'Ophthalmology', icon: Eye, badge: null },
    { id: 'chronic_disease', label: isRw ? 'Indwara zidakira' : 'Chronic Care', icon: HeartPulse, badge: null },
    { id: 'immunization', label: isRw ? 'Inkingo' : 'Immunization', icon: Baby, badge: 'EPI' },
    { id: 'medical_travel', label: isRw ? 'Ubuvuzi mpuzamahanga' : 'Medical Travel', icon: Globe, badge: null },
    { id: 'appointments', label: isRw ? 'Gahunda za muganga' : 'Appointments', icon: CalendarDays, badge: null },
  ];

  const diagnosticNav: NavItem[] = [
    { id: 'laboratory', label: isRw ? 'Laboratwari' : 'Laboratory', icon: FlaskConical, badge: pendingLabs > 0 ? pendingLabs : null },
    { id: 'radiology', label: isRw ? 'Radiologiya' : 'Radiology', icon: FileScan, badge: pendingScans > 0 ? pendingScans : null },
    { id: 'blood_bank', label: isRw ? 'Ikigega cy’amaraso' : 'Blood Bank', icon: Droplet, badge: lowBloodCount > 0 ? lowBloodCount : null },
    { id: 'ambulances', label: isRw ? 'Ambulansi' : 'Ambulances', icon: Siren, badge: dispatchedAmbulances > 0 ? dispatchedAmbulances : null },
    { id: 'e_prescription', label: isRw ? 'E-Prescription' : 'E-Prescription', icon: FileText, badge: 'RX' },
    { id: 'pharmacy', label: isRw ? 'Farisiyo' : 'Pharmacy', icon: Pill, badge: lowStockCount > 0 ? lowStockCount : null },
  ];

  const enterpriseNav: NavItem[] = [
    { id: 'billing', label: isRw ? 'Kwishyura & kashiye' : 'Billing & Cashier', icon: Receipt, badge: null },
    { id: 'accounting', label: isRw ? 'Ibaruramari' : 'Accounting', icon: BookOpen, badge: null },
    { id: 'procurement', label: isRw ? 'Ibugenzuzi & ibikoresho' : 'Procurement', icon: ShoppingBag, badge: null },
    { id: 'insurance', label: isRw ? 'Ubwishingizi' : 'Insurance & Claims', icon: ShieldCheck, badge: 'RAMA' },
    { id: 'analytics', label: isRw ? 'Isesenguramakuru' : 'Analytics', icon: BarChart3, badge: null },
    { id: 'staff', label: isRw ? 'Abakozi b’ubuvuzi' : 'Medical Staff', icon: UserCheck, badge: null },
    { id: 'integration_hub', label: isRw ? 'Ihuza rya sisitemu' : 'Integration Hub', icon: Cpu, badge: null },
    { id: 'security_center', label: isRw ? 'Umutekano & itegeko' : 'Security & Compliance', icon: Lock, badge: '058' },
    { id: 'system_settings', label: isRw ? 'Igenamiterere' : 'System Settings', icon: ShieldAlert, badge: currentRole.toUpperCase() },
    { id: 'ai_assistant', label: isRw ? 'Ubufasha bwa AI' : 'AI Assistant', icon: Sparkles, badge: 'AI', special: true },
  ];

  // Filter items by role permissions
  const filterByRole = (items: NavItem[]) => {
    if (!enforceStrictRbac || currentRole === 'super_admin') return items;
    const permitted = ROLE_PERMITTED_TABS[currentRole] || [];
    return items.filter((item) => permitted.includes(item.id));
  };

  const filteredNational = filterByRole(nationalNav);
  const filteredClinical = filterByRole(clinicalNav);
  const filteredDiagnostic = filterByRole(diagnosticNav);
  const filteredEnterprise = filterByRole(enterpriseNav);
  const clinicalCoreTabs: ActiveNavTab[] = ['patients', 'emergency', 'wards', 'appointments'];
  const diagnosticCoreTabs: ActiveNavTab[] = ['laboratory', 'radiology', 'pharmacy'];
  const enterpriseCoreTabs: ActiveNavTab[] = ['billing', 'analytics', 'staff'];

  const splitNavItems = (items: NavItem[], coreTabs: ActiveNavTab[]) => ({
    primary: items.filter((item) => coreTabs.includes(item.id)),
    additional: items.filter((item) => !coreTabs.includes(item.id)),
  });

  const clinicalItems = splitNavItems(filteredClinical, clinicalCoreTabs);
  const diagnosticItems = splitNavItems(filteredDiagnostic, diagnosticCoreTabs);
  const enterpriseItems = splitNavItems(filteredEnterprise, enterpriseCoreTabs);

  const renderNavSection = (title: string, items: NavItem[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1">
        <div className="px-3 pt-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
          {title}
        </div>
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              style={{ animationDelay: `${Math.min(index * 35, 280)}ms` }}
              className={`sidebar-link w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs text-left ${
                isActive
                  ? 'sidebar-link-active'
                  : item.special
                  ? 'sidebar-link-featured'
                  : 'hover:bg-slate-800/80 hover:text-slate-100 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : item.special ? 'text-cyan-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`sidebar-badge ml-1.5 px-2 py-0.5 text-[9px] font-bold rounded-full shrink-0 ${
                    isActive ? 'sidebar-badge-active' : ''
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const renderExpandableSection = (
    title: string,
    items: { primary: NavItem[]; additional: NavItem[] },
    section: keyof typeof expandedSections,
    moreLabel: string
  ) => {
    const isExpanded = expandedSections[section] || items.additional.some((item) => item.id === activeTab);

    return (
      <>
        {renderNavSection(title, items.primary)}
        {items.additional.length > 0 && (
          <>
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() =>
                setExpandedSections((current) => ({ ...current, [section]: !current[section] }))
              }
              className="sidebar-expand-toggle w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400"
            >
              <span>{moreLabel} ({items.additional.length})</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
            {isExpanded && renderNavSection(`Additional ${title.toLowerCase()}`, items.additional)}
          </>
        )}
      </>
    );
  };

  return (
    <aside className="sidebar-shell w-full lg:w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0">
      {/* RBAC Mode Status Banner */}
      <div className="p-2.5 mx-3 mt-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-200 capitalize">
            {currentRole.replace('_', ' ')}
          </span>
        </div>
        <button
          onClick={() => setEnforceStrictRbac(!enforceStrictRbac)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
            enforceStrictRbac
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
              : 'bg-amber-950 text-amber-300 border border-amber-800/60'
          }`}
          title={enforceStrictRbac ? 'Strict RBAC enabled: showing authorized modules' : 'Showing all modules (Admin View)'}
        >
          {enforceStrictRbac ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          {enforceStrictRbac ? 'RBAC On' : 'All Views'}
        </button>
      </div>

      <nav className="p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-7rem)]">
        {renderNavSection(isRw ? 'Ihuriro ry’igihugu & RHIE' : 'National Network & RHIE', filteredNational)}
        {renderExpandableSection(
          isRw ? 'Ubuvuzi' : 'Clinical Care',
          clinicalItems,
          'clinical',
          isRw ? 'Ibindi by’ubuvuzi' : 'More clinical services'
        )}
        {renderExpandableSection(
          isRw ? 'Isuzuma & farisiyo' : 'Diagnostics & Pharmacy',
          diagnosticItems,
          'diagnostics',
          isRw ? 'Ibindi by’isuzuma' : 'More diagnostic tools'
        )}
        {renderExpandableSection(
          isRw ? 'Imicungire' : 'Administration',
          enterpriseItems,
          'enterprise',
          isRw ? 'Ibindi by’imicungire' : 'More administration'
        )}
      </nav>

      {/* Hospital System Status Badge */}
      <div className="mt-auto p-3.5 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-400 inline" />
              {isRw ? 'Sisitemu y’Ibitaro mu Rwanda' : 'Rwanda Hospital System'}
            </div>
            <div className="text-[10px] text-slate-400">{isRw ? 'Umutekano urakora • Itegeko 058' : 'Secure access • Rwanda Law 058'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
