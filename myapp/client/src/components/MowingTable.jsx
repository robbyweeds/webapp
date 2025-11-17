import React, { useCallback, useMemo } from "react";
import LabeledInput from "./LabeledInput";
import { useServiceContext } from "../context/ServiceContext";

// Define the default structure for Mowing data
const INITIAL_MOWING_DATA = {
  name: "Mowing Area",
  acres: {
    "72-area1": 0, "72-area2": 0, "60-area1": 0, "60-area2": 0,
    "48-area1": 0, "48-area2": 0, TRIMMER: 0, BLOWER: 0, ROTARY: 0,
  },
  qtyUnit: {
    MISC_HRS: 0, 
    "72-area1": 3, "72-area2": 0, "60-area1": 3, "60-area2": 0,
    "48-area1": 3, "48-area2": 0, TRIMMER: 0, BLOWER: 0, ROTARY: 1,
    "5111": 0, 
  },
  unitPrice: {
    MISC_HRS: 61,
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

  const serviceData = useMemo(() => {
    const dataFromContext = currentServices.mowing;
    return Array.isArray(dataFromContext) ? dataFromContext : [];
  }, [currentServices.mowing]);

  const tableEntry = serviceData.find((t) => t.id === tableId) || { id: tableId, data: {} };
  
  const data = useMemo(() => ({
    ...INITIAL_MOWING_DATA,
    name: tableEntry.data.name || INITIAL_MOWING_DATA.name,
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

  const handleNameChange = useCallback((e) => {
    const newName = e.target.value;
    
    const updatedTableData = { ...data, name: newName };

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
  const mappedKeys = Object.keys(data.unitPrice).filter(key => key !== 'MISC_HRS');

  return (
    <div style={{ marginBottom: "2rem", border: '1px solid #ccc', padding: '1rem' }}>
      
      {/* Table Name Input */}
      <div style={{ marginBottom: "1rem", display: 'flex', alignItems: 'center' }}>
        <h3 style={{ margin: 0, marginRight: '1rem', whiteSpace: 'nowrap' }}>
          Mowing Area Name:
        </h3>
        <input
          type="text"
          value={data.name || ''}
          onChange={handleNameChange}
          placeholder="e.g., North Lawn, Back Field"
          style={{ 
            padding: '8px', 
            fontSize: '16px', 
            flexGrow: 0, 
            width: '33%', 
            maxWidth: '350px' 
          }}
        />
      </div>

      {/* Existing Table Structure */}
      <table
        border="1"
        style={{ borderCollapse: "collapse", width: "100%", textAlign: "center" }}
      >
        <thead>
          {/* Row 1: Main Column Groupings and #OCC Input */}
          <tr>
            <th rowSpan="2">ITEM</th>
            <th rowSpan="2">MISC</th>
            <th colSpan="2">72" area</th>
            <th colSpan="2">60" area</th>
            <th colSpan="2">48" area</th>
            <th colSpan="3">LABOR</th>
            <th rowSpan="2">5111</th>
            <th rowSpan="2" style={{ width: "8%" }}># OCC</th> 
            <th rowSpan="2" style={{ width: "8%", backgroundColor: 'yellow' }}>
              <LabeledInput
                value={data.summary.numOccurrences}
                onChange={handleRowChange("summary", "numOccurrences")}
                step={1} min={0} label=""
                type="number"
              />
            </th>
          </tr>

          {/* Row 2: Sub-headers */}
          <tr>
            <th>area1</th> <th>area2</th> <th>area1</th> <th>area2</th>
            <th>area1</th> <th>area2</th> <th>TRIMMER</th> <th>BLOWER</th> <th>ROTARY</th>
          </tr>
        </thead>

        <tbody>
          {/* Row 1: EFFICIENCY (Static Row) - 12 columns + 2 summary columns */}
          <tr style={{ backgroundColor: "#e9f7ef", fontWeight: "bold" }}>
            <td>EFFICIENCY</td> {/* ITEM (1) */}
            <td style={{ backgroundColor: "#ccc" }}></td> {/* MISC (1) */}
            <td>Wide Open</td> {/* 72 area 1 (1) */}
            <td>Average</td> {/* 72 area 2 (1) */}
            <td>Average</td> {/* 60 area 1 (1) */}
            <td>Average</td> {/* 60 area 2 (1) */}
            <td>Average</td> {/* 48 area 1 (1) */}
            <td>Average</td> {/* 48 area 2 (1) */}
            <td colSpan="2"></td> {/* TRIMMER + BLOWER (2) */}
            <td>Average</td> {/* ROTARY (1) */}
            <td></td> {/* 5111 (1) */}
            <td>HRS/OCC:</td>
            <td style={{ backgroundColor: "#eef" }}>{sumHours.toFixed(2)}</td>
          </tr>

          {/* Row 2: ACRES (Input) - 12 columns + 2 summary columns */}
          <tr>
            <td>ACRES</td> {/* ITEM (1) */}
            <td style={{ backgroundColor: "#ccc" }}></td> {/* MISC (1) */}
            {mainKeys.map((key) => ( // 9 columns (72-area1 to ROTARY)
              <td key={key}>
                <LabeledInput
                  value={data.acres[key]}
                  onChange={handleRowChange("acres", key)}
                  step={0.25} min={0} label="Acres"
                />
              </td>
            ))}
            {/* FIX: The final blank cell must use colSpan="1" to fill only the 5111 column */}
            <td style={{ backgroundColor: "#eef" }}></td> {/* 5111 Column (1) */}
            <td>ACRES:</td>
            <td style={{ backgroundColor: "#eef" }}>{sumAcres.toFixed(2)}</td>
          </tr>

          {/* Row 3: QTY/UNIT (Hours Input) - 12 columns + 2 summary columns */}
          <tr>
            <td>QTY/UNIT</td> {/* ITEM (1) */}
            {/* MISC Hours Input (1) */}
            <td key="MISC_HRS_QTY" style={{ backgroundColor: "#b3d9ff" }}>
              <LabeledInput
                value={data.qtyUnit.MISC_HRS}
                onChange={handleRowChange("qtyUnit", "MISC_HRS")}
                step={0.25} min={0} label="HRS"
              />
            </td>
            
            {/* Loop over all other QTY/UNIT keys, which includes 5111 (10 columns total) */}
            {Object.keys(data.qtyUnit).filter(key => key !== 'MISC_HRS').map((key) => (
              <td key={key} style={{ backgroundColor: "#b3d9ff" }}>
                <LabeledInput
                  value={data.qtyUnit[key]}
                  onChange={handleRowChange("qtyUnit", key)}
                  step={0.25} min={0} label="HRS"
                />
              </td>
            ))}
            <td>$/OCC:</td>
            <td style={{ backgroundColor: "#eef" }}>${totalOccDollar.toFixed(2)}</td>
          </tr>

          {/* Row 4: UNIT $ (Price Display & ADJ% Input) - 12 columns + 2 summary columns */}
          <tr>
            <td>UNIT $</td> {/* ITEM (1) */}
            {/* MISC Price Display (1) */}
            <td key="MISC_HRS_PRICE">
              ${data.unitPrice.MISC_HRS ? data.unitPrice.MISC_HRS.toFixed(2) : "0.00"}
            </td>

            {/* Loop over all other UNIT $ keys, which includes 5111 (10 columns total) */}
            {mappedKeys.map((key) => (
              <td key={key}>${data.unitPrice[key] ? data.unitPrice[key].toFixed(2) : "0.00"}</td>
            ))}
            
            <td>
              <LabeledInput
                value={data.summary.adjPercent}
                onChange={handleRowChange("summary", "adjPercent")}
                step={0.5} min={-100} label="ADJ%"
                placeholder="0"
              />
            </td>
            {/* ADJ $ occupies the second summary column */}
            <td style={{ backgroundColor: "#eef" }}>
              ${adjDollar.toFixed(2)}
            </td>
          </tr>
          
          {/* Row 5: TOTAL (Calculation) - Final Row - 12 columns + 2 summary columns */}
          <tr style={{ backgroundColor: "#f2f2f2", fontWeight: "bold" }}>
            <td>TOTAL</td> {/* ITEM (1) */}
            {/* MISC Total Calculation (1) */}
            <td key="MISC_HRS_TOTAL">
              ${totalRow.MISC_HRS ? totalRow.MISC_HRS.toFixed(2) : "0.00"}
            </td>
            
            {/* Loop over all other TOTAL keys, which includes 5111 (10 columns total) */}
            {mappedKeys.map((key) => (
              <td key={key}>
                ${totalRow[key] ? totalRow[key].toFixed(2) : "0.00"}
              </td>
            ))}

            {/* TOTAL $ Label (1) */}
            <td>TOTAL $</td>
            {/* TOTAL $ Value (1) */}
            <td style={{ backgroundColor: "yellow", fontWeight: "bold" }}>
                ${finalTotal.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}