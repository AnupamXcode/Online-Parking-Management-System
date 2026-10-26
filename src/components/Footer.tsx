import React from 'react';
import { Car, Shield, Sparkles, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FFF7ED] border-t border-[#E8DDD2] mt-20 pt-16 pb-12 text-[#3A332E] w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#E8DDD2]">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F97316] text-white flex items-center justify-center shadow-md">
                <Car className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-display font-extrabold text-2xl text-[#292522]">Park<span className="text-[#F97316]">Ease</span></span>
            </div>
            <p className="text-sm text-[#3A332E]/80 leading-relaxed">
              Smart Parking Management System featuring real-time bay allocation, IoT ultrasonic sensor telemetry, automated barrier control, and frictionless digital checkout.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#27864B]/10 text-[#27864B] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#27864B] animate-pulse"></span>
              All Simulated Nodes Online
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-[#292522] mb-4">Driver Portal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/find-parking" className="hover:text-[#F97316] transition-colors">Find & Reserve Bays</Link></li>
              <li><Link to="/bookings" className="hover:text-[#F97316] transition-colors">My Active Passes</Link></li>
              <li><Link to="/vehicle-entry" className="hover:text-[#F97316] transition-colors">Gate Entry Terminal</Link></li>
              <li><Link to="/vehicle-exit" className="hover:text-[#F97316] transition-colors">Gate Exit & Settle</Link></li>
              <li><Link to="/vehicles" className="hover:text-[#F97316] transition-colors">Vehicle Directory</Link></li>
            </ul>
          </div>

          {/* Operator Links */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-[#292522] mb-4">Operations</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/admin" className="hover:text-[#F97316] transition-colors">Command Center</Link></li>
              <li><Link to="/admin/slots" className="hover:text-[#F97316] transition-colors">Slot Grid Manager</Link></li>
              <li><Link to="/admin/sensors" className="hover:text-[#F97316] transition-colors">IoT Sensor Telemetry</Link></li>
              <li><Link to="/admin/logs" className="hover:text-[#F97316] transition-colors">Barrier Audit Logs</Link></li>
              <li><Link to="/admin/payments" className="hover:text-[#F97316] transition-colors">Revenue & Invoices</Link></li>
            </ul>
          </div>

          {/* Technical Specs */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-[#292522] mb-4">Architecture</h4>
            <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#E8DDD2] space-y-2 text-xs">
              <div className="flex justify-between pb-1.5 border-b border-[#E8DDD2]/60">
                <span className="text-[#3A332E]/70">Engine</span>
                <span className="font-mono font-semibold text-[#292522]">Node.js Express REST</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-[#E8DDD2]/60">
                <span className="text-[#3A332E]/70">Database</span>
                <span className="font-mono font-semibold text-[#292522]">SQLite WAL + ACID</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-[#E8DDD2]/60">
                <span className="text-[#3A332E]/70">Frontend</span>
                <span className="font-mono font-semibold text-[#292522]">React 19 + Vite</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3A332E]/70">Color System</span>
                <span className="font-mono font-semibold text-[#EA580C]">Orange & Charcoal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#3A332E]/70 gap-4">
          <p>© 2026 ParkEase — Smart Parking Management System. College Engineering Prototype.</p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#F97316]" />
              Role-Based JWT Security
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
              Zero Physical Sensor Required Simulation
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
