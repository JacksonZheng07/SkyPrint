# DISCREPANCIES.md — Contradictions Between Sources

Document contradictions found between different data sources and our existing code.
Each entry must be resolved before pipeline code uses the affected value.

Last updated: 2026-04-18

---

## Entry #1 — EI_H2O (Water Vapor Emission Index)

| Source | Value | Unit |
|---|---|---|
| Our `sac_fallback.py` | 1.23 | kg H₂O / kg fuel |
| pycontrails `JetA.ei_h2o` (v0.61.0) | 1.23 | kg H₂O / kg fuel |
| Schumann 2012, Table 1 | 1.25 | kg H₂O / kg fuel |
| Lee et al. 2010 | 1.231 | kg H₂O / kg fuel |

**Impact:** Affects SAC threshold temperature calculation. A value of 1.25 vs 1.23 shifts the threshold by ~0.1K, which matters near the boundary.

**Resolution:** ✅ Use **pycontrails' value (1.23)** for consistency when our code feeds into CoCiP. The CoCiP model was validated with this value. Defined in `constants.py` as `EI_H2O = 1.23`. Note the discrepancy with Schumann 2012 in any technical documentation.

---

## Entry #2 — Q_FUEL (Specific Energy of Jet-A)

| Source | Value | Unit |
|---|---|---|
| Our `sac_fallback.py` | 43.2 | MJ/kg |
| pycontrails `JetA.q_fuel` (v0.61.0) | **43.13** | MJ/kg |
| ICAO Annex 16 Vol IV | 43.0 | MJ/kg |
| CRC Aviation Fuel Properties | 42.8–43.2 | MJ/kg |

**Impact:** 0.16% difference between our code (43.2) and pycontrails (43.13). Affects SAC threshold and fuel burn calculations.

**Resolution:** ✅ Use **pycontrails' value (43.13 MJ/kg)** for CoCiP pipeline. Defined in `constants.py` as `Q_FUEL = 43.13e6`. Update `sac_fallback.py` to import from `constants.py` when integrating.

---

## Entry #3 — CO₂ per kg Fuel

| Source | Value | Unit |
|---|---|---|
| Our `co2_service.py` | 3.157 | kg CO₂ / kg fuel |
| pycontrails `JetA.ei_co2` (v0.61.0) | **3.159** | kg CO₂ / kg fuel |
| ICAO Carbon Calculator v13 | 3.157 | kg CO₂ / kg fuel |
| EPA (derived from Table 2) | ~3.149 | kg CO₂ / kg fuel |
| DEFRA 2024 (CO₂-only component) | ~3.15 | kg CO₂ / kg fuel |

**Impact:** 0.06% difference between our code (ICAO: 3.157) and pycontrails (Lee 2021: 3.159). Negligible for passenger communication but breaks consistency with CoCiP.

**Resolution:** ✅ Use **pycontrails' value (3.159)** for CoCiP pipeline to match the model's internal assumptions. Defined in `constants.py` as `EI_CO2 = 3.159`. For standalone CO₂ calculations outside CoCiP, either value is acceptable — document which is used.

---

## Entry #4 — pycontrails Version Pin

| Context | Value |
|---|---|
| `pyproject.toml` dependency | `>=0.54.0` |
| Current latest version | `0.61.0` (April 2026) |
| SOURCES.md documented against | `0.61.0` |

**Impact:** An installation could resolve to any version from 0.54.0 to 0.61.0+. v0.61.0 has breaking changes: removed `DEFAULT_LOAD_FACTOR`, new mass estimation, new `passenger_load_factor()` function.

**Resolution:** Pin to `>=0.61.0,<0.62.0` to ensure compatibility with all documentation and `constants.py`.

---

## Entry #5 — Humidity Scaling Parameter (rhi_adj)

| Source | Value |
|---|---|
| Our `cocip_service.py` | `ConstantHumidityScaling(rhi_adj=0.97)` |
| pycontrails CoCiP tutorial | `ConstantHumidityScaling(rhi_adj=0.99)` |
| Teoh et al. 2022 | Various values tested; 0.97-1.0 range discussed |

**Impact:** Lower rhi_adj → more ice supersaturation → more persistent contrails predicted. 0.97 vs 0.99 could change persistence predictions at marginal grid cells.

**Resolution:** The appropriate value depends on the met data source (ERA5 vs GFS) and the region being studied. Our value (0.97) may have been tuned for GFS data, while the tutorial uses ERA5 with 0.99. **For Tier 2 (ERA5), use 0.99 initially and document sensitivity.** Consider running CoCiP at both 0.97 and 0.99 to quantify the difference.

---

## Entry #6 — Barometric vs Geometric Altitude (OpenSky)

This is not a source contradiction but a **systematic data mismatch** that will affect every trajectory.

| Data Source | Altitude Type | Reference |
|---|---|---|
| OpenSky `/tracks` | Barometric (pressure altitude) | ICAO standard atmosphere |
| OpenSky `/states/all[7]` | Barometric | ICAO standard atmosphere |
| OpenSky `/states/all[13]` | Geometric (GPS) | WGS-84 |
| CoCiP `Flight.altitude` | Geometric (meters above MSL) | Required by pycontrails |

**Impact:** At FL350 (10,668m), the difference between pressure altitude and geometric altitude can be 50-300m depending on local conditions. This maps to ~2-10 hPa pressure difference at cruise, which affects whether a grid cell shows ice supersaturation.

**Resolution:** When using `/tracks` endpoint (which only provides baro_altitude):
1. Convert using ISA with known surface pressure if available, OR
2. Use the simpler approximation: geometric ≈ barometric at cruise (error < 1% typically), and **document this assumption explicitly in pipeline output**
3. Preferred: Use `/states/all` endpoint for current flights which provides both altitude types

This must be flagged in every pipeline output where OpenSky track data is the source.

---

## Entry #7 — Load Factor: Static 0.82 vs pycontrails Dynamic

| Source | Value |
|---|---|
| Our `co2_service.py` `DEFAULT_LOAD_FACTOR` | 0.82 |
| pycontrails `passenger_load_factor()` global | ~0.835 |
| pycontrails `passenger_load_factor(origin="KJFK")` | ~0.828 |
| IATA 2023 global average | 0.823 |

**Impact:** 1.5% difference between our static 0.82 and pycontrails regional 0.828. Small but systematic.

**Resolution:** ✅ Use **pycontrails' `passenger_load_factor()`** function for all CoCiP pipeline runs (accounts for region + season). Do NOT hardcode. Note: pycontrails v0.61.0 removed `DEFAULT_LOAD_FACTOR` global constant — this function is the replacement.

---

## Entry #8 — Pressure Levels: Existing Code vs Tier 2 Spec

| Context | Levels (hPa) |
|---|---|
| Our `cocip_service.py` | [150, 175, 200, 225, 250, 300, 350] |
| Tier 2 prompt spec / constants.py | [200, 225, 250, 275, 300] |

**Impact:** Existing code covers a wider range (150-350 hPa = FL340-FL470), while Tier 2 spec uses a narrower range (200-300 hPa = FL300-FL390). The existing code includes 150 and 175 hPa which are above most widebody cruise altitudes.

**Resolution:** For Tier 2 NAT corridor analysis, use [200, 225, 250, 275, 300] hPa as specified. The 275 hPa level is important for FL330 vicinity. 150/175 hPa levels are unnecessary for typical transatlantic cruise and add data download time. However, if any flights cruise above FL390, may need to add 175 hPa back.
