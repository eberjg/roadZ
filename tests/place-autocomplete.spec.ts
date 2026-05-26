import { expect, test } from "@playwright/test";
import { primeOnboardingComplete } from "./helpers/onboarding";

test.describe("Address autocomplete", () => {
  test.beforeEach(async ({ page }) => {
    await primeOnboardingComplete(page);
    await page.goto("/");
  });

  test("shows address suggestions while typing start", async ({ page }) => {
    await page.getByTestId("input-start-zip").fill("333");
    await expect(page.getByTestId("input-start-zip-suggestions")).toBeVisible({
      timeout: 5_000,
    });
    await page.getByTestId("input-start-zip-suggestion-0").click();
    await expect(page.getByTestId("input-start-zip")).toHaveValue(/33301|Fort Lauderdale/i);
    await expect(page.getByTestId("input-start-zip-suggestions")).toHaveCount(0);
  });

  test("shows address suggestions while typing destination", async ({ page }) => {
    await page.getByTestId("input-destination-zip").fill("tacoma");
    await expect(page.getByTestId("input-destination-zip-suggestions")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByTestId("input-destination-zip-suggestion-0")).toContainText(/Tacoma/i);
  });
});
