import React, { useState } from "react";
import LabeledInput from "./LabeledInput";

export default function EdgingTable({ tableId }) {
  const [data, setData] = useState({
    qtyUnit: { EDGER: 0, BLOWER: 0 },
    unitPrice: { EDGER: 55, BLOWER: 55 },
  });

  const handleChange = (row, key) => (e) => {
    const val = parseFloat(e.target.value);
    setData(prev => ({
      ...prev,
      [row]: { ...prev[row], [key]: isNaN(val) ? 0 : val },
    }));
  };

  // Calculate totals
  const total = {};
  Object.keys(data.unitPrice).forEach(key => {
    total[key] = (data.qtyUnit[key] || 0) * (data.unitPrice[key] || 0);
  });
  const sumHrs = data.qtyUnit.EDGER + data.qtyUnit.BLOWER;

  return (
    <table border="1" style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", marginBottom: "1rem" }}>
      <thead>
        <tr>
          <th>ITEM</th>
          <th>EDGER</th>
          <th>BLOWER</th>
          <th>HRS/OCC</th>
          <th>$ OCC</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>QTY/UNIT</td>
          <td>
            <LabeledInput value={data.qtyUnit.EDGER} onChange={handleChange("qtyUnit", "EDGER")} step={0.1} min={0} label="HRS" />
          </td>
          <td>
            <LabeledInput value={data.qtyUnit.BLOWER} onChange={handleChange("qtyUnit", "BLOWER")} step={0.1} min={0} label="HRS" />
          </td>
          <td></td>
          <td>${0.00.toFixed(2)}</td>
        </tr>
        <tr>
          <td>UNIT $</td>
          <td>${data.unitPrice.EDGER.toFixed(2)}</td>
          <td>${data.unitPrice.BLOWER.toFixed(2)}</td>
          <td># OCC</td>
          <td>0</td>
        </tr>
        <tr>
          <td>TOTAL</td>
          <td>${total.EDGER.toFixed(2)}</td>
          <td>${total.BLOWER.toFixed(2)}</td>
          <td>TOTAL $</td>
          <td>${(total.EDGER + total.BLOWER).toFixed(2)}</td>
        </tr>
        <tr>
          <td colSpan="3" style={{ textAlign: "right" }}>TOT HRS</td>
          <td colSpan="2">{sumHrs.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  );
}
