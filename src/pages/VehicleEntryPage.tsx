import React, { useState } from 'react';
import { apiRequest } from '../api';
import { GateBarrierAnimation } from '../components/GateBarrierAnimation';
import { Reservation } from '../types';
import { 
  ArrowRightCircle, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Car, 
  MapPin, 
  Clock, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Ticket
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const VehicleEntryPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [validatedBooking, setValidatedBooking] = useState<Reservation | null>(null);
  const [isBarrierOpen, setIsBarrierOpen] = useState(false);
  const [entrySuccessTicket, setEntrySuccessTicket] = useState<Reservation | null>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setError(null);
    setValidatedBooking(null);
    setEntrySuccessTicket(null);
    setIsBarrierOpen(false);
    setLoading(true);

    try {
      const data = await apiRequest('/entry/validate', {
        method: 'POST',
        body: JSON.stringify({ query: query.trim() })
      });
      setValidatedBooking(data.booking);
    } catch (err: any) {
      setError(err.message || 'Validation failed. No matching eligible booking found.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEntry = async () => {
    if (!validatedBooking) return;

    setError(null);
    setLoading(true);

    try {
      const data = await apiRequest('/entry/confirm', {
        method: 'POST',
        body: JSON.stringify({ booking_id: validatedBooking.booking_reference })
      });

      // Animate boom barrier opening!
      setIsBarrierOpen(true);
      setEntrySuccessTicket(data.entry_ticket);
    } catch (err: any) {
      setError(err.message || 'Failed to process vehicle entry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 2xl:px-14 py-8 space-y-8 min-h-[calc(100vh-5rem)]">
      
      {/* Title */}
      <div className="pb-4 border-b border-[#E8DDD2]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F97316]/10 text-[#F97316] text-xs font-bold uppercase tracking-wider mb-2">
          <ArrowRightCircle className="w-3.5 h-3.5" />
          <span>Automated Barrier Check-In Terminal</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-[#292522]">
          Vehicle <span className="text-[#F97316]">Entry Gate</span>
        </h1>
        <p className="text-sm text-[#3A332E]/70 mt-1">
          Validate your booking reference or license plate at the optical barrier terminal for automated boom barrier lifting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Barrier Scanner / Input Form */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="font-display font-bold text-xl text-[#292522]">
                Terminal Barrier Scanner
              </h2>
              <p className="text-xs text-[#3A332E]/70 mt-1">
                Enter your alphanumeric booking ID (e.g. PE-2026-NAG402) or vehicle license plate.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-[#C83B32]/10 border border-[#C83B32]/30 flex items-start gap-3 text-xs text-[#C83B32]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Entry Validation Error</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleValidate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1.5">
                  Scan / Type Booking Ref or Plate Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3A332E]/40">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={query}
                    onChange={(e) => setQuery(e.target.value.toUpperCase())}
                    placeholder="e.g. PE-2026-NAG402 or MH-31-BZ-7821"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8DDD2] bg-[#F4F0EB]/50 focus:bg-white focus:border-[#F97316] text-sm font-mono font-bold text-[#292522] outline-hidden uppercase tracking-wider"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#292522] hover:bg-[#3A332E] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Verifying Permit...' : 'Verify Entry Permit'}
                  <Search className="w-4 h-4 text-[#F97316]" />
                </button>
              </div>
            </form>

            {/* Validated Booking Card */}
            {validatedBooking && !entrySuccessTicket && (
              <div className="p-5 rounded-2xl bg-[#FFF7ED] border-2 border-[#F97316] space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD2]">
                  <span className="font-mono font-bold text-sm text-[#EA580C]">
                    {validatedBooking.booking_reference}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#27864B]/10 text-[#27864B] font-bold text-xs uppercase">
                    Eligible for Entry
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#3A332E]/60 uppercase">Driver</span>
                    <p className="font-bold text-[#292522] mt-0.5">{validatedBooking.driver_name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#3A332E]/60 uppercase">Vehicle Plate</span>
                    <p className="font-mono font-bold text-[#292522] mt-0.5">{validatedBooking.vehicle_plate}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#3A332E]/60 uppercase">Facility</span>
                    <p className="font-medium text-[#292522] mt-0.5 truncate">{validatedBooking.facility_name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#3A332E]/60 uppercase">Assigned Slot</span>
                    <p className="font-display font-black text-lg text-[#EA580C] mt-0.5">
                      {validatedBooking.slot_number} ({validatedBooking.slot_floor})
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleConfirmEntry}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm Vehicle Entry & Lift Boom Barrier
                </button>
              </div>
            )}

            {/* Entry Success Pass */}
            {entrySuccessTicket && (
              <div className="p-6 rounded-2xl bg-[#27864B]/10 border-2 border-[#27864B] space-y-4 animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 text-[#27864B]">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <h3 className="font-display font-extrabold text-lg text-[#292522]">
                    Boom Barrier Opened — Access Granted!
                  </h3>
                </div>

                <p className="text-xs text-[#3A332E]/80 leading-relaxed">
                  Your vehicle has been registered at Gate 01. The ultrasonic sensor at bay <span className="font-black text-[#EA580C]">{entrySuccessTicket.slot_number}</span> has switched to <span className="font-bold text-[#C83B32]">Occupied</span>.
                </p>

                <div className="p-4 rounded-xl bg-white border border-[#E8DDD2] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#3A332E]/70">Actual Entry Timestamp:</span>
                    <span className="font-mono font-bold text-[#292522]">
                      {new Date(entrySuccessTicket.actual_entry_time || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#3A332E]/70">Driveway Navigation:</span>
                    <span className="font-bold text-[#EA580C]">
                      Follow Lane A → {entrySuccessTicket.slot_floor} → Bay {entrySuccessTicket.slot_number}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Link
                    to="/dashboard"
                    className="flex-1 py-2.5 rounded-xl bg-[#292522] text-white text-xs font-bold text-center"
                  >
                    Return to Dashboard
                  </Link>
                  <Link
                    to="/bookings"
                    className="flex-1 py-2.5 rounded-xl border border-[#E8DDD2] bg-white text-xs font-bold text-center text-[#292522]"
                  >
                    View Active Pass
                  </Link>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Simulated Boom Barrier Display */}
        <div className="lg:col-span-6 space-y-6">
          <GateBarrierAnimation
            isOpen={isBarrierOpen}
            gateType="entry"
            facilityName={validatedBooking?.facility_name || 'VR Nagpur'}
          />

          <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#EA580C] font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Gate Terminal Simulation Logic</span>
            </div>
            <p className="text-[#3A332E]/80 leading-relaxed">
              When confirmed, the server marks the reservation as <code>checked_in</code>, records the exact arrival timestamp, toggles the IoT ultrasonic sensor to occupied (&lt;50 cm), and logs a permanent security event in the database.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
