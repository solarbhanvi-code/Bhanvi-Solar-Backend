import {
  calculateSolarEstimate,
  CalculatorAssumptions,
} from './calculator.util';

const assumptions: CalculatorAssumptions = {
  costPerKwh: 8,
  sunHours: 5,
  systemEfficiency: 0.8,
  costPerKw: 55000,
  annualDegradation: 0.005,
  sqftPerKw: 100,
};

describe('calculateSolarEstimate', () => {
  it('sizes a system from a monthly bill input', () => {
    const result = calculateSolarEstimate({ monthlyBill: 4000 }, assumptions);

    expect(result.monthlyConsumptionKwh).toBeCloseTo(500, 0);
    expect(result.recommendedSystemSizeKw).toBeGreaterThan(0);
    expect(result.estimatedAnnualGenerationKwh).toBeGreaterThan(0);
    expect(result.estimatedSystemCost).toBeGreaterThan(0);
  });

  it('sizes a system from a monthly consumption input directly', () => {
    const byBill = calculateSolarEstimate({ monthlyBill: 4000 }, assumptions);
    const byConsumption = calculateSolarEstimate(
      { monthlyConsumptionKwh: 500 },
      assumptions,
    );
    expect(byConsumption.recommendedSystemSizeKw).toBeCloseTo(
      byBill.recommendedSystemSizeKw,
      5,
    );
  });

  it('constrains system size to available roof area when provided', () => {
    const unconstrained = calculateSolarEstimate(
      { monthlyBill: 20000 },
      assumptions,
    );
    const constrained = calculateSolarEstimate(
      { monthlyBill: 20000, roofAreaSqft: 200 },
      assumptions,
    );

    expect(constrained.roofConstrained).toBe(true);
    expect(constrained.recommendedSystemSizeKw).toBeLessThan(
      unconstrained.recommendedSystemSizeKw,
    );
    expect(constrained.recommendedSystemSizeKw).toBeLessThanOrEqual(2);
  });

  it('never recommends a system smaller than 0.5 kW', () => {
    const result = calculateSolarEstimate({ monthlyBill: 10 }, assumptions);
    expect(result.recommendedSystemSizeKw).toBeGreaterThanOrEqual(0.5);
  });

  it('does not report savings larger than the annual electricity consumption value', () => {
    const result = calculateSolarEstimate(
      { monthlyBill: 4000, roofAreaSqft: 5000 },
      assumptions,
    );
    const annualConsumptionCost =
      (4000 / assumptions.costPerKwh) * 12 * assumptions.costPerKwh;
    expect(result.estimatedAnnualSavings).toBeLessThanOrEqual(
      Math.round(annualConsumptionCost) + 1,
    );
  });

  it('computes a positive payback period within the modeled horizon', () => {
    const result = calculateSolarEstimate({ monthlyBill: 4000 }, assumptions);
    expect(result.paybackYears).not.toBeNull();
    expect(result.paybackYears as number).toBeGreaterThan(0);
    expect(result.paybackYears as number).toBeLessThanOrEqual(30);
  });

  it('returns zeroed-out results gracefully for a zero-consumption input', () => {
    const result = calculateSolarEstimate(
      { monthlyConsumptionKwh: 0 },
      assumptions,
    );
    expect(result.recommendedSystemSizeKw).toBeGreaterThanOrEqual(0.5);
    expect(Number.isFinite(result.estimatedSystemCost)).toBe(true);
  });
});
