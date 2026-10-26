import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api';
import { ParkingFacility, ParkingSlot } from '../../types';
import { ParkingSlotGrid } from '../../components/ParkingSlotGrid';
import { 
  Layers, 
  Plus, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Sparkles,
  MapPin,
  Car
} from 'lucide-react';

export const AdminSlotsPage: React.FC = () => {
  const [facilities, setFacilities] = useState<ParkingFacility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSlotNumber, setNewSlotNumber] = useState('');
  const [newFloor, setNewFloor] = useState('Floor 1');
  const [newZone, setNewZone] = useState('Zone A');
  const [newCompat, setNewCompat] = useState('car');
  const [newRate, setNewRate] = useState(40);

  const [inspectSlot, setInspectSlot] = useState<ParkingSlot | null>(null);

  const loadFacilities = async () => {
    try {
      const data = await apiRequest('/facilities');
      const facs = data.facilities || [];
      setFacilities(facs);
      if (facs.length > 0 && !selectedFacilityId) {
        setSelectedFacilityId(facs[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadSlots = async () => {
    if (!selectedFacilityId) return;
    try {
      setLoading(true);
      const data = await apiRequest(`/facilities/${selectedFacilityId}/slots`);
      setSlots(data.slots || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  useEffect(() => {
    loadSlots();
  }, [selectedFacilityId]);

  const handleToggleMaintenance = async (slot: ParkingSlot) => {
    setError(null);
    setSuccess(null);

    // Section 16 guard: An occupied slot must not be marked out of service while a vehicle is checked in
    if (slot.status === 'occupied') {
      setError(`Cannot toggle maintenance on slot ${slot.slot_number} because a vehicle is currently checked in.`);
      return;
    }

    try {
      const res = await apiRequest(`/admin/slots/${slot.id}/toggle-maintenance`, {
        method: 'PUT'
      });
      setSuccess(res.message);
      await loadSlots();
      setInspectSlot(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacilityId || !newSlotNumber.trim()) return;

    setError(null);
    setSuccess(null);

    try {
      await apiRequest('/admin/slots', {
        method: 'POST',
        body: JSON.stringify({
          facility_id: selectedFacilityId,
          slot_number: newSlotNumber.trim().toUpperCase(),
          floor: newFloor.trim(),
          zone: newZone.trim(),
          compatible_category: newCompat,
          hourly_rate: Number(newRate)
        })
      });

      setSuccess(`Bay ${newSlotNumber.toUpperCase()} added to facility with online IoT sensor.`);
      setIsAddModalOpen(false);
      setNewSlotNumber('');
      await loadSlots();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 2xl:px-14 py-8 space-y-8 min-h-[calc(100vh-5rem)]">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD2]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
            Infrastructure Matrix
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#292522] mt-1">
            Parking <span className="text-[#F97316]">Slot Management</span>
          </h1>
          <p className="text-xs text-[#3A332E]/70 mt-1">
            Monitor real-time bay occupancy, toggle maintenance states, and provision new parking bays.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold text-xs shadow-md shadow-[#F97316]/20"
        >
          <Plus className="w-4 h-4" /> Provision New Bay
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-[#27864B]/10 border border-[#27864B]/30 flex items-center gap-3 text-xs text-[#27864B] font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-[#C83B32]/10 border border-[#C83B32]/30 flex items-center gap-3 text-xs text-[#C83B32] font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Facility Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {facilities.map(fac => (
          <button
            key={fac.id}
            onClick={() => setSelectedFacilityId(fac.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedFacilityId === fac.id
                ? 'bg-[#292522] text-[#F97316] shadow-sm'
                : 'bg-[#FFFDF9] border border-[#E8DDD2] text-[#3A332E] hover:bg-[#FFF7ED]'
            }`}
          >
            {fac.name} ({fac.total_slots} bays)
          </button>
        ))}
      </div>

      {/* Visual Slot Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-4">
          <ParkingSlotGrid
            slots={slots}
            selectedSlotId={inspectSlot?.id}
            interactive={true}
            onSelectSlot={(slot) => setInspectSlot(slot)}
          />
        </div>

        {/* Slot Inspector / Maintenance Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-4">
            <h3 className="font-display font-bold text-lg text-[#292522]">
              Slot Action Panel
            </h3>

            {inspectSlot ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#E8DDD2] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-2xl text-[#EA580C]">
                      Bay {inspectSlot.slot_number}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      inspectSlot.status === 'available' ? 'bg-[#27864B] text-white' :
                      inspectSlot.status === 'occupied' ? 'bg-[#C83B32] text-white' :
                      inspectSlot.status === 'reserved' ? 'bg-[#EA580C] text-white' :
                      'bg-[#3A332E] text-white'
                    }`}>
                      {inspectSlot.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-[#3A332E]/80">
                    <p>Floor & Zone: <span className="font-bold text-[#292522]">{inspectSlot.floor} ({inspectSlot.zone})</span></p>
                    <p>Compatibility: <span className="font-bold text-[#292522] capitalize">{inspectSlot.compatible_category}</span></p>
                    <p>Hourly Tariff: <span className="font-bold text-[#EA580C]">₹{inspectSlot.hourly_rate}/hr</span></p>
                    <p>Sensor Node: <span className="font-mono text-[#292522]">{inspectSlot.sensor_code || 'Mapped'}</span></p>
                  </div>
                </div>

                {inspectSlot.status === 'occupied' ? (
                  <div className="p-3 rounded-xl bg-[#C83B32]/10 border border-[#C83B32]/30 text-xs text-[#C83B32] flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>This bay is occupied by a checked-in vehicle. It cannot be altered until the vehicle exits.</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleToggleMaintenance(inspectSlot)}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                      inspectSlot.status === 'out_of_service'
                        ? 'bg-[#27864B] hover:bg-[#1e6a3a] text-white'
                        : 'bg-[#3A332E] hover:bg-[#292522] text-[#F97316]'
                    }`}
                  >
                    <Wrench className="w-4 h-4" />
                    {inspectSlot.status === 'out_of_service'
                      ? 'Restore to Operational (Available)'
                      : 'Take Out of Service (Maintenance)'}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#3A332E]/60 italic">
                Click any slot on the grid to inspect details, check ultrasonic telemetry, or toggle maintenance mode.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#292522]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] p-8 max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="font-display font-bold text-xl text-[#292522]">
              Provision New Parking Bay
            </h3>

            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                  Slot Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={newSlotNumber}
                  onChange={(e) => setNewSlotNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. A09, B12, C05"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] font-mono font-bold text-sm text-[#292522] outline-hidden focus:border-[#F97316]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                    Floor Level *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFloor}
                    onChange={(e) => setNewFloor(e.target.value)}
                    placeholder="Floor 1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] text-xs font-semibold text-[#292522]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                    Zone *
                  </label>
                  <input
                    type="text"
                    required
                    value={newZone}
                    onChange={(e) => setNewZone(e.target.value)}
                    placeholder="Zone A"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] text-xs font-semibold text-[#292522]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                    Compatibility
                  </label>
                  <select
                    value={newCompat}
                    onChange={(e) => setNewCompat(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] bg-white text-xs font-semibold text-[#292522]"
                  >
                    <option value="car">Car / Sedan</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="scooter">Scooter</option>
                    <option value="all">Universal / All</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                    Hourly Tariff (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={newRate}
                    onChange={(e) => setNewRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] text-xs font-bold text-[#EA580C]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DDD2] text-xs font-bold text-[#3A332E] hover:bg-[#F4F0EB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white text-xs font-bold shadow-md"
                >
                  Provision Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
