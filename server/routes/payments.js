const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/payments - List payments for current user (or all for admin)
router.get('/', (req, res) => {
  const isAdmin = req.user.role === 'admin';

  let query = `
    SELECT p.*,
      r.booking_reference, r.vehicle_plate, r.actual_entry_time, r.actual_exit_time,
      f.name as facility_name,
      s.slot_number,
      u.name as user_name, u.email as user_email
    FROM payments p
    JOIN reservations r ON r.id = p.reservation_id
    JOIN parking_facilities f ON f.id = r.facility_id
    JOIN parking_slots s ON s.id = r.slot_id
    JOIN users u ON u.id = p.user_id
    WHERE 1=1
  `;
  const params = [];

  if (!isAdmin) {
    query += ` AND p.user_id = ?`;
    params.push(req.user.id);
  }

  query += ` ORDER BY p.id DESC`;

  const payments = db.prepare(query).all(...params);
  res.json({ payments });
});

// GET /api/payments/:id - Get detailed payment receipt
router.get('/:id', (req, res) => {
  const isAdmin = req.user.role === 'admin';

  let query = `
    SELECT p.*,
      r.booking_reference, r.vehicle_plate, r.vehicle_category,
      r.actual_entry_time, r.actual_exit_time, r.hourly_rate,
      f.name as facility_name, f.address as facility_address,
      s.slot_number, s.floor as slot_floor,
      u.name as user_name, u.email as user_email, u.phone as user_phone
    FROM payments p
    JOIN reservations r ON r.id = p.reservation_id
    JOIN parking_facilities f ON f.id = r.facility_id
    JOIN parking_slots s ON s.id = r.slot_id
    JOIN users u ON u.id = p.user_id
    WHERE p.id = ? OR p.payment_reference = ?
  `;
  const params = [req.params.id, req.params.id];

  if (!isAdmin) {
    query += ` AND p.user_id = ?`;
    params.push(req.user.id);
  }

  const receipt = db.prepare(query).get(...params);
  if (!receipt) {
    return res.status(404).json({ error: 'Receipt not found or unauthorized.' });
  }

  res.json({ receipt });
});

module.exports = router;
