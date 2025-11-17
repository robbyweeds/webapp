// ===============================
// MowingForm.jsx — FIXED + FINAL
// ===============================
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

import MowingTable from "./Mowing/MowingTable";
import ServiceTablesWrapper from "./ServiceTablesWrapper";

export default function MowingForm() {
  const navigate = useNavigate();

  const {
    currentServices,
    updateService,
  } = useServiceContext();

  const [tables, setTables] = useState([]);

  // -------------------------------------
  // 1. ENSURE A FIRST TABLE EXISTS (only once)
  // -------------------------------------
  useEffect(() => {
    if (!currentServices.mowing || currentServices.mowing.length === 0) {
      updateService("mowing", [{ id: "Mowing1", data: {} }]);
    }
  }, []);

  // -------------------------------------
  // 2. SYNC WITH CONTEXT ANY TIME IT UPDATES
  // -------------------------------------
  useEffect(() => {
    const mowing = Array.isArray(currentServices.mowing)
      ? currentServices.mowing
      : [];

    setTables(mowing);
  }, [currentServices.mowing]);

  // -------------------------------------
  // ADD NEW MOWING TABLE
  // -------------------------------------
  const handleAddTable = () => {
    const newId = `Mowing${tables.length + 1}`;
    const updated = [...tables, { id: newId, data: {} }];

    setTables(updated);
    updateService("mowing", updated);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Service Entry</h2>

      {/* Edging + Bed Maintenance */}
      <ServiceTablesWrapper tableId="EdgingBedCombined" />

      {/* Mowing */}
      <h3 style={{ marginTop: "2rem" }}>Mowing</h3>

      {tables.map((t) => (
        <MowingTable key={t.id} tableId={t.id} />
      ))}

      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={handleAddTable}
          style={{
            marginRight: "1rem",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Add Mowing Table
        </button>

        <button
          onClick={() => navigate("/mowing-rates")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Edit Mowing Rates
        </button>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <button onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
}
