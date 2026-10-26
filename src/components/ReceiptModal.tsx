import React from 'react';
import { CheckCircle2, Printer, X, Download, ShieldCheck, Car } from 'lucide-react';

interface ReceiptModalProps {
  receipt: any;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#292522]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="bg-[#FFF7ED] px-6 py-4 border-b border-[#E8DDD2] flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#27864B]" />
            <span className="font-bold text-xs uppercase tracking-wider text-[#292522]">
              Official Parking Settlement Receipt
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#3A332E] hover:bg-[#E8DDD2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="printable-area p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center pb-4 border-b border-[#E8DDD2] space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#F97316] text-white mb-2 shadow-sm">
              <Car className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="font-display font-extrabold text-2xl text-[#292522]">ParkEase Parking</h3>
            <p className="text-xs text-[#3A332E]/70 font-medium">Smart Parking Management System • Automated Exit Clearance</p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#27864B]/10 text-[#27864B] font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> PAYMENT SETTLED
              </span>
            </div>
          </div>

          {/* Receipt Details Grid */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-[#E8DDD2]/60">
              <span className="text-[#3A332E]/70">Receipt Reference:</span>
              <span className="font-mono font-bold text-[#292522]">{receipt.payment_reference}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E8DDD2]/60">
              <span className="text-[#3A332E]/70">Demo Transaction ID:</span>
              <span className="font-mono font-bold text-[#292522]">{receipt.transaction_ref || receipt.demo_transaction_ref}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E8DDD2]/60">
              <span className="text-[#3A332E]/70">Booking Reference:</span>
              <span className="font-mono font-bold text-[#EA580C]">{receipt.booking_reference}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E8DDD2]/60">
              <span className="text-[#3A332E]/70">Vehicle Plate:</span>
              <span className="font-mono font-extrabold text-[#292522]">{receipt.vehicle_plate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E8DDD2]/60">
              <span className="text-[#3A332E]/70">Facility / Bay:</span>
              <span className="font-semibold text-[#292522]">{receipt.facility_name} (Slot {receipt.slot_number})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E8DDD2]/60">
              <span className="text-[#3A332E]/70">Parking Duration:</span>
              <span className="font-semibold text-[#292522]">{receipt.duration || 'Session completed'} ({receipt.billable_hours} billable hrs)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E8DDD2]/60">
              <span className="text-[#3A332E]/70">Payment Channel:</span>
              <span className="font-bold text-[#292522] uppercase">{receipt.method || receipt.payment_method}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E8DDD2]/60">
              <span className="text-[#3A332E]/70">Timestamp:</span>
              <span className="font-medium text-[#292522]">{new Date().toLocaleString()}</span>
            </div>
          </div>

          {/* Fee Calculation Breakdown */}
          <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#E8DDD2] space-y-2 text-xs">
            <div className="flex justify-between text-[#3A332E]/80">
              <span>Base Parking Charge ({receipt.billable_hours || 1} hr @ ₹{receipt.hourly_rate || 40}/hr)</span>
              <span className="font-mono font-semibold">₹{receipt.base_amount || (receipt.total_paid ? Math.round(receipt.total_paid / 1.18 * 100) / 100 : receipt.amount)}</span>
            </div>
            <div className="flex justify-between text-[#3A332E]/80">
              <span>GST / Municipal Parking Tax (18%)</span>
              <span className="font-mono font-semibold">₹{receipt.tax_amount || (receipt.total_paid ? Math.round((receipt.total_paid - (receipt.total_paid / 1.18)) * 100) / 100 : 0)}</span>
            </div>
            <div className="pt-2 border-t border-[#E8DDD2] flex justify-between items-center text-sm font-bold text-[#292522]">
              <span>Total Amount Paid</span>
              <span className="font-display font-extrabold text-xl text-[#C2410C]">
                ₹{receipt.total_paid || receipt.amount}
              </span>
            </div>
          </div>

          {/* Legal / Prototype note */}
          <div className="text-[11px] text-[#3A332E]/60 text-center leading-relaxed">
            Thank you for parking with ParkEase. Safe travels!
            <br />
            This is an electronic tax invoice generated by the ParkEase Smart Parking System prototype.
          </div>

        </div>

        {/* Action Buttons */}
        <div className="no-print bg-[#F4F0EB] px-6 py-4 border-t border-[#E8DDD2] flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#292522] text-white text-xs font-semibold hover:bg-[#3A332E] transition-colors"
          >
            <Printer className="w-4 h-4 text-[#F97316]" />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-[#EA580C] transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
