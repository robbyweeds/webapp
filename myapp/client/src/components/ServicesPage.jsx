// =======================================
// ServicesPage.jsx — FINAL WORKING VERSION
// =======================================
import React from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

export default function ServicesPage() {
  const navigate = useNavigate();
  const { currentServices, updateService } = useServiceContext();

  const mowing = Array.isArray(currentServices.mowing)
    ? currentServices.mowing
    : [];

  const edging = Array.isArray(currentServices.edging)
    ? currentServices.edging
    : [];

  const bedMaint = Array.isArray(currentServices.bedMaintenance)
    ? currentServices.bedMaintenance
    : [];

  // ----------------------------------
  // DELETE Mowing Table
  // ----------------------------------
  const deleteMowing = (id) => {
    const updated = mowing.filter((t) => t.id !== id);
    updateService("mowing", updated);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Services Overview</h2>

      {/* ============ MOWING ============ */}
      <h3 style={{ marginTop: "1.5rem" }}>Mowing</h3>

      {mowing.length === 0 ? (
        <p>No mowing services added.</p>
      ) : (
        mowing.map((t) => {
          const d = t.data || {};
          const totals = d.totals || {};

          return (
            <div
              key={t.id}
              style={{
                border: "1px solid #aaa",
                padding: "1rem",
                marginBottom: "1rem",
                borderRadius: "8px",
                background: "#fafafa",
                position: "relative",
              }}
            >
              {/* DELETE BUTTON */}
              <button
                onClick={() => deleteMowing(t.id)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "12px",
                  padding: "6px 12px",
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Delete
              </button>

              <h4 style={{ marginBottom: "0.5rem" }}>
                {d.name || "Mowing Area"}
              </h4>

              <div style={{ fontSize: "0.9rem", lineHeight: "1.4rem" }}>
                <div><strong># Occurrences: </strong>{d.summary?.numOccurrences}</div>
                <div><strong>Price per Occurrence: </strong>${totals.totalOcc?.toFixed(2)}</div>
                <div><strong>Adjusted Price: </strong>${totals.adjDollar?.toFixed(2)}</div>
                <div><strong>Total Price: </strong>${totals.final?.toFixed(2)}</div>
              </div>
            </div>
          );
        })
      )}

      {/* ============ EDGING + BED MAINT ============ */}
      <h3 style={{ marginTop: "2rem" }}>Edging & Bed Maintenance</h3>

      <div
        style={{
          border: "1px solid #aaa",
          padding: "1rem",
          borderRadius: "8px",
          background: "#f8f8ff",
          marginBottom: "1rem",
        }}
      >
        {/* EDGING */}
        <h4>Edging</h4>
        {edging.length === 0 ? (
          <p style={{ marginLeft: "1rem" }}>No edging data.</p>
        ) : (
          edging.map((e) => {
            const d = e.data || {};
            const totals = d.totals || {};

            return (
              <div key={e.id} style={{ marginBottom: "1rem" }}>
                <div><strong># Occurrences: </strong>{d.summary?.numOccurrences}</div>
                <div>
                  <strong>$/Occ: </strong>
                  ${totals?.totalOccDollar?.toFixed(2) ?? "0.00"}
                </div>
                <div>
                  <strong>Total Price: </strong>
                  ${totals?.finalTotal?.toFixed(2) ?? "0.00"}
                </div>
              </div>
            );
          })
        )}

        {/* BED MAINTENANCE */}
        <h4 style={{ marginTop: "1rem" }}>Bed Maintenance</h4>
        {bedMaint.length === 0 ? (
          <p style={{ marginLeft: "1rem" }}>No bed maintenance data.</p>
        ) : (
          bedMaint.map((b) => {
            const d = b.data || {};
            const totals = d.totals || {};

            return (
              <div key={b.id} style={{ marginBottom: "1rem" }}>
                <div><strong># Occurrences: </strong>{d.summary?.numOccurrences}</div>
                <div>
                  <strong>$/Occ: </strong>
                  ${totals?.totalOccDollar?.toFixed(2) ?? "0.00"}
                </div>
                <div>
                  <strong>Total Price: </strong>
                  ${totals?.finalTotal?.toFixed(2) ?? "0.00"}
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Back
      </button>
    </div>
  );
}
