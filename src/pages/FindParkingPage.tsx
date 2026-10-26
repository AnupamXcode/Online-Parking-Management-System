import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api';
import { ParkingFacility, ParkingSlot, Reservation } from '../types';
import { ParkingSlotGrid } from '../components/ParkingSlotGrid';
import { DigitalTicket } from '../components/DigitalTicket';
import confetti from 'canvas-confetti';
import { 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Bike,
  Plus,
  Search,
  SlidersHorizontal,
  Building2,
  Store,
  Layers,
  ExternalLink,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';

export const FindParkingPage: React.FC = () => {
  const { user, vehicles } = useAuth();
  const navigate = useNavigate();
  const bookingSectionRef = useRef<HTMLDivElement>(null);

  const [facilities, setFacilities] = useState<ParkingFacility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);

  // Search, Category and Sorting Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'malls' | 'dmart'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'availability'>('recommended');
  
  // Dates: default start is next 15 min rounded to nearest 15 min, duration 2 hours
  const getDefaultStartTime = () => {
    const d = new Date(Date.now() + 15 * 60000);
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const getDefaultEndTime = () => {
    const d = new Date(Date.now() + 135 * 60000);
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const [startTime, setStartTime] = useState<string>(getDefaultStartTime);
  const [expectedEndTime, setExpectedEndTime] = useState<string>(getDefaultEndTime);
  
  const [vehiclePlate, setVehiclePlate] = useState<string>('');
  const [vehicleCategory, setVehicleCategory] = useState<string>('car');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [autoAllocate, setAutoAllocate] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmedBooking, setConfirmedBooking] = useState<Reservation | null>(null);

  // Load facilities and user vehicles
  useEffect(() => {
    apiRequest('/facilities')
      .then(data => {
        const facs = data.facilities || [];
        setFacilities(facs);
        if (facs.length > 0 && !selectedFacilityId) {
          setSelectedFacilityId(facs[0].id);
        }
      })
      .catch(err => setError(err.message));

    // Prefill vehicle from user vehicles or fallback to Nagpur demo plate
    if (vehicles.length > 0) {
      const def = vehicles.find(v => v.is_default) || vehicles[0];
      setVehiclePlate(def.plate_number);
      setVehicleCategory(def.category);
      setSelectedVehicleId(def.id);
    } else {
      setVehiclePlate('MH-31-EQ-4092');
    }
  }, [vehicles]);

  // Load slots for selected facility and time interval
  useEffect(() => {
    if (!selectedFacilityId) return;

    setSlotsLoading(true);
    setSelectedSlot(null);
    setError(null);

    const query = new URLSearchParams({
      startTime: new Date(startTime).toISOString(),
      expectedEndTime: new Date(expectedEndTime).toISOString(),
      category: vehicleCategory
    });

    apiRequest(`/facilities/${selectedFacilityId}/slots?${query.toString()}`)
      .then(data => {
        setSlots(data.slots || []);
      })
      .catch(err => {
        console.error('Failed to load slots:', err);
      })
      .finally(() => setSlotsLoading(false));
  }, [selectedFacilityId, startTime, expectedEndTime, vehicleCategory]);

  const selectedFacility = facilities.find(f => f.id === selectedFacilityId);

  // Filter and sort facilities
  const filteredFacilities = facilities.filter(fac => {
    // Category match
    if (categoryFilter === 'malls' && !fac.category?.toLowerCase().includes('mall')) {
      return false;
    }
    if (categoryFilter === 'dmart' && !fac.name.toLowerCase().includes('dmart') && !fac.category?.toLowerCase().includes('supermarket')) {
      return false;
    }

    // Search query match (name, locality, address, or category)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = fac.name.toLowerCase().includes(q);
      const matchAddress = fac.address.toLowerCase().includes(q);
      const matchCategory = fac.category?.toLowerCase().includes(q);
      if (!matchName && !matchAddress && !matchCategory) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') {
      return a.hourly_rate - b.hourly_rate;
    }
    if (sortBy === 'price_desc') {
      return b.hourly_rate - a.hourly_rate;
    }
    if (sortBy === 'availability') {
      const aAvail = a.available_slots ?? (a.total_slots || 0);
      const bAvail = b.available_slots ?? (b.total_slots || 0);
      return bAvail - aAvail;
    }
    return a.id - b.id;
  });

  // Calculate pricing preview
  const calculateEstimate = () => {
    const start = new Date(startTime);
    const end = new Date(expectedEndTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return { hours: 0, amount: 0, hourlyRate: selectedFacility?.hourly_rate || 40 };
    }
    const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (3600 * 1000)));
    const rate = selectedSlot?.hourly_rate || selectedFacility?.hourly_rate || 40;
    return {
      hours,
      hourlyRate: rate,
      amount: hours * rate
    };
  };

  const estimate = calculateEstimate();

  const handleFacilityCardClick = (facilityId: number) => {
    setSelectedFacilityId(facilityId);
    if (bookingSectionRef.current) {
      bookingSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedFacilityId) {
      setError('Please select a parking facility.');
      return;
    }

    if (!vehiclePlate.trim()) {
      setError('Please provide a vehicle plate number.');
      return;
    }

    if (new Date(expectedEndTime) <= new Date(startTime)) {
      setError('Expected exit time must be strictly after entry time.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          facility_id: selectedFacilityId,
          vehicle_plate: vehiclePlate.trim().toUpperCase(),
          vehicle_category: vehicleCategory,
          vehicle_id: selectedVehicleId || null,
          driver_name: user.name,
          driver_phone: user.phone,
          start_time: new Date(startTime).toISOString(),
          expected_end_time: new Date(expectedEndTime).toISOString(),
          preferred_slot_id: !autoAllocate && selectedSlot ? selectedSlot.id : null
        })
      });

      // Fire victory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F97316', '#C2410C', '#27864B', '#FDBA74']
      });

      setConfirmedBooking(data.booking);
    } catch (err: any) {
      setError(err.message || 'Failed to allocate parking slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 2xl:px-14 py-8 space-y-10 min-h-[calc(100vh-5rem)]">
      
      {/* Top Hero & Discovery Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#FFF7ED] via-[#FFFDF8] to-[#FFF7ED] border border-[#E8DDD2] p-6 lg:p-10 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F97316]/10 border border-[#F97316]/20 text-[#C2410C] text-xs font-extrabold uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-[#F97316]" />
            <span>Nagpur, Maharashtra • Smart City Grid</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#302923] tracking-tight leading-tight">
            Find Parking in <span className="text-[#F97316]">Nagpur</span>
          </h1>

          <p className="text-base text-[#8B7D70] leading-relaxed">
            Discover verified smart parking facilities across premier shopping malls and supermarkets in Nagpur. Inspect live floor layouts, check vehicle compatibility, and reserve guaranteed parking bays with automated entry passes.
          </p>

          {/* Prototype Simulated Data Disclaimer Banner */}
          <div className="flex items-start sm:items-center gap-3 p-3.5 rounded-2xl bg-[#FFEDD5]/60 border border-[#FDBA74]/50 text-xs text-[#302923]">
            <Info className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5 sm:mt-0" />
            <p>
              <strong className="font-bold text-[#C2410C]">Demonstration Prototype:</strong> Bay counts, hourly tariffs, and ultrasonic sensor status are simulated prototype values for academic research and workflow demonstration.
            </p>
          </div>
        </div>

        {/* Search, Category Filters, and Sort Controls */}
        <div className="mt-8 pt-6 border-t border-[#E8DDD2] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-5 h-5 text-[#8B7D70] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by mall, supermarket, or locality (e.g. Sitabuldi, Untkhana, Hingna, Besa)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E8DDD2] bg-white text-sm text-[#302923] placeholder-[#8B7D70]/70 focus:outline-none focus:ring-2 focus:ring-[#F97316] transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8B7D70] hover:text-[#302923] px-1.5 py-0.5 rounded-md bg-[#EDE3D8]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                categoryFilter === 'all'
                  ? 'bg-[#302923] text-white shadow-xs'
                  : 'bg-white text-[#8B7D70] border border-[#E8DDD2] hover:bg-[#FFF7ED]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Locations ({facilities.length})</span>
            </button>

            <button
              onClick={() => setCategoryFilter('malls')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                categoryFilter === 'malls'
                  ? 'bg-[#F97316] text-white shadow-xs shadow-[#F97316]/20'
                  : 'bg-white text-[#8B7D70] border border-[#E8DDD2] hover:bg-[#FFF7ED]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Malls</span>
            </button>

            <button
              onClick={() => setCategoryFilter('dmart')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                categoryFilter === 'dmart'
                  ? 'bg-[#27864B] text-white shadow-xs shadow-[#27864B]/20'
                  : 'bg-white text-[#8B7D70] border border-[#E8DDD2] hover:bg-[#FFF7ED]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>DMart Supermarkets</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-[#8B7D70]" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] bg-white text-xs font-bold text-[#302923] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="availability">Available Bays: Most</option>
            </select>
          </div>

        </div>
      </div>

      {/* Facilities Grid Discovery Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-xl text-[#302923]">
              Nagpur Parking Facilities ({filteredFacilities.length})
            </h2>
            <p className="text-xs text-[#8B7D70]">
              Click any facility to view its multi-floor bay layout and reserve an assigned slot.
            </p>
          </div>
        </div>

        {filteredFacilities.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-[#E8DDD2] space-y-3">
            <Search className="w-10 h-10 text-[#8B7D70] mx-auto opacity-40" />
            <p className="font-bold text-[#302923]">No facilities match your search criteria</p>
            <p className="text-xs text-[#8B7D70]">Try searching for "Untkhana", "Sitabuldi", "Hingna", or switch category filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
              className="px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredFacilities.map(fac => {
              const isSelected = selectedFacilityId === fac.id;
              const availableCount = fac.available_slots ?? fac.total_slots;
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${fac.name} ${fac.address}`)}`;

              return (
                <div
                  key={fac.id}
                  onClick={() => handleFacilityCardClick(fac.id)}
                  className={`group rounded-3xl bg-white border transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer ${
                    isSelected 
                      ? 'border-[#F97316] ring-3 ring-[#F97316]/20 shadow-lg' 
                      : 'border-[#E8DDD2] hover:border-[#FDBA74] hover:shadow-md'
                  }`}
                >
                  {/* Facility Image with Badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-[#EDE3D8]">
                    <img
                      src={fac.image_url || 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=80'}
                      alt={fac.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide backdrop-blur-md shadow-xs ${
                        fac.category?.toLowerCase().includes('mall')
                          ? 'bg-[#F97316] text-white'
                          : 'bg-[#27864B] text-white'
                      }`}>
                        {fac.category || 'Shopping Mall'}
                      </span>
                    </div>

                    {/* Rate Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-white/95 text-[#302923] shadow-xs backdrop-blur-md">
                        ₹{fac.hourly_rate}<span className="text-[10px] text-[#8B7D70] font-bold">/hr</span>
                      </span>
                    </div>

                    {/* Bottom overlay: Facility Name & Availability */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                      <div>
                        <p className="font-display font-bold text-lg leading-snug drop-shadow-sm text-white">
                          {fac.name}
                        </p>
                        <p className="text-[11px] text-[#FFEDD5] flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3 text-[#FDBA74]" /> Nagpur, Maharashtra
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Facility Details Body */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      {/* Address */}
                      <p className="text-xs text-[#8B7D70] line-clamp-2 leading-relaxed">
                        {fac.address}
                      </p>

                      {/* Floor & Vehicle Compatibility Pills */}
                      <div className="pt-2 border-t border-[#E8DDD2]/60 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#8B7D70]">Floors:</span>
                          <span className="font-semibold text-[#302923] truncate max-w-[180px]">{fac.floors_info || 'Ground Floor'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#8B7D70]">Vehicles:</span>
                          <span className="font-semibold text-[#302923]">{fac.supported_vehicles || 'Car, Motorcycle, EV'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Slot Availability & Action Bar */}
                    <div className="pt-4 border-t border-[#E8DDD2] space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#8B7D70]">Live Demo Availability:</span>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#27864B] animate-pulse"></span>
                          <span className="text-[#27864B]">{availableCount} / {fac.total_slots} Slots Free</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Search address on Google Maps"
                          className="p-2.5 rounded-xl border border-[#E8DDD2] bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#C2410C] transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFacilityCardClick(fac.id);
                          }}
                          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#302923] text-[#FDBA74] shadow-xs'
                              : 'bg-gradient-to-r from-[#F97316] to-[#C2410C] text-white hover:brightness-105 shadow-xs'
                          }`}
                        >
                          <span>{isSelected ? 'Selected • View Bays' : 'Select Facility'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Reservation Builder Form & Grid (Anchored) */}
      <div ref={bookingSectionRef} className="pt-6 border-t-2 border-[#E8DDD2]">
        
        {/* Section Heading */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F97316]/10 text-[#C2410C] text-xs font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Step 2 • Interactive Bay Allocation</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#302923]">
              Reserve at <span className="text-[#F97316]">{selectedFacility?.name || 'Selected Facility'}</span>
            </h2>
            <p className="text-xs text-[#8B7D70] mt-0.5">
              {selectedFacility?.address} • Rate: ₹{selectedFacility?.hourly_rate}/hr
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#8B7D70]">Selected Bay:</span>
            <span className="px-3 py-1 rounded-xl bg-[#FFF7ED] border border-[#FDBA74] text-xs font-black text-[#C2410C]">
              {selectedSlot ? `${selectedSlot.slot_number} (${selectedSlot.floor})` : (autoAllocate ? 'Smart Auto-Allocated' : 'None Selected')}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-[#C83B32]/10 border border-[#C83B32]/30 flex items-start gap-3 text-xs text-[#C83B32]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Reservation Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Reservation Form Layout */}
        <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Controls (Facility Details, Vehicle, Time, Transparent Breakdown) */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-6">
            
            {/* 1. Facility Switcher Dropdown */}
            <div className="p-6 rounded-3xl bg-white border border-[#E8DDD2] shadow-xs space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#C2410C]">
                1. Selected Nagpur Facility
              </label>
              <select
                value={selectedFacilityId || ''}
                onChange={(e) => setSelectedFacilityId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] bg-[#FFFDF8] text-xs font-bold text-[#302923]"
              >
                {facilities.map(fac => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} ({fac.category || 'Mall'}) — ₹{fac.hourly_rate}/hr
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#8B7D70]">
                {selectedFacility?.address}
              </p>
            </div>

            {/* 2. Vehicle Selection */}
            <div className="p-6 rounded-3xl bg-white border border-[#E8DDD2] shadow-xs space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#C2410C]">
                2. Vehicle Information
              </label>

              {vehicles.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-[#8B7D70] uppercase">Select from Saved Vehicles</span>
                  <select
                    value={selectedVehicleId || ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setSelectedVehicleId(id);
                      const veh = vehicles.find(v => v.id === id);
                      if (veh) {
                        setVehiclePlate(veh.plate_number);
                        setVehicleCategory(veh.category);
                      }
                    }}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] bg-[#FFFDF8] text-xs text-[#302923] font-semibold"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.plate_number} — {v.model || v.category.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#8B7D70] uppercase mb-1">
                    Plate Number
                  </label>
                  <input
                    type="text"
                    required
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                    placeholder="MH-31-EQ-4092"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DDD2] font-mono font-bold text-xs text-[#302923] uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#8B7D70] uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={vehicleCategory}
                    onChange={(e) => setVehicleCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DDD2] text-xs font-semibold text-[#302923] bg-[#FFFDF8]"
                  >
                    <option value="car">Car (Sedan/SUV)</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="scooter">Scooter</option>
                    <option value="ev">Electric Vehicle (EV)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Date and Time Interval */}
            <div className="p-6 rounded-3xl bg-white border border-[#E8DDD2] shadow-xs space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#C2410C]">
                3. Parking Time Window
              </label>

              <div>
                <label className="block text-[11px] font-bold text-[#8B7D70] uppercase mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#F97316]" /> Scheduled Entry
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] bg-[#FFFDF8] text-xs font-mono font-bold text-[#302923]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8B7D70] uppercase mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C2410C]" /> Expected Exit
                </label>
                <input
                  type="datetime-local"
                  required
                  value={expectedEndTime}
                  onChange={(e) => setExpectedEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] bg-[#FFFDF8] text-xs font-mono font-bold text-[#302923]"
                />
              </div>
            </div>

            {/* 4. Pricing & Allocation Summary */}
            <div className="p-6 rounded-3xl bg-[#FFF7ED] border border-[#FDBA74] shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#302923]">
                Transparent Fee Calculation
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#8B7D70]">
                  <span>Facility:</span>
                  <span className="font-bold text-[#302923]">{selectedFacility?.name}</span>
                </div>
                <div className="flex justify-between text-[#8B7D70]">
                  <span>Estimated Duration:</span>
                  <span className="font-bold text-[#302923]">{estimate.hours} hour(s)</span>
                </div>
                <div className="flex justify-between text-[#8B7D70]">
                  <span>Tariff Rate:</span>
                  <span className="font-bold text-[#302923]">₹{estimate.hourlyRate} / hr</span>
                </div>
                <div className="flex justify-between text-[#8B7D70]">
                  <span>Assigned Bay:</span>
                  <span className="font-semibold text-[#C2410C]">
                    {autoAllocate ? 'Smart Optimal Bay' : (selectedSlot ? selectedSlot.slot_number : 'Manual Selection')}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E8DDD2] flex justify-between items-center text-sm font-bold text-[#302923]">
                  <span>Estimated Total:</span>
                  <span className="font-display font-black text-2xl text-[#C2410C]">
                    ₹{estimate.amount}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#F97316] to-[#C2410C] hover:brightness-105 text-white font-bold text-sm shadow-md shadow-[#F97316]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Allocating Bay in Nagpur...' : 'Confirm & Reserve Bay'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Right Column: Multi-Floor Interactive Slot Layout */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-6">
            
            {/* Allocation Mode Header */}
            <div className="p-5 rounded-3xl bg-white border border-[#E8DDD2] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-[#302923]">
                  Slot Allocation Controls
                </p>
                <p className="text-xs text-[#8B7D70] mt-0.5">
                  {autoAllocate 
                    ? 'Automatic allocation assigns the nearest, highest-priority bay matching your vehicle size.'
                    : `Manual mode active. Selected slot: ${selectedSlot ? selectedSlot.slot_number : 'Click any green bay below'}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAutoAllocate(true);
                    setSelectedSlot(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    autoAllocate
                      ? 'bg-[#F97316] text-white shadow-xs'
                      : 'bg-[#FFF7ED] text-[#8B7D70] hover:text-[#302923]'
                  }`}
                >
                  Auto-Allocate
                </button>
                <button
                  type="button"
                  onClick={() => setAutoAllocate(false)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    !autoAllocate
                      ? 'bg-[#302923] text-[#FDBA74] shadow-xs'
                      : 'bg-[#FFF7ED] text-[#8B7D70] hover:text-[#302923]'
                  }`}
                >
                  Pick on Floor Map
                </button>
              </div>
            </div>

            {/* Interactive Slot Grid */}
            {slotsLoading ? (
              <div className="p-20 text-center rounded-3xl border border-[#E8DDD2] bg-white space-y-3">
                <div className="w-9 h-9 rounded-full border-3 border-[#F97316] border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-bold text-[#302923]">Querying slot interval availability at {selectedFacility?.name}...</p>
              </div>
            ) : (
              <ParkingSlotGrid
                slots={slots}
                selectedSlotId={selectedSlot?.id}
                interactive={!autoAllocate}
                onSelectSlot={(slot) => {
                  setSelectedSlot(slot);
                  setAutoAllocate(false);
                }}
              />
            )}

            {/* Overlap Guarantee Info */}
            <div className="p-5 rounded-3xl bg-white border border-[#E8DDD2] flex items-center gap-4 text-xs">
              <div className="w-11 h-11 rounded-2xl bg-[#27864B]/10 text-[#27864B] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-[#302923]">ACID Guaranteed Double-Booking Protection</p>
                <p className="text-[#8B7D70] leading-relaxed mt-0.5">
                  The SQLite transaction engine enforces temporal overlap queries. Once confirmed, your assigned bay is locked across the entire scheduled interval.
                </p>
              </div>
            </div>

          </div>

        </form>

      </div>

      {/* Confirmation & Digital Ticket Modal */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 bg-[#302923]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full my-8 animate-in fade-in zoom-in-95 duration-200">
            <DigitalTicket
              booking={confirmedBooking}
              onClose={() => {
                setConfirmedBooking(null);
                navigate('/bookings');
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};
