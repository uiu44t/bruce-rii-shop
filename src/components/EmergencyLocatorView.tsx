import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Siren,
  BedDouble,
  Clock,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  SlidersHorizontal,
  Building2,
  Activity,
  Search,
} from 'lucide-react';
import { RWANDA_FACILITIES } from '../data/mockRwandaNationalData';
import { Facility } from '../types';

interface UserLocation {
  name: string;
  latitude: number;
  longitude: number;
  district: string;
}

const PRESET_LOCATIONS: UserLocation[] = [
  { name: 'Kigali City Center (Nyarugenge - Commercial)', latitude: -1.9482, longitude: 30.0578, district: 'Nyarugenge' },
  { name: 'Kacyiru / Ministries (Gasabo)', latitude: -1.9441, longitude: 30.0898, district: 'Gasabo' },
  { name: 'Kimironko Market / Remera (Gasabo)', latitude: -1.9358, longitude: 30.1192, district: 'Gasabo' },
  { name: 'Kanombe / Airport Area (Kicukiro)', latitude: -1.9792, longitude: 30.1558, district: 'Kicukiro' },
  { name: 'Gikondo Industrial / Residential (Kicukiro)', latitude: -1.9712, longitude: 30.1025, district: 'Kicukiro' },
  { name: 'Musanze Downtown (Northern Province)', latitude: -1.4983, longitude: 29.6358, district: 'Musanze' },
  { name: 'Huye / Butare University (Southern Province)', latitude: -2.6044, longitude: 29.7433, district: 'Huye' },
  { name: 'Rwamagana Town (Eastern Province)', latitude: -1.9487, longitude: 30.4347, district: 'Rwamagana' },
];

