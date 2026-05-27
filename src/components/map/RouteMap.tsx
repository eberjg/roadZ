"use client";

import { useEffect, useMemo, useRef } from "react";
import {
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
    </svg>
  );
}

function MapboxMap({
  route,
  completedDistanceMiles = 0,
  youPosition = null,
  followTrip = true,
  variant = "immersive",
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const youMarkerRef = useRef<import("mapbox-gl").Marker | null>(null);
  const readyRef = useRef(false);

  const mapView = useMemo(() => {
    const polyline = normalizedPolyline(route);
    const { traveled, remaining } = splitRoutePolyline(polyline, completedDistanceMiles);
    const you =
      youPosition ??
      resolveYouAreHere({
        polyline,
        completedDistanceMiles,
      });
    return { traveled, remaining, you };
  }, [route, completedDistanceMiles, youPosition]);

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
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        interactive: true,
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
          "h-5 w-5 rotate-45 rounded-sm bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)] ring-2 ring-white/80";
        youMarkerRef.current = new mapboxgl.Marker({ element: youEl }).setLngLat([0, 0]).addTo(map);

        readyRef.current = true;
        applyMapView({
          map,
          mapboxgl,
          mapView,
          route,
          followTrip,
          completedDistanceMiles,
          youMarker: youMarkerRef.current,
          variant,
        });
      });
    }

    void initMap();

    return () => {
      cancelled = true;
      readyRef.current = false;
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
      applyMapView({
        map,
        mapboxgl: mapboxgl.default,
        mapView,
        route,
        followTrip,
        completedDistanceMiles,
        youMarker: youMarkerRef.current,
        variant,
      });
    });
  }, [mapView, route, followTrip, completedDistanceMiles, variant]);

  return <div ref={containerRef} className="h-full w-full" />;
}

function mapPadding(variant: RouteMapProps["variant"]) {
  if (variant === "cockpit") {
    return { top: 150, bottom: 230, left: 56, right: 56 };
  }
  if (variant === "immersive") {
    return { top: 80, bottom: 120, left: 48, right: 48 };
  }
  return 48;
}

function maxZoomForRoute(
  distanceMiles: number,
  variant: RouteMapProps["variant"],
  inProgress: boolean,
) {
  if (inProgress) {
    return variant === "cockpit" ? 12.5 : 11;
  }
  if (variant === "cockpit") {
    if (distanceMiles < 20) {
      return 14;
    }
    if (distanceMiles < 80) {
      return 12;
    }
    if (distanceMiles < 300) {
      return 10;
    }
    return 8.5;
  }
  if (variant === "immersive") {
    if (distanceMiles < 50) {
      return 11;
    }
    return 8;
  }
  return 8;
}

function applyMapView(input: {
  map: import("mapbox-gl").Map;
  mapboxgl: typeof import("mapbox-gl").default;
  mapView: {
    traveled: [number, number][];
    remaining: [number, number][];
    you: LngLat;
  };
  route: RouteData;
  followTrip: boolean;
  completedDistanceMiles: number;
  youMarker: import("mapbox-gl").Marker | null;
  variant?: RouteMapProps["variant"];
}) {
  const traveledSource = input.map.getSource("route-traveled") as
    | import("mapbox-gl").GeoJSONSource
    | undefined;
  const remainingSource = input.map.getSource("route-remaining") as
    | import("mapbox-gl").GeoJSONSource
    | undefined;

  traveledSource?.setData(lineFeature(input.mapView.traveled));
  remainingSource?.setData(lineFeature(input.mapView.remaining));

  const bounds = new input.mapboxgl.LngLatBounds();
  if (input.followTrip && input.completedDistanceMiles > 0) {
    bounds.extend([input.mapView.you.lng, input.mapView.you.lat]);
    bounds.extend([input.route.end.lng, input.route.end.lat]);
    input.mapView.remaining.forEach(([lng, lat]) => bounds.extend([lng, lat]));
  } else {
    input.route.polyline.forEach(([lng, lat]) => bounds.extend([lng, lat]));
    bounds.extend([input.mapView.you.lng, input.mapView.you.lat]);
  }

  const inProgress = input.followTrip && input.completedDistanceMiles > 0;
  const padding = mapPadding(input.variant);
  const maxZoom = maxZoomForRoute(input.route.distanceMiles, input.variant, inProgress);

  input.map.fitBounds(bounds, {
    padding,
    maxZoom,
    duration: 700,
    essential: true,
  });

  if (input.variant === "cockpit" && !inProgress) {
    input.map.easeTo({ pitch: 48, bearing: 0, duration: 700 });
  } else if (input.variant === "cockpit" && inProgress) {
    input.map.easeTo({ pitch: 55, duration: 500 });
  }

  input.youMarker?.setLngLat([input.mapView.you.lng, input.mapView.you.lat]);
}

export function RouteMap(props: RouteMapProps) {
  const hasMapboxToken = Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim());
  const immersive = props.variant === "immersive" || props.variant === "cockpit";
  const you =
    props.youPosition ??
    resolveYouAreHere({
      polyline: normalizedPolyline(props.route),
      completedDistanceMiles: props.completedDistanceMiles ?? 0,
    });

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
          {hasMapboxToken ? <MapboxMap {...props} /> : <SvgFallbackMap {...props} />}
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
        {hasMapboxToken ? <MapboxMap {...props} /> : <SvgFallbackMap {...props} />}
      </div>
      <div className="flex justify-between px-4 py-3 text-sm font-semibold text-zinc-400">
        <span data-testid="route-map-start">A · Start</span>
        <span className="text-sky-400">You</span>
        <span data-testid="route-map-end">B · Destination</span>
      </div>
    </section>
  );
}
