const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { allocateParkingSlot } = require('../services/allocation');

router.use(authenticateToken);

// Generate unique, readable booking reference like PE-2026-X89K2
function generateBookingReference() {
  const year = new Date().getFullYear();
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PE-${year}-${randomChars}`;
}

// POST /api/bookings - Create and allocate parking booking
router.post('/', (req, res) => {
  const {
    facility_id,
    vehicle_plate,
    vehicle_category,
    vehicle_id,
    driver_name,
    driver_phone,
    start_time,
    expected_end_time,
    preferred_slot_id
  } = req.body;

  if (!facility_id || !vehicle_plate || !start_time || !expected_end_time) {
    return res.status(400).json({ error: 'Facility, vehicle plate, entry time, and exit time are required.' });
  }

  const category = vehicle_category || 'car';
  const name = driver_name || req.user.name;
  const phone = driver_phone || req.user.phone;

  // Run allocation logic inside a transaction to prevent race conditions
  const bookingTx = db.transaction(() => {
    // 1. Run deterministic allocation
    const allocationResult = allocateParkingSlot({
      facilityId: Number(facility_id),
      vehicleCategory: category,
      startTime: start_time,
      expectedEndTime: expected_end_time,
      preferredSlotId: preferred_slot_id ? Number(preferred_slot_id) : null
    });

    if (!allocationResult.success) {
      throw new Error(allocationResult.message);
    }

    const { slot, facility, estimatedAmount } = allocationResult;
    const bookingRef = generateBookingReference();

    // 2. Insert reservation record
    const qrPayload = JSON.stringify({
      bookingRef,
      facilityName: facility.name,
      slotNumber: slot.slot_number,
      plateNumber: vehicle_plate.trim().toUpperCase(),
      startTime: start_time,
      expectedEndTime: expected_end_time
    });

    const insertReservation = db.prepare(`
      INSERT INTO reservations (
        booking_reference, user_id, facility_id, slot_id, vehicle_id,
        vehicle_plate, vehicle_category, driver_name, driver_phone,
        start_time, expected_end_time, hourly_rate, estimated_amount, status, qr_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'reserved', ?)
    `);

    const result = insertReservation.run(
      bookingRef,
      req.user.id,
      facility.id,
      slot.id,
      vehicle_id || null,
      vehicle_plate.trim().toUpperCase(),
      category,
      name.trim(),
      phone.trim(),
      new Date(start_time).toISOString(),
      new Date(expected_end_time).toISOString(),
      slot.hourly_rate,
      estimatedAmount,
      qrPayload
    );

    const reservationId = result.lastInsertRowid;

    // 3. If reservation starts within 30 minutes and slot is available, mark slot reserved
    const now = new Date();
    const startDate = new Date(start_time);
    if ((startDate.getTime() - now.getTime()) <= 30 * 60 * 1000 && slot.status === 'available') {
      db.prepare(`UPDATE parking_slots SET status = 'reserved' WHERE id = ?`).run(slot.id);
    }

    // 4. Log event
    db.prepare(`
      INSERT INTO vehicle_events (reservation_id, facility_id, slot_id, vehicle_plate, event_type, notes)
      VALUES (?, ?, ?, ?, 'booking_created', 'Reservation created and slot confirmed')
    `).run(reservationId, facility.id, slot.id, vehicle_plate.trim().toUpperCase());

    return db.prepare(`
      SELECT r.*,
        f.name as facility_name, f.address as facility_address, f.city as facility_city,
        s.slot_number, s.floor as slot_floor, s.zone as slot_zone
      FROM reservations r
      JOIN parking_facilities f ON f.id = r.facility_id
      JOIN parking_slots s ON s.id = r.slot_id
      WHERE r.id = ?
    `).get(reservationId);
  });

  try {
    const booking = bookingTx();
    return res.status(201).json({
      message: 'Parking slot allocated and booking confirmed!',
      booking
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /api/bookings - List bookings for user
router.get('/', (req, res) => {
  const { status } = req.query;
  const isAdmin = req.user.role === 'admin';

  let query = `
    SELECT r.*,
      f.name as facility_name, f.address as facility_address,
      s.slot_number, s.floor as slot_floor, s.zone as slot_zone,
      u.name as user_name, u.email as user_email
    FROM reservations r
    JOIN parking_facilities f ON f.id = r.facility_id
    JOIN parking_slots s ON s.id = r.slot_id
    JOIN users u ON u.id = r.user_id
    WHERE 1=1
  `;
  const params = [];

  // If not admin, restrict to own bookings
  if (!isAdmin) {
    query += ` AND r.user_id = ?`;
    params.push(req.user.id);
  }

  if (status && status !== 'all') {
    if (status === 'upcoming') {
      query += ` AND r.status = 'reserved' AND r.start_time >= ?`;
      params.push(new Date().toISOString());
    } else {
      query += ` AND r.status = ?`;
      params.push(status);
    }
  }

  query += ` ORDER BY r.id DESC`;

  const bookings = db.prepare(query).all(...params);
  res.json({ bookings });
});

// GET /api/bookings/:id - Single booking details with payment and event logs
router.get('/:id', (req, res) => {
  const idOrRef = req.params.id;
  const isAdmin = req.user.role === 'admin';

  let query = `
    SELECT r.*,
      f.name as facility_name, f.address as facility_address, f.city as facility_city,
      s.slot_number, s.floor as slot_floor, s.zone as slot_zone,
      u.name as user_name, u.email as user_email
    FROM reservations r
    JOIN parking_facilities f ON f.id = r.facility_id
    JOIN parking_slots s ON s.id = r.slot_id
    JOIN users u ON u.id = r.user_id
    WHERE (r.id = ? OR r.booking_reference = ?)
  `;
  const params = [idOrRef, idOrRef];

  if (!isAdmin) {
    query += ` AND r.user_id = ?`;
    params.push(req.user.id);
  }

  const booking = db.prepare(query).get(...params);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found or access denied.' });
  }

  const payment = db.prepare('SELECT * FROM payments WHERE reservation_id = ? ORDER BY id DESC LIMIT 1').get(booking.id);
  const events = db.prepare('SELECT * FROM vehicle_events WHERE reservation_id = ? ORDER BY id ASC').all(booking.id);

  res.json({
    booking,
    payment,
    events
  });
});

// POST /api/bookings/:id/cancel - Cancel booking
router.post('/:id/cancel', (req, res) => {
  const idOrRef = req.params.id;
  const isAdmin = req.user.role === 'admin';

  const cancelTx = db.transaction(() => {
    let checkQuery = 'SELECT * FROM reservations WHERE (id = ? OR booking_reference = ?)';
    const params = [idOrRef, idOrRef];
    if (!isAdmin) {
      checkQuery += ' AND user_id = ?';
      params.push(req.user.id);
    }

    const booking = db.prepare(checkQuery).get(...params);
    if (!booking) {
      throw new Error('Booking not found or unauthorized.');
    }

    if (booking.status !== 'reserved') {
      throw new Error(`Cannot cancel a booking with status '${booking.status}'. Only pending reserved bookings can be cancelled.`);
    }

    // Mark reservation cancelled
    db.prepare(`
      UPDATE reservations 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(booking.id);

    // Check if slot has other active reservation right now; if not and slot is reserved, restore to available
    const otherActive = db.prepare(`
      SELECT id FROM reservations 
      WHERE slot_id = ? AND status IN ('reserved', 'checked_in') AND id != ?
    `).get(booking.slot_id, booking.id);

    const slot = db.prepare('SELECT status FROM parking_slots WHERE id = ?').get(booking.slot_id);
    if (!otherActive && slot && slot.status === 'reserved') {
      db.prepare(`UPDATE parking_slots SET status = 'available' WHERE id = ?`).run(booking.slot_id);
    }

    // Record vehicle event
    db.prepare(`
      INSERT INTO vehicle_events (reservation_id, facility_id, slot_id, vehicle_plate, event_type, notes)
      VALUES (?, ?, ?, ?, 'booking_cancelled', 'User cancelled parking reservation')
    `).run(booking.id, booking.facility_id, booking.slot_id, booking.vehicle_plate);

    return db.prepare('SELECT * FROM reservations WHERE id = ?').get(booking.id);
  });

  try {
    const updated = cancelTx();
    res.json({ message: 'Booking cancelled successfully. The slot has been released.', booking: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
