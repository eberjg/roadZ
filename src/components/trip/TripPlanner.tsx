"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ErrorState } from "@/components/map/ErrorState";
import { LoadingState } from "@/components/map/LoadingState";
import { ui } from "@/components/ui/theme";
import { extractUsZip } from "@/services/maps/placeResolver";
import { calculateTrip } from "@/services/trip/calculateTrip";
import { readMapHandoffFromSearch } from "@/services/trip/mapDeepLink";
import type { RouteData } from "@/services/maps/types";
import type { TripInput, TripResult } from "@/services/trip/types";
import { TripResults } from "./TripResults";

type TripPlannerProps = {
  onCalculated?: (input: TripInput, result: TripResult, route: RouteData) => void;
};

function buildTripInput(
  startPlace: string,
  destinationPlace: string,
  vehicleMpg: number,
  gasPrice: number,
): TripInput {
  const startZip = extractUsZip(startPlace) ?? startPlace.trim();
  const destinationZip = extractUsZip(destinationPlace) ?? destinationPlace.trim();
  return {
    startPlace: startPlace.trim(),
    destinationPlace: destinationPlace.trim(),
    startZip,
    destinationZip,
    vehicleMpg,
    gasPrice,
  };
}

export function TripPlanner({ onCalculated }: TripPlannerProps) {
  const searchParams = useSearchParams();
  const mapHandoff = readMapHandoffFromSearch(searchParams.toString());
  const [startPlace, setStartPlace] = useState(mapHandoff.start ?? "");
  const [destinationPlace, setDestinationPlace] = useState(mapHandoff.destination ?? "");
  const [vehicleMpg, setVehicleMpg] = useState("");
  const [gasPrice, setGasPrice] = useState("");
  const [result, setResult] = useState<TripResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCalculate() {
    setError(null);
    setResult(null);

    const mpg = Number(vehicleMpg);
    const price = Number(gasPrice);

    if (!startPlace.trim() || !destinationPlace.trim()) {
      setError("Enter a start and destination (address or ZIP).");
      return;
    }
    if (!Number.isFinite(mpg) || mpg <= 0) {
      setError("Enter a valid vehicle MPG greater than 0.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid gas price greater than 0.");
      return;
    }

    const input = buildTripInput(startPlace, destinationPlace, mpg, price);

    setIsLoading(true);

    try {
      const response = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: input.startPlace,
          destination: input.destinationPlace,
        }),
      });

      const payload = (await response.json()) as RouteData | { error?: string };

      if (!response.ok) {
        const message =
          "error" in payload && payload.error
            ? payload.error
            : "Route is unavailable. Check addresses and try again.";
        setError(message);
        return;
      }

      const route = payload as RouteData;
      const tripResult = calculateTrip(input, {
        distanceMiles: route.distanceMiles,
        durationSeconds: route.durationSeconds,
      });

      setResult(tripResult);
      onCalculated?.(input, tripResult, route);
    } catch {
      setError("Route request failed. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section data-testid="trip-planner" className={ui.panel}>
      <h2 className={ui.h2}>Trip Planner</h2>
      <p className={`mt-2 ${ui.body}`}>
        Paste from Apple Maps or Google Maps — full address or ZIP works.
      </p>

      <form
        className="mt-6 flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          void handleCalculate();
        }}
      >
        <label className="block">
          <span className={ui.label}>Start</span>
          <input
            data-testid="input-start-zip"
            type="text"
            autoComplete="street-address"
            placeholder="e.g. 123 Main St, Miami FL or 33301"
            value={startPlace}
            onChange={(event) => setStartPlace(event.target.value)}
            className={ui.input}
          />
        </label>

        <label className="block">
          <span className={ui.label}>Destination</span>
          <input
            data-testid="input-destination-zip"
            type="text"
            autoComplete="street-address"
            placeholder="e.g. 1600 Broadway, Tacoma WA or 98402"
            value={destinationPlace}
            onChange={(event) => setDestinationPlace(event.target.value)}
            className={ui.input}
          />
        </label>

        <label className="block">
          <span className={ui.label}>Vehicle MPG</span>
          <input
            data-testid="input-vehicle-mpg"
            type="number"
            min="1"
            step="0.1"
            placeholder="e.g. 30"
            value={vehicleMpg}
            onChange={(event) => setVehicleMpg(event.target.value)}
            className={ui.input}
          />
        </label>

        <label className="block">
          <span className={ui.label}>Gas Price ($/gal)</span>
          <input
            data-testid="input-gas-price"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 4.00"
            value={gasPrice}
            onChange={(event) => setGasPrice(event.target.value)}
            className={ui.input}
          />
        </label>

        {error ? <ErrorState message={error} testId="trip-planner-error" /> : null}

        {isLoading ? <LoadingState /> : null}

        <button
          data-testid="btn-calculate-trip"
          type="submit"
          disabled={isLoading}
          className={`mt-2 ${ui.btnPrimaryBlock}`}
        >
          Calculate Trip
        </button>
      </form>

      {result ? (
        <div className="mt-8">
          <TripResults result={result} />
        </div>
      ) : null}
    </section>
  );
}
