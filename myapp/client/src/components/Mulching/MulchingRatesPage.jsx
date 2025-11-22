// myapp/client/src/components/Mulching/MulchingRatesPage.jsx
import React, { useState, useEffect } from "react";
import { useServiceContext } from "../../context/ServiceContext";
import { useNavigate } from "react-router-dom";

const DEFAULT_MULCHING_RATES = {
  handEfficiency: {
    Slowest: 0.9,
    Slow: 1.1,
    Average: 1.4,
    Fast: 1.6,
    Fastest: 1.8,
  },
  treeRingYards: {
    Small3: 3, // Small - 3'
    Avg4: 4,   // Avg - 4'
    Large5: 5, // Lrg - 5'
    Extra6: 6, // Xtra - 6'
  },
  treeEfficiency: {
    Slowest: 0.95,
    Slow: 1.05,
    Average: 1.2,
    Fast: 1.35,
    Fastest: 1.45,
  },
  depthInches: {
    Feather: 0.5,
    '1"': 1,
    '2"': 2,
  },
  smPowerManHours: {
    Minimum: 16,
    Less: 14,
    Average: 12,
    More: 10,
    Copious: 8,
  },
  loaderManHours: {
    Minimum: 20,
    Less: 18,
    Average: 16,
    More: 14,
    Copious: 12,
  },
  proximity: {
    Close: 1.0,
    Nearby: 1.1,
    Moderate: 1.2,
    Far: 1.3,
    Farthest: 1.4,
  },
  finn: {
    yardsPerHour: {
      FinnSlowest: 4,
      FinnSlow: 4.5,
      FinnAvg: 5,
      FinnFast: 5.5,
      FinnFastest: 6,
    },
    depth: {
      '0.5"': 0.5,
      '0.75"': 0.75,
      '1"': 1,
      '1.5"': 1.5,
      '2"': 2,
    },
    helperHours: {
      Little: 0.75,
      Less: 0.9,
      Average: 1.0,
      MoreHelp: 1.1,
      Copious: 1.25,
    },
    loaderHours: {
      Little: 6,
      Less: 5.5,
      Average: 5,
      More: 4.5,
      Copious: 4,
    },
  },
};