// Haversine distance in kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export const EmergencyLocatorView: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<UserLocation>(PRESET_LOCATIONS[0]);
  const [emergencyOnly, setEmergencyOnly] = useState<boolean>(true);
  const [icuAvailableOnly, setIcuAvailableOnly] = useState<boolean>(false);
  const [ambulancesOnly, setAmbulancesOnly] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Dispatch Modal state
  const [dispatchFacility, setDispatchFacility] = useState<(Facility & { distanceKm?: number; etaMinutes?: number }) | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<boolean>(false);
  const [callerName, setCallerName] = useState<string>('Officer In Charge');
  const [callerPhone, setCallerPhone] = useState<string>('+250 788 123 456');
  const [emergencyNature, setEmergencyNature] = useState<string>('Severe respiratory distress / acute trauma');

  // Facilities with computed distance and ETA
  const facilitiesWithDistance = useMemo(() => {
    return RWANDA_FACILITIES.map((facility) => {
      const distance = calculateDistanceKm(
        selectedLocation.latitude,
        selectedLocation.longitude,
        facility.latitude || 0,
        facility.longitude || 0
      );

      // Estimated drive time: in urban Kigali ~30km/h average, provincial ~50km/h
      const avgSpeedKmh = facility.province === 'Kigali City' ? 32 : 55;
      const etaMinutes = Math.max(3, Math.round((distance / avgSpeedKmh) * 60) + 2);

      return {
        ...facility,
        distanceKm: distance,
        etaMinutes,
      };
    })
      .filter((fac) => {
        if (emergencyOnly && !fac.emergency_available) return false;
        if (icuAvailableOnly && (!fac.icu_beds || fac.icu_beds.available <= 0)) return false;
        if (ambulancesOnly && (!fac.available_ambulances || fac.available_ambulances <= 0)) return false;
        if (selectedCategory !== 'ALL' && fac.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = fac.name.toLowerCase().includes(q);
          const matchDist = fac.district.toLowerCase().includes(q);
          const matchProv = fac.province.toLowerCase().includes(q);
          const matchDept = fac.departments?.some((d) => d.toLowerCase().includes(q));
          if (!matchName && !matchDist && !matchProv && !matchDept) return false;
        }
        return true;
      })
      // Objective sort by physical distance + ETA, no subjective "best" ranking
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [selectedLocation, emergencyOnly, icuAvailableOnly, ambulancesOnly, selectedCategory, searchQuery]);

  const handleSimulateGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSelectedLocation({
            name: `Live GPS: (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            district: 'Detected Location',
          });
        },
        () => {
          // Fallback to random preset if blocked in iframe
          const randomLoc = PRESET_LOCATIONS[Math.floor(Math.random() * PRESET_LOCATIONS.length)];
          setSelectedLocation(randomLoc);
        }
      );
    }
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setDispatchSuccess(true);
    setTimeout(() => {
      setDispatchSuccess(false);
      setDispatchFacility(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Location Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Siren className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  Emergency Healthcare Locator
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Distance & Capacity
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Objective proximity, travel ETA, emergency readiness, ICU beds, and ambulance standby.
                </p>
              </div>
            </div>
          </div>

          {/* Current Location Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Origin</span>
                <select
                  id="origin-location-selector"
                  value={selectedLocation.name}
                  onChange={(e) => {
                    const found = PRESET_LOCATIONS.find((l) => l.name === e.target.value);
                    if (found) setSelectedLocation(found);
                  }}
                  className="bg-transparent text-slate-100 font-medium text-xs focus:outline-none cursor-pointer"
                >
                  {PRESET_LOCATIONS.map((loc) => (
                    <option key={loc.name} value={loc.name} className="bg-slate-900 text-slate-200">
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              id="detect-gps-button"
              onClick={handleSimulateGPS}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold transition-all"
            >
              <Navigation className="w-3.5 h-3.5" />
              Detect GPS
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="search-facilities-input"
                type="text"
                placeholder="Search facility name, sector, service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
              />
            </div>

            <button
              id="filter-emergency-toggle"
              onClick={() => setEmergencyOnly(!emergencyOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                emergencyOnly
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              🚨 24/7 Emergency ({RWANDA_FACILITIES.filter((f) => f.emergency_available).length})
            </button>

            <button
              id="filter-icu-toggle"
              onClick={() => setIcuAvailableOnly(!icuAvailableOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                icuAvailableOnly
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              🛏️ ICU Beds Available
            </button>

            <button
              id="filter-ambulances-toggle"
              onClick={() => setAmbulancesOnly(!ambulancesOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                ambulancesOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              🚑 Ambulances Standby
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Category:</span>
            <select
              id="facility-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Facilities ({RWANDA_FACILITIES.length})</option>
              <option value="HOSPITAL">Hospitals</option>
              <option value="HEALTH_CENTER">Health Centers</option>
              <option value="CLINIC">Private Clinics</option>
              <option value="LABORATORY">Diagnostic Labs</option>
              <option value="PHARMACY">Pharmacies</option>
              <option value="AMBULANCE_BASE">Ambulance Bases (SAMU)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Facilities Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {facilitiesWithDistance.map((fac) => (
          <div
            key={fac.id}
            id={`facility-card-${fac.id}`}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group"
          >
            <div>
              {/* Header with ETA & Distance Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 uppercase tracking-wider">
                      {fac.category || fac.type}
                    </span>
                    {fac.is_international && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        International
                      </span>
                    )}
                  </div>
                  <h2 className="text-sm font-bold text-slate-100 mt-1 line-clamp-1 group-hover:text-cyan-300 transition-colors">
                    {fac.name}
                  </h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {fac.district}, {fac.province} {fac.sector ? `(${fac.sector})` : ''}
                  </p>
                </div>

                {/* Distance & ETA Badge */}
                <div className="text-right shrink-0 bg-slate-800/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5">
                  <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" />
                    ~{fac.etaMinutes} min
                  </div>
                  <div className="text-[11px] font-medium text-slate-300">
                    {fac.distanceKm} km away
                  </div>
                </div>
              </div>

              {/* Status and Capability Matrix */}
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-2">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Emergency ED</div>
                  <div
                    className={`text-xs font-bold mt-0.5 flex items-center justify-center gap-1 ${
                      fac.emergency_available ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {fac.emergency_available ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Available
                      </>
                    ) : (
                      'Closed'
                    )}
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-2">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">ICU Beds</div>
                  <div
                    className={`text-xs font-bold mt-0.5 ${
                      fac.icu_beds && fac.icu_beds.available > 0 ? 'text-cyan-300' : 'text-slate-500'
                    }`}
                  >
                    {fac.icu_beds ? `${fac.icu_beds.available} / ${fac.icu_beds.total}` : 'N/A'}
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-2">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Ambulances</div>
                  <div
                    className={`text-xs font-bold mt-0.5 ${
                      fac.available_ambulances && fac.available_ambulances > 0 ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    {fac.available_ambulances ? `${fac.available_ambulances} Ready` : 'None'}
                  </div>
                </div>
              </div>

              {/* Key Services & Insurance tags */}
              <div className="mt-3 space-y-1.5">
                {fac.services && fac.services.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {fac.services.slice(0, 3).map((srv, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700/60"
                      >
                        {srv}
                      </span>
                    ))}
                    {fac.services.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800/60 text-slate-400">
                        +{fac.services.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">
                    {fac.insurance_supported.slice(0, 3).join(', ')}
                    {fac.insurance_supported.length > 3 ? ` +${fac.insurance_supported.length - 3}` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
              <a
                href={`tel:${fac.phone.replace(/[^0-9+]/g, '')}`}
                id={`call-facility-${fac.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                {fac.phone.split('/')[0]}
              </a>

              <button
                id={`dispatch-facility-${fac.id}`}
                onClick={() => setDispatchFacility(fac)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-rose-900/30"
              >
                <Siren className="w-3.5 h-3.5" />
                Dispatch / Refer
              </button>
            </div>
          </div>
        ))}
      </div>

      {facilitiesWithDistance.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No Facilities Match Current Filters</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search keyword or relaxing the ICU / ambulance availability toggles.
          </p>
        </div>
      )}

      {/* Ambulance Dispatch / Emergency Intake Modal */}
      {dispatchFacility && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <Siren className="w-5 h-5 animate-bounce" />
                <h3 className="text-base font-bold text-slate-100">Immediate Emergency Dispatch</h3>
              </div>
              <button
                id="close-dispatch-modal"
                onClick={() => setDispatchFacility(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800"
              >
                Cancel
              </button>
            </div>

            {dispatchSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-100">Emergency Dispatch Confirmed</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  AMB-912 Unit assigned. ETA to {selectedLocation.name}:{' '}
                  <span className="text-emerald-400 font-bold">~{dispatchFacility.etaMinutes} minutes</span>.
                </p>
                <div className="text-[11px] text-slate-400 bg-slate-800 p-2.5 rounded-xl">
                  Destination: <strong className="text-slate-200">{dispatchFacility.name}</strong> Emergency Department.
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmDispatch} className="space-y-4 text-xs">
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Target Facility</div>
                  <div className="text-sm font-bold text-slate-200">{dispatchFacility.name}</div>
                  <div className="text-xs text-emerald-400 mt-0.5">
                    Estimated Drive Time: ~{dispatchFacility.etaMinutes} mins ({dispatchFacility.distanceKm} km)
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Emergency Nature / Clinical Triage</label>
                  <input
                    type="text"
                    required
                    value={emergencyNature}
                    onChange={(e) => setEmergencyNature(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500 text-xs"
                    placeholder="e.g. Acute chest pain, Severe poly-trauma, Eclampsia"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Caller / Clinician Name</label>
                    <input
                      type="text"
                      required
                      value={callerName}
                      onChange={(e) => setCallerName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Contact Phone</label>
                    <input
                      type="text"
                      required
                      value={callerPhone}
                      onChange={(e) => setCallerPhone(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDispatchFacility(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    id="submit-dispatch-action"
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-md shadow-rose-900/40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Confirm & Transmit 912 Alert
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
