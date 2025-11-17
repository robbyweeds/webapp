// =====================================
// mowingCalculations.js — FINAL VERSION
// =====================================

// Compute hours correctly using UPDATED data
export function computeHours(targetData, acresPerHour) {
  const out = { ...targetData.qtyUnit };

  Object.keys(targetData.acres).forEach((key) => {
    const acres = Number(targetData.acres[key] || 0);
    const size = key.split("-")[0];
    const eff = targetData.selectedEfficiency[key];

    const rate =
      acresPerHour?.[size]?.[eff] != null
        ? acresPerHour[size][eff]
        : 0;

    const autoValue = rate > 0 ? acres / rate : 0;
    const autoRounded = Number((Math.round(autoValue * 4) / 4).toFixed(2));

    // use manual override if present
    out[key] =
      targetData.manualOverrides[key] !== null
        ? targetData.manualOverrides[key]
        : autoRounded;
  });

  return out;
}

// Compute totals using UPDATED data + UPDATED hours
export function computeTotals(targetData, qtyUnit, mowingDollars) {
  let totalOcc = 0;
  const rowTotals = {};

  Object.keys(qtyUnit).forEach((key) => {
    const hrs = Number(qtyUnit[key] || 0);
    const price = Number(mowingDollars[key] || 0);
    const subtotal = hrs * price;

    rowTotals[key] = subtotal;
    totalOcc += subtotal;
  });

  const totalHours = Object.values(qtyUnit).reduce(
    (sum, v) => sum + Number(v || 0),
    0
  );

  const totalAcres = Object.values(targetData.acres).reduce(
    (sum, v) => sum + Number(v || 0),
    0
  );

  const adjDollar =
    totalOcc * (1 + (targetData.summary.adjPercent || 0) / 100);

  const final =
    adjDollar * (targetData.summary.numOccurrences || 1);

  return {
    totalHours,
    totalAcres,
    totalOcc,
    adjDollar,
    final,
    rowTotals,
  };
}
