import React, { useEffect, useState } from "react";

export default function MowingRatesPage() {
  const [rates, setRates] = useState(null);

  // Load current rates from backend
  useEffect(() => {
    fetch("http://localhost:3001/api/mowing-rates")
      .then(res => res.json())
      .then(data => setRates(data))
      .catch(err => console.error("Error loading rates:", err));
  }, []);

  const handleChange = (field, value) => {
    setRates(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await fetch("http://localhost:3001/api/mowing-rates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rates)
    });

    alert("Rates saved!");
  };

  if (!rates) return <div>Loading…</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Mowing Rates</h2>

      <label>
        72" Mower Rate:
        <input
          type="number"
          step="0.01"
          value={rates.rate_72}
          onChange={e => handleChange("rate_72", e.target.value)}
        />
      </label>
      <br />

      <label>
        60" Mower Rate:
        <input
          type="number"
          step="0.01"
          value={rates.rate_60}
          onChange={e => handleChange("rate_60", e.target.value)}
        />
      </label>
      <br />

      <label>
        48" Mower Rate:
        <input
          type="number"
          step="0.01"
          value={rates.rate_48}
          onChange={e => handleChange("rate_48", e.target.value)}
        />
      </label>
      <br />

      <label>
        Trimmer Rate:
        <input
          type="number"
          step="0.01"
          value={rates.rate_trimmer}
          onChange={e => handleChange("rate_trimmer", e.target.value)}
        />
      </label>
      <br />

      <label>
        Blower Rate:
        <input
          type="number"
          step="0.01"
          value={rates.rate_blower}
          onChange={e => handleChange("rate_blower", e.target.value)}
        />
      </label>
      <br />

      <label>
        Rotary Rate:
        <input
          type="number"
          step="0.01"
          value={rates.rate_rotary}
          onChange={e => handleChange("rate_rotary", e.target.value)}
        />
      </label>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleSave}>Save Rates</button>
      </div>
    </div>
  );
}

