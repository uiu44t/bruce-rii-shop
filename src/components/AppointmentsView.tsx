import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Appointment, AppointmentStatus } from '../types';
import {
  CalendarDays,
  Plus,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const { appointments, addAppointment, updateAppointmentStatus, doctors, patients } = useHospital();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // New appointment form state
  const [patientName, setPatientName] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [type, setType] = useState<Appointment['type']>('Specialist Consultation');
  const [reason, setReason] = useState('Routine review and evaluation');

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'all' || apt.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set(doctors.map((d) => d.department)));

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    const doc = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
    const patient = patients.find((p) => p.name.toLowerCase() === patientName.toLowerCase());

    addAppointment({
      patientId: patient?.id || `P-${Date.now().toString().slice(-4)}`,
      patientName,
      patientMrn: patient?.mrn || `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
      patientPhone: patient?.phone || '+1 (555) 234-5678',
      doctorId: doc.id,
      doctorName: doc.name,
      department: doc.department,
      date,
      time,
      type,
      status: 'scheduled',
      priority: 'normal',
      reason: reason || 'Specialist Consultation',
    });

    setShowScheduleModal(false);
    setPatientName('');
  };

  const statusBadges: Record<string, string> = {
    scheduled: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    checked_in: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    in_progress: 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse',
    in_consultation: 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse',
    completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    cancelled: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Outpatient Clinic & Consultation Schedules
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-mono font-medium border border-slate-700">
              {filteredAppointments.length} Booked
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Doctor availability scheduling, patient queue check-ins, and specialist clinic bookings.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/30 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Book Consultation
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by patient, doctor, or consultation reason..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments List Table */}
      <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <table className="w-full text-left text-xs text-slate-200">
          <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5">Patient Name</th>
              <th className="p-3.5">Specialist & Department</th>
              <th className="p-3.5">Schedule Slot</th>
              <th className="p-3.5">Clinical Purpose</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Workflow Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-white">
                    {apt.patientName}
                    <div className="text-[10px] text-slate-400 font-mono">{apt.patientId}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-medium text-slate-200">{apt.doctorName}</div>
                    <div className="text-[10px] text-slate-400">{apt.department}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-mono text-cyan-300 font-semibold">{apt.time}</div>
                    <div className="text-[10px] text-slate-400">{apt.date}</div>
                  </td>
                  <td className="p-3.5 text-slate-300">{apt.type}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        statusBadges[apt.status]
                      }`}
                    >
                      {apt.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {apt.status === 'scheduled' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'checked_in')}
                          className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px]"
                        >
                          Check In
                        </button>
                      )}

                      {apt.status === 'checked_in' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'in_progress')}
                          className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium text-[11px]"
                        >
                          Start Visit
                        </button>
                      )}

                      {apt.status === 'in_progress' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px]"
                        >
                          Complete
                        </button>
                      )}

                      {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 text-[11px]"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No appointments scheduled matching this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Schedule Consultation Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl text-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-400" />
                Schedule Clinic Appointment
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Johnathan Doe"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Attending Specialist</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty} • {d.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="10:30 AM"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Appointment Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Appointment['type'])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Routine Checkup">Routine Checkup</option>
                  <option value="Specialist Consultation">Specialist Consultation</option>
                  <option value="Post-Op Followup">Post-Op Followup</option>
                  <option value="Emergency Review">Emergency Review</option>
                  <option value="Diagnostic Procedure">Diagnostic Procedure</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Clinical Reason / Chief Complaint</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Post-Op Wound Inspection, Arrhythmia review"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
