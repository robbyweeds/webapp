// myapp/client/src/components/ServicesPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

import { INITIAL_MOWING_DATA } from "./Mowing/mowingDefaults";
import { computeHours, computeTotals } from "./Mowing/mowingCalculations";

export default function ServicesPage() {
  const navigate = useNavigate();

  const { currentServices, updateService, getAllServices, currentRates } =
    useServiceContext();

  const API_URL = process.env.REACT_APP_API_URL;

  const [project, setProject] = useState({
    projectName: "",
    date: "",
    acres: "",
  });

  // Load project info
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("project"));
    if (stored) setProject(stored);
  }, []);

  // -------------------------
  // DELETE ENTRIES
  // -------------------------
  const deleteMowing = (id) => {
    const updated = (currentServices.mowing || []).filter((m) => m.id !== id);
    updateService("mowing", updated);
  };

  const deleteMulching = (id) => {
    const updated = (currentServices.mulching || []).filter((m) => m.id !== id);
    updateService("mulching", updated);
  };

  // -------------------------
  // MOWING PREVIEW CALC
  // -------------------------
  const acresPerHour = currentRates?.mowingFactors?.acresPerHour || {};
  const mowingDollars = currentRates?.mowingDollars || {};

  const computeMowingPreview = (entry) => {
    const raw = entry.data || {};

    const merged = {
      ...INITIAL_MOWING_DATA,
      ...raw,
      acres: { ...INITIAL_MOWING_DATA.acres, ...(raw.acres || {}) },
      qtyUnit: { ...INITIAL_MOWING_DATA.qtyUnit, ...(raw.qtyUnit || {}) },
      selectedEfficiency: {
        ...INITIAL_MOWING_DATA.selectedEfficiency,
        ...(raw.selectedEfficiency || {}),
      },
      manualOverrides: {
        ...INITIAL_MOWING_DATA.manualOverrides,
        ...(raw.manualOverrides || {}),
      },
      summary: {
        ...INITIAL_MOWING_DATA.summary,
        ...(raw.summary || {}),
      },
    };

    const qty = computeHours(merged, acresPerHour);
    const totals = computeTotals(merged, qty, mowingDollars);

    return { merged, totals };
  };

  // -------------------------
  // EDGING PREVIEW (same logic as your old version)
  // -------------------------
  const computeEdgingTotals = (entry) => {
    const d = entry.data || {};

    const qty = d.qtyUnit || { EDGER: 0, BLOWER: 0 };
    const price = d.unitPrice || { EDGER: 0, BLOWER: 0 };
    const occ = d.summary?.numOccurrences || 0;

    const totalRow = {
      EDGER: qty.EDGER * price.EDGER,
      BLOWER: qty.BLOWER * price.BLOWER,
    };

    const totalOccDollar = totalRow.EDGER + totalRow.BLOWER;
    const finalTotal = totalOccDollar * occ;

    return { qty, price, occ, totalOccDollar, finalTotal };
  };

  // -------------------------
  // BED MAINT PREVIEW (same logic as your old version)
  // -------------------------
  const computeBedTotals = (entry) => {
    const d = entry.data || {};

    const qty = d.qtyUnit || { HAND: 0, BACKPACK: 0, ROUNDUP: 0 };
    const price = d.unitPrice || { HAND: 0, BACKPACK: 0, ROUNDUP: 0 };
    const occ = d.summary?.numOccurrences || 0;

    const occDollar =
      qty.HAND * price.HAND +
      qty.BACKPACK * price.BACKPACK +
      qty.ROUNDUP * price.ROUNDUP;

    const finalTotal = occDollar * occ;

    return { qty, price, occ, occDollar, finalTotal };
  };

  // -------------------------
  // SAVE PROJECT
  // -------------------------
  const handleSaveProject = async () => {
    const services = getAllServices() || {};

    const sanitized = {};
    Object.entries(services).forEach(([key, value]) => {
      sanitized[key] = value || {};
    });

    if (!project.projectName || !project.date || !project.acres) {
      alert("Project info is missing");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, services: sanitized }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Project saved!");
        navigate("/");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Network Error");
    }
  };

  const hasAnyService =
    (currentServices.mowing?.length || 0) > 0 ||
    (currentServices.mulching?.length || 0) > 0 ||
    (currentServices.edging?.length || 0) > 0 ||
    (currentServices.bedMaintenance?.length || 0) > 0;

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
      <h2>Services for {project.projectName || "New Project"}</h2>

      {/* ADD SERVICES */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h3>Add Services</h3>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/services/mowing")}>
            Add Mowing
          </button>
          <button onClick={() => navigate("/services/mulching")}>
            Add Mulching
          </button>
          <button onClick={() => navigate("/services/pruning")}>
            Add Pruning
          </button>
          <button onClick={() => navigate("/services/leaves")}>
            Add Leaves
          </button>
        </div>
      </section>

      <button onClick={handleSaveProject} style={{ marginBottom: "1.5rem" }}>
        Save Project
      </button>

      {/* PROJECT INFO */}
      <div style={{ marginTop: "1rem", padding: "1rem", borderTop: "1px solid #ccc" }}>
        <h3>Current Project Summary</h3>

        <p>
          <strong>Project Name:</strong> {project.projectName}
        </p>
        <p>
          <strong>Date:</strong> {project.date}
        </p>
        <p>
          <strong>Acres:</strong> {project.acres}
        </p>

        {/* UNIFIED TABLE */}
        {hasAnyService && (
          <div style={{ marginTop: "1.5rem" }}>
            <h3>Service Summary</h3>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#fafafa",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      borderBottom: "1px solid #ccc",
                      textAlign: "left",
                      padding: "4px",
                    }}
                  >
                    Service
                  </th>
                  <th
                    style={{
                      borderBottom: "1px solid #ccc",
                      padding: "4px",
                    }}
                  >
                    Occurrences
                  </th>
                  <th
                    style={{
                      borderBottom: "1px solid #ccc",
                      padding: "4px",
                    }}
                  >
                    Price / Occ
                  </th>
                  <th
                    style={{
                      borderBottom: "1px solid #ccc",
                      padding: "4px",
                    }}
                  >
                    Total
                  </th>
                  <th
                    style={{
                      borderBottom: "1px solid #ccc",
                      padding: "4px",
                    }}
                  ></th>
                </tr>
              </thead>
              <tbody>
                {/* MOWING ROWS */}
                {currentServices.mowing?.map((t) => {
                  const { merged, totals } = computeMowingPreview(t);
                  const occ = merged.summary?.numOccurrences || 0;
                  const pricePerOcc =
                    totals && typeof totals.adjDollar === "number"
                      ? totals.adjDollar
                      : 0;
                  const totalDollar =
                    totals && typeof totals.final === "number"
                      ? totals.final
                      : 0;

                  return (
                    <tr key={t.id}>
                      <td style={{ padding: "4px" }}>
                        {merged.name || "Mowing Area"}
                      </td>
                      <td style={{ textAlign: "center", padding: "4px" }}>
                        {occ}
                      </td>
                      <td style={{ textAlign: "center", padding: "4px" }}>
                        ${pricePerOcc.toFixed(2)}
                      </td>
                      <td style={{ textAlign: "center", padding: "4px" }}>
                        ${totalDollar.toFixed(2)}
                      </td>
                      <td style={{ textAlign: "center", padding: "4px" }}>
                        <button
                          onClick={() => deleteMowing(t.id)}
                          style={{
                            background: "#dc3545",
                            color: "white",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* MULCHING ROWS (PLACEHOLDER $0.00) */}
                {currentServices.mulching?.map((m) => {
                  const data = m.data || {};
                  const occ = data.summary?.numOccurrences || 0;

                  return (
                    <tr key={m.id}>
                      <td style={{ padding: "4px" }}>
                        {data.name || "Mulching Area"}
                      </td>
                      <td style={{ textAlign: "center", padding: "4px" }}>
                        {occ}
                      </td>
                      <td style={{ textAlign: "center", padding: "4px" }}>
                        $0.00
                      </td>
                      <td style={{ textAlign: "center", padding: "4px" }}>
                        $0.00
                      </td>
                      <td style={{ textAlign: "center", padding: "4px" }}>
                        <button
                          onClick={() => deleteMulching(m.id)}
                          style={{
                            background: "#dc3545",
                            color: "white",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* EDGING (single row, if exists) */}
                {currentServices.edging?.[0] && (() => {
                  const e = currentServices.edging[0];
                  const calc = computeEdgingTotals(e);
                  return (
                    <tr>
                      <td style={{ padding: "4px" }}>Edging</td>
                      <td style={{ textAlign: "center", padding: "4px" }}>
                        {calc.occ}
                      </td>
                      <td style={{ textAlign: "center", padding: "4px" }}>
                        ${calc.totalOccDollar.toFixed(2)}
                      </td>
                      <td style={{ textAlign: "center", padding: "4px" }}>
                        ${calc.finalTotal.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  );
                })()}

                {/* BED MAINTENANCE (single row, if exists) */}
                {currentServices.bedMaintenance?.[0] && (() => {
                  const b = currentServices.bedMaintenance[0];
                  const calc = computeBedTotals(b);
                  return (
                    <tr>
                      <td style={{ padding: "4px" }}>Bed Maintenance</td>
                      <td style={{ textAlign: "center", padding: "4px" }}>
                        {calc.occ}
                      </td>
                      <td style={{ textAlign: "center", padding: "4px" }}>
                        ${calc.occDollar.toFixed(2)}
                      </td>
                      <td style={{ textAlign: "center", padding: "4px" }}>
                        ${calc.finalTotal.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
