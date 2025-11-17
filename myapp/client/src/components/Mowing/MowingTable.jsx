// =====================================
// MowingTable.jsx — FINAL FIXED VERSION
// =====================================
import React, { useMemo } from "react";
import LabeledInput from "../LabeledInput";
import { useServiceContext } from "../../context/ServiceContext";

// Shared logic + constants
import {
  INITIAL_MOWING_DATA,
  EFFICIENCY_OPTIONS,
  SMPWR_EFFICIENCY_OPTIONS,
  DECK_KEYS,
  SMPWR_KEYS,
 // ROTARY_KEY,
} from "./mowingDefaults";

import { computeHours, computeTotals } from "./mowingCalculations";
import { saveMowing } from "./mowingSave";

export default function MowingTable({ tableId }) {
  const { currentServices, updateService, currentRates } = useServiceContext();

  const mowingDollars = currentRates?.mowingDollars || {};
  const acresPerHour = currentRates?.mowingFactors?.acresPerHour || {};

  const mowingList = Array.isArray(currentServices.mowing)
    ? currentServices.mowing
    : [];

  const tableEntry =
    mowingList.find((t) => t.id === tableId) || { id: tableId, data: {} };

  // ----------------------------------------------------
  // MERGE DEFAULT DATA + SAVED DATA
  // ----------------------------------------------------
  const data = useMemo(() => {
    return {
      ...INITIAL_MOWING_DATA,
      ...tableEntry.data,

      selectedEfficiency: {
        ...INITIAL_MOWING_DATA.selectedEfficiency,
        ...(tableEntry.data.selectedEfficiency || {}),
      },

      acres: {
        ...INITIAL_MOWING_DATA.acres,
        ...(tableEntry.data.acres || {}),
      },

      qtyUnit: {
        ...INITIAL_MOWING_DATA.qtyUnit,
        ...(tableEntry.data.qtyUnit || {}),
      },

      manualOverrides: {
        ...INITIAL_MOWING_DATA.manualOverrides,
        ...(tableEntry.data.manualOverrides || {}),
      },

      summary: {
        ...INITIAL_MOWING_DATA.summary,
        ...(tableEntry.data.summary || {}),
      },

      totals: tableEntry.data.totals || {},
    };
  }, [tableEntry.data]);

  // ----------------------------------------------------
  // COMPUTE HOURS + TOTALS (NO AUTO-SAVE)
  // ----------------------------------------------------
  const computedQtyUnit = computeHours(data, acresPerHour);
  const totals = computeTotals(data, computedQtyUnit, mowingDollars);

  // ----------------------------------------------------
  // SAVE helper
  // ----------------------------------------------------
  const save = (updated) => {
    saveMowing(tableId, updated, mowingList, updateService, totals);
  };

  // ----------------------------------------------------
  // INPUT HANDLERS
  // ----------------------------------------------------
  const handleNameChange = (e) => {
    save({ ...data, name: e.target.value });
  };

  const handleAcresChange = (key) => (e) => {
    const v = parseFloat(e.target.value) || 0;

    save({
      ...data,
      acres: { ...data.acres, [key]: v },
      manualOverrides: { ...data.manualOverrides, [key]: null },
    });
  };

  const handleEfficiencyChange = (key) => (e) => {
    save({
      ...data,
      selectedEfficiency: {
        ...data.selectedEfficiency,
        [key]: e.target.value,
      },
      manualOverrides: { ...data.manualOverrides, [key]: null },
    });
  };

  const handleSummaryChange = (k) => (e) => {
    const v = parseFloat(e.target.value) || 0;
    save({ ...data, summary: { ...data.summary, [k]: v } });
  };

  const handleManualOverride = (key) => (e) => {
    const raw = e.target.value;

    if (raw === "") {
      save({
        ...data,
        manualOverrides: { ...data.manualOverrides, [key]: null },
      });
      return;
    }

    let num = parseFloat(raw);
    if (isNaN(num)) num = 0;

    const snapped = Math.round(num * 4) / 4;
    const finalValue = Number(snapped.toFixed(2));

    save({
      ...data,
      manualOverrides: { ...data.manualOverrides, [key]: finalValue },
    });
  };

  const handleQtyChange = (key) => (e) => {
    let raw = e.target.value;
    if (raw === "") raw = "0";

    let num = parseFloat(raw);
    if (isNaN(num)) num = 0;

    const snapped = Math.round(num * 4) / 4;
    const finalValue = Number(snapped.toFixed(2));

    save({
      ...data,
      qtyUnit: { ...data.qtyUnit, [key]: finalValue },
    });
  };

  // ----------------------------------------------------
  // RENDER UI
  // ----------------------------------------------------
  return (
    <div
      style={{
        marginBottom: "2rem",
        border: "1px solid #ccc",
        padding: "1rem",
      }}
    >
      {/* NAME */}
      <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center" }}>
        <h3 style={{ marginRight: "1rem" }}>Mowing Area Name:</h3>
        <input
          type="text"
          value={data.name}
          onChange={handleNameChange}
          style={{ padding: "8px", fontSize: "16px", width: "33%" }}
        />
      </div>

      {/* TABLE */}
      <table
        border="1"
        style={{
          width: "100%",
          textAlign: "center",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th rowSpan="2">ITEM</th>
            <th rowSpan="2">MISC</th>

            <th colSpan="2">72&quot; area</th>
            <th colSpan="2">60&quot; area</th>
            <th colSpan="2">48&quot; area</th>

            <th colSpan="3">LABOR</th>

            <th rowSpan="2">5111</th>
            <th rowSpan="2"># OCC</th>
            <th rowSpan="2" style={{ backgroundColor: "yellow" }}>
              <LabeledInput
                value={data.summary.numOccurrences}
                onChange={handleSummaryChange("numOccurrences")}
                step={1}
                min={0}
                type="number"
                label=""
              />
            </th>
          </tr>

          <tr>
            <th>area1</th>
            <th>area2</th>
            <th>area1</th>
            <th>area2</th>
            <th>area1</th>
            <th>area2</th>
            <th>TRIMMER</th>
            <th>BLOWER</th>
            <th>ROTARY</th>
          </tr>
        </thead>

        <tbody>
          {/* EFFICIENCY ROW */}
          <tr style={{ background: "#e9f7ef", fontWeight: "bold" }}>
            <td>EFFICIENCY</td>
            <td style={{ background: "#ccc" }}></td>

            {DECK_KEYS.map((key) => (
              <td key={key}>
                <select
                  value={data.selectedEfficiency[key]}
                  onChange={handleEfficiencyChange(key)}
                  style={{ width: "100%", padding: "5px" }}
                >
                  {EFFICIENCY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </td>
            ))}

            {SMPWR_KEYS.map((key) => (
              <td key={key}>
                <select
                  value={data.selectedEfficiency[key]}
                  onChange={handleEfficiencyChange(key)}
                  style={{ width: "100%", padding: "5px" }}
                >
                  {SMPWR_EFFICIENCY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </td>
            ))}

            <td style={{ background: "#ccc" }}></td>
            <td>HRS/OCC:</td>
            <td style={{ background: "#eef" }}>
              {totals.totalHours.toFixed(2)}
            </td>
          </tr>

          {/* ACRES ROW */}
          <tr>
            <td>ACRES</td>
            <td style={{ background: "#ccc" }}></td>

            {DECK_KEYS.map((key) => (
              <td key={key}>
                <LabeledInput
                  value={data.acres[key]}
                  onChange={handleAcresChange(key)}
                  step={0.25}
                  min={0}
                  type="number"
                  label=""
                />
              </td>
            ))}

            <td style={{ background: "#ccc" }}></td>
            <td style={{ background: "#ccc" }}></td>
            <td style={{ background: "#ccc" }}></td>

            <td>ACRES:</td>
            <td style={{ background: "#eef" }}>
              {totals.totalAcres.toFixed(2)}
            </td>
          </tr>

          {/* HOURS/QTY ROW */}
          <tr>
            <td>QTY/UNIT</td>

            <td style={{ background: "#b3d9ff" }}>
              <LabeledInput
                value={data.qtyUnit.MISC_HRS.toFixed(2)}
                onChange={handleQtyChange("MISC_H_HRS")}
                step={0.25}
                min={0}
                type="number"
                label="HRS"
              />
            </td>

            {DECK_KEYS.map((key) => (
              <td key={key} style={{ background: "#b3d9ff" }}>
                <LabeledInput
                  value={(data.manualOverrides[key] ?? computedQtyUnit[key]).toFixed(
                    2
                  )}
                  onChange={handleManualOverride(key)}
                  step={0.25}
                  min={0}
                  type="number"
                  label=""
                />
              </td>
            ))}

            {/* LABOR */}
            <td style={{ background: "#b3d9ff" }}>
              <LabeledInput
                value={data.qtyUnit.TRIMMER.toFixed(2)}
                onChange={handleQtyChange("TRIMMER")}
                step={0.25}
                min={0}
                type="number"
                label="HRS"
              />
            </td>

            <td style={{ background: "#b3d9ff" }}>
              <LabeledInput
                value={data.qtyUnit.BLOWER.toFixed(2)}
                onChange={handleQtyChange("BLOWER")}
                step={0.25}
                min={0}
                type="number"
                label="HRS"
              />
            </td>

            <td style={{ background: "#b3d9ff" }}>
              <LabeledInput
                value={data.qtyUnit.ROTARY.toFixed(2)}
                onChange={handleQtyChange("ROTARY")}
                step={0.25}
                min={0}
                type="number"
                label="HRS"
              />
            </td>

            <td style={{ background: "#b3d9ff" }}>
              <LabeledInput
                value={data.qtyUnit["5111"].toFixed(2)}
                onChange={handleQtyChange("5111")}
                step={0.25}
                min={0}
                type="number"
                label="HRS"
              />
            </td>

            <td>$/OCC:</td>
            <td style={{ background: "#eef" }}>
              {totals.totalOcc.toFixed(2)}
            </td>
          </tr>

          {/* UNIT PRICE ROW */}
          <tr>
            <td>UNIT $</td>

            <td>${(mowingDollars.MISC_HRS || 0).toFixed(2)}</td>

            {DECK_KEYS.map((key) => (
              <td key={key}>
                ${Number(mowingDollars[key] || 0).toFixed(2)}
              </td>
            ))}

            <td>${Number(mowingDollars.TRIMMER || 0).toFixed(2)}</td>
            <td>${Number(mowingDollars.BLOWER || 0).toFixed(2)}</td>
            <td>${Number(mowingDollars.ROTARY || 0).toFixed(2)}</td>
            <td>${Number(mowingDollars["5111"] || 0).toFixed(2)}</td>

            <td>
              <LabeledInput
                value={data.summary.adjPercent}
                onChange={handleSummaryChange("adjPercent")}
                step={0.5}
                min={-100}
                type="number"
                label="ADJ%"
              />
            </td>

            <td style={{ background: "#eef" }}>
              ${totals.adjDollar.toFixed(2)}
            </td>
          </tr>

          {/* TOTAL ROW */}
          <tr style={{ background: "#f2f2f2", fontWeight: "bold" }}>
            <td>TOTAL</td>

            <td>${Number(totals.rowTotals.MISC_HRS || 0).toFixed(2)}</td>

            {DECK_KEYS.map((key) => (
              <td key={key}>
                ${Number(totals.rowTotals[key] || 0).toFixed(2)}
              </td>
            ))}

            <td>${Number(totals.rowTotals.TRIMMER || 0).toFixed(2)}</td>
            <td>${Number(totals.rowTotals.BLOWER || 0).toFixed(2)}</td>
            <td>${Number(totals.rowTotals.ROTARY || 0).toFixed(2)}</td>
            <td>${Number(totals.rowTotals["5111"] || 0).toFixed(2)}</td>

            <td>TOTAL $</td>
            <td style={{ background: "yellow" }}>
              ${totals.final.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
