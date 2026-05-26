"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ErrorState } from "@/components/map/ErrorState";
import { LoadingState } from "@/components/map/LoadingState";
import { ui } from "@/components/ui/theme";
import { requestLocationAccess, supportsGeolocation } from "@/services/location/gpsClient";
import { setStoredPermissionState } from "@/services/preferences/appStorage";
import { estimateVehicle } from "@/services/vehicle/vehicleEstimator";
import { getVehicleProfile, setVehicleProfile } from "@/services/vehicle/vehicleStorage";
import { VehicleForm } from "@/components/vehicle/VehicleForm";
import type { VehicleProfile } from "@/services/vehicle/types";
import { extractUsZip } from "@/services/maps/placeResolver";
import { calculateTrip } from "@/services/trip/calculateTrip";
import { readMapHandoffFromSearch } from "@/services/trip/mapDeepLink";
import type { RouteData } from "@/services/maps/types";
import type { TripInput, TripResult } from "@/services/trip/types";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { TripResults } from "./TripResults";

type TripPlannerProps = {
  initialTrip?: TripInput | null;
  initialResult?: TripResult | null;
  isCollapsed?: boolean;
  activeTripSummary?: {
    startPlace: string;
    destinationPlace: string;
    distanceMiles: number;
  } | null;
  onRequestExpand?: () => void;
  onRequestCollapse?: () => void;
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

function initialFuelValues(initialTrip?: TripInput | null) {
  if (initialTrip?.vehicleMpg && initialTrip.gasPrice) {
    return {
      mpg: String(initialTrip.vehicleMpg),
      gas: String(initialTrip.gasPrice),
    };
  }
  const estimate = estimateVehicle(getVehicleProfile());
  return {
    mpg: String(estimate.highwayMpg),
    gas: String(estimate.suggestedGasPrice || 3.85),
  };
}

export function TripPlanner({
  initialTrip,
  initialResult,
  isCollapsed = false,
  activeTripSummary = null,
  onRequestExpand,
  onRequestCollapse,
  onCalculated,
}: TripPlannerProps) {
  const searchParams = useSearchParams();
  const mapHandoff = readMapHandoffFromSearch(searchParams.toString());
  const fuelDefaults = initialFuelValues(initialTrip);
  const [startPlace, setStartPlace] = useState(
    mapHandoff.start ?? initialTrip?.startPlace ?? "",
  );
  const [destinationPlace, setDestinationPlace] = useState(
    mapHandoff.destination ?? initialTrip?.destinationPlace ?? "",
  );
  const [vehicleProfile, setVehicleProfileState] = useState<VehicleProfile>(() =>
    getVehicleProfile(),
  );
  const [vehicleMpg, setVehicleMpg] = useState(fuelDefaults.mpg);
  const [gasPrice, setGasPrice] = useState(fuelDefaults.gas);
  const [result, setResult] = useState<TripResult | null>(initialResult ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  function applyVehicleFuel(profile: VehicleProfile) {
    const estimate = estimateVehicle(profile);
    setVehicleMpg(String(estimate.combinedMpg));
    setGasPrice(String(estimate.suggestedGasPrice || 3.85));
  }

  async function fillStartFromCurrentLocation() {
    setError(null);
    if (!supportsGeolocation()) {
      setError("GPS is not supported on this browser.");
      return;
    }

    setLocationLoading(true);
    try {
      const access = await requestLocationAccess();
      if (!access.ok) {
        setError(access.message);
        return;
      }

      setStoredPermissionState("granted");
      const response = await fetch(
        `/api/geocode/reverse?lat=${access.sample.latitude}&lng=${access.sample.longitude}`,
      );
      const payload = (await response.json()) as { label?: string; error?: string };
      if (!response.ok || !payload.label) {
        setError(payload.error ?? "Could not resolve your location to an address.");
        return;
      }
      setStartPlace(payload.label);
    } catch {
      setError("Could not get your current location. Try again or type an address.");
    } finally {
      setLocationLoading(false);
    }
  }

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
      setError("Pick your vehicle trim so we have a valid MPG.");
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

  if (isCollapsed && activeTripSummary) {
    return (
      <section data-testid="trip-planner-collapsed" className={ui.panel}>
        <h2 className={ui.h2}>Trip plan</h2>
        <p className={`mt-2 ${ui.value}`} data-testid="trip-planner-summary-route">
          {activeTripSummary.startPlace} → {activeTripSummary.destinationPlace}
        </p>
        <p className={`mt-1 ${ui.body}`} data-testid="trip-planner-summary-distance">
          {activeTripSummary.distanceMiles.toLocaleString()} miles total
        </p>
        <button
          type="button"
          data-testid="btn-expand-trip-planner"
          onClick={onRequestExpand}
          className={`mt-5 ${ui.btnSecondary}`}
        >
          Plan new trip
        </button>
      </section>
    );
  }

  return (
    <section data-testid="trip-planner" className={ui.panel}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={ui.h2}>Plan trip</h2>
          <p className={`mt-1 text-sm ${ui.bodyMuted}`}>Where to · your car · go</p>
        </div>
        {activeTripSummary ? (
          <button
            type="button"
            data-testid="btn-collapse-trip-planner"
            onClick={() => onRequestCollapse?.()}
            className={ui.btnSecondary}
          >
            Back to trip
          </button>
        ) : null}
      </div>

      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleCalculate();
        }}
      >
        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
          <AddressAutocomplete
            label="From"
            testId="input-start-zip"
            placeholder="Start address or ZIP"
            value={startPlace}
            onValueChange={setStartPlace}
            showUseCurrentLocation
            locationLoading={locationLoading}
            onUseCurrentLocation={() => void fillStartFromCurrentLocation()}
          />
          <AddressAutocomplete
            label="To"
            testId="input-destination-zip"
            placeholder="Destination address or ZIP"
            value={destinationPlace}
            onValueChange={setDestinationPlace}
          />
        </div>

        <VehicleForm
          value={vehicleProfile}
          defaultExpanded={false}
          gasPrice={gasPrice}
          showGasPrice
          onGasPriceChange={setGasPrice}
          onChange={(profile) => {
            const next = { ...profile, profileComplete: true };
            setVehicleProfileState(next);
            setVehicleProfile(next);
            applyVehicleFuel(next);
          }}
        />

        <input
          data-testid="input-vehicle-mpg"
          type="text"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          value={vehicleMpg}
          onChange={(e) => setVehicleMpg(e.target.value)}
        />
        <input
          data-testid="input-gas-price"
          type="text"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          value={gasPrice}
          onChange={(e) => setGasPrice(e.target.value)}
        />

        {error ? <ErrorState message={error} testId="trip-planner-error" /> : null}
        {isLoading ? <LoadingState /> : null}

        <button
          data-testid="btn-calculate-trip"
          type="submit"
          disabled={isLoading}
          className={ui.btnPrimaryBlock}
        >
          Calculate trip
        </button>
      </form>

      {result && !isCollapsed ? (
        <div className="mt-6">
          <TripResults result={result} />
        </div>
      ) : null}
    </section>
  );
}
