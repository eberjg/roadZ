import { expect, test } from "@playwright/test";
import { primeOnboardingComplete } from "./helpers/onboarding";

async function startTrip(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByTestId("input-start-zip").fill("33301");
  await page.getByTestId("input-destination-zip").fill("98402");
  await page.getByTestId("input-vehicle-mpg").fill("30");
  await page.getByTestId("input-gas-price").fill("4");
  await page.getByTestId("btn-calculate-trip").click();
  await expect(page.getByTestId("weather-panel")).toBeVisible({ timeout: 15_000 });
}

test.describe("Weather intelligence", () => {
  test.beforeEach(async ({ page }) => {
    await primeOnboardingComplete(page);
  });

  test("renders weather panel with current conditions", async ({ page }) => {
    await startTrip(page);

    await expect(page.getByTestId("weather-panel")).toBeVisible();
    await expect(page.getByTestId("weather-current")).toBeVisible();
    await expect(page.getByTestId("weather-temperature")).toBeVisible();
    await expect(page.getByTestId("environmental-summary")).toBeVisible();
  });

  test("shows risk score and updates with progress", async ({ page }) => {
    await startTrip(page);

    await expect(page.getByTestId("risk-score")).toBeVisible();
    const initialScore = await page.getByTestId("risk-score").textContent();

    await page.getByTestId("trip-progress-slider").fill("900");
    await expect(page.getByTestId("risk-score")).not.toHaveText(initialScore ?? "");
    await expect(page.getByTestId("risk-panel")).toBeVisible();
  });

  test("renders severe alerts in storm zone", async ({ page }) => {
    await startTrip(page);

    await page.getByTestId("trip-progress-slider").fill("800");
    await expect(page.getByTestId("severe-alerts")).toBeVisible();
    await expect(page.getByTestId("severe-alert-thunderstorm")).toBeVisible();
  });

  test("renders weather timeline with upcoming zones", async ({ page }) => {
    await startTrip(page);

    await expect(page.getByTestId("weather-timeline")).toBeVisible();
    await expect(page.getByTestId("weather-timeline-weather-now")).toBeVisible();
    await expect(page.getByTestId("weather-timeline-weather-zone-tn")).toBeVisible();
  });

  test("combined fatigue and weather elevates risk", async ({ page }) => {
    await startTrip(page);

    await page.getByTestId("trip-progress-slider").fill("1500");
    await expect(page.getByTestId("driver-status-level")).toContainText("CRITICAL");
    await expect(page.getByTestId("risk-combined-fatigue")).toContainText(/fatigue|weather|risk/i);
    const scoreText = await page.getByTestId("risk-score").textContent();
    const score = Number.parseInt(scoreText?.split("/")[0]?.trim() ?? "0", 10);
    expect(score).toBeGreaterThan(40);
  });

  test("renders weather UI on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await startTrip(page);

    await expect(page.getByTestId("weather-panel")).toBeVisible();
    await expect(page.getByTestId("risk-panel")).toBeVisible();
    await expect(page.getByTestId("weather-timeline")).toBeVisible();
  });
});
