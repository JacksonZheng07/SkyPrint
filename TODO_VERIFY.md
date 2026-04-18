# TODO_VERIFY.md — Values Requiring Manual Verification

Items flagged here MUST be verified against the cited primary source before being used in pipeline code.
**Do not write pipeline code that depends on an unverified value.**

Last updated: 2026-04-18

---

## Status Key
- 🔴 **UNVERIFIED** — Not yet checked against primary source
- 🟡 **PARTIALLY VERIFIED** — Secondary sources agree but primary PDF not inspected
- 🟢 **VERIFIED** — Confirmed from primary source document
- 🚫 **BLOCKER** — Cannot proceed without resolution

---

## Entry #1 — OpenSky OAuth2 Credentials
- **Status:** 🟢 VERIFIED
- **What:** OpenSky Network requires OAuth2 credentials for all historical flight queries.
- **Verified:** 2026-04-18. Credentials from `.env.local` work:
  - OAuth2 token obtained via client credentials flow ✅
  - `/flights/departure` returns 603 KJFK departures for Mar 20 ✅
  - `/tracks/all` returns 459 waypoints for AA100 Apr 16 (cruise FL300–FL350) ✅
  - **Hero flight AA100 confirmed on Mar 20 2026:** callsign=AAL100, icao24=a9b9e3, KJFK→EGLL ✅
- **Rate limits:** Standard tier, daily quota. Exhausted during testing — resets next day.
- **Correct endpoint:** `/tracks/all` (NOT `/tracks`). Anonymous access returns 403.
- **NOTE:** Mar 20 AA100 track not retrieved due to rate limit exhaustion, but flight record confirmed and track approach validated with Apr 16 data.

## Entry #2 — Lee et al. 2021 ERF Table Values + Confidence Intervals
- **Status:** 🟡 PARTIALLY VERIFIED
- **What:** Exact ERF values from Table 3 / Figure 4, especially 5–95% CI for sulfate aerosol
- **Source to check:** Lee et al. 2021 paper PDF (DOI: 10.1016/j.atmosenv.2020.117834)
- **Why it matters:** These values contextualize the relative importance of contrails vs CO₂
- **Issue:** Paper is behind Elsevier paywall. Values cited in constants.py and SOURCES.md are from widely-repeated secondary citations.
- **Action needed:** Access full paper via institutional subscription or library, verify Table 3 exactly
- **Values to confirm:**
  - Contrail cirrus ERF = 57.4 mW/m² (5%: 17.0, 95%: 98.0)
  - CO₂ ERF = 34.3 mW/m² (5%: 28.1, 95%: 40.5)
  - Sulfate aerosol ERF = −7.4 mW/m² (CI values marked UNVERIFIED in constants.py)
  - Total aviation ERF = 100.9 mW/m² (5%: 55.0, 95%: 145.0)

## Entry #3 — Per-Carrier Load Factors
- **Status:** 🔴 UNVERIFIED
- **What:** Carrier-specific passenger load factors for the 8 target airlines
- **Source to check:** US DOT T-100 data (https://www.transtats.bts.gov/) for US carriers, IATA for international
- **Why it matters:** Load factor affects per-passenger emissions. pycontrails uses regional IATA averages (~0.828 for North America), which is reasonable but not carrier-specific.
- **Decision needed:** Use pycontrails built-in IATA regional averages (acceptable accuracy) or gather carrier-specific data?

## Entry #4 — Teoh et al. 2020: 2% Fuel Constraint Framing
- **Status:** 🟡 PARTIALLY VERIFIED
- **What:** The 2% maximum fuel penalty cited in the prompt for contrail-avoidance diversions
- **Source to check:** Teoh et al. 2020 (DOI: 10.1021/acs.est.9b05608), specifically the section on fuel penalty quantification
- **Why it matters:** The 2% ceiling is a LOCKED PARAMETER. Must verify it's directly from this paper, not paraphrased.
- **What to look for:** Exact wording of fuel penalty bound, methodology for computing it, whether it's 2% per flight or fleet average
- **Current understanding:** "Small-scale diversions" of ~2000 ft typically incur <2% fuel increase and can eliminate majority of warming contrails

## Entry #5 — Hero Flight Specific Date Verification
- **Status:** � VERIFIED
- **What:** Verify that AA100 actually operated on Mar 20 2026
- **Confirmed via OpenSky API (2026-04-18):**
  - callsign: AAL100
  - icao24: a9b9e3
  - estDepartureAirport: KJFK
  - estArrivalAirport: EGLL
  - firstSeen: 1774054248 (2026-03-20 ~23:17 UTC)
  - lastSeen: 1774075578 (2026-03-21 ~05:13 UTC)
  - Duration: ~5.9h
- **Track data:** Not yet retrieved for Mar 20 (rate limit exhausted). Apr 16 AA100 track validated: 459 waypoints, cruise FL300–FL350, full NAT corridor coverage (lat 41.7°–51.1°, lon -72.5° to -2.8°).
- **44 target-airline KJFK→Europe flights** found on Mar 20 alone — ample for the 100-flight manifest.

## Entry #6 — GoogleForecast Extra Install
- **Status:** 🔴 UNVERIFIED
- **What:** Whether `pip install "pycontrails[google]"` enables the `GoogleForecast` datalib
- **Verified so far:** `from pycontrails.datalib.google import GoogleForecast` → `ModuleNotFoundError` (2026-04-18)
- **Action:** Try `pip install "pycontrails[google]"` — this may pull in Google Cloud dependencies
- **Priority:** Low — Google Contrails API is optional for Tier 2 pipeline

## Entry #7 — OpenAP Accuracy Bounds
- **Status:** 🔴 UNVERIFIED
- **What:** Formal accuracy/error metrics for OpenAP fuel flow model vs actual airline data
- **Source to check:** Sun et al. 2020 (DOI: 10.3390/aerospace7080104), particularly Sections 4-5
- **Why it matters:** OpenAP is secondary to PSFlight for CoCiP, but if used for standalone CO₂, need to know error bounds
- **Priority:** Low — PSFlight is primary for Tier 2

## Entry #8 — ICAO Fuel Burn Polynomial Coefficients
- **Status:** 🔴 UNVERIFIED
- **What:** The specific (a, b, c) polynomial coefficients per aircraft type in `co2_service.py`
- **Source to check:** ICAO Carbon Emissions Calculator Methodology v13-2024 PDF, Appendix tables
- **URL:** https://www.icao.int/environmental-protection/CarbonOffset/Documents/Methodology%20ICAO%20Carbon%20Calculator_v13-2024.pdf
- **Issue:** Our code comments say "approximate" — unclear provenance
- **Priority:** Low — CoCiP pipeline uses PSFlight, not polynomial fuel burn

## Entry #9 — ERA5 Data Availability for Mar 15-29 2026
- **Status:** 🔴 UNVERIFIED
- **What:** Confirm ERA5 reanalysis data is available for the full Mar 15-29 2026 window on CDS
- **Why it matters:** ERA5 reanalysis has a ~5 day production lag. If Mar 29 data isn't yet available, may need ERA5T (preliminary) or fall back to GFS
- **Action:** Query CDS catalog for `reanalysis-era5-pressure-levels` with date range Mar 15-29 2026
- **Note:** CDS API key is configured and ready

## Entry #10 — GWP* Implementation Details
- **Status:** 🔴 UNVERIFIED
- **What:** Exact parameters for GWP* calculation: Δt value, correction factor s, appropriate GWP_H
- **Source to check:** Cain et al. 2019 (DOI: 10.1038/s41612-019-0086-4), Section 2
- **Priority:** Low — presentation concern, not core pipeline logic
