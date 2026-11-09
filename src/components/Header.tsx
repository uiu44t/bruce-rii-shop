import React, { useState, useEffect, useRef } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Activity,
  BedDouble,
  Clock,
  UserPlus,
  RefreshCw,
  Flame,
  Sparkles,
  Building2,
  Bell,
  User,
  Shield,
  CheckCircle2,
  Fingerprint,
  Wifi,
  Bot,
  Globe,
} from 'lucide-react';
import { translations } from '../utils/translations';
import { UbuzimaAuthPanel } from './UbuzimaAuthPanel';
import { ActiveNavTab, UserRole } from '../types';

interface HeaderProps {
  onOpenRegisterModal: () => void;
  onOpenTriageModal: () => void;
  onNavigateTab: (tab: ActiveNavTab) => void;
  onOpenQuickIdModal?: (initialNin?: string) => void;
  onOpenBruceRiiModal?: (initialQuestion?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRegisterModal,
  onOpenTriageModal,
  onNavigateTab,
  onOpenQuickIdModal,
  onOpenBruceRiiModal,
}) => {
  const {
    patients,
    beds,
    emergencyCases,
    resetAllData,
    branches,
    currentBranchId,
    setCurrentBranchId,
    currentRole,
    setCurrentRole,
    notifications,
    markNotificationRead,
    language,
    setLanguage,
  } = useHospital();

  const t = translations[language] || translations.en;
  const h = t.header;

  const [time, setTime] = useState<string>('');
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === 'occupied').length;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  const emergencyCount = emergencyCases.filter((c) => c.status !== 'admitted').length;
  const highUrgencyCount = emergencyCases.filter(
    (c) => c.status !== 'admitted' && (c.esiLevel === 1 || c.esiLevel === 2)
  ).length;

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;
  const activeBranch = branches.find((b) => b.id === currentBranchId) || branches[0];

  return (
    <header className="sticky top-0 z-40 text-white shadow-md border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="rw-accent-bar" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Hospital Brand & Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              onClick={() => onNavigateTab('dashboard')}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-cyan-900/30 shrink-0 cursor-pointer"
            >
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1
                  onClick={() => onNavigateTab('dashboard')}
                  className="font-bold text-base sm:text-lg tracking-tight text-slate-100 flex items-center gap-1.5 truncate cursor-pointer"
                >
                  {h.systemName}
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 text-cyan-300 border border-cyan-500/50">
                  {h.systemTag}
                </span>
                {/* Branch Selector Dropdown */}
                <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-[11px] text-cyan-300" title={h.branchLabel}>
                  <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <select
                    value={currentBranchId}
                    onChange={(e) => setCurrentBranchId(e.target.value)}
                    className="bg-transparent text-[11px] font-semibold text-white focus:outline-none cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-slate-400 hidden lg:block truncate">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Quick Instant ID Photo Scanner Bar */}
          <div className="hidden lg:flex items-center relative">
            <Fingerprint className="w-4 h-4 text-emerald-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder={h.idPlaceholder}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  onOpenQuickIdModal && onOpenQuickIdModal(e.currentTarget.value);
                }
              }}
              onClick={() => onOpenQuickIdModal && onOpenQuickIdModal()}
              className="w-48 xl:w-56 bg-slate-950/80 border border-slate-700/80 hover:border-emerald-500/70 focus:border-cyan-400 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 cursor-pointer focus:cursor-text transition-all"
            />
          </div>

          {/* Edge Cache Indicator */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[10px] text-emerald-400 font-medium">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>{h.edgeSynced}</span>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="hidden xl:flex items-center gap-3 text-xs">
            {/* Bed Occupancy */}
            <button
              onClick={() => onNavigateTab('wards')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 hover:bg-slate-700/60 transition-colors"
              title={t.nav.wards}
            >
              <BedDouble className="w-4 h-4 text-sky-400" />
              <span className="text-slate-300 font-medium">{h.beds}:</span>
              <span className="font-mono font-bold text-white">
                {occupiedBeds}/{totalBeds} ({occupancyRate}%)
              </span>
            </button>

            {/* Emergency Live Triage */}
            <button
              onClick={() => onNavigateTab('emergency')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                highUrgencyCount > 0
                  ? 'bg-rose-950/40 border-rose-700/50 hover:bg-rose-900/40 text-rose-200 animate-pulse'
                  : 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-700/60 text-slate-300'
              }`}
              title={t.nav.emergency}
            >
              <Flame className={`w-4 h-4 ${highUrgencyCount > 0 ? 'text-rose-400' : 'text-amber-400'}`} />
              <span className="font-medium">{h.emergency}:</span>
              <span className="font-mono font-bold">{emergencyCount}</span>
              {highUrgencyCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded font-bold">
                  {highUrgencyCount} {h.stat}
                </span>
              )}
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              id="header-btn-language"
              onClick={() => setLanguage(language === 'rw' ? 'en' : language === 'en' ? 'fr' : 'rw')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[11px] transition-colors"
              title={h.languageToggle}
            >
              {language === 'rw' ? 'EN' : language === 'en' ? 'FR' : 'RW'}
            </button>

            {/* Instant ID Photo Modal Button */}
            <button
              id="header-btn-quick-id-photo"
              onClick={() => onOpenQuickIdModal && onOpenQuickIdModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 whitespace-nowrap"
              title={h.idLookup}
            >
              <Fingerprint className="w-3.5 h-3.5 text-cyan-200" />
              <span className="hidden sm:inline">{h.idLookup}</span>
            </button>

            {/* Bruce Rii AI Patient Assistant Button */}
            <button
              id="header-btn-bruce-rii-ai"
              onClick={() => onOpenBruceRiiModal && onOpenBruceRiiModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-indigo-950/50 transition-all active:scale-95 whitespace-nowrap"
              title={h.bruceTitle}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-200" />
              <span>{h.bruceTitle}</span>
              <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.2 rounded font-sans">{h.bruceTag}</span>
            </button>

            {/* Patient Portal Shortcut */}
            <button
              id="header-btn-patient-portal"
              onClick={() => onNavigateTab('patient_portal')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 font-medium text-xs transition-colors whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{h.portal}</span>
            </button>

            {/* Quick Emergency Intake */}
            <button
              id="header-btn-emergency-intake"
              onClick={onOpenTriageModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              <Flame className="w-3.5 h-3.5 text-white" />
              <span className="hidden md:inline">{h.intake}</span>
            </button>

            {/* Register Patient */}
            <button
              id="header-btn-register-patient"
              onClick={onOpenRegisterModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">{h.register}</span>
            </button>

            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                id="header-btn-notifications"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Notifications & SMS Broadcasts"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 text-xs space-y-3 z-50">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-cyan-400" />
                      {h.notifications}
                    </span>
                    <span className="text-[10px] text-slate-400">{notifications.length} • {h.notificationsSubtitle}</span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                          n.isRead
                            ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                            : 'bg-slate-800/80 border-cyan-800/50 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-white">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{n.sentAt}</span>
                        </div>
                        <p className="text-[11px] mt-1 text-slate-300 leading-tight">{n.message}</p>
                        <div className="text-[9px] text-cyan-400 mt-1 uppercase font-semibold">
                          To: {n.recipientName || n.recipientType || 'All Staff'} ({n.channel})
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setShowNotifMenu(false);
                      onNavigateTab('system_settings');
                    }}
                    className="w-full py-1.5 text-center text-xs font-bold text-cyan-400 hover:underline"
                  >
                    {h.openSmsCenter}
                  </button>
                </div>
              )}
            </div>

            {/* Role Switcher Pill */}
            <div className="hidden sm:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <Shield className="w-3.5 h-3.5 text-indigo-400 ml-1.5 mr-1" />
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="bg-transparent text-white font-medium text-xs focus:outline-none pr-1"
                title="Current System Role"
              >
                <option value="super_admin" className="bg-slate-900">Admin</option>
                <option value="doctor" className="bg-slate-900">Doctor</option>
                <option value="nurse" className="bg-slate-900">Nurse</option>
                <option value="pharmacist" className="bg-slate-900">Pharmacist</option>
                <option value="lab_technician" className="bg-slate-900">Lab Tech</option>
                <option value="radiologist" className="bg-slate-900">Radiology</option>
                <option value="accountant" className="bg-slate-900">Accountant</option>
                <option value="patient" className="bg-slate-900">Patient</option>
              </select>
            </div>
            <UbuzimaAuthPanel />
          </div>
        </div>
      </div>
    </header>
  );
};
