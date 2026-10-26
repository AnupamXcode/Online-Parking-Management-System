import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api';
import { Reservation, ParkingFacility } from '../types';
import { DigitalTicket } from '../components/DigitalTicket';
import { 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  Ticket, 
  ArrowRight, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle,
  Plus,
  ArrowRightCircle,
  ArrowLeftCircle,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [facilities, setFacilities] = useState<ParkingFacility[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketModalBooking, setTicketModalBooking] = useState<Reservation | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [bookingsData, facilitiesData, paymentsData] = await Promise.all([
          apiRequest('/bookings'),
          apiRequest('/facilities'),
          apiRequest('/payments')
        ]);
        setBookings(bookingsData.bookings || []);
        setFacilities(facilitiesData.facilities || []);
        setPayments(paymentsData.payments || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Compute live metrics
  const activeBookings = bookings.filter(b => b.status === 'reserved' || b.status === 'checked_in');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalSpent = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  
  // Available slots count from connected facilities
  const totalAvailableSlots = facilities.reduce((sum, f) => sum + (f.available_slots || 0), 0);

  // Next upcoming booking
  const upcomingBooking = bookings.find(b => b.status === 'reserved' || b.status === 'checked_in');

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 2xl:px-14 py-8 space-y-8 min-h-[calc(100vh-5rem)]">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8DDD2]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
            Driver Operations Center • {currentDateFormatted}
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#292522] mt-1">
            Welcome back, <span className="text-[#F97316]">{user?.name}</span>
          </h1>
          <p className="text-xs text-[#3A332E]/70 mt-1">
            Registered vehicle: {user?.phone} • Live intelligent bay status synchronized
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/find-parking"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-bold text-sm shadow-md shadow-[#F97316]/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Book Parking Slot
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Available slots */}
        <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#27864B]">
            <span className="text-[11px] font-bold uppercase tracking-wider">System Availability</span>
            <Layers className="w-5 h-5" />
          </div>
          <div className="font-display font-black text-3xl text-[#292522]">
            {totalAvailableSlots} <span className="text-xs font-semibold text-[#3A332E]/60">Bays Open</span>
          </div>
          <p className="text-[11px] text-[#3A332E]/70">Across {facilities.length} active smart facilities</p>
        </div>

        {/* Active Bookings */}
        <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#F97316]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Bookings</span>
            <Ticket className="w-5 h-5" />
          </div>
          <div className="font-display font-black text-3xl text-[#292522]">
            {activeBookings.length}
          </div>
          <p className="text-[11px] text-[#3A332E]/70">
            {activeBookings.some(b => b.status === 'checked_in') ? 'Vehicle currently checked in' : 'Upcoming reservations'}
          </p>
        </div>

        {/* Completed Visits */}
        <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#EA580C]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed Sessions</span>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="font-display font-black text-3xl text-[#292522]">
            {completedBookings.length}
          </div>
          <p className="text-[11px] text-[#3A332E]/70">With confirmed exit receipts</p>
        </div>

        {/* Amount Spent */}
        <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#292522]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Settled</span>
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="font-display font-black text-3xl text-[#C2410C]">
            ₹{Math.round(totalSpent)}
          </div>
          <p className="text-[11px] text-[#3A332E]/70">Demo transactions simulated</p>
        </div>

      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/vehicle-entry"
          className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#E8DDD2] hover:border-[#F97316] flex items-center justify-between group transition-colors shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F97316] text-white flex items-center justify-center font-bold">
              <ArrowRightCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#292522]">Gate Entry Terminal</p>
              <p className="text-xs text-[#3A332E]/70">Check in & open boom barrier</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#F97316] group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/vehicle-exit"
          className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#E8DDD2] hover:border-[#EA580C] flex items-center justify-between group transition-colors shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EA580C] text-white flex items-center justify-center font-bold">
              <ArrowLeftCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#292522]">Gate Exit Terminal</p>
              <p className="text-xs text-[#3A332E]/70">Duration fee quote & payment</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#EA580C] group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/vehicles"
          className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#E8DDD2] hover:border-[#292522] flex items-center justify-between group transition-colors shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#292522] text-[#F97316] flex items-center justify-center font-bold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#292522]">Manage Vehicles</p>
              <p className="text-xs text-[#3A332E]/70">Register & edit permits</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#292522] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Main Grid: Active/Upcoming Pass Highlight & Facilities status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Upcoming Pass Highlight */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-[#292522]">
              Current Active Pass
            </h2>
            <Link to="/bookings" className="text-xs font-bold text-[#EA580C] hover:underline">
              View All ({bookings.length})
            </Link>
          </div>

          {upcomingBooking ? (
            <div className="rounded-3xl border-2 border-[#E8DDD2] bg-gradient-to-br from-[#FFFDF9] to-[#FFF7ED] p-6 shadow-sm space-y-5">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#E8DDD2]">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#F97316] animate-pulse" />
                  <span className="font-mono font-bold text-sm text-[#292522]">
                    {upcomingBooking.booking_reference}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  upcomingBooking.status === 'checked_in' ? 'bg-[#27864B] text-white' : 'bg-[#F97316] text-white'
                }`}>
                  {upcomingBooking.status === 'checked_in' ? 'VEHICLE PARKED' : 'CONFIRMED RESERVATION'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#3A332E]/60 tracking-wider">Facility</span>
                  <p className="font-bold text-sm text-[#292522] mt-0.5 truncate">{upcomingBooking.facility_name}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#3A332E]/60 tracking-wider">Assigned Bay</span>
                  <p className="font-display font-black text-xl text-[#EA580C] mt-0.5">
                    {upcomingBooking.slot_number} <span className="text-xs text-[#292522] font-semibold">({upcomingBooking.slot_floor})</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#3A332E]/60 tracking-wider">Vehicle</span>
                  <p className="font-mono font-bold text-sm text-[#292522] mt-0.5">{upcomingBooking.vehicle_plate}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#3A332E]/60 tracking-wider">Rate</span>
                  <p className="font-bold text-sm text-[#292522] mt-0.5">₹{upcomingBooking.hourly_rate}/hr</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DDD2] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#3A332E]">
                  <Clock className="w-4 h-4 text-[#F97316]" />
                  <span>Entry Window: {new Date(upcomingBooking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(upcomingBooking.expected_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <span className="font-semibold text-[#EA580C]">
                  Est. ₹{upcomingBooking.estimated_amount}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setTicketModalBooking(upcomingBooking)}
                  className="flex-1 py-2.5 rounded-xl bg-[#292522] hover:bg-[#3A332E] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Ticket className="w-4 h-4 text-[#F97316]" />
                  View & Print Digital Pass
                </button>

                {upcomingBooking.status === 'reserved' && (
                  <Link
                    to="/vehicle-entry"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                  >
                    Check In At Gate <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                {upcomingBooking.status === 'checked_in' && (
                  <Link
                    to="/vehicle-exit"
                    className="flex-1 py-2.5 rounded-xl bg-[#27864B] hover:bg-[#1e6a3a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                  >
                    Proceed to Exit <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

            </div>
          ) : (
            <div className="p-10 rounded-3xl border-2 border-dashed border-[#E8DDD2] bg-[#FFF7ED]/40 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center mx-auto">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-base text-[#292522]">No Active Parking Passes</p>
                <p className="text-xs text-[#3A332E]/70 mt-1 max-w-sm mx-auto">
                  Reserve a parking bay in advance at any of our intelligent hubs to guarantee your space.
                </p>
              </div>
              <Link
                to="/find-parking"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-bold shadow-sm"
              >
                Find & Reserve a Bay <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Recent Parking History Table */}
          <div className="space-y-4 pt-4">
            <h3 className="font-display font-bold text-lg text-[#292522]">Recent Parking Events</h3>
            {bookings.length > 0 ? (
              <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DDD2] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4F0EB] text-[#3A332E]/80 font-bold uppercase tracking-wider text-[10px] border-b border-[#E8DDD2]">
                      <tr>
                        <th className="px-4 py-3">Reference</th>
                        <th className="px-4 py-3">Facility</th>
                        <th className="px-4 py-3">Slot</th>
                        <th className="px-4 py-3">Plate</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Pass</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DDD2]">
                      {bookings.slice(0, 5).map(b => (
                        <tr key={b.id} className="hover:bg-[#FFF7ED]/50 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-[#EA580C]">{b.booking_reference}</td>
                          <td className="px-4 py-3 font-medium text-[#292522] truncate max-w-[120px]">{b.facility_name}</td>
                          <td className="px-4 py-3 font-bold text-[#292522]">{b.slot_number}</td>
                          <td className="px-4 py-3 font-mono text-[#3A332E]">{b.vehicle_plate}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              b.status === 'checked_in' ? 'bg-[#27864B]/10 text-[#27864B]' :
                              b.status === 'completed' ? 'bg-[#292522]/10 text-[#292522]' :
                              b.status === 'cancelled' ? 'bg-[#C83B32]/10 text-[#C83B32]' :
                              'bg-[#F97316]/10 text-[#F97316]'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setTicketModalBooking(b)}
                              className="text-xs font-bold text-[#F97316] hover:underline"
                            >
                              Ticket
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#3A332E]/60 italic">No previous parking sessions recorded.</p>
            )}
          </div>
        </div>

        {/* Right Column: Facility Availability Showcase */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-[#292522]">
              Live Facility Capacity
            </h2>
            <span className="text-[11px] text-[#27864B] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#27864B] animate-pulse" />
              Live Sensor Sync
            </span>
          </div>

          <div className="space-y-4">
            {facilities.map(fac => {
              const available = fac.available_slots || 0;
              const total = fac.total_slots || 1;
              const occupancyPct = Math.round(((total - available) / total) * 100);

              return (
                <div
                  key={fac.id}
                  className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-3 shadow-xs hover:border-[#F97316] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-display font-bold text-base text-[#292522]">{fac.name}</h4>
                      <p className="text-xs text-[#3A332E]/70 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                        {fac.address}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-[#FFF7ED] border border-[#E8DDD2] text-xs font-extrabold text-[#EA580C]">
                      ₹{fac.hourly_rate}/hr
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#3A332E]">
                        {available} of {total} slots available
                      </span>
                      <span className="font-mono font-bold text-[#EA580C]">{occupancyPct}% Occupied</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#F4F0EB] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#F97316] to-[#C2410C] transition-all duration-500"
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <Link
                      to="/find-parking"
                      className="text-xs font-bold text-[#EA580C] hover:text-[#C2410C] flex items-center gap-1"
                    >
                      Allocate Bay at this Facility <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prototype System Info Box */}
          <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#E8DDD2] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#EA580C] font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Smart Sensor Telemetry Notice</span>
            </div>
            <p className="text-[#3A332E]/80 leading-relaxed">
              Real-time ultrasonic ground sensors update each bay automatically. Vehicles checked in through the gate terminal trigger sensor occupancy and update live metrics across the entire platform.
            </p>
          </div>

        </div>

      </div>

      {/* Ticket Modal */}
      {ticketModalBooking && (
        <div className="fixed inset-0 z-50 bg-[#292522]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full my-8">
            <DigitalTicket
              booking={ticketModalBooking}
              onClose={() => setTicketModalBooking(null)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
