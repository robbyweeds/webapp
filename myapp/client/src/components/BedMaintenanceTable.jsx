import React, { useState } from "react";
import LabeledInput from "./LabeledInput";

export default function BedMaintenanceTable({ tableId }) {
  const [data, setData] = useState({
    qtyUnit: { HAND: 0, BACKPACK: 0, ROUNDUP: 0, OTHER: 0 },
    unitPrice: { HAND: 51, BACKPACK: 55, ROUNDUP: 0.24, OTHER: 0 },
  });

  const handleChange = (row, key) => (e) => {
    const val = parseFloat(e.target.value);
    setData(prev => ({
      ...prev,
      [row]: { ...prev[row], [key]: isNaN(val) ? 0 : val },
    }));
  };

  const total = {};
  Object.keys(data.unitPrice).forEach(key => {
    total[key] = (data.qtyUnit[key] || 0) * (data.unitPrice[key] || 0);
  });

  const sumHrs = data.qtyUnit.HAND + data.qtyUnit.BACKPACK + data.qtyUnit.ROUNDUP + data.qtyUnit.OTHER;
  const totalMat = total.HAND + total.BACKPACK + total.ROUNDUP + total.OTHER;

  return (
    <table border="1" style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", marginBottom: "1rem" }}>
      <thead>
        <tr>
          <th>HAND</th>
          <th>BACK PACK</th>
          <th>ROUND UP</th>
          <th>OTHER</th>
          <th>HRS/OCC</th>
          <th>$ OCC</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <LabeledInput value={data.qtyUnit.HAND} onChange={handleChange("qtyUnit", "HAND")} step={0.1} min={0} label="HRS" />
          </td>
          <td>
            <LabeledInput value={data.qtyUnit.BACKPACK} onChange={handleChange("qtyUnit", "BACKPACK")} step={0.1} min={0} label="HRS" />
          </td>
          <td>
            <LabeledInput value={data.qtyUnit.ROUNDUP} onChange={handleChange("qtyUnit", "ROUNDUP")} step={0.1} min={0} label="OZS" />
          </td>
          <td>
            <LabeledInput value={data.qtyUnit.OTHER} onChange={handleChange("qtyUnit", "OTHER")} step={0.1} min={0} label="HRS" />
          </td>
          <td></td>
          <td>${0.00.toFixed(2)}</td>
        </tr>
        <tr>
          <td>${data.unitPrice.HAND.toFixed(2)}</td>
          <td>${data.unitPrice.BACKPACK.toFixed(2)}</td>
          <td>${data.unitPrice.ROUNDUP.toFixed(2)}</td>
          <td>${data.unitPrice.OTHER.toFixed(2)}</td>
          <td># OCC</td>
          <td>0</td>
        </tr>
        <tr>
          <td>${total.HAND.toFixed(2)}</td>
          <td>${total.BACKPACK.toFixed(2)}</td>
          <td>${total.ROUNDUP.toFixed(2)}</td>
          <td>${total.OTHER.toFixed(2)}</td>
          <td>TOTAL $</td>
          <td>${totalMat.toFixed(2)}</td>
        </tr>
        <tr>
          <td colSpan="5" style={{ textAlign: "right" }}>TOT HRS</td>
          <td>{sumHrs.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  );
}
