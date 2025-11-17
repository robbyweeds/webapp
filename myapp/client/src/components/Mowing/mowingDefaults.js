// =====================================
// mowingDefaults.js
// Central shared definitions
// =====================================

// Efficiency dropdowns
export const EFFICIENCY_OPTIONS = [
  "OBSTACLES",
  "HOA_HOMES",
  "AVERAGE",
  "OPEN_LAWN",
  "FIELDS",
  "MONTHLY",
  "DOUBLE_CUT",
];

export const SMPWR_EFFICIENCY_OPTIONS = [
  "MINIMUM",
  "LESS",
  "AVERAGE",
  "HOA_HOMES",
  "HIGH_END_DETAILING",
];

// Decks
export const DECK_KEYS = [
  "72-area1",
  "72-area2",
  "60-area1",
  "60-area2",
  "48-area1",
  "48-area2",
];

// Small power keys
export const SMPWR_KEYS = ["TRIMMER", "BLOWER"];
export const ROTARY_KEY = "ROTARY";

// Order used for dollar calculations
export const DISPLAY_KEYS = [
  "MISC_HRS",
  ...DECK_KEYS,
  ...SMPWR_KEYS,
  ROTARY_KEY,
  "5111",
];

// Master default for a Mowing Table
export const INITIAL_MOWING_DATA = {
  name: "Mowing Area",

  selectedEfficiency: {
    "72-area1": "AVERAGE",
    "72-area2": "AVERAGE",
    "60-area1": "AVERAGE",
    "60-area2": "AVERAGE",
    "48-area1": "AVERAGE",
    "48-area2": "AVERAGE",
    TRIMMER: "AVERAGE",
    BLOWER: "AVERAGE",
  },

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
    MISC_HRS: 0,
    "72-area1": 0,
    "72-area2": 0,
    "60-area1": 0,
    "60-area2": 0,
    "48-area1": 0,
    "48-area2": 0,
    TRIMMER: 0,
    BLOWER: 0,
    ROTARY: 0,
    "5111": 0,
  },

  manualOverrides: {
    "72-area1": null,
    "72-area2": null,
    "60-area1": null,
    "60-area2": null,
    "48-area1": null,
    "48-area2": null,
  },

  summary: {
    adjPercent: 0,
    numOccurrences: 1,
  },

  totals: {},
};
