import type { LngLat } from "./types";

export type LngLatPair = [number, number];

const METERS_PER_MILE = 1609.344;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function haversineMiles(a: LngLatPair, b: LngLatPair): number {
  const earthRadiusMeters = 6_371_000;
  const dLat = toRadians(b[1] - a[1]);
  const dLon = toRadians(b[0] - a[0]);
  const lat1 = toRadians(a[1]);
  const lat2 = toRadians(b[1]);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const arc = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return (earthRadiusMeters * arc) / METERS_PER_MILE;
}

export function bearingDegrees(from: LngLatPair, to: LngLatPair): number {
  const lat1 = toRadians(from[1]);
  const lat2 = toRadians(to[1]);
  const dLon = toRadians(to[0] - from[0]);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export function polylineLengthMiles(polyline: LngLatPair[]): number {
  if (polyline.length < 2) {
    return 0;
  }
  let total = 0;
  for (let index = 1; index < polyline.length; index += 1) {
    total += haversineMiles(polyline[index - 1], polyline[index]);
  }
  return total;
}

export function positionAlongPolyline(
  polyline: LngLatPair[],
  distanceMiles: number,
): { position: LngLatPair; bearing: number } {
  if (polyline.length === 0) {
    return { position: [0, 0], bearing: 0 };
  }
  if (polyline.length === 1 || distanceMiles <= 0) {
    const next = polyline[1] ?? polyline[0];
    return { position: polyline[0], bearing: bearingDegrees(polyline[0], next) };
  }

  let walked = 0;
  for (let index = 1; index < polyline.length; index += 1) {
    const start = polyline[index - 1];
    const end = polyline[index];
    const segmentMiles = haversineMiles(start, end);
    if (walked + segmentMiles >= distanceMiles) {
      const ratio = segmentMiles === 0 ? 0 : (distanceMiles - walked) / segmentMiles;
      const position: LngLatPair = [
        start[0] + ratio * (end[0] - start[0]),
        start[1] + ratio * (end[1] - start[1]),
      ];
      return { position, bearing: bearingDegrees(start, end) };
    }
    walked += segmentMiles;
  }

  const last = polyline[polyline.length - 1];
  const prev = polyline[polyline.length - 2] ?? last;
  return { position: last, bearing: bearingDegrees(prev, last) };
}

export function splitRoutePolyline(
  polyline: LngLatPair[],
  completedDistanceMiles: number,
): { traveled: LngLatPair[]; remaining: LngLatPair[] } {
  if (polyline.length < 2) {
    return { traveled: polyline, remaining: polyline };
  }

  const clamped = Math.max(0, completedDistanceMiles);
  const { position } = positionAlongPolyline(polyline, clamped);
  const traveled: LngLatPair[] = [polyline[0]];
  let walked = 0;

  for (let index = 1; index < polyline.length; index += 1) {
    const start = polyline[index - 1];
    const end = polyline[index];
    const segmentMiles = haversineMiles(start, end);
    if (walked + segmentMiles >= clamped) {
      if (
        traveled[traveled.length - 1][0] !== position[0] ||
        traveled[traveled.length - 1][1] !== position[1]
      ) {
        traveled.push(position);
      }
      const remaining: LngLatPair[] = [position];
      if (end[0] !== position[0] || end[1] !== position[1]) {
        remaining.push(end);
      }
      remaining.push(...polyline.slice(index + 1));
      return { traveled, remaining };
    }
    traveled.push(end);
    walked += segmentMiles;
  }

  return { traveled, remaining: [polyline[polyline.length - 1]] };
}

export function resolveYouAreHere(input: {
  polyline: LngLatPair[];
  completedDistanceMiles: number;
  livePosition?: LngLat | null;
  persistedPosition?: LngLat | null;
  preferLivePosition?: boolean;
  /** True when reopening a saved trip before the user changes progress */
  usePersistedSnapshot?: boolean;
}): LngLat {
  if (input.preferLivePosition && input.livePosition) {
    return input.livePosition;
  }
  if (input.usePersistedSnapshot && input.persistedPosition) {
    return input.persistedPosition;
  }
  const along = positionAlongPolyline(input.polyline, input.completedDistanceMiles);
  return { lng: along.position[0], lat: along.position[1] };
}
