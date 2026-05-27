"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import {
  haversineMiles,
  isValidLngLat,
  positionAlongPolyline,
  resolveYouAreHere,
  splitRoutePolyline,
} from "@/services/maps/routeProgress";
import type { LngLat, RouteData } from "@/services/maps/types";
import "mapbox-gl/dist/mapbox-gl.css";

type RouteMapProps = {
  route: RouteData;
  completedDistanceMiles?: number;
  youPosition?: LngLat | null;
  followTrip?: boolean;
  /** Immersive/cockpit fills parent — used in map-first cockpit */
  variant?: "default" | "immersive" | "cockpit";
};

export type RouteMapHandle = {
  recenterRoute: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetNorth: () => void;
};

function displayYouOnMap(
  you: LngLat,
  route: RouteData,
  polyline: [number, number][],
  completedDistanceMiles: number,
): LngLat {
  if (isValidLngLat(you)) {
    return you;
  }
  const along = positionAlongPolyline(polyline, completedDistanceMiles);
  if (isValidLngLat({ lng: along.position[0], lat: along.position[1] })) {
    return { lng: along.position[0], lat: along.position[1] };
  }
  return { lng: route.start.lng, lat: route.start.lat };
}

function extendRouteBounds(
  bounds: import("mapbox-gl").LngLatBounds,
  route: RouteData,
  polyline: [number, number][],
  followTrip: boolean,
  completedDistanceMiles: number,
  you: LngLat,
): void {
  const inProgress = followTrip && completedDistanceMiles > 0;
  if (inProgress) {
    splitRoutePolyline(polyline, completedDistanceMiles).remaining.forEach(([lng, lat]) =>
      bounds.extend([lng, lat]),
    );
    bounds.extend([route.end.lng, route.end.lat]);
    if (isValidLngLat(you)) {
      bounds.extend([you.lng, you.lat]);
    }
    return;
  }
  polyline.forEach(([lng, lat]) => bounds.extend([lng, lat]));
  bounds.extend([route.start.lng, route.start.lat]);
  bounds.extend([route.end.lng, route.end.lat]);
}

function lineFeature(coordinates: [number, number][]) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "LineString" as const,
      coordinates,
    },
  };
}

function normalizedPolyline(route: RouteData): [number, number][] {
  if (route.polyline.length >= 2) {
    return route.polyline;
  }
  return [
    [route.start.lng, route.start.lat],
    [route.end.lng, route.end.lat],
  ];
}

