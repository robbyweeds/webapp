import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

export default function ServicesPage() {
  const navigate = useNavigate();
  const { currentServices, updateService, getAllServices } = useServiceContext();

  const API_URL = process.env.REACT_APP_API_URL;

  const [project, setProject] = useState({ projectName: "", date: "", acres: "" });

  useEffect(() => {
    const storedProject = JSON.parse(localStorage.getItem("project"));
    if (storedProject) setProject(storedProject);
  }, []);

  const handleSaveProject = async () => {
    const services = getAllServices() || {};
    const sanitizedServices = {};
    Object.entries(services).forEach(([key, value]) => sanitizedServices[key] = value || {});

    if (!project.projectName || !project.date || !project.acres) {
      alert("Project info is missing");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, services: sanitizedServices })
      });

      const data = await response.json();
      if (data.success) {
        alert("Project saved successfully!");
        navigate("/");
      } else {
        alert("Error saving project: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Network error saving project");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h2>Services for {project.projectName || "New Project"}</h2>

      <section>
        <h3>Mowing / Edging / Bed Maintenance</h3>
        <button onClick={() => navigate("/services/mowing")}>Add Mowing</button>
        <button onClick={() => navigate("/services/edging")}>Add Edging</button>
        <button onClick={() => navigate("/services/bedMaintenance")}>Add Bed Maintenance</button>
      </section>

      <section>
        <h3>Mulching</h3>
        <button onClick={() => navigate("/services/mulching")}>Add Mulching</button>
      </section>

      <section>
        <h3>Pruning</h3>
        <button onClick={() => navigate("/services/pruning")}>Add Pruning</button>
      </section>

      <section>
        <h3>Leaves</h3>
        <button onClick={() => navigate("/services/leaves")}>Add Leaves</button>
      </section>

      <button onClick={handleSaveProject} style={{ marginTop: "1rem" }}>Save Project</button>
    </div>
  );
}
