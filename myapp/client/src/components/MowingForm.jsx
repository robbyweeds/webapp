import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

import MowingTable from "./MowingTable";
import ServiceTablesWrapper from "./ServiceTablesWrapper";

export default function MowingForm() {
  const navigate = useNavigate();

  const {
    currentServices,
    updateService,
    getAllServices,
    currentRates, // ⭐ now included so MowingForm refreshes when rates change
  } = useServiceContext();

  const [tables, setTables] = useState([]);

  // -------------------------------------
  // INITIAL LOAD — ALSO RELOAD WHEN RATES CHANGE
  // -------------------------------------
  useEffect(() => {
    const services = getAllServices() || {};

    // Ensure Edging exists
    if (!Array.isArray(services.edging) || services.edging.length === 0) {
      updateService("edging", [{ id: "Edging1", data: {} }]);
    }

    // Ensure Bed Maintenance exists
    if (!Array.isArray(services.bedMaintenance) || services.bedMaintenance.length === 0) {
      updateService("bedMaintenance", [{ id: "Bed1", data: {} }]);
    }

    // Handle Mowing tables
    const mowingData = Array.isArray(currentServices.mowing)
      ? currentServices.mowing
      : [];

    if (mowingData.length === 0) {
      const first = [{ id: "Mowing1", data: {} }];
      setTables(first);
      updateService("mowing", first);
    } else {
      setTables(mowingData.map((t) => ({ id: t.id })));
    }
  }, [
    currentServices.mowing,
    currentRates, // ⭐ ensures MowingTable recalculates immediately after saving rates
    updateService,
    getAllServices,
  ]);

  // -------------------------------------
  // ADD A NEW MOWING TABLE
  // -------------------------------------
  const handleAddTable = () => {
    const newId = `Mowing${tables.length + 1}`;
    const services = getAllServices();
    const mowing = Array.isArray(services.mowing) ? services.mowing : [];

    const updated = [...mowing, { id: newId, data: {} }];
    updateService("mowing", updated);

    setTables((prev) => [...prev, { id: newId }]);
  };

  // -------------------------------------
  // SAVE ALL TABLES (optional)
  // -------------------------------------
  const handleSave = () => {
    // You will likely want to remove this later because it overwrites data
    const cleaned = tables.map((t) => ({ id: t.id, data: {} }));
    updateService("mowing", cleaned);
    alert("Data saved in context.");
  };

  // -------------------------------------
  // PAGE RENDER
  // -------------------------------------
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Service Entry</h2>

      {/* ---------------------------------
         COMBINED EDGING + BED MAINTENANCE
      ---------------------------------- */}
      <ServiceTablesWrapper tableId="EdgingBedCombined" />

      {/* ---------------------------------
                MOWING TABLES
      ---------------------------------- */}
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
          onClick={handleSave}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Save All Data
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
