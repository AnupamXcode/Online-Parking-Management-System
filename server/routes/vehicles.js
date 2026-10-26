const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/vehicles - List current user's registered vehicles
router.get('/', (req, res) => {
  const vehicles = db.prepare(`
    SELECT * FROM vehicles 
    WHERE user_id = ? 
    ORDER BY is_default DESC, id DESC
  `).all(req.user.id);

  res.json({ vehicles });
});

// POST /api/vehicles - Register new vehicle
router.post('/', (req, res) => {
  const { plate_number, category, model, color, is_default } = req.body;

  if (!plate_number || !plate_number.trim()) {
    return res.status(400).json({ error: 'Vehicle license plate number is required.' });
  }

  const validCategory = ['car', 'motorcycle', 'scooter', 'suv', 'ev'].includes(category) 
    ? category 
    : 'car';

  const cleanPlate = plate_number.trim().toUpperCase();

  // If set to default, unset existing default vehicles for this user
  const insertTx = db.transaction(() => {
    if (is_default) {
      db.prepare('UPDATE vehicles SET is_default = 0 WHERE user_id = ?').run(req.user.id);
    }

    const stmt = db.prepare(`
      INSERT INTO vehicles (user_id, plate_number, category, model, color, is_default)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(req.user.id, cleanPlate, validCategory, model || '', color || '', is_default ? 1 : 0);
    return db.prepare('SELECT * FROM vehicles WHERE id = ?').get(result.lastInsertRowid);
  });

  try {
    const vehicle = insertTx();
    res.status(201).json({ message: 'Vehicle added successfully.', vehicle });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add vehicle: ' + err.message });
  }
});

// PUT /api/vehicles/:id - Update vehicle
router.put('/:id', (req, res) => {
  const vehicleId = req.params.id;
  const { plate_number, category, model, color, is_default } = req.body;

  const existing = db.prepare('SELECT * FROM vehicles WHERE id = ? AND user_id = ?').get(vehicleId, req.user.id);
  if (!existing) {
    return res.status(404).json({ error: 'Vehicle not found or unauthorized.' });
  }

  const updateTx = db.transaction(() => {
    if (is_default) {
      db.prepare('UPDATE vehicles SET is_default = 0 WHERE user_id = ?').run(req.user.id);
    }

    const cleanPlate = (plate_number || existing.plate_number).trim().toUpperCase();
    const cleanCategory = category || existing.category;

    db.prepare(`
      UPDATE vehicles
      SET plate_number = ?, category = ?, model = ?, color = ?, is_default = ?
      WHERE id = ? AND user_id = ?
    `).run(
      cleanPlate,
      cleanCategory,
      model !== undefined ? model : existing.model,
      color !== undefined ? color : existing.color,
      is_default !== undefined ? (is_default ? 1 : 0) : existing.is_default,
      vehicleId,
      req.user.id
    );

    return db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId);
  });

  try {
    const updated = updateTx();
    res.json({ message: 'Vehicle updated successfully.', vehicle: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update vehicle: ' + err.message });
  }
});

// DELETE /api/vehicles/:id - Delete vehicle
router.delete('/:id', (req, res) => {
  const vehicleId = req.params.id;
  const existing = db.prepare('SELECT * FROM vehicles WHERE id = ? AND user_id = ?').get(vehicleId, req.user.id);
  
  if (!existing) {
    return res.status(404).json({ error: 'Vehicle not found or unauthorized.' });
  }

  // Check if vehicle has active reservation
  const activeReservation = db.prepare(`
    SELECT id FROM reservations 
    WHERE vehicle_id = ? AND status IN ('reserved', 'checked_in')
  `).get(vehicleId);

  if (activeReservation) {
    return res.status(400).json({ error: 'Cannot delete vehicle with an active or ongoing parking reservation.' });
  }

  db.prepare('DELETE FROM vehicles WHERE id = ? AND user_id = ?').run(vehicleId, req.user.id);
  res.json({ message: 'Vehicle removed successfully.' });
});

module.exports = router;
