const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Protect all admin routes with authentication and requireAdmin middleware
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/overview - High-level operational KPIs and telemetry
router.get('/overview', (req, res) => {
  const totalFacilities = db.prepare('SELECT COUNT(*) as count FROM parking_facilities').get().count;
  const slotCounts = db.prepare(`
    SELECT
      COUNT(*) as total_slots,
      SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
      SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
      SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved,
      SUM(CASE WHEN status = 'out_of_service' THEN 1 ELSE 0 END) as out_of_service
    FROM parking_slots
  `).get();

  const activeBookings = db.prepare(`
    SELECT COUNT(*) as count FROM reservations WHERE status IN ('reserved', 'checked_in')
  `).get().count;

  const revenueStats = db.prepare(`
    SELECT 
      COALESCE(SUM(amount), 0) as total_revenue,
      COALESCE(SUM(tax_amount), 0) as total_tax,
      COUNT(*) as total_transactions
    FROM payments WHERE status = 'success'
  `).get();

  const recentEvents = db.prepare(`
    SELECT e.*, 
      f.name as facility_name, 
      s.slot_number
    FROM vehicle_events e
    JOIN parking_facilities f ON f.id = e.facility_id
    JOIN parking_slots s ON s.id = e.slot_id
    ORDER BY e.id DESC
    LIMIT 10
  `).all();

  const facilityBreakdown = db.prepare(`
    SELECT f.id, f.name, f.city, f.hourly_rate,
      COUNT(s.id) as total_slots,
      SUM(CASE WHEN s.status = 'available' THEN 1 ELSE 0 END) as available,
      SUM(CASE WHEN s.status = 'occupied' THEN 1 ELSE 0 END) as occupied,
      SUM(CASE WHEN s.status = 'reserved' THEN 1 ELSE 0 END) as reserved,
      SUM(CASE WHEN s.status = 'out_of_service' THEN 1 ELSE 0 END) as out_of_service
    FROM parking_facilities f
    LEFT JOIN parking_slots s ON s.facility_id = f.id
    GROUP BY f.id
  `).all();

  res.json({
    kpis: {
      totalFacilities,
      totalSlots: slotCounts.total_slots || 0,
      availableSlots: slotCounts.available || 0,
      occupiedSlots: slotCounts.occupied || 0,
      reservedSlots: slotCounts.reserved || 0,
      outOfServiceSlots: slotCounts.out_of_service || 0,
      activeBookings,
      totalRevenue: revenueStats.total_revenue,
      totalTransactions: revenueStats.total_transactions
    },
    recentEvents,
    facilityBreakdown
  });
});

// GET /api/admin/reservations - Full reservation records
router.get('/reservations', (req, res) => {
  const { status, search } = req.query;

  let query = `
    SELECT r.*,
      f.name as facility_name,
      s.slot_number, s.floor,
      u.name as user_name, u.email as user_email
    FROM reservations r
    JOIN parking_facilities f ON f.id = r.facility_id
    JOIN parking_slots s ON s.id = r.slot_id
    JOIN users u ON u.id = r.user_id
    WHERE 1=1
  `;
  const params = [];

  if (status && status !== 'all') {
    query += ` AND r.status = ?`;
    params.push(status);
  }

  if (search && search.trim()) {
    query += ` AND (r.booking_reference LIKE ? OR r.vehicle_plate LIKE ? OR u.name LIKE ? OR u.email LIKE ?)`;
    const s = `%${search.trim()}%`;
    params.push(s, s, s, s);
  }

  query += ` ORDER BY r.id DESC`;

  const reservations = db.prepare(query).all(...params);
  res.json({ reservations });
});

