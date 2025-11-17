import React, { useCallback, useMemo } from "react";
import LabeledInput from "./LabeledInput";
import { useServiceContext } from "../context/ServiceContext";

// Define the default structure for Edging data
const INITIAL_EDGING_DATA = {
  qtyUnit: { EDGER: 0, BLOWER: 0 },
  unitPrice: { EDGER: 55, BLOWER: 55 },
  summary: {
    // adjPercent is no longer used but kept for context consistency if needed elsewhere
    adjPercent: 0, 
    numOccurrences: 1,
  }
};

export default function EdgingTable({ tableId }) {
  const { currentServices, updateService } = useServiceContext();

  // Memoize serviceData to ensure it is always an array
  const serviceData = useMemo(() => {
    const dataFromContext = currentServices.edging;
    return Array.isArray(dataFromContext) ? dataFromContext : [];
  }, [currentServices.edging]);

  const tableEntry = serviceData.find((t) => t.id === tableId) || { id: tableId, data: {} };
  
  // Memoize full data object
  const data = useMemo(() => ({
    ...INITIAL_EDGING_DATA,
    ...tableEntry.data,
    qtyUnit: { ...INITIAL_EDGING_DATA.qtyUnit, ...tableEntry.data.qtyUnit },
    unitPrice: { ...INITIAL_EDGING_DATA.unitPrice, ...tableEntry.data.unitPrice },
    summary: { ...INITIAL_EDGING_DATA.summary, ...tableEntry.data.summary },
  }), [tableEntry.data]);

  // Unified change handler
  const handleRowChange = useCallback((rowKey, inputKey) => (e) => {
    const val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    const numericValue = isNaN(val) ? 0 : val;

    const updatedRowData = { ...data[rowKey], [inputKey]: numericValue };
    const updatedTableData = { ...data, [rowKey]: updatedRowData };

    const updatedEdgingArray = serviceData.map((t) =>
      t.id === tableId ? { id: tableId, data: updatedTableData } : t
    );

    updateService("edging", updatedEdgingArray);
  }, [data, tableId, serviceData, updateService]);

  // --- CALCULATIONS ---
  const { totalRow, sumHours, totalOccDollar, finalTotal } = useMemo(() => {
    const totalRow = {};
    let totalOccDollar = 0;
    
    // Calculate totalOccDollar and totalRow
    Object.keys(data.unitPrice).forEach((col) => {
      const qty = data.qtyUnit[col] || 0;
      const price = data.unitPrice[col] || 0;
      const total = qty * price;
      totalRow[col] = total;
      totalOccDollar += total;
    });

    const sumHours = Object.values(data.qtyUnit).reduce((sum, val) => sum + (val || 0), 0);
    // adjDollar calculation is implicitly removed, as totalOccDollar is used directly for final calculation
    const numOccurrences = data.summary.numOccurrences || 0;
    // Final Total is now based on $/OCC * #OCC
    const finalTotal = totalOccDollar * numOccurrences;

    return { totalRow, sumHours, totalOccDollar, finalTotal };
  }, [data.unitPrice, data.qtyUnit, data.summary]);


  return (
    <table border="1" style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
      <thead>
        {/* The former Row 2 is now the top row */}
        <tr>
          <th>ITEM</th>
          <th>EDGER</th>
          <th>BLOWER</th>
          
          {/* Column 4: # OCC Label */}
          <th style={{ width: "8%" }}># OCC</th>
          {/* Column 5: # OCC Input (retained) */}
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
        {/* Row 1: QTY/UNIT (Hours Input) and HRS/OCC Summary */}
        <tr>
          <td>QTY/UNIT</td>
          <td>
            <LabeledInput value={data.qtyUnit.EDGER} onChange={handleRowChange("qtyUnit", "EDGER")} step={0.1} min={0} label="HRS" />
          </td>
          <td>
            <LabeledInput value={data.qtyUnit.BLOWER} onChange={handleRowChange("qtyUnit", "BLOWER")} step={0.1} min={0} label="HRS" />
          </td>
          {/* Summary Cells: HRS/OCC Label and Sum of Hours */}
          <td>HRS/OCC</td>
          <td style={{ backgroundColor: "#eef" }}>{sumHours.toFixed(2)}</td>
        </tr>

        {/* Row 2: UNIT $ (Price Display) and $/OCC Summary */}
        <tr>
          <td>UNIT $</td>
          <td>${data.unitPrice.EDGER.toFixed(2)}</td>
          <td>${data.unitPrice.BLOWER.toFixed(2)}</td>
          {/* Summary Cells: $/OCC Label and Total Occ Dollar */}
          <td>$/OCC</td>
          <td style={{ backgroundColor: "#eef" }}>${totalOccDollar.toFixed(2)}</td>
        </tr>

        {/* NOTE: The ADJ% row has been removed. */}

        {/* Row 3 (Former Row 4): TOTAL (Calculation) - Final Row */}
        <tr style={{ backgroundColor: "#f2f2f2", fontWeight: "bold" }}>
          <td>TOTAL</td>
          {/* Total for EDGER */}
          <td>${totalRow.EDGER ? totalRow.EDGER.toFixed(2) : "0.00"}</td>
          {/* Total for BLOWER */}
          <td>${totalRow.BLOWER ? totalRow.BLOWER.toFixed(2) : "0.00"}</td>
          {/* Summary Cells: TOTAL $ Label and Final Total */}
          <td>TOTAL $</td>
          <td style={{ backgroundColor: "yellow" }}>${finalTotal.toFixed(2)}</td>
        </tr>
        
      </tbody>
    </table>
  );
}