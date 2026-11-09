import React, { useEffect, useState } from 'react';
import { Lock, Mail, ShieldAlert, LogOut, UserRound, UserPlus, Phone, Stethoscope } from 'lucide-react';
import { login, logout, register, getAuth, type UbuzimaAuthUser } from '../services/authClient';
import { useHospital } from '../context/HospitalContext';
import type { UserRole } from '../types';

const ROLE_OPTIONS: Array<{ value: string; label: string; contextRole: UserRole }> = [
  { value: 'PATIENT', label: 'Patient', contextRole: 'patient' },
  { value: 'RECEPTIONIST', label: 'Receptionist', contextRole: 'reception' },
  { value: 'NURSE', label: 'Nurse', contextRole: 'nurse' },
  { value: 'DOCTOR', label: 'Doctor', contextRole: 'doctor' },
  { value: 'PHARMACIST', label: 'Pharmacist', contextRole: 'pharmacist' },
  { value: 'LAB_TECHNICIAN', label: 'Laboratory Technician', contextRole: 'laboratory' },
  { value: 'RADIOLOGIST', label: 'Radiologist', contextRole: 'radiology' },
  { value: 'ACCOUNTANT', label: 'Accountant', contextRole: 'accountant' },
  { value: 'HOSPITAL_ADMIN', label: 'Hospital Admin', contextRole: 'super_admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin', contextRole: 'super_admin' },
];

function contextRoleFor(authRole: string): UserRole {
  const found = ROLE_OPTIONS.find((r) => r.value === authRole);
  if (found) return found.contextRole;
  const normalized = authRole.toLowerCase();
  if (normalized.includes('patient')) return 'patient';
  if (normalized.includes('doctor')) return 'doctor';
  if (normalized.includes('nurse')) return 'nurse';
  if (normalized.includes('pharmac')) return 'pharmacist';
  if (normalized.includes('lab')) return 'laboratory';
  if (normalized.includes('radio')) return 'radiology';
  if (normalized.includes('reception')) return 'reception';
  if (normalized.includes('account')) return 'accountant';
  return 'super_admin';
}

