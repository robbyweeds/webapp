import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LabeledInput from './LabeledInput'; // Assuming this component is available
import { useServiceContext } from '../context/ServiceContext'; // Assuming context is available

// --- INITIAL EFFICIENCY DATA (From your Excel Image) ---
const INITIAL_MOWING_FACTORS = {
  // 1. Acres/Hr Efficiency
  acresPerHour: {
    '72': { OBSTACLES: 0.65, HOA_HOMES: 0.85, AVERAGE: 0.95, OPEN_LAWN: 1.3, FIELDS: 1.45, MONTHLY: 0.6, DOUBLE_CUT: 0.7 },
    '60': { OBSTACLES: 0.6, HOA_HOMES: 0.75, AVERAGE: 0.85, OPEN_LAWN: 1.0, FIELDS: 1.25, MONTHLY: 0.55, DOUBLE_CUT: 0.7 },
    '48': { OBSTACLES: 0.4, HOA_HOMES: 0.6, AVERAGE: 0.65, OPEN_LAWN: 0.75, FIELDS: 0.9, MONTHLY: 0.35, DOUBLE_CUT: 0.45 },
  },
  // 2. Small Power Efficiency (Mow hrs per 1 SmPwr hr)
  smPwrEfficiency: {
    'TRIMMER': { MINIMUM: 0.75, LESS: 0.85, AVERAGE: 0.95, HOA_HOMES: 1.05, HIGH_END_DETAILING: 1.35 },
    'BLOWER': { MINIMUM: 0.2, LESS: 0.3, AVERAGE: 0.35, HOA_HOMES: 0.45, HIGH_END_DETAILING: 0.55 },
  },
  // 3. Small Power Allocation (Equipment Percentage)
  smPwrAllocation: {
    'TRIMMER': { '72': 0.1, '60': 0.2, '48': 0.75 },
    'BLOWER': { '72': 0.1, '60': 0.2, '48': 0.75 },
  }
};

// --- INITIAL DOLLAR RATES DATA (From previous thread context) ---
const INITIAL_DOLLAR_RATES = {
  MISC_HRS: 61.00,
  "72-area1": 51.00,
  "72-area2": 61.00,
  "60-area1": 61.00,
  "60-area2": 59.00,
  "48-area1": 56.00,
  "48-area2": 56.00,
  TRIMMER: 55.00,
  BLOWER: 55.00,
  ROTARY: 55.00,
  "5111": 100.00,
};

// Map the Dollar Rate keys to friendly display names
const DOLLAR_RATE_DISPLAY_MAP = {
  MISC_HRS: "Misc Hours",
  "72-area1": '72" Wide Open Rate',
  "72-area2": '72" Average Rate',
  "60-area1": '60" Area 1 Rate',
  "60-area2": '60" Area 2 Rate',
  "48-area1": '48" Area 1 Rate',
  "48-area2": '48" Area 2 Rate',
  TRIMMER: "Trimmer Rate",
  BLOWER: "Blower Rate",
  ROTARY: "Rotary Rate",
  "5111": "5111 Rate",
};

