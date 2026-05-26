import type { GPSPermissionState } from "@/services/location/types";

import { clearTripSession } from "./tripSessionStorage";

const KEYS = {
  onboardingComplete: "rc_onboarding_complete",
  permissionState: "rc_permission_state",
  preferences: "rc_dashboard_preferences",
} as const;

export type DashboardPreferences = {
  reducedMotion: boolean;
  immersiveLayout: boolean;
  /** When true: live GPS, weather refresh, auto progress. When false: static trip snapshot. */
  showLiveData: boolean;
};

export type StoredPermissionState = GPSPermissionState | "skipped";

export const defaultDashboardPreferences: DashboardPreferences = {
  reducedMotion: false,
  immersiveLayout: true,
  showLiveData: true,
};

const STORAGE_EVENT = "rc-app-storage";

let preferencesCache: DashboardPreferences | null = null;
let preferencesCacheKey: string | null | undefined;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function invalidatePreferencesCache(): void {
  preferencesCache = null;
  preferencesCacheKey = undefined;
}

function notifyStorageChange(): void {
  if (typeof window === "undefined") {
    return;
  }
  invalidatePreferencesCache();
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function parseDashboardPreferences(raw: string | null): DashboardPreferences {
  if (!raw) {
    return defaultDashboardPreferences;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<DashboardPreferences>;
    return {
      reducedMotion: parsed.reducedMotion ?? defaultDashboardPreferences.reducedMotion,
      immersiveLayout: parsed.immersiveLayout ?? defaultDashboardPreferences.immersiveLayout,
      showLiveData: parsed.showLiveData ?? defaultDashboardPreferences.showLiveData,
    };
  } catch {
    return defaultDashboardPreferences;
  }
}

export function subscribeAppStorage(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener(STORAGE_EVENT, onStoreChange);
  return () => window.removeEventListener(STORAGE_EVENT, onStoreChange);
}

export function isOnboardingComplete(): boolean {
  if (!canUseStorage()) {
    return false;
  }
  return window.localStorage.getItem(KEYS.onboardingComplete) === "true";
}

export function setOnboardingComplete(complete: boolean): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(KEYS.onboardingComplete, complete ? "true" : "false");
  notifyStorageChange();
}

export function getStoredPermissionState(): StoredPermissionState | null {
  if (!canUseStorage()) {
    return null;
  }
  const raw = window.localStorage.getItem(KEYS.permissionState);
  if (
    raw === "granted" ||
    raw === "denied" ||
    raw === "prompt" ||
    raw === "unknown" ||
    raw === "unsupported" ||
    raw === "skipped"
  ) {
    return raw;
  }
  return null;
}

export function setStoredPermissionState(state: StoredPermissionState): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(KEYS.permissionState, state);
  notifyStorageChange();
}

export function getDashboardPreferences(): DashboardPreferences {
  if (!canUseStorage()) {
    return defaultDashboardPreferences;
  }
  const raw = window.localStorage.getItem(KEYS.preferences);
  if (preferencesCache && preferencesCacheKey === raw) {
    return preferencesCache;
  }
  const next = parseDashboardPreferences(raw);
  preferencesCache = next;
  preferencesCacheKey = raw;
  return next;
}

export function setDashboardPreferences(preferences: DashboardPreferences): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(KEYS.preferences, JSON.stringify(preferences));
  notifyStorageChange();
}

/** Test helper — reset all persisted app state. */
export function clearAppStorage(): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.removeItem(KEYS.onboardingComplete);
  window.localStorage.removeItem(KEYS.permissionState);
  window.localStorage.removeItem(KEYS.preferences);
  clearTripSession();
  notifyStorageChange();
}

export function updateDashboardPreferences(
  patch: Partial<DashboardPreferences>,
): DashboardPreferences {
  const next = { ...getDashboardPreferences(), ...patch };
  setDashboardPreferences(next);
  return next;
}
