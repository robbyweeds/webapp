import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

import MowingTable from "./MowingTable";
import EdgingTable from "./EdgingTable";
import BedMaintenanceTable from "./BedMaintenanceTable";

export default function MowingForm() {
  const navigate = useNavigate();
  const { currentServices, updateService, getAllServices } = useServiceContext();

  const [tables, setTables] = useState([]);

  // ---------- INITIAL LOAD ----------
  useEffect(() => {
    const services = getAllServices() || {};

    // --------- Ensure Edging exists ---------
    if (!services.edging) {
      updateService("edging", { id: "Edging1", data: {} });
    }

    // ----- Ensure Bed Maintenance exists -----
    if (!services.bedMaintenance) {
      updateService("bedMaintenance", { id: "Bed1", data: {} });
    }

    // ------------- Handle Mowing tables -------------
    const mowingData = Array.isArray(currentServices.mowing)
      ? currentServices.mowing
      : [];

    if (mowingData.length === 0) {
      setTables([{ id: "Mowing1" }]);
      updateService("mowing", [{ id: "Mowing1", data: {} }]);
    } else {
      setTables(mowingData.map((t, i) => ({ id: t.id || `Mowing${i + 1}` })));
    }
  }, [currentServices, updateService, getAllServices]);

  // ---------- ADD MOWING TABLE ----------
  const handleAddTable = () => {
    const newId = `Mowing${tables.length + 1}`;
    const services = getAllServices() || {};
    const mowing = Array.isArray(services.mowing) ? services.mowing : [];

    setTables(prev => [...prev, { id: newId }]);
    updateService("mowing", [...mowing, { id: newId, data: {} }]);
  };

  const handleSave = () => {
    const updatedMowing = tables.map(t => ({ id: t.id, data: {} }));
    updateService("mowing", updatedMowing);
    alert("Data saved in context.");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Service Entry</h2>

      {/* ------------------- EDGING TABLE ------------------- */}
      <h3>Edging</h3>
      <EdgingTable tableId="Edging1" />

      {/* ----------------- BED MAINTENANCE TABLE ----------------- */}
      <h3 style={{ marginTop: "2rem" }}>Bed Maintenance</h3>
      <BedMaintenanceTable tableId="Bed1" />

      {/* ----------------------- MOWING TABLES ----------------------- */}
      <h3 style={{ marginTop: "2rem" }}>Mowing</h3>

      {tables.map(table => (
        <MowingTable key={table.id} tableId={table.id} />
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
            cursor: "pointer"
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
            cursor: "pointer"
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
            cursor: "pointer"
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
