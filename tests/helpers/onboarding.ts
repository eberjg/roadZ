import type { Page } from "@playwright/test";

/** Mark onboarding done so regression specs land on the dashboard. */
export async function primeOnboardingComplete(page: Page) {
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
  });
}
