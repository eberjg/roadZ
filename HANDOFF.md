## Session Handoff

State as of 2026-05-27.

- Current goal: stop cockpit map camera jitter (bounce/zoom loop) while keeping route line + live marker updates.
- Root cause fixed in `RouteMap.tsx`:
  1) `fitBounds` / `easeTo` were called on every GPS/progress update → camera animation loop.
  2) Car marker rotation used CSS `transform` on the Mapbox marker root → overwrote Mapbox positioning transform.
- Implemented:
  1) Split map updates: route layers + marker every tick; camera only on route load, trip reset, or meaningful follow move.
  2) `fitRouteCamera` runs once per route (duration 0); live follow uses thresholded center pan only.
  3) Marker heading uses Mapbox `setRotation()` with `rotationAlignment: "map"`.
- Prior fixes still in place: `ensurePolyline`, normalized polyline fallback, blue route line, degenerate bounds handling.
- Next step: run `npm run lint && npm run build && npm run test:e2e`, commit, push, verify production map is stable.
- Blockers: agent shell has no `npm`; user terminal or CI required for validation/deploy.
