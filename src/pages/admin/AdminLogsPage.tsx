import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api';
import { 
  ArrowRightCircle, 
  ArrowLeftCircle, 
  Clock, 
  ShieldCheck, 
  Search, 
  MapPin, 
  Car,
  Layers
} from 'lucide-react';

export const AdminLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiRequest('/admin/logs')
      .then(data => setLogs(data.logs || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter(l => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      l.vehicle_plate.toLowerCase().includes(s) ||
      (l.facility_name && l.facility_name.toLowerCase().includes(s)) ||
      (l.slot_number && l.slot_number.toLowerCase().includes(s)) ||
      (l.event_type && l.event_type.toLowerCase().includes(s))
    );
  });

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 2xl:px-14 py-8 space-y-8 min-h-[calc(100vh-5rem)]">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD2]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
            Hardware Barrier Audit Trail
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#292522] mt-1">
            Gate Entry & <span className="text-[#F97316]">Exit Logs</span>
          </h1>
          <p className="text-xs text-[#3A332E]/70 mt-1">
            Immutable physical event logging: optical license plate recognition, boom barrier activations, and departure timestamps.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#27864B]/10 text-[#27864B] text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-[#27864B] animate-pulse" />
          Hardware Bus Connected
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
            placeholder="Search by license plate, facility name, bay..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB]/50 text-xs text-[#292522] outline-hidden focus:border-[#F97316]"
          />
        </div>
        <span className="text-xs font-semibold text-[#3A332E]/70 whitespace-nowrap">
          {filteredLogs.length} Events Logged
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-20 text-center rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2]">
          <div className="w-8 h-8 rounded-full border-2 border-[#F97316] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-[#3A332E]">Reading audit trail stream...</p>
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F0EB] text-[#3A332E]/80 font-bold uppercase tracking-wider text-[10px] border-b border-[#E8DDD2]">
                <tr>
                  <th className="px-5 py-3.5">Log ID</th>
                  <th className="px-5 py-3.5">Event Type</th>
                  <th className="px-5 py-3.5">Vehicle License Plate</th>
                  <th className="px-5 py-3.5">Facility & Bay</th>
                  <th className="px-5 py-3.5">Barrier State</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Audit Event Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DDD2]">
                {filteredLogs.map(l => (
                  <tr key={l.id} className="hover:bg-[#FFF7ED]/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-[#3A332E]/60">#{l.id}</td>
                    <td className="px-5 py-4 font-bold">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase font-extrabold ${
                        l.event_type === 'entry' ? 'bg-[#27864B]/10 text-[#27864B]' :
                        l.event_type === 'exit' ? 'bg-[#EA580C]/10 text-[#EA580C]' :
                        'bg-[#3A332E]/10 text-[#3A332E]'
                      }`}>
                        {l.event_type === 'entry' ? <ArrowRightCircle className="w-3.5 h-3.5" /> : <ArrowLeftCircle className="w-3.5 h-3.5" />}
                        {l.event_type}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono font-extrabold text-[#292522]">
                      {l.vehicle_plate}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-[#292522] block">{l.facility_name}</span>
                      <span className="text-[11px] text-[#EA580C] font-semibold">Bay {l.slot_number} ({l.floor || 'Level'})</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#27864B]/15 text-[#27864B] font-mono text-[10px] uppercase font-bold">
                        {l.barrier_status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-[#3A332E]/70 text-[11px]">
                      {new Date(l.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-5 py-4 text-[#3A332E]/80 max-w-sm">
                      {l.notes || 'Automated hardware event'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-3">
          <Clock className="w-10 h-10 text-[#3A332E]/30 mx-auto" />
          <p className="font-bold text-sm text-[#292522]">No Gate Events Recorded</p>
        </div>
      )}

    </div>
  );
};