export default function MulchingRatesPage() {
  const navigate = useNavigate();
  const { currentRates, updateRates } = useServiceContext();

  const [rates, setRates] = useState(
    currentRates?.mulchingRates || DEFAULT_MULCHING_RATES
  );

  // Keep local state in sync if currentRates changes externally
  useEffect(() => {
    if (currentRates?.mulchingRates) {
      setRates(currentRates.mulchingRates);
    }
  }, [currentRates?.mulchingRates]);

  const handleNestedChange = (path, value) => {
    setRates((prev) => {
      const clone = JSON.parse(JSON.stringify(prev || {}));
      let ref = clone;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!ref[key]) ref[key] = {};
        ref = ref[key];
      }
      ref[path[path.length - 1]] = value;
      return clone;
    });
  };

  const handleNumberChange = (path) => (e) => {
    const v = parseFloat(e.target.value);
    handleNestedChange(path, isNaN(v) ? 0 : v);
  };

  const handleSave = () => {
    if (typeof updateRates === "function") {
      updateRates("mulchingRates", rates);
    } else {
      console.warn(
        "updateRates is not defined in ServiceContext. Please wire it up to persist mulchingRates."
      );
    }
    navigate("/services/mulching");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "auto" }}>
      <h2>Mulching Rates</h2>

      {/* Hand Application Efficiency */}
      <section style={{ marginTop: "1.5rem" }}>
        <h3>Hand Application Efficiency – Yards per Man Hour</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc" }}>Equip</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Slowest</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Slow</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Average</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Fast</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Fastest</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ borderBottom: "1px solid #eee" }}>
                hand application efficiency
              </td>
              {["Slowest", "Slow", "Average", "Fast", "Fastest"].map((k) => (
                <td key={k} style={{ borderBottom: "1px solid #eee" }}>
                  <input
                    type="number"
                    step="0.01"
                    value={rates.handEfficiency?.[k] ?? 0}
                    onChange={handleNumberChange(["handEfficiency", k])}
                    style={{ width: "100%", padding: "0.25rem" }}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      {/* Tree ring size / tree efficiency */}
      <section style={{ marginTop: "1.5rem" }}>
        <h3>Tree Ring Size – Yards per Tree</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc" }}>Tree Ring Size</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Small - 3'</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Avg - 4'</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Lrg - 5'</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Xtra - 6'</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ borderBottom: "1px solid #eee" }}>mulch tree ring</td>
              <td style={{ borderBottom: "1px solid #eee" }}>
                <input
                  type="number"
                  value={rates.treeRingYards?.Small3 ?? 0}
                  onChange={handleNumberChange(["treeRingYards", "Small3"])}
                  style={{ width: "100%", padding: "0.25rem" }}
                />
              </td>
              <td style={{ borderBottom: "1px solid #eee" }}>
                <input
                  type="number"
                  value={rates.treeRingYards?.Avg4 ?? 0}
                  onChange={handleNumberChange(["treeRingYards", "Avg4"])}
                  style={{ width: "100%", padding: "0.25rem" }}
                />
              </td>
              <td style={{ borderBottom: "1px solid #eee" }}>
                <input
                  type="number"
                  value={rates.treeRingYards?.Large5 ?? 0}
                  onChange={handleNumberChange(["treeRingYards", "Large5"])}
                  style={{ width: "100%", padding: "0.25rem" }}
                />
              </td>
              <td style={{ borderBottom: "1px solid #eee" }}>
                <input
                  type="number"
                  value={rates.treeRingYards?.Extra6 ?? 0}
                  onChange={handleNumberChange(["treeRingYards", "Extra6"])}
                  style={{ width: "100%", padding: "0.25rem" }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h3>Tree Efficiency Multipliers</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc" }}>Tree Efficiency</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Slowest</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Slow</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Average</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Fast</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Fastest</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ borderBottom: "1px solid #eee" }}>
                mulching efficiency of trees
              </td>
              {["Slowest", "Slow", "Average", "Fast", "Fastest"].map((k) => (
                <td key={k} style={{ borderBottom: "1px solid #eee" }}>
                  <input
                    type="number"
                    step="0.01"
                    value={rates.treeEfficiency?.[k] ?? 0}
                    onChange={handleNumberChange(["treeEfficiency", k])}
                    style={{ width: "100%", padding: "0.25rem" }}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      {/* Depth, Sm Pwr, Loader, Proximity */}
      <section style={{ marginTop: "1.5rem" }}>
        <h3>Mulch Depth (inches)</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc" }}>Equip</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Feather</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>1"</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>2"</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ borderBottom: "1px solid #eee" }}>
                depth of mulch around trees / beds
              </td>
              {["Feather", '1"', '2"'].map((k) => (
                <td key={k} style={{ borderBottom: "1px solid #eee" }}>
                  <input
                    type="number"
                    step="0.01"
                    value={rates.depthInches?.[k] ?? 0}
                    onChange={handleNumberChange(["depthInches", k])}
                    style={{ width: "100%", padding: "0.25rem" }}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h3>Sm Pwr – Manhours per Sm Pwr Hour</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc" }}>Sm Pwr</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Minimum</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Less</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Average</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>More</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Copious</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ borderBottom: "1px solid #eee" }}>
                manhours per Sm Pwr hr
              </td>
              {["Minimum", "Less", "Average", "More", "Copious"].map((k) => (
                <td key={k} style={{ borderBottom: "1px solid #eee" }}>
                  <input
                    type="number"
                    value={rates.smPowerManHours?.[k] ?? 0}
                    onChange={handleNumberChange(["smPowerManHours", k])}
                    style={{ width: "100%", padding: "0.25rem" }}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h3>Loader – Manhours per Loader Hour</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc" }}>Loader</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Minimum</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Less</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Average</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>More</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Copious</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ borderBottom: "1px solid #eee" }}>
                manhours per loader hr
              </td>
              {["Minimum", "Less", "Average", "More", "Copious"].map((k) => (
                <td key={k} style={{ borderBottom: "1px solid #eee" }}>
                  <input
                    type="number"
                    value={rates.loaderManHours?.[k] ?? 0}
                    onChange={handleNumberChange(["loaderManHours", k])}
                    style={{ width: "100%", padding: "0.25rem" }}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h3>Proximity to Pile – Multipliers</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc" }}>Proximity</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Close</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Nearby</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Moderate</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Far</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Farthest</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ borderBottom: "1px solid #eee" }}>
                how close trees/beds are to mulch pile
              </td>
              {["Close", "Nearby", "Moderate", "Far", "Farthest"].map((k) => (
                <td key={k} style={{ borderBottom: "1px solid #eee" }}>
                  <input
                    type="number"
                    step="0.01"
                    value={rates.proximity?.[k] ?? 0}
                    onChange={handleNumberChange(["proximity", k])}
                    style={{ width: "100%", padding: "0.25rem" }}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      {/* Finn Mulching Section */}
      <section style={{ marginTop: "1.5rem" }}>
        <h3>Finn Mulching – Yards per Hour</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc" }}>Equip</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Finn Slowest</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Finn Slow</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Finn Avg</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Finn Fast</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Finn Fastest</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ borderBottom: "1px solid #eee" }}>finn yd/hour</td>
              {["FinnSlowest", "FinnSlow", "FinnAvg", "FinnFast", "FinnFastest"].map(
                (k) => (
                  <td key={k} style={{ borderBottom: "1px solid #eee" }}>
                    <input
                      type="number"
                      step="0.01"
                      value={rates.finn?.yardsPerHour?.[k] ?? 0}
                      onChange={handleNumberChange(["finn", "yardsPerHour", k])}
                      style={{ width: "100%", padding: "0.25rem" }}
                    />
                  </td>
                )
              )}
            </tr>
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h3>Finn Mulch Depth</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc" }}>Depth</th>
              {['0.5"', '0.75"', '1"', '1.5"', '2"'].map((label) => (
                <th key={label} style={{ borderBottom: "1px solid #ccc" }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ borderBottom: "1px solid #eee" }}>finn depth</td>
              {['0.5"', '0.75"', '1"', '1.5"', '2"'].map((label) => (
                <td key={label} style={{ borderBottom: "1px solid #eee" }}>
                  <input
                    type="number"
                    step="0.01"
                    value={rates.finn?.depth?.[label] ?? 0}
                    onChange={handleNumberChange(["finn", "depth", label])}
                    style={{ width: "100%", padding: "0.25rem" }}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h3>Finn Helper Hours</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc" }}>Helper</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Little</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Less</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Average</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>More Help</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Copious</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ borderBottom: "1px solid #eee" }}>finn Helper hr</td>
              {["Little", "Less", "Average", "MoreHelp", "Copious"].map((k) => (
                <td key={k} style={{ borderBottom: "1px solid #eee" }}>
                  <input
                    type="number"
                    step="0.01"
                    value={rates.finn?.helperHours?.[k] ?? 0}
                    onChange={handleNumberChange(["finn", "helperHours", k])}
                    style={{ width: "100%", padding: "0.25rem" }}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h3>Finn Loader Hours</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc" }}>Loader</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Little</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Less</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Average</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>More</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Copious</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ borderBottom: "1px solid #eee" }}>Finn Loader hrs</td>
              {["Little", "Less", "Average", "More", "Copious"].map((k) => (
                <td key={k} style={{ borderBottom: "1px solid #eee" }}>
                  <input
                    type="number"
                    step="0.01"
                    value={rates.finn?.loaderHours?.[k] ?? 0}
                    onChange={handleNumberChange(["finn", "loaderHours", k])}
                    style={{ width: "100%", padding: "0.25rem" }}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <button onClick={() => navigate("/services/mulching")}>Cancel</button>
        <button onClick={handleSave}>Save Mulching Rates</button>
      </div>
    </div>
  );
}
