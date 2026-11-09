import React, { useState } from 'react';
import { Patient } from '../types';
import {
  QrCode,
  X,
  Printer,
  ShieldCheck,
  Heart,
  AlertTriangle,
  Phone,
  Building2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface PatientQrCardModalProps {
  patient: Patient;
  onClose: () => void;
}

export const PatientQrCardModal: React.FC<PatientQrCardModalProps> = ({ patient, onClose }) => {
  const [scannedFeedback, setScannedFeedback] = useState(false);

  const simulateScanVerification = () => {
    setScannedFeedback(true);
    setTimeout(() => setScannedFeedback(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100 space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Smart Patient Digital QR Pass</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Smart Card Badge */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950/70 border-2 border-cyan-500/40 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Hospital Header Strip */}
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
            <div>
              <div className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                Centre Hospitalier Universitaire (CHUK)
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Ministry of Health • Kigali, Rwanda</div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              OFFICIAL EMR
            </span>
          </div>

          {/* Card Body */}
          <div className="flex items-start gap-4">
            {/* Real SVG QR Code */}
            <div className="p-2.5 rounded-xl bg-white text-slate-900 shadow-md flex flex-col items-center justify-center shrink-0">
              <svg className="w-24 h-24" viewBox="0 0 100 100" fill="currentColor">
                {/* Simulated high-density QR pattern */}
                <rect x="0" y="0" width="30" height="30" rx="4" fill="#0f172a" />
                <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                <rect x="9" y="9" width="12" height="12" rx="2" fill="#0f172a" />

                <rect x="70" y="0" width="30" height="30" rx="4" fill="#0f172a" />
                <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                <rect x="79" y="9" width="12" height="12" rx="2" fill="#0f172a" />

                <rect x="0" y="70" width="30" height="30" rx="4" fill="#0f172a" />
                <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                <rect x="9" y="79" width="12" height="12" rx="2" fill="#0f172a" />

                {/* Data pixels */}
                <rect x="38" y="10" width="8" height="8" fill="#0f172a" />
                <rect x="50" y="20" width="8" height="8" fill="#0f172a" />
                <rect x="38" y="40" width="24" height="24" rx="2" fill="#0f172a" />
                <rect x="42" y="44" width="16" height="16" fill="#ffffff" />
                <rect x="46" y="48" width="8" height="8" fill="#0891b2" />

                <rect x="10" y="40" width="8" height="16" fill="#0f172a" />
                <rect x="22" y="48" width="8" height="8" fill="#0f172a" />
                <rect x="70" y="40" width="16" height="8" fill="#0f172a" />
                <rect x="80" y="52" width="10" height="10" fill="#0f172a" />
                <rect x="40" y="72" width="12" height="8" fill="#0f172a" />
                <rect x="58" y="76" width="10" height="12" fill="#0f172a" />
                <rect x="76" y="72" width="14" height="8" fill="#0f172a" />
                <rect x="80" y="86" width="8" height="8" fill="#0f172a" />
              </svg>
              <span className="text-[8px] font-mono font-bold text-slate-800 mt-1 uppercase">Scan to Verify</span>
            </div>

            {/* Patient Clinical Highlights */}
            <div className="space-y-1.5 text-xs flex-1">
              <div>
                <h4 className="font-bold text-base text-white">{patient.name}</h4>
                <div className="font-mono text-cyan-300 text-xs font-semibold">{patient.mrn}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Blood Group</span>
                  <span className="font-bold text-rose-400 font-mono text-xs">{patient.bloodGroup}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Age / Sex</span>
                  <span className="font-semibold text-white">{patient.age}y • {patient.gender}</span>
                </div>
              </div>

              <div className="pt-1 text-[11px]">
                <span className="text-slate-400 block text-[10px]">Insurance / RAMA</span>
                <span className="text-slate-200 truncate block font-medium">{patient.insurance.provider} ({patient.insurance.policyNumber})</span>
              </div>
            </div>
          </div>

          {/* Critical Warnings / Allergies */}
          {patient.allergies && patient.allergies.length > 0 ? (
            <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800 text-[11px] text-rose-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span><strong>ALLERGIES:</strong> {patient.allergies.join(', ')}</span>
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>No known drug allergies reported</span>
            </div>
          )}

          {/* Footer Card Strip */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-700/60">
            <span>Emergency: {patient.phone}</span>
            <span>Status: <strong className="uppercase text-cyan-400">{patient.status}</strong></span>
          </div>
        </div>

        {/* Verification Simulation Result */}
        {scannedFeedback && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <strong>QR Code Validated:</strong> Patient ID confirmed against Rwanda National EMR database.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={simulateScanVerification}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simulate Bedside Scanner
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Print ID Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
