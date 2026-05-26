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

test.describe("Trip planner collapse", () => {
  test.beforeEach(async ({ page }) => {
    await primeReturningDriver(page);
  });

  test("collapses planner after trip is calculated", async ({ page }) => {
    await calculateSampleTrip(page);

    await expect(page.getByTestId("trip-planner-collapsed")).toBeVisible();
    await expect(page.getByTestId("trip-planner")).toHaveCount(0);
    await expect(page.getByTestId("trip-planner-summary-route")).toContainText("98402");
  });

  test("live tracker shows active trip route when planner is collapsed", async ({ page }) => {
    await calculateSampleTrip(page);

    await expect(page.getByTestId("tracker-active-trip")).toBeVisible();
    await expect(page.getByTestId("tracker-trip-route")).toContainText("98402");
  });

  test("expands planner for a new trip plan", async ({ page }) => {
    await calculateSampleTrip(page);
    await page.getByTestId("btn-expand-trip-planner").click();

    await expect(page.getByTestId("trip-planner")).toBeVisible();
    await expect(page.getByTestId("btn-collapse-trip-planner")).toBeVisible();
  });

  test("back to trip collapses planner again", async ({ page }) => {
    await calculateSampleTrip(page);
    await page.getByTestId("btn-expand-trip-planner").click();
    await page.getByTestId("btn-collapse-trip-planner").click();

    await expect(page.getByTestId("trip-planner-collapsed")).toBeVisible();
  });
});
