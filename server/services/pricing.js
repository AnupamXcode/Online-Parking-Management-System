/**
 * Fee Calculation Engine according to Section 12 requirements:
 * Transparent billing policy:
 * - Round any started hour up to the next billable hour
 * - Minimum charge: 1 hour
 * - Standard GST / Service Tax breakdown (18%)
 */
function calculateExitFee(actualEntryTime, actualExitTime, hourlyRate) {
  const entryDate = new Date(actualEntryTime);
  const exitDate = new Date(actualExitTime);

  if (isNaN(entryDate.getTime()) || isNaN(exitDate.getTime())) {
    throw new Error('Invalid entry or exit timestamps');
  }

  const durationMs = Math.max(0, exitDate.getTime() - entryDate.getTime());
  const durationMinutes = Math.max(1, Math.round(durationMs / 60000));
  
  // Round up to next whole hour, minimum 1 hour
  const billableHours = Math.max(1, Math.ceil(durationMinutes / 60));
  
  const baseAmount = billableHours * hourlyRate;
  const taxRate = 0.18; // 18% GST standard
  const taxAmount = Math.round(baseAmount * taxRate * 100) / 100;
  const finalAmount = Math.round((baseAmount + taxAmount) * 100) / 100;

  return {
    entryTime: entryDate.toISOString(),
    exitTime: exitDate.toISOString(),
    durationMinutes,
    durationFormatted: formatDuration(durationMinutes),
    hourlyRate,
    billableHours,
    baseAmount,
    taxRatePercentage: 18,
    taxAmount,
    finalAmount
  };
}

function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

module.exports = {
  calculateExitFee,
  formatDuration
};
