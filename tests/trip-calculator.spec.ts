import { expect, test } from "@playwright/test";
import { primeOnboardingComplete } from "./helpers/onboarding";

test.describe("Trip calculator", () => {
  test.beforeEach(async ({ page }) => {
    await primeOnboardingComplete(page);
  });
  test("calculates trip from ZIPs, MPG, and gas price", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("input-start-zip").fill("33301");
    await page.getByTestId("input-destination-zip").fill("98402");
    await page.getByTestId("input-vehicle-mpg").fill("30");
    await page.getByTestId("input-gas-price").fill("4");
    await page.getByTestId("btn-calculate-trip").click();

    await expect(page.getByTestId("result-distance")).toContainText("3,300 miles");
    await expect(page.getByTestId("result-gallons")).toContainText("110 gal");
    await expect(page.getByTestId("result-fuel-cost")).toContainText("$440.00");
    await expect(page.getByTestId("result-drive-time")).toContainText("55 hr");

    await expect(page.getByTestId("route-card")).toContainText("33301 → 98402");
    await expect(page.getByTestId("route-card")).toContainText("3,300 miles");
    await expect(page.getByTestId("fuel-card")).toContainText("$440.00");
  });

  test("renders trip planner on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByTestId("trip-planner")).toBeVisible();
    await expect(page.getByTestId("input-start-zip")).toBeVisible();
    await expect(page.getByTestId("btn-calculate-trip")).toBeVisible();

    await page.getByTestId("input-start-zip").fill("33301");
    await page.getByTestId("input-destination-zip").fill("98402");
    await page.getByTestId("input-vehicle-mpg").fill("30");
    await page.getByTestId("input-gas-price").fill("4");
    await page.getByTestId("btn-calculate-trip").click();

    await expect(page.getByTestId("result-distance")).toBeVisible();
    await expect(page.getByTestId("result-gallons")).toBeVisible();
    await expect(page.getByTestId("result-fuel-cost")).toBeVisible();
    await expect(page.getByTestId("result-drive-time")).toBeVisible();
  });
});
