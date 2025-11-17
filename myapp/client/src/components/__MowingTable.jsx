// ===============================
// MowingTable.jsx — FINAL FIXED VERSION
// ===============================
import React, { useMemo } from "react";
import LabeledInput from "./LabeledInput";
import { useServiceContext } from "../context/ServiceContext";

// --------------------------------------
// OPTIONS
// --------------------------------------
const EFFICIENCY_OPTIONS = [
  "OBSTACLES",
  "HOA_HOMES",
  "AVERAGE",
  "OPEN_LAWN",
  "FIELDS",
  "MONTHLY",
  "DOUBLE_CUT",
];

const SMPWR_EFFICIENCY_OPTIONS = [
  "MINIMUM",
  "LESS",
  "AVERAGE",
  "HOA_HOMES",
  "HIGH_END_DETAILING",
];

const DECK_KEYS = [
  "72-area1",
  "72-area2",
  "60-area1",
  "60-area2",
  "48-area1",
  "48-area2",
];

const SMPWR_KEYS = ["TRIMMER", "BLOWER"];
const ROTARY_KEY = "ROTARY";

const DISPLAY_KEYS = [
  "MISC_HRS",
  ...DECK_KEYS,
  ...SMPWR_KEYS,
  ROTARY_KEY,
  "5111",
];

// --------------------------------------
// DEFAULT DATA
// --------------------------------------
const INITIAL_MOWING_DATA = {
  name: "Mowing Area",

  selectedEfficiency: {
    "72-area1": "AVERAGE",
    "72-area2": "AVERAGE",
    "60-area1": "AVERAGE",
    "60-area2": "AVERAGE",
    "48-area1": "AVERAGE",
    "48-area2": "AVERAGE",
    TRIMMER: "AVERAGE",
    BLOWER: "AVERAGE",
  },

  acres: {
    "72-area1": 0,
    "72-area2": 0,
    "60-area1": 0,
    "60-area2": 0,
    "48-area1": 0,
    "48-area2": 0,
    TRIMMER: 0,
    BLOWER: 0,
    ROTARY: 0,
  },

  qtyUnit: {
    MISC_HRS: 0,
    "72-area1": 0,
    "72-area2": 0,
    "60-area1": 0,
    "60-area2": 0,
    "48-area1": 0,
    "48-area2": 0,
    TRIMMER: 0,
    BLOWER: 0,
    ROTARY: 0,
    "5111": 0,
  },

  manualOverrides: {
    "72-area1": null,
    "72-area2": null,
    "60-area1": null,
    "60-area2": null,
    "48-area1": null,
    "48-area2": null,
  },

  summary: {
    adjPercent: 0,
    numOccurrences: 1,
  },

  totals: {},
};

