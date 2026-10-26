import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Info, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      const destination = email.toLowerCase().includes('admin') ? '/admin' : '/dashboard';
      navigate(destination);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = async (role: 'user' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      await quickLogin(role);
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#FFFDF9] p-8 sm:p-10 rounded-3xl border-2 border-[#E8DDD2] shadow-xl relative">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#C2410C] text-white shadow-lg shadow-[#F97316]/20">
            <Car className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h2 className="font-display font-extrabold text-3xl text-[#292522] tracking-tight">
            Sign In to <span className="text-[#F97316]">ParkEase</span>
          </h2>
          <p className="text-sm text-[#3A332E]/70">
            Access your bookings, vehicle passes, and live parking bay status.
          </p>
        </div>

        {/* Demo Fast Logins Banner */}
        <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#E8DDD2] space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#EA580C]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast Evaluator Demo Logins</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('user')}
              className="py-2 px-3 rounded-xl bg-white border border-[#E8DDD2] hover:border-[#EA580C] text-xs font-bold text-[#292522] hover:text-[#EA580C] transition-colors shadow-2xs text-left"
            >
              <div className="text-[10px] text-[#3A332E]/60 uppercase">Driver Role</div>
              anupam@example.com
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="py-2 px-3 rounded-xl bg-[#292522] text-[#F97316] hover:bg-[#3A332E] text-xs font-bold transition-colors shadow-2xs text-left"
            >
              <div className="text-[10px] text-white/60 uppercase">Admin Role</div>
              admin@parkease.com
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-[#C83B32]/10 border border-[#C83B32]/30 flex items-start gap-3 text-xs text-[#C83B32]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Authentication Failed</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3A332E]/40">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB]/50 focus:bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 text-sm text-[#292522] transition-colors outline-hidden font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3A332E]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotPasswordModal(true)}
                className="text-xs font-semibold text-[#EA580C] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3A332E]/40">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#E8DDD2] bg-[#F4F0EB]/50 focus:bg-white focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 text-sm text-[#292522] transition-colors outline-hidden font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#3A332E]/50 hover:text-[#292522]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#3A332E]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#E8DDD2] text-[#F97316] focus:ring-[#F97316]"
              />
              <span>Remember this workstation</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-bold text-sm shadow-md shadow-[#F97316]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="pt-4 border-t border-[#E8DDD2] text-center text-xs text-[#3A332E]/80">
          New to ParkEase?{' '}
          <Link to="/register" className="font-bold text-[#EA580C] hover:underline">
            Register a new driver account
          </Link>
        </div>

      </div>

      {/* Forgot Password Demo Modal */}
      {forgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-[#292522]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-[#EA580C]">
              <Info className="w-5 h-5" />
              <h3 className="font-display font-bold text-lg text-[#292522]">Password Recovery</h3>
            </div>
            <p className="text-xs text-[#3A332E]/80 leading-relaxed">
              In this engineering project prototype, outbound SMTP email delivery is disabled for local deployment safety.
            </p>
            <div className="p-3 bg-[#FFF7ED] rounded-xl text-xs space-y-1">
              <p className="font-bold text-[#292522]">Pre-configured Demo Credentials:</p>
              <p className="font-mono text-[#3A332E]">User: anupam@example.com / UserPass123!</p>
              <p className="font-mono text-[#3A332E]">Admin: admin@parkease.com / AdminPass123!</p>
            </div>
            <button
              onClick={() => setForgotPasswordModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#292522] text-white text-xs font-bold hover:bg-[#3A332E]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
