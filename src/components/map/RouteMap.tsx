"use client";

import { useEffect, useRef } from "react";
import type { RouteData } from "@/services/maps/types";
import "mapbox-gl/dist/mapbox-gl.css";

type RouteMapProps = {
  route: RouteData;
};

function SvgFallbackMap({ route }: RouteMapProps) {
  const points = route.polyline;
  if (points.length < 2) {
    return null;
  }

  const lngs = points.map(([lng]) => lng);
  const lats = points.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const width = 360;
  const height = 220;
  const padding = 16;

  const project = ([lng, lat]: [number, number]) => {
    const xRange = maxLng - minLng || 1;
    const yRange = maxLat - minLat || 1;
    const x = padding + ((lng - minLng) / xRange) * (width - padding * 2);
    const y = height - padding - ((lat - minLat) / yRange) * (height - padding * 2);
    return `${x},${y}`;
  };

  const path = points.map((point) => project(point).replace(",", " ")).join(" L ");
  const [startX, startY] = project([route.start.lng, route.start.lat]).split(",");
  const [endX, endY] = project([route.end.lng, route.end.lat]).split(",");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      role="img"
      aria-label="Route map preview"
    >
      <rect width={width} height={height} fill="#e4e4e7" />
      <path
        d={`M ${path}`}
        fill="none"
        stroke="#18181b"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx={startX} cy={startY} r="7" fill="#16a34a" />
      <circle cx={endX} cy={endY} r="7" fill="#dc2626" />
    </svg>
  );
}

function MapboxMap({ route }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);

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
        style: "mapbox://styles/mapbox/streets-v12",
        interactive: true,
      });
      mapRef.current = map;

      map.on("load", () => {
        if (cancelled) {
          return;
        }

        const bounds = new mapboxgl.LngLatBounds();
        route.polyline.forEach(([lng, lat]) => bounds.extend([lng, lat]));
        map.fitBounds(bounds, { padding: 40, maxZoom: 8 });

        map.addSource("route-line", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: route.polyline,
            },
          },
        });

        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route-line",
          paint: {
            "line-color": "#18181b",
            "line-width": 5,
          },
        });

        new mapboxgl.Marker({ color: "#16a34a" })
          .setLngLat([route.start.lng, route.start.lat])
          .addTo(map);
        new mapboxgl.Marker({ color: "#dc2626" })
          .setLngLat([route.end.lng, route.end.lat])
          .addTo(map);
      });
    }

    void initMap();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [route]);

  return <div ref={containerRef} className="h-full w-full" />;
}

export function RouteMap({ route }: RouteMapProps) {
  const hasMapboxToken = Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim());

  return (
    <section
      data-testid="route-map"
      className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-xl shadow-black/50"
    >
      <div className="h-56 w-full sm:h-72">
        {hasMapboxToken ? <MapboxMap route={route} /> : <SvgFallbackMap route={route} />}
      </div>
      <div className="flex justify-between px-4 py-3 text-sm font-semibold text-zinc-400">
        <span data-testid="route-map-start">Start</span>
        <span data-testid="route-map-end">Destination</span>
      </div>
    </section>
  );
}
