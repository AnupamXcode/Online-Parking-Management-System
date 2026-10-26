import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api';
import { User } from '../../types';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle,
  Car,
  Ticket
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/admin/users');
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, currentRole: string) => {
    setMessage(null);
    setError(null);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    try {
      const res = await apiRequest(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      setMessage(res.message);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 2xl:px-14 py-8 space-y-8 min-h-[calc(100vh-5rem)]">
      
      {/* Title */}
      <div className="pb-4 border-b border-[#E8DDD2]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
          Identity & Role Access Control
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-[#292522] mt-1">
          Registered <span className="text-[#F97316]">Users & Operators</span>
        </h1>
        <p className="text-xs text-[#3A332E]/70 mt-1">
          Review enrolled driver profiles and assign administrative barrier supervisor privileges.
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

      {/* Users Table */}
      {loading ? (
        <div className="p-20 text-center rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2]">
          <div className="w-8 h-8 rounded-full border-2 border-[#F97316] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-[#3A332E]">Loading user accounts...</p>
        </div>
      ) : (
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F0EB] text-[#3A332E]/80 font-bold uppercase tracking-wider text-[10px] border-b border-[#E8DDD2]">
                <tr>
                  <th className="px-5 py-3.5">User Details</th>
                  <th className="px-5 py-3.5">Email / Phone</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                  <th className="px-5 py-3.5">Bookings</th>
                  <th className="px-5 py-3.5">Enrolled Vehicles</th>
                  <th className="px-5 py-3.5">Joined Date</th>
                  <th className="px-5 py-3.5 text-right">Role Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DDD2]">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-[#FFF7ED]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-[#292522] block">{u.name}</span>
                          <span className="text-[10px] font-mono text-[#3A332E]/60">ID: #{u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-[#292522] block">{u.email}</span>
                      <span className="text-[10px] text-[#3A332E]/70 font-mono">{u.phone}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-[#292522] text-[#F97316]'
                          : 'bg-[#F4F0EB] text-[#3A332E]'
                      }`}>
                        {u.role === 'admin' ? 'Administrator' : 'Standard Driver'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-[#292522]">
                      {u.booking_count} sessions
                    </td>
                    <td className="px-5 py-4 font-bold text-[#292522]">
                      {u.vehicle_count} vehicles
                    </td>
                    <td className="px-5 py-4 text-[#3A332E]/70">
                      {new Date(u.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleRoleChange(u.id, u.role)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                          u.role === 'admin'
                            ? 'border border-[#C83B32]/30 text-[#C83B32] hover:bg-[#C83B32]/10'
                            : 'bg-[#292522] text-white hover:bg-[#3A332E]'
                        }`}
                      >
                        {u.role === 'admin' ? 'Revoke Admin' : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
