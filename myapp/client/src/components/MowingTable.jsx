import React from "react";
import LabeledInput from "./LabeledInput";

export default function MowingTable({ tableId }) {
  const [data, setData] = React.useState({
    "72-area1": 0,
    "72-area2": 0,
    "60-area1": 0,
    "60-area2": 0,
    "48-area1": 0,
    "48-area2": 0,
    TRIMMER: 0,
    BLOWER: 0,
    ROTARY: 0,
  });

  const handleChange = (key) => (e) => {
    const val = parseFloat(e.target.value);
    setData(prev => ({ ...prev, [key]: isNaN(val) ? 0 : val }));
  };

  return (
    <table border="1" style={{ borderCollapse: "collapse", width: "100%", textAlign: "center" }}>
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
        <tr>
          <td>ACRES</td>
          <td style={{ backgroundColor: "#ccc" }}></td>
          <td><LabeledInput value={data["72-area1"]} onChange={handleChange("72-area1")} step={0.25} min={0} label="Acres" /></td>
          <td><LabeledInput value={data["72-area2"]} onChange={handleChange("72-area2")} step={0.25} min={0} label="Acres" /></td>
          <td><LabeledInput value={data["60-area1"]} onChange={handleChange("60-area1")} step={0.25} min={0} label="Acres" /></td>
          <td><LabeledInput value={data["60-area2"]} onChange={handleChange("60-area2")} step={0.25} min={0} label="Acres" /></td>
          <td><LabeledInput value={data["48-area1"]} onChange={handleChange("48-area1")} step={0.25} min={0} label="Acres" /></td>
          <td><LabeledInput value={data["48-area2"]} onChange={handleChange("48-area2")} step={0.25} min={0} label="Acres" /></td>
          <td><LabeledInput value={data.TRIMMER} onChange={handleChange("TRIMMER")} step={0.25} min={0} label="HRS" /></td>
          <td><LabeledInput value={data.BLOWER} onChange={handleChange("BLOWER")} step={0.25} min={0} label="HRS" /></td>
          <td><LabeledInput value={data.ROTARY} onChange={handleChange("ROTARY")} step={0.25} min={0} label="HRS" /></td>
          <td style={{ backgroundColor: "#eee" }}></td>
          <td>{/* cumulative hours placeholder */}</td>
        </tr>
      </tbody>
    </table>
  );
}
