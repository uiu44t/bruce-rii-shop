import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Patient, PatientStatus } from '../types';
import {
  Search,
  UserPlus,
  Filter,
  Activity,
  BedDouble,
  Heart,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface PatientsViewProps {
  onSelectPatient: (patient: Patient) => void;
  onOpenRegisterModal: () => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  onSelectPatient,
  onOpenRegisterModal,
}) => {
  const { patients } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PatientStatus>('all');
  const [bloodFilter, setBloodFilter] = useState<string>('all');

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.primaryDiagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesBlood = bloodFilter === 'all' || p.bloodGroup === bloodFilter;

    return matchesSearch && matchesStatus && matchesBlood;
  });

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Electronic Medical Records (EMR)
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono font-medium border border-slate-700">
              {filteredPatients.length} Patients
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive patient demographic, clinical diagnosis, and hospital history registry.
          </p>
        </div>

        <button
          onClick={onOpenRegisterModal}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/30 flex items-center gap-1.5 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Register New Patient
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Patient Name, MRN, Diagnosis, or Phone..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'inpatient', label: 'Inpatient' },
            { id: 'emergency', label: 'Emergency' },
            { id: 'outpatient', label: 'Outpatient' },
            { id: 'discharged', label: 'Discharged' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Blood Group Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Blood:</span>
          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
          >
            <option value="all">All Groups</option>
            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <table className="w-full text-left text-xs text-slate-200">
          <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5">Patient Details</th>
              <th className="p-3.5">Status & Location</th>
              <th className="p-3.5">Clinical Diagnosis</th>
              <th className="p-3.5">Current Vitals</th>
              <th className="p-3.5">Attending Physician</th>
              <th className="p-3.5">Insurance</th>
              <th className="p-3.5 text-right">EMR Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((p) => {
                const statusColors = {
                  inpatient: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
                  emergency: 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse',
                  outpatient: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                  discharged: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                };

                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelectPatient(p)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    {/* Patient Name & Demographics */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-700 to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
                          {p.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            {p.name}
                            <span className="text-[10px] font-mono px-1 rounded bg-rose-950 text-rose-300 font-bold">
                              {p.bloodGroup}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {p.mrn} • {p.age}y {p.gender}
                          </div>
                          {p.allergies && p.allergies.length > 0 && (
                            <div className="text-[10px] text-rose-400 truncate max-w-[170px]">
                              Allergies: {p.allergies.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status & Bed */}
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          statusColors[p.status]
                        }`}
                      >
                        {p.status.toUpperCase()}
                      </span>
                      {p.ward && p.bedNumber && (
                        <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                          <BedDouble className="w-3 h-3 text-sky-400" />
                          {p.ward} ({p.bedNumber})
                        </div>
                      )}
                    </td>

                    {/* Primary Diagnosis */}
                    <td className="p-3.5 max-w-xs">
                      <div className="font-medium text-slate-200 truncate">{p.primaryDiagnosis}</div>
                      <div className="text-[10px] text-slate-400">
                        Adm: {new Date(p.admissionDate).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Vitals */}
                    <td className="p-3.5">
                      <div className="font-mono text-xs">
                        <span className="text-cyan-300 font-semibold">{p.vitals.bp}</span>
                        <span className="text-slate-400"> / </span>
                        <span className="text-rose-400 font-semibold">{p.vitals.hr}</span>
                        <span className="text-slate-500 text-[10px]"> bpm</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        SpO2: {p.vitals.spo2}% • {p.vitals.temp}°F
                      </div>
                    </td>

                    {/* Attending Physician */}
                    <td className="p-3.5">
                      <div className="font-medium text-white truncate">{p.attendingDoctorName}</div>
                      <div className="text-[10px] text-slate-400">
                        {p.notes?.length || 0} SOAP notes • {p.prescriptions?.length || 0} Rx
                      </div>
                    </td>

                    {/* Insurance */}
                    <td className="p-3.5">
                      <div className="text-slate-300 truncate">{p.insurance.provider}</div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        {p.insurance.coveragePercent}% covered
                      </div>
                    </td>

                    {/* Action */}
                    <td className="p-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPatient(p);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors"
                      >
                        Open Chart
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  No patient records found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
