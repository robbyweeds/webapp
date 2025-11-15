import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";
import MowingTable from "./MowingTable";

export default function MowingForm() {
  const navigate = useNavigate();
  const { currentServices, updateService, getAllServices } = useServiceContext();

  const [tables, setTables] = useState([]);

  useEffect(() => {
    // Ensure currentServices.mowing is always an array
    const mowingData = Array.isArray(currentServices.mowing) ? currentServices.mowing : [];

    if (mowingData.length === 0) {
      // Initialize with 1 table
      setTables([{ id: "Mowing1" }]);
      updateService("mowing", [{ id: "Mowing1", data: {} }]);
    } else {
      setTables(mowingData.map((t, i) => ({ id: t.id || `Mowing${i + 1}` })));
    }
  }, [currentServices, updateService]);

  const handleAddTable = () => {
    const newId = `Mowing${tables.length + 1}`;
    setTables(prev => [...prev, { id: newId }]);
    const services = getAllServices() || {};
    const mowing = Array.isArray(services.mowing) ? services.mowing : [];
    updateService("mowing", [...mowing, { id: newId, data: {} }]);
  };

  const handleSave = () => {
    const services = getAllServices() || {};
    const updatedMowing = tables.map(t => ({ id: t.id, data: {} })); // Placeholder
    updateService("mowing", updatedMowing);
    alert("Mowing data saved in context.");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Mowing Service</h2>

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
          Save Mowing Data
        </button>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <button onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
}
