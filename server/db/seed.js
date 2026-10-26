const bcrypt = require('bcryptjs');
const { db, initSchema } = require('./database');

async function seed() {
  console.log('[SEED] Initializing database schema...');
  initSchema();

  // Clear existing records cleanly in dependency order
  db.exec(`
    DELETE FROM payments;
    DELETE FROM vehicle_events;
    DELETE FROM reservations;
    DELETE FROM smart_sensors;
    DELETE FROM parking_slots;
    DELETE FROM parking_facilities;
    DELETE FROM vehicles;
    DELETE FROM users;
    DELETE FROM sqlite_sequence;
  `);

  console.log('[SEED] Seeding users...');
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('AdminPass123!', salt);
  const userHash = bcrypt.hashSync('UserPass123!', salt);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, phone, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  const adminResult = insertUser.run('ParkEase Administrator', 'admin@parkease.com', '+91 9876543210', adminHash, 'admin');
  const userResult = insertUser.run('Anupam Shrivastava', 'anupam@example.com', '+91 9123456780', userHash, 'user');

  const userId = userResult.lastInsertRowid;
  const adminId = adminResult.lastInsertRowid;

  console.log('[SEED] Seeding user vehicles with Nagpur RTO plates (MH-31 / MH-49)...');
  const insertVehicle = db.prepare(`
    INSERT INTO vehicles (user_id, plate_number, category, model, color, is_default)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const carVehicle = insertVehicle.run(userId, 'MH-31-EQ-4092', 'car', 'Honda City i-VTEC', 'Pearl Warm White', 1);
  const bikeVehicle = insertVehicle.run(userId, 'MH-31-BZ-7821', 'motorcycle', 'Royal Enfield Hunter 350', 'Dapper Ash', 0);
  const scooterVehicle = insertVehicle.run(userId, 'MH-49-SB-1104', 'scooter', 'Ather 450X Gen 3', 'Space Grey', 0);

  console.log('[SEED] Seeding 8 Nagpur parking facilities...');
  const insertFacility = db.prepare(`
    INSERT INTO parking_facilities (name, address, city, category, supported_vehicles, floors_info, total_slots, hourly_rate, image_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const facilitiesData = [
    {
      name: 'VR Nagpur',
      address: 'Rambagh Layout, Untkhana, Nagpur, Maharashtra 440003',
      city: 'Nagpur',
      category: 'Shopping Mall',
      supported_vehicles: 'Car, Motorcycle, Scooter, EV',
      floors_info: 'Ground Floor, Level 1, Level 2',
      total_slots: 24,
      hourly_rate: 40.0,
      image_url: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=80',
      status: 'active'
    },
    {
      name: 'Empress Mall',
      address: 'Empress City, Cotton Market, Nagpur, Maharashtra 440018',
      city: 'Nagpur',
      category: 'Shopping Mall',
      supported_vehicles: 'Car, Motorcycle, Scooter, EV',
      floors_info: 'Lower Ground, Ground Floor',
      total_slots: 20,
      hourly_rate: 35.0,
      image_url: 'https://images.unsplash.com/photo-1567449303183-ae0d6ed1498e?auto=format&fit=crop&w=1200&q=80',
      status: 'active'
    },
    {
      name: 'Eternity Mall',
      address: 'Variety Square, Sitabuldi, Nagpur, Maharashtra 440012',
      city: 'Nagpur',
      category: 'Shopping Mall',
      supported_vehicles: 'Car, Motorcycle, Scooter',
      floors_info: 'Basement 1, Ground Floor',
      total_slots: 20,
      hourly_rate: 30.0,
      image_url: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1200&q=80',
      status: 'active'
    },
    {
      name: 'Glocal Square Mall',
      address: 'Abhyankar Marg, Sitabuldi, Nagpur, Maharashtra 440012',
      city: 'Nagpur',
      category: 'Shopping Mall',
      supported_vehicles: 'Car, Motorcycle, Scooter, EV',
      floors_info: 'Level 1, Level 2',
      total_slots: 20,
      hourly_rate: 35.0,
      image_url: 'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?auto=format&fit=crop&w=1200&q=80',
      status: 'active'
    },
    {
      name: 'Orange City Mall',
      address: 'Sita Nagar Road, Somalwada, Nagpur, Maharashtra 440025',
      city: 'Nagpur',
      category: 'Shopping Mall',
      supported_vehicles: 'Car, Motorcycle, Scooter',
      floors_info: 'Ground Floor, Upper Deck',
      total_slots: 16,
      hourly_rate: 30.0,
      image_url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80',
      status: 'active'
    },
    {
      name: 'DMart Hingna',
      address: 'Hingna Road, Wanadongri, Nagpur, Maharashtra 441110',
      city: 'Nagpur',
      category: 'Supermarket',
      supported_vehicles: 'Car, Motorcycle, Scooter',
      floors_info: 'Ground Express Bay, Rear Bay',
      total_slots: 16,
      hourly_rate: 20.0,
      image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
      status: 'active'
    },
    {
      name: 'DMart Beltarodi',
      address: 'Besa–Beltarodi Road, Nagpur region, 440037',
      city: 'Nagpur',
      category: 'Supermarket',
      supported_vehicles: 'Car, Motorcycle, Scooter, EV',
      floors_info: 'Ground Level, P1 Deck',
      total_slots: 16,
      hourly_rate: 20.0,
      image_url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1200&q=80',
      status: 'active'
    },
    {
      name: 'DMart Kamptee Road',
      address: 'Automotive Square, Nagpur, Maharashtra 440002',
      city: 'Nagpur',
      category: 'Supermarket',
      supported_vehicles: 'Car, Motorcycle, Scooter',
      floors_info: 'Ground Level, North Wing',
      total_slots: 16,
      hourly_rate: 20.0,
      image_url: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=1200&q=80',
      status: 'active'
    }
  ];

  const facilityIds = [];
  for (const fac of facilitiesData) {
    const res = insertFacility.run(
      fac.name,
      fac.address,
      fac.city,
      fac.category,
      fac.supported_vehicles,
      fac.floors_info,
      fac.total_slots,
      fac.hourly_rate,
      fac.image_url,
      fac.status
    );
    facilityIds.push({ id: res.lastInsertRowid, ...fac });
  }

  console.log('[SEED] Seeding parking slots and smart IoT sensors for all 8 facilities...');
  const insertSlot = db.prepare(`
    INSERT INTO parking_slots (facility_id, slot_number, floor, zone, compatible_category, status, hourly_rate, priority, sensor_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSensor = db.prepare(`
    INSERT INTO smart_sensors (slot_id, sensor_code, sensor_type, battery_pct, distance_cm, occupancy_detected, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // We will store slot IDs for facility 1 (VR Nagpur) to seed demo bookings
  const vrNagpurSlots = [];

  for (let idx = 0; idx < facilityIds.length; idx++) {
    const fac = facilityIds[idx];
    const facCode = fac.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase();
    
    // Divide slots across 2 or 3 floors
    const totalSlots = fac.total_slots;
    const floorList = fac.floors_info.split(',').map(s => s.trim());
    const slotsPerFloor = Math.ceil(totalSlots / floorList.length);

    let slotCounter = 1;
    for (let fIdx = 0; fIdx < floorList.length; fIdx++) {
      const floorName = floorList[fIdx];
      const zoneLetter = String.fromCharCode(65 + fIdx); // 'A', 'B', 'C'
      
      for (let i = 1; i <= slotsPerFloor; i++) {
        if (slotCounter > totalSlots) break;
        const slotNum = `${zoneLetter}${String(i).padStart(2, '0')}`;
        
        // Assign compatibility
        let compat = 'car';
        if (i % 6 === 0) compat = 'motorcycle';
        else if (i % 8 === 0) compat = 'scooter';
        else if (i % 7 === 0) compat = 'ev';

        const res = insertSlot.run(
          fac.id,
          slotNum,
          floorName,
          `Zone ${zoneLetter}`,
          compat,
          'available',
          fac.hourly_rate,
          slotCounter,
          `US-F${fac.id}-${slotNum}`
        );
        const slotId = res.lastInsertRowid;

        insertSensor.run(
          slotId,
          `SEN-F${fac.id}-${slotNum}`,
          'Ultrasonic Distance',
          92 + ((slotCounter * 3) % 8),
          285,
          0,
          'online'
        );

        if (idx === 0) {
          vrNagpurSlots.push({ slotId, slotNum });
        }
        slotCounter++;
      }
    }
  }

  console.log('[SEED] Seeding realistic demo bookings & parking events for VR Nagpur...');
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString();
  const twoHoursAhead = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
  const fourHoursAhead = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();

  const vrFac = facilityIds[0];

  // 1. One active checked-in booking on A01
  const slotA01 = vrNagpurSlots[0];
  const booking1Ref = 'PE-2026-NAG401';
  const res1 = db.prepare(`
    INSERT INTO reservations (
      booking_reference, user_id, facility_id, slot_id, vehicle_id,
      vehicle_plate, vehicle_category, driver_name, driver_phone,
      start_time, expected_end_time, actual_entry_time, hourly_rate,
      estimated_amount, status, qr_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'checked_in', ?)
  `).run(
    booking1Ref, userId, vrFac.id, slotA01.slotId, carVehicle.lastInsertRowid,
    'MH-31-EQ-4092', 'car', 'Anupam Shrivastava', '+91 9123456780',
    twoHoursAgo, twoHoursAhead, twoHoursAgo, 40.0, 160.0,
    JSON.stringify({ ref: booking1Ref, plate: 'MH-31-EQ-4092', slot: 'A01', facility: 'VR Nagpur' })
  );

  // Mark slot A01 as occupied and sensor as triggered
  db.prepare(`UPDATE parking_slots SET status = 'occupied' WHERE id = ?`).run(slotA01.slotId);
  db.prepare(`UPDATE smart_sensors SET occupancy_detected = 1, distance_cm = 45 WHERE slot_id = ?`).run(slotA01.slotId);
  db.prepare(`
    INSERT INTO vehicle_events (reservation_id, facility_id, slot_id, vehicle_plate, event_type, barrier_status, notes)
    VALUES (?, ?, ?, 'MH-31-EQ-4092', 'entry', 'opened', 'Vehicle entered through automated boom barrier Gate 1 at VR Nagpur')
  `).run(res1.lastInsertRowid, vrFac.id, slotA01.slotId);

  // 2. One upcoming reserved booking on A02
  const slotA02 = vrNagpurSlots[1];
  const booking2Ref = 'PE-2026-NAG402';
  db.prepare(`
    INSERT INTO reservations (
      booking_reference, user_id, facility_id, slot_id, vehicle_id,
      vehicle_plate, vehicle_category, driver_name, driver_phone,
      start_time, expected_end_time, hourly_rate, estimated_amount, status, qr_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'reserved', ?)
  `).run(
    booking2Ref, userId, vrFac.id, slotA02.slotId, bikeVehicle.lastInsertRowid,
    'MH-31-BZ-7821', 'motorcycle', 'Anupam Shrivastava', '+91 9123456780',
    twoHoursAhead, fourHoursAhead, 40.0, 80.0,
    JSON.stringify({ ref: booking2Ref, plate: 'MH-31-BZ-7821', slot: 'A02', facility: 'VR Nagpur' })
  );
  db.prepare(`UPDATE parking_slots SET status = 'reserved' WHERE id = ?`).run(slotA02.slotId);

  // 3. One completed booking with payment on B01
  const slotB01 = vrNagpurSlots[8];
  const booking3Ref = 'PE-2026-NAG309';
  const res3 = db.prepare(`
    INSERT INTO reservations (
      booking_reference, user_id, facility_id, slot_id, vehicle_id,
      vehicle_plate, vehicle_category, driver_name, driver_phone,
      start_time, expected_end_time, actual_entry_time, actual_exit_time,
      hourly_rate, estimated_amount, final_amount, status, qr_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)
  `).run(
    booking3Ref, userId, vrFac.id, slotB01.slotId, carVehicle.lastInsertRowid,
    'MH-31-EQ-4092', 'car', 'Anupam Shrivastava', '+91 9123456780',
    twoHoursAgo, oneHourAgo, twoHoursAgo, oneHourAgo,
    40.0, 80.0, 94.4,
    JSON.stringify({ ref: booking3Ref, plate: 'MH-31-EQ-4092', slot: 'B01', facility: 'VR Nagpur' })
  );

  // Add payment for booking 3
  db.prepare(`
    INSERT INTO payments (
      payment_reference, reservation_id, user_id, amount,
      payment_method, status, demo_transaction_ref, tax_amount, net_amount
    ) VALUES (?, ?, ?, ?, 'UPI', 'success', ?, ?, ?)
  `).run(
    'PAY-PE-884210', res3.lastInsertRowid, userId, 94.4,
    'UPI-DEMO-TXN-998821', 14.4, 80.0
  );

  db.prepare(`
    INSERT INTO vehicle_events (reservation_id, facility_id, slot_id, vehicle_plate, event_type, barrier_status, notes)
    VALUES (?, ?, ?, 'MH-31-EQ-4092', 'exit', 'opened', 'Vehicle exited through Exit Barrier Gate A at VR Nagpur; demo payment settled')
  `).run(res3.lastInsertRowid, vrFac.id, slotB01.slotId);

  // 4. Mark slot A08 out of service for demo maintenance visibility
  const slotA08 = vrNagpurSlots[7];
  db.prepare(`UPDATE parking_slots SET status = 'out_of_service' WHERE id = ?`).run(slotA08.slotId);

  console.log('[SEED] Database successfully seeded with 8 Nagpur facilities, slots, smart sensors, users, and demo reservations!');
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