function SvgFallbackMap(routeMap: RouteMapProps) {
  const {
    route,
    completedDistanceMiles = 0,
    youPosition = null,
    followTrip = true,
  } = routeMap;
  const polyline = useMemo(() => normalizedPolyline(route), [route]);
  const { traveled, remaining } = useMemo(
    () => splitRoutePolyline(polyline, completedDistanceMiles),
    [polyline, completedDistanceMiles],
  );

  const you = useMemo(() => {
    if (youPosition) {
      return youPosition;
    }
    return resolveYouAreHere({
      polyline,
      completedDistanceMiles,
    });
  }, [polyline, completedDistanceMiles, youPosition]);
  const youBearing = useMemo(() => {
    const along = positionAlongPolyline(polyline, completedDistanceMiles);
    return along.bearing;
  }, [polyline, completedDistanceMiles]);

  const allPoints = useMemo(() => {
    const points = [...route.polyline, [you.lng, you.lat] as [number, number]];
    if (followTrip && completedDistanceMiles > 0) {
      return [...points, [route.end.lng, route.end.lat]];
    }
    return points;
  }, [route, you, followTrip, completedDistanceMiles]);

  if (allPoints.length < 2) {
    return null;
  }

  const lngs = allPoints.map(([lng]) => lng);
  const lats = allPoints.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const width = 360;
  const height = routeMap.variant === "immersive" ? 400 : 220;
  const shortTrip = route.distanceMiles < 30;
  const padding = shortTrip ? 28 : 16;

  const project = ([lng, lat]: [number, number]) => {
    const xRange = maxLng - minLng || 0.02;
    const yRange = maxLat - minLat || 0.02;
    const x = padding + ((lng - minLng) / xRange) * (width - padding * 2);
    const y = height - padding - ((lat - minLat) / yRange) * (height - padding * 2);
    return `${x},${y}`;
  };

  const traveledPath = traveled
    .map((point) => project(point).replace(",", " "))
    .join(" L ");
  const remainingPath = remaining
    .map((point) => project(point).replace(",", " "))
    .join(" L ");
  const [youX, youY] = project([you.lng, you.lat]).split(",");
  const [startX, startY] = project([route.start.lng, route.start.lat]).split(",");
  const [endX, endY] = project([route.end.lng, route.end.lat]).split(",");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      role="img"
      aria-label="Trip navigation map"
    >
      <defs>
        <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0c4a6e" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <filter id="neon">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#22d3ee" floodOpacity="0.9" />
        </filter>
      </defs>
      <rect width={width} height={height} fill="url(#routeGlow)" />
      {traveledPath ? (
        <path
          d={`M ${traveledPath}`}
          fill="none"
          stroke="#22d3ee"
          strokeWidth={routeMap.variant === "cockpit" ? 6 : 5}
          strokeLinecap="round"
          filter={routeMap.variant === "cockpit" ? "url(#neon)" : undefined}
        />
      ) : null}
      {remainingPath ? (
        <path
          d={`M ${remainingPath}`}
          fill="none"
          stroke="#2563eb"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="6 4"
          opacity="0.95"
        />
      ) : null}
      <circle cx={startX} cy={startY} r="6" fill="#22c55e" />
      <circle cx={endX} cy={endY} r="6" fill="#ef4444" />
      <circle
        data-testid="route-map-you"
        cx={youX}
        cy={youY}
        r="8"
        fill="#38bdf8"
        stroke="#ffffff"
        strokeWidth="2"
      />
      <polygon
        points={`${youX},${Number(youY) - 12} ${Number(youX) - 5},${Number(youY) - 2} ${Number(youX) + 5},${Number(youY) - 2}`}
        fill="#ffffff"
        transform={`rotate(${youBearing}, ${youX}, ${youY})`}
      />
    </svg>
  );
}

function routeCameraKey(route: RouteData): string {
  return `${route.start.lng.toFixed(5)},${route.start.lat.toFixed(5)}|${route.end.lng.toFixed(5)},${route.end.lat.toFixed(5)}|${route.polyline.length}|${route.distanceMiles}`;
}

const FOLLOW_CAMERA_MIN_MILES = 0.008;

