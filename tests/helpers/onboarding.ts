import type { Page } from "@playwright/test";

/** Mark onboarding done so regression specs land on the dashboard. */
export async function primeOnboardingComplete(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("rc_onboarding_complete", "true");
  });
}

/** Return visit with GPS already allowed (matches post-onboarding production). */
export async function primeReturningDriver(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("rc_onboarding_complete", "true");
    window.localStorage.setItem("rc_permission_state", "granted");
  });
}

/** First-visit onboarding tests — clear persisted app state. */
export async function resetOnboardingState(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.removeItem("rc_onboarding_complete");
    window.localStorage.removeItem("rc_permission_state");
    window.localStorage.removeItem("rc_dashboard_preferences");
    window.localStorage.removeItem("rc_active_trip_session");
  });
}

/** Persist dashboard preference for live updates in tests. */
export async function setShowLiveDataPreference(page: Page, enabled: boolean) {
  await page.addInitScript((value) => {
    const raw = window.localStorage.getItem("rc_dashboard_preferences");
    const base = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    window.localStorage.setItem(
      "rc_dashboard_preferences",
      JSON.stringify({ ...base, showLiveData: value }),
    );
  }, enabled);
}
