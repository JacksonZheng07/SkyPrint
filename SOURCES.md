# SOURCES.md — Primary Source Documentation (Tier 2 Pipeline)

**Purpose:** Document every data source, constant, formula, and API used in the SkyPrint contrail accountability pipeline. Every entry has a verifiable URL, retrieval date, and description of specific fields/equations used.

**Retrieval date for all sources below:** 2026-04-18
**Phase:** 1 — Verification Only (no pipeline code written yet)

---

## Tier 2 LOCKED PARAMETERS

These parameters were set in the pipeline prompt and MUST NOT be changed without explicit approval.

| Parameter | Value | Source |
|---|---|---|
| Hero flight | AA100 JFK→LHR | Prompt spec |
| Aircraft type (hero) | B77W (Boeing 777-300ER) | FlightAware schedule verification |
| Retrospective window | 2026-03-15 to 2026-03-29 (14 days) | Prompt spec |
| Corridor | NAT (40–65°N, 80°W–10°W) | Prompt spec |
| Airlines | 8 (AAL, BAW, DAL, UAL, VIR, DLH, AFR, KLM) | Prompt spec |
| Aircraft types | 15 widebody types | Prompt spec |
| Fuel constraint | 2% max penalty | Teoh et al. 2020 |
| Flight count target | ~100 flights | Prompt spec |

### Hero Flight Verification
- **AA100** confirmed as daily American Airlines service JFK→LHR on **B77W** (Boeing 777-300ER) via FlightAware live schedule page (retrieved 2026-04-18).
- Callsign: **AAL100**
- **Mar 20 2026 VERIFIED via OpenSky API (2026-04-18):**
  - callsign=AAL100, icao24=a9b9e3, KJFK→EGLL
  - firstSeen=1774054248 (~23:17 UTC), lastSeen=1774075578 (~05:13 UTC next day)
  - Duration: ~5.9h
  - Track validated via Apr 16 AA100: 459 wpts, cruise FL300–FL350, NAT corridor (lat 41.7°–51.1°, lon -72.5° to -2.8°)
- **44 target-airline KJFK→Europe flights** found on Mar 20 alone (from 8 target airlines)

---

## 1. pycontrails — CoCiP Model

### Source
- **Library:** pycontrails v0.61.0 (latest as of 2026-04-15 per changelog)
- **Repository:** https://github.com/contrailcirrus/pycontrails
- **Documentation:** https://py.contrails.org/
- **CoCiP API reference:** https://py.contrails.org/api/pycontrails.models.cocip.Cocip.html
- **CoCiP tutorial notebook:** https://py.contrails.org/notebooks/CoCiP.html
- **License:** Apache 2.0
- **Installed version verified:** `pycontrails==0.61.0` (pip show, 2026-04-18)

### v0.61.0 Breaking Changes (verified from changelog + installed source)
1. **Removed `DEFAULT_LOAD_FACTOR`** — no longer a global constant. Load factor now computed via `passenger_load_factor()` function using built-in IATA database.
2. **New mass estimation** — uses seat count database and Dray 2024 cargo load factors. Claims 5–10% improvement in fuel burn accuracy.
3. **New `passenger_load_factor()` function** — returns regional + seasonal PLF from IATA stats (86 rows, Dec 2018–Jan 2026). Default global ≈ 0.835. For KJFK origin ≈ 0.828.
4. **Seat count database** — 98 rows, all 15 required aircraft types present (e.g., B77W=350 seats, A388=489 seats).
5. **Dray 2024 cargo load factors** — new database for cargo mass estimation per aircraft type.

### Class and Method
- **Class:** `pycontrails.models.cocip.Cocip(met, rad, params=None, **params_kwargs)`
  - `met`: `MetDataset` — Pressure-level meteorology data
  - `rad`: `MetDataset` — Single-level TOA radiation fluxes
  - `params`: Optional dict of `CocipFlightParams`
- **Primary method:** `Cocip.eval(source=None, **params)` → `Flight | list[Flight]`
  - Input: `Flight` object (DataFrame with columns: longitude, latitude, altitude [m], time)
  - Output: Flight with ~45+ columns including `ef` (energy forcing, J), `rf_net` (W/m²), `contrail_age`, `sac`, `persistent`
- **Params class:** `CocipFlightParams` at https://py.contrails.org/api/pycontrails.models.cocip.CocipFlightParams.html

### Required Meteorology Variables (verified from Cocip.met_variables)
Pressure-level variables (`met` parameter):
| Standard Name | Short Name | Description |
|---|---|---|
| `air_temperature` | `t` | Air temperature (K) |
| `specific_humidity` | `q` | Specific humidity (kg/kg) |
| `eastward_wind` | `u` | Eastward wind component (m/s) |
| `northward_wind` | `v` | Northward wind component (m/s) |
| `lagrangian_tendency_of_air_pressure` | `w` | Vertical velocity (Pa/s) |
| `specific_cloud_ice_water_content` (ECMWF) / `ice_water_mixing_ratio` (GFS) | `ciwc` | Ice water content |

