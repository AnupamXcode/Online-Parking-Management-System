import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Car, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  Sparkles, 
  CreditCard, 
  Activity, 
  Zap, 
  ChevronRight,
  Cpu,
  Layers
} from 'lucide-react';
import { apiRequest } from '../api';
import { ParkingFacility } from '../types';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<ParkingFacility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiRequest('/facilities')
      .then(data => setFacilities(data.facilities || []))
      .catch(err => console.error('Error fetching facilities:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-24">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-[#FFF7ED] via-[#FFFDF9] to-[#FFFDF9] w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EA580C]/10 border border-[#EA580C]/20 text-[#EA580C] text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Smart Parking Architecture</span>
              </div>

              <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-[#292522] leading-[1.08]">
                Parking Made <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#C2410C]">Smarter.</span><br />
                Every Journey <span className="underline decoration-[#F97316]/40 decoration-wavy">Simpler.</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#3A332E]/80 max-w-2xl font-normal leading-relaxed">
                Experience real-time bay allocation, conflict-free digital reservations, IoT ultrasonic occupancy detection, and automated boom barrier entry and exit.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to={user ? "/find-parking" : "/register"}
                  className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-bold text-base shadow-lg shadow-[#F97316]/25 hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                >
                  Find & Book Parking
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <a
                  href="#how-it-works"
                  className="flex items-center gap-2 px-7 py-4 rounded-2xl border-2 border-[#E8DDD2] bg-white hover:bg-[#FFF7ED] text-[#292522] font-bold text-base transition-colors"
                >
                  Explore How It Works
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-[#E8DDD2] flex flex-wrap items-center gap-6 text-xs font-semibold text-[#3A332E]/80">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#27864B]" />
                  <span>Deterministic Slot Allocation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#27864B]" />
                  <span>Cryptographic QR Tickets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#27864B]" />
                  <span>Simulated Automated Barriers</span>
                </div>
              </div>

            </div>

            {/* Right Hero Photographic Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border-2 border-[#E8DDD2] shadow-2xl bg-[#FFFDF9] group">
                <img
                  src="https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=80"
                  alt="VR Nagpur Smart Parking Facility"
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Overlay live simulation card */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#292522] via-[#292522]/40 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#27864B] text-white text-xs font-bold w-fit mb-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    LIVE TELEMETRY STREAM • NAGPUR
                  </div>
                  <h3 className="font-display font-extrabold text-2xl text-white">VR Nagpur</h3>
                  <p className="text-xs text-white/80">Rambagh Layout, Untkhana • Levels 1 to 3 Open</p>

                  <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2">
                      <span className="block font-black text-lg text-[#F97316]">24</span>
                      <span className="text-[10px] text-white/70 uppercase font-semibold">Total Bays</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2">
                      <span className="block font-black text-lg text-[#27864B]">21</span>
                      <span className="text-[10px] text-white/70 uppercase font-semibold">Available</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2">
                      <span className="block font-black text-lg text-white">₹40</span>
                      <span className="text-[10px] text-white/70 uppercase font-semibold">Per Hour</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Quick Demo Badge */}
              <div className="absolute -bottom-6 -left-6 bg-[#FFFDF9] p-4 rounded-2xl border border-[#E8DDD2] shadow-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F97316] text-white flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#292522]">Instant Demo Accounts</p>
                  <p className="text-[11px] text-[#3A332E]/70">Pre-seeded driver & admin roles</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Illustrative Parking Statistics (Section 6) */}
      <section className="w-full px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-[#EA580C]">Platform Metrics</h2>
          <p className="font-display font-extrabold text-3xl text-[#292522] mt-1">Smart Urban Mobility at Scale</p>
          <p className="text-xs text-[#3A332E]/60 mt-1 italic">(Demo figures for college engineering evaluation)</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-[#FFF7ED] border border-[#E8DDD2] text-center space-y-1">
            <span className="font-display font-black text-4xl text-[#EA580C]">99.4%</span>
            <p className="font-bold text-sm text-[#292522]">Allocation Accuracy</p>
            <p className="text-xs text-[#3A332E]/70">Zero overlapping reservations</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FFF7ED] border border-[#E8DDD2] text-center space-y-1">
            <span className="font-display font-black text-4xl text-[#F97316]">&lt; 3 sec</span>
            <p className="font-bold text-sm text-[#292522]">Barrier Response</p>
            <p className="text-xs text-[#3A332E]/70">Automated QR verification</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FFF7ED] border border-[#E8DDD2] text-center space-y-1">
            <span className="font-display font-black text-4xl text-[#292522]">56+</span>
            <p className="font-bold text-sm text-[#292522]">Sensor Nodes</p>
            <p className="text-xs text-[#3A332E]/70">Active ultrasonic bay telemetry</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FFF7ED] border border-[#E8DDD2] text-center space-y-1">
            <span className="font-display font-black text-4xl text-[#27864B]">100%</span>
            <p className="font-bold text-sm text-[#292522]">Digital Audit Trail</p>
            <p className="text-xs text-[#3A332E]/70">Full vehicle event history</p>
          </div>
        </div>
      </section>

      {/* How It Works (4 Steps) */}
      <section id="how-it-works" className="w-full px-4 sm:px-6 lg:px-10 2xl:px-14 pt-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="px-3 py-1 rounded-full bg-[#EA580C]/10 text-[#EA580C] text-xs font-bold uppercase tracking-wider">
            Streamlined Journey
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-[#292522]">
            How ParkEase Operates
          </h2>
          <p className="text-[#3A332E]/80 text-base">
            From arrival to departure, every step is automated, auditable, and digitally connected.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Step 1 */}
          <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#EA580C] text-white font-display font-black text-xl flex items-center justify-center shadow-md shadow-[#EA580C]/20">
              01
            </div>
            <h3 className="font-display font-bold text-xl text-[#292522]">Search & Choose Bay</h3>
            <p className="text-sm text-[#3A332E]/80 leading-relaxed">
              Select your destination facility and vehicle category. Our deterministic allocation engine validates interval availability and assigns your bay.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#F97316] text-white font-display font-black text-xl flex items-center justify-center shadow-md shadow-[#F97316]/20">
              02
            </div>
            <h3 className="font-display font-bold text-xl text-[#292522]">Get Digital Ticket</h3>
            <p className="text-sm text-[#3A332E]/80 leading-relaxed">
              Receive a digital parking pass complete with cryptographic QR code, bay identifier, entry window, and transparent fee estimate.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#3A332E] text-[#F97316] font-display font-black text-xl flex items-center justify-center shadow-md">
              03
            </div>
            <h3 className="font-display font-bold text-xl text-[#292522]">Automated Entry</h3>
            <p className="text-sm text-[#3A332E]/80 leading-relaxed">
              Scan your pass at the entrance terminal. The simulated boom barrier lifts, your arrival timestamp is logged, and the slot switches to Occupied.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#27864B] text-white font-display font-black text-xl flex items-center justify-center shadow-md shadow-[#27864B]/20">
              04
            </div>
            <h3 className="font-display font-bold text-xl text-[#292522]">Frictionless Exit</h3>
            <p className="text-sm text-[#3A332E]/80 leading-relaxed">
              At departure, the exact duration is calculated down to the minute. Complete simulated settlement via UPI or Card, and the exit barrier opens.
            </p>
          </div>

        </div>
      </section>

      {/* Facilities Preview Section */}
      <section id="facilities" className="w-full px-4 sm:px-6 lg:px-10 2xl:px-14 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-[#EA580C]/10 text-[#EA580C] text-xs font-bold uppercase tracking-wider">
              Nagpur Network Coverage
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#292522] mt-2">
              Connected Nagpur Parking Hubs
            </h2>
          </div>
          <Link
            to="/find-parking"
            className="flex items-center gap-1.5 text-sm font-bold text-[#EA580C] hover:text-[#C2410C]"
          >
            Explore All 8 Nagpur Facilities <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {facilities.map(facility => (
            <div
              key={facility.id}
              className="rounded-3xl border border-[#E8DDD2] bg-[#FFFDF9] overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              <div>
                <div className="h-52 overflow-hidden relative">
                  <img
                    src={facility.image_url}
                    alt={facility.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#292522]/80 backdrop-blur-md text-white text-xs font-bold">
                    ₹{facility.hourly_rate} / hour
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-display font-bold text-xl text-[#292522] group-hover:text-[#EA580C] transition-colors">
                    {facility.name}
                  </h3>
                  <p className="text-xs text-[#3A332E]/70 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#F97316] shrink-0" />
                    {facility.address}, {facility.city}
                  </p>

                  <div className="pt-3 border-t border-[#E8DDD2] flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#3A332E]">
                      Capacity: <span className="text-[#292522] font-bold">{facility.total_slots} Slots</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#27864B]/10 text-[#27864B] font-bold">
                      {facility.available_slots !== undefined ? `${facility.available_slots} Available` : 'Open'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  to="/find-parking"
                  className="block w-full text-center py-2.5 rounded-xl border border-[#E8DDD2] bg-[#FFF7ED] hover:bg-[#F97316] hover:text-white text-[#EA580C] font-bold text-xs transition-colors"
                >
                  Reserve Slot Here
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Simulated IoT Sensor Telemetry Showcase */}
      <section id="sensor-telemetry" className="w-full px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#292522] text-[#FFFDF9] relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F97316]/20 text-[#F97316] text-xs font-bold uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5" />
                <span>Simulated IoT Ground Sensors</span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
                Live Bay Telemetry & Automatic Detection
              </h2>
              <p className="text-sm text-[#FFFDF9]/80 leading-relaxed">
                Each parking slot is mapped to a simulated ultrasonic ground node reporting millimeter-accurate distance, battery health, and occupancy triggers without requiring expensive physical sensor hardware for prototype evaluation.
              </p>
              
              <div className="pt-2 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2 bg-[#3A332E] px-4 py-2 rounded-xl border border-[#E8DDD2]/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27864B] animate-pulse" />
                  <span>Empty Bay: ~285 cm</span>
                </div>
                <div className="flex items-center gap-2 bg-[#3A332E] px-4 py-2 rounded-xl border border-[#E8DDD2]/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C83B32] animate-pulse" />
                  <span>Car Parked: &lt; 50 cm</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-[#3A332E] rounded-2xl border border-white/10 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#F97316]">
                Interactive Demonstration
              </span>
              <p className="text-xs text-center text-white/70">
                You can trigger virtual cars entering and leaving bays from the Admin IoT Telemetry panel to watch slot states update dynamically.
              </p>
              <button
                onClick={async () => {
                  await quickLogin('admin');
                  navigate('/admin/sensors');
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold text-xs shadow-md"
              >
                Open Sensor Telemetry Console
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="font-display font-black text-3xl sm:text-5xl text-[#292522]">
          Ready to Experience Modern Smart Parking?
        </h2>
        <p className="text-base text-[#3A332E]/80 max-w-xl mx-auto">
          Create a free prototype driver account or switch to the administrative operator dashboard to test the full lifecycle.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-bold text-base shadow-lg shadow-[#F97316]/20 transition-all"
          >
            Register Driver Account
          </Link>
          <button
            onClick={async () => {
              await quickLogin('user');
              navigate('/dashboard');
            }}
            className="px-8 py-4 rounded-2xl border-2 border-[#E8DDD2] bg-white hover:bg-[#FFF7ED] text-[#292522] font-bold text-base transition-colors"
          >
            Launch Demo Driver Dashboard
          </button>
        </div>
      </section>

    </div>
  );
};
