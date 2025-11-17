// ===============================
// BedMaintenanceTable.jsx — FIXED VERSION
// ===============================
import React, { useCallback, useMemo } from "react";
import LabeledInput from "./LabeledInput";
import { useServiceContext } from "../context/ServiceContext";

// Default structure
const INITIAL_BED_MAINTENANCE_DATA = {
  qtyUnit: { HAND: 0, BACKPACK: 0, ROUNDUP: 0 },
  unitPrice: { HAND: 55, BACKPACK: 55, ROUNDUP: 50 },
  summary: {
    adjPercent: 0,
    numOccurrences: 1,
  },
  totals: {}, // <-- REQUIRED for Services preview
};

export default function BedMaintenanceTable({ tableId }) {
  const { currentServices, updateService } = useServiceContext();

  // Always keep exactly one BedMaintenance table
  const serviceData = useMemo(() => {
    const d = currentServices.bedMaintenance;
    return Array.isArray(d) && d.length > 0 ? d : [{ id: tableId, data: {} }];
  }, [currentServices.bedMaintenance, tableId]);

  const tableEntry =
    serviceData.find((t) => t.id === tableId) || { id: tableId, data: {} };

  // Merge defaults + saved
  const data = useMemo(
    () => ({
      ...INITIAL_BED_MAINTENANCE_DATA,
      ...tableEntry.data,
      qtyUnit: {
        ...INITIAL_BED_MAINTENANCE_DATA.qtyUnit,
        ...(tableEntry.data.qtyUnit || {}),
      },
      unitPrice: {
        ...INITIAL_BED_MAINTENANCE_DATA.unitPrice,
        ...(tableEntry.data.unitPrice || {}),
      },
      summary: {
        ...INITIAL_BED_MAINTENANCE_DATA.summary,
        ...(tableEntry.data.summary || {}),
      },
      totals: {
        ...(tableEntry.data.totals || {}),
      },
    }),
    [tableEntry.data]
  );

  // ============================================================
  // CALCULATE TOTALS
  // ============================================================
  function computeTotals(target) {
    const qty = target.qtyUnit;
    const prices = target.unitPrice;

    const rowTotals = {};
    let totalOccDollar = 0;

    Object.keys(prices).forEach((key) => {
      const subtotal = (qty[key] || 0) * (prices[key] || 0);
      rowTotals[key] = subtotal;
      totalOccDollar += subtotal;
    });

    const sumHours = Object.values(qty).reduce(
      (sum, v) => sum + (parseFloat(v) || 0),
      0
    );

    const numOcc = target.summary.numOccurrences || 1;
    const finalTotal = totalOccDollar * numOcc;

    return {
      rowTotals,
      totalOccDollar,
      sumHours,
      finalTotal,
    };
  }

  const totals = computeTotals(data);

  // ============================================================
  // SAVE — with totals included
  // ============================================================
  const save = (updated) => {
    const totals = computeTotals(updated);
    updated = { ...updated, totals };

    // Always save exactly ONE table
    const newArray = [{ id: tableId, data: updated }];

    updateService("bedMaintenance", newArray);
  };

  // ============================================================
  // Unified change handler
  // ============================================================
  const handleRowChange = useCallback(
    (rowKey, keyName) => (e) => {
      const val =
        e.target.type === "number" ? parseFloat(e.target.value) : e.target.value;

      const numeric = isNaN(val) ? 0 : val;

      const updatedRow = { ...data[rowKey], [keyName]: numeric };
      const updatedData = { ...data, [rowKey]: updatedRow };

      save(updatedData);
    },
    [data]
  );

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <table
      border="1"
      style={{
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "center",
        marginBottom: "1rem",
      }}
    >
      <thead>
        <tr>
          <th>ITEM</th>
          <th>HAND</th>
          <th>BACKPACK</th>
          <th>ROUNDUP</th>

          <th># OCC</th>
          <th style={{ backgroundColor: "yellow" }}>
            <LabeledInput
              value={data.summary.numOccurrences}
              onChange={handleRowChange("summary", "numOccurrences")}
              step={1}
              min={0}
              type="number"
              label=""
            />
          </th>
        </tr>
      </thead>

      <tbody>
        {/* QTY ROW */}
        <tr>
          <td>QTY/UNIT</td>

          <td>
            <LabeledInput
              value={data.qtyUnit.HAND}
              onChange={handleRowChange("qtyUnit", "HAND")}
              step={0.1}
              min={0}
              label="HRS"
            />
          </td>

          <td>
            <LabeledInput
              value={data.qtyUnit.BACKPACK}
              onChange={handleRowChange("qtyUnit", "BACKPACK")}
              step={0.1}
              min={0}
              label="QTY"
            />
          </td>

          <td>
            <LabeledInput
              value={data.qtyUnit.ROUNDUP}
              onChange={handleRowChange("qtyUnit", "ROUNDUP")}
              step={0.1}
              min={0}
              label="QTY"
            />
          </td>

          <td>TOT HRS</td>
          <td style={{ backgroundColor: "#eef" }}>
            {totals.sumHours.toFixed(2)}
          </td>
        </tr>

        {/* UNIT PRICE */}
        <tr>
          <td>UNIT $</td>
          <td>${data.unitPrice.HAND.toFixed(2)}</td>
          <td>${data.unitPrice.BACKPACK.toFixed(2)}</td>
          <td>${data.unitPrice.ROUNDUP.toFixed(2)}</td>

          <td>$/OCC</td>
          <td style={{ backgroundColor: "#eef" }}>
            ${totals.totalOccDollar.toFixed(2)}
          </td>
        </tr>

        {/* TOTAL */}
        <tr style={{ backgroundColor: "#f2f2f2", fontWeight: "bold" }}>
          <td>TOTAL</td>

          <td>${totals.rowTotals.HAND.toFixed(2)}</td>
          <td>${totals.rowTotals.BACKPACK.toFixed(2)}</td>
          <td>${totals.rowTotals.ROUNDUP.toFixed(2)}</td>

          <td>TOTAL $</td>
          <td style={{ background: "yellow" }}>
            ${totals.finalTotal.toFixed(2)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
