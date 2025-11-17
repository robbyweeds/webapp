// ===============================
// MowingForm.jsx — FINAL CLEAN VERSION
// ===============================
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

// Correct path to modular table:
import MowingTable from "./Mowing/MowingTable";

import ServiceTablesWrapper from "./ServiceTablesWrapper";

export default function MowingForm() {
  const navigate = useNavigate();

  const {
  //  currentServices,
    updateService,
    getAllServices,
  } = useServiceContext();

  const [tables, setTables] = useState([]);

  // --------------------------------------------------------
  // INITIAL LOAD — This effect runs ONLY ONCE on page load.
  // --------------------------------------------------------
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const services = getAllServices() || {};
    const mowing = Array.isArray(services.mowing) ? services.mowing : [];

    if (mowing.length === 0) {
      const first = [{ id: "Mowing1", data: {} }];
      updateService("mowing", first);
      setTables(first);
    } else {
      setTables(mowing);
    }
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  // --------------------------------------------------------
  // ADD MOWING TABLE
  // --------------------------------------------------------
  const handleAddTable = () => {
    const newId = `Mowing${tables.length + 1}`;
    const updated = [...tables, { id: newId, data: {} }];

    setTables(updated);
    updateService("mowing", updated);
  };

  // --------------------------------------------------------
  // DELETE MOWING TABLE
  // --------------------------------------------------------
  const handleDeleteTable = (id) => {
    const updated = tables.filter((t) => t.id !== id);

    setTables(updated);
    updateService("mowing", updated);
  };

  // --------------------------------------------------------
  // PAGE RENDER
  // --------------------------------------------------------
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Service Entry</h2>

      {/* Edging + Bed Maintenance combined card */}
      <ServiceTablesWrapper tableId="EdgingBedCombined" />

      <h3 style={{ marginTop: "2rem" }}>Mowing</h3>

      {tables.map((t) => (
        <div key={t.id} style={{ position: "relative" }}>
          {/* DELETE BUTTON */}
          <button
            onClick={() => handleDeleteTable(t.id)}
            style={{
              position: "absolute",
              right: "-70px",
              top: "0",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>

          <MowingTable tableId={t.id} />
        </div>
      ))}

      {/* ACTION BUTTONS */}
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
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "8px 16px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
