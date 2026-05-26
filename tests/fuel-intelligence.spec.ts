import { expect, test } from "@playwright/test";
import { primeOnboardingComplete } from "./helpers/onboarding";

async function calculateTrip(
  page: import("@playwright/test").Page,
  options?: { mpg?: string; gasPrice?: string },
) {
  await page.getByTestId("input-start-zip").fill("33301");
  await page.getByTestId("input-destination-zip").fill("98402");
  await page.getByTestId("input-vehicle-mpg").fill(options?.mpg ?? "30");
  await page.getByTestId("input-gas-price").fill(options?.gasPrice ?? "4");
  await page.getByTestId("btn-calculate-trip").click();
  await expect(page.getByTestId("fuel-card")).toBeVisible({ timeout: 15_000 });
}

test.describe("Fuel intelligence and stop planner", () => {
  test.beforeEach(async ({ page }) => {
    await primeOnboardingComplete(page);
  });

  test("shows fuel calculations and stop recommendation", async ({ page }) => {
    await page.goto("/");
    await calculateTrip(page);

    await expect(page.getByTestId("fuel-total-cost")).toContainText("$440.00");
    await expect(page.getByTestId("fuel-range-remaining")).toBeVisible();
    await expect(page.getByTestId("fuel-next-stop")).toBeVisible();
    await expect(page.getByTestId("fuel-stop-distance")).toContainText("280");
    await expect(page.getByTestId("stop-recommendation-name")).toContainText("Sunrise Travel Plaza");
    await expect(page.getByTestId("trip-segments")).toBeVisible();
  });

  test("renders warning states for low MPG and high fuel cost", async ({ page }) => {
    await page.goto("/");
    await calculateTrip(page, { mpg: "15", gasPrice: "5.25" });

    await expect(page.getByTestId("fuel-warnings")).toBeVisible();
    await expect(page.getByTestId("fuel-warning-low_mpg")).toBeVisible();
    await expect(page.getByTestId("fuel-warning-high_fuel_cost")).toBeVisible();
  });

  test("long-trip scenario plans multiple segments and stops", async ({ page }) => {
    await page.goto("/");
    await calculateTrip(page);

    await expect(page.getByTestId("trip-segment-segment-1")).toBeVisible();
    await expect(page.getByTestId("stop-upcoming-list")).toBeVisible();
    await expect(page.getByTestId("fuel-remaining-drive")).toContainText("3,300");
  });

  test("low MPG scenario surfaces fuel range warnings", async ({ page }) => {
    await page.goto("/");
    await calculateTrip(page, { mpg: "12" });

    await expect(page.getByTestId("fuel-warning-low_mpg")).toBeVisible();
    await expect(page.getByTestId("fuel-range-remaining")).toBeVisible();
  });

  test("renders fuel UI on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await calculateTrip(page);

    await expect(page.getByTestId("fuel-card")).toBeVisible();
    await expect(page.getByTestId("stop-card")).toBeVisible();
    await expect(page.getByTestId("fuel-next-stop")).toBeVisible();
  });
});
