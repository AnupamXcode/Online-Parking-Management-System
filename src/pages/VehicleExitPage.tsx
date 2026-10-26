import React, { useState } from 'react';
import { apiRequest } from '../api';
import { GateBarrierAnimation } from '../components/GateBarrierAnimation';
import { ReceiptModal } from '../components/ReceiptModal';
import { Reservation } from '../types';
import confetti from 'canvas-confetti';
import { 
  ArrowLeftCircle, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Car, 
  MapPin, 
  Clock, 
  Sparkles, 
  CreditCard, 
  QrCode, 
  Wallet,
  ShieldCheck,
  Printer
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const VehicleExitPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [booking, setBooking] = useState<Reservation | null>(null);
  const [quote, setQuote] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Wallet'>('UPI');

  const [isBarrierOpen, setIsBarrierOpen] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<any | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const handleSearchQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setError(null);
    setBooking(null);
    setQuote(null);
    setCompletedReceipt(null);
    setIsBarrierOpen(false);
    setLoading(true);

    try {
      const data = await apiRequest('/exit/quote', {
        method: 'POST',
        body: JSON.stringify({ query: query.trim() })
      });
      setBooking(data.booking);
      setQuote(data.quote);
    } catch (err: any) {
      setError(err.message || 'No active checked-in vehicle found matching this identifier.');
    } finally {
      setLoading(false);
    }
  };

  const handleSettleAndExit = async () => {
    if (!booking) return;

    setError(null);
    setLoading(true);

    try {
      const data = await apiRequest('/exit/confirm', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: booking.booking_reference,
          payment_method: paymentMethod
        })
      });

      // Lift exit boom barrier!
      setIsBarrierOpen(true);
      setCompletedReceipt(data.receipt);
      setShowReceiptModal(true);

      // Victory celebration
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#27864B', '#F97316', '#EA580C', '#292522']
      });
    } catch (err: any) {
      setError(err.message || 'Payment settlement failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 2xl:px-14 py-8 space-y-8 min-h-[calc(100vh-5rem)]">
      
      {/* Title */}
      <div className="pb-4 border-b border-[#E8DDD2]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EA580C]/10 text-[#EA580C] text-xs font-bold uppercase tracking-wider mb-2">
          <ArrowLeftCircle className="w-3.5 h-3.5" />
          <span>Automated Departure & Payment Clearance</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-[#292522]">
          Vehicle <span className="text-[#EA580C]">Exit Gate & Checkout</span>
        </h1>
        <p className="text-sm text-[#3A332E]/70 mt-1">
          Calculate exact duration down to the minute, review the transparent billing formula, settle payment, and open the exit barrier.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Exit Lookup & Payment Selection */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="font-display font-bold text-xl text-[#292522]">
                Exit Bay Checkout Terminal
              </h2>
              <p className="text-xs text-[#3A332E]/70 mt-1">
                Lookup your checked-in vehicle by booking reference ID or license plate.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-[#C83B32]/10 border border-[#C83B32]/30 flex items-start gap-3 text-xs text-[#C83B32]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Exit Clearance Notice</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSearchQuote} className="space-y-4">
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
                    placeholder="e.g. PE-2026-NAG401 or MH-31-EQ-4092"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#E8DDD2] bg-[#F4F0EB]/50 focus:bg-white focus:border-[#EA580C] text-sm font-mono font-bold text-[#292522] outline-hidden uppercase tracking-wider"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#292522] hover:bg-[#3A332E] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Calculating Duration...' : 'Fetch Exit Bill & Duration'}
                <Search className="w-4 h-4 text-[#F97316]" />
              </button>
            </form>

            {/* Quote and Fee Calculation Box */}
            {quote && booking && (
              <div className="p-6 rounded-2xl bg-[#FFF7ED] border-2 border-[#EA580C] space-y-5 animate-in fade-in duration-300">
                
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD2]">
                  <div>
                    <span className="font-mono font-bold text-sm text-[#292522]">{booking.booking_reference}</span>
                    <p className="text-xs text-[#3A332E]/70">{booking.vehicle_plate} • Slot {booking.slot_number}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#27864B] text-white text-[11px] font-bold uppercase tracking-wider">
                    Checked In Active
                  </span>
                </div>

                {/* Duration & Billing Breakdown */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#E8DDD2]/60">
                    <span className="text-[#3A332E]/70">Actual Entry Timestamp:</span>
                    <span className="font-mono font-bold text-[#292522]">
                      {new Date(quote.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E8DDD2]/60">
                    <span className="text-[#3A332E]/70">Current Exit Timestamp:</span>
                    <span className="font-mono font-bold text-[#292522]">
                      {new Date(quote.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E8DDD2]/60">
                    <span className="text-[#3A332E]/70">Elapsed Duration:</span>
                    <span className="font-bold text-[#292522]">{quote.durationFormatted}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E8DDD2]/60">
                    <span className="text-[#3A332E]/70">Billable Hours (Next Hour Round-Up):</span>
                    <span className="font-bold text-[#EA580C]">{quote.billableHours} hour(s)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E8DDD2]/60">
                    <span className="text-[#3A332E]/70">Base Parking Charge ({quote.billableHours} hr @ ₹{quote.hourlyRate}/hr):</span>
                    <span className="font-semibold text-[#292522]">₹{quote.baseAmount}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E8DDD2]/60">
                    <span className="text-[#3A332E]/70">18% Standard GST / Municipal Tax:</span>
                    <span className="font-semibold text-[#292522]">₹{quote.taxAmount}</span>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-sm font-bold text-[#292522]">
                    <span>Final Exit Total:</span>
                    <span className="font-display font-black text-2xl text-[#C2410C]">
                      ₹{quote.finalAmount}
                    </span>
                  </div>
                </div>

                {/* Demo Payment Method Selector */}
                <div className="space-y-3 pt-2 border-t border-[#E8DDD2]">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E]">
                    Select Demo Payment Method
                  </label>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'UPI'
                          ? 'border-[#EA580C] bg-white text-[#EA580C] ring-2 ring-[#EA580C]/20 shadow-2xs'
                          : 'border-[#E8DDD2] bg-[#F4F0EB]/60 text-[#3A332E] hover:bg-white'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-[#EA580C]" />
                      <span>Instant UPI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Card')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'Card'
                          ? 'border-[#EA580C] bg-white text-[#EA580C] ring-2 ring-[#EA580C]/20 shadow-2xs'
                          : 'border-[#E8DDD2] bg-[#F4F0EB]/60 text-[#3A332E] hover:bg-white'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-[#EA580C]" />
                      <span>Debit/Credit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Wallet')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'Wallet'
                          ? 'border-[#EA580C] bg-white text-[#EA580C] ring-2 ring-[#EA580C]/20 shadow-2xs'
                          : 'border-[#E8DDD2] bg-[#F4F0EB]/60 text-[#3A332E] hover:bg-white'
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-[#EA580C]" />
                      <span>FastPay Wallet</span>
                    </button>
                  </div>
                </div>

                {/* Settle Action Button */}
                <button
                  onClick={handleSettleAndExit}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Settle ₹{quote.finalAmount} via {paymentMethod} & Open Exit Barrier
                </button>

              </div>
            )}

            {/* Completed Exit Success Screen */}
            {completedReceipt && (
              <div className="p-6 rounded-2xl bg-[#27864B]/10 border-2 border-[#27864B] space-y-4 animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 text-[#27864B]">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <h3 className="font-display font-extrabold text-lg text-[#292522]">
                    Exit Settled — Barrier Opened!
                  </h3>
                </div>

                <p className="text-xs text-[#3A332E]/80 leading-relaxed">
                  Payment of <span className="font-bold text-[#27864B]">₹{completedReceipt.total_paid}</span> via {completedReceipt.method} has been verified. The ultrasonic bay sensor has cleared and slot {completedReceipt.slot_number} is now <span className="font-bold text-[#27864B]">Available</span> for next drivers.
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setShowReceiptModal(true)}
                    className="flex-1 py-2.5 rounded-xl bg-[#292522] text-white text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-4 h-4 text-[#F97316]" /> View / Print Receipt
                  </button>
                  <Link
                    to="/dashboard"
                    className="flex-1 py-2.5 rounded-xl border border-[#E8DDD2] bg-white text-xs font-bold text-center text-[#292522]"
                  >
                    Dashboard
                  </Link>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Simulated Exit Boom Barrier */}
        <div className="lg:col-span-6 space-y-6">
          <GateBarrierAnimation
            isOpen={isBarrierOpen}
            gateType="exit"
            facilityName={booking?.facility_name || 'VR Nagpur'}
          />

          {/* Pricing Policy Box */}
          <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#EA580C] font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Transparent Pricing Policy</span>
            </div>
            <p className="text-[#3A332E]/80 leading-relaxed">
              Exit charges are computed from actual recorded entry to actual departure. Any started hour is rounded up to the next billable hour, ensuring fair utility calculation for facility management.
            </p>
          </div>
        </div>

      </div>

      {/* Official Receipt Modal */}
      {showReceiptModal && completedReceipt && (
        <ReceiptModal
          receipt={completedReceipt}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

    </div>
  );
};
