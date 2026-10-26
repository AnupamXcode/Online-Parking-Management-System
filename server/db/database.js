const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dbDir, 'parkease.db');
const db = new Database(dbPath);

// Enable WAL mode and foreign key constraints for integrity and concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plate_number TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('car', 'motorcycle', 'scooter', 'suv', 'ev')),
      model TEXT,
      color TEXT,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS parking_facilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Nagpur',
      category TEXT NOT NULL DEFAULT 'Shopping Mall',
      supported_vehicles TEXT NOT NULL DEFAULT 'Car, Motorcycle, Scooter, EV',
      floors_info TEXT DEFAULT 'Ground Floor, Level 1',
      total_slots INTEGER NOT NULL DEFAULT 0,
      hourly_rate REAL NOT NULL,
      image_url TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'maintenance')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS parking_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER NOT NULL REFERENCES parking_facilities(id) ON DELETE CASCADE,
      slot_number TEXT NOT NULL,
      floor TEXT NOT NULL,
      zone TEXT NOT NULL,
      compatible_category TEXT NOT NULL DEFAULT 'all',
      status TEXT DEFAULT 'available' CHECK(status IN ('available', 'reserved', 'occupied', 'out_of_service')),
      hourly_rate REAL NOT NULL,
      priority INTEGER DEFAULT 1,
      sensor_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(facility_id, slot_number)
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_reference TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      facility_id INTEGER NOT NULL REFERENCES parking_facilities(id),
      slot_id INTEGER NOT NULL REFERENCES parking_slots(id),
      vehicle_id INTEGER REFERENCES vehicles(id),
      vehicle_plate TEXT NOT NULL,
      vehicle_category TEXT NOT NULL,
      driver_name TEXT NOT NULL,
      driver_phone TEXT NOT NULL,
      start_time TEXT NOT NULL,
      expected_end_time TEXT NOT NULL,
      actual_entry_time TEXT,
      actual_exit_time TEXT,
      hourly_rate REAL NOT NULL,
      estimated_amount REAL NOT NULL,
      final_amount REAL,
      status TEXT DEFAULT 'reserved' CHECK(status IN ('reserved', 'checked_in', 'completed', 'cancelled')),
      qr_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicle_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER REFERENCES reservations(id),
      facility_id INTEGER NOT NULL,
      slot_id INTEGER NOT NULL,
      vehicle_plate TEXT NOT NULL,
      event_type TEXT NOT NULL CHECK(event_type IN ('entry', 'exit', 'booking_created', 'booking_cancelled')),
      barrier_status TEXT DEFAULT 'opened',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_reference TEXT UNIQUE NOT NULL,
      reservation_id INTEGER NOT NULL REFERENCES reservations(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL CHECK(payment_method IN ('UPI', 'Card', 'Wallet')),
      status TEXT DEFAULT 'success' CHECK(status IN ('success', 'failed', 'refunded')),
      demo_transaction_ref TEXT NOT NULL,
      tax_amount REAL NOT NULL,
      net_amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS smart_sensors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_id INTEGER UNIQUE REFERENCES parking_slots(id) ON DELETE CASCADE,
      sensor_code TEXT UNIQUE NOT NULL,
      sensor_type TEXT DEFAULT 'Ultrasonic Distance',
      battery_pct INTEGER DEFAULT 98,
      distance_cm INTEGER DEFAULT 280,
      occupancy_detected INTEGER DEFAULT 0,
      last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'online' CHECK(status IN ('online', 'offline'))
    );

    -- Create indexes for performance and query optimization
    CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_slot ON reservations(slot_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
    CREATE INDEX IF NOT EXISTS idx_reservations_times ON reservations(start_time, expected_end_time);
    CREATE INDEX IF NOT EXISTS idx_slots_facility ON parking_slots(facility_id);
    CREATE INDEX IF NOT EXISTS idx_slots_status ON parking_slots(status);
    CREATE INDEX IF NOT EXISTS idx_events_reservation ON vehicle_events(reservation_id);
    CREATE INDEX IF NOT EXISTS idx_payments_reservation ON payments(reservation_id);
  `);

  // Safe non-destructive column migrations for existing databases
  const facilityCols = db.prepare(`PRAGMA table_info(parking_facilities)`).all().map(c => c.name);
  if (!facilityCols.includes('category')) {
    db.exec(`ALTER TABLE parking_facilities ADD COLUMN category TEXT NOT NULL DEFAULT 'Shopping Mall'`);
  }
  if (!facilityCols.includes('supported_vehicles')) {
    db.exec(`ALTER TABLE parking_facilities ADD COLUMN supported_vehicles TEXT NOT NULL DEFAULT 'Car, Motorcycle, Scooter, EV'`);
  }
  if (!facilityCols.includes('floors_info')) {
    db.exec(`ALTER TABLE parking_facilities ADD COLUMN floors_info TEXT DEFAULT 'Ground Floor, Level 1'`);
  }
}

// Execute initial schema
initSchema();

module.exports = {
  db,
  initSchema
};
