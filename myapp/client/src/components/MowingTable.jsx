import React, { useState } from "react";
import LabeledInput from "./LabeledInput";

export default function MowingTable({ tableId }) {
  const [data, setData] = useState({
    acres: {
      "72-area1": 0,
      "72-area2": 0,
      "60-area1": 0,
      "60-area2": 0,
      "48-area1": 0,
      "48-area2": 0,
      TRIMMER: 0,
      BLOWER: 0,
      ROTARY: 0,
    },
    qtyUnit: {
      "72-area1": 3,
      "72-area2": 0,
      "60-area1": 3,
      "60-area2": 0,
      "48-area1": 3,
      "48-area2": 0,
      TRIMMER: 0,
      BLOWER: 0,
      ROTARY: 1,
    },
    unitPrice: {
      "72-area1": 51,
      "72-area2": 61,
      "60-area1": 61,
      "60-area2": 59,
      "48-area1": 56,
      "48-area2": 56,
      TRIMMER: 55,
      BLOWER: 55,
      ROTARY: 55,
      Specialty: 100,
    },
  });

  const handleRowChange = (row, key) => (e) => {
    const val = parseFloat(e.target.value);
    setData((prev) => ({
      ...prev,
      [row]: { ...prev[row], [key]: isNaN(val) ? 0 : val },
    }));
  };

  // --- Formula rows ---
  const totalRow = {};
  Object.keys(data.unitPrice).forEach((col) => {
    const qty = data.qtyUnit[col] || 0;
    const price = data.unitPrice[col] || 0;
    totalRow[col] = qty * price;
  });

  const sumHours =
    data.qtyUnit.TRIMMER +
    data.qtyUnit.BLOWER +
    data.qtyUnit.ROTARY;

  return (
    <table
      border="1"
      style={{ borderCollapse: "collapse", width: "100%", textAlign: "center" }}
    >
      <thead>
        <tr>
          <th>ITEM</th>
          <th>MISC</th>
          <th>72"-area1</th>
          <th>72"-area2</th>
          <th>60"-area1</th>
          <th>60"-area2</th>
          <th>48"-area1</th>
          <th>48"-area2</th>
          <th>TRIMMER</th>
          <th>BLOWER</th>
          <th>ROTARY</th>
          <th>Specialty</th>
          <th>HRS/OCC</th>
        </tr>
      </thead>

      <tbody>
        {/* --------- EFFICIENCY row --------- */}
        <tr style={{ backgroundColor: "#e9f7ef", fontWeight: "bold" }}>
          <td>EFFICIENCY</td>
          <td></td>
          <td>HOA Homes</td>
          <td>Average</td>
          <td>HOA Homes</td>
          <td>Average</td>
          <td>HOA Homes</td>
          <td>Average</td>
          <td>HOA Homes</td>
          <td>HOA Homes</td>
          <td>HOA Homes</td>
          <td></td>
          <td>ACRES</td>
        </tr>

        {/* --------- ACRES row --------- */}
        <tr>
          <td>ACRES</td>
          <td style={{ backgroundColor: "#ccc" }}></td>

          {Object.keys(data.acres).map((key) => (
            <td key={key}>
              <LabeledInput
                value={data.acres[key]}
                onChange={handleRowChange("acres", key)}
                step={0.25}
                min={0}
                label="Acres"
              />
            </td>
          ))}

          <td style={{ backgroundColor: "#eef" }}></td>
          <td>{/* ACRES total (compute later) */}</td>
        </tr>

        {/* --------- QTY/UNIT row --------- */}
        <tr>
          <td>QTY/UNIT</td>
          <td>3.00 HRS</td>

          {Object.keys(data.qtyUnit).map((key) => (
            <td key={key}>
              <LabeledInput
                value={data.qtyUnit[key]}
                onChange={handleRowChange("qtyUnit", key)}
                step={0.25}
                min={0}
                label="HRS"
              />
            </td>
          ))}

          <td>ADJ%</td>
          <td>0%</td>
        </tr>

        {/* --------- UNIT $ row --------- */}
        <tr>
          <td>UNIT $</td>
          <td>$153.00</td>

          {Object.keys(data.unitPrice).map((key) => (
            <td key={key}>${data.unitPrice[key].toFixed(2)}</td>
          ))}

          <td># OCC</td>
          <td>0</td>
        </tr>

        {/* --------- TOTAL row --------- */}
        <tr style={{ backgroundColor: "#f2f2f2" }}>
          <td>TOTAL</td>
          <td>${totalRow["72-area1"].toFixed(2)}</td>

          {Object.keys(totalRow).map((key) => (
            <td key={key}>${totalRow[key].toFixed(2)}</td>
          ))}

          <td>TOTAL $</td>
          <td>$0.00</td>
        </tr>

        {/* --------- Bottom summary --------- */}
        <tr style={{ backgroundColor: "#ffe" }}>
          <td colSpan="12" style={{ textAlign: "right" }}>
            TOT HRS
          </td>
          <td>{sumHours.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  );
}
