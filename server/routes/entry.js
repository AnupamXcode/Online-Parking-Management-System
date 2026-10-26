const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// POST /api/entry/validate - Search and validate booking for vehicle entry
router.post('/validate', (req, res) => {
  const { query } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Please enter a Booking Reference ID or Vehicle Plate Number.' });
  }

  const searchTerm = query.trim().toUpperCase();

  const booking = db.prepare(`
    SELECT r.*,
      f.name as facility_name, f.address as facility_address,
      s.slot_number, s.floor as slot_floor, s.zone as slot_zone, s.status as slot_status,
      u.name as user_name, u.phone as user_phone
    FROM reservations r
    JOIN parking_facilities f ON f.id = r.facility_id
    JOIN parking_slots s ON s.id = r.slot_id
    JOIN users u ON u.id = r.user_id
    WHERE (r.booking_reference = ? OR r.vehicle_plate = ?)
    ORDER BY r.id DESC
    LIMIT 1
  `).get(searchTerm, searchTerm);

  if (!booking) {
    return res.status(404).json({ error: `No reservation found matching '${searchTerm}'. Please check your booking reference or license plate.` });
  }

  // Authorization check: if not admin, must be own booking
  if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
    return res.status(403).json({ error: 'You are not authorized to check in this reservation.' });
  }

  // Check state eligibility
  if (booking.status === 'checked_in') {
    return res.status(400).json({ 
      error: `Vehicle ${booking.vehicle_plate} has already checked in at ${new Date(booking.actual_entry_time).toLocaleTimeString()} (Slot: ${booking.slot_number}).`,
      booking 
    });
  }

  if (booking.status === 'completed') {
    return res.status(400).json({ error: 'This parking reservation has already been completed and paid.' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ error: 'This parking reservation was cancelled and cannot be checked in.' });
  }

  if (booking.slot_status === 'out_of_service') {
    return res.status(400).json({ error: `Assigned slot ${booking.slot_number} is currently marked out of service. Please contact parking support.` });
  }

  res.json({
    valid: true,
    message: 'Reservation verified and ready for gate entry.',
    booking
  });
});

// POST /api/entry/confirm - Confirm gate entry, open boom barrier, and mark slot occupied
router.post('/confirm', (req, res) => {
  const { booking_id } = req.body;

  if (!booking_id) {
    return res.status(400).json({ error: 'Booking identifier is required.' });
  }

  const entryTx = db.transaction(() => {
    const booking = db.prepare(`
      SELECT r.*, s.slot_number, f.name as facility_name
      FROM reservations r
      JOIN parking_slots s ON s.id = r.slot_id
      JOIN parking_facilities f ON f.id = r.facility_id
      WHERE r.id = ? OR r.booking_reference = ?
    `).get(booking_id, booking_id);

    if (!booking) {
      throw new Error('Reservation not found.');
    }

    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      throw new Error('Unauthorized to confirm entry for this reservation.');
    }

    if (booking.status !== 'reserved') {
      throw new Error(`Cannot check in booking with status '${booking.status}'.`);
    }

    const actualEntryTime = new Date().toISOString();

    // 1. Update reservation to checked_in
    db.prepare(`
      UPDATE reservations
      SET status = 'checked_in', actual_entry_time = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(actualEntryTime, booking.id);

    // 2. Mark slot physically occupied
    db.prepare(`UPDATE parking_slots SET status = 'occupied' WHERE id = ?`).run(booking.slot_id);

    // 3. Update smart sensor telemetry
    db.prepare(`
      UPDATE smart_sensors 
      SET occupancy_detected = 1, distance_cm = 48, last_heartbeat = CURRENT_TIMESTAMP 
      WHERE slot_id = ?
    `).run(booking.slot_id);

    // 4. Log vehicle entry event
    db.prepare(`
      INSERT INTO vehicle_events (reservation_id, facility_id, slot_id, vehicle_plate, event_type, barrier_status, notes)
      VALUES (?, ?, ?, ?, 'entry', 'opened', ?)
    `).run(
      booking.id,
      booking.facility_id,
      booking.slot_id,
      booking.vehicle_plate,
      `Simulated barrier opened for entry at ${booking.facility_name}. Vehicle guided to slot ${booking.slot_number}.`
    );

    return db.prepare(`
      SELECT r.*,
        f.name as facility_name, f.address as facility_address,
        s.slot_number, s.floor as slot_floor, s.zone as slot_zone
      FROM reservations r
      JOIN parking_facilities f ON f.id = r.facility_id
      JOIN parking_slots s ON s.id = r.slot_id
      WHERE r.id = ?
    `).get(booking.id);
  });

  try {
    const updatedBooking = entryTx();
    res.json({
      success: true,
      message: 'Boom barrier opened! Vehicle entry registered successfully.',
      barrier_status: 'OPENED',
      entry_ticket: updatedBooking
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