export default function MowingRatesPage() {
  const navigate = useNavigate();
  // FIX: Safely default currentRates to an empty object {} to avoid the runtime error
  const { currentRates = {}, updateRates } = useServiceContext(); 

  // Use state to manage the rates locally before saving to context
  const [rates, setRates] = useState(() => ({
    // Accessing properties is now safe
    factors: currentRates.mowingFactors || INITIAL_MOWING_FACTORS,
    dollars: currentRates.mowingDollars || INITIAL_DOLLAR_RATES,
  }));

  // Handlers for Efficiency Factors (Nested updates)
  const handleFactorChange = useCallback((groupKey, rowKey, colKey) => (e) => {
    const val = parseFloat(e.target.value);
    const numericValue = isNaN(val) ? 0 : val;

    setRates(prevRates => ({
      ...prevRates,
      factors: {
        ...prevRates.factors,
        [groupKey]: {
          ...prevRates.factors[groupKey],
          [rowKey]: {
            ...prevRates.factors[groupKey][rowKey],
            [colKey]: numericValue,
          },
        },
      },
    }));
  }, []);

  // Handler for Dollar Rates (Flat object update)
  const handleDollarRateChange = useCallback((key) => (e) => {
    const val = parseFloat(e.target.value);
    const numericValue = isNaN(val) ? 0 : val;

    setRates(prevRates => ({
      ...prevRates,
      dollars: {
        ...prevRates.dollars,
        [key]: numericValue,
      },
    }));
  }, []);

  // Save everything to context
  const handleSaveRates = () => {
    updateRates('mowingFactors', rates.factors);
    updateRates('mowingDollars', rates.dollars);
    alert('Mowing Rates and Efficiency Factors saved successfully!');
  };


  // --- RENDERING HELPERS ---

  // Renders the Acres/Hr table
  const renderAcresPerHour = useMemo(() => {
    const data = rates.factors.acresPerHour;
    const headerCols = Object.keys(data['72']);

    return (
      <>
        <h3>1. Equipment Mowing Efficiency (Acres/Hr)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }} border="1">
          <thead>
            <tr style={{ backgroundColor: '#343a40', color: 'white' }}>
              <th>Rate</th>
              {headerCols.map(col => <th key={col}>{col.replace('_', ' ')}</th>)}
            </tr>
          </thead>
          <tbody>
            {Object.keys(data).map(rowKey => (
              <tr key={rowKey}>
                <td style={{ fontWeight: 'bold' }}>{rowKey}"</td>
                {headerCols.map(colKey => (
                  <td key={`${rowKey}-${colKey}`}>
                    <LabeledInput
                      value={data[rowKey][colKey]}
                      onChange={handleFactorChange('acresPerHour', rowKey, colKey)}
                      step={0.01}
                      min={0}
                      label=""
                      type="number"
                      isSmall={true}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }, [rates.factors.acresPerHour, handleFactorChange]);


  // Renders the Small Power Efficiency table
  const renderSmPwrEfficiency = useMemo(() => {
    const data = rates.factors.smPwrEfficiency;
    const headerCols = Object.keys(data['TRIMMER']);

    return (
      <>
        <h3>2. Small Power Efficiency (Mow hrs per 1 Trimmer/Blower hr)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }} border="1">
          <thead>
            <tr style={{ backgroundColor: '#343a40', color: 'white' }}>
              <th>Rate</th>
              {headerCols.map(col => <th key={col}>{col.replace('_', ' ')}</th>)}
            </tr>
          </thead>
          <tbody>
            {Object.keys(data).map(rowKey => (
              <tr key={rowKey}>
                <td style={{ fontWeight: 'bold' }}>{rowKey}</td>
                {headerCols.map(colKey => (
                  <td key={`${rowKey}-${colKey}`}>
                    <LabeledInput
                      value={data[rowKey][colKey]}
                      onChange={handleFactorChange('smPwrEfficiency', rowKey, colKey)}
                      step={0.01}
                      min={0}
                      label=""
                      type="number"
                      isSmall={true}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }, [rates.factors.smPwrEfficiency, handleFactorChange]);


  // Renders the Small Power Allocation table
  const renderSmPwrAllocation = useMemo(() => {
    const data = rates.factors.smPwrAllocation;
    const headerCols = Object.keys(data['TRIMMER']);

    return (
      <>
        <h3>3. Small Power Allocation (Equipment Percentage)</h3>
        <table style={{ width: '100%', maxWidth: '500px', borderCollapse: 'collapse', textAlign: 'center' }} border="1">
          <thead>
            <tr style={{ backgroundColor: '#343a40', color: 'white' }}>
              <th>Rate</th>
              {headerCols.map(col => <th key={col}>{col}"</th>)}
            </tr>
          </thead>
          <tbody>
            {Object.keys(data).map(rowKey => (
              <tr key={rowKey}>
                <td style={{ fontWeight: 'bold' }}>{rowKey} (%)</td>
                {headerCols.map(colKey => (
                  <td key={`${rowKey}-${colKey}`}>
                    <LabeledInput
                      value={data[rowKey][colKey] * 100} // Display as percentage
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) / 100;
                        const numericValue = isNaN(val) ? 0 : val;
                        handleFactorChange('smPwrAllocation', rowKey, colKey)({ target: { value: numericValue } });
                      }}
                      step={1}
                      min={0}
                      label="%"
                      type="number"
                      isSmall={true}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }, [rates.factors.smPwrAllocation, handleFactorChange]);


  // Renders the Dollar Rates table
  const renderDollarRates = useMemo(() => {
    return (
      <>
        <h3>4. Dollar Rates ($ / Unit)</h3>
        <table style={{ width: '100%', maxWidth: '600px', borderCollapse: 'collapse' }} border="1">
          <thead>
            <tr style={{ backgroundColor: '#343a40', color: 'white' }}>
              <th>Service Area/Equipment</th>
              <th style={{ width: '30%' }}>Rate ($)</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(rates.dollars).map(key => (
              <tr key={key}>
                <td>{DOLLAR_RATE_DISPLAY_MAP[key]}</td>
                <td>
                  <LabeledInput
                    value={rates.dollars[key]}
                    onChange={handleDollarRateChange(key)}
                    step={0.01}
                    min={0}
                    label="$"
                    type="number"
                    isSmall={true}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }, [rates.dollars, handleDollarRateChange]);


  return (
    <div style={{ padding: "2rem" }}>
      <h2>⚙️ Edit Mowing Rates and Efficiency Factors</h2>
      <p>Adjusting these values will affect the calculations for all Mowing tables.</p>
      
      <div style={{ marginBottom: "3rem" }}>
        {renderAcresPerHour}
      </div>

      <div style={{ marginBottom: "3rem" }}>
        {renderSmPwrEfficiency}
      </div>

      <div style={{ marginBottom: "3rem" }}>
        {renderSmPwrAllocation}
      </div>

      <hr style={{ margin: '3rem 0' }} />

      <div style={{ marginBottom: "3rem" }}>
        {renderDollarRates}
      </div>

      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={handleSaveRates}
          style={{
            marginRight: "1rem",
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: 'bold',
          }}
        >
          💾 Save All Rates
        </button>
        <button onClick={() => navigate(-1)} style={{ padding: "10px 20px", cursor: "pointer" }}>
          ⬅️ Back to Services
        </button>
      </div>
    </div>
  );
}