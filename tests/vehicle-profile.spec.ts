import { expect, test } from "@playwright/test";
import { primeOnboardingComplete } from "./helpers/onboarding";

test.describe("Smart vehicle fuel estimate", () => {
  test.beforeEach(async ({ page }) => {
    await primeOnboardingComplete(page);
    await page.goto("/");
  });

  test("prefills MPG and gas from vehicle profile", async ({ page }) => {
    await expect(page.getByTestId("vehicle-profile-panel")).toBeVisible();
    await expect(page.getByTestId("input-vehicle-mpg")).toHaveValue("28");
    await expect(page.getByTestId("input-gas-price")).toHaveValue("3.85");
  });

  test("updates MPG when vehicle type changes", async ({ page }) => {
    await page.getByTestId("select-vehicle-body").selectOption("suv");
    await page.getByTestId("select-vehicle-fuel").selectOption("hybrid");
    await expect(page.getByTestId("input-vehicle-mpg")).toHaveValue("33");
    await expect(page.getByTestId("vehicle-estimate-summary")).toContainText(/SUV/i);
  });
});
