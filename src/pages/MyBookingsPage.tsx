import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { Reservation } from '../types';
import { DigitalTicket } from '../components/DigitalTicket';
import { 
  Ticket, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  XCircle, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Filter,
  Search,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTicketBooking, setSelectedTicketBooking] = useState<Reservation | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Reservation | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/bookings');
      setBookings(data.bookings || []);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setActionMessage(null);
    setActionError(null);

    try {
      await apiRequest(`/bookings/${cancelModalBooking.id}/cancel`, {
        method: 'POST'
      });
      setActionMessage(`Reservation ${cancelModalBooking.booking_reference} successfully cancelled. Bay has been released.`);
      setCancelModalBooking(null);
      await fetchBookings();
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel booking.');
    }
  };

  // Filter bookings based on active status filter & search
  const filteredBookings = bookings.filter(b => {
    if (activeFilter !== 'all') {
      if (activeFilter === 'upcoming') {
        const isFuture = new Date(b.start_time).getTime() >= Date.now();
        if (b.status !== 'reserved' || !isFuture) return false;
      } else if (b.status !== activeFilter) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.booking_reference.toLowerCase().includes(q) ||
        b.vehicle_plate.toLowerCase().includes(q) ||
        (b.facility_name && b.facility_name.toLowerCase().includes(q)) ||
        (b.slot_number && b.slot_number.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checked_in':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#27864B]/10 text-[#27864B]">Parked / Checked In</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#3A332E]/10 text-[#3A332E]">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#C83B32]/10 text-[#C83B32]">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#F97316]/10 text-[#F97316]">Reserved</span>;
    }
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 2xl:px-14 py-8 space-y-8 min-h-[calc(100vh-5rem)]">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD2]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
            Driver Records Directory
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#292522] mt-1">
            My Parking <span className="text-[#F97316]">Bookings</span>
          </h1>
          <p className="text-xs text-[#3A332E]/70 mt-1">
            Manage your digital parking passes, monitor check-in status, and access payment receipts in Nagpur.
          </p>
        </div>

        <Link
          to="/find-parking"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold text-xs shadow-md shadow-[#F97316]/20"
        >
          New Reservation <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-[#27864B]/10 border border-[#27864B]/30 flex items-center gap-3 text-xs text-[#27864B] font-semibold">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-[#C83B32]/10 border border-[#C83B32]/30 flex items-center gap-3 text-xs text-[#C83B32] font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2]">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'reserved', label: 'Reserved' },
            { id: 'checked_in', label: 'Checked In' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                activeFilter === f.id
                  ? 'bg-[#292522] text-[#F97316]'
                  : 'bg-[#F4F0EB] text-[#3A332E] hover:bg-[#FFF7ED]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3A332E]/40">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference, plate, slot..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB]/50 text-xs font-medium text-[#292522] outline-hidden focus:border-[#F97316]"
          />
        </div>
      </div>

      {/* Bookings Card List / Table */}
      {loading ? (
        <div className="p-20 text-center rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2]">
          <div className="w-8 h-8 rounded-full border-2 border-[#F97316] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-[#3A332E]">Loading booking records...</p>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBookings.map(b => (
            <div
              key={b.id}
              className="rounded-3xl border border-[#E8DDD2] bg-[#FFFDF9] p-6 shadow-xs hover:border-[#F97316] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                
                {/* Card Top: Ref & Status */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD2]">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-[#F97316]" />
                    <span className="font-mono font-bold text-sm text-[#292522]">
                      {b.booking_reference}
                    </span>
                  </div>
                  {getStatusBadge(b.status)}
                </div>

                {/* Facility & Assigned Slot Highlight */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-[#292522]">{b.facility_name}</h3>
                    <p className="text-xs text-[#3A332E]/70 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                      {b.facility_address || 'Nagpur, Maharashtra'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#3A332E]/60 block">Assigned Bay</span>
                    <span className="font-display font-black text-2xl text-[#EA580C]">
                      {b.slot_number}
                    </span>
                  </div>
                </div>

                {/* Vehicle & Time Grid */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#F4F0EB] text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#3A332E]/60 uppercase">Vehicle Plate</span>
                    <p className="font-mono font-bold text-[#292522] mt-0.5">{b.vehicle_plate}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#3A332E]/60 uppercase">Category</span>
                    <p className="font-semibold text-[#292522] capitalize mt-0.5">{b.vehicle_category}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#3A332E]/60 uppercase">Scheduled Entry</span>
                    <p className="font-medium text-[#292522] mt-0.5">
                      {new Date(b.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#3A332E]/60 uppercase">Expected Exit</span>
                    <p className="font-medium text-[#292522] mt-0.5">
                      {new Date(b.expected_end_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(b.expected_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Amount preview */}
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-[#3A332E]/70">
                    {b.final_amount ? 'Settled Final Charge:' : 'Advance Rate Estimate:'}
                  </span>
                  <span className="font-display font-extrabold text-base text-[#C2410C]">
                    ₹{b.final_amount || b.estimated_amount}
                  </span>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E8DDD2] flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedTicketBooking(b)}
                  className="flex-1 py-2 rounded-xl bg-[#292522] hover:bg-[#3A332E] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-[#F97316]" />
                  Digital Ticket
                </button>

                {b.status === 'reserved' && (
                  <button
                    onClick={() => setCancelModalBooking(b)}
                    className="py-2 px-3 rounded-xl border border-[#C83B32]/30 text-[#C83B32] hover:bg-[#C83B32]/10 text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                )}

                {b.status === 'checked_in' && (
                  <Link
                    to="/vehicle-exit"
                    className="py-2 px-4 rounded-xl bg-[#27864B] text-white text-xs font-bold hover:bg-[#1e6a3a] transition-colors"
                  >
                    Exit Bay
                  </Link>
                )}
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-[#FFFDF9] border-2 border-dashed border-[#E8DDD2] space-y-4">
          <Ticket className="w-10 h-10 text-[#3A332E]/40 mx-auto" />
          <div>
            <h3 className="font-display font-bold text-lg text-[#292522]">No Bookings Found</h3>
            <p className="text-xs text-[#3A332E]/70 max-w-sm mx-auto mt-1">
              There are no reservations matching your filter. Advance bookings ensure seamless entry upon arrival.
            </p>
          </div>
          <Link
            to="/find-parking"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-bold shadow-sm"
          >
            Book a Parking Bay
          </Link>
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicketBooking && (
        <div className="fixed inset-0 z-50 bg-[#292522]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full my-8">
            <DigitalTicket
              booking={selectedTicketBooking}
              onClose={() => setSelectedTicketBooking(null)}
            />
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 bg-[#292522]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-[#C83B32]">
              <XCircle className="w-6 h-6" />
              <h3 className="font-display font-bold text-lg text-[#292522]">Cancel Reservation?</h3>
            </div>
            <p className="text-xs text-[#3A332E]/80 leading-relaxed">
              Are you sure you want to cancel booking <span className="font-mono font-bold text-[#292522]">{cancelModalBooking.booking_reference}</span>? The allocated slot {cancelModalBooking.slot_number} will immediately become available for other drivers.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E8DDD2] text-xs font-bold text-[#3A332E] hover:bg-[#F4F0EB]"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 py-2.5 rounded-xl bg-[#C83B32] text-white text-xs font-bold hover:bg-[#a52c24]"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
