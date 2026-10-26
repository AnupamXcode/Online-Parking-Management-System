import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { Payment } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import { 
  CreditCard, 
  Receipt, 
  Clock, 
  Search, 
  CheckCircle2, 
  Eye, 
  ShieldCheck, 
  FileText,
  Printer
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  useEffect(() => {
    apiRequest('/payments')
      .then(data => setPayments(data.payments || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredPayments = payments.filter(p => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      p.payment_reference.toLowerCase().includes(s) ||
      p.demo_transaction_ref.toLowerCase().includes(s) ||
      (p.booking_reference && p.booking_reference.toLowerCase().includes(s)) ||
      (p.vehicle_plate && p.vehicle_plate.toLowerCase().includes(s))
    );
  });

  const totalVolume = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 2xl:px-14 py-8 space-y-8 min-h-[calc(100vh-5rem)]">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD2]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
            Financial Settlement History
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#292522] mt-1">
            Payments & <span className="text-[#F97316]">Tax Invoices</span>
          </h1>
          <p className="text-xs text-[#3A332E]/70 mt-1">
            Official itemized receipts for automated barrier checkouts and digital parking reservations.
          </p>
        </div>

        {/* Total volume badge */}
        <div className="px-5 py-3 rounded-2xl bg-[#FFF7ED] border border-[#E8DDD2] text-right">
          <span className="text-[10px] font-bold uppercase text-[#3A332E]/60 block">Total Settled Volume</span>
          <span className="font-display font-black text-2xl text-[#C2410C]">
            ₹{Math.round(totalVolume)}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3A332E]/40">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payment reference, transaction ID, booking ref..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB]/50 text-xs text-[#292522] outline-hidden focus:border-[#F97316]"
          />
        </div>
        <span className="text-xs text-[#3A332E]/70 font-semibold whitespace-nowrap">
          {filteredPayments.length} Invoices
        </span>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <div className="p-20 text-center rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2]">
          <div className="w-8 h-8 rounded-full border-2 border-[#F97316] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-[#3A332E]">Loading tax receipts...</p>
        </div>
      ) : filteredPayments.length > 0 ? (
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F0EB] text-[#3A332E]/80 font-bold uppercase tracking-wider text-[10px] border-b border-[#E8DDD2]">
                <tr>
                  <th className="px-5 py-3.5">Invoice Reference</th>
                  <th className="px-5 py-3.5">Booking / Plate</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Base + GST</th>
                  <th className="px-5 py-3.5">Total Paid</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DDD2]">
                {filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-[#FFF7ED]/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-[#EA580C] block">{p.payment_reference}</span>
                      <span className="text-[10px] font-mono text-[#3A332E]/60 truncate block max-w-[150px]">{p.demo_transaction_ref}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-[#292522] block">{p.booking_reference || 'Advance Pass'}</span>
                      <span className="font-mono text-[#3A332E]/70">{p.vehicle_plate || 'Permit'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#292522]/10 text-[#292522] font-extrabold uppercase text-[10px]">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[#3A332E]/80 block">Base: ₹{p.net_amount}</span>
                      <span className="text-[10px] text-[#3A332E]/60">GST: ₹{p.tax_amount}</span>
                    </td>
                    <td className="px-5 py-4 font-display font-black text-base text-[#C2410C]">
                      ₹{p.amount}
                    </td>
                    <td className="px-5 py-4 text-[#3A332E]/70">
                      {new Date(p.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt({
                          payment_reference: p.payment_reference,
                          transaction_ref: p.demo_transaction_ref,
                          booking_reference: p.booking_reference,
                          vehicle_plate: p.vehicle_plate,
                          facility_name: p.facility_name,
                          slot_number: p.slot_number,
                          method: p.payment_method,
                          base_amount: p.net_amount,
                          tax_amount: p.tax_amount,
                          total_paid: p.amount,
                          billable_hours: Math.ceil(p.amount / 40)
                        })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#292522] hover:bg-[#3A332E] text-white font-bold text-xs transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#F97316]" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-3">
          <Receipt className="w-10 h-10 text-[#3A332E]/30 mx-auto" />
          <p className="font-bold text-sm text-[#292522]">No Payment Transactions Found</p>
          <p className="text-xs text-[#3A332E]/60">Settled exit sessions automatically generate printable tax receipts.</p>
        </div>
      )}

      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

    </div>
  );
};
