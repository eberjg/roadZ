export type LngLat = {
  lng: number;
  lat: number;
};

export type RouteWaypoint = LngLat & {
  label: string;
};

export type RouteData = {
  distanceMiles: number;
  durationSeconds: number;
  etaLabel: string;
  polyline: [number, number][];
  start: RouteWaypoint;
  end: RouteWaypoint;
  source: "mapbox" | "fallback";
};

export type RouteRequest = {
  /** @deprecated Use `start` — kept for compatibility */
  startZip?: string;
  /** @deprecated Use `destination` — kept for compatibility */
  destinationZip?: string;
  start?: string;
  destination?: string;
};

export type PlaceSuggestion = {
  id: string;
  label: string;
  lng: number;
  lat: number;
};

export type MapboxGeocodeFeature = {
  id?: string;
  center: [number, number];
  place_name: string;
};

export type MapboxGeocodeResponse = {
  features: MapboxGeocodeFeature[];
};

export type MapboxDirectionsRoute = {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
  };
};

export type MapboxDirectionsResponse = {
  code: string;
  routes?: MapboxDirectionsRoute[];
  message?: string;
};

export type RouteErrorCode =
  | "INVALID_ZIP"
  | "INVALID_PLACE"
  | "TIMEOUT"
  | "UNAVAILABLE"
  | "MALFORMED";
