import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  Printer, 
  Download, 
  CheckCircle2, 
  ArrowLeft,
  ShieldCheck,
  Hash
} from 'lucide-react';
import { Reservation } from '../types';
import { Link } from 'react-router-dom';

interface DigitalTicketProps {
  booking: Reservation;
  onClose?: () => void;
  showActions?: boolean;
}

export const DigitalTicket: React.FC<DigitalTicketProps> = ({ 
  booking, 
  onClose,
  showActions = true 
}) => {
  const handlePrint = () => {
    window.print();
  };

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 5) return phone;
    return phone.slice(0, 3) + '••••' + phone.slice(-4);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked_in': return 'bg-[#27864B] text-white';
      case 'completed': return 'bg-[#3A332E] text-white';
      case 'cancelled': return 'bg-[#C83B32] text-white';
      default: return 'bg-[#F97316] text-white';
    }
  };

  const qrString = booking.qr_data || JSON.stringify({
    ref: booking.booking_reference,
    plate: booking.vehicle_plate,
    slot: booking.slot_number,
    facility: booking.facility_name,
    valid_until: booking.expected_end_time
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Printable Pass Container */}
      <div className="printable-area bg-[#FFFDF9] rounded-3xl border-2 border-[#E8DDD2] shadow-xl overflow-hidden relative">
        
        {/* Pass Top Header Banner */}
        <div className="bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#C2410C] text-white px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Car className="w-7 h-7 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-2xl tracking-tight">ParkEase</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase">
                  Digital Pass
                </span>
              </div>
              <p className="text-xs text-white/90 font-medium">Smart Parking Management System</p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white text-[#C2410C] shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#27864B]" />
              {booking.status === 'checked_in' ? 'CHECKED IN' : 
               booking.status === 'completed' ? 'COMPLETED' : 
               booking.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}
            </div>
            <p className="text-[11px] text-white/80 mt-1">Official Digital Parking Permit</p>
          </div>
        </div>

        {/* Pass Body Content */}
        <div className="p-8 space-y-6">
          
          {/* Booking Ref Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFF7ED] border border-[#E8DDD2]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3A332E]/60">Booking Reference</span>
              <div className="flex items-center gap-2 mt-0.5">
                <Hash className="w-4 h-4 text-[#F97316]" />
                <span className="font-mono font-extrabold text-xl text-[#292522] tracking-wider">{booking.booking_reference}</span>
              </div>
            </div>
            <div className="sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3A332E]/60">Issuance Timestamp</span>
              <p className="text-xs font-semibold text-[#292522] mt-0.5">
                {new Date(booking.created_at || Date.now()).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Assigned Bay Highlight Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 p-5 rounded-2xl bg-[#F4F0EB] border border-[#E8DDD2] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#3A332E]/60">Assigned Parking Bay</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display font-black text-4xl text-[#EA580C]">{booking.slot_number || 'A01'}</span>
                  <span className="text-sm font-bold text-[#292522]">({booking.slot_floor || 'Floor 1'}, {booking.slot_zone || 'Zone A'})</span>
                </div>
                <p className="text-xs text-[#3A332E]/70 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                  {booking.facility_name || 'VR Nagpur — Rambagh Layout, Untkhana'}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF7ED] border border-[#E8DDD2] flex flex-col justify-center items-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3A332E]/60">Hourly Rate</span>
              <span className="font-display font-black text-3xl text-[#292522] mt-1">₹{booking.hourly_rate}</span>
              <span className="text-[11px] font-semibold text-[#EA580C]">per billable hour</span>
            </div>
          </div>

          {/* Passenger & Vehicle Details Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl border border-[#E8DDD2] bg-white">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3A332E]/60">Driver Name</span>
              <p className="font-bold text-sm text-[#292522] mt-0.5 truncate">{booking.driver_name || 'Driver'}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3A332E]/60">Contact Phone</span>
              <p className="font-mono text-sm text-[#292522] mt-0.5">{maskPhone(booking.driver_phone)}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3A332E]/60">Vehicle Plate</span>
              <p className="font-mono font-extrabold text-sm text-[#EA580C] mt-0.5">{booking.vehicle_plate}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3A332E]/60">Category</span>
              <p className="font-bold text-sm text-[#292522] mt-0.5 capitalize">{booking.vehicle_category}</p>
            </div>
          </div>

          {/* Schedule & Duration Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#E8DDD2] flex items-center justify-center text-[#F97316]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3A332E]/60">Scheduled Entry</span>
                <p className="font-semibold text-sm text-[#292522]">
                  {new Date(booking.start_time).toLocaleDateString()} at {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {booking.actual_entry_time && (
                  <p className="text-[11px] text-[#27864B] font-bold mt-0.5">
                    Actual Entry: {new Date(booking.actual_entry_time).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#E8DDD2] flex items-center justify-center text-[#EA580C]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3A332E]/60">Expected Exit</span>
                <p className="font-semibold text-sm text-[#292522]">
                  {new Date(booking.expected_end_time).toLocaleDateString()} at {new Date(booking.expected_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {booking.actual_exit_time && (
                  <p className="text-[11px] text-[#3A332E] font-bold mt-0.5">
                    Actual Exit: {new Date(booking.actual_exit_time).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Perforated Divider */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="border-t-2 border-dashed border-[#E8DDD2] w-full"></div>
            <div className="absolute -left-12 w-6 h-6 rounded-full bg-[#FFFDF9] border-r-2 border-[#E8DDD2]"></div>
            <div className="absolute -right-12 w-6 h-6 rounded-full bg-[#FFFDF9] border-l-2 border-[#E8DDD2]"></div>
          </div>

          {/* QR Code Validation Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#27864B] font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Cryptographically Encoded Digital Gate Token</span>
              </div>
              <p className="text-xs text-[#3A332E]/70 max-w-sm">
                Scan this QR code at the automated entrance barrier scanner. The boom barrier will automatically detect your reservation and open.
              </p>
              <div className="pt-1">
                <span className="text-[11px] font-mono text-[#3A332E]/60 bg-[#F4F0EB] px-2 py-0.5 rounded">
                  Ref: {booking.booking_reference}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border-2 border-[#E8DDD2] shadow-sm flex flex-col items-center">
              <QRCodeSVG 
                value={qrString}
                size={112}
                level="M"
                fgColor="#292522"
                bgColor="#FFFFFF"
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A332E]/50 mt-1.5">
                Scan At Barrier
              </span>
            </div>
          </div>

          {/* Price Estimate / Settled Amount Notice */}
          <div className="p-3.5 rounded-xl bg-[#FFF7ED] border border-[#E8DDD2] flex items-center justify-between text-xs">
            <span className="text-[#3A332E]/80">
              {booking.final_amount ? 'Final Settled Fee:' : 'Estimated Reservation Total (Advance Estimate):'}
            </span>
            <span className="font-display font-extrabold text-base text-[#C2410C]">
              ₹{booking.final_amount || booking.estimated_amount}
            </span>
          </div>

        </div>

        {/* Action Buttons (Excluded from print) */}
        {showActions && (
          <div className="no-print bg-[#F4F0EB] px-8 py-5 border-t border-[#E8DDD2] flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#292522] hover:bg-[#3A332E] text-white font-semibold text-xs tracking-wide transition-colors"
            >
              <Printer className="w-4 h-4 text-[#F97316]" />
              Print / Save PDF
            </button>

            <div className="flex items-center gap-2">
              <Link
                to="/vehicle-entry"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-semibold text-xs tracking-wide shadow-sm"
              >
                Proceed to Entry Gate
              </Link>
              {onClose ? (
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[#E8DDD2] bg-white hover:bg-[#FFF7ED] text-[#292522] font-semibold text-xs transition-colors"
                >
                  Close
                </button>
              ) : (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E8DDD2] bg-white hover:bg-[#FFF7ED] text-[#292522] font-semibold text-xs transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
