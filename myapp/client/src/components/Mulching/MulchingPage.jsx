// myapp/client/src/components/Mulching/MulchingPage.jsx

import React from "react";
import { useServiceContext } from "../../context/ServiceContext";
import {
  INITIAL_MULCHING_DATA,
  DEFAULT_MULCHING_RATES,
} from "./mulchingDefaults";

// Merge raw entry data with our initial shape
function mergeMulchingData(raw) {
  const base = raw || {};

  // Augment INITIAL_MULCHING_DATA with our extra SmPwr/Loader keys
  const BASE_INITIAL = {
    ...INITIAL_MULCHING_DATA,
    smPwrCommon: {
      selection: "Average",
      hoursOverride: null,
      ...(INITIAL_MULCHING_DATA.smPwrCommon || {}),
    },
    loaderCommon: {
      selection: "Average",
      hoursOverride: null,
      ...(INITIAL_MULCHING_DATA.loaderCommon || {}),
    },
    smPwrHomes: {
      selection: "Average",
      hoursOverride: null,
      ...(INITIAL_MULCHING_DATA.smPwrHomes || {}),
    },
    loaderHomes: {
      selection: "Average",
      hoursOverride: null,
      ...(INITIAL_MULCHING_DATA.loaderHomes || {}),
    },
  };

  const rawCommon = base.handCommonAreas || {};
  const rawHomes = base.handHomes || {};

  return {
    ...BASE_INITIAL,
    ...base,
    summary: {
      ...BASE_INITIAL.summary,
      ...(base.summary || {}),
    },
    handCommonAreas: {
      ...BASE_INITIAL.handCommonAreas,
      ...rawCommon,
      area1: {
        ...BASE_INITIAL.handCommonAreas.area1,
        ...(rawCommon.area1 || {}),
      },
      area2: {
        ...BASE_INITIAL.handCommonAreas.area2,
        ...(rawCommon.area2 || {}),
      },
      area3: {
        ...BASE_INITIAL.handCommonAreas.area3,
        ...(rawCommon.area3 || {}),
      },
    },
    handHomes: {
      ...BASE_INITIAL.handHomes,
      ...rawHomes,
      home1: {
        ...BASE_INITIAL.handHomes.home1,
        ...(rawHomes.home1 || {}),
      },
      home2: {
        ...BASE_INITIAL.handHomes.home2,
        ...(rawHomes.home2 || {}),
      },
      home3: {
        ...BASE_INITIAL.handHomes.home3,
        ...(rawHomes.home3 || {}),
      },
    },
    smPwrCommon: {
      ...BASE_INITIAL.smPwrCommon,
      ...(base.smPwrCommon || {}),
    },
    loaderCommon: {
      ...BASE_INITIAL.loaderCommon,
      ...(base.loaderCommon || {}),
    },
    smPwrHomes: {
      ...BASE_INITIAL.smPwrHomes,
      ...(base.smPwrHomes || {}),
    },
    loaderHomes: {
      ...BASE_INITIAL.loaderHomes,
      ...(base.loaderHomes || {}),
    },
  };
}

// Compute hours + mulch for a "Common Area" row
function computeCommonAreaValues(area, mulchingRates) {
  const sqftNum = Number(area.sqft) || 0;
  if (!mulchingRates || sqftNum <= 0) {
    return { hours: 0, mulch: 0 };
  }

  const effTable = mulchingRates.handEfficiency || {};
  const proxTable = mulchingRates.proximity || {};
  const depthTable = mulchingRates.depthInches || {};

  const eff = effTable[area.efficiency] || effTable.Average || 1;
  const prox = proxTable[area.proximity] || 1;
  const depthInches = depthTable[area.depth] || 0;

  // Mulch yards from sq ft + depth
  const rawYards = depthInches > 0 ? (sqftNum * (depthInches / 12)) / 27 : 0;
  // CEILING to nearest 0.5 yards
  const mulch =
    rawYards > 0 ? Math.ceil(rawYards / 0.5) * 0.5 : 0;

  // Hours: yards / yards-per-man-hour * proximity multiplier
  const hours = eff > 0 ? (mulch / eff) * prox : 0;

  return { hours, mulch };
}

