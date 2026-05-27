## Session Handoff

State as of 2026-05-26.

- Current goal: fix cockpit map so it always shows direct route line and live movement (no Africa/0,0 fallback).
- Confirmed issue: when route polyline is empty, map position can resolve to 0,0 and no visible blue line.
- Implemented:
  1) `routeService` now guarantees a non-empty polyline via `ensurePolyline(...)`.
  2) `RouteMap` now normalizes invalid polylines to `[start,end]` before split/position math.
  3) Route color updated to visible blue in both Mapbox and SVG fallback.
- 4) `RouteMap` now shows heading direction by rotating the car marker using route bearing.
- 5) Added degenerate-bounds map fallback (`easeTo`) for very short/same-point routes.
- Next concrete step: deploy and verify marker heading + visible route line on mobile.
- Blockers: local shell cannot run `npm` in this environment; validation must use available tooling or user terminal.