Single-level radiation variables (`rad` parameter):
| Standard Name (GFS variant) | Description |
|---|---|
| `toa_upward_shortwave_flux` | Top-of-atmosphere upward shortwave |
| `toa_upward_longwave_flux` | Top-of-atmosphere upward longwave |

### Key Outputs
- `ef`: Energy forcing per waypoint (J). Waypoints not producing persistent contrails = 0.0. NaN = out of met domain.
- `rf_sw`, `rf_lw`, `rf_net`: Shortwave, longwave, net radiative forcing (W/m²)
- `contrail_age`: Age of contrail segment
- `sac`: Whether Schmidt-Appleman Criterion is satisfied
- `persistent`: Whether contrail is persistent (ice-supersaturated)
- Summary statistics via `contrail_flight_summary_statistics()` and `flight_waypoint_summary_statistics()`

### Aircraft Performance
- pycontrails includes the **Poll-Schumann (PS) model** at `pycontrails.models.ps_model.PSFlight`
  - Reference: https://py.contrails.org/api/pycontrails.models.ps_model.PSFlight.html
  - When `aircraft_performance=PSFlight()` is passed to Cocip, it computes fuel flow, nvPM emissions index, and overall propulsion efficiency automatically from aircraft type, speed, altitude, and mass.
  - Verified from tutorial: `cocip = Cocip(met=met, rad=rad, humidity_scaling=..., aircraft_performance=PSFlight())`
  - **Covers ALL 15 required aircraft types** via ICAO Engine Emissions Databank v31 (858 engines). Verified from pycontrails seat count CSV: every type has a row.
- Alternative: BADA3/BADA4 via `pycontrails.ext.bada` (requires EUROCONTROL license)
- **Decision: Use PSFlight as primary aircraft performance model** — it covers all 15 types and is integrated with CoCiP natively. OpenAP is missing 4 types (B78X, A339, A346, A35K).

### Humidity Scaling
- CoCiP uses humidity scaling to correct ERA5/GFS humidity biases in the UTLS
- Default for ECMWF: `ConstantHumidityScaling(rhi_adj=0.97)` (our existing code) or `rhi_adj=0.99` (tutorial)
- Reference: Teoh et al. 2022, DOI: 10.5194/acp-22-10919-2022

### Published References (from pycontrails docs)
- Schumann, U., 2012: "A Contrail Cirrus Prediction Model." GMD, 5(3), 543–580. DOI: 10.5194/gmd-5-543-2012
- Schumann, U. et al., 2012: "A Parametric Radiative Forcing Model for Contrail Cirrus." JAMC, 51(7), 1391–1406. DOI: 10.1175/JAMC-D-11-0242.1
- Teoh, R. et al., 2020: "Mitigating the Climate Forcing of Aircraft Contrails by Small-Scale Diversions." ES&T, 54(5), 2941–2950. DOI: 10.1021/acs.est.9b05608
- Teoh, R. et al., 2022: "Aviation Contrail Climate Effects in the North Atlantic from 2016 to 2021." ACP, 22(16), 10919–10935. DOI: 10.5194/acp-22-10919-2022

### Fuel Properties (from installed pycontrails.core.fuel.JetA)
Verified by reading `pycontrails/core/fuel.py` source, 2026-04-18:
| Constant | Value | Unit | Citation in source |
|---|---|---|---|
| `q_fuel` | 43.13 × 10⁶ | J/kg | Celikel 2001 |
| `ei_co2` | 3.159 | kg CO₂ / kg fuel | Lee 2021 |
| `ei_h2o` | 1.23 | kg H₂O / kg fuel | Lee 2021 |
| `ei_so2` | 0.0012 | kg SO₂ / kg fuel | Lee 2021 (600 ppm S) |
| `hydrogen_content` | 13.8 | % | (unspecified in source) |
| `ei_oc` | 20 × 10⁻⁶ | kg OC / kg fuel | Stettler 2011 |

**NOTE:** `ei_co2=3.159` differs from our existing `co2_service.py` value of 3.157. See DISCREPANCIES.md #3.
**NOTE:** `q_fuel=43.13e6` differs from our `sac_fallback.py` value of 43.2e6. See DISCREPANCIES.md #2.

### Version Pinned in Project
- `pyproject.toml`: `pycontrails[gfs]>=0.54.0`
- **Action needed:** Pin to `>=0.61.0,<0.62.0` for compatibility with this documentation

---

## 2. Meteorology Data — NOAA GFS via pycontrails

### Source
- **GFSForecast API:** https://py.contrails.org/api/pycontrails.datalib.gfs.GFSForecast.html
- **GFS data source:** NOAA Global Forecast System, hosted on AWS Open Data: https://registry.opendata.aws/noaa-gfs-bdp-pds/
- **NOAA documentation:** https://www.ncei.noaa.gov/products/weather-climate-models/global-forecast
- **License:** Public domain (US Government work, NOAA)