export function UbuzimaAuthPanel() {
  const hospital = useHospital() as any;
  const setCurrentRole: (role: UserRole) => void = hospital.setCurrentRole;
  const notify = (toast: { type: 'success' | 'error' | 'info' | 'warning'; title: string; message: string }) => {
    if (typeof hospital.addToast === 'function') hospital.addToast(toast);
    else if (typeof hospital.showToast === 'function') hospital.showToast(toast);
  };
  const [user, setUser] = useState<UbuzimaAuthUser | null>(() => getAuth()?.user || null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && typeof setCurrentRole === 'function') setCurrentRole(contextRoleFor(user.role));
  }, [user, setCurrentRole]);

  const resetSensitive = () => setPassword('');

  const handleAuthSuccess = (nextUser: UbuzimaAuthUser, title: string) => {
    setUser(nextUser);
    if (typeof setCurrentRole === 'function') setCurrentRole(contextRoleFor(nextUser.role));
    setOpen(false);
    setError('');
    resetSensitive();
    notify({
      type: 'success',
      title,
      message: `${nextUser.fullName} (${nextUser.role})${nextUser.mode === 'local' ? ' — local session; configure PostgreSQL for secure backend auth.' : ''}`,
    });
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs">
          <UserRound className="w-3.5 h-3.5 text-emerald-300" />
          <span className="text-emerald-100 max-w-[140px] truncate">{user.fullName}</span>
          <span className="text-emerald-400/80">{user.role}</span>
          {user.mode === 'local' && <span className="text-amber-300/90">LOCAL</span>}
        </div>
        <button
          onClick={() => { logout(); setUser(null); notify({ type: 'info', title: 'Signed out', message: 'UBUZIMA session ended.' }); }}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button onClick={() => { setMode('login'); setOpen(true); setError(''); }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-cyan-100 text-xs font-semibold hover:bg-cyan-900/30"><Lock className="w-3.5 h-3.5" /> Login</button>
        <button onClick={() => { setMode('signup'); setOpen(true); setError(''); }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-100 text-xs font-semibold hover:bg-emerald-900/30"><UserPlus className="w-3.5 h-3.5" /> Signup</button>
      </div>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true); setError('');
              try {
                if (mode === 'signup') {
                  if (!fullName.trim()) throw new Error('Full name is required.');
                  const s = await register({ fullName: fullName.trim(), email: email.trim(), password, phone: phone.trim() || undefined, role });
                  handleAuthSuccess(s.user, 'Account created');
                } else {
                  const s = await login(email.trim(), password);
                  handleAuthSuccess(s.user, 'Authenticated');
                }
              } catch (err: any) {
                const msg = err?.message || 'Authentication failed.';
                setError(msg);
                notify({ type: 'error', title: mode === 'signup' ? 'Signup failed' : 'Login failed', message: msg });
              } finally { setBusy(false); }
            }}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-left"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">{mode === 'signup' ? <UserPlus className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-cyan-400" />} UBUZIMA {mode === 'signup' ? 'Signup' : 'Login'}</h3>
              <button type="button" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); }} className="text-xs text-cyan-300 hover:text-cyan-200">{mode === 'signup' ? 'Use login' : 'Create account'}</button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Backend secure auth (`/api/v1/auth`, PostgreSQL + JWT + RBAC) is used when configured. If DB is not configured, a local role session is created so you can continue using the app.</p>
            {error && <div className="mt-3 text-xs text-rose-300 bg-rose-950/30 border border-rose-800/40 rounded-lg p-2 flex gap-2"><ShieldAlert className="w-4 h-4 shrink-0" />{error}</div>}

            {mode === 'signup' && (
              <>
                <label className="block mt-4 text-xs text-slate-300">Full name</label>
                <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3"><UserRound className="w-4 h-4 text-slate-500" /><input value={fullName} onChange={(e) => setFullName(e.target.value)} required={mode === 'signup'} className="w-full bg-transparent py-2.5 text-sm text-white outline-none" autoComplete="name" /></div>
                <label className="block mt-3 text-xs text-slate-300">Role</label>
                <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3"><Stethoscope className="w-4 h-4 text-slate-500" /><select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-transparent py-2.5 text-sm text-white outline-none"><option className="bg-slate-900" value="PATIENT">Patient</option><option className="bg-slate-900" value="RECEPTIONIST">Receptionist</option><option className="bg-slate-900" value="NURSE">Nurse</option><option className="bg-slate-900" value="DOCTOR">Doctor</option><option className="bg-slate-900" value="PHARMACIST">Pharmacist</option><option className="bg-slate-900" value="LAB_TECHNICIAN">Laboratory Technician</option><option className="bg-slate-900" value="RADIOLOGIST">Radiologist</option><option className="bg-slate-900" value="ACCOUNTANT">Accountant</option><option className="bg-slate-900" value="HOSPITAL_ADMIN">Hospital Admin</option><option className="bg-slate-900" value="SUPER_ADMIN">Super Admin</option></select></div>
                <label className="block mt-3 text-xs text-slate-300">Phone (optional)</label>
                <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3"><Phone className="w-4 h-4 text-slate-500" /><input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-transparent py-2.5 text-sm text-white outline-none" autoComplete="tel" placeholder="+250..." /></div>
              </>
            )}

            <label className="block mt-3 text-xs text-slate-300">Email</label>
            <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3"><Mail className="w-4 h-4 text-slate-500" /><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full bg-transparent py-2.5 text-sm text-white outline-none" autoComplete={mode === 'signup' ? 'email' : 'username'} /></div>
            <label className="block mt-3 text-xs text-slate-300">Password</label>
            <div className="mt-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3"><Lock className="w-4 h-4 text-slate-500" /><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={8} className="w-full bg-transparent py-2.5 text-sm text-white outline-none" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} /></div>
            <div className="mt-5 flex gap-2 justify-end">
              <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg bg-slate-800 text-slate-200 text-sm">Cancel</button>
              <button type="submit" disabled={busy} className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white text-sm font-semibold">{busy ? (mode === 'signup' ? 'Creating…' : 'Signing in…') : (mode === 'signup' ? 'Create account' : 'Sign in')}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
