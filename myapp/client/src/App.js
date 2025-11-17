// App.js — FINAL FIXED

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import ProjectForm from "./components/ProjectForm";
import ServicesPage from "./components/ServicesPage";
import MowingForm from "./components/MowingForm";
import MulchingForm from "./components/MulchingForm";
import PruningForm from "./components/PruningForm";
import LeavesForm from "./components/LeavesForm";
import MowingRatesPage from "./components/Mowing/MowingRatesPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProjectForm />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/mowing" element={<MowingForm />} />
        <Route path="/services/mulching" element={<MulchingForm />} />
        <Route path="/services/pruning" element={<PruningForm />} />
        <Route path="/services/leaves" element={<LeavesForm />} />
        <Route path="/mowing-rates" element={<MowingRatesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
