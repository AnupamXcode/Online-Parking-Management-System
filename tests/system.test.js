const assert = require('assert');
const http = require('http');
const app = require('../server/index');
const { db, initSchema } = require('../server/db/database');
const { seed } = require('../server/db/seed');

let server;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('========================================================');
  console.log('  PARKEASE SMART PARKING SYSTEM — AUTOMATED QA TEST SUITE');
  console.log('========================================================\n');

  // Seed fresh state
  await seed();

  // Start ephemeral test server
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`[TEST SUITE] Test server running on ${baseUrl}\n`);
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  async function testCase(name, fn) {
    try {
      process.stdout.write(`• Testing: ${name}... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      console.error(err);
      failed++;
    }
  }

  let userToken = '';
  let adminToken = '';
  let testUserId = null;
  let testVehicleId = null;
  let testFacilityId = null;
  let testBookingRef = '';
  let testBookingId = null;
  let allocatedSlotId = null;

  // 1. A new user can register
  await testCase('1. A new user can register', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Test Driver',
        email: 'testdriver@parkease.com',
        phone: '+91 9988776655',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        plateNumber: 'DL-01-AB-1234',
        vehicleCategory: 'car'
      }
    });
    assert.strictEqual(res.status, 201, `Expected 201 Created, got ${res.status}: ${JSON.stringify(res.data)}`);
    assert.ok(res.data.token, 'Expected auth token in response');
    assert.strictEqual(res.data.user.email, 'testdriver@parkease.com');
    userToken = res.data.token;
    testUserId = res.data.user.id;
  });

  // 2. Duplicate email registration is rejected
  await testCase('2. Duplicate email registration is rejected', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Duplicate Driver',
        email: 'testdriver@parkease.com',
        phone: '+91 9988776655',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      }
    });
    assert.strictEqual(res.status, 400, 'Expected 400 Bad Request for duplicate email');
    assert.match(res.data.error, /already exists/i);
  });

  // 3. A registered user can log in and log out
  await testCase('3. A registered user can log in and log out', async () => {
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'testdriver@parkease.com',
        password: 'Password123!'
      }
    });
    assert.strictEqual(loginRes.status, 200, 'Expected login success');
    assert.ok(loginRes.data.token);

    // Also obtain admin token for later tests
    const adminLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@parkease.com',
        password: 'AdminPass123!'
      }
    });
    assert.strictEqual(adminLoginRes.status, 200);
    adminToken = adminLoginRes.data.token;

    const logoutRes = await request('/api/auth/logout', { method: 'POST' });
    assert.strictEqual(logoutRes.status, 200);
  });

  // 4. A user can add a vehicle
  await testCase('4. A user can add a vehicle', async () => {
    const res = await request('/api/vehicles', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        plate_number: 'MH-31-ZZ-9999',
        category: 'car',
        model: 'Hyundai Ioniq 5',
        color: 'Matte Gravity Gold',
        is_default: 1
      }
    });
    assert.strictEqual(res.status, 201, `Failed to add vehicle: ${JSON.stringify(res.data)}`);
    assert.strictEqual(res.data.vehicle.plate_number, 'MH-31-ZZ-9999');
    testVehicleId = res.data.vehicle.id;
  });

  // 5. Available slots are displayed correctly
  await testCase('5. Available slots are displayed correctly', async () => {
    const facRes = await request('/api/facilities');
    assert.strictEqual(facRes.status, 200);
    assert.ok(facRes.data.facilities.length > 0);
    testFacilityId = facRes.data.facilities[0].id;

    const res = await request(`/api/facilities/${testFacilityId}/slots`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.slots));
    assert.ok(res.data.slots.length > 0);
  });

  // 6. A booking assigns a compatible slot
  await testCase('6. A booking assigns a compatible slot', async () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 10 * 60000).toISOString();
    const endTime = new Date(now.getTime() + 130 * 60000).toISOString();

    const res = await request('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        facility_id: testFacilityId,
        vehicle_plate: 'MH-31-ZZ-9999',
        vehicle_category: 'car',
        vehicle_id: testVehicleId,
        start_time: startTime,
        expected_end_time: endTime
      }
    });
    assert.strictEqual(res.status, 201, `Booking failed: ${JSON.stringify(res.data)}`);
    assert.ok(res.data.booking.booking_reference);
    assert.ok(res.data.booking.slot_number);
    testBookingRef = res.data.booking.booking_reference;
    testBookingId = res.data.booking.id;
    allocatedSlotId = res.data.booking.slot_id;
  });

  // 7. Two overlapping bookings cannot reserve the same slot
  await testCase('7. Two overlapping bookings cannot reserve the same slot', async () => {
    const now = new Date();
    const overlapStart = new Date(now.getTime() + 20 * 60000).toISOString();
    const overlapEnd = new Date(now.getTime() + 60 * 60000).toISOString();

    // Attempt to book with preferred_slot_id forced to the already booked slot
    const res = await request('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        facility_id: testFacilityId,
        vehicle_plate: 'DL-01-AB-1234',
        vehicle_category: 'car',
        preferred_slot_id: allocatedSlotId,
        start_time: overlapStart,
        expected_end_time: overlapEnd
      }
    });
    assert.strictEqual(res.status, 400, 'Expected 400 error when attempting to book overlapping slot');
    assert.match(res.data.error, /preferred slot is not available/i);
  });

  // 8. Non-overlapping reservations can reuse a slot
  await testCase('8. Non-overlapping reservations can reuse a slot', async () => {
    const now = new Date();
    // Start strictly after the first booking ends (+ 180 min)
    const futureStart = new Date(now.getTime() + 180 * 60000).toISOString();
    const futureEnd = new Date(now.getTime() + 240 * 60000).toISOString();

    const res = await request('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        facility_id: testFacilityId,
        vehicle_plate: 'DL-01-AB-1234',
        vehicle_category: 'car',
        preferred_slot_id: allocatedSlotId,
        start_time: futureStart,
        expected_end_time: futureEnd
      }
    });
    assert.strictEqual(res.status, 201, `Non-overlapping reuse failed: ${JSON.stringify(res.data)}`);
    assert.strictEqual(res.data.booking.slot_id, allocatedSlotId, 'Slot was not successfully reused for non-overlapping interval');
  });

  // 9. A valid booking generates a real digital ticket
  await testCase('9. A valid booking generates a real digital ticket', async () => {
    const res = await request(`/api/bookings/${testBookingRef}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.booking.qr_data, 'Booking must have genuine QR payload');
    assert.strictEqual(res.data.booking.status, 'reserved');
    assert.strictEqual(res.data.booking.vehicle_plate, 'MH-31-ZZ-9999');
  });

  // 10. An invalid or cancelled booking cannot check in
  await testCase('10. An invalid or cancelled booking cannot check in', async () => {
    // Attempt invalid booking ID
    const resInvalid = await request('/api/entry/validate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { query: 'PE-9999-FAKE' }
    });
    assert.strictEqual(resInvalid.status, 404);

    // Cancel our future test booking and try to check in
    const cancelRes = await request(`/api/bookings/${testBookingRef}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(cancelRes.status, 200);

    const tryCheckinCancelled = await request('/api/entry/validate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { query: testBookingRef }
    });
    assert.strictEqual(tryCheckinCancelled.status, 400);
    assert.match(tryCheckinCancelled.data.error, /cancelled/i);
  });

  // Create a fresh booking for testing entry, exit, pricing & payment workflow
  let entryBookingRef = '';
  let entrySlotId = null;

  await testCase('Create fresh booking for entry & exit tests', async () => {
    const now = new Date();
    const start = new Date(now.getTime() - 90 * 60000).toISOString(); // 90 min ago
    const end = new Date(now.getTime() + 60 * 60000).toISOString();

    const res = await request('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        facility_id: testFacilityId,
        vehicle_plate: 'MH-31-ZZ-9999',
        vehicle_category: 'car',
        start_time: start,
        expected_end_time: end
      }
    });
    assert.strictEqual(res.status, 201);
    entryBookingRef = res.data.booking.booking_reference;
    entrySlotId = res.data.booking.slot_id;
  });

  // 11. Successful entry marks the slot occupied
  await testCase('11. Successful entry marks the slot occupied', async () => {
    const confirmRes = await request('/api/entry/confirm', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { booking_id: entryBookingRef }
    });
    assert.strictEqual(confirmRes.status, 200, `Entry failed: ${JSON.stringify(confirmRes.data)}`);
    assert.strictEqual(confirmRes.data.barrier_status, 'OPENED');
    assert.strictEqual(confirmRes.data.entry_ticket.status, 'checked_in');

    // Verify slot status in database is occupied
    const slot = db.prepare('SELECT status FROM parking_slots WHERE id = ?').get(entrySlotId);
    assert.strictEqual(slot.status, 'occupied', 'Slot must be marked occupied after entry');
  });

  // 12. Exit calculates the correct parking fee
  await testCase('12. Exit calculates the correct parking fee', async () => {
    // Backdate actual_entry_time to 2 hours and 20 minutes ago to verify the prompt example:
    // "Duration: 2 hours 20 minutes -> Billable: 3 hours -> ₹40/hr -> ₹120 base"
    const entryDate = new Date(Date.now() - (140 * 60000)).toISOString();
    db.prepare('UPDATE reservations SET actual_entry_time = ? WHERE booking_reference = ?').run(entryDate, entryBookingRef);

    const quoteRes = await request('/api/exit/quote', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { query: entryBookingRef }
    });
    assert.strictEqual(quoteRes.status, 200, `Quote failed: ${JSON.stringify(quoteRes.data)}`);
    const quote = quoteRes.data.quote;
    assert.strictEqual(quote.billableHours, 3, '2h 20m must round up to 3 billable hours');
    assert.strictEqual(quote.baseAmount, 120, '3 hours * ₹40 = ₹120 base');
    assert.strictEqual(quote.taxAmount, 21.6, '18% GST of ₹120 = ₹21.6');
    assert.strictEqual(quote.finalAmount, 141.6, 'Total = ₹141.6');
  });

  // 13. Successful demo payment completes the booking and releases the slot correctly
  await testCase('13. Successful demo payment completes the booking and releases the slot correctly', async () => {
    const exitRes = await request('/api/exit/confirm', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        booking_id: entryBookingRef,
        payment_method: 'UPI'
      }
    });
    assert.strictEqual(exitRes.status, 200, `Exit payment failed: ${JSON.stringify(exitRes.data)}`);
    assert.strictEqual(exitRes.data.receipt.status, 'PAID');
    assert.strictEqual(exitRes.data.barrier_status, 'OPENED');

    // Verify booking is completed
    const booking = db.prepare('SELECT status FROM reservations WHERE booking_reference = ?').get(entryBookingRef);
    assert.strictEqual(booking.status, 'completed');

    // Verify slot is freed to available
    const slot = db.prepare('SELECT status FROM parking_slots WHERE id = ?').get(entrySlotId);
    assert.strictEqual(slot.status, 'available', 'Slot must be released to available after exit');
  });

  // 14. Duplicate exit payment is prevented
  await testCase('14. Duplicate exit payment is prevented', async () => {
    const res = await request('/api/exit/confirm', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        booking_id: entryBookingRef,
        payment_method: 'Card'
      }
    });
    assert.strictEqual(res.status, 400, 'Duplicate payment must be rejected');
    assert.match(res.data.error, /already completed|duplicate/i);
  });

  // 15. Users cannot access another user's private bookings
  await testCase("15. Users cannot access another user's private bookings", async () => {
    // Register another distinct user
    const otherUserRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Private Driver 2',
        email: 'otheruser@parkease.com',
        phone: '+91 9777777777',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      }
    });
    const otherToken = otherUserRes.data.token;

    // Try to access testBookingRef belonging to user 1
    const res = await request(`/api/bookings/${testBookingRef}`, {
      headers: { Authorization: `Bearer ${otherToken}` }
    });
    assert.strictEqual(res.status, 404, 'User 2 must not be able to access User 1 private booking');
  });

  // 16. Non-admin users cannot access admin APIs
  await testCase('16. Non-admin users cannot access admin APIs', async () => {
    const res = await request('/api/admin/overview', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(res.status, 403, 'Regular user must receive 403 Forbidden on admin overview');

    // Admin should succeed
    const adminRes = await request('/api/admin/overview', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(adminRes.status, 200, 'Admin should have access to admin overview');
    assert.ok(adminRes.data.kpis.totalFacilities > 0);
  });

  console.log('\n========================================================');
  console.log(`  QA TEST RUN COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================');

  server.close();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test runner encountered fatal error:', err);
  if (server) server.close();
  process.exit(1);
});