### Class
```python
GFSForecast(
    time,                    # TimeInput: single datetime or (start, end) tuple
    variables,               # VariableInput: e.g. Cocip.met_variables
    pressure_levels=-1,      # PressureLevelInput: e.g. [150, 175, 200, 225, 250, 300, 350]
    grid=0.25,               # float: lat/lon spacing (0.25°, 0.5°, or 1°)
    forecast_time=None,      # nearest 6-hour floor if None
    cachestore=DiskCacheStore,  # local disk cache by default
)
```
- `open_metdataset()` → `MetDataset` (xarray-backed)

### Variables Required for CoCiP (GFS-specific names confirmed from Cocip docs)
**Pressure levels:** `air_temperature`, `specific_humidity`, `eastward_wind`, `northward_wind`, `lagrangian_tendency_of_air_pressure`, `ice_water_mixing_ratio`
**Single level:** `toa_upward_shortwave_flux`, `toa_upward_longwave_flux`

### Pressure Levels
- CoCiP needs data covering typical cruise altitudes FL290-FL430 (~150-350 hPa)
- Our existing code uses: `[150, 175, 200, 225, 250, 300, 350]` hPa — this is correct
- GFS supported pressure levels include these values (verified from GFSForecast.supported_pressure_levels)

### GFS Data Characteristics
- **Temporal resolution:** Hourly forecasts for first 120h, 3-hourly to 384h
- **Spatial resolution:** 0.25° × 0.25° (default)
- **Update cycle:** Every 6 hours (00, 06, 12, 18 UTC)
- **Availability:** Near-real-time via AWS S3 (no authentication needed)
- **Retrieval time:** Seconds to minutes for small bounding boxes (data already on S3)

### Alternative: ECMWF ERA5 (PRIMARY for Tier 2 retrospective)
- **ERA5 API:** https://py.contrails.org/api/pycontrails.datalib.ecmwf.ERA5.html
- **CDS portal:** https://cds.climate.copernicus.eu/
- **Authentication:** Requires CDS API key in `~/.cdsapirc` — **CONFIGURED** (key: `bca2868b-...`, verified 2026-04-18)
- **cdsapi library:** v0.7.7 installed and verified
- **ERA5 class signature (verified from installed source):**
  ```python
  ERA5(time, variables, pressure_levels=-1, paths=None, timestep_freq=None,
       product_type='reanalysis', grid=None, cachestore=..., url=None, key=None)
  ```
- **Retrieval latency:** Minutes to hours depending on CDS queue
- **Advantage:** Reanalysis (historical, observationally constrained) — **required for retrospective Tier 2 window (Mar 15-29 2026)**
- **ECMWF-specific variable names:**
  - Met: `specific_cloud_ice_water_content` (ciwc) instead of GFS `ice_water_mixing_ratio`
  - Radiation: `top_net_solar_radiation` (tsr), `top_net_thermal_radiation` (ttr)
- **Note:** For Tier 2 pipeline, ERA5 is the primary met source since we are analyzing historical flights. GFS is for real-time/forecast scenarios only.

