import { expect, test } from "@playwright/test";
import { primeReturningDriver } from "./helpers/onboarding";

test.describe("Live driving co-pilot", () => {
  test.beforeEach(async ({ page }) => {
    await primeReturningDriver(page);
  });

  test("shows co-pilot banner with progress during active trip", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("input-start-zip").fill("33301");
    await page.getByTestId("input-destination-zip").fill("98402");
    await page.getByTestId("btn-calculate-trip").click();
    await expect(page.getByTestId("fuel-card")).toBeVisible({ timeout: 15_000 });

    await expect(page.getByTestId("driver-copilot-banner")).toBeVisible();
    await expect(page.getByTestId("driver-copilot-progress")).toContainText("mi left");
    await page.getByTestId("trip-progress-slider").fill("100");
    await expect(page.getByTestId("driver-copilot-progress")).toContainText("100");
  });
});
