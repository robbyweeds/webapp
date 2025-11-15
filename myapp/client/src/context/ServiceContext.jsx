import React, { createContext, useContext, useState } from "react";

// Create context
const ServiceContext = createContext(null);

// Provider component
export function ServiceProvider({ children }) {
  // Initialize all services to empty objects
  const [currentServices, setCurrentServices] = useState({
    mowing: {},
    edging: {},
    bedMaintenance: {},
    mulching: {},
    pruning: {},
    leaves: {},
  });

  // Update a specific service
  const updateService = (serviceName, data) => {
    setCurrentServices(prev => ({
      ...prev,
      [serviceName]: data || {}, // default to empty object
    }));
  };

  // Get all services
  const getAllServices = () => {
    return currentServices || {}; // ensure never undefined
  };

  // Reset all services (optional)
  const resetServices = () => {
    setCurrentServices({
      mowing: {},
      edging: {},
      bedMaintenance: {},
      mulching: {},
      pruning: {},
      leaves: {},
    });
  };

  return (
    <ServiceContext.Provider
      value={{
        currentServices,
        updateService,
        getAllServices,
        resetServices,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
}

// Custom hook
export function useServiceContext() {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useServiceContext must be used within a ServiceProvider");
  }
  return context;
}