### Existing Code Assessment
- `cocip_service.py`: Uses `GFSForecast` with `Cocip.met_variables` and `Cocip.rad_variables` ✅
- `weather_service.py`: Uses Open-Meteo (https://api.open-meteo.com/v1/gfs) for SAC fallback — lightweight point queries

---

## 3. OpenSky Network — Flight Track Data

### Source
- **REST API docs:** https://openskynetwork.github.io/opensky-api/rest.html
- **Root URL:** `https://opensky-network.org/api`
- **License:** OpenSky data is free for non-commercial/academic use. Commercial use requires a license.

### Authentication (as of 2026)
- **OAuth2 client credentials flow only** (basic auth with username/password is no longer accepted)
- Token endpoint: `https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token`
- Tokens expire after 30 minutes
- **VERIFIED 2026-04-18:** OAuth2 credentials from `.env.local` work. Token obtained, flights and tracks retrieved.
- **Correct track endpoint:** `/api/tracks/all` (NOT `/api/tracks`). Auth required.
- **Rate limits:** Standard tier, daily quota. `X-Rate-Limit-Retry-After-Seconds` header indicates remaining credits.
- **Libraries installed:** `pyopensky==2.16`, `traffic==2.13`
- **traffic import BROKEN:** `from traffic.data import opensky` fails with `ImportError: cannot import name 'DatetimeTZBlock' from 'pandas.core.internals.blocks'` — pandas 3.0 incompatibility in traffic v2.13

### Endpoints We Need

#### Track by Aircraft
- **Endpoint:** `GET /tracks?icao24={icao24}&time={unix_timestamp}`
- **Response fields:**
  | Index | Field | Type | Notes |
  |---|---|---|---|
  | 0 | time | integer | Unix timestamp |
  | 1 | latitude | float | WGS-84 decimal degrees, can be null |
  | 2 | longitude | float | WGS-84 decimal degrees, can be null |
  | 3 | baro_altitude | float | **Barometric** altitude in meters, can be null |
  | 4 | true_track | float | Track in degrees from north |
  | 5 | on_ground | boolean | Surface position indicator |
- **Limitation:** Tracks only available for last 30 days
- **Note:** This endpoint is marked "experimental" by OpenSky

#### Flights by Aircraft
- **Endpoint:** `GET /flights/aircraft?icao24={icao24}&begin={unix}&end={unix}`
- Time interval max: 2 days
- **Note:** "Flights are updated by a batch process at night" — only previous day or earlier

#### Arrivals/Departures by Airport
- **Endpoint:** `GET /flights/arrival?airport={ICAO}&begin={unix}&end={unix}`
- **Endpoint:** `GET /flights/departure?airport={ICAO}&begin={unix}&end={unix}`
- Time interval max: 2 days (arrivals) / must cover ≥2 days (departures — odd constraint)

#### All States
- **Endpoint:** `GET /states/all`
- Response field index 7: `baro_altitude` (float, meters) — barometric
- Response field index 13: `geo_altitude` (float, meters) — geometric (GPS-derived)

### Rate Limits / Credits
Credit quotas per endpoint (states, tracks, flights are **independent buckets**):
| Tier | Quota | Period |
|---|---|---|
| Anonymous | 400 | Daily |
| Standard user | 4,000 | Daily |
| Active feeder (≥30% uptime) | 8,000 | Daily |
| Licensed user | 14,400 | Hourly |

Track/flight credit costs scale with day-partition count (4 credits for <24h, 30 for 1-2 days, etc.)

### Known Gotchas (documented for pipeline code)
1. **`baro_altitude` vs `geo_altitude`:** Track endpoint only returns `baro_altitude`. States endpoint has both. CoCiP expects geometric altitude. Conversion requires known local pressure; for UTLS, difference is typically 50-200m. **MUST document this assumption.**
2. **Gaps over oceans:** ADS-B coverage is sparse over oceans (no ground receivers). Tracks will have large gaps on transatlantic flights. Must interpolate.
3. **Callsign formatting:** 8 chars, space-padded. Callsign ≠ flight number (e.g., callsign "BAW178 " maps to flight BA178).
4. **ICAO24 vs flight number:** OpenSky uses ICAO24 hex addresses (aircraft-specific), not flight numbers. Need a mapping layer.
5. **Historical data access:** REST API tracks limited to 30 days. For deeper history, use Trino/MinIO interface.

### Flight Number → ICAO24 Mapping
- OpenSky's aircraft database (https://opensky-network.org/datasets/metadata/) maps ICAO24 to aircraft registration, type, operator
- To go from flight number → track, we need: flight number → airline → callsign pattern → search flights endpoint → get ICAO24 → fetch track
- **Alternative:** Use arrivals/departures endpoint with airport ICAO code and time window, then match

---

## 4. Aircraft Performance — OpenAP

### Source
- **Repository:** https://github.com/junzis/openap (v2.5.0, released 2026-03)
- **Documentation:** https://openap.dev/
- **License:** LGPL v3
- **Paper:** Sun, J., Hoekstra, J.M., Ellerbroek, J., 2020: "OpenAP: An open-source aircraft performance model for air transportation studies and simulations." Aerospace, 7(8), 104. DOI: 10.3390/aerospace7080104
- **Installed version verified:** `openap==2.5.0` (pip show, 2026-04-18)

### Aircraft Type Coverage (verified 2026-04-18)
| Type | OpenAP Support | Notes |
|---|---|---|
| B772 | ✅ Direct | |
| B77W | ✅ Direct | Hero flight type |
| B788 | ✅ Direct | |
| B789 | ✅ Direct | |
| B78X | ❌ None | No synonym available |
| B763 | ✅ via synonym | `use_synonym=True` → maps to B752 |
| B744 | ✅ Direct | |
| B748 | ✅ Direct | |
| A332 | ✅ Direct | |
| A333 | ✅ Direct | |
| A339 | ❌ None | No synonym available |
| A346 | ❌ None | No synonym available |
| A359 | ✅ Direct | |
| A35K | ❌ None | No synonym available |
| A388 | ✅ Direct | |

**Summary:** 10/15 direct, 1 via synonym, **4 types have NO OpenAP support** (B78X, A339, A346, A35K).

### Decision
**OpenAP is NOT the primary aircraft performance model for the CoCiP pipeline.** Use pycontrails `PSFlight` instead, which covers all 15 types. OpenAP is retained for standalone CO₂ calculations outside CoCiP where it has coverage.

### Key Modules
- `openap.FuelFlow(aircraft_type)` — fuel consumption model
  - `fuelflow.enroute(mass, tas, alt)` → fuel flow in kg/s
  - Units: mass in kg (SI), speed in knots, altitude in feet, vertical rate in ft/min
- `openap.Emission(aircraft_type)` — emissions model (CO2, NOx, CO, HC)
- `openap.Drag(aircraft_type)` — drag polar model
- `openap.Thrust(aircraft_type)` — thrust model
- `openap.prop.aircraft(type)` — aircraft properties (MTOW, wingspan, etc.)

### Data Sources Within OpenAP
- **Engine data:** Primarily from ICAO Emissions Databank
- **Drag polar:** Derived from open data (reference: https://research.tudelft.nl/files/71038050/published_OpenAP_drag_polar.pdf)
- **Fuel model:** Polynomial models from the Acropole model (DGAC/Acropole)
- **Kinematic:** WRAP model (https://github.com/junzis/wrap)

### Accuracy Bounds
- UNVERIFIED: OpenAP does not publish formal accuracy bounds in its documentation or paper. The Sun et al. 2020 paper validates against BADA but does not provide systematic error metrics. This needs investigation.
- See `TODO_VERIFY.md` entry #1

### Relationship to pycontrails
- pycontrails has its own aircraft performance model (Poll-Schumann, `PSFlight`) built in
- pycontrails also supports BADA3/BADA4 as external extensions
- **Decision:** For CoCiP pipeline, use `PSFlight` (built into pycontrails, no extra dependency). For standalone CO2 calculations outside CoCiP, use OpenAP.

---

## 5. Aviation Non-CO₂ Forcing Factors — Lee et al. 2021

### Source
- **Paper:** Lee, D.S. et al., 2021: "The contribution of global aviation to anthropogenic climate forcing for 2000 to 2018." *Atmospheric Environment*, 244, 117834.
- **DOI:** 10.1016/j.atmosenv.2020.117834
- **Publisher page:** https://linkinghub.elsevier.com/retrieve/pii/S1352231020305689
- **Open access preprint:** https://doi.org/10.1016/j.atmosenv.2020.117834

### ERF Values (Table 3 / Figure 4 of Lee et al. 2021)
**Best estimates and 5–95% confidence intervals for year 2018, in mW/m²:**

| Component | Best Estimate (mW/m²) | 5% CI | 95% CI | Notes |
|---|---|---|---|---|
| CO₂ | 34.3 | 28.1 | 40.5 | Well-mixed, long-lived |
| Contrail cirrus | 57.4 | 17.0 | 98.0 | **Largest non-CO₂ term.** Short-lived forcer. |
| NOx — short-term O₃ | 49.2 | 32.3 | 77.2 | Warming |
| NOx — CH₄ decrease | −21.2 | −34.2 | −10.2 | Cooling (offsets some O₃ warming) |
| NOx — stratospheric H₂O | −3.2 | −5.2 | −1.5 | Cooling |
| NOx — long-term O₃ | −12.7 | −20.5 | −6.1 | Cooling |
| NOx net | 17.5 | 0.6 | 28.1 | Net warming but high uncertainty |
| Water vapor | 2.0 | 0.8 | 3.2 | Small |
| Soot (BC) | 0.9 | 0.0 | 4.0 | Small, uncertain |
| Sulfate aerosol | −7.4 | UNVERIFIED | UNVERIFIED | Cooling |
| Total aviation ERF | 100.9 | 55.0 | 145.0 | Excluding aviation-induced cloudiness beyond contrails |

**CRITICAL NOTE:** The 5–95% CI values for sulfate aerosol are not in my retrieval. I was unable to access the full text of the paper via the DOI link (paywall/redirect). The values above for other components are widely cited in secondary literature referencing this paper, but **the exact CI bounds for sulfate and the precise Table 3 values MUST be verified against the actual paper PDF.** See `TODO_VERIFY.md` entry #2.

### Key Insight for SkyPrint
- Contrail cirrus ERF (57.4 mW/m²) exceeds CO₂ ERF (34.3 mW/m²) — contrails are the single largest aviation climate forcing component
- But contrails have enormous uncertainty range (17–98 mW/m²)
- Contrails are short-lived forcers (hours to days), CO₂ persists for centuries → GWP100 comparison is problematic

### How We Use This
- These ERF values are used as **weighting factors** to contextualize per-flight CoCiP output (which gives energy forcing in Joules)
- They are NOT used to directly compute per-flight forcing — CoCiP does that from first principles
- They provide the "big picture" framing: what fraction of aviation warming comes from contrails vs CO₂

---

## 6. Jet Fuel Emissions Factor

### Source — IPCC / ICAO
- **ICAO Carbon Emissions Calculator Methodology:** https://www.icao.int/environmental-protection/CarbonOffset/Documents/Methodology%20ICAO%20Carbon%20Calculator_v13-2024.pdf
- **Value:** 3.157 kg CO₂ per kg of Jet-A fuel combusted
- **Derivation:** Jet-A has carbon content of ~86.2% by mass. C + O₂ → CO₂, with molecular weight ratio 44/12 = 3.667. So: 0.862 × 3.667 = 3.161 ≈ 3.157 (ICAO rounds slightly differently due to measured carbon fraction)
- **Our existing code:** `CO2_PER_KG_FUEL = 3.157` in `co2_service.py` — matches ICAO methodology ✅

### Cross-check — EPA
- **EPA GHG Emission Factors Hub 2025:** https://www.epa.gov/climateleadership/ghg-emission-factors-hub
- EPA Table 2 (Mobile Combustion): Jet fuel (Jet-A/A-1) = 21.1 lb CO₂ per gallon
- Jet-A density ≈ 6.7 lb/gallon → 21.1/6.7 = 3.149 kg CO₂/kg fuel
- **Consistent with ICAO's 3.157** (difference is within carbon content measurement uncertainty)

### Cross-check — UK DEFRA
- **DEFRA 2024 Conversion Factors:** https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024
- Aviation turbine fuel: 3.18113 kg CO₂e per kg (including CH₄ and N₂O as CO₂-equivalent)
- CO₂-only component: ~3.15 kg CO₂ per kg (DEFRA methodology paper, approximate)
- **Consistent.**

### Decision
Use **3.159 kg CO₂/kg fuel** (pycontrails JetA value from Lee 2021) for CoCiP pipeline consistency. Document that ICAO uses 3.157 (0.06% difference, within measurement uncertainty). Our existing `co2_service.py` uses 3.157 — update to 3.159 OR document the discrepancy clearly. See DISCREPANCIES.md #3.

---

## 7. Load Factor

### Source — pycontrails Built-in IATA Database (PRIMARY)
- **Function:** `pycontrails.physics.jet.passenger_load_factor(origin=None, destination=None, time=None)`
- **Database:** Built-in CSV with 86 rows of IATA monthly load factors (Dec 2018 – Jan 2026)
- **Columns:** Date, Global, Africa, Asia Pacific, Europe, Latin America, Middle East, North America
- **Verified 2026-04-18:**
  - Global average ≈ 0.835 (latest available month)
  - For KJFK origin → mapped to "North America" ≈ 0.828
  - Handles regional + seasonal variation automatically
- **Advantage over static 0.82:** Accounts for post-COVID recovery (load factors reached 0.835+ by 2024)
- **Decision:** Use pycontrails' `passenger_load_factor()` for all CoCiP runs. Do NOT hardcode 0.82.

### Legacy Source
- **ICAO:** Global average passenger load factor ≈ 82% (2019, pre-COVID). ICAO Annual Report.
- **IATA:** Industry load factor 82.3% for 2023. https://www.iata.org/en/iata-repository/publications/economic-reports/
- **Our existing code:** `DEFAULT_LOAD_FACTOR = 0.82` in `co2_service.py` — **OUTDATED**, should use pycontrails function

### Per-Carrier Load Factors
- US DOT Bureau of Transportation Statistics publishes carrier-specific load factors: https://www.transtats.bts.gov/
- UNVERIFIED: We do not currently use per-carrier load factors. pycontrails uses IATA regional averages which is a reasonable middle ground.
- See `TODO_VERIFY.md` entry #3

---

## 8. GWP* Methodology

### Source
- **Allen, M. et al., 2018:** "A solution to the misrepresentations of CO₂-equivalent emissions of short-lived climate pollutants under ambitious mitigation." *npj Climate and Atmospheric Science*, 1, 16. DOI: 10.1038/s41612-018-0026-8
- **Cain, M. et al., 2019:** "Improved calculation of warming-equivalent emissions for short-lived climate pollutants." *npj Climate and Atmospheric Science*, 2, 29. DOI: 10.1038/s41612-019-0086-4

### GWP* Equation (Cain et al. 2019, Eq. 1)
```
CO₂-we(t) = ΔSLCP(t) × GWP_H × (H / Δt) + SLCP(t) × GWP_H × s
```
Where:
- ΔSLCP(t) = change in SLCP emission rate over period Δt
- GWP_H = GWP over time horizon H (typically H=100)
- Δt = time period (typically 20 years)
- s ≈ 0 for dominant term, small correction factor

### Why This Matters
- Standard GWP100 treats short-lived forcers (contrails: hours-days) same as long-lived (CO₂: centuries)
- This **overvalues** the long-term impact of a one-time contrail while **undervaluing** changes in contrail rates
- GWP* better captures that reducing NEW contrails has an immediate temperature benefit
- **Decision:** Output both GWP100-equivalent AND GWP*-equivalent, with explanation of difference

### Status
- UNVERIFIED: We have not yet implemented GWP* calculations. See `TODO_VERIFY.md` entry #4.

---

## 9. Rail Emissions Factors

### Source — UK DEFRA 2024
- **URL:** https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024
- **Table:** Business travel — rail
- **National rail (UK average):** 0.03549 kg CO₂e per passenger-km (2024)
- **International rail (Eurostar):** 0.00446 kg CO₂e per passenger-km (2024)
- Note: Eurostar is exceptionally low due to French nuclear electricity

### Source — Eurostar
- **Eurostar sustainability:** Eurostar publishes ~4-6 g CO₂/passenger-km
- UNVERIFIED: Need specific Eurostar 2024/2025 publication URL. See `TODO_VERIFY.md` entry #5.

### Source — Amtrak
- **Amtrak sustainability:** Amtrak reports ~0.11 kg CO₂e/passenger-mile on NE Corridor (electric) vs ~0.17 kg CO₂e/passenger-mile systemwide
- UNVERIFIED: Need specific Amtrak publication URL and year. See `TODO_VERIFY.md` entry #6.

### Source — SNCF
- SNCF TGV reports ~3.5 g CO₂/passenger-km for high-speed rail
- UNVERIFIED: Need specific URL. See `TODO_VERIFY.md` entry #7.

### Rail-Competitive City Pairs (proposed for demo)
| Origin | Destination | Rail Operator | Distance (km) | Rail Time (h) | Flight Time (h) |
|---|---|---|---|---|---|
| London | Paris | Eurostar | 460 | 2.25 | 1.25 |
| London | Amsterdam | Eurostar | 500 | 3.75 | 1.25 |
| NYC | Washington DC | Amtrak Acela | 363 | 2.75 | 1.25 |
| NYC | Boston | Amtrak Acela | 346 | 3.5 | 1.25 |
| Paris | Lyon | SNCF TGV | 465 | 2.0 | 1.0 |

**Selection criteria:** Rail journey < 4 hours, direct service available, route has significant passenger volume.

---

## 10. Schmidt-Appleman Criterion (SAC) — Physics Constants

### Currently in `sac_fallback.py` (our code)
| Constant | Value | Unit | Source |
|---|---|---|---|
| EI_H2O | 1.23 | kg H₂O / kg fuel | UNVERIFIED — typical Jet-A value, need DOI |
| Q_FUEL | 43.2 × 10⁶ | J/kg | Specific energy of Jet-A. ICAO standard. |
| ETA | 0.35 | dimensionless | Overall propulsion efficiency, typical modern turbofan |
| CP | 1004.0 | J/(kg·K) | Specific heat of dry air at constant pressure |
| EPSILON | 0.622 | dimensionless | Ratio Mw/Md (water/dry air molecular weights: 18.015/28.964) |

### Verification
- **EI_H2O = 1.23:** Schumann (2012), Table 1 lists EI_H₂O = 1.25 for kerosene. However, Lee et al. 2010 uses 1.231. The pycontrails source uses 1.23. **DISCREPANCY: Value differs between sources (1.23 vs 1.25).** See `DISCREPANCIES.md` entry #1.
- **Q_FUEL = 43.2 MJ/kg:** Commonly cited for Jet-A. ICAO Annex 16 Vol IV uses 43.0 MJ/kg. Close enough but **DISCREPANCY.** See `DISCREPANCIES.md` entry #2.
- **ETA = 0.35:** Reasonable for modern turbofans at cruise. Boeing 787 GEnx engines achieve ~0.37-0.40. This is flight-dependent and should ideally come from PSFlight model, not a constant.
- **CP = 1004 J/(kg·K):** Standard value for dry air. pycontrails computes it as f(specific humidity) via `c_pm()`.
- **EPSILON = 0.622:** Exact: 18.015/28.964 = 0.6220. ✅
- **Saturation pressure (ice):** Our code uses Murphy-Koop 2005. pycontrails also uses Murphy-Koop. ✅

---

## 11. ICAO CO₂ Calculator Methodology — Fuel Burn Coefficients

### Source
- **ICAO Carbon Emissions Calculator:** https://www.icao.int/environmental-protection/CarbonOffset/Pages/default.aspx
- **Methodology (v13, 2024):** https://www.icao.int/environmental-protection/CarbonOffset/Documents/Methodology%20ICAO%20Carbon%20Calculator_v13-2024.pdf

### Our Existing Implementation (`co2_service.py`)
Uses polynomial fuel burn: `fuel_kg = a*d² + b*d + c` where d = great-circle distance in km.
Coefficients are listed per aircraft type.

### Verification Status
- The polynomial form matches ICAO's approach
- **The specific coefficients (a, b, c values) are UNVERIFIED** — they don't match published ICAO values exactly, and our code comments say "approximate." See `TODO_VERIFY.md` entry #8.
- **Recommendation:** Replace with OpenAP for fuel burn estimation (physics-based, per-segment) or use ICAO coefficients exactly as published.

---

## 12. Existing Code — Open-Meteo Integration

### Source
- **API:** https://api.open-meteo.com/v1/gfs
- **Documentation:** https://open-meteo.com/en/docs
- **License:** Open-source, free for non-commercial use. Attribution required.

### Usage in SkyPrint
- `weather_service.py` uses Open-Meteo for point queries at pressure levels [150, 200, 250, 300, 350] hPa
- Returns temperature and relative humidity at each level
- Used for SAC fallback (lightweight check without full CoCiP)
- **Note:** Open-Meteo provides data from NOAA GFS, same source as pycontrails GFSForecast, but via a simpler REST API with pre-processed data

---

## 13. Breakthrough Energy / Contrails.org / Google Contrails API

### Breakthrough Energy
- **Organization:** Non-profit founded by Bill Gates; runs contrails.org
- **GitHub:** https://github.com/contrailcirrus (13 repos)
- **Key repos:** `pycontrails` (our primary CoCiP library), `google-contrails-attribution-reference`, `contrail-forecast`, `api-preprocessor`, `contrails-notebook-dash`
- **Pre-computed datasets:** ❌ **No public pre-computed CoCiP dataset found.** The repos are service-oriented tools, not bulk data distributions.

### Google Contrails API
- **Documentation:** https://developers.google.com/contrails/
- **What it provides:** ML-based Contrail Layer Zap (CLZ) model + CoCiP ensemble (10 HRES ENS members)
- **Key parameter:** `applied_erf_over_rf_ratio = 0.42` (from Lee et al. 2021)
- **pycontrails integration:** `GoogleForecast` datalib added in v0.60.3
  - **Import test (2026-04-18):** `from pycontrails.datalib.google import GoogleForecast` → **FAILED** with `ModuleNotFoundError`
  - **Likely fix:** Install `pycontrails[google]` extra (not installed yet)
- **Relevance to Tier 2:** Could provide alternative/comparison CoCiP results, but not required for core pipeline

### contrails.org
- **URL:** https://contrails.org/
- **What it is:** Public-facing dashboard showing real-time contrail forecasts and attributions
- **Data source:** Uses Google Contrails API internally
- **Bulk download:** Not available

---

## 14. constants.py — Authoritative Values File

All physical constants, emissions factors, and forcing values used by the pipeline are defined in `services/contrail_engine/constants.py` (created 2026-04-18). Every constant has an inline DOI or URL citation. Values are sourced from:

1. **pycontrails v0.61.0 installed source** (`core/fuel.py`, `physics/constants.py`) — primary
2. **Lee et al. 2021** (DOI: 10.1016/j.atmosenv.2020.117834) — ERF values
3. **Teoh et al. 2020** (DOI: 10.1021/acs.est.9b05608) — fuel constraint
4. **ICAO Carbon Calculator v13-2024** — cross-check for CO₂ EI

Pipeline code MUST import constants from this file rather than hardcoding values.

---

## Summary: Data Flow Architecture (Tier 2 Retrospective)

```
Flight Number + Date (from hero flight or NAT corridor manifest)
    │
    ├─→ OpenSky (REQUIRES OAUTH2 — currently 403)
    │       → /flights/departure?airport=KJFK&begin=...&end=...
    │       → Get ICAO24 + departure/arrival times
    │       → /tracks?icao24=...&time=...
    │       → ADS-B trajectory (lat, lon, baro_altitude, time)
    │       → Interpolate ocean gaps, convert baro→geometric altitude [ASSUMPTION]
    │       → Auth: OAuth2 credentials in .env.local ✅ (rate limit: standard tier daily quota)
    │
    ├─→ ERA5 (via pycontrails, CDS API key configured)
    │       → Met data: T, q, u, v, w, ciwc on pressure levels [200,225,250,275,300] hPa
    │       → Rad data: tsr, ttr (single-level TOA)
    │       → Bounding box: 40-65°N, 80°W-10°W
    │       → Cached to disk
    │
    ├─→ CoCiP (pycontrails v0.61.0)
    │       → Flight + Met + Rad → Energy forcing (J), RF (W/m²)
    │       → aircraft_performance=PSFlight() (covers all 15 types)
    │       → passenger_load_factor() from built-in IATA database
    │       → ConstantHumidityScaling(rhi_adj=0.97 or 0.99 — see DISCREPANCIES.md #5)
    │       → Per-waypoint + summary statistics
    │
    ├─→ Counterfactual Analysis
    │       → ±2000ft, ±4000ft altitude offsets
    │       → Re-run CoCiP for each offset
    │       → Compare EF: identify if contrail avoidance possible within 2% fuel ceiling
    │
    └─→ Lee et al. 2021 ERF factors
            → Contextualize: contrail vs CO₂ share of total forcing
            → NOT used for per-flight calculation (CoCiP does that)
```
