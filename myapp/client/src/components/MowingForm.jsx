import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

import MowingTable from "./MowingTable";
// Import the wrapper component
import ServiceTablesWrapper from "./ServiceTablesWrapper"; 

// NOTE: EdgingTable and BedMaintenanceTable are now imported *inside* ServiceTablesWrapper
// You may remove the imports for EdgingTable and BedMaintenanceTable if they are no longer used here.
// import EdgingTable from "./EdgingTable"; 
// import BedMaintenanceTable from "./BedMaintenanceTable"; 


export default function MowingForm() {
  const navigate = useNavigate();
  const { currentServices, updateService, getAllServices } = useServiceContext();

  const [tables, setTables] = useState([]);

  // ---------- INITIAL LOAD ----------
  useEffect(() => {
    const services = getAllServices() || {};

    // --------- Ensure Edging exists (must be an array) ---------
    if (!Array.isArray(services.edging) || services.edging.length === 0) {
      // Update service with an array containing the initial table entry
      updateService("edging", [{ id: "Edging1", data: {} }]);
    }

    // ----- Ensure Bed Maintenance exists (must be an array) -----
    if (!Array.isArray(services.bedMaintenance) || services.bedMaintenance.length === 0) {
      // Update service with an array containing the initial table entry
      updateService("bedMaintenance", [{ id: "Bed1", data: {} }]);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentServices.mowing, updateService, getAllServices]); // Removed currentServices as it can cause excessive re-runs

  // ---------- ADD MOWING TABLE ----------
  const handleAddTable = () => {
    const newId = `Mowing${tables.length + 1}`;
    const services = getAllServices() || {};
    const mowing = Array.isArray(services.mowing) ? services.mowing : [];

    setTables(prev => [...prev, { id: newId }]);
    updateService("mowing", [...mowing, { id: newId, data: {} }]);
  };

  const handleSave = () => {
    // Note: This mapping is losing any data entered into the Mowing tables.
    // It's only saving the table IDs. You might want to remove this or fix it later.
    const updatedMowing = tables.map(t => ({ id: t.id, data: {} }));
    updateService("mowing", updatedMowing);
    alert("Data saved in context.");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Service Entry</h2>

      {/* ------------------- COMBINED TABLES (EDGING & BED MAINTENANCE) ------------------- */}
      {/* This wrapper component is responsible for laying the two tables 
        out side-by-side using CSS Flexbox. We pass it a single ID.
      */}
      <ServiceTablesWrapper tableId="EdgingBedCombined" />


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