export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Vehicle {
  id: number;
  user_id: number;
  plate_number: string;
  category: 'car' | 'motorcycle' | 'scooter' | 'suv' | 'ev';
  model?: string;
  color?: string;
  is_default: number;
  created_at: string;
}

export interface ParkingFacility {
  id: number;
  name: string;
  address: string;
  city: string;
  total_slots: number;
  available_slots?: number;
  occupied_slots?: number;
  reserved_slots?: number;
  out_of_service_slots?: number;
  category?: 'Shopping Mall' | 'Supermarket' | string;
  supported_vehicles?: string;
  floors_info?: string;
  hourly_rate: number;
  image_url?: string;
  status: 'active' | 'maintenance';
  created_at: string;
}

export interface ParkingSlot {
  id: number;
  facility_id: number;
  slot_number: string;
  floor: string;
  zone: string;
  compatible_category: string;
  status: 'available' | 'reserved' | 'occupied' | 'out_of_service';
  interval_status?: 'available' | 'reserved' | 'occupied' | 'out_of_service';
  hourly_rate: number;
  priority: number;
  sensor_id?: string;
  sensor_code?: string;
  distance_cm?: number;
  sensor_occupancy?: number;
  sensor_battery?: number;
  sensor_status?: string;
}

export interface Reservation {
  id: number;
  booking_reference: string;
  user_id: number;
  facility_id: number;
  slot_id: number;
  vehicle_id?: number;
  vehicle_plate: string;
  vehicle_category: string;
  driver_name: string;
  driver_phone: string;
  start_time: string;
  expected_end_time: string;
  actual_entry_time?: string;
  actual_exit_time?: string;
  hourly_rate: number;
  estimated_amount: number;
  final_amount?: number;
  status: 'reserved' | 'checked_in' | 'completed' | 'cancelled';
  qr_data?: string;
  created_at: string;
  facility_name?: string;
  facility_address?: string;
  slot_number?: string;
  slot_floor?: string;
  slot_zone?: string;
  user_name?: string;
  user_email?: string;
}

export interface Payment {
  id: number;
  payment_reference: string;
  reservation_id: number;
  user_id: number;
  amount: number;
  payment_method: 'UPI' | 'Card' | 'Wallet';
  status: 'success' | 'failed' | 'refunded';
  demo_transaction_ref: string;
  tax_amount: number;
  net_amount: number;
  created_at: string;
  booking_reference?: string;
  vehicle_plate?: string;
  facility_name?: string;
  slot_number?: string;
}

export interface VehicleEvent {
  id: number;
  reservation_id?: number;
  facility_id: number;
  slot_id: number;
  vehicle_plate: string;
  event_type: 'entry' | 'exit' | 'booking_created' | 'booking_cancelled';
  barrier_status: string;
  notes?: string;
  created_at: string;
  facility_name?: string;
  slot_number?: string;
  driver_name?: string;
  booking_reference?: string;
}

export interface SmartSensor {
  id: number;
  slot_id: number;
  sensor_code: string;
  sensor_type: string;
  battery_pct: number;
  distance_cm: number;
  occupancy_detected: number;
  last_heartbeat: string;
  status: 'online' | 'offline';
  slot_number?: string;
  floor?: string;
  zone?: string;
  facility_id?: number;
  facility_name?: string;
  slot_status?: string;
}
