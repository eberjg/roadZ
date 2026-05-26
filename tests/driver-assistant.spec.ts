import { expect, test } from "@playwright/test";
import { primeReturningDriver } from "./helpers/onboarding";
import { enableManualTripProgress, openCockpitTab, startCockpitTrip } from "./helpers/cockpit";

test.describe("Live driving co-pilot", () => {
  test.beforeEach(async ({ page }) => {
    await primeReturningDriver(page);
  });

  test("shows co-pilot banner with progress during active trip", async ({ page }) => {
    await startCockpitTrip(page);
    await openCockpitTab(page, "mission");

    await expect(page.getByTestId("driver-copilot-banner")).toBeVisible();
    await expect(page.getByTestId("driver-copilot-progress")).toContainText("mi left");
    await enableManualTripProgress(page);
    await page.getByTestId("trip-progress-slider").fill("100");
    await openCockpitTab(page, "mission");
    await expect(page.getByTestId("driver-copilot-progress")).toContainText("100");
  });
});