// GET /api/admin/users - List all users
router.get('/users', (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
      (SELECT COUNT(*) FROM reservations WHERE user_id = u.id) as booking_count,
      (SELECT COUNT(*) FROM vehicles WHERE user_id = u.id) as vehicle_count
    FROM users u
    ORDER BY u.id ASC
  `).all();

  res.json({ users });
});

// PUT /api/admin/users/:id/role - Update user role
router.put('/users/:id/role', (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: "Role must be 'user' or 'admin'." });
  }

  if (Number(req.params.id) === req.user.id && role !== 'admin') {
    return res.status(400).json({ error: 'You cannot revoke your own administrator privileges.' });
  }

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  const updatedUser = db.prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?').get(req.params.id);

  res.json({ message: 'User role updated successfully.', user: updatedUser });
});

// Facilities Management CRUD
// POST /api/admin/facilities
router.post('/facilities', (req, res) => {
  const { name, address, city, hourly_rate, image_url, category, supported_vehicles, floors_info } = req.body;

  if (!name || !address || !hourly_rate) {
    return res.status(400).json({ error: 'Name, address, and hourly rate are required.' });
  }

  const result = db.prepare(`
    INSERT INTO parking_facilities (name, address, city, category, supported_vehicles, floors_info, hourly_rate, image_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(
    name.trim(),
    address.trim(),
    (city && city.trim()) || 'Nagpur',
    (category && category.trim()) || 'Shopping Mall',
    (supported_vehicles && supported_vehicles.trim()) || 'Car, Motorcycle, Scooter, EV',
    (floors_info && floors_info.trim()) || 'Ground Floor, Level 1',
    Number(hourly_rate),
    image_url || 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=80'
  );

  const facility = db.prepare('SELECT * FROM parking_facilities WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ message: 'Facility created successfully.', facility });
});

// PUT /api/admin/facilities/:id
router.put('/facilities/:id', (req, res) => {
  const { name, address, city, hourly_rate, status, image_url, category, supported_vehicles, floors_info } = req.body;
  const facility = db.prepare('SELECT * FROM parking_facilities WHERE id = ?').get(req.params.id);

  if (!facility) {
    return res.status(404).json({ error: 'Facility not found.' });
  }

  db.prepare(`
    UPDATE parking_facilities
    SET name = ?, address = ?, city = ?, category = ?, supported_vehicles = ?, floors_info = ?, hourly_rate = ?, status = ?, image_url = ?
    WHERE id = ?
  `).run(
    name !== undefined ? name.trim() : facility.name,
    address !== undefined ? address.trim() : facility.address,
    city !== undefined ? city.trim() : facility.city,
    category !== undefined ? category.trim() : facility.category,
    supported_vehicles !== undefined ? supported_vehicles.trim() : facility.supported_vehicles,
    floors_info !== undefined ? floors_info.trim() : facility.floors_info,
    hourly_rate !== undefined ? Number(hourly_rate) : facility.hourly_rate,
    status !== undefined ? status : facility.status,
    image_url !== undefined ? image_url : facility.image_url,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM parking_facilities WHERE id = ?').get(req.params.id);
  res.json({ message: 'Facility updated successfully.', facility: updated });
});

// Slots Management CRUD
// POST /api/admin/slots
router.post('/slots', (req, res) => {
  const { facility_id, slot_number, floor, zone, compatible_category, hourly_rate } = req.body;

  if (!facility_id || !slot_number || !floor || !zone || !hourly_rate) {
    return res.status(400).json({ error: 'Facility, slot number, floor, zone, and hourly rate are required.' });
  }

  const existing = db.prepare('SELECT id FROM parking_slots WHERE facility_id = ? AND slot_number = ?').get(facility_id, slot_number.trim().toUpperCase());
  if (existing) {
    return res.status(400).json({ error: `Slot number '${slot_number}' already exists in this facility.` });
  }

  const insertTx = db.transaction(() => {
    const res = db.prepare(`
      INSERT INTO parking_slots (facility_id, slot_number, floor, zone, compatible_category, hourly_rate, status)
      VALUES (?, ?, ?, ?, ?, ?, 'available')
    `).run(
      facility_id,
      slot_number.trim().toUpperCase(),
      floor.trim(),
      zone.trim(),
      compatible_category || 'car',
      Number(hourly_rate)
    );

    const slotId = res.lastInsertRowid;
    // Create corresponding IoT smart sensor node
    db.prepare(`
      INSERT INTO smart_sensors (slot_id, sensor_code, sensor_type, distance_cm, occupancy_detected, status)
      VALUES (?, ?, 'Ultrasonic Distance', 285, 0, 'online')
    `).run(slotId, `SEN-MOD-${slot_number.trim().toUpperCase()}`);

    return db.prepare('SELECT * FROM parking_slots WHERE id = ?').get(slotId);
  });

  try {
    const slot = insertTx();
    res.status(201).json({ message: 'Slot and sensor initialized successfully.', slot });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/admin/slots/:id/toggle-maintenance
router.put('/slots/:id/toggle-maintenance', (req, res) => {
  const slot = db.prepare('SELECT * FROM parking_slots WHERE id = ?').get(req.params.id);
  if (!slot) {
    return res.status(404).json({ error: 'Slot not found.' });
  }

  // Section 16 Requirement: "An occupied slot must not be marked available or out of service while a vehicle is still checked in."
  if (slot.status === 'occupied') {
    return res.status(400).json({ 
      error: 'Cannot change maintenance state of a slot while a vehicle is actively checked in.' 
    });
  }

  const newStatus = slot.status === 'out_of_service' ? 'available' : 'out_of_service';

  db.prepare('UPDATE parking_slots SET status = ? WHERE id = ?').run(newStatus, slot.id);
  const updatedSlot = db.prepare('SELECT * FROM parking_slots WHERE id = ?').get(slot.id);

  res.json({
    message: `Slot ${slot.slot_number} status updated to '${newStatus}'.`,
    slot: updatedSlot
  });
});

// GET /api/admin/logs - Vehicle entry/exit and operational audit trail
router.get('/logs', (req, res) => {
  const logs = db.prepare(`
    SELECT e.*,
      f.name as facility_name,
      s.slot_number, s.floor,
      r.booking_reference, r.driver_name
    FROM vehicle_events e
    JOIN parking_facilities f ON f.id = e.facility_id
    JOIN parking_slots s ON s.id = e.slot_id
    LEFT JOIN reservations r ON r.id = e.reservation_id
    ORDER BY e.id DESC
    LIMIT 100
  `).all();

  res.json({ logs });
});

module.exports = router;
