const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { calculateExitFee } = require('../services/pricing');

router.use(authenticateToken);

// POST /api/exit/quote - Calculate exact duration and exit fee quote
router.post('/quote', (req, res) => {
  const { query } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Please provide a Booking Reference ID or Vehicle Plate Number.' });
  }

  const searchTerm = query.trim().toUpperCase();

  const booking = db.prepare(`
    SELECT r.*,
      f.name as facility_name, f.address as facility_address, f.hourly_rate as facility_hourly_rate,
      s.slot_number, s.floor as slot_floor, s.zone as slot_zone,
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
    return res.status(404).json({ error: `No active reservation found matching '${searchTerm}'.` });
  }

  if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized to access this vehicle exit session.' });
  }

  if (booking.status === 'completed') {
    return res.status(400).json({ error: 'This vehicle has already completed its exit and payment.' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ error: 'This reservation was cancelled.' });
  }

  if (booking.status === 'reserved') {
    return res.status(400).json({ error: 'This vehicle has not entered the facility yet (entry check-in pending).' });
  }

  const now = new Date();
  const entryTime = booking.actual_entry_time || booking.start_time;
  const quote = calculateExitFee(entryTime, now, booking.hourly_rate);

  res.json({
    booking,
    quote,
    pricing_rule: 'Billing is rounded up to the next full hour with a 1-hour minimum charge + 18% standard GST.'
  });
});

// POST /api/exit/confirm - Finalize payment, complete exit, open exit boom barrier, and release slot
router.post('/confirm', (req, res) => {
  const { booking_id, payment_method, demo_txn_ref } = req.body;

  if (!booking_id) {
    return res.status(400).json({ error: 'Booking identifier is required.' });
  }

  const validMethods = ['UPI', 'Card', 'Wallet'];
  const method = validMethods.includes(payment_method) ? payment_method : 'UPI';

  const exitTx = db.transaction(() => {
    const booking = db.prepare(`
      SELECT r.*, f.name as facility_name, s.slot_number
      FROM reservations r
      JOIN parking_facilities f ON f.id = r.facility_id
      JOIN parking_slots s ON s.id = r.slot_id
      WHERE r.id = ? OR r.booking_reference = ?
    `).get(booking_id, booking_id);

    if (!booking) {
      throw new Error('Reservation record not found.');
    }

    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      throw new Error('Unauthorized to process exit for this reservation.');
    }

    if (booking.status === 'completed') {
      throw new Error('This booking is already completed. Duplicate payment prevented.');
    }

    if (booking.status !== 'checked_in') {
      throw new Error(`Cannot process exit for a booking in '${booking.status}' status.`);
    }

    // Check if duplicate payment exists
    const existingPayment = db.prepare('SELECT id FROM payments WHERE reservation_id = ?').get(booking.id);
    if (existingPayment) {
      throw new Error('A payment for this session has already been recorded.');
    }

    const now = new Date();
    const entryTime = booking.actual_entry_time || booking.start_time;
    const quote = calculateExitFee(entryTime, now, booking.hourly_rate);

    const paymentRef = `PAY-PE-${Date.now().toString().slice(-6)}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const transactionRef = demo_txn_ref || `DEMO-${method.toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // 1. Record payment record
    const payStmt = db.prepare(`
      INSERT INTO payments (
        payment_reference, reservation_id, user_id, amount,
        payment_method, status, demo_transaction_ref, tax_amount, net_amount
      ) VALUES (?, ?, ?, ?, ?, 'success', ?, ?, ?)
    `);
    const payRes = payStmt.run(
      paymentRef,
      booking.id,
      booking.user_id,
      quote.finalAmount,
      method,
      transactionRef,
      quote.taxAmount,
      quote.baseAmount
    );

    // 2. Complete reservation
    db.prepare(`
      UPDATE reservations
      SET status = 'completed',
          actual_exit_time = ?,
          final_amount = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(now.toISOString(), quote.finalAmount, booking.id);

    // 3. Update slot availability: check if another upcoming booking starts in <30 min
    const upcomingQueue = db.prepare(`
      SELECT id FROM reservations 
      WHERE slot_id = ? AND status = 'reserved' AND start_time <= ?
    `).get(booking.slot_id, new Date(now.getTime() + 30 * 60000).toISOString());

    const newSlotStatus = upcomingQueue ? 'reserved' : 'available';
    db.prepare(`UPDATE parking_slots SET status = ? WHERE id = ?`).run(newSlotStatus, booking.slot_id);

    // 4. Update sensor telemetry: slot cleared
    db.prepare(`
      UPDATE smart_sensors 
      SET occupancy_detected = 0, distance_cm = 285, last_heartbeat = CURRENT_TIMESTAMP 
      WHERE slot_id = ?
    `).run(booking.slot_id);

    // 5. Log vehicle exit event
    db.prepare(`
      INSERT INTO vehicle_events (reservation_id, facility_id, slot_id, vehicle_plate, event_type, barrier_status, notes)
      VALUES (?, ?, ?, ?, 'exit', 'opened', ?)
    `).run(
      booking.id,
      booking.facility_id,
      booking.slot_id,
      booking.vehicle_plate,
      `Vehicle exited successfully through Exit Gate. Payment ₹${quote.finalAmount} received via ${method}.`
    );

    const finalReservation = db.prepare(`
      SELECT r.*,
        f.name as facility_name, f.address as facility_address,
        s.slot_number, s.floor as slot_floor, s.zone as slot_zone
      FROM reservations r
      JOIN parking_facilities f ON f.id = r.facility_id
      JOIN parking_slots s ON s.id = r.slot_id
      WHERE r.id = ?
    `).get(booking.id);

    const finalPayment = db.prepare('SELECT * FROM payments WHERE id = ?').get(payRes.lastInsertRowid);

    return {
      booking: finalReservation,
      payment: finalPayment,
      quote
    };
  });

  try {
    const result = exitTx();
    res.json({
      success: true,
      message: 'Payment received! Exit boom barrier opened. Thank you for using ParkEase.',
      barrier_status: 'OPENED',
      receipt: {
        payment_reference: result.payment.payment_reference,
        transaction_ref: result.payment.demo_transaction_ref,
        method: result.payment.payment_method,
        booking_reference: result.booking.booking_reference,
        vehicle_plate: result.booking.vehicle_plate,
        facility_name: result.booking.facility_name,
        slot_number: result.booking.slot_number,
        entry_time: result.booking.actual_entry_time,
        exit_time: result.booking.actual_exit_time,
        duration: result.quote.durationFormatted,
        billable_hours: result.quote.billableHours,
        hourly_rate: result.booking.hourly_rate,
        base_amount: result.quote.baseAmount,
        tax_amount: result.quote.taxAmount,
        total_paid: result.quote.finalAmount,
        status: 'PAID'
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
