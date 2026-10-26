import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Car, 
  Bike, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState<'car' | 'motorcycle' | 'scooter' | 'suv' | 'ev'>('car');
  const [vehicleModel, setVehicleModel] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = 'Full name is required.';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (phone.trim().length < 8) {
      errors.phone = 'Please provide a valid phone number with country/area code.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!plateNumber.trim()) {
      errors.plateNumber = 'Vehicle plate number is required for parking permits.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name,
        email,
        phone,
        password,
        confirmPassword,
        plateNumber,
        vehicleCategory,
        vehicleModel
      });
      setRegisteredSuccess(true);
    } catch (err: any) {
      setGeneralError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (registeredSuccess) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-[#FFFDF9] rounded-3xl border-2 border-[#E8DDD2] p-8 sm:p-10 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-[#27864B]/10 text-[#27864B] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-[#292522]">
              Driver Account Registered!
            </h2>
            <p className="text-sm text-[#3A332E]/80 mt-2">
              Welcome to ParkEase, <span className="font-bold text-[#EA580C]">{name}</span>. Your vehicle <span className="font-mono font-bold text-[#292522]">{plateNumber.toUpperCase()}</span> has been enrolled in the smart parking system.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
          >
            Launch Driver Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-[#FFFDF9] p-8 sm:p-10 rounded-3xl border-2 border-[#E8DDD2] shadow-xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#F97316] text-white shadow-md shadow-[#F97316]/20">
            <Car className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="font-display font-extrabold text-3xl text-[#292522] tracking-tight">
            Create Your <span className="text-[#F97316]">Driver Profile</span>
          </h2>
          <p className="text-sm text-[#3A332E]/70">
            Enables instant QR barrier entry, slot reservations, and receipt settlement.
          </p>
        </div>

        {generalError && (
          <div className="p-4 rounded-2xl bg-[#C83B32]/10 border border-[#C83B32]/30 flex items-start gap-3 text-xs text-[#C83B32]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Registration Issue</p>
              <p>{generalError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Personal Details Group */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#EA580C] pb-1 border-b border-[#E8DDD2]">
              1. Personal & Contact Information
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                Full Legal Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3A332E]/40">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anupam Shrivastava"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB]/40 focus:bg-white focus:border-[#F97316] text-sm text-[#292522] outline-hidden font-medium"
                />
              </div>
              {fieldErrors.name && <p className="text-xs text-[#C83B32] mt-1 font-medium">{fieldErrors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3A332E]/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB]/40 focus:bg-white focus:border-[#F97316] text-sm text-[#292522] outline-hidden font-medium"
                  />
                </div>
                {fieldErrors.email && <p className="text-xs text-[#C83B32] mt-1 font-medium">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                  Mobile Phone *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3A332E]/40">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB]/40 focus:bg-white focus:border-[#F97316] text-sm text-[#292522] outline-hidden font-medium"
                  />
                </div>
                {fieldErrors.phone && <p className="text-xs text-[#C83B32] mt-1 font-medium">{fieldErrors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3A332E]/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB]/40 focus:bg-white focus:border-[#F97316] text-sm text-[#292522] outline-hidden font-medium"
                  />
                </div>
                {fieldErrors.password && <p className="text-xs text-[#C83B32] mt-1 font-medium">{fieldErrors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3A332E]/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB]/40 focus:bg-white focus:border-[#F97316] text-sm text-[#292522] outline-hidden font-medium"
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-[#C83B32] mt-1 font-medium">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Information Group */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#EA580C] pb-1 border-b border-[#E8DDD2]">
              2. Vehicle Permit Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                  License Plate Number *
                </label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. MH-31-EQ-4092"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB]/40 focus:bg-white focus:border-[#F97316] text-sm font-mono font-bold text-[#292522] outline-hidden"
                />
                {fieldErrors.plateNumber && (
                  <p className="text-xs text-[#C83B32] mt-1 font-medium">{fieldErrors.plateNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                  Vehicle Category *
                </label>
                <select
                  value={vehicleCategory}
                  onChange={(e: any) => setVehicleCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] bg-white text-sm text-[#292522] outline-hidden font-medium"
                >
                  <option value="car">Car (Sedan / Hatchback)</option>
                  <option value="suv">SUV / Premium</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="scooter">Scooter / Moped</option>
                  <option value="ev">Electric Vehicle (EV)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1">
                Make & Model (Optional)
              </label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g. Honda City i-VTEC White"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB]/40 focus:bg-white focus:border-[#F97316] text-sm text-[#292522] outline-hidden font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating Permit...' : 'Complete Driver Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#3A332E]/80 border-t border-[#E8DDD2]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#EA580C] hover:underline">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
};
