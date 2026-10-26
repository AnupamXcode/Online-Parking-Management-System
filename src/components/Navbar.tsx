import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Car, 
  MapPin, 
  Ticket, 
  LogIn, 
  LogOut, 
  CreditCard, 
  ShieldCheck, 
  Menu, 
  X, 
  User as UserIcon,
  Activity,
  Layers,
  Sparkles,
  ArrowRightCircle,
  ArrowLeftCircle
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: Layers },
    { to: '/find-parking', label: 'Find Parking', icon: MapPin },
    { to: '/bookings', label: 'My Bookings', icon: Ticket },
    { to: '/vehicle-entry', label: 'Vehicle Entry', icon: ArrowRightCircle },
    { to: '/vehicle-exit', label: 'Vehicle Exit', icon: ArrowLeftCircle },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/vehicles', label: 'My Vehicles', icon: Car },
    { to: '/profile', label: 'Profile', icon: UserIcon },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Overview', icon: Activity },
    { to: '/admin/facilities', label: 'Facilities', icon: MapPin },
    { to: '/admin/slots', label: 'Parking Slots', icon: Layers },
    { to: '/admin/reservations', label: 'Reservations', icon: Ticket },
    { to: '/admin/logs', label: 'Gate Logs', icon: ArrowRightCircle },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/admin/sensors', label: 'IoT Sensors', icon: Sparkles },
    { to: '/admin/users', label: 'Users', icon: UserIcon },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#E8DDD2] shadow-xs w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand */}
          <Link to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F97316] to-[#C2410C] flex items-center justify-center text-white shadow-md shadow-[#F97316]/20 group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-2xl tracking-tight text-[#292522]">Park<span className="text-[#F97316]">Ease</span></span>
                {user?.role === 'admin' && (
                  <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-[#292522] text-[#F97316]">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#3A332E]/70 font-medium tracking-wide hidden sm:block">Smart Parking Management System</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {user ? (
              user.role === 'admin' ? (
                adminLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        isActive(item.to)
                          ? 'bg-[#FFF7ED] text-[#EA580C] border border-[#E8DDD2]'
                          : 'text-[#3A332E] hover:text-[#EA580C] hover:bg-[#F4F0EB]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })
              ) : (
                userLinks.slice(0, 6).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        isActive(item.to)
                          ? 'bg-[#FFF7ED] text-[#EA580C] border border-[#E8DDD2]'
                          : 'text-[#3A332E] hover:text-[#EA580C] hover:bg-[#F4F0EB]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })
              )
            ) : (
              <div className="flex items-center gap-6 text-sm font-medium text-[#3A332E]">
                <a href="#how-it-works" className="hover:text-[#F97316] transition-colors">How It Works</a>
                <a href="#facilities" className="hover:text-[#F97316] transition-colors">Facilities</a>
                <a href="#sensor-telemetry" className="hover:text-[#F97316] transition-colors">Smart Sensors</a>
              </div>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8DDD2] bg-[#F4F0EB] hover:bg-[#FFF7ED] text-xs font-semibold text-[#3A332E] transition-colors"
                title="Quick demo switch"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                Demo Switcher
              </button>
              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-[#3A332E]/60 uppercase tracking-wider">
                    Instant Demo Logins
                  </div>
                  <button
                    onClick={async () => {
                      setDemoDropdownOpen(false);
                      await quickLogin('user');
                      navigate('/dashboard');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[#292522] hover:bg-[#FFF7ED] hover:text-[#EA580C] flex items-center gap-2"
                  >
                    <Car className="w-4 h-4 text-[#F97316]" />
                    <span>Demo Driver (Anupam)</span>
                  </button>
                  <button
                    onClick={async () => {
                      setDemoDropdownOpen(false);
                      await quickLogin('admin');
                      navigate('/admin');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[#292522] hover:bg-[#FFF7ED] hover:text-[#EA580C] flex items-center gap-2 border-t border-[#E8DDD2]/50"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#C2410C]" />
                    <span>Demo Operator (Admin)</span>
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-[#E8DDD2]">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#F4F0EB] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left text-xs hidden xl:block">
                    <p className="font-bold text-[#292522] truncate max-w-[110px]">{user.name}</p>
                    <p className="text-[#3A332E]/60 capitalize">{user.role}</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-[#3A332E] hover:text-[#C83B32] hover:bg-[#FFF7ED] transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-[#292522] hover:bg-[#F4F0EB] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] shadow-sm shadow-[#F97316]/20 transition-all hover:shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#292522] hover:bg-[#F4F0EB]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FFFDF9] border-b border-[#E8DDD2] px-4 pt-2 pb-6 space-y-2">
          {user ? (
            <>
              <div className="pb-2 border-b border-[#E8DDD2] mb-2 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#292522]">{user.name}</p>
                  <p className="text-xs text-[#3A332E]/70">{user.email} ({user.role})</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-[#FFF7ED] text-[#C83B32] text-xs font-bold flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(user.role === 'admin' ? adminLinks : userLinks).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                        isActive(item.to)
                          ? 'bg-[#FFF7ED] text-[#EA580C]'
                          : 'text-[#3A332E] hover:bg-[#F4F0EB]'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#F97316]" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-3 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center font-semibold text-[#292522] bg-[#F4F0EB] rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center font-semibold text-white bg-[#F97316] rounded-xl"
              >
                Register Account
              </Link>
              <div className="pt-2 border-t border-[#E8DDD2] grid grid-cols-2 gap-2">
                <button
                  onClick={async () => {
                    await quickLogin('user');
                    setMobileMenuOpen(false);
                    navigate('/dashboard');
                  }}
                  className="py-2 text-xs font-semibold bg-[#FFF7ED] text-[#EA580C] rounded-lg"
                >
                  Demo User
                </button>
                <button
                  onClick={async () => {
                    await quickLogin('admin');
                    setMobileMenuOpen(false);
                    navigate('/admin');
                  }}
                  className="py-2 text-xs font-semibold bg-[#292522] text-[#F97316] rounded-lg"
                >
                  Demo Admin
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
