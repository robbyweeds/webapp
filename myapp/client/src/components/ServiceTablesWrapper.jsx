// myapp/client/src/components/ServiceTablesWrapper.jsx

import React from "react";
import EdgingTable from "./EdgingTable";
import BedMaintenanceTable from "./BedMaintenanceTable";

export default function ServiceTablesWrapper({ tableId }) {
  return (
    // THIS is the essential container with Flexbox
    <div 
      style={{ 
        display: 'flex', 
        gap: '2rem', 
        marginBottom: '2rem',
        // Ensures tables stack on small screens
        flexWrap: 'wrap', 
      }}
    >
      
      {/* Edging Table Container */}
      <div style={{ flex: 1, minWidth: '350px' }}>
        <h3>🔪 Edging Estimate</h3>
        <EdgingTable tableId={tableId} />
      </div>

      {/* Bed Maintenance Table Container */}
      <div style={{ flex: 1, minWidth: '350px' }}>
        <h3>🌱 Bed Maintenance Estimate</h3>
        <BedMaintenanceTable tableId={tableId} />
      </div>

    </div>
  );
}