// Compute hours + mulch for a "Home" row (sqftEach * count)
function computeHomeValues(home, mulchingRates) {
  const sqftEach = Number(home.sqftEach) || 0;
  const count = Number(home.count) || 0;
  const totalSqft = sqftEach * count;
  if (!mulchingRates || totalSqft <= 0) {
    return { hours: 0, mulch: 0, totalSqft: 0 };
  }

  const effTable = mulchingRates.handEfficiency || {};
  const proxTable = mulchingRates.proximity || {};
  const depthTable = mulchingRates.depthInches || {};

  const eff = effTable[home.efficiency] || effTable.Average || 1;
  const prox = proxTable[home.proximity] || 1;
  const depthInches = depthTable[home.depth] || 0;

  const rawYards =
    depthInches > 0 ? (totalSqft * (depthInches / 12)) / 27 : 0;
  const mulch =
    rawYards > 0 ? Math.ceil(rawYards / 0.5) * 0.5 : 0;

  const hours = eff > 0 ? (mulch / eff) * prox : 0;

  return { hours, mulch, totalSqft };
}

export default function MulchingPage({ tableId }) {
  const { currentServices, updateService, currentRates } =
    useServiceContext();

  const mulchingArray = Array.isArray(currentServices.mulching)
    ? currentServices.mulching
    : [];

  const existingEntry =
    mulchingArray.find((m) => m.id === tableId) || { id: tableId, data: {} };

  const mulchingRates =
    currentRates?.mulchingRates || DEFAULT_MULCHING_RATES;

  const mergedData = mergeMulchingData(existingEntry.data || {});

  const updateMulchingData = (newData) => {
    const updatedEntry = { ...existingEntry, data: newData };
    let updatedArray;

    if (mulchingArray.some((m) => m.id === tableId)) {
      updatedArray = mulchingArray.map((m) =>
        m.id === tableId ? updatedEntry : m
      );
    } else {
      updatedArray = [...mulchingArray, updatedEntry];
    }

    updateService("mulching", updatedArray);
  };

  // -------- HANDLERS FOR COMMON AREAS --------

  const handleCommonFieldChange = (areaKey, field, value) => {
    const newData = {
      ...mergedData,
      handCommonAreas: {
        ...mergedData.handCommonAreas,
        [areaKey]: {
          ...mergedData.handCommonAreas[areaKey],
          [field]: value,
          hoursOverride: null,
          mulchOverride: null,
        },
      },
      // Changing base inputs resets SmPwr/Loader overrides
      smPwrCommon: {
        ...mergedData.smPwrCommon,
        hoursOverride: null,
      },
      loaderCommon: {
        ...mergedData.loaderCommon,
        hoursOverride: null,
      },
    };
    updateMulchingData(newData);
  };

  const handleCommonHoursOverrideChange = (areaKey, value) => {
    const num = value === "" ? null : Number(value);
    const newData = {
      ...mergedData,
      handCommonAreas: {
        ...mergedData.handCommonAreas,
        [areaKey]: {
          ...mergedData.handCommonAreas[areaKey],
          hoursOverride: isNaN(num) ? null : num,
        },
      },
    };
    updateMulchingData(newData);
  };

  const handleCommonMulchOverrideChange = (areaKey, value) => {
    const num = value === "" ? null : Number(value);
    const newData = {
      ...mergedData,
      handCommonAreas: {
        ...mergedData.handCommonAreas,
        [areaKey]: {
          ...mergedData.handCommonAreas[areaKey],
          mulchOverride: isNaN(num) ? null : num,
        },
      },
      smPwrCommon: {
        ...mergedData.smPwrCommon,
        hoursOverride: null,
      },
      loaderCommon: {
        ...mergedData.loaderCommon,
        hoursOverride: null,
      },
    };
    updateMulchingData(newData);
  };

  // -------- HANDLERS FOR HOMES --------

  const handleHomeFieldChange = (homeKey, field, value) => {
    const newData = {
      ...mergedData,
      handHomes: {
        ...mergedData.handHomes,
        [homeKey]: {
          ...mergedData.handHomes[homeKey],
          [field]: value,
          hoursOverride: null,
          mulchOverride: null,
        },
      },
      smPwrHomes: {
        ...mergedData.smPwrHomes,
        hoursOverride: null,
      },
      loaderHomes: {
        ...mergedData.loaderHomes,
        hoursOverride: null,
      },
    };
    updateMulchingData(newData);
  };

  const handleHomeHoursOverrideChange = (homeKey, value) => {
    const num = value === "" ? null : Number(value);
    const newData = {
      ...mergedData,
      handHomes: {
        ...mergedData.handHomes,
        [homeKey]: {
          ...mergedData.handHomes[homeKey],
          hoursOverride: isNaN(num) ? null : num,
        },
      },
    };
    updateMulchingData(newData);
  };

  const handleHomeMulchOverrideChange = (homeKey, value) => {
    const num = value === "" ? null : Number(value);
    const newData = {
      ...mergedData,
      handHomes: {
        ...mergedData.handHomes,
        [homeKey]: {
          ...mergedData.handHomes[homeKey],
          mulchOverride: isNaN(num) ? null : num,
        },
      },
      smPwrHomes: {
        ...mergedData.smPwrHomes,
        hoursOverride: null,
      },
      loaderHomes: {
        ...mergedData.loaderHomes,
        hoursOverride: null,
      },
    };
    updateMulchingData(newData);
  };

  // -------- COMPUTE TOTALS FOR COMMON & HOMES --------

  const commonAreaKeys = ["area1", "area2", "area3"];
  const homeKeys = ["home1", "home2", "home3"];

  let totalCommonHours = 0;
  let totalCommonMulch = 0;

  commonAreaKeys.forEach((k) => {
    const area = mergedData.handCommonAreas[k];
    const computed = computeCommonAreaValues(area, mulchingRates);
    const displayHours =
      area.hoursOverride != null ? area.hoursOverride : computed.hours;
    const displayMulch =
      area.mulchOverride != null ? area.mulchOverride : computed.mulch;

    totalCommonHours += displayHours || 0;
    totalCommonMulch += displayMulch || 0;
  });

  let totalHomesHours = 0;
  let totalHomesMulch = 0;

  homeKeys.forEach((k) => {
    const home = mergedData.handHomes[k];
    const computed = computeHomeValues(home, mulchingRates);
    const displayHours =
      home.hoursOverride != null ? home.hoursOverride : computed.hours;
    const displayMulch =
      home.mulchOverride != null ? home.mulchOverride : computed.mulch;

    totalHomesHours += displayHours || 0;
    totalHomesMulch += displayMulch || 0;
  });

  // -------- SM PWR & LOADER (COMMON) --------

  const smPwrRates = mulchingRates.smPowerManHours || {};
  const loaderRates = mulchingRates.loaderManHours || {};

  const smPwrCommonSelection = mergedData.smPwrCommon.selection || "Average";
  const loaderCommonSelection = mergedData.loaderCommon.selection || "Average";

  const smPwrCommonRate = smPwrRates[smPwrCommonSelection] || 0;
  const loaderCommonRate = loaderRates[loaderCommonSelection] || 0;

  const computedSmPwrCommonHours =
    smPwrCommonRate > 0 && totalCommonMulch > 0
      ? totalCommonMulch / smPwrCommonRate
      : 0;

  const computedLoaderCommonHours =
    loaderCommonRate > 0 && totalCommonMulch > 0
      ? totalCommonMulch / loaderCommonRate
      : 0;

  const smPwrCommonDisplay =
    mergedData.smPwrCommon.hoursOverride != null
      ? mergedData.smPwrCommon.hoursOverride
      : computedSmPwrCommonHours;

  const loaderCommonDisplay =
    mergedData.loaderCommon.hoursOverride != null
      ? mergedData.loaderCommon.hoursOverride
      : computedLoaderCommonHours;

  const handleSmPwrCommonSelectionChange = (value) => {
    const newData = {
      ...mergedData,
      smPwrCommon: {
        ...mergedData.smPwrCommon,
        selection: value,
        hoursOverride: null,
      },
    };
    updateMulchingData(newData);
  };

  const handleSmPwrCommonOverrideChange = (value) => {
    const num = value === "" ? null : Number(value);
    const newData = {
      ...mergedData,
      smPwrCommon: {
        ...mergedData.smPwrCommon,
        hoursOverride: isNaN(num) ? null : num,
      },
    };
    updateMulchingData(newData);
  };

  const handleLoaderCommonSelectionChange = (value) => {
    const newData = {
      ...mergedData,
      loaderCommon: {
        ...mergedData.loaderCommon,
        selection: value,
        hoursOverride: null,
      },
    };
    updateMulchingData(newData);
  };

  const handleLoaderCommonOverrideChange = (value) => {
    const num = value === "" ? null : Number(value);
    const newData = {
      ...mergedData,
      loaderCommon: {
        ...mergedData.loaderCommon,
        hoursOverride: isNaN(num) ? null : num,
      },
    };
    updateMulchingData(newData);
  };

  // -------- SM PWR & LOADER (HOMES) --------

  const smPwrHomesSelection = mergedData.smPwrHomes.selection || "Average";
  const loaderHomesSelection = mergedData.loaderHomes.selection || "Average";

  const smPwrHomesRate = smPwrRates[smPwrHomesSelection] || 0;
  const loaderHomesRate = loaderRates[loaderHomesSelection] || 0;

  const computedSmPwrHomesHours =
    smPwrHomesRate > 0 && totalHomesMulch > 0
      ? totalHomesMulch / smPwrHomesRate
      : 0;

  const computedLoaderHomesHours =
    loaderHomesRate > 0 && totalHomesMulch > 0
      ? totalHomesMulch / loaderHomesRate
      : 0;

  const smPwrHomesDisplay =
    mergedData.smPwrHomes.hoursOverride != null
      ? mergedData.smPwrHomes.hoursOverride
      : computedSmPwrHomesHours;

  const loaderHomesDisplay =
    mergedData.loaderHomes.hoursOverride != null
      ? mergedData.loaderHomes.hoursOverride
      : computedLoaderHomesHours;

  const handleSmPwrHomesSelectionChange = (value) => {
    const newData = {
      ...mergedData,
      smPwrHomes: {
        ...mergedData.smPwrHomes,
        selection: value,
        hoursOverride: null,
      },
    };
    updateMulchingData(newData);
  };

  const handleSmPwrHomesOverrideChange = (value) => {
    const num = value === "" ? null : Number(value);
    const newData = {
      ...mergedData,
      smPwrHomes: {
        ...mergedData.smPwrHomes,
        hoursOverride: isNaN(num) ? null : num,
      },
    };
    updateMulchingData(newData);
  };

  const handleLoaderHomesSelectionChange = (value) => {
    const newData = {
      ...mergedData,
      loaderHomes: {
        ...mergedData.loaderHomes,
        selection: value,
        hoursOverride: null,
      },
    };
    updateMulchingData(newData);
  };

  const handleLoaderHomesOverrideChange = (value) => {
    const num = value === "" ? null : Number(value);
    const newData = {
      ...mergedData,
      loaderHomes: {
        ...mergedData.loaderHomes,
        hoursOverride: isNaN(num) ? null : num,
      },
    };
    updateMulchingData(newData);
  };

  // -------- LIVE PREVIEW TOTALS --------

  const totalSmPwrHours = (smPwrCommonDisplay || 0) + (smPwrHomesDisplay || 0);
  const totalLoaderHours =
    (loaderCommonDisplay || 0) + (loaderHomesDisplay || 0);

  const totalAreaHours = totalCommonHours + totalHomesHours;
  const totalHours = totalAreaHours + totalSmPwrHours + totalLoaderHours;
  const totalMulchYards = totalCommonMulch + totalHomesMulch;

  // -------- RENDER HELPERS --------

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "0.25rem",
    fontSize: "0.85rem",
  };

  const thStyle = {
    borderBottom: "1px solid #ccc",
    padding: "3px",
    textAlign: "left",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    borderBottom: "1px solid #eee",
    padding: "3px",
    verticalAlign: "top",
  };

  const inputStyle = {
    width: "100%",
    padding: "2px 3px",
    fontSize: "0.8rem",
    boxSizing: "border-box",
  };

  const renderCommonRow = (areaKey, label) => {
    const area = mergedData.handCommonAreas[areaKey];
    const computed = computeCommonAreaValues(area, mulchingRates);

    const displayHours =
      area.hoursOverride != null ? area.hoursOverride : computed.hours;
    const displayMulch =
      area.mulchOverride != null ? area.mulchOverride : computed.mulch;

    return (
      <tr key={areaKey}>
        <td style={tdStyle}>{label}</td>
        <td style={tdStyle}>
          <input
            type="number"
            value={area.sqft}
            onChange={(e) =>
              handleCommonFieldChange(areaKey, "sqft", e.target.value)
            }
            style={inputStyle}
          />
        </td>
        <td style={tdStyle}>
          <select
            value={area.efficiency}
            onChange={(e) =>
              handleCommonFieldChange(areaKey, "efficiency", e.target.value)
            }
            style={inputStyle}
          >
            <option value="Slowest">Slowest</option>
            <option value="Slow">Slow</option>
            <option value="Average">Average</option>
            <option value="Fast">Fast</option>
            <option value="Fastest">Fastest</option>
          </select>
        </td>
        <td style={tdStyle}>
          <select
            value={area.depth}
            onChange={(e) =>
              handleCommonFieldChange(areaKey, "depth", e.target.value)
            }
            style={inputStyle}
          >
            <option value="Feather">Feather</option>
            <option value={'1"'}>1"</option>
            <option value={'2"'}>2"</option>
          </select>
        </td>
        <td style={tdStyle}>
          <select
            value={area.proximity}
            onChange={(e) =>
              handleCommonFieldChange(areaKey, "proximity", e.target.value)
            }
            style={inputStyle}
          >
            <option value="Close">Close</option>
            <option value="Nearby">Nearby</option>
            <option value="Moderate">Moderate</option>
            <option value="Far">Far</option>
            <option value="Farthest">Farthest</option>
          </select>
        </td>
        <td style={tdStyle}>
          <input
            type="number"
            step="0.01"
            value={displayHours === 0 ? "" : displayHours.toFixed(2)}
            onChange={(e) =>
              handleCommonHoursOverrideChange(areaKey, e.target.value)
            }
            placeholder={computed.hours ? computed.hours.toFixed(2) : ""}
            style={inputStyle}
          />
          <div style={{ fontSize: "0.7rem", color: "#666" }}>hrs</div>
        </td>
        <td style={tdStyle}>
          <input
            type="number"
            step="0.5"
            value={displayMulch === 0 ? "" : displayMulch.toFixed(1)}
            onChange={(e) =>
              handleCommonMulchOverrideChange(areaKey, e.target.value)
            }
            placeholder={
              computed.mulch ? computed.mulch.toFixed(1) : ""
            }
            style={inputStyle}
          />
          <div style={{ fontSize: "0.7rem", color: "#666" }}>yards</div>
        </td>
      </tr>
    );
  };

  const renderHomeRow = (homeKey, label) => {
    const home = mergedData.handHomes[homeKey];
    const computed = computeHomeValues(home, mulchingRates);

    const displayHours =
      home.hoursOverride != null ? home.hoursOverride : computed.hours;
    const displayMulch =
      home.mulchOverride != null ? home.mulchOverride : computed.mulch;

    return (
      <tr key={homeKey}>
        <td style={tdStyle}>{label}</td>
        <td style={tdStyle}>
          <input
            type="number"
            value={home.sqftEach}
            onChange={(e) =>
              handleHomeFieldChange(homeKey, "sqftEach", e.target.value)
            }
            style={inputStyle}
          />
          <div style={{ fontSize: "0.7rem", color: "#666" }}>
            sq ft / home
          </div>
        </td>
        <td style={tdStyle}>
          <input
            type="number"
            value={home.count}
            onChange={(e) =>
              handleHomeFieldChange(homeKey, "count", e.target.value)
            }
            style={inputStyle}
          />
          <div style={{ fontSize: "0.7rem", color: "#666" }}>
            # homes
          </div>
        </td>
        <td style={tdStyle}>
          <select
            value={home.efficiency}
            onChange={(e) =>
              handleHomeFieldChange(homeKey, "efficiency", e.target.value)
            }
            style={inputStyle}
          >
            <option value="Slowest">Slowest</option>
            <option value="Slow">Slow</option>
            <option value="Average">Average</option>
            <option value="Fast">Fast</option>
            <option value="Fastest">Fastest</option>
          </select>
        </td>
        <td style={tdStyle}>
          <select
            value={home.depth}
            onChange={(e) =>
              handleHomeFieldChange(homeKey, "depth", e.target.value)
            }
            style={inputStyle}
          >
            <option value="Feather">Feather</option>
            <option value={'1"'}>1"</option>
            <option value={'2"'}>2"</option>
          </select>
        </td>
        <td style={tdStyle}>
          <select
            value={home.proximity}
            onChange={(e) =>
              handleHomeFieldChange(homeKey, "proximity", e.target.value)
            }
            style={inputStyle}
          >
            <option value="Close">Close</option>
            <option value="Nearby">Nearby</option>
            <option value="Moderate">Moderate</option>
            <option value="Far">Far</option>
            <option value="Farthest">Farthest</option>
          </select>
        </td>
        <td style={tdStyle}>
          <input
            type="number"
            step="0.01"
            value={displayHours === 0 ? "" : displayHours.toFixed(2)}
            onChange={(e) =>
              handleHomeHoursOverrideChange(homeKey, e.target.value)
            }
            placeholder={computed.hours ? computed.hours.toFixed(2) : ""}
            style={inputStyle}
          />
          <div style={{ fontSize: "0.7rem", color: "#666" }}>hrs</div>
        </td>
        <td style={tdStyle}>
          <input
            type="number"
            step="0.5"
            value={displayMulch === 0 ? "" : displayMulch.toFixed(1)}
            onChange={(e) =>
              handleHomeMulchOverrideChange(homeKey, e.target.value)
            }
            placeholder={
              computed.mulch ? computed.mulch.toFixed(1) : ""
            }
            style={inputStyle}
          />
          <div style={{ fontSize: "0.7rem", color: "#666" }}>yards</div>
        </td>
      </tr>
    );
  };

  const renderSmPwrRow = ({
    label,
    selection,
    onSelectionChange,
    displayHours,
    computedHours,
  }) => (
    <tr>
      <td style={tdStyle}>{label}</td>
      <td style={tdStyle} colSpan={4}>
        <select
          value={selection}
          onChange={(e) => onSelectionChange(e.target.value)}
          style={inputStyle}
        >
          <option value="Minimum">Minimum</option>
          <option value="Less">Less</option>
          <option value="Average">Average</option>
          <option value="More">More</option>
          <option value="Copious">Copious</option>
        </select>
      </td>
      <td style={tdStyle}>
        <input
          type="number"
          step="0.01"
          value={displayHours === 0 ? "" : displayHours.toFixed(2)}
          onChange={(e) => computedHours.overrideHandler(e.target.value)}
          placeholder={computedHours.base ? computedHours.base.toFixed(2) : ""}
          style={inputStyle}
        />
        <div style={{ fontSize: "0.7rem", color: "#666" }}>hrs</div>
      </td>
    </tr>
  );

  // Instead of using renderSmPwrRow generic (it gets a bit messy with override),
  // we will render explicit SmPwr/Loader rows for clarity.

  // -------- RENDER --------

  return (
    <div
      style={{
        marginTop: "0.5rem",
        padding: "0.75rem",
        border: "1px solid #ccc",
        borderRadius: "6px",
        background: "#fdfdfd",
        maxWidth: "900px",
      }}
    >
      {/* COMMON AREAS */}
      <h3 style={{ margin: 0, fontSize: "1rem" }}>Hand – Common Areas</h3>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Area</th>
            <th style={thStyle}>Sq Ft</th>
            <th style={thStyle}>Eff</th>
            <th style={thStyle}>Depth</th>
            <th style={thStyle}>Prox</th>
            <th style={thStyle}>Hours</th>
            <th style={thStyle}>Mulch</th>
          </tr>
        </thead>
        <tbody>
          {renderCommonRow("area1", "Area #1")}
          {renderCommonRow("area2", "Area #2")}
          {renderCommonRow("area3", "Area #3")}
          {/* Sm Pwr (Common) */}
          <tr>
            <td style={tdStyle}>Sm Pwr (Common)</td>
            <td style={tdStyle} colSpan={4}>
              <select
                value={smPwrCommonSelection}
                onChange={(e) =>
                  handleSmPwrCommonSelectionChange(e.target.value)
                }
                style={inputStyle}
              >
                <option value="Minimum">Minimum</option>
                <option value="Less">Less</option>
                <option value="Average">Average</option>
                <option value="More">More</option>
                <option value="Copious">Copious</option>
              </select>
            </td>
            <td style={tdStyle}>
              <input
                type="number"
                step="0.01"
                value={
                  smPwrCommonDisplay === 0
                    ? ""
                    : smPwrCommonDisplay.toFixed(2)
                }
                onChange={(e) =>
                  handleSmPwrCommonOverrideChange(e.target.value)
                }
                placeholder={
                  computedSmPwrCommonHours
                    ? computedSmPwrCommonHours.toFixed(2)
                    : ""
                }
                style={inputStyle}
              />
              <div style={{ fontSize: "0.7rem", color: "#666" }}>hrs</div>
            </td>
            <td style={tdStyle}></td>
          </tr>
          {/* Loader (Common) */}
          <tr>
            <td style={tdStyle}>Loader (Common)</td>
            <td style={tdStyle} colSpan={4}>
              <select
                value={loaderCommonSelection}
                onChange={(e) =>
                  handleLoaderCommonSelectionChange(e.target.value)
                }
                style={inputStyle}
              >
                <option value="Minimum">Minimum</option>
                <option value="Less">Less</option>
                <option value="Average">Average</option>
                <option value="More">More</option>
                <option value="Copious">Copious</option>
              </select>
            </td>
            <td style={tdStyle}>
              <input
                type="number"
                step="0.01"
                value={
                  loaderCommonDisplay === 0
                    ? ""
                    : loaderCommonDisplay.toFixed(2)
                }
                onChange={(e) =>
                  handleLoaderCommonOverrideChange(e.target.value)
                }
                placeholder={
                  computedLoaderCommonHours
                    ? computedLoaderCommonHours.toFixed(2)
                    : ""
                }
                style={inputStyle}
              />
              <div style={{ fontSize: "0.7rem", color: "#666" }}>hrs</div>
            </td>
            <td style={tdStyle}></td>
          </tr>
        </tbody>
      </table>

      {/* HOMES */}
      <h3
        style={{
          margin: "0.75rem 0 0 0",
          fontSize: "1rem",
        }}
      >
        Hand – Homes
      </h3>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Home</th>
            <th style={thStyle}>Sq Ft / Home</th>
            <th style={thStyle}># Homes</th>
            <th style={thStyle}>Eff</th>
            <th style={thStyle}>Depth</th>
            <th style={thStyle}>Prox</th>
            <th style={thStyle}>Hours</th>
            <th style={thStyle}>Mulch</th>
          </tr>
        </thead>
        <tbody>
          {renderHomeRow("home1", "Home Size #1")}
          {renderHomeRow("home2", "Home Size #2")}
          {renderHomeRow("home3", "Home Size #3")}

          {/* Sm Pwr (Homes) */}
          <tr>
            <td style={tdStyle}>Sm Pwr (Homes)</td>
            <td style={tdStyle} colSpan={5}>
              <select
                value={smPwrHomesSelection}
                onChange={(e) =>
                  handleSmPwrHomesSelectionChange(e.target.value)
                }
                style={inputStyle}
              >
                <option value="Minimum">Minimum</option>
                <option value="Less">Less</option>
                <option value="Average">Average</option>
                <option value="More">More</option>
                <option value="Copious">Copious</option>
              </select>
            </td>
            <td style={tdStyle}>
              <input
                type="number"
                step="0.01"
                value={
                  smPwrHomesDisplay === 0
                    ? ""
                    : smPwrHomesDisplay.toFixed(2)
                }
                onChange={(e) =>
                  handleSmPwrHomesOverrideChange(e.target.value)
                }
                placeholder={
                  computedSmPwrHomesHours
                    ? computedSmPwrHomesHours.toFixed(2)
                    : ""
                }
                style={inputStyle}
              />
              <div style={{ fontSize: "0.7rem", color: "#666" }}>hrs</div>
            </td>
            <td style={tdStyle}></td>
          </tr>

          {/* Loader (Homes) */}
          <tr>
            <td style={tdStyle}>Loader (Homes)</td>
            <td style={tdStyle} colSpan={5}>
              <select
                value={loaderHomesSelection}
                onChange={(e) =>
                  handleLoaderHomesSelectionChange(e.target.value)
                }
                style={inputStyle}
              >
                <option value="Minimum">Minimum</option>
                <option value="Less">Less</option>
                <option value="Average">Average</option>
                <option value="More">More</option>
                <option value="Copious">Copious</option>
              </select>
            </td>
            <td style={tdStyle}>
              <input
                type="number"
                step="0.01"
                value={
                  loaderHomesDisplay === 0
                    ? ""
                    : loaderHomesDisplay.toFixed(2)
                }
                onChange={(e) =>
                  handleLoaderHomesOverrideChange(e.target.value)
                }
                placeholder={
                  computedLoaderHomesHours
                    ? computedLoaderHomesHours.toFixed(2)
                    : ""
                }
                style={inputStyle}
              />
              <div style={{ fontSize: "0.7rem", color: "#666" }}>hrs</div>
            </td>
            <td style={tdStyle}></td>
          </tr>
        </tbody>
      </table>

      {/* LIVE PREVIEW */}
      <div
        style={{
          marginTop: "0.75rem",
          padding: "0.5rem",
          border: "1px solid #ddd",
          borderRadius: "4px",
          background: "#fff",
          fontSize: "0.85rem",
        }}
      >
        <strong>Mulch Preview</strong>
        <div style={{ marginTop: "0.25rem" }}>
          <div>
            Total Mulch Yards:{" "}
            <strong>{totalMulchYards.toFixed(1)}</strong>
          </div>
          <div>
            Total Labor Hours:{" "}
            <strong>{totalHours.toFixed(2)}</strong>
          </div>
          <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.25rem" }}>
            Areas: {totalAreaHours.toFixed(2)} hrs · Sm Pwr:{" "}
            {totalSmPwrHours.toFixed(2)} hrs · Loader:{" "}
            {totalLoaderHours.toFixed(2)} hrs
          </div>
        </div>
      </div>
    </div>
  );
}
