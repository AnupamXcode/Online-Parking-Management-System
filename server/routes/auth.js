const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../db/database');
const { authenticateToken, generateToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, phone, password, confirmPassword, plateNumber, vehicleCategory, vehicleModel } = req.body;

  if (!name || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All personal registration fields are required.' });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  // Password matching & length
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Password confirmation does not match.' });
  }

  // Check duplicate email
  const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  // Hash password
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const registerTx = db.transaction(() => {
    const userStmt = db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, 'user')
    `);
    const userRes = userStmt.run(name.trim(), email.toLowerCase().trim(), phone.trim(), passwordHash);
    const userId = userRes.lastInsertRowid;

    // Register vehicle if plate number provided
    if (plateNumber && plateNumber.trim()) {
      const validCategory = ['car', 'motorcycle', 'scooter', 'suv', 'ev'].includes(vehicleCategory) 
        ? vehicleCategory 
        : 'car';
      
      db.prepare(`
        INSERT INTO vehicles (user_id, plate_number, category, model, color, is_default)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, plateNumber.trim().toUpperCase(), validCategory, vehicleModel || 'Registered Vehicle', 'Default', 1);
    }

    return db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(userId);
  });

  try {
    const newUser = registerTx();
    const token = generateToken(newUser);
    return res.status(201).json({
      message: 'Account registered successfully.',
      user: newUser,
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to complete registration: ' + err.message });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = generateToken(user);
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at
  };

  return res.json({
    message: 'Login successful.',
    user: safeUser,
    token
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  return res.json({ message: 'Logged out successfully.' });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const vehicles = db.prepare('SELECT * FROM vehicles WHERE user_id = ? ORDER BY is_default DESC, id DESC').all(req.user.id);

  return res.json({
    user,
    vehicles
  });
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone number are required.' });
  }

  db.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?').run(name.trim(), phone.trim(), req.user.id);
  const updatedUser = db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(req.user.id);

  return res.json({
    message: 'Profile updated successfully.',
    user: updatedUser
  });
});

module.exports = router;
