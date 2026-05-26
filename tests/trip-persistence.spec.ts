import { expect, test } from "@playwright/test";
import { primeReturningDriver } from "./helpers/onboarding";
import { enableManualTripProgress, openCockpitTab, startCockpitTrip } from "./helpers/cockpit";

async function calculateSampleTrip(page: import("@playwright/test").Page) {
  await startCockpitTrip(page);
}

test.describe("Trip session persistence", () => {
  test.beforeEach(async ({ page }) => {
    await primeReturningDriver(page);
  });

  test("restores active trip after reload", async ({ page }) => {
    await calculateSampleTrip(page);
    await enableManualTripProgress(page);
    await page.getByTestId("trip-progress-slider").fill("250");
    await page.waitForFunction(() =>
      Boolean(window.localStorage.getItem("rc_active_trip_session")),
    );

    await page.reload();

    await expect(page.getByTestId("cockpit-layout")).toBeVisible();
    await expect(page.getByTestId("trip-restored-banner")).toBeVisible();
    await expect(page.getByTestId("cockpit-trip-route")).toContainText("98402");
    await expect(page.getByTestId("route-map-you")).toBeVisible();
    await expect(page.getByTestId("route-map-position-label")).toContainText("mi along route");
  });

  test("live dynamic data toggle shows static mode banner", async ({ page }) => {
    await calculateSampleTrip(page);
    await page.getByTestId("toggle-live-data").uncheck();
    await expect(page.getByTestId("static-mode-banner")).toBeVisible();
    await openCockpitTab(page, "gps");
    await expect(page.getByTestId("tracker-static-mode")).toBeVisible();
  });

  test("start new trip clears restored session", async ({ page }) => {
    await calculateSampleTrip(page);
    await page.waitForFunction(() =>
      Boolean(window.localStorage.getItem("rc_active_trip_session")),
    );
    await page.reload();
    await expect(page.getByTestId("trip-restored-banner")).toBeVisible();

    await page.getByTestId("btn-start-new-trip").click();
    await expect(page.getByTestId("trip-restored-banner")).toHaveCount(0);
    await expect(page.getByTestId("operational-dashboard")).toContainText(
      "Calculate a trip",
    );
  });
});
