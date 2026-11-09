import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { EmergencyCase, Patient } from '../types';
import {
  Flame,
  AlertOctagon,
  Heart,
  Activity,
  BedDouble,
  UserPlus,
  Sparkles,
  Clock,
  CheckCircle2,
  Stethoscope,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface EmergencyViewProps {
  onOpenTriageModal: () => void;
  onSelectPatient?: (patient: Patient) => void;
}

export const EmergencyView: React.FC<EmergencyViewProps> = ({
  onOpenTriageModal,
  onSelectPatient,
}) => {
  const { emergencyCases, updateEmergencyStatus, beds, admitPatientToBed, patients } = useHospital();
  const [selectedEsiFilter, setSelectedEsiFilter] = useState<number | 'all'>('all');

  const filteredCases = emergencyCases
    .filter((c) => (selectedEsiFilter === 'all' ? true : c.esiLevel === selectedEsiFilter))
    .sort((a, b) => a.esiLevel - b.esiLevel); // Most critical first

  const esiDescriptions = [
    {
      level: 1,
      name: 'Resuscitation',
      desc: 'Immediate life-saving intervention needed (Code STEMI, Cardiac Arrest, Intubation).',
      color: 'bg-rose-600 text-white',
      border: 'border-rose-600/40',
    },
    {
      level: 2,
      name: 'Emergent',
      desc: 'High-risk situation, confusion, severe pain/distress (Stroke alert, sepsis).',
      color: 'bg-orange-600 text-white',
      border: 'border-orange-600/40',
    },
    {
      level: 3,
      name: 'Urgent',
      desc: 'Multiple hospital diagnostic resources required (Acute abdomen, complex fracture).',
      color: 'bg-amber-600 text-white',
      border: 'border-amber-600/40',
    },
    {
      level: 4,
      name: 'Less Urgent',
      desc: 'Single resource required (Simple laceration repair, uncomplicated UTI).',
      color: 'bg-sky-600 text-white',
      border: 'border-sky-600/40',
    },
    {
      level: 5,
      name: 'Non-Urgent',
      desc: 'No diagnostic resources required (Medication refill, suture removal).',
      color: 'bg-emerald-600 text-white',
      border: 'border-emerald-600/40',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs uppercase tracking-wider font-semibold text-rose-400">
              Level 1 Trauma & Emergency Intake
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Emergency Severity Index (ESI) Triage Station
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Acute resuscitation protocol, live telemetry monitoring, and rapid inpatient ward escalation.
          </p>
        </div>

        <button
          onClick={onOpenTriageModal}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/40 flex items-center gap-2 transition-all active:scale-95"
        >
          <Flame className="w-4 h-4" />
          Rapid Emergency Intake (STAT)
        </button>
      </div>

      {/* ESI Reference Guide Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {esiDescriptions.map((item) => {
          const count = emergencyCases.filter((c) => c.esiLevel === item.level && c.status !== 'admitted').length;
          const isSelected = selectedEsiFilter === item.level;

          return (
            <button
              key={item.level}
              onClick={() => setSelectedEsiFilter(isSelected ? 'all' : item.level)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? `${item.color} shadow-lg ring-2 ring-white/30`
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Level {item.level}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {count} Active
                </span>
              </div>
              <div className="font-semibold text-xs mt-1">{item.name}</div>
              <div className="text-[10px] opacity-80 mt-1 line-clamp-2 leading-tight">
                {item.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Cases Queue */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-white">
              Active Triage Queue ({filteredCases.length} Cases)
            </h3>
          </div>
          {selectedEsiFilter !== 'all' && (
            <button
              onClick={() => setSelectedEsiFilter('all')}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline"
            >
              Clear ESI Filter
            </button>
          )}
        </div>

        <div className="space-y-3">
          {filteredCases.length > 0 ? (
            filteredCases.map((c) => {
              const esiColor =
                c.esiLevel === 1
                  ? 'bg-rose-600 text-white'
                  : c.esiLevel === 2
                  ? 'bg-orange-600 text-white'
                  : c.esiLevel === 3
                  ? 'bg-amber-600 text-white'
                  : c.esiLevel === 4
                  ? 'bg-sky-600 text-white'
                  : 'bg-emerald-600 text-white';

              return (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  {/* Left: ESI Badge and Details */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-sm shrink-0 shadow-md ${esiColor}`}
                    >
                      <span>L{c.esiLevel}</span>
                      <span className="text-[9px] uppercase font-normal tracking-tighter">ESI</span>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm">{c.patientName}</span>
                        <span className="text-xs text-slate-400">
                          {c.age} yrs • {c.gender}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" /> Arr: {c.arrivalTime}
                        </span>
                      </div>

                      <div className="text-xs text-slate-200 font-medium">
                        <strong>Complaint:</strong> {c.chiefComplaint}
                      </div>

                      {c.triageNotes && (
                        <div className="text-[11px] text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
                          <strong className="text-cyan-400">Triage Note:</strong> {c.triageNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center: Vitals Matrix */}
                  <div className="flex items-center gap-2 sm:gap-4 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs shrink-0 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">BP</span>
                      <span className="text-cyan-300 font-bold">{c.vitals.bp}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-800" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">HR</span>
                      <span className="text-rose-400 font-bold">{c.vitals.hr}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-800" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">SpO2</span>
                      <span className="text-emerald-400 font-bold">{c.vitals.spo2}%</span>
                    </div>
                    <div className="h-6 w-px bg-slate-800" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Temp</span>
                      <span className="text-amber-300 font-bold">{c.vitals.temp}°</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    <select
                      value={c.status}
                      onChange={(e) => updateEmergencyStatus(c.id, e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-white"
                    >
                      <option value="in_triage">In Triage</option>
                      <option value="under_treatment">Under Treatment</option>
                      <option value="stabilized">Stabilized</option>
                      <option value="admitted">Admitted to Ward</option>
                    </select>

                    <button
                      onClick={() => {
                        updateEmergencyStatus(c.id, 'under_treatment');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Trauma Care
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              No emergency cases registered under this criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
