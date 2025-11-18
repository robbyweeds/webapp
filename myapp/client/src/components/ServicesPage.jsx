// myapp/client/src/components/ServicesPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

// Mowing logic
import {
  INITIAL_MOWING_DATA,
} from "./Mowing/mowingDefaults";
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

  // ----------------------------------------
  // Load project info
  // ----------------------------------------
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("project"));
    if (stored) setProject(stored);
  }, []);

  // ----------------------------------------
  // DELETE MOWING ENTRY
  // ----------------------------------------
  const deleteMowing = (id) => {
    const updated = currentServices.mowing.filter((m) => m.id !== id);
    updateService("mowing", updated);
  };

  // ----------------------------------------
  // MOWING PREVIEW COMPUTATION
  // ----------------------------------------
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

  // ----------------------------------------
  // EDGING PREVIEW COMPUTATION
  // ----------------------------------------
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

  // ----------------------------------------
  // BED MAINTENANCE PREVIEW COMPUTATION
  // ----------------------------------------
  const computeBedTotals = (entry) => {
    const d = entry.data || {};

    const qty = d.qtyUnit || { HAND: 0, BACKPACK: 0, ROUNDUP: 0 };
    const price = d.unitPrice || { HAND: 0, BACKPACK: 0, ROUNDUP: 0 };
    const occ = d.summary?.numOccurrences || 0;

    const totalRow = {
      HAND: qty.HAND * price.HAND,
      BACKPACK: qty.BACKPACK * price.BACKPACK,
      ROUNDUP: qty.ROUNDUP * price.ROUNDUP,
    };

    const occDollar =
      totalRow.HAND + totalRow.BACKPACK + totalRow.ROUNDUP;

    const finalTotal = occDollar * occ;

    return { qty, price, occ, occDollar, finalTotal };
  };

  // ----------------------------------------
  // SAVE PROJECT
  // ----------------------------------------
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

  // ----------------------------------------
  // RENDER
  // ----------------------------------------
  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
      <h2>Services for {project.projectName || "New Project"}</h2>

      {/* ADD SERVICES */}
      <section style={{ marginBottom: "2rem" }}>
        <h3>Add Services</h3>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/services/mowing")}>Add Mowing</button>
          <button onClick={() => navigate("/services/mulching")}>Add Mulching</button>
          <button onClick={() => navigate("/services/pruning")}>Add Pruning</button>
          <button onClick={() => navigate("/services/leaves")}>Add Leaves</button>
        </div>
      </section>

      <button onClick={handleSaveProject} style={{ marginBottom: "2rem" }}>
        Save Project
      </button>

      {/* SUMMARY */}
      <div style={{ marginTop: "1rem", padding: "1rem", borderTop: "1px solid #ccc" }}>
        <h3>Current Project Summary</h3>

        <p><strong>Project Name:</strong> {project.projectName}</p>
        <p><strong>Date:</strong> {project.date}</p>
        <p><strong>Acres:</strong> {project.acres}</p>

        {/* MOWING PREVIEW */}
        {currentServices.mowing?.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <h3>Mowing</h3>

            {currentServices.mowing.map((t) => {
              const { merged, totals } = computeMowingPreview(t);

              return (
                <div
                  key={t.id}
                  style={{
                    border: "1px solid #aaa",
                    borderRadius: "6px",
                    padding: "12px",
                    marginBottom: "10px",
                    background: "#fafafa",
                    position: "relative",
                  }}
                >
                  <button
                    onClick={() => deleteMowing(t.id)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    X
                  </button>

                  <div><strong>{merged.name || "Mowing Area"}</strong></div>
                  <div>Occurrences: {merged.summary.numOccurrences}</div>
                  <div>Base Price / Occ: ${totals.totalOcc.toFixed(2)}</div>
                  <div>Adj Price / Occ: ${totals.adjDollar.toFixed(2)}</div>
                  <div>Total Price: ${totals.final.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* EDGING + BED MAINTENANCE */}
        {(currentServices.edging?.length > 0 ||
          currentServices.bedMaintenance?.length > 0) && (
          <div style={{ marginTop: "2rem" }}>
            <h3>Edging & Bed Maintenance</h3>

            <div
              style={{
                border: "1px solid #aaa",
                borderRadius: "6px",
                padding: "12px",
                background: "#f5f5f5",
              }}
            >
              {/* Edging */}
              {currentServices.edging?.[0] && (() => {
                const e = currentServices.edging[0];
                const calc = computeEdgingTotals(e);

                return (
                  <>
                    <div><strong>Edging</strong></div>
                    <div>Occurrences: {calc.occ}</div>
                    <div>Price / Occ: ${calc.totalOccDollar.toFixed(2)}</div>
                    <div>Total Price: ${calc.finalTotal.toFixed(2)}</div>
                    <hr />
                  </>
                );
              })()}

              {/* Bed Maintenance */}
              {currentServices.bedMaintenance?.[0] && (() => {
                const b = currentServices.bedMaintenance[0];
                const calc = computeBedTotals(b);

                return (
                  <>
                    <div><strong>Bed Maintenance</strong></div>
                    <div>Occurrences: {calc.occ}</div>
                    <div>Price / Occ: ${calc.occDollar.toFixed(2)}</div>
                    <div>Total Price: ${calc.finalTotal.toFixed(2)}</div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
