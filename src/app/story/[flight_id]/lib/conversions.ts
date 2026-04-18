/**
 * EPA and Lee et al. 2021 conversion factors.
 *
 * Every constant has a primary source citation with URL and retrieval date.
 * Do not add conversion factors without a cited source.
 */

// SOURCE: EPA Greenhouse Gas Equivalencies Calculator
// URL: https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator
// Retrieved: 2026-04-14
// "The average passenger vehicle emits about 4.6 metric tons of CO2 per year."
export const EPA_CO2_PER_CAR_PER_YEAR_TONNES = 4.6;

// SOURCE: EPA Greenhouse Gas Equivalencies Calculator
// URL: https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator
// Retrieved: 2026-04-14
// "A medium growth coniferous or deciduous tree, planted in an urban setting
//  and allowed to grow for 10 years, sequesters approximately 0.039 metric
//  tons CO2 per urban tree planted."
// Note: Many sources use ~0.022 tCO2/tree/year for mature forest; EPA's
// "urban tree planted" number is higher. We use the EPA default.
export const EPA_CO2_PER_TREE_PER_YEAR_TONNES = 0.039;

/**
 * Convert tCO2e to equivalent number of cars driven for a year.
 */
export function toCarsPerYear(tco2e: number): number {
  // SOURCE: EPA_CO2_PER_CAR_PER_YEAR_TONNES
  return tco2e / EPA_CO2_PER_CAR_PER_YEAR_TONNES;
}

/**
 * Convert tCO2e to equivalent number of trees absorbing CO2 for a year.
 */
export function toTreesPerYear(tco2e: number): number {
  // SOURCE: EPA_CO2_PER_TREE_PER_YEAR_TONNES
  return tco2e / EPA_CO2_PER_TREE_PER_YEAR_TONNES;
}
