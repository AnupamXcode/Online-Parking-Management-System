import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api';
import { SmartSensor } from '../../types';
import { 
  Sparkles, 
  Activity, 
  Cpu, 
  Battery, 
  Wifi, 
  Radio, 
  CheckCircle2, 
  AlertCircle,
  Car,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const AdminSensorsPage: React.FC = () => {
  const [sensors, setSensors] = useState<SmartSensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facilityFilter, setFacilityFilter] = useState<string>('all');

  const fetchSensors = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/sensors');
      setSensors(data.sensors || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
  }, []);

  const handleSimulateToggle = async (sensorId: number) => {
    setMessage(null);
    setError(null);

    try {
      const res = await apiRequest('/sensors/simulate-toggle', {
        method: 'POST',
        body: JSON.stringify({ sensor_id: sensorId })
      });
      setMessage(res.message);
      await fetchSensors();
    } catch (err: any) {
      setError(err.message || 'Simulation trigger failed.');
    }
  };

  const facilities = Array.from(new Set(sensors.map(s => s.facility_name))).filter(Boolean);

  const filteredSensors = facilityFilter === 'all'
    ? sensors
    : sensors.filter(s => s.facility_name === facilityFilter);

  const totalOccupied = sensors.filter(s => s.occupancy_detected === 1).length;
  const totalEmpty = sensors.length - totalOccupied;

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 2xl:px-14 py-8 space-y-8 min-h-[calc(100vh-5rem)]">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD2]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EA580C]/10 text-[#EA580C] text-xs font-bold uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Simulated IoT Ground Mesh</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#292522]">
            IoT Ultrasonic <span className="text-[#F97316]">Sensor Telemetry</span>
          </h1>
          <p className="text-xs text-[#3A332E]/70 mt-1">
            Real-time simulated ultrasound node telemetry: distance in centimeters, battery health, and interactive bay triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSensors}
            className="px-4 py-2 rounded-xl bg-[#292522] hover:bg-[#3A332E] text-white text-xs font-bold transition-colors shadow-xs"
          >
            Poll Node Status
          </button>
        </div>
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

      {/* Sensor Mesh Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A332E]/60 block">Monitored Ground Nodes</span>
          <span className="font-display font-black text-3xl text-[#292522]">{sensors.length}</span>
          <p className="text-[11px] text-[#27864B] font-bold">100% Online Heartbeat</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A332E]/60 block">Vehicle Present (&lt;50 cm)</span>
          <span className="font-display font-black text-3xl text-[#C83B32]">{totalOccupied}</span>
          <p className="text-[11px] text-[#3A332E]/70">Ultrasonic reflection confirmed</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A332E]/60 block">Bay Clear (~285 cm)</span>
          <span className="font-display font-black text-3xl text-[#27864B]">{totalEmpty}</span>
          <p className="text-[11px] text-[#3A332E]/70">Open for allocation</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A332E]/60 block">Average Battery</span>
          <span className="font-display font-black text-3xl text-[#EA580C]">96%</span>
          <p className="text-[11px] text-[#3A332E]/70">LiFePO4 Solar harvest cell</p>
        </div>
      </div>

      {/* Facility Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFacilityFilter('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            facilityFilter === 'all'
              ? 'bg-[#292522] text-[#F97316]'
              : 'bg-[#FFFDF9] border border-[#E8DDD2] text-[#3A332E] hover:bg-[#FFF7ED]'
          }`}
        >
          All Facilities ({sensors.length})
        </button>
        {facilities.map(name => (
          <button
            key={name}
            onClick={() => setFacilityFilter(name!)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              facilityFilter === name
                ? 'bg-[#292522] text-[#F97316]'
                : 'bg-[#FFFDF9] border border-[#E8DDD2] text-[#3A332E] hover:bg-[#FFF7ED]'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Sensors Grid */}
      {loading ? (
        <div className="p-20 text-center rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2]">
          <div className="w-8 h-8 rounded-full border-2 border-[#F97316] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-[#3A332E]">Querying ultrasonic node mesh...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSensors.map(sensor => {
            const isOccupied = sensor.occupancy_detected === 1;

            return (
              <div
                key={sensor.id}
                className={`p-5 rounded-3xl border bg-[#FFFDF9] shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                  isOccupied
                    ? 'border-[#C83B32]/40 bg-[#FFFDF9]'
                    : 'border-[#27864B]/30'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Top: Node Code & Online status */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#EA580C] text-[11px]">
                      {sensor.sensor_code}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#27864B]">
                      <span className="w-2 h-2 rounded-full bg-[#27864B] animate-pulse" />
                      {sensor.status}
                    </span>
                  </div>

                  {/* Bay & Floor info */}
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-black text-3xl text-[#292522]">
                        Bay {sensor.slot_number}
                      </span>
                      <span className="text-xs text-[#3A332E]/70 font-semibold">({sensor.floor})</span>
                    </div>
                    <p className="text-[11px] text-[#3A332E]/60 truncate mt-0.5">{sensor.facility_name}</p>
                  </div>

                  {/* Telemetry reading box */}
                  <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                    isOccupied 
                      ? 'bg-[#C83B32]/10 border-[#C83B32]/20 text-[#C83B32]' 
                      : 'bg-[#27864B]/10 border-[#27864B]/20 text-[#27864B]'
                  }`}>
                    <div className="flex justify-between font-bold">
                      <span>Occupancy Echo:</span>
                      <span className="uppercase">{isOccupied ? 'CAR DETECTED' : 'BAY EMPTY'}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Ultrasonic Distance:</span>
                      <span className="font-mono font-black">{sensor.distance_cm} cm</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Battery Cell:</span>
                      <span className="font-mono">{sensor.battery_pct}%</span>
                    </div>
                  </div>

                </div>

                {/* Simulated trigger action button */}
                <div className="pt-2 border-t border-[#E8DDD2]">
                  <button
                    onClick={() => handleSimulateToggle(sensor.id)}
                    className="w-full py-2 px-3 rounded-xl bg-[#292522] hover:bg-[#3A332E] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Car className="w-3.5 h-3.5 text-[#F97316]" />
                    {isOccupied ? 'Simulate Vehicle Leaving' : 'Simulate Car Parking'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
