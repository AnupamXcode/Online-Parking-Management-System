import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api';
import { ReceiptModal } from '../../components/ReceiptModal';
import { 
  CreditCard, 
  Receipt, 
  Clock, 
  Search, 
  Printer, 
  DollarSign, 
  FileText
} from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  useEffect(() => {
    apiRequest('/payments')
      .then(data => setPayments(data.payments || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalTax = payments.reduce((sum, p) => sum + (p.tax_amount || 0), 0);

  const filtered = payments.filter(p => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      p.payment_reference.toLowerCase().includes(s) ||
      p.demo_transaction_ref.toLowerCase().includes(s) ||
      (p.user_name && p.user_name.toLowerCase().includes(s)) ||
      (p.vehicle_plate && p.vehicle_plate.toLowerCase().includes(s))
    );
  });

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 2xl:px-14 py-8 space-y-8 min-h-[calc(100vh-5rem)]">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD2]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
            Financial Settlement Audit
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#292522] mt-1">
            Settlement & <span className="text-[#F97316]">Revenue Ledger</span>
          </h1>
          <p className="text-xs text-[#3A332E]/70 mt-1">
            Global repository of all barrier departure fees, tax breakdown, and demo payment transactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-[#FFF7ED] border border-[#E8DDD2] text-right">
            <span className="text-[10px] font-bold uppercase text-[#3A332E]/60 block">Total Collected</span>
            <span className="font-display font-black text-2xl text-[#C2410C]">
              ₹{Math.round(totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3A332E]/40">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice ref, driver name, vehicle plate..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB]/50 text-xs text-[#292522] outline-hidden focus:border-[#F97316]"
          />
        </div>
        <span className="text-xs font-semibold text-[#3A332E]/70 whitespace-nowrap">
          {filtered.length} Ledger Entries
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-20 text-center rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2]">
          <div className="w-8 h-8 rounded-full border-2 border-[#F97316] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-[#3A332E]">Loading ledger records...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F0EB] text-[#3A332E]/80 font-bold uppercase tracking-wider text-[10px] border-b border-[#E8DDD2]">
                <tr>
                  <th className="px-5 py-3.5">Invoice ID</th>
                  <th className="px-5 py-3.5">Driver / Account</th>
                  <th className="px-5 py-3.5">Vehicle Plate</th>
                  <th className="px-5 py-3.5">Channel</th>
                  <th className="px-5 py-3.5">Net Base</th>
                  <th className="px-5 py-3.5">GST 18%</th>
                  <th className="px-5 py-3.5">Total Settled</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DDD2]">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-[#FFF7ED]/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-[#EA580C]">
                      {p.payment_reference}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-[#292522] block">{p.user_name}</span>
                      <span className="text-[10px] text-[#3A332E]/60">{p.user_email}</span>
                    </td>
                    <td className="px-5 py-4 font-mono font-extrabold text-[#292522]">
                      {p.vehicle_plate}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded-md bg-[#292522]/10 text-[#292522] font-mono font-extrabold text-[10px] uppercase">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#292522]">
                      ₹{p.net_amount}
                    </td>
                    <td className="px-5 py-4 text-[#3A332E]/70 font-semibold">
                      ₹{p.tax_amount}
                    </td>
                    <td className="px-5 py-4 font-display font-black text-base text-[#C2410C]">
                      ₹{p.amount}
                    </td>
                    <td className="px-5 py-4 font-mono text-[#3A332E]/70 text-[11px]">
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
                        className="px-2.5 py-1 rounded-lg bg-[#292522] hover:bg-[#3A332E] text-white text-[11px] font-bold"
                      >
                        Receipt
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
          <CreditCard className="w-10 h-10 text-[#3A332E]/30 mx-auto" />
          <p className="font-bold text-sm text-[#292522]">No Settlement Records Found</p>
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
