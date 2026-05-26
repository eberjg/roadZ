import { expect, test } from "@playwright/test";
import { primeOnboardingComplete } from "./helpers/onboarding";

test.describe("roadZ dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await primeOnboardingComplete(page);
  });
  test("shows title and trip planner", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("dashboard-title")).toHaveText("roadZ");
    await expect(page.getByTestId("trip-planner")).toBeVisible();
    await expect(page.getByTestId("vehicle-form")).toBeVisible();
  });
});
