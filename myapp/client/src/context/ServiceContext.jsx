import React, { createContext, useContext, useState } from "react";

const ServiceContext = createContext(null);

export function ServiceProvider({ children }) {

  // ----------------------
  // DEFAULT MOWING RATES
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
    MISC_HRS: 61,
    "72-area1": 51,
    "72-area2": 61,
    "60-area1": 61,
    "60-area2": 59,
    "48-area1": 56,
    "48-area2": 56,
    TRIMMER: 55,
    BLOWER: 55,
    ROTARY: 55,
    "5111": 100,
  };

  // ------------------------------------
  // GLOBAL SERVICE STORAGE — FIXED
  // ------------------------------------
  const [currentServices, setCurrentServices] = useState({
    mowing: [],            // MANY tables
    edging: null,          // ONE edging table
    bedMaintenance: null,  // ONE bed maintenance table
    mulching: null,
    pruning: null,
    leaves: null,
  });

  // ------------------------------------
  // Mowing factors and dollar rates
  // ------------------------------------
  const [currentRates, setCurrentRates] = useState({
    mowingFactors: DEFAULT_MOWING_FACTORS,
    mowingDollars: DEFAULT_MOWING_DOLLARS,
  });

  // ------------------------------------
  // UPDATE SERVICE — now safe
  // ------------------------------------
  const updateService = (serviceName, data) => {
    setCurrentServices((prev) => ({
      ...prev,
      [serviceName]: data,
    }));
  };

  const getAllServices = () => currentServices;

  const updateRates = (key, value) => {
    setCurrentRates((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetServices = () => {
    setCurrentServices({
      mowing: [],
      edging: null,
      bedMaintenance: null,
      mulching: null,
      pruning: null,
      leaves: null,
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
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error("useServiceContext must be used within ServiceProvider");
  return ctx;
}
