import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  KeyRound,
  Layers,
  Car
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setLoading(true);

    try {
      await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, phone })
      });
      setSuccess('Profile details saved successfully.');
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="pb-4 border-b border-[#E8DDD2]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EA580C]/10 text-[#EA580C] text-xs font-bold uppercase tracking-wider mb-2">
          <User className="w-3.5 h-3.5" />
          <span>Driver Profile Settings</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-[#292522]">
          Account & <span className="text-[#F97316]">Identity</span>
        </h1>
        <p className="text-sm text-[#3A332E]/70 mt-1">
          Review your verified identity, contact information, and role privileges.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-[#27864B]/10 border border-[#27864B]/30 flex items-center gap-3 text-xs text-[#27864B] font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-[#C83B32]/10 border border-[#C83B32]/30 flex items-center gap-3 text-xs text-[#C83B32] font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Profile Card */}
        <div className="md:col-span-5 p-6 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#F97316] to-[#C2410C] text-white flex items-center justify-center font-display font-black text-3xl shadow-lg shadow-[#F97316]/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-[#292522]">{user?.name}</h3>
              <p className="text-xs text-[#3A332E]/70 mt-0.5">{user?.email}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#292522] text-[#F97316]">
              {user?.role === 'admin' ? 'System Administrator' : 'Verified Driver'}
            </span>
          </div>

          <div className="pt-4 border-t border-[#E8DDD2] space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-[#3A332E]/70">Account ID:</span>
              <span className="font-mono font-bold text-[#292522]">#USR-{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#3A332E]/70">Member Since:</span>
              <span className="font-medium text-[#292522]">
                {new Date(user?.created_at || Date.now()).toLocaleDateString([], { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#3A332E]/70">Digital Token Auth:</span>
              <span className="font-bold text-[#27864B]">HMAC-SHA256 Active</span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-6">
          <h2 className="font-display font-bold text-xl text-[#292522]">
            Update Personal Details
          </h2>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3A332E]/40">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB]/40 focus:bg-white focus:border-[#F97316] text-sm text-[#292522] outline-hidden font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                Email Address (Permanent Identifier)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3A332E]/40">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB] text-sm text-[#3A332E]/60 outline-hidden font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                Contact Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3A332E]/40">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB]/40 focus:bg-white focus:border-[#F97316] text-sm text-[#292522] outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold text-xs shadow-md flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
