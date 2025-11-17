import React, { useCallback, useMemo } from "react";
import LabeledInput from "./LabeledInput";
import { useServiceContext } from "../context/ServiceContext";

// Define the default structure for Mowing data
const INITIAL_MOWING_DATA = {
  acres: {
    "72-area1": 0, "72-area2": 0, "60-area1": 0, "60-area2": 0,
    "48-area1": 0, "48-area2": 0, TRIMMER: 0, BLOWER: 0, ROTARY: 0,
  },
  qtyUnit: {
    "72-area1": 3, "72-area2": 0, "60-area1": 3, "60-area2": 0,
    "48-area1": 3, "48-area2": 0, TRIMMER: 0, BLOWER: 0, ROTARY: 1,
  },
  unitPrice: {
    "72-area1": 51, "72-area2": 61, "60-area1": 61, "60-area2": 59,
    "48-area1": 56, "48-area2": 56, TRIMMER: 55, BLOWER: 55, ROTARY: 55,
    "5111": 100,
  },
  summary: {
    adjPercent: 0,
    numOccurrences: 1,
  }
};

export default function MowingTable({ tableId }) {
  const { currentServices, updateService } = useServiceContext();

  const serviceData = currentServices.mowing || [];
  const tableEntry = serviceData.find((t) => t.id === tableId) || { id: tableId, data: {} };
  
  const data = useMemo(() => ({
    ...INITIAL_MOWING_DATA,
    ...tableEntry.data,
    acres: { ...INITIAL_MOWING_DATA.acres, ...tableEntry.data.acres },
    qtyUnit: { ...INITIAL_MOWING_DATA.qtyUnit, ...tableEntry.data.qtyUnit },
    unitPrice: { ...INITIAL_MOWING_DATA.unitPrice, ...tableEntry.data.unitPrice },
    summary: { ...INITIAL_MOWING_DATA.summary, ...tableEntry.data.summary },
  }), [tableEntry.data]);

  const handleRowChange = useCallback((rowKey, inputKey) => (e) => {
    const val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    const numericValue = isNaN(val) ? 0 : val;

    const updatedRowData = { ...data[rowKey], [inputKey]: numericValue };

    const updatedTableData = { ...data, [rowKey]: updatedRowData };

    const updatedMowingArray = serviceData.map((t) =>
      t.id === tableId ? { id: tableId, data: updatedTableData } : t
    );

    updateService("mowing", updatedMowingArray);
  }, [data, tableId, serviceData, updateService]);

  // --- CALCULATIONS ---
  const { totalRow, sumHours, sumAcres, totalOccDollar, adjDollar, finalTotal } = useMemo(() => {
    const totalRow = {};
    let totalOccDollar = 0; 

    Object.keys(data.unitPrice).forEach((col) => {
      const qty = data.qtyUnit[col] || 0;
      const price = data.unitPrice[col] || 0;
      const total = qty * price;
      totalRow[col] = total;
      totalOccDollar += total;
    });

    const sumHours = Object.values(data.qtyUnit).reduce((sum, val) => sum + (val || 0), 0);
    const sumAcres = Object.values(data.acres).reduce((sum, val) => sum + (val || 0), 0);

    const adjPercent = (data.summary.adjPercent || 0) / 100;
    const adjDollar = totalOccDollar * (1 + adjPercent); 

    const numOccurrences = data.summary.numOccurrences || 0;
    const finalTotal = adjDollar * numOccurrences;

    return { totalRow, sumHours, sumAcres, totalOccDollar, adjDollar, finalTotal };
  }, [data.unitPrice, data.qtyUnit, data.acres, data.summary]);

  const mainKeys = Object.keys(data.acres);

  return (
    <table
      border="1"
      style={{ borderCollapse: "collapse", width: "100%", textAlign: "center", marginBottom: "2rem" }}
    >
      <thead>
        {/* Row 1: Main Column Groupings and New #OCC Input */}
        <tr>
          <th rowSpan="2">ITEM</th>
          <th rowSpan="2">MISC</th>
          <th colSpan="2">72" area</th>
          <th colSpan="2">60" area</th>
          <th colSpan="2">48" area</th>
          <th colSpan="3">LABOR</th>
          <th rowSpan="2">5111</th>
          
          {/* MODIFIED: Replaced HRS/OCC with #OCC label */}
          <th rowSpan="2" style={{ width: "8%" }}># OCC</th> 
          
          {/* MODIFIED: Replaced ACRES with #OCC input */}
          <th rowSpan="2" style={{ width: "8%", backgroundColor: 'yellow' }}>
            <LabeledInput
              value={data.summary.numOccurrences}
              onChange={handleRowChange("summary", "numOccurrences")}
              step={1} min={0} label=""
              type="number"
            />
          </th>
          
          {/* DROPPED: $/OCC and TOTAL $ headers (now just 2 summary columns remaining) */}
        </tr>

        {/* Row 2: Sub-headers */}
        <tr>
          <th>area1</th> <th>area2</th> <th>area1</th> <th>area2</th>
          <th>area1</th> <th>area2</th> <th>TRIMMER</th> <th>BLOWER</th> <th>ROTARY</th>
        </tr>
      </thead>

      <tbody>
        {/* Row 1: EFFICIENCY (Static Row) */}
        <tr style={{ backgroundColor: "#e9f7ef", fontWeight: "bold" }}>
          <td>EFFICIENCY</td>
          <td style={{ backgroundColor: "#ccc" }}></td>
          <td>Wide Open</td>
          <td>Average</td>
          <td>Average</td>
          <td>Average</td>
          <td>Average</td>
          <td>Average</td>
          <td colSpan="2"></td> 
          <td>Average</td>
          <td></td> 
          
          {/* Summary Cells: HRS/OCC Label and Sum of Hours (now uses the remaining 2 summary columns) */}
          <td colSpan="2">
            HRS/OCC: {sumHours.toFixed(2)}
          </td>
          {/* DROPPED: Final two <td>s */}
        </tr>

        {/* Row 2: ACRES (Input) */}
        <tr>
          <td>ACRES</td>
          <td style={{ backgroundColor: "#ccc" }}></td>
          {mainKeys.map((key) => (
            <td key={key}>
              <LabeledInput
                value={data.acres[key]}
                onChange={handleRowChange("acres", key)}
                step={0.25} min={0} label="Acres"
              />
            </td>
          ))}
          <td style={{ backgroundColor: "#eef" }}></td> 

          {/* Summary Cells: ACRES Label and Sum of Acres */}
          <td colSpan="2">
            ACRES: {sumAcres.toFixed(2)}
          </td>
          {/* DROPPED: Final two <td>s */}
        </tr>

        {/* Row 3: QTY/UNIT (Hours Input) */}
        <tr>
          <td>QTY/UNIT</td>
          <td style={{ backgroundColor: "#b3d9ff" }}>0.00 HRS</td>
          {Object.keys(data.qtyUnit).map((key) => (
            <td key={key} style={{ backgroundColor: "#b3d9ff" }}>
              <LabeledInput
                value={data.qtyUnit[key]}
                onChange={handleRowChange("qtyUnit", key)}
                step={0.25} min={0} label="HRS"
              />
            </td>
          ))}
          <td style={{ backgroundColor: "#eef" }}></td>

          {/* Summary Cells: $/OCC Label and Total Occ Dollar */}
          <td colSpan="2">
            $/OCC: ${totalOccDollar.toFixed(2)}
          </td>
          {/* DROPPED: Final two <td>s */}
        </tr>

        {/* Row 4: UNIT $ (Price Display) */}
        <tr>
          <td>UNIT $</td>
          <td>$61.00</td>
          {Object.keys(data.unitPrice).map((key) => (
             <td key={key}>${data.unitPrice[key] ? data.unitPrice[key].toFixed(2) : "0.00"}</td>
          ))}
          
          {/* Summary Cells: ADJ% Input and Adjusted Dollar Calculation */}
          <td>
            <LabeledInput
              value={data.summary.adjPercent}
              onChange={handleRowChange("summary", "adjPercent")}
              step={0.5} min={-100} label="%"
              placeholder="0"
            />
          </td>
          <td style={{ backgroundColor: "#eef" }}>
            ${adjDollar.toFixed(2)}
          </td>
          {/* DROPPED: Final two <td>s */}
        </tr>
        
        {/* Row 5: TOTAL (Calculation) - Final Row */}
        <tr style={{ backgroundColor: "#f2f2f2", fontWeight: "bold" }}>
          <td>TOTAL</td>
          <td>$0.00</td> 
          
          {Object.keys(data.unitPrice).map((key) => (
            <td key={key}>
              ${totalRow[key] ? totalRow[key].toFixed(2) : "0.00"}
            </td>
          ))}

          {/* Summary Cells: TOTAL $ Label and Final Calculation */}
          <td>TOTAL $</td>
          <td style={{ backgroundColor: "yellow", fontWeight: "bold" }}>
             ${finalTotal.toFixed(2)}
          </td>
          {/* DROPPED: Final two <td>s */}
        </tr>
      </tbody>
    </table>
  );
}