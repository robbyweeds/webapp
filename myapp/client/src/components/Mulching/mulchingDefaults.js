// src/components/Mulching/mulchingDefaults.js

export const INITIAL_MULCHING_DATA = {
  name: "",
  summary: {
    numOccurrences: 1,
  },

  // Hand – Common Areas
  handCommonAreas: {
    area1: {
      sqft: "",
      efficiency: "Average",
      depth: '2"',
      proximity: "Close",
      hoursOverride: null,
      mulchOverride: null,
    },
    area2: {
      sqft: "",
      efficiency: "Average",
      depth: '2"',
      proximity: "Close",
      hoursOverride: null,
      mulchOverride: null,
    },
    area3: {
      sqft: "",
      efficiency: "Average",
      depth: '2"',
      proximity: "Close",
      hoursOverride: null,
      mulchOverride: null,
    },
  },

  // Hand – Homes
  handHomes: {
    home1: {
      sqftEach: "",
      count: "",
      efficiency: "Average",
      depth: '2"',
      proximity: "Close",
      hoursOverride: null,
      mulchOverride: null,
    },
    home2: {
      sqftEach: "",
      count: "",
      efficiency: "Average",
      depth: '2"',
      proximity: "Close",
      hoursOverride: null,
      mulchOverride: null,
    },
    home3: {
      sqftEach: "",
      count: "",
      efficiency: "Average",
      depth: '2"',
      proximity: "Close",
      hoursOverride: null,
      mulchOverride: null,
    },
  },

  // Sm Pwr + Loader
  smPwr: {
    selection: "Average",
    hoursOverride: null,
  },

  loader: {
    selection: "Average",
    hoursOverride: null,
  },
};

export const DEFAULT_MULCHING_RATES = {
  handEfficiency: {
    Slowest: 0.9,
    Slow: 1.1,
    Average: 1.4,
    Fast: 1.6,
    Fastest: 1.8,
  },

  treeRingYards: {
    Small3: 3,
    Avg4: 4,
    Large5: 5,
    Extra6: 6,
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

  proximity: {
    Close: 1.0,
    Nearby: 1.1,
    Moderate: 1.2,
    Far: 1.3,
    Farthest: 1.4,
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
};
