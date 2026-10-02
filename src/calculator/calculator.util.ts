export interface CalculatorAssumptions {
  costPerKwh: number;
  sunHours: number;
  systemEfficiency: number;
  costPerKw: number;
  annualDegradation: number;
  sqftPerKw: number;
}

export interface CalculatorInput {
  monthlyBill?: number;
  monthlyConsumptionKwh?: number;
  roofAreaSqft?: number;
}

export interface CalculatorEstimate {
  monthlyConsumptionKwh: number;
  recommendedSystemSizeKw: number;
  roofConstrained: boolean;
  estimatedAnnualGenerationKwh: number;
  estimatedAnnualSavings: number;
  estimatedSystemCost: number;
  paybackYears: number | null;
  co2OffsetKgPerYear: number;
}

const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;
/** kg of CO2 avoided per kWh of solar generation, a commonly cited grid-average figure. */
const CO2_KG_PER_KWH = 0.82;
const MAX_PAYBACK_HORIZON_YEARS = 30;

function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Pure, side-effect-free solar sizing/savings estimator. Kept separate from
 * the Nest service so assumptions (tariff, irradiation, etc.) can be swapped
 * per-region later without touching calculation logic, and so it is trivial
 * to unit test.
 */
export function calculateSolarEstimate(
  input: CalculatorInput,
  assumptions: CalculatorAssumptions,
): CalculatorEstimate {
  const {
    costPerKwh,
    sunHours,
    systemEfficiency,
    costPerKw,
    annualDegradation,
    sqftPerKw,
  } = assumptions;

  const monthlyConsumptionKwh =
    input.monthlyConsumptionKwh && input.monthlyConsumptionKwh > 0
      ? input.monthlyConsumptionKwh
      : (input.monthlyBill ?? 0) / costPerKwh;

  const dailyConsumptionKwh = monthlyConsumptionKwh / DAYS_PER_MONTH;
  const requiredSystemSizeKw =
    dailyConsumptionKwh / (sunHours * systemEfficiency);

  const roofLimitedSizeKw =
    input.roofAreaSqft && input.roofAreaSqft > 0
      ? input.roofAreaSqft / sqftPerKw
      : Infinity;

  const rawSizeKw = Math.min(requiredSystemSizeKw, roofLimitedSizeKw);
  // Round to the nearest 0.5 kW, with a sensible minimum for a usable residential system.
  const recommendedSystemSizeKw = Math.max(0.5, round(rawSizeKw * 2) / 2);
  const roofConstrained = roofLimitedSizeKw < requiredSystemSizeKw;

  const estimatedAnnualGenerationKwh = round(
    recommendedSystemSizeKw * sunHours * systemEfficiency * DAYS_PER_YEAR,
  );

  const annualConsumptionKwh = monthlyConsumptionKwh * 12;
  const effectiveOffsetKwh = Math.min(
    estimatedAnnualGenerationKwh,
    annualConsumptionKwh > 0
      ? annualConsumptionKwh
      : estimatedAnnualGenerationKwh,
  );
  const estimatedAnnualSavings = round(effectiveOffsetKwh * costPerKwh);
  const estimatedSystemCost = round(recommendedSystemSizeKw * costPerKw);

  let paybackYears: number | null = null;
  if (estimatedAnnualSavings > 0) {
    let cumulativeSavings = 0;
    let yearSavings = estimatedAnnualSavings;
    for (let year = 1; year <= MAX_PAYBACK_HORIZON_YEARS; year += 1) {
      cumulativeSavings += yearSavings;
      if (cumulativeSavings >= estimatedSystemCost) {
        const overshoot = cumulativeSavings - estimatedSystemCost;
        paybackYears = round(year - overshoot / yearSavings, 1);
        break;
      }
      yearSavings *= 1 - annualDegradation;
    }
  }

  const co2OffsetKgPerYear = round(
    estimatedAnnualGenerationKwh * CO2_KG_PER_KWH,
  );

  return {
    monthlyConsumptionKwh: round(monthlyConsumptionKwh),
    recommendedSystemSizeKw,
    roofConstrained,
    estimatedAnnualGenerationKwh,
    estimatedAnnualSavings,
    estimatedSystemCost,
    paybackYears,
    co2OffsetKgPerYear,
  };
}
