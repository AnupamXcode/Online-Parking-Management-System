import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api';
import { ParkingFacility } from '../../types';
import { 
  MapPin, 
  Plus, 
  Layers, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Edit3,
  Building,
  Image as ImageIcon
} from 'lucide-react';

export const AdminFacilitiesPage: React.FC = () => {
  const [facilities, setFacilities] = useState<ParkingFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<ParkingFacility | null>(null);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Nagpur');
  const [hourlyRate, setHourlyRate] = useState(40);
  const [imageUrl, setImageUrl] = useState('');

  const loadFacilities = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/facilities');
      setFacilities(data.facilities || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await apiRequest('/admin/facilities', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          city: city.trim(),
          hourly_rate: Number(hourlyRate),
          image_url: imageUrl.trim() || undefined
        })
      });

      setSuccess(`Facility '${name}' created successfully.`);
      setIsAddModalOpen(false);
      setName('');
      setAddress('');
      await loadFacilities();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacility) return;

    setError(null);
    setSuccess(null);

    try {
      await apiRequest(`/admin/facilities/${editingFacility.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editingFacility.name,
          address: editingFacility.address,
          city: editingFacility.city,
          hourly_rate: Number(editingFacility.hourly_rate),
          status: editingFacility.status,
          image_url: editingFacility.image_url
        })
      });

      setSuccess(`Facility '${editingFacility.name}' updated.`);
      setEditingFacility(null);
      await loadFacilities();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 2xl:px-14 py-8 space-y-8 min-h-[calc(100vh-5rem)]">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD2]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
            Infrastructure Administration
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#292522] mt-1">
            Parking <span className="text-[#F97316]">Facilities</span>
          </h1>
          <p className="text-xs text-[#3A332E]/70 mt-1">
            Configure parking hubs, tariffs, operational statuses, and capacity limits.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold text-xs shadow-md shadow-[#F97316]/20"
        >
          <Plus className="w-4 h-4" /> Add New Facility
        </button>
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

      {/* Facilities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {facilities.map(fac => (
          <div
            key={fac.id}
            className="rounded-3xl border border-[#E8DDD2] bg-[#FFFDF9] overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="h-44 overflow-hidden relative">
                <img
                  src={fac.image_url}
                  alt={fac.name}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  fac.status === 'active' ? 'bg-[#27864B] text-white' : 'bg-[#C83B32] text-white'
                }`}>
                  {fac.status}
                </span>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg text-[#292522]">{fac.name}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-[#FFF7ED] text-[#C2410C] text-[10px] font-bold uppercase">
                    {fac.category || 'Shopping Mall'}
                  </span>
                </div>
                <p className="text-xs text-[#3A332E]/70 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#F97316] shrink-0" />
                  {fac.address}, {fac.city}
                </p>

                <div className="pt-3 border-t border-[#E8DDD2] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#3A332E]/60 text-[10px] uppercase font-bold block">Capacity</span>
                    <span className="font-bold text-[#292522]">{fac.total_slots} Slots</span>
                  </div>
                  <div>
                    <span className="text-[#3A332E]/60 text-[10px] uppercase font-bold block">Tariff</span>
                    <span className="font-display font-black text-[#EA580C]">₹{fac.hourly_rate} / hr</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => setEditingFacility(fac)}
                className="w-full py-2.5 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB] hover:bg-[#FFF7ED] text-xs font-bold text-[#292522] hover:text-[#EA580C] transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" /> Configure Hub
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Facility Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#292522]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] p-8 max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="font-display font-bold text-xl text-[#292522]">
              Add New Parking Hub
            </h3>

            <form onSubmit={handleCreateFacility} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                  Facility Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Phoenix MarketCity Parking"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] text-xs font-bold text-[#292522] outline-hidden focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                  Physical Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Whitefield Main Road"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] text-xs text-[#292522] outline-hidden focus:border-[#F97316]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] text-xs font-semibold text-[#292522]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                    Hourly Tariff (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] text-xs font-bold text-[#EA580C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] text-xs text-[#292522] outline-hidden focus:border-[#F97316]"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DDD2] text-xs font-bold text-[#3A332E] hover:bg-[#F4F0EB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white text-xs font-bold shadow-md"
                >
                  Create Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Facility Modal */}
      {editingFacility && (
        <div className="fixed inset-0 z-50 bg-[#292522]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] p-8 max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="font-display font-bold text-xl text-[#292522]">
              Configure {editingFacility.name}
            </h3>

            <form onSubmit={handleUpdateFacility} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                  Facility Name
                </label>
                <input
                  type="text"
                  required
                  value={editingFacility.name}
                  onChange={(e) => setEditingFacility({ ...editingFacility, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] text-xs font-bold text-[#292522]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                    Tariff (₹ / hr)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingFacility.hourly_rate}
                    onChange={(e) => setEditingFacility({ ...editingFacility, hourly_rate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] text-xs font-bold text-[#EA580C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                    Status
                  </label>
                  <select
                    value={editingFacility.status}
                    onChange={(e: any) => setEditingFacility({ ...editingFacility, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] bg-white text-xs font-semibold text-[#292522]"
                  >
                    <option value="active">Active Operational</option>
                    <option value="maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingFacility(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8DDD2] text-xs font-bold text-[#3A332E] hover:bg-[#F4F0EB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#292522] text-white text-xs font-bold shadow-md"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
