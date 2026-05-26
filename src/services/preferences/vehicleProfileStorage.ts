import type { VehicleProfile } from "@/services/fuel/vehicleEstimate";
import { defaultVehicleProfile } from "@/services/fuel/vehicleEstimate";

const PROFILE_KEY = "rc_vehicle_profile";
const STORAGE_EVENT = "rc-vehicle-profile";

let profileCache: VehicleProfile | null | undefined;
let profileCacheRaw: string | null | undefined;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notifyChange(): void {
  if (typeof window === "undefined") {
    return;
  }
  profileCache = undefined;
  profileCacheRaw = undefined;
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function subscribeVehicleProfile(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener(STORAGE_EVENT, onStoreChange);
  return () => window.removeEventListener(STORAGE_EVENT, onStoreChange);
}

function parseProfile(raw: string | null): VehicleProfile {
  if (!raw) {
    return defaultVehicleProfile;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<VehicleProfile>;
    return {
      bodyType: parsed.bodyType ?? defaultVehicleProfile.bodyType,
      fuelType: parsed.fuelType ?? defaultVehicleProfile.fuelType,
      ageBand: parsed.ageBand ?? defaultVehicleProfile.ageBand,
    };
  } catch {
    return defaultVehicleProfile;
  }
}

export function getVehicleProfile(): VehicleProfile {
  if (!canUseStorage()) {
    return defaultVehicleProfile;
  }
  const raw = window.localStorage.getItem(PROFILE_KEY);
  if (profileCache && profileCacheRaw === raw) {
    return profileCache;
  }
  const next = parseProfile(raw);
  profileCache = next;
  profileCacheRaw = raw;
  return next;
}

export function setVehicleProfile(profile: VehicleProfile): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  notifyChange();
}

export function clearVehicleProfile(): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.removeItem(PROFILE_KEY);
  notifyChange();
}