// --------------------------------------
// COMPONENT
// --------------------------------------
export default function MowingTable({ tableId }) {
  const { currentServices, updateService, currentRates } = useServiceContext();

  const mowingDollars = currentRates?.mowingDollars || {};
  const acresPerHour = currentRates?.mowingFactors?.acresPerHour || {};

  const mowingList = Array.isArray(currentServices.mowing)
    ? currentServices.mowing
    : [];

  const tableEntry =
    mowingList.find((t) => t.id === tableId) || { id: tableId, data: {} };

  // Merge saved + defaults
  const data = useMemo(
    () => ({
      ...INITIAL_MOWING_DATA,
      ...tableEntry.data,

      acres: {
        ...INITIAL_MOWING_DATA.acres,
        ...(tableEntry.data.acres || {}),
      },

      qtyUnit: {
        ...INITIAL_MOWING_DATA.qtyUnit,
        ...(tableEntry.data.qtyUnit || {}),
      },

      selectedEfficiency: {
        ...INITIAL_MOWING_DATA.selectedEfficiency,
        ...(tableEntry.data.selectedEfficiency || {}),
      },

      manualOverrides: {
        ...INITIAL_MOWING_DATA.manualOverrides,
        ...(tableEntry.data.manualOverrides || {}),
      },

      summary: {
        ...INITIAL_MOWING_DATA.summary,
        ...(tableEntry.data.summary || {}),
      },

      totals: {
        ...(tableEntry.data.totals || {}),
      },
    }),
    [tableEntry.data]
  );

  // ============================================================
  // COMPUTE HOURS
  // ============================================================
  const computedQtyUnit = useMemo(() => {
    const out = { ...data.qtyUnit };

    DECK_KEYS.forEach((key) => {
      const acres = Number(data.acres[key] || 0);
      const size = key.split("-")[0];
      const eff = data.selectedEfficiency[key];

      const rate = acresPerHour?.[size]?.[eff] ?? 0;

      const autoValue = rate > 0 ? acres / rate : 0;
      const autoRounded = Number((Math.round(autoValue * 4) / 4).toFixed(2));

      out[key] =
        data.manualOverrides[key] !== null
          ? data.manualOverrides[key]
          : autoRounded;
    });

    return out;
  }, [
    data.acres,
    data.selectedEfficiency,
    data.manualOverrides,
    data.qtyUnit,
    acresPerHour,
  ]);

  // ============================================================
  // CALCULATE TOTALS
  // ============================================================
  function computeTotals(targetData) {
    const qty = computedQtyUnit;
    let totalOcc = 0;
    const rowTotals = {};

    DISPLAY_KEYS.forEach((key) => {
      const hrs = Number(qty[key] || 0);
      const price = Number(mowingDollars[key] || 0);
      const subtotal = hrs * price;
      rowTotals[key] = subtotal;
      totalOcc += subtotal;
    });

    const totalHours = DISPLAY_KEYS.reduce(
      (sum, key) => sum + Number(qty[key] || 0),
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

  const totals = computeTotals(data);

  // ============================================================
  // SAVE — inject totals before storing
  // ============================================================
  const save = (updated) => {
    const totals = computeTotals(updated);
    updated = { ...updated, totals };

    const newList = mowingList.some((t) => t.id === tableId)
      ? mowingList.map((t) =>
          t.id === tableId ? { id: tableId, data: updated } : t
        )
      : [...mowingList, { id: tableId, data: updated }];

    updateService("mowing", newList);
  };

  // ============================================================
  // EVENT HANDLERS (unchanged logic)
  // ============================================================
  const handleNameChange = (e) => {
    save({ ...data, name: e.target.value });
  };

  const handleAcresChange = (key) => (e) => {
    const v = parseFloat(e.target.value) || 0;

    const newOverrides = {
      ...data.manualOverrides,
      [key]: null,
    };

    save({
      ...data,
      acres: { ...data.acres, [key]: v },
      manualOverrides: newOverrides,
    });
  };

  const handleEfficiencyChange = (key) => (e) => {
    const newOverrides = {
      ...data.manualOverrides,
      [key]: null,
    };

    save({
      ...data,
      selectedEfficiency: {
        ...data.selectedEfficiency,
        [key]: e.target.value,
      },
      manualOverrides: newOverrides,
    });
  };

  const handleSummaryChange = (k) => (e) => {
    const v = parseFloat(e.target.value) || 0;
    save({
      ...data,
      summary: { ...data.summary, [k]: v },
    });
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

  // ============================================================
  // RENDER ORIGINAL UI (FULLY RESTORED)
  // ============================================================
  return (
    <div
      style={{
        marginBottom: "2rem",
        border: "1px solid #ccc",
        padding: "1rem",
      }}
    >
      {/* NAME */}
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h3 style={{ marginRight: "1rem" }}>Mowing Area Name:</h3>
        <input
          type="text"
          value={data.name}
          onChange={handleNameChange}
          style={{ padding: "8px", fontSize: "16px", width: "33%" }}
        />
      </div>

      {/* FULL TABLE UI */}
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

            {/* FIXED ERROR HERE */}
            <th rowSpan="2"># OCC</th>

            <th
              rowSpan="2"
              style={{ backgroundColor: "yellow" }}
            >
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
          {/* EFFICIENCY */}
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
            <td></td>
            <td>HRS/OCC:</td>
            <td style={{ background: "#eef" }}>
              {totals.totalHours.toFixed(2)}
            </td>
          </tr>

          {/* ACRES */}
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

            <td></td>
            <td>ACRES:</td>
            <td style={{ background: "#eef" }}>
              {totals.totalAcres.toFixed(2)}
            </td>
          </tr>

          {/* HOURS */}
          <tr>
            <td>QTY/UNIT</td>

            {/* MISC */}
            <td style={{ background: "#b3d9ff" }}>
              <LabeledInput
                value={data.qtyUnit.MISC_HRS.toFixed(2)}
                onChange={handleQtyChange("MISC_HRS")}
                step={0.25}
                min={0}
                type="number"
                label="HRS"
              />
            </td>

            {DECK_KEYS.map((key) => (
              <td key={key} style={{ background: "#b3d9ff" }}>
                <LabeledInput
                  value={(
                    data.manualOverrides[key] ?? computedQtyUnit[key]
                  ).toFixed(2)}
                  onChange={handleManualOverride(key)}
                  step={0.25}
                  min={0}
                  type="number"
                  label=""
                />
              </td>
            ))}

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

          {/* UNIT PRICE */}
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
