import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api';
import { Reservation } from '../../types';
import { DigitalTicket } from '../../components/DigitalTicket';
import { 
  Ticket, 
  Search, 
  Eye, 
  XCircle, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Car,
  MapPin
} from 'lucide-react';

export const AdminReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Reservation | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Reservation | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (statusFilter !== 'all') query.append('status', statusFilter);
      if (search.trim()) query.append('search', search.trim());

      const data = await apiRequest(`/admin/reservations?${query.toString()}`);
      setReservations(data.reservations || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReservations();
  };

  const handleCancelReservation = async () => {
    if (!cancelModalBooking) return;
    try {
      await apiRequest(`/bookings/${cancelModalBooking.id}/cancel`, { method: 'POST' });
      setMessage(`Reservation ${cancelModalBooking.booking_reference} cancelled by admin.`);
      setCancelModalBooking(null);
      await fetchReservations();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 2xl:px-14 py-8 space-y-8 min-h-[calc(100vh-5rem)]">
      
      {/* Title */}
      <div className="pb-4 border-b border-[#E8DDD2]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
          Administrative Control Directory
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-[#292522] mt-1">
          Global <span className="text-[#F97316]">Reservations</span>
        </h1>
        <p className="text-xs text-[#3A332E]/70 mt-1">
          Complete database view of all driver bookings, active gate check-ins, and completed exit receipts.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-[#27864B]/10 border border-[#27864B]/30 flex items-center gap-3 text-xs text-[#27864B] font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-[#C83B32]/10 border border-[#C83B32]/30 flex items-center gap-3 text-xs text-[#C83B32] font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2]">
        
        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'reserved', 'checked_in', 'completed', 'cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#292522] text-[#F97316]'
                  : 'bg-[#F4F0EB] text-[#3A332E] hover:bg-[#FFF7ED]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3A332E]/40">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ref, driver, plate..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB]/50 text-xs text-[#292522] outline-hidden focus:border-[#F97316]"
          />
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-20 text-center rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2]">
          <div className="w-8 h-8 rounded-full border-2 border-[#F97316] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-[#3A332E]">Querying reservations registry...</p>
        </div>
      ) : reservations.length > 0 ? (
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F0EB] text-[#3A332E]/80 font-bold uppercase tracking-wider text-[10px] border-b border-[#E8DDD2]">
                <tr>
                  <th className="px-5 py-3.5">Ref / Status</th>
                  <th className="px-5 py-3.5">Driver Name</th>
                  <th className="px-5 py-3.5">Vehicle Plate</th>
                  <th className="px-5 py-3.5">Facility / Bay</th>
                  <th className="px-5 py-3.5">Time Interval</th>
                  <th className="px-5 py-3.5">Est / Paid</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DDD2]">
                {reservations.map(r => (
                  <tr key={r.id} className="hover:bg-[#FFF7ED]/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-[#EA580C] block">{r.booking_reference}</span>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        r.status === 'checked_in' ? 'bg-[#27864B]/10 text-[#27864B]' :
                        r.status === 'completed' ? 'bg-[#292522]/10 text-[#292522]' :
                        r.status === 'cancelled' ? 'bg-[#C83B32]/10 text-[#C83B32]' :
                        'bg-[#F97316]/10 text-[#F97316]'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-[#292522] block">{r.driver_name}</span>
                      <span className="text-[10px] text-[#3A332E]/60">{r.user_email}</span>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-[#292522]">
                      {r.vehicle_plate}
                      <span className="block text-[10px] font-sans font-normal text-[#3A332E]/60 capitalize">{r.vehicle_category}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-[#292522] block">{r.facility_name}</span>
                      <span className="text-[11px] text-[#EA580C] font-extrabold">Bay {r.slot_number} ({r.floor})</span>
                    </td>
                    <td className="px-5 py-4 text-[#3A332E]/80">
                      <div>{new Date(r.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → {new Date(r.expected_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-[10px] text-[#3A332E]/60">{new Date(r.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                    </td>
                    <td className="px-5 py-4 font-display font-extrabold text-sm text-[#C2410C]">
                      ₹{r.final_amount || r.estimated_amount}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedTicket(r)}
                        className="px-2.5 py-1 rounded-lg bg-[#292522] text-white text-[11px] font-bold hover:bg-[#3A332E]"
                      >
                        Pass
                      </button>
                      {r.status === 'reserved' && (
                        <button
                          onClick={() => setCancelModalBooking(r)}
                          className="px-2.5 py-1 rounded-lg bg-[#C83B32]/10 text-[#C83B32] hover:bg-[#C83B32]/20 text-[11px] font-bold"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-3">
          <Ticket className="w-10 h-10 text-[#3A332E]/30 mx-auto" />
          <p className="font-bold text-sm text-[#292522]">No Reservations Found</p>
          <p className="text-xs text-[#3A332E]/60">No bookings match the current filter or search query.</p>
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-[#292522]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full my-8">
            <DigitalTicket
              booking={selectedTicket}
              onClose={() => setSelectedTicket(null)}
            />
          </div>
        </div>
      )}

      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 bg-[#292522]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-[#C83B32]">
              <XCircle className="w-6 h-6" />
              <h3 className="font-display font-bold text-lg text-[#292522]">Administrative Cancellation</h3>
            </div>
            <p className="text-xs text-[#3A332E]/80 leading-relaxed">
              Force cancel reservation <span className="font-mono font-bold text-[#292522]">{cancelModalBooking.booking_reference}</span>? The bay will be immediately released.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E8DDD2] text-xs font-bold text-[#3A332E] hover:bg-[#F4F0EB]"
              >
                Dismiss
              </button>
              <button
                onClick={handleCancelReservation}
                className="flex-1 py-2.5 rounded-xl bg-[#C83B32] text-white text-xs font-bold hover:bg-[#a52c24]"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
