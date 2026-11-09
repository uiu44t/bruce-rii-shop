import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Siren,
  Phone,
  Navigation,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Flame,
  Send,
  User,
  Shield,
  Activity,
  MapPin,
  Compass,
} from 'lucide-react';
import { Ambulance, AmbulanceStatus } from '../types';

export const AmbulanceView: React.FC = () => {
  const {
    ambulances,
    dispatches,
    dispatchAmbulance,
    updateAmbulanceStatus,
    addToast,
    logAuditEvent,
  } = useHospital();

  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(ambulances[0] || null);

  const activeTrip = selectedAmbulance
    ? (dispatches.find((d) => d.ambulanceId === selectedAmbulance.id && d.status !== 'completed') || selectedAmbulance.currentTrip)
    : null;

  // Dispatch Modal
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [targetAmbulanceId, setTargetAmbulanceId] = useState(ambulances[0]?.id || '');
  const [pickupLocation, setPickupLocation] = useState('KN 7 Rd, Nyarugenge Market, Kigali');
  const [destinationHospital, setDestinationHospital] = useState('Metropolitan Hospital System (Level 1 Trauma Center)');
  const [callerName, setCallerName] = useState('Emergency Dispatch Officer (912)');
  const [callerPhone, setCallerPhone] = useState('+250 788 912 000');
  const [patientCondition, setPatientCondition] = useState('Multi-vehicle collision, unconscious driver, severe thoracic trauma');
  const [etaMinutes, setEtaMinutes] = useState(12);

  const availableAmbulances = ambulances.filter((a) => (a.currentStatus || a.status) === 'Available');

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const amb = ambulances.find((a) => a.id === targetAmbulanceId);
    if (!amb) return;

    dispatchAmbulance({
      ambulanceId: amb.id,
      vehicleNumber: amb.vehicleNumber || amb.plateNumber || 'AMB-01',
      patientName: callerName,
      callerPhone,
      pickupLocation,
      destinationHospital,
      urgency: 'Critical',
      estimatedArrivalMinutes: etaMinutes,
      notes: patientCondition,
      branchId: amb.branchId || 'branch-kigali',
    });

    setSelectedAmbulance((prev) =>
      prev?.id === amb.id
        ? {
            ...prev,
            currentStatus: 'Dispatched',
            status: 'Dispatched',
            currentLocation: 'Dispatched from Bay - En route to pickup',
          }
        : prev
    );

    setShowDispatchModal(false);
  };

  const handleStatusChange = (ambId: string, newStatus: AmbulanceStatus) => {
    updateAmbulanceStatus(ambId, newStatus);
    setSelectedAmbulance((prev) => (prev?.id === ambId ? { ...prev, currentStatus: newStatus, status: newStatus } : prev));
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <Siren className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Imbangukiragutabara / Ambulance & Emergency Dispatch
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {availableAmbulances.length} Ready to Roll
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Fleet Tracking • Paramedic ALS Crews • Emergency 912 Interconnect • Live GPS Telemetry
              </p>
            </div>
          </div>

          <button
            id="btn-dispatch-stat-ambulance"
            onClick={() => {
              if (availableAmbulances.length > 0) {
                setTargetAmbulanceId(availableAmbulances[0].id);
              }
              setShowDispatchModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto active:scale-95"
          >
            <Flame className="w-4 h-4 text-white" />
            Kohereza Imbangukiragutabara / Dispatch STAT
          </button>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800 text-xs">
          {[
            { label: 'Available (Bay)', count: ambulances.filter((a) => (a.currentStatus || a.status) === 'Available').length, color: 'text-emerald-400' },
            { label: 'Dispatched', count: ambulances.filter((a) => (a.currentStatus || a.status) === 'Dispatched').length, color: 'text-amber-400' },
            { label: 'In-Transit to ER', count: ambulances.filter((a) => (a.currentStatus || a.status) === 'In-Transit').length, color: 'text-rose-400' },
            { label: 'Maintenance', count: ambulances.filter((a) => (a.currentStatus || a.status) === 'Maintenance').length, color: 'text-slate-500' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
              <div className="text-[11px] text-slate-400">{item.label}</div>
              <div className={`text-lg font-bold font-mono mt-0.5 ${item.color}`}>{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fleet Grid & Dispatch Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ambulance Fleet Cards */}
        <div className="lg:col-span-6 space-y-3">
          {ambulances.map((amb) => {
            const isSelected = selectedAmbulance?.id === amb.id;
            const ambStatus = amb.currentStatus || amb.status || 'Available';
            const ambPlate = amb.vehicleNumber || amb.plateNumber || 'AMB-UNIT';
            return (
              <div
                key={amb.id}
                id={`ambulance-item-${amb.id}`}
                onClick={() => setSelectedAmbulance(amb)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-500 shadow-lg shadow-amber-950/30'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                        ambStatus === 'Available'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : ambStatus === 'Dispatched' || ambStatus === 'In-Transit'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Siren className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">{ambPlate}</span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {amb.type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{amb.currentLocation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                        ambStatus === 'Available'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : ambStatus === 'Dispatched'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                          : ambStatus === 'In-Transit'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {ambStatus.toUpperCase()}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Driver: <strong className="text-slate-200">{amb.driverName}</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Ambulance Control Deck & Active Mission */}
        <div className="lg:col-span-6 space-y-4">
          {selectedAmbulance ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-bold text-white">
                      {selectedAmbulance.vehicleNumber || selectedAmbulance.plateNumber}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
                      {selectedAmbulance.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Assigned to: Central Trauma Bay 1</div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  {(['Available', 'Dispatched', 'In-Transit', 'Maintenance'] as AmbulanceStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedAmbulance.id, st)}
                      className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                        selectedAmbulance.status === st
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crew Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                    Shoferi / Driver
                  </span>
                  <div className="font-bold text-white">{selectedAmbulance.driverName}</div>
                  <div className="font-mono text-cyan-400 text-[11px] flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedAmbulance.driverPhone}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                    Paramedic Crew Lead
                  </span>
                  <div className="font-bold text-white">{selectedAmbulance.paramedicName}</div>
                  <div className="text-emerald-400 text-[11px] flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    ALS Certified Level 3
                  </div>
                </div>
              </div>

              {/* On-Board Medical Equipment Checklist */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                  Ibikoresho by'Ubutabazi / Critical Equipment On-Board
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {selectedAmbulance.equipment.map((eq, i) => (
                    <div
                      key={i}
                      className="p-2 bg-slate-950/50 border border-slate-800 rounded-lg flex items-center gap-1.5 text-slate-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{eq}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Trip Telemetry */}
              {activeTrip ? (
                <div className="p-4 bg-rose-950/30 border border-rose-800/60 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-rose-900/50 pb-2">
                    <span className="font-bold text-rose-300 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                      Ubutumwa buri gukorwa / Active Emergency Mission
                    </span>
                    <span className="text-xs font-mono font-bold text-white bg-rose-900/80 px-2 py-0.5 rounded">
                      ETA: {activeTrip.estimatedArrivalMinutes || (activeTrip as any).etaMinutes || 10} mins
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <span className="text-slate-400">Ahagiwe (Pickup): </span>
                      <strong className="text-white">{activeTrip.pickupLocation}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Ibitaro Byerekejweho: </span>
                      <strong className="text-white">{activeTrip.destinationHospital}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Imiterere y'Umurwayi: </span>
                      <span className="text-rose-200">{activeTrip.notes || (activeTrip as any).patientCondition || 'Emergency'}</span>
                    </div>
                    <div className="flex justify-between pt-1 text-[11px] text-slate-400 border-t border-rose-950">
                      <span>Caller: {activeTrip.patientName || (activeTrip as any).callerName} ({activeTrip.callerPhone})</span>
                      <span>Dispatched: {activeTrip.dispatchedAt}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
                  Ambulance is currently on stand-by at base. No active emergency call assigned.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
              Select an ambulance unit to view telemetry and dispatch controls.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: DISPATCH AMBULANCE */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Siren className="w-5 h-5 text-rose-500 animate-pulse" />
                Kohereza Imbangukiragutabara / Dispatch STAT Ambulance
              </h3>
              <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleDispatch} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Ambulance Unit</label>
                <select
                  value={targetAmbulanceId}
                  onChange={(e) => setTargetAmbulanceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                >
                  {ambulances.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.vehicleNumber || a.plateNumber} ({a.type}) - {a.currentStatus || a.status} (Driver: {a.driverName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ahagiwe / Pickup Location</label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ibitaro Byerekejweho / Destination Hospital</label>
                <input
                  type="text"
                  value={destinationHospital}
                  onChange={(e) => setDestinationHospital(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Uwahamagaye / Caller Name</label>
                  <input
                    type="text"
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Caller Phone</label>
                  <input
                    type="text"
                    value={callerPhone}
                    onChange={(e) => setCallerPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Imiterere y'Umurwayi / Patient Condition</label>
                <textarea
                  rows={2}
                  value={patientCondition}
                  onChange={(e) => setPatientCondition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Estimated Travel Time (ETA Minutes)</label>
                <input
                  type="number"
                  value={etaMinutes}
                  onChange={(e) => setEtaMinutes(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5"
                >
                  <Siren className="w-3.5 h-3.5" />
                  Emeza Kohereza / Dispatch Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
