const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/sensors - List all smart parking telemetry sensors
router.get('/', (req, res) => {
  const sensors = db.prepare(`
    SELECT sn.*,
      s.slot_number, s.floor, s.zone, s.status as slot_status, s.compatible_category,
      f.id as facility_id, f.name as facility_name
    FROM smart_sensors sn
    JOIN parking_slots s ON s.id = sn.slot_id
    JOIN parking_facilities f ON f.id = s.facility_id
    ORDER BY f.id ASC, s.floor ASC, s.slot_number ASC
  `).all();

  res.json({
    sensors,
    simulator_status: 'ACTIVE_DEMO_STREAM',
    note: 'All sensor telemetry readings represent simulated ultrasonic and geomagnetic IoT ground nodes.'
  });
});

// POST /api/sensors/simulate-toggle - Toggle simulated vehicle presence at a slot
router.post('/simulate-toggle', authenticateToken, (req, res) => {
  const { sensor_id, slot_id } = req.body;

  const sensor = db.prepare(`
    SELECT sn.*, s.status as slot_status, s.slot_number 
    FROM smart_sensors sn
    JOIN parking_slots s ON s.id = sn.slot_id
    WHERE sn.id = ? OR sn.slot_id = ?
  `).get(sensor_id || slot_id, slot_id || sensor_id);

  if (!sensor) {
    return res.status(404).json({ error: 'Sensor node not found.' });
  }

  // Toggle occupancy
  const newOccupancy = sensor.occupancy_detected ? 0 : 1;
  const newDistance = newOccupancy ? 45 : 285; // 45cm indicates vehicle above sensor, 285cm is empty bay

  db.prepare(`
    UPDATE smart_sensors
    SET occupancy_detected = ?,
        distance_cm = ?,
        last_heartbeat = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(newOccupancy, newDistance, sensor.id);

  // If slot is not out of service, and not currently tied to an active reservation, update slot status visually
  if (sensor.slot_status !== 'out_of_service') {
    const activeRes = db.prepare(`
      SELECT id FROM reservations 
      WHERE slot_id = ? AND status IN ('reserved', 'checked_in')
    `).get(sensor.slot_id);

    if (!activeRes) {
      const newSlotStatus = newOccupancy ? 'occupied' : 'available';
      db.prepare(`UPDATE parking_slots SET status = ? WHERE id = ?`).run(newSlotStatus, sensor.slot_id);
    }
  }

  const updatedSensor = db.prepare(`
    SELECT sn.*, s.slot_number, s.status as slot_status
    FROM smart_sensors sn
    JOIN parking_slots s ON s.id = sn.slot_id
    WHERE sn.id = ?
  `).get(sensor.id);

  res.json({
    message: `Simulated sensor ${sensor.sensor_code} triggered: ${newOccupancy ? 'Vehicle Detected' : 'Bay Cleared'}.`,
    sensor: updatedSensor
  });
});

module.exports = router;
