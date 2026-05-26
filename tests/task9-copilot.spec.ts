import { expect, test } from "@playwright/test";
import { primeReturningDriver } from "./helpers/onboarding";
import { enableManualTripProgress, openCockpitTab, startCockpitTrip } from "./helpers/cockpit";

test.describe("Task 9 — deployment and continuity", () => {
  test("health endpoint reports deployment diagnostics", async ({ request }) => {
    const response = await request.get("/api/health");
    const payload = (await response.json()) as {
      status: string;
      diagnostics: { routeForceFallback: boolean };
    };
    expect(payload.status).toMatch(/ok|degraded/);
    expect(payload.diagnostics).toBeTruthy();
  });

  test("reload restores vehicle profile and trip session", async ({ page }) => {
    await primeReturningDriver(page);
    await startCockpitTrip(page);
    await enableManualTripProgress(page);
    await page.getByTestId("trip-progress-slider").fill("120");
    await page.waitForFunction(() =>
      Boolean(window.localStorage.getItem("rc_active_trip_session")),
    );

    await page.reload();

    await expect(page.getByTestId("cockpit-layout")).toBeVisible();
    await expect(page.getByTestId("trip-restored-banner")).toBeVisible();
    await openCockpitTab(page, "mission");
    await expect(page.getByTestId("driver-copilot-banner")).toBeVisible();
    await expect(page.getByTestId("driver-copilot-progress")).toContainText("120");
  });
});
