import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api';
import { 
  Activity, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  CreditCard, 
  AlertTriangle, 
  ArrowRightCircle, 
  ArrowLeftCircle,
  Clock,
  Sparkles,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminOverviewPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/admin/overview')
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 2xl:px-14 py-16 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#F97316] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="text-xs font-bold text-[#3A332E]">Loading administrative command telemetry...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const recentEvents = data?.recentEvents || [];
  const facilities = data?.facilityBreakdown || [];

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 2xl:px-14 py-8 space-y-8 min-h-[calc(100vh-5rem)]">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD2]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
            Mission Operations Command
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#292522] mt-1">
            Admin <span className="text-[#F97316]">Overview</span>
          </h1>
          <p className="text-xs text-[#3A332E]/70 mt-1">
            Centralized telemetry for hub occupancy, gate barriers, active permits, and revenue settlement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/sensors"
            className="px-4 py-2.5 rounded-xl bg-[#292522] hover:bg-[#3A332E] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#F97316]" />
            Live IoT Sensor Monitor
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Facilities & Slots */}
        <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#EA580C]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Fleet Slots</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="font-display font-black text-3xl text-[#292522]">
            {kpis.totalSlots}
          </div>
          <p className="text-[11px] text-[#3A332E]/70">In {kpis.totalFacilities} active facilities</p>
        </div>

        {/* Available Bays */}
        <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#27864B]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Available Bays</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#27864B] animate-pulse" />
          </div>
          <div className="font-display font-black text-3xl text-[#27864B]">
            {kpis.availableSlots}
          </div>
          <p className="text-[11px] text-[#3A332E]/70">Open for immediate allocation</p>
        </div>

        {/* Occupied Bays */}
        <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#C83B32]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Occupied / Parked</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#C83B32]" />
          </div>
          <div className="font-display font-black text-3xl text-[#C83B32]">
            {kpis.occupiedSlots}
          </div>
          <p className="text-[11px] text-[#3A332E]/70">Vehicles currently checked in</p>
        </div>

        {/* Total Revenue */}
        <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#292522]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Demo Revenue</span>
            <CreditCard className="w-4 h-4 text-[#F97316]" />
          </div>
          <div className="font-display font-black text-3xl text-[#C2410C]">
            ₹{Math.round(kpis.totalRevenue || 0)}
          </div>
          <p className="text-[11px] text-[#3A332E]/70">{kpis.totalTransactions || 0} settled exits</p>
        </div>

      </div>

      {/* Secondary Status Row: Reserved & Out of Service */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#E8DDD2] flex items-center justify-between text-xs">
          <div>
            <span className="text-[#3A332E]/60 uppercase font-bold text-[10px] block">Upcoming Reserved</span>
            <span className="font-display font-black text-xl text-[#EA580C]">{kpis.reservedSlots} Bays</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#E8DDD2] flex items-center justify-between text-xs">
          <div>
            <span className="text-[#3A332E]/60 uppercase font-bold text-[10px] block">Out of Service / Maint</span>
            <span className="font-display font-black text-xl text-[#3A332E]">{kpis.outOfServiceSlots} Bays</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#E8DDD2] flex items-center justify-between text-xs">
          <div>
            <span className="text-[#3A332E]/60 uppercase font-bold text-[10px] block">Active Reservations</span>
            <span className="font-display font-black text-xl text-[#292522]">{kpis.activeBookings} Active</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#E8DDD2] flex items-center justify-between text-xs">
          <div>
            <span className="text-[#3A332E]/60 uppercase font-bold text-[10px] block">Sensor Online Rate</span>
            <span className="font-display font-black text-xl text-[#27864B]">100% Operational</span>
          </div>
        </div>
      </div>

      {/* Facility Breakdown Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-[#292522]">
            Facility-Wise Bay Breakdown
          </h2>
          <Link to="/admin/facilities" className="text-xs font-bold text-[#EA580C] hover:underline">
            Manage Facilities →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {facilities.map((fac: any) => {
            const avail = fac.available || 0;
            const occ = fac.occupied || 0;
            const resv = fac.reserved || 0;
            const oos = fac.out_of_service || 0;
            const total = fac.total_slots || 1;
            const pct = Math.round(((total - avail) / total) * 100);

            return (
              <div
                key={fac.id}
                className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-4 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-bold text-base text-[#292522]">{fac.name}</h3>
                    <p className="text-xs text-[#3A332E]/70 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F97316]" /> {fac.city}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-[#FFF7ED] border border-[#E8DDD2] text-xs font-extrabold text-[#EA580C]">
                    ₹{fac.hourly_rate}/hr
                  </span>
                </div>

                {/* Micro Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#27864B]">{avail} Available</span>
                    <span className="text-[#C83B32]">{occ} Occupied</span>
                    <span className="text-[#EA580C]">{resv} Reserved</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#F4F0EB] overflow-hidden flex">
                    <div style={{ width: `${(occ / total) * 100}%` }} className="bg-[#C83B32] h-full" title="Occupied" />
                    <div style={{ width: `${(resv / total) * 100}%` }} className="bg-[#EA580C] h-full" title="Reserved" />
                    <div style={{ width: `${(oos / total) * 100}%` }} className="bg-[#3A332E]/40 h-full" title="Maintenance" />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-[#E8DDD2]">
                  <span className="text-[#3A332E]/70">Occupancy: {pct}%</span>
                  <Link
                    to="/admin/slots"
                    className="font-bold text-[#EA580C] hover:underline"
                  >
                    View Slot Matrix →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Gate Events Audit Trail */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-[#292522]">
            Recent Gate & Barrier Security Events
          </h2>
          <Link to="/admin/logs" className="text-xs font-bold text-[#EA580C] hover:underline">
            View Complete Audit Log →
          </Link>
        </div>

        <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F0EB] text-[#3A332E]/80 font-bold uppercase tracking-wider text-[10px] border-b border-[#E8DDD2]">
                <tr>
                  <th className="px-5 py-3.5">Event</th>
                  <th className="px-5 py-3.5">Facility / Bay</th>
                  <th className="px-5 py-3.5">Vehicle Plate</th>
                  <th className="px-5 py-3.5">Barrier</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DDD2]">
                {recentEvents.slice(0, 8).map((evt: any) => (
                  <tr key={evt.id} className="hover:bg-[#FFF7ED]/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase font-extrabold ${
                        evt.event_type === 'entry' ? 'bg-[#27864B]/10 text-[#27864B]' :
                        evt.event_type === 'exit' ? 'bg-[#EA580C]/10 text-[#EA580C]' :
                        'bg-[#3A332E]/10 text-[#3A332E]'
                      }`}>
                        {evt.event_type === 'entry' ? <ArrowRightCircle className="w-3.5 h-3.5" /> : <ArrowLeftCircle className="w-3.5 h-3.5" />}
                        {evt.event_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-[#292522] block">{evt.facility_name}</span>
                      <span className="text-[10px] text-[#3A332E]/60">Bay {evt.slot_number}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-[#EA580C]">
                      {evt.vehicle_plate}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#27864B]/10 text-[#27864B] font-bold text-[10px] uppercase">
                        {evt.barrier_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#3A332E]/70 font-mono text-[11px]">
                      {new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5 text-[#3A332E]/80 truncate max-w-xs">
                      {evt.notes || 'Automated hardware event trigger logged.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
