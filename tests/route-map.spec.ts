import { expect, test } from "@playwright/test";

async function calculateSampleTrip(page: import("@playwright/test").Page) {
  await page.getByTestId("input-start-zip").fill("33301");
  await page.getByTestId("input-destination-zip").fill("98402");
  await page.getByTestId("input-vehicle-mpg").fill("30");
  await page.getByTestId("input-gas-price").fill("4");
  await page.getByTestId("btn-calculate-trip").click();
}

test.describe("Route map and live routing", () => {
  test("calculates route with distance and ETA visible", async ({ page }) => {
    await page.goto("/");
    await calculateSampleTrip(page);

    await expect(page.getByTestId("route-summary-distance")).toContainText("3,300");
    await expect(page.getByTestId("route-summary-eta")).toContainText("55 hr");
    await expect(page.getByTestId("result-distance")).toContainText("3,300 miles");
  });

  test("renders route map with start and destination markers area", async ({ page }) => {
    await page.goto("/");
    await calculateSampleTrip(page);

    await expect(page.getByTestId("route-map")).toBeVisible();
    await expect(page.getByTestId("route-map-start")).toBeVisible();
    await expect(page.getByTestId("route-map-end")).toBeVisible();
  });

  test("shows loading state while route is calculated", async ({ page }) => {
    await page.route("**/api/route", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.continue();
    });

    await page.goto("/");
    await page.getByTestId("input-start-zip").fill("33301");
    await page.getByTestId("input-destination-zip").fill("98402");
    await page.getByTestId("input-vehicle-mpg").fill("30");
    await page.getByTestId("input-gas-price").fill("4");
    await page.getByTestId("btn-calculate-trip").click();

    await expect(page.getByTestId("route-loading")).toBeVisible();
    await expect(page.getByTestId("route-summary")).toBeVisible({ timeout: 15_000 });
  });

  test("shows error for invalid ZIP codes", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("input-start-zip").fill("abc");
    await page.getByTestId("input-destination-zip").fill("98402");
    await page.getByTestId("input-vehicle-mpg").fill("30");
    await page.getByTestId("input-gas-price").fill("4");
    await page.getByTestId("btn-calculate-trip").click();

    await expect(page.getByTestId("trip-planner-error")).toContainText("valid 5-digit");
  });

  test("renders route UI on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await calculateSampleTrip(page);

    await expect(page.getByTestId("route-map")).toBeVisible();
    await expect(page.getByTestId("route-summary-eta")).toBeVisible();
    await expect(page.getByTestId("route-summary-distance")).toBeVisible();
  });
});
