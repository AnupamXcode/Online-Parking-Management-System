import React from 'react';
import { ShieldCheck, AlertCircle, ArrowUpRight } from 'lucide-react';

interface GateBarrierAnimationProps {
  isOpen: boolean;
  gateType?: 'entry' | 'exit';
  facilityName?: string;
}

export const GateBarrierAnimation: React.FC<GateBarrierAnimationProps> = ({
  isOpen,
  gateType = 'entry',
  facilityName = 'VR Nagpur'
}) => {
  return (
    <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD2] p-6 shadow-xs overflow-hidden">
      
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8DDD2] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C] animate-pulse" />
          <span className="font-bold text-[#292522] uppercase tracking-wider">
            Simulated Automated Boom Barrier • {gateType.toUpperCase()} GATE
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-md bg-[#F4F0EB] font-mono text-[11px] text-[#3A332E]/70">
          Hardware Simulation Active
        </span>
      </div>

      {/* Barrier Canvas / Illustration */}
      <div className="relative h-64 bg-gradient-to-b from-[#F4F0EB] to-[#FFF7ED] rounded-2xl border border-[#E8DDD2] mt-4 flex items-end justify-center overflow-hidden px-6 pb-6">
        
        {/* Background Facility Silhouette */}
        <div className="absolute top-4 left-6 text-left">
          <p className="text-xs font-bold text-[#3A332E]/80">{facilityName}</p>
          <p className="text-[11px] text-[#3A332E]/50 font-mono">Lane 01 — Optical LPR & RFID Zone</p>
        </div>

        {/* Road Surface */}
        <div className="absolute bottom-0 w-full h-12 bg-[#292522] flex items-center justify-center">
          <div className="w-full border-b border-dashed border-[#F97316]/50 mx-4" />
        </div>

        {/* Vehicle Induction Loop on Road */}
        <div className="absolute bottom-1 w-48 h-8 rounded-lg border-2 border-[#EA580C]/40 bg-[#EA580C]/10 flex items-center justify-center">
          <span className="text-[9px] font-mono font-bold text-[#F97316] tracking-widest uppercase">
            Induction Loop Sensor
          </span>
        </div>

        {/* Gate Mechanism Unit */}
        <div className="relative z-10 flex items-end mr-24">
          {/* Main Housing Post */}
          <div className="w-14 h-32 rounded-t-xl bg-[#3A332E] border-2 border-[#292522] shadow-lg flex flex-col items-center justify-between py-3 relative">
            
            {/* Traffic Signal Lights on Post */}
            <div className="flex flex-col gap-2 p-1.5 rounded-lg bg-[#292522] border border-[#E8DDD2]/20">
              {/* Red Light */}
              <div 
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  !isOpen 
                    ? 'bg-[#C83B32] shadow-[0_0_12px_#C83B32]' 
                    : 'bg-[#C83B32]/20'
                }`} 
              />
              {/* Green Light */}
              <div 
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  isOpen 
                    ? 'bg-[#27864B] shadow-[0_0_12px_#27864B]' 
                    : 'bg-[#27864B]/20'
                }`} 
              />
            </div>

            {/* Pivot Motor Hub */}
            <div className="w-8 h-8 rounded-full bg-[#EA580C] border-2 border-white flex items-center justify-center shadow-md">
              <div className="w-2 h-2 rounded-full bg-[#292522]" />
            </div>

            {/* Barrier Pole Arm */}
            <div
              className="absolute left-6 bottom-4 origin-bottom-left transition-transform duration-700 ease-out"
              style={{
                transform: isOpen ? 'rotate(-80deg)' : 'rotate(0deg)'
              }}
            >
              <div className="w-64 h-4 rounded-r-md border border-[#C2410C] shadow-md flex overflow-hidden bg-white">
                {/* Diagonal hazard stripes (orange and white) */}
                <div 
                  className="w-full h-full" 
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #F97316, #F97316 12px, #FFFDF9 12px, #FFFDF9 24px)'
                  }} 
                />
              </div>
            </div>

          </div>
        </div>

        {/* Right Barrier Stand Catch */}
        <div className="absolute right-12 bottom-0 w-8 h-18 bg-[#3A332E] rounded-t-md border border-[#292522] z-10 opacity-70" />

      </div>

      {/* State Status Banner */}
      <div className="mt-4 flex items-center justify-between p-3.5 rounded-xl border border-[#E8DDD2] bg-[#FFF7ED]">
        <div className="flex items-center gap-2.5">
          {isOpen ? (
            <div className="w-8 h-8 rounded-full bg-[#27864B]/10 text-[#27864B] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#C83B32]/10 text-[#C83B32] flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-[#292522]">
              {isOpen ? 'BARRIER LIFTED — GREEN SIGNAL' : 'BARRIER DOWN — RED SIGNAL'}
            </p>
            <p className="text-[11px] text-[#3A332E]/70">
              {isOpen 
                ? 'Authorization confirmed. Vehicle may safely proceed into bay.' 
                : 'Awaiting verified reservation ID or settled exit clearance.'}
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
          isOpen ? 'bg-[#27864B] text-white' : 'bg-[#C83B32] text-white'
        }`}>
          {isOpen ? 'ACCESS GRANTED' : 'STOP'}
        </span>
      </div>

    </div>
  );
};
