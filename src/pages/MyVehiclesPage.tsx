import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api';
import { Vehicle } from '../types';
import { 
  Car, 
  Bike, 
  Plus, 
  Check, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Edit3,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyVehiclesPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [plateNumber, setPlateNumber] = useState('');
  const [category, setCategory] = useState<'car' | 'motorcycle' | 'scooter' | 'suv' | 'ev'>('car');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/vehicles');
      setVehicles(data.vehicles || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim()) return;

    setError(null);
    setSuccess(null);

    try {
      await apiRequest('/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          plate_number: plateNumber.trim().toUpperCase(),
          category,
          model: model.trim(),
          color: color.trim(),
          is_default: isDefault
        })
      });

      setSuccess(`Vehicle ${plateNumber.toUpperCase()} added to your fleet.`);
      setIsAddModalOpen(false);
      setPlateNumber('');
      setModel('');
      setColor('');
      await fetchVehicles();
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Failed to add vehicle.');
    }
  };

  const handleSetDefault = async (v: Vehicle) => {
    try {
      await apiRequest(`/vehicles/${v.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_default: 1 })
      });
      await fetchVehicles();
      await refreshUser();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await apiRequest(`/vehicles/${id}`, { method: 'DELETE' });
      setSuccess('Vehicle permit deleted successfully.');
      await fetchVehicles();
      await refreshUser();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 2xl:px-14 py-8 space-y-8 min-h-[calc(100vh-5rem)]">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD2]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
            Driver Garage Directory
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#292522] mt-1">
            Registered <span className="text-[#F97316]">Vehicles</span>
          </h1>
          <p className="text-sm text-[#3A332E]/70 mt-1">
            Maintain your enrolled fleet for automated barrier recognition and swift slot allocation.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold text-xs shadow-md shadow-[#F97316]/20"
        >
          <Plus className="w-4 h-4" /> Add New Vehicle
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

      {/* Vehicle Grid */}
      {loading ? (
        <div className="p-20 text-center rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2]">
          <div className="w-8 h-8 rounded-full border-2 border-[#F97316] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-[#3A332E]">Loading fleet...</p>
        </div>
      ) : vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {vehicles.map(v => (
            <div
              key={v.id}
              className={`p-6 rounded-3xl border bg-[#FFFDF9] shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                v.is_default
                  ? 'border-[#F97316] ring-2 ring-[#F97316]/20'
                  : 'border-[#E8DDD2] hover:border-[#3A332E]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] border border-[#E8DDD2] flex items-center justify-center text-[#F97316]">
                    {v.category === 'motorcycle' || v.category === 'scooter' ? (
                      <Bike className="w-6 h-6 stroke-[2]" />
                    ) : (
                      <Car className="w-6 h-6 stroke-[2]" />
                    )}
                  </div>
                  {v.is_default ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#EA580C] text-white text-[10px] font-extrabold uppercase tracking-wider">
                      Primary Vehicle
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(v)}
                      className="text-xs font-semibold text-[#3A332E]/70 hover:text-[#EA580C]"
                    >
                      Set as Primary
                    </button>
                  )}
                </div>

                <div>
                  <span className="font-mono font-black text-2xl text-[#292522] tracking-wider block">
                    {v.plate_number}
                  </span>
                  <p className="font-bold text-sm text-[#EA580C] mt-0.5">
                    {v.model || 'Registered Vehicle'}
                  </p>
                  <p className="text-xs text-[#3A332E]/70 capitalize">
                    {v.category} {v.color && `• ${v.color}`}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8DDD2] flex items-center justify-between">
                <Link
                  to="/find-parking"
                  className="text-xs font-bold text-[#EA580C] hover:underline"
                >
                  Book with this Vehicle →
                </Link>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="p-2 rounded-lg text-[#3A332E]/50 hover:text-[#C83B32] hover:bg-[#C83B32]/10 transition-colors"
                  title="Remove vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-3">
          <Car className="w-10 h-10 text-[#3A332E]/30 mx-auto" />
          <p className="font-bold text-sm text-[#292522]">No Vehicles Registered</p>
          <p className="text-xs text-[#3A332E]/60">Enroll your license plates for seamless barrier clearance.</p>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#292522]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] p-8 max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="font-display font-bold text-xl text-[#292522]">
              Enroll New Vehicle
            </h3>

            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                  License Plate Number *
                </label>
                <input
                  type="text"
                  required
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. MH-31-CB-1920"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] font-mono font-bold text-sm text-[#292522] outline-hidden focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] bg-white text-xs font-semibold text-[#292522]"
                >
                  <option value="car">Car (Sedan/Hatchback)</option>
                  <option value="suv">SUV / Premium</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="scooter">Scooter / Moped</option>
                  <option value="ev">Electric Vehicle (EV)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                  Make & Model
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Tata Nexon EV"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] text-xs font-medium text-[#292522] outline-hidden focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                  Color
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Signature Teal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] text-xs font-medium text-[#292522] outline-hidden focus:border-[#F97316]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#3A332E]">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-[#F97316]"
                />
                <span>Set as primary default vehicle</span>
              </label>

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
                  Enroll Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
