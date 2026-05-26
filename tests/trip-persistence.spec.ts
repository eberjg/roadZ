import { expect, test } from "@playwright/test";
import { primeReturningDriver } from "./helpers/onboarding";

async function calculateSampleTrip(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByTestId("input-start-zip").fill("33301");
  await page.getByTestId("input-destination-zip").fill("98402");
  await page.getByTestId("input-vehicle-mpg").fill("30");
  await page.getByTestId("input-gas-price").fill("4");
  await page.getByTestId("btn-calculate-trip").click();
  await expect(page.getByTestId("fuel-card")).toBeVisible({ timeout: 15_000 });
}

test.describe("Trip session persistence", () => {
  test.beforeEach(async ({ page }) => {
    await primeReturningDriver(page);
  });

  test("restores active trip after reload", async ({ page }) => {
    await calculateSampleTrip(page);
    await expect(page.getByTestId("operational-dashboard")).toBeVisible();
    await page.getByTestId("trip-progress-slider").fill("250");
    await page.waitForFunction(() =>
      Boolean(window.localStorage.getItem("rc_active_trip_session")),
    );

    await page.reload();

    await expect(page.getByTestId("trip-restored-banner")).toBeVisible();
    await expect(page.getByTestId("fuel-card")).toBeVisible();
    await expect(page.getByTestId("trip-planner-summary-route")).toContainText("33301");
    await expect(page.getByTestId("trip-planner-summary-route")).toContainText("98402");
    await expect(page.getByTestId("route-card")).toContainText("98402");
    await expect(page.getByTestId("route-map-you")).toBeVisible();
    await expect(page.getByTestId("route-map-position-label")).toContainText("mi along route");
  });

  test("live dynamic data toggle shows static mode banner", async ({ page }) => {
    await calculateSampleTrip(page);
    await page.getByTestId("toggle-live-data").uncheck();
    await expect(page.getByTestId("static-mode-banner")).toBeVisible();
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
