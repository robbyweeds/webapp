// myapp/client/src/components/ServicesPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

export default function ServicesPage() {
  const navigate = useNavigate();

  const { currentServices, updateService, getAllServices } =
    useServiceContext();

  const API_URL = process.env.REACT_APP_API_URL;

  const [project, setProject] = useState({
    projectName: "",
    date: "",
    acres: "",
  });

  // ---------------------------------------------
  // Load project from localStorage
  // ---------------------------------------------
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("project"));
    if (stored) setProject(stored);
  }, []);

  // ---------------------------------------------
  // DELETE A MOWING ENTRY
  // ---------------------------------------------
  const deleteMowing = (id) => {
    const updated = currentServices.mowing.filter((m) => m.id !== id);
    updateService("mowing", updated);
  };

  // ---------------------------------------------
  // SAVE PROJECT TO BACKEND
  // ---------------------------------------------
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
        body: JSON.stringify({
          project,
          services: sanitized,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Project saved successfully!");
        navigate("/");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Network Error");
    }
  };

  // ---------------------------------------------
  // RENDER PAGE
  // ---------------------------------------------
  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
      <h2>Services for {project.projectName || "New Project"}</h2>

      {/* ---------------------------------------------
          ADD SERVICE BUTTONS
      ---------------------------------------------- */}
      <section style={{ marginBottom: "2rem" }}>
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

      <button
        onClick={handleSaveProject}
        style={{ marginBottom: "2rem" }}
      >
        Save Project
      </button>

      {/* ---------------------------------------------
          PROJECT SUMMARY
      ---------------------------------------------- */}
      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          borderTop: "1px solid #ccc",
        }}
      >
        <h3>Current Project Summary</h3>

        <p>
          <strong>Project Name:</strong>{" "}
          {project.projectName || "(none)"}
        </p>
        <p>
          <strong>Date:</strong> {project.date || "(none)"}
        </p>
        <p>
          <strong>Acres:</strong> {project.acres || "(none)"}
        </p>

        {/* ---------------------------------------------
            MOWING PREVIEW
        ---------------------------------------------- */}
        {currentServices.mowing?.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <h3>Mowing</h3>

            {currentServices.mowing.map((t) => (
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
                {/* Delete Button */}
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

                {/* Mowing Data */}
                <div>
                  <strong>{t.data.name || "Mowing Area"}</strong>
                </div>

                <div>
                  Occurrences: {t.data.summary?.numOccurrences ?? 0}
                </div>

                <div>
                  Base Price / Occ: $
                  {(t.data.totals?.totalOcc ?? 0).toFixed(2)}
                </div>

                <div>
                  Adj Price / Occ: $
                  {(t.data.totals?.adjDollar ?? 0).toFixed(2)}
                </div>

                <div>
                  Total Price: $
                  {(t.data.totals?.final ?? 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------------------------------------------
            EDGING & BED MAINTENANCE PREVIEW
        ---------------------------------------------- */}
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
                const e = currentServices.edging[0].data;
                return (
                  <>
                    <div><strong>Edging</strong></div>
                    <div>Occurrences: {e.summary?.numOccurrences ?? 0}</div>
                    <div>Price / Occ: ${(e.totalOccDollar ?? 0).toFixed(2)}</div>
                    <div>Total Price: ${(e.finalTotal ?? 0).toFixed(2)}</div>
                    <hr />
                  </>
                );
              })()}

              {/* Bed Maintenance */}
              {currentServices.bedMaintenance?.[0] && (() => {
                const b = currentServices.bedMaintenance[0].data;
                return (
                  <>
                    <div><strong>Bed Maintenance</strong></div>
                    <div>Occurrences: {b.summary?.numOccurrences ?? 0}</div>
                    <div>Price / Occ: ${(b.occDollar ?? 0).toFixed(2)}</div>
                    <div>Total Price: ${(b.finalTotal ?? 0).toFixed(2)}</div>
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
