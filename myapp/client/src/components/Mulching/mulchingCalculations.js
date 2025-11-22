// myapp/client/src/components/Mulching/mulchingCalculations.jsx

import { INITIAL_MULCHING_DATA } from "./mulchingDefaults";

// Merge raw entry data with our initial shape
export function mergeMulchingData(raw) {
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
export function computeCommonAreaValues(area, mulchingRates) {
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
  const mulch = rawYards > 0 ? Math.ceil(rawYards / 0.5) * 0.5 : 0;

  // Hours: yards / yards-per-man-hour * proximity multiplier
  const hours = eff > 0 ? (mulch / eff) * prox : 0;

  return { hours, mulch };
}

// Compute hours + mulch for a "Home" row (sqftEach * count)
export function computeHomeValues(home, mulchingRates) {
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
  const mulch = rawYards > 0 ? Math.ceil(rawYards / 0.5) * 0.5 : 0;

  const hours = eff > 0 ? (mulch / eff) * prox : 0;

  return { hours, mulch, totalSqft };
}
