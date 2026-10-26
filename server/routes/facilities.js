const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// GET /api/facilities - List all facilities with live slot statistics
router.get('/', (req, res) => {
  const facilities = db.prepare(`
    SELECT f.*,
      (SELECT COUNT(*) FROM parking_slots WHERE facility_id = f.id) as total_slots,
      (SELECT COUNT(*) FROM parking_slots WHERE facility_id = f.id AND status = 'available') as available_slots,
      (SELECT COUNT(*) FROM parking_slots WHERE facility_id = f.id AND status = 'occupied') as occupied_slots,
      (SELECT COUNT(*) FROM parking_slots WHERE facility_id = f.id AND status = 'reserved') as reserved_slots,
      (SELECT COUNT(*) FROM parking_slots WHERE facility_id = f.id AND status = 'out_of_service') as out_of_service_slots
    FROM parking_facilities f
    ORDER BY f.id ASC
  `).all();

  res.json({ facilities });
});

// GET /api/facilities/:id - Single facility details
router.get('/:id', (req, res) => {
  const facility = db.prepare(`
    SELECT f.*,
      (SELECT COUNT(*) FROM parking_slots WHERE facility_id = f.id) as total_slots,
      (SELECT COUNT(*) FROM parking_slots WHERE facility_id = f.id AND status = 'available') as available_slots,
      (SELECT COUNT(*) FROM parking_slots WHERE facility_id = f.id AND status = 'occupied') as occupied_slots,
      (SELECT COUNT(*) FROM parking_slots WHERE facility_id = f.id AND status = 'reserved') as reserved_slots,
      (SELECT COUNT(*) FROM parking_slots WHERE facility_id = f.id AND status = 'out_of_service') as out_of_service_slots
    FROM parking_facilities f
    WHERE f.id = ?
  `).get(req.params.id);

  if (!facility) {
    return res.status(404).json({ error: 'Parking facility not found.' });
  }

  res.json({ facility });
});

// GET /api/facilities/:id/slots - Detailed slot grid with interval availability check
router.get('/:id/slots', (req, res) => {
  const facilityId = req.params.id;
  const { startTime, expectedEndTime, category } = req.query;

  let query = `
    SELECT s.*,
      sn.sensor_code,
      sn.distance_cm,
      sn.occupancy_detected as sensor_occupancy,
      sn.battery_pct as sensor_battery,
      sn.status as sensor_status
    FROM parking_slots s
    LEFT JOIN smart_sensors sn ON sn.slot_id = s.id
    WHERE s.facility_id = ?
  `;
  const params = [facilityId];

  if (category && category !== 'all') {
    query += ` AND (s.compatible_category = ? OR s.compatible_category = 'all')`;
    params.push(category);
  }

  query += ` ORDER BY s.floor ASC, s.zone ASC, s.priority ASC, s.slot_number ASC`;

  const slots = db.prepare(query).all(...params);

  // If time interval is provided, dynamically mark is_available_for_interval
  if (startTime && expectedEndTime) {
    const overlappingRows = db.prepare(`
      SELECT DISTINCT slot_id 
      FROM reservations
      WHERE facility_id = ?
        AND status IN ('reserved', 'checked_in')
        AND (start_time < ? AND expected_end_time > ?)
    `).all(facilityId, new Date(expectedEndTime).toISOString(), new Date(startTime).toISOString());

    const overlappingIds = new Set(overlappingRows.map(r => r.slot_id));

    slots.forEach(slot => {
      if (slot.status === 'out_of_service') {
        slot.interval_status = 'out_of_service';
      } else if (overlappingIds.has(slot.id)) {
        slot.interval_status = 'reserved';
      } else if (slot.status === 'occupied') {
        slot.interval_status = 'occupied';
      } else {
        slot.interval_status = 'available';
      }
    });
  }

  res.json({ slots });
});

module.exports = router;