const MapboxMap = forwardRef<RouteMapHandle, RouteMapProps>(function MapboxMap(
  {
    route,
    completedDistanceMiles = 0,
    youPosition = null,
    followTrip = true,
    variant = "immersive",
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const youMarkerRef = useRef<import("mapbox-gl").Marker | null>(null);
  const readyRef = useRef(false);
  const mapboxglRef = useRef<typeof import("mapbox-gl").default | null>(null);
  const latestViewRef = useRef<{
    mapView: {
      traveled: [number, number][];
      remaining: [number, number][];
      you: LngLat;
      bearing: number;
      polyline: [number, number][];
    };
    route: RouteData;
    followTrip: boolean;
    completedDistanceMiles: number;
    variant: RouteMapProps["variant"];
  } | null>(null);
  const cameraStateRef = useRef({
    routeKey: "",
    followCenter: null as [number, number] | null,
    progressMiles: 0,
    pitchApplied: false,
  });

  const mapView = useMemo(() => {
    const polyline = normalizedPolyline(route);
    const { traveled, remaining } = splitRoutePolyline(polyline, completedDistanceMiles);
    const along = positionAlongPolyline(polyline, completedDistanceMiles);
    const rawYou =
      youPosition ??
      resolveYouAreHere({
        polyline,
        completedDistanceMiles,
      });
    const you = displayYouOnMap(rawYou, route, polyline, completedDistanceMiles);
    return { traveled, remaining, you, bearing: along.bearing, polyline };
  }, [route, completedDistanceMiles, youPosition]);

  useEffect(() => {
    latestViewRef.current = {
      mapView,
      route,
      followTrip,
      completedDistanceMiles,
      variant,
    };
  }, [mapView, route, followTrip, completedDistanceMiles, variant]);

  useImperativeHandle(
    ref,
    () => ({
      recenterRoute: () => {
        const map = mapRef.current;
        const mapboxgl = mapboxglRef.current;
        const latest = latestViewRef.current;
        if (!map || !mapboxgl || !latest) {
          return;
        }
        map.resize();
        syncMapView({
          map,
          mapboxgl,
          mapView: latest.mapView,
          route: latest.route,
          followTrip: latest.followTrip,
          completedDistanceMiles: latest.completedDistanceMiles,
          youMarker: youMarkerRef.current,
          variant: latest.variant,
          cameraState: cameraStateRef.current,
          forceCamera: "fit-route",
        });
      },
      zoomIn: () => {
        const map = mapRef.current;
        if (!map) {
          return;
        }
        map.resize();
        map.zoomIn({ duration: 200 });
      },
      zoomOut: () => {
        const map = mapRef.current;
        if (!map) {
          return;
        }
        map.resize();
        map.zoomOut({ duration: 200 });
      },
      resetNorth: () => {
        const inProgress =
          Boolean(latestViewRef.current?.followTrip) &&
          (latestViewRef.current?.completedDistanceMiles ?? 0) > 0;
        mapRef.current?.easeTo({
          bearing: 0,
          pitch: latestViewRef.current?.variant === "cockpit" ? (inProgress ? 55 : 48) : 0,
          duration: 300,
          essential: true,
        });
      },
    }),
    [],
  );

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();
    if (!token || !containerRef.current) {
      return;
    }

    let cancelled = false;

    async function initMap() {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled || !containerRef.current) {
        return;
      }

      mapboxgl.accessToken = token;
      mapboxglRef.current = mapboxgl;
      const initialPolyline = normalizedPolyline(route);
      const initialYou = displayYouOnMap(
        mapView.you,
        route,
        initialPolyline,
        completedDistanceMiles,
      );
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        interactive: true,
        center: [initialYou.lng, initialYou.lat],
        zoom: targetZoomForRoute(route.distanceMiles, variant, completedDistanceMiles > 0),
      });
      mapRef.current = map;

      map.on("load", () => {
        if (cancelled) {
          return;
        }

        map.addSource("route-traveled", {
          type: "geojson",
          data: lineFeature([]),
        });
        map.addSource("route-remaining", {
          type: "geojson",
          data: lineFeature([]),
        });

        const isCockpit = variant === "cockpit" || variant === "immersive";
        map.addLayer({
          id: "route-remaining",
          type: "line",
          source: "route-remaining",
          paint: {
            "line-color": "#2563eb",
            "line-width": isCockpit ? 6 : 5,
            "line-opacity": 0.95,
            "line-dasharray": [2, 1.4],
          },
        });
        map.addLayer({
          id: "route-traveled",
          type: "line",
          source: "route-traveled",
          paint: {
            "line-color": isCockpit ? "#22d3ee" : "#38bdf8",
            "line-width": isCockpit ? 7 : 6,
            "line-blur": isCockpit ? 0.5 : 0,
          },
        });

        const startEl = document.createElement("div");
        startEl.className = "h-3 w-3 rounded-full bg-green-500 ring-2 ring-white";
        new mapboxgl.Marker({ element: startEl })
          .setLngLat([route.start.lng, route.start.lat])
          .addTo(map);

        const endEl = document.createElement("div");
        endEl.className = "h-3 w-3 rounded-full bg-red-500 ring-2 ring-white";
        new mapboxgl.Marker({ element: endEl })
          .setLngLat([route.end.lng, route.end.lat])
          .addTo(map);

        const youEl = document.createElement("div");
        youEl.setAttribute("data-testid", "route-map-you");
        youEl.className =
          "h-5 w-5 rounded-sm bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)] ring-2 ring-white/80";
        youEl.style.clipPath = "polygon(50% 0%, 100% 70%, 50% 100%, 0% 70%)";
        youMarkerRef.current = new mapboxgl.Marker({
          element: youEl,
          rotationAlignment: "map",
        })
          .setLngLat([route.start.lng, route.start.lat])
          .addTo(map);

        readyRef.current = true;
        cameraStateRef.current = {
          routeKey: "",
          followCenter: null,
          progressMiles: completedDistanceMiles,
          pitchApplied: false,
        };
        map.resize();
        syncMapView({
          map,
          mapboxgl,
          mapView,
          route,
          followTrip,
          completedDistanceMiles,
          youMarker: youMarkerRef.current,
          variant,
          cameraState: cameraStateRef.current,
          forceCamera: "fit-route",
        });
        window.requestAnimationFrame(() => {
          if (!cancelled && mapRef.current) {
            mapRef.current.resize();
            syncMapView({
              map,
              mapboxgl,
              mapView,
              route,
              followTrip,
              completedDistanceMiles,
              youMarker: youMarkerRef.current,
              variant,
              cameraState: cameraStateRef.current,
              forceCamera: "fit-route",
            });
          }
        });
      });
    }

    void initMap();

    return () => {
      cancelled = true;
      mapboxglRef.current = null;
      readyRef.current = false;
      cameraStateRef.current = {
        routeKey: "",
        followCenter: null,
        progressMiles: 0,
        pitchApplied: false,
      };
      youMarkerRef.current?.remove();
      youMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Map instance is created once per route; progress updates run in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- route identity only
  }, [route]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) {
      return;
    }

    void import("mapbox-gl").then((mapboxgl) => {
      const routeKey = routeCameraKey(route);
      const inProgress = followTrip && completedDistanceMiles > 0;
      const routeChanged = cameraStateRef.current.routeKey !== routeKey;

      let forceCamera: "fit-route" | "follow" | "none" = "none";
      if (routeChanged) {
        forceCamera = "fit-route";
      } else if (inProgress) {
        forceCamera = "follow";
      } else if (cameraStateRef.current.progressMiles > 0 && completedDistanceMiles === 0) {
        forceCamera = "fit-route";
      }

      syncMapView({
        map,
        mapboxgl: mapboxgl.default,
        mapView,
        route,
        followTrip,
        completedDistanceMiles,
        youMarker: youMarkerRef.current,
        variant,
        cameraState: cameraStateRef.current,
        forceCamera,
      });
    });
  }, [mapView, route, followTrip, completedDistanceMiles, variant]);

  useEffect(() => {
    const container = containerRef.current;
    const map = mapRef.current;
    if (!container || !map) {
      return;
    }
    const observer = new ResizeObserver(() => {
      map.resize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [route]);

  return <div ref={containerRef} className="h-full w-full touch-manipulation" />;
});

function mapPadding(variant: RouteMapProps["variant"], distanceMiles: number) {
  if (variant === "cockpit") {
    if (distanceMiles < 3) {
      return { top: 100, bottom: 190, left: 40, right: 80 };
    }
    if (distanceMiles < 15) {
      return { top: 120, bottom: 210, left: 48, right: 68 };
    }
    return { top: 150, bottom: 230, left: 56, right: 56 };
  }
  if (variant === "immersive") {
    if (distanceMiles < 5) {
      return { top: 64, bottom: 96, left: 40, right: 56 };
    }
    return { top: 80, bottom: 120, left: 48, right: 48 };
  }
  return 48;
}

/** Street-level zoom for short trips — fitBounds alone zooms out too far on mobile. */
function targetZoomForRoute(
  distanceMiles: number,
  variant: RouteMapProps["variant"],
  inProgress: boolean,
): number {
  if (inProgress) {
    return variant === "cockpit" ? 13.5 : 12;
  }
  if (variant === "cockpit" || variant === "immersive") {
    if (distanceMiles < 1) {
      return 15;
    }
    if (distanceMiles < 3) {
      return 14.5;
    }
    if (distanceMiles < 8) {
      return 14;
    }
    if (distanceMiles < 20) {
      return 13;
    }
    if (distanceMiles < 80) {
      return 11.5;
    }
    return 9.5;
  }
  if (distanceMiles < 20) {
    return 12;
  }
  return 9;
}

function maxZoomForRoute(
  distanceMiles: number,
  variant: RouteMapProps["variant"],
  inProgress: boolean,
) {
  return Math.max(targetZoomForRoute(distanceMiles, variant, inProgress), 8);
}

function shouldUseDirectRouteZoom(distanceMiles: number): boolean {
  return distanceMiles < 10;
}

function syncMapView(input: {
  map: import("mapbox-gl").Map;
  mapboxgl: typeof import("mapbox-gl").default;
  mapView: {
    traveled: [number, number][];
    remaining: [number, number][];
    you: LngLat;
    bearing: number;
    polyline?: [number, number][];
  };
  route: RouteData;
  followTrip: boolean;
  completedDistanceMiles: number;
  youMarker: import("mapbox-gl").Marker | null;
  variant?: RouteMapProps["variant"];
  cameraState: {
    routeKey: string;
    followCenter: [number, number] | null;
    progressMiles: number;
    pitchApplied: boolean;
  };
  forceCamera: "fit-route" | "follow" | "none";
}) {
  updateRouteLayers(input.map, input.mapView, input.youMarker);

  const routeKey = routeCameraKey(input.route);
  input.cameraState.routeKey = routeKey;
  input.cameraState.progressMiles = input.completedDistanceMiles;

  if (input.forceCamera === "fit-route") {
    fitRouteCamera(input);
    input.cameraState.followCenter = [input.mapView.you.lng, input.mapView.you.lat];
    return;
  }

  if (input.forceCamera === "follow") {
    followVehicleCamera(input);
  }
}

function updateRouteLayers(
  map: import("mapbox-gl").Map,
  mapView: {
    traveled: [number, number][];
    remaining: [number, number][];
    you: LngLat;
    bearing: number;
  },
  youMarker: import("mapbox-gl").Marker | null,
) {
  const traveledSource = map.getSource("route-traveled") as
    | import("mapbox-gl").GeoJSONSource
    | undefined;
  const remainingSource = map.getSource("route-remaining") as
    | import("mapbox-gl").GeoJSONSource
    | undefined;

  traveledSource?.setData(lineFeature(mapView.traveled));
  remainingSource?.setData(lineFeature(mapView.remaining));

  youMarker?.setLngLat([mapView.you.lng, mapView.you.lat]).setRotation(mapView.bearing);
}

function fitRouteCamera(input: {
  map: import("mapbox-gl").Map;
  mapboxgl: typeof import("mapbox-gl").default;
  mapView: { you: LngLat; polyline?: [number, number][] };
  route: RouteData;
  followTrip: boolean;
  completedDistanceMiles: number;
  variant?: RouteMapProps["variant"];
  cameraState: { pitchApplied: boolean };
}) {
  const bounds = new input.mapboxgl.LngLatBounds();
  const polyline = input.mapView.polyline ?? normalizedPolyline(input.route);
  extendRouteBounds(
    bounds,
    input.route,
    polyline,
    input.followTrip,
    input.completedDistanceMiles,
    input.mapView.you,
  );

  const inProgress = input.followTrip && input.completedDistanceMiles > 0;
  const distanceMiles = input.route.distanceMiles;
  const padding = mapPadding(input.variant, distanceMiles);
  const maxZoom = maxZoomForRoute(distanceMiles, input.variant, inProgress);
  const targetZoom = targetZoomForRoute(distanceMiles, input.variant, inProgress);
  const center = bounds.getCenter();
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const degenerate = Math.abs(sw.lng - ne.lng) < 0.0001 && Math.abs(sw.lat - ne.lat) < 0.0001;

  if (degenerate || shouldUseDirectRouteZoom(distanceMiles)) {
    input.map.easeTo({
      center: [center.lng, center.lat],
      zoom: targetZoom,
      duration: 0,
      essential: true,
    });
  } else {
    input.map.fitBounds(bounds, {
      padding,
      maxZoom,
      duration: 0,
      essential: true,
    });
    if (input.map.getZoom() < targetZoom - 0.25) {
      input.map.easeTo({
        center: [center.lng, center.lat],
        zoom: targetZoom,
        duration: 0,
        essential: true,
      });
    }
  }

  if (input.variant === "cockpit" && !input.cameraState.pitchApplied) {
    input.map.easeTo({
      pitch: inProgress ? 55 : 48,
      bearing: 0,
      duration: 0,
      essential: true,
    });
    input.cameraState.pitchApplied = true;
  }
}

function followVehicleCamera(input: {
  map: import("mapbox-gl").Map;
  mapView: { you: LngLat };
  variant?: RouteMapProps["variant"];
  cameraState: { followCenter: [number, number] | null };
}) {
  if (!isValidLngLat(input.mapView.you)) {
    return;
  }
  const center: [number, number] = [input.mapView.you.lng, input.mapView.you.lat];
  const lastCenter = input.cameraState.followCenter;
  if (
    lastCenter &&
    haversineMiles(lastCenter, center) < FOLLOW_CAMERA_MIN_MILES
  ) {
    return;
  }

  input.cameraState.followCenter = center;
  const zoom = input.map.getZoom();
  input.map.easeTo({
    center,
    zoom: Number.isFinite(zoom) ? zoom : undefined,
    duration: 450,
    essential: true,
  });
}

export const RouteMap = forwardRef<RouteMapHandle, RouteMapProps>(function RouteMap(
  props,
  ref,
) {
  const hasMapboxToken = Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim());
  const immersive = props.variant === "immersive" || props.variant === "cockpit";
  const polyline = normalizedPolyline(props.route);
  const rawYou =
    props.youPosition ??
    resolveYouAreHere({
      polyline,
      completedDistanceMiles: props.completedDistanceMiles ?? 0,
    });
  const you = displayYouOnMap(rawYou, props.route, polyline, props.completedDistanceMiles ?? 0);

  if (immersive) {
    return (
      <section
        data-testid="route-map"
        data-variant={props.variant === "cockpit" ? "cockpit" : "immersive"}
        className="h-full w-full overflow-hidden bg-[#020617]"
      >
        <p className="sr-only" data-testid="route-map-position-label">
          You at {you.lat.toFixed(2)}, {you.lng.toFixed(2)}
          {(props.completedDistanceMiles ?? 0) > 0
            ? ` · ${Math.round(props.completedDistanceMiles ?? 0)} mi along route`
            : " · at start"}
        </p>
        <span className="sr-only" data-testid="route-map-start">
          Start
        </span>
        <span className="sr-only" data-testid="route-map-end">
          Destination
        </span>
        <div className="h-full w-full">
          {hasMapboxToken ? <MapboxMap ref={ref} {...props} /> : <SvgFallbackMap {...props} />}
        </div>
      </section>
    );
  }

  return (
    <section
      data-testid="route-map"
      className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-xl shadow-black/50"
    >
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-400/90">
          Navigation map
        </p>
        <p className="mt-1 text-sm text-zinc-300">
          {props.route.start.label} → {props.route.end.label}
        </p>
        <p className="mt-1 text-xs text-zinc-500" data-testid="route-map-position-label">
          You at {you.lat.toFixed(2)}, {you.lng.toFixed(2)}
          {(props.completedDistanceMiles ?? 0) > 0
            ? ` · ${Math.round(props.completedDistanceMiles ?? 0)} mi along route`
            : " · at start"}
        </p>
      </div>
      <div className="h-56 w-full sm:h-72">
        {hasMapboxToken ? <MapboxMap ref={ref} {...props} /> : <SvgFallbackMap {...props} />}
      </div>
      <div className="flex justify-between px-4 py-3 text-sm font-semibold text-zinc-400">
        <span data-testid="route-map-start">A · Start</span>
        <span className="text-sky-400">You</span>
        <span data-testid="route-map-end">B · Destination</span>
      </div>
    </section>
  );
});
