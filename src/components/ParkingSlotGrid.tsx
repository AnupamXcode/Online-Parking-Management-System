import React, { useState } from 'react';
import { ParkingSlot } from '../types';
import { Car, Bike, Info, Sparkles, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface ParkingSlotGridProps {
  slots: ParkingSlot[];
  selectedSlotId?: number | null;
  onSelectSlot?: (slot: ParkingSlot) => void;
  interactive?: boolean;
}

export const ParkingSlotGrid: React.FC<ParkingSlotGridProps> = ({
  slots,
  selectedSlotId,
  onSelectSlot,
  interactive = true
}) => {
  const [activeFloor, setActiveFloor] = useState<string>('all');
  const [hoveredSlot, setHoveredSlot] = useState<ParkingSlot | null>(null);

  // Extract unique floors
  const floors = Array.from(new Set(slots.map(s => s.floor))).filter(Boolean);

  const filteredSlots = activeFloor === 'all' 
    ? slots 
    : slots.filter(s => s.floor === activeFloor);

  // Group by zone or display in realistic rows
  const getEffectiveStatus = (slot: ParkingSlot) => {
    if (slot.id === selectedSlotId) return 'selected';
    return slot.interval_status || slot.status;
  };

  const getSlotColorClasses = (status: string) => {
    switch (status) {
      case 'selected':
        return 'bg-[#F97316] text-white border-2 border-[#C2410C] ring-4 ring-[#F97316]/30 shadow-lg scale-105';
      case 'available':
        return 'bg-[#27864B]/10 hover:bg-[#27864B]/20 text-[#27864B] border-2 border-[#27864B]/40 hover:border-[#27864B] shadow-xs cursor-pointer';
      case 'reserved':
        return 'bg-[#EA580C]/15 text-[#C2410C] border-2 border-[#EA580C]/40 cursor-not-allowed';
      case 'occupied':
        return 'bg-[#C83B32]/10 text-[#C83B32] border-2 border-[#C83B32]/40 cursor-not-allowed';
      case 'out_of_service':
      default:
        return 'bg-[#3A332E]/10 text-[#3A332E]/60 border-2 border-dashed border-[#3A332E]/30 cursor-not-allowed';
    }
  };

  const getVehicleIcon = (category: string) => {
    switch (category) {
      case 'motorcycle':
      case 'scooter':
        return <Bike className="w-3.5 h-3.5" />;
      default:
        return <Car className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] p-6 shadow-xs space-y-6">
      
      {/* Header and Legend Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD2]">
        
        {/* Floor selection tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveFloor('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              activeFloor === 'all'
                ? 'bg-[#292522] text-[#F97316]'
                : 'bg-[#F4F0EB] text-[#3A332E] hover:bg-[#FFF7ED]'
            }`}
          >
            All Floors ({slots.length})
          </button>
          {floors.map(floor => {
            const count = slots.filter(s => s.floor === floor).length;
            return (
              <button
                key={floor}
                onClick={() => setActiveFloor(floor)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  activeFloor === floor
                    ? 'bg-[#292522] text-[#F97316]'
                    : 'bg-[#F4F0EB] text-[#3A332E] hover:bg-[#FFF7ED]'
                }`}
              >
                {floor} ({count})
              </button>
            );
          })}
        </div>

        {/* Universal Status Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#27864B] border border-[#27864B]"></span>
            <span className="text-[#3A332E]">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#F97316] border border-[#C2410C]"></span>
            <span className="text-[#3A332E]">Selected / Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#C83B32] border border-[#C83B32]"></span>
            <span className="text-[#3A332E]">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#3A332E]/30 border border-dashed border-[#3A332E]/50"></span>
            <span className="text-[#3A332E]/70">Out of Service</span>
          </div>
        </div>
      </div>

      {/* Visual Parking Map Container */}
      <div className="p-6 rounded-2xl bg-[#F4F0EB] border border-[#E8DDD2] relative overflow-hidden">
        
        {/* Driving Lane Line Overlay */}
        <div className="mb-4 flex items-center justify-between text-[11px] font-mono text-[#3A332E]/60 uppercase tracking-widest px-2">
          <span>← Driveway Inbound Lane</span>
          <span>Driveway Outbound Lane →</span>
        </div>

        {/* Slot Grid Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filteredSlots.map(slot => {
            const status = getEffectiveStatus(slot);
            const isClickable = interactive && (status === 'available' || status === 'selected');

            return (
              <div
                key={slot.id}
                onClick={() => {
                  if (isClickable && onSelectSlot) {
                    onSelectSlot(slot);
                  }
                }}
                onMouseEnter={() => setHoveredSlot(slot)}
                onMouseLeave={() => setHoveredSlot(null)}
                className={`relative p-3 rounded-2xl flex flex-col justify-between items-center min-h-[92px] transition-all select-none ${getSlotColorClasses(
                  status
                )}`}
              >
                {/* Top Bar inside Slot: Category Icon & Sensor Ping */}
                <div className="w-full flex items-center justify-between text-[10px] opacity-80">
                  <span>{getVehicleIcon(slot.compatible_category)}</span>
                  {slot.sensor_code && (
                    <span 
                      className={`w-1.5 h-1.5 rounded-full ${
                        status === 'occupied' ? 'bg-[#C83B32]' : 'bg-[#27864B]'
                      } animate-pulse`} 
                      title={`IoT Sensor: ${slot.sensor_code}`}
                    />
                  )}
                </div>

                {/* Central Slot Number */}
                <div className="font-display font-black text-xl tracking-tight my-1">
                  {slot.slot_number}
                </div>

                {/* Bottom Floor or Status tag */}
                <div className="text-[10px] font-mono font-bold tracking-wider uppercase opacity-75">
                  {status === 'selected' ? 'CHOSEN' : slot.zone || slot.floor}
                </div>
              </div>
            );
          })}
        </div>

        {/* Central Driveway Markings */}
        <div className="mt-5 pt-3 border-t-2 border-dashed border-[#E8DDD2] flex items-center justify-center">
          <span className="px-4 py-1 rounded-full bg-[#FFFDF9] border border-[#E8DDD2] text-[10px] font-mono font-bold text-[#3A332E]/70 uppercase tracking-wider">
            Automated Sensor Surface Lane
          </span>
        </div>
      </div>

      {/* Selected or Hovered Slot Inspector Strip */}
      {hoveredSlot ? (
        <div className="p-4 rounded-xl bg-[#FFF7ED] border border-[#E8DDD2] flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EA580C] text-white font-display font-bold flex items-center justify-center">
              {hoveredSlot.slot_number}
            </div>
            <div>
              <p className="font-bold text-[#292522]">
                Slot {hoveredSlot.slot_number} — {hoveredSlot.floor} ({hoveredSlot.zone})
              </p>
              <p className="text-[#3A332E]/70">
                Compatibility: <span className="font-semibold capitalize text-[#292522]">{hoveredSlot.compatible_category}</span> • Rate: <span className="font-bold text-[#EA580C]">₹{hoveredSlot.hourly_rate}/hr</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full font-bold text-[11px] uppercase tracking-wider bg-white border border-[#E8DDD2] text-[#3A332E]">
              Status: {hoveredSlot.interval_status || hoveredSlot.status}
            </span>
            {hoveredSlot.sensor_code && (
              <span className="px-2.5 py-1 rounded-full font-mono text-[11px] bg-[#27864B]/10 text-[#27864B] font-semibold">
                Sensor: {hoveredSlot.distance_cm || 285}cm
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-[#3A332E]/60 italic px-2">
          <Info className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Click on any available green slot to choose your preferred bay, or let our smart allocation pick the optimal slot.</span>
        </div>
      )}

    </div>
  );
};
