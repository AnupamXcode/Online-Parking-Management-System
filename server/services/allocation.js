const { db } = require('../db/database');

/**
 * Deterministic Slot Allocation Engine
 * Checks interval conflicts against existing reservations & active vehicle occupancy.
 */
function allocateParkingSlot({
  facilityId,
  vehicleCategory,
  startTime,
  expectedEndTime,
  preferredSlotId = null
}) {
  const start = new Date(startTime);
  const end = new Date(expectedEndTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { success: false, message: 'Invalid start or expected end time provided.' };
  }

  if (end <= start) {
    return { success: false, message: 'Expected exit time must be strictly after entry time.' };
  }

  // 1. Fetch all slots for this facility that are not permanently out of service
  const facility = db.prepare('SELECT * FROM parking_facilities WHERE id = ?').get(facilityId);
  if (!facility) {
    return { success: false, message: 'Selected parking facility does not exist.' };
  }

  if (facility.status === 'maintenance') {
    return { success: false, message: 'This parking facility is currently under maintenance.' };
  }

  // 2. Fetch all slots compatible with the requested vehicle category
  const allSlots = db.prepare(`
    SELECT s.*, 
      (SELECT occupancy_detected FROM smart_sensors WHERE slot_id = s.id) as sensor_occupied
    FROM parking_slots s
    WHERE s.facility_id = ? 
      AND s.status != 'out_of_service'
      AND (s.compatible_category = ? OR s.compatible_category = 'all')
    ORDER BY s.floor ASC, s.zone ASC, s.priority ASC, s.slot_number ASC
  `).all(facilityId, vehicleCategory);

  if (!allSlots.length) {
    return { 
      success: false, 
      message: `No parking slots in ${facility.name} support vehicle category '${vehicleCategory}'.` 
    };
  }

  // 3. Find slots that have overlapping reservations
  // Overlap condition: (res.start_time < requested.end) AND (res.expected_end_time > requested.start)
  // for reservations that are 'reserved' or 'checked_in'
  const overlappingRows = db.prepare(`
    SELECT DISTINCT slot_id 
    FROM reservations
    WHERE facility_id = ?
      AND status IN ('reserved', 'checked_in')
      AND (start_time < ? AND expected_end_time > ?)
  `).all(facilityId, end.toISOString(), start.toISOString());

  const conflictingSlotIds = new Set(overlappingRows.map(r => r.slot_id));

  // Also check if any slot is currently physically occupied (checked_in right now without exit)
  // and requested start time is within the next 30 minutes
  const now = new Date();
  const isStartingSoon = (start.getTime() - now.getTime()) < 30 * 60 * 1000;
  if (isStartingSoon) {
    const currentlyOccupied = db.prepare(`
      SELECT id FROM parking_slots 
      WHERE facility_id = ? AND status = 'occupied'
    `).all(facilityId);
    currentlyOccupied.forEach(row => conflictingSlotIds.add(row.id));
  }

  // Filter available candidate slots
  const availableSlots = allSlots.filter(s => !conflictingSlotIds.has(s.id));

  if (!availableSlots.length) {
    return {
      success: false,
      message: `All compatible slots at ${facility.name} are booked or occupied during the selected time interval (${new Date(startTime).toLocaleString()} - ${new Date(expectedEndTime).toLocaleString()}). Please choose another time or facility.`
    };
  }

  // Check preferred slot or pick the best deterministic candidate
  let chosenSlot = null;
  if (preferredSlotId) {
    chosenSlot = availableSlots.find(s => s.id === Number(preferredSlotId));
    if (!chosenSlot) {
      return {
        success: false,
        message: 'Your preferred slot is not available for this time window. Please select another slot or choose automatic allocation.'
      };
    }
  } else {
    chosenSlot = availableSlots[0];
  }

  // Calculate duration and estimated price
  const durationHours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
  const estimatedAmount = durationHours * chosenSlot.hourly_rate;

  return {
    success: true,
    facility,
    slot: chosenSlot,
    availableSlots,
    durationHours,
    estimatedAmount
  };
}

module.exports = {
  allocateParkingSlot
};
