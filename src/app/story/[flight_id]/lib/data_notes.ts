/**
 * DATA NOTES — Documents every STUB value in the demo JSON.
 *
 * The file /public/data/BAW117_2026-04-10.json is entirely synthetic.
 * Below, each number is annotated with its derivation so reviewers
 * can audit the demo before real pipeline data replaces it.
 *
 * When the pipeline runs for real, this file becomes a cross-reference
 * for which values change and which stay constant.
 */

export const DATA_NOTES = {
  // --- Metadata ---
  flight_id:
    "BAW117_2026-04-10 — synthetic. Real ID format: {ICAO}_{YYYY-MM-DD}",
  departure_utc:
    "2026-04-10T23:00:00Z — based on BA117 historical schedule (evening departure JFK)",
  duration_seconds:
    "25200 (7h 0m) — typical JFK-LHR block time for B777-300ER",
  aircraft_type:
    "B777-300ER — representative; BA operates both B777-200ER and -300ER on this route",

  // --- Track ---
  track_actual_points:
    "36 points — simplified from ~500 typical ADS-B points. Realistic great-circle with NAT offset.",
  cruise_altitude:
    "FL370 (37,000 ft) — standard NAT cruise level",
  in_issr_segments:
    "Points near lon -60 to -15 marked in_issr=true, mimicking two ISSR bands",

  // --- Totals: Actual ---
  co2_fuel_kg:
    "189.4 tCO2e — derived from ~60 tonnes fuel burn × 3.16 kgCO2/kgJetA (ICAO standard emission factor)",
  contrail_forcing_tco2e:
    "212.8 tCO2e — STUB. Calibrated to represent night flight through two ISSR regions. " +
    "CoCiP output will replace this. CI: 127.6–298.0 reflects typical CoCiP 95% uncertainty band (~±40%)",
  non_co2_other_tco2e:
    "32.6 tCO2e — NOx + H2O + soot non-CO2 except contrails. " +
    "Estimated at ~17% of CO2 per Lee et al. 2021 multiplier for non-contrail non-CO2.",
  total_warming_tco2e:
    "434.8 tCO2e — sum of above three. CI: 259.4–610.2 propagated from component uncertainties.",

  // --- Totals: Counterfactual ---
  counterfactual_co2:
    "195.1 tCO2e — +3% fuel penalty at FL330 for same route",
  counterfactual_contrail:
    "27.3 tCO2e — ~87% reduction by avoiding ISSR at FL370",
  counterfactual_total:
    "247.2 tCO2e — proof that altitude change is net beneficial despite fuel penalty",
  avoidable_warming:
    "187.6 tCO2e — actual minus counterfactual total. This is the key metric.",

  // --- Counterfactual Spec ---
  selected_offset:
    "-4000 ft for ISSR segments, 0 elsewhere — standard CoCiP optimization result " +
    "for a 2000ft grid search under max_fuel_increase_pct=5%",
  fuel_penalty_pct:
    "3.01% — within the 5% constraint. B777-300ER SFC increase at FL330 vs FL370.",

  // --- Airline Context ---
  leaderboard:
    "5 carriers, all synthetic values. Delta best (95.2), American worst (178.3). " +
    "BA ranked 3rd at 138.4 tCO2e/flight avoidable. " +
    "CI intervals are ±25-35% to simulate real uncertainty.",
  flights_analyzed:
    "47 — above the n≥30 threshold so Scene 5 Branch A renders",

  // --- ISSR GeoJSON ---
  issr_polygons:
    "Two rectangular regions in Mid-Atlantic. West: lon -67 to -35, East: lon -29 to -15. " +
    "Both at FL370. Shape is simplified from what ERA5 ISSR field would produce.",
} as const;
