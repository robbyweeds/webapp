import React, { createContext, useContext, useState } from "react";

const ServiceContext = createContext(null);

export function ServiceProvider({ children }) {
  // ----------------------
  // DEFAULT MOWING RATES (Fix for missing hours)
  // ----------------------
  const DEFAULT_MOWING_FACTORS = {
    acresPerHour: {
      "72": {
        OBSTACLES: 0.65,
        HOA_HOMES: 0.85,
        AVERAGE: 0.95,
        OPEN_LAWN: 1.3,
        FIELDS: 1.45,
        MONTHLY: 0.6,
        DOUBLE_CUT: 0.7,
      },
      "60": {
        OBSTACLES: 0.6,
        HOA_HOMES: 0.75,
        AVERAGE: 0.85,
        OPEN_LAWN: 1.0,
        FIELDS: 1.25,
        MONTHLY: 0.55,
        DOUBLE_CUT: 0.7,
      },
      "48": {
        OBSTACLES: 0.4,
        HOA_HOMES: 0.6,
        AVERAGE: 0.65,
        OPEN_LAWN: 0.75,
        FIELDS: 0.9,
        MONTHLY: 0.35,
        DOUBLE_CUT: 0.45,
      },
    },
  };

  const DEFAULT_MOWING_DOLLARS = {
    MISC_HRS: 61.0,
    "72-area1": 51.0,
    "72-area2": 61.0,
    "60-area1": 61.0,
    "60-area2": 59.0,
    "48-area1": 56.0,
    "48-area2": 56.0,
    TRIMMER: 55.0,
    BLOWER: 55.0,
    ROTARY: 55.0,
    "5111": 100.0,
  };

  // ----------------------
  // SERVICE DATA
  // ----------------------
  const [currentServices, setCurrentServices] = useState({
    mowing: [],
    edging: [],
    bedMaintenance: [],
    mulching: [],
    pruning: [],
    leaves: [],
  });

  // ----------------------
  // RATES — PRELOAD DEFAULTS (Fixes HOURS ISSUE)
  // ----------------------
  const [currentRates, setCurrentRates] = useState({
    mowingFactors: DEFAULT_MOWING_FACTORS,
    mowingDollars: DEFAULT_MOWING_DOLLARS,
  });

  // ----------------------
  // UPDATE a specific service (ex: "mowing")
  // ----------------------
  const updateService = (serviceName, data) => {
    setCurrentServices((prev) => ({
      ...prev,
      [serviceName]: data,
    }));
  };

  // ----------------------
  // READ ALL SERVICES
  // ----------------------
  const getAllServices = () => {
    return currentServices;
  };

  // ----------------------
  // UPDATE RATES
  // ----------------------
  const updateRates = (key, value) => {
    setCurrentRates((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ----------------------
  // RESET SERVICES
  // ----------------------
  const resetServices = () => {
    setCurrentServices({
      mowing: [],
      edging: [],
      bedMaintenance: [],
      mulching: [],
      pruning: [],
      leaves: [],
    });
  };

  return (
    <ServiceContext.Provider
      value={{
        currentServices,
        updateService,
        getAllServices,
        currentRates,
        updateRates,
        resetServices,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
}

export function useServiceContext() {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useServiceContext must be used within a ServiceProvider");
  }
  return context;
}
