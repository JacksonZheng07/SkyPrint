# Flight Selection — SkyPrint Cinematic Scroll Prototype

## Hero Flight: BAW117

| Field | Value | Rationale |
| --- | --- | --- |
| **Route** | JFK → LHR | North Atlantic corridor — highest density for persistent contrail formation |
| **Carrier** | British Airways (BA/BAW) | High-profile, recognizable, substantial fleet on NAT |
| **Flight** | BA117 | Premier evening departure, 23:00 UTC, arrives 11:00 UTC+1 |
| **Date** | 2026-04-10 (STUB) | Spring period with elevated ISSR probability. Stub data — not real ADS-B |
| **Aircraft** | B777-300ER | Long-haul widebody typical of NAT; well-characterized fuel-burn models |
| **Cruise FL** | FL370 (37,000 ft) | Standard long-haul cruise; frequently intersects ISSR bands at these altitudes |

## Why This Flight

1. **ISSR intersection**: Night flights on the NAT at FL350–FL390 have the highest probability
   of encountering ice-supersaturated regions in spring and autumn.
2. **Contrail persistence**: Nighttime contrails produce net warming (no shortwave offset),
   making the impact easier to explain visually.
3. **Route familiarity**: JFK–LHR is the busiest international route globally. Non-expert
   audiences understand "New York to London."
4. **Data availability**: OpenSky Network, ERA5, and AviationStack all cover this route with
   high temporal resolution.
5. **Counterfactual validity**: FL330 (−4,000 ft) is a realistic alternate cruise level for
   NAT operations under MNPS/RVSM with manageable fuel penalty (< 4%).

## Expansion Candidates

| Flight | Route | Why |
| --- | --- | --- |
| DAL1 | JFK → LHR | Delta flagship; comparison with BA on same route |
| AAL100 | JFK → LHR | American flagship; expands leaderboard |
| AFR007 | JFK → CDG | Different destination; tests generalization |
| UAL110 | EWR → LHR | United hub; similar corridor but slightly different geometry |
