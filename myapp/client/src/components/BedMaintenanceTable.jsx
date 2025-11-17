import React, { useCallback, useMemo } from "react";
import LabeledInput from "./LabeledInput";
import { useServiceContext } from "../context/ServiceContext";

// Define the default structure for Bed Maintenance data with new keys
const INITIAL_BED_MAINTENANCE_DATA = {
  // Updated keys for qtyUnit, matching the new columns
  qtyUnit: { HAND: 0, BACKPACK: 0, ROUNDUP: 0 },
  // Example unit prices for the new keys
  unitPrice: { HAND: 55, BACKPACK: 55, ROUNDUP: 50 },
  summary: {
    adjPercent: 0, 
    numOccurrences: 1,
  }
};

export default function BedMaintenanceTable({ tableId }) {
  const { currentServices, updateService } = useServiceContext();

  // Memoize serviceData to ensure it is always an array
  const serviceData = useMemo(() => {
    const dataFromContext = currentServices.bedMaintenance;
    return Array.isArray(dataFromContext) ? dataFromContext : [];
  }, [currentServices.bedMaintenance]);

  const tableEntry = serviceData.find((t) => t.id === tableId) || { id: tableId, data: {} };
  
  // Memoize full data object
  const data = useMemo(() => ({
    ...INITIAL_BED_MAINTENANCE_DATA,
    ...tableEntry.data,
    qtyUnit: { ...INITIAL_BED_MAINTENANCE_DATA.qtyUnit, ...tableEntry.data.qtyUnit },
    unitPrice: { ...INITIAL_BED_MAINTENANCE_DATA.unitPrice, ...tableEntry.data.unitPrice },
    summary: { ...INITIAL_BED_MAINTENANCE_DATA.summary, ...tableEntry.data.summary },
  }), [tableEntry.data]);

  // Unified change handler
  const handleRowChange = useCallback((rowKey, inputKey) => (e) => {
    const val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    const numericValue = isNaN(val) ? 0 : val;

    const updatedRowData = { ...data[rowKey], [inputKey]: numericValue };
    const updatedTableData = { ...data, [rowKey]: updatedRowData };

    const updatedBedMaintenanceArray = serviceData.map((t) =>
      t.id === tableId ? { id: tableId, data: updatedTableData } : t
    );

    updateService("bedMaintenance", updatedBedMaintenanceArray);
  }, [data, tableId, serviceData, updateService]);

  // --- CALCULATIONS ---
  const { totalRow, sumHours, totalOccDollar, finalTotal } = useMemo(() => {
    const totalRow = {};
    let totalOccDollar = 0;
    
    // Calculate totalOccDollar and totalRow based on the new keys
    Object.keys(data.unitPrice).forEach((col) => {
      const qty = data.qtyUnit[col] || 0;
      const price = data.unitPrice[col] || 0;
      const total = qty * price;
      totalRow[col] = total;
      totalOccDollar += total;
    });

    const sumHours = Object.values(data.qtyUnit).reduce((sum, val) => sum + (val || 0), 0);
    const numOccurrences = data.summary.numOccurrences || 0;
    const finalTotal = totalOccDollar * numOccurrences;

    return { totalRow, sumHours, totalOccDollar, finalTotal };
  }, [data.unitPrice, data.qtyUnit, data.summary]);


  return (
    <table border="1" style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
      <thead>
        <tr>
          <th>ITEM</th>
          {/* New Column Headers */}
          <th>HAND</th>
          <th>BACKPACK</th>
          <th>ROUNDUP</th>
          
          {/* Summary Columns */}
          <th style={{ width: "8%" }}># OCC</th>
          <th style={{ width: "8%", backgroundColor: 'yellow' }}>
            <LabeledInput
              value={data.summary.numOccurrences}
              onChange={handleRowChange("summary", "numOccurrences")}
              step={1} min={0} label=""
              type="number"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        {/* Row 1: QTY/UNIT (Hours/Quantity Input) and HRS/OCC Summary */}
        <tr>
          <td>QTY/UNIT</td>
          {/* Input for HAND */}
          <td>
            <LabeledInput value={data.qtyUnit.HAND} onChange={handleRowChange("qtyUnit", "HAND")} step={0.1} min={0} label="HRS" />
          </td>
          {/* Input for BACKPACK */}
          <td>
            <LabeledInput value={data.qtyUnit.BACKPACK} onChange={handleRowChange("qtyUnit", "BACKPACK")} step={0.1} min={0} label="QTY" />
          </td>
          {/* Input for ROUNDUP */}
          <td>
            <LabeledInput value={data.qtyUnit.ROUNDUP} onChange={handleRowChange("qtyUnit", "ROUNDUP")} step={0.1} min={0} label="QTY" />
          </td>
          
          {/* Summary Cells */}
          <td>TOT HRS</td>
          <td style={{ backgroundColor: "#eef" }}>{sumHours.toFixed(2)}</td>
        </tr>

        {/* Row 2: UNIT $ (Price Display) and $/OCC Summary */}
        <tr>
          <td>UNIT $</td>
          {/* Price for HAND */}
          <td>${data.unitPrice.HAND.toFixed(2)}</td>
          {/* Price for BACKPACK */}
          <td>${data.unitPrice.BACKPACK.toFixed(2)}</td>
          {/* Price for ROUNDUP */}
          <td>${data.unitPrice.ROUNDUP.toFixed(2)}</td>
          
          {/* Summary Cells */}
          <td>$/OCC</td>
          <td style={{ backgroundColor: "#eef" }}>${totalOccDollar.toFixed(2)}</td>
        </tr>

        {/* Row 3: TOTAL (Calculation) - Final Row */}
        <tr style={{ backgroundColor: "#f2f2f2", fontWeight: "bold" }}>
          <td>TOTAL</td>
          {/* Total for HAND */}
          <td>${totalRow.HAND ? totalRow.HAND.toFixed(2) : "0.00"}</td>
          {/* Total for BACKPACK */}
          <td>${totalRow.BACKPACK ? totalRow.BACKPACK.toFixed(2) : "0.00"}</td>
          {/* Total for ROUNDUP */}
          <td>${totalRow.ROUNDUP ? totalRow.ROUNDUP.toFixed(2) : "0.00"}</td>
          
          {/* Summary Cells */}
          <td>TOTAL $</td>
          <td style={{ backgroundColor: "yellow" }}>${finalTotal.toFixed(2)}</td>
        </tr>
        
      </tbody>
    </table>
  );
}