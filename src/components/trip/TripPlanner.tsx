"use client";

import { useState } from "react";
import { ErrorState } from "@/components/map/ErrorState";
import { LoadingState } from "@/components/map/LoadingState";
import { calculateTrip } from "@/services/trip/calculateTrip";
import type { RouteData } from "@/services/maps/types";
import type { TripInput, TripResult } from "@/services/trip/types";
import { TripResults } from "./TripResults";

type TripPlannerProps = {
  onCalculated?: (input: TripInput, result: TripResult, route: RouteData) => void;
};

const inputClassName =
  "mt-2 w-full rounded-xl border-2 border-zinc-900 bg-white px-4 py-4 text-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-300";

export function TripPlanner({ onCalculated }: TripPlannerProps) {
  const [startZip, setStartZip] = useState("");
  const [destinationZip, setDestinationZip] = useState("");
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

    if (!startZip.trim() || !destinationZip.trim()) {
      setError("Enter both ZIP codes.");
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

    const input: TripInput = {
      startZip: startZip.trim(),
      destinationZip: destinationZip.trim(),
      vehicleMpg: mpg,
      gasPrice: price,
    };

    setIsLoading(true);

    try {
      const response = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startZip: input.startZip,
          destinationZip: input.destinationZip,
        }),
      });

      const payload = (await response.json()) as RouteData | { error?: string };

      if (!response.ok) {
        const message =
          "error" in payload && payload.error
            ? payload.error
            : "Route is unavailable. Check ZIP codes and try again.";
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
    <section
      data-testid="trip-planner"
      className="rounded-2xl border-2 border-zinc-900 bg-white p-6 shadow-sm"
    >
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
        Trip Planner
      </h2>
      <p className="mt-2 text-lg text-zinc-700">
        Enter your trip details to calculate live route estimates
      </p>

      <form
        className="mt-6 flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          void handleCalculate();
        }}
      >
        <label className="block">
          <span className="text-lg font-semibold text-zinc-900">Start ZIP</span>
          <input
            data-testid="input-start-zip"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="e.g. 33301"
            value={startZip}
            onChange={(event) => setStartZip(event.target.value)}
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className="text-lg font-semibold text-zinc-900">Destination ZIP</span>
          <input
            data-testid="input-destination-zip"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="e.g. 98402"
            value={destinationZip}
            onChange={(event) => setDestinationZip(event.target.value)}
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className="text-lg font-semibold text-zinc-900">Vehicle MPG</span>
          <input
            data-testid="input-vehicle-mpg"
            type="number"
            min="1"
            step="0.1"
            placeholder="e.g. 30"
            value={vehicleMpg}
            onChange={(event) => setVehicleMpg(event.target.value)}
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className="text-lg font-semibold text-zinc-900">Gas Price ($/gal)</span>
          <input
            data-testid="input-gas-price"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 4.00"
            value={gasPrice}
            onChange={(event) => setGasPrice(event.target.value)}
            className={inputClassName}
          />
        </label>

        {error ? (
          <ErrorState message={error} testId="trip-planner-error" />
        ) : null}

        {isLoading ? <LoadingState /> : null}

        <button
          data-testid="btn-calculate-trip"
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-xl bg-zinc-900 px-6 py-5 text-xl font-bold text-white transition-colors hover:bg-zinc-700 active:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
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
