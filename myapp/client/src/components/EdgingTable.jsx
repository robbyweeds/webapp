// ===============================
// EdgingTable.jsx — FINAL VERSION
// ===============================
import React, { useCallback, useMemo } from "react";
import LabeledInput from "./LabeledInput";
import { useServiceContext } from "../context/ServiceContext";

// Default structure for Edging data
const INITIAL_EDGING_DATA = {
  qtyUnit: { EDGER: 0, BLOWER: 0 },
  unitPrice: { EDGER: 55, BLOWER: 55 },
  summary: {
    adjPercent: 0, // Retained for consistency
    numOccurrences: 1,
  },
  totals: {
    sumHours: 0,
    totalOccDollar: 0,
    finalTotal: 0,
  }
};

export default function EdgingTable({ tableId }) {
  const { currentServices, updateService } = useServiceContext();

  // --- Load existing edging tables ---
  const serviceData = useMemo(() => {
    const data = currentServices.edging;
    return Array.isArray(data) ? data : [];
  }, [currentServices.edging]);

  const tableEntry =
    serviceData.find((t) => t.id === tableId) || { id: tableId, data: {} };

  // --- Merge saved data with defaults ---
  const data = useMemo(
    () => ({
      ...INITIAL_EDGING_DATA,
      ...tableEntry.data,
      qtyUnit: {
        ...INITIAL_EDGING_DATA.qtyUnit,
        ...(tableEntry.data.qtyUnit || {})
      },
      unitPrice: {
        ...INITIAL_EDGING_DATA.unitPrice,
        ...(tableEntry.data.unitPrice || {})
      },
      summary: {
        ...INITIAL_EDGING_DATA.summary,
        ...(tableEntry.data.summary || {})
      }
    }),
    [tableEntry.data]
  );

  // Save updated data into context
  const save = useCallback(
    (updated) => {
      const updatedList = serviceData.some((t) => t.id === tableId)
        ? serviceData.map((t) =>
            t.id === tableId ? { id: tableId, data: updated } : t
          )
        : [...serviceData, { id: tableId, data: updated }];

      updateService("edging", updatedList);
    },
    [serviceData, tableId, updateService]
  );

  // Unified change handler
  const handleRowChange = useCallback(
    (rowKey, inputKey) => (e) => {
      const raw = e.target.value;
      const numericValue = parseFloat(raw) || 0;

      const updated = {
        ...data,
        [rowKey]: { ...data[rowKey], [inputKey]: numericValue }
      };

      // Also save totals
      updated.totals = computeTotals(updated);

      save(updated);
    },
    [data, save]
  );

  // --- CALCULATIONS (isolated) ---
  const computeTotals = (d) => {
    let totalOccDollar = 0;
    const totalRow = {};

    Object.keys(d.unitPrice).forEach((col) => {
      const qty = d.qtyUnit[col] || 0;
      const price = d.unitPrice[col] || 0;
      const t = qty * price;
      totalRow[col] = t;
      totalOccDollar += t;
    });

    const sumHours = Object.values(d.qtyUnit).reduce(
      (sum, v) => sum + (v || 0),
      0
    );

    const finalTotal = totalOccDollar * (d.summary.numOccurrences || 1);

    return {
      sumHours,
      totalOccDollar,
      finalTotal,
      totalRow
    };
  };

  const totals = useMemo(() => computeTotals(data), [data]);

  // --- TABLE RENDER ---
  return (
    <table
      border="1"
      style={{
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "center"
      }}
    >
      <thead>
        <tr>
          <th>ITEM</th>
          <th>EDGER</th>
          <th>BLOWER</th>
          <th style={{ width: "8%" }}># OCC</th>
          <th style={{ width: "8%", backgroundColor: "yellow" }}>
            <LabeledInput
              value={data.summary.numOccurrences}
              onChange={handleRowChange("summary", "numOccurrences")}
              step={1}
              min={0}
              label=""
              type="number"
            />
          </th>
        </tr>
      </thead>

      <tbody>
        {/* QTY / UNIT */}
        <tr>
          <td>QTY/UNIT</td>

          <td>
            <LabeledInput
              value={data.qtyUnit.EDGER}
              onChange={handleRowChange("qtyUnit", "EDGER")}
              step={0.1}
              min={0}
              label="HRS"
            />
          </td>

          <td>
            <LabeledInput
              value={data.qtyUnit.BLOWER}
              onChange={handleRowChange("qtyUnit", "BLOWER")}
              step={0.1}
              min={0}
              label="HRS"
            />
          </td>

          <td>HRS/OCC</td>
          <td style={{ backgroundColor: "#eef" }}>
            {totals.sumHours.toFixed(2)}
          </td>
        </tr>

        {/* UNIT $ */}
        <tr>
          <td>UNIT $</td>
          <td>${data.unitPrice.EDGER.toFixed(2)}</td>
          <td>${data.unitPrice.BLOWER.toFixed(2)}</td>

          <td>$/OCC</td>
          <td style={{ backgroundColor: "#eef" }}>
            ${totals.totalOccDollar.toFixed(2)}
          </td>
        </tr>

        {/* TOTAL */}
        <tr style={{ backgroundColor: "#f2f2f2", fontWeight: "bold" }}>
          <td>TOTAL</td>

          <td>${totals.totalRow?.EDGER?.toFixed(2) || "0.00"}</td>
          <td>${totals.totalRow?.BLOWER?.toFixed(2) || "0.00"}</td>

          <td>TOTAL $</td>
          <td style={{ background: "yellow" }}>
            ${totals.finalTotal.toFixed(2)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
