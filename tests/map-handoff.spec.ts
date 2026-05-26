import { expect, test } from "@playwright/test";
import { primeOnboardingComplete } from "./helpers/onboarding";

test.describe("Map app handoff", () => {
  test.beforeEach(async ({ page }) => {
    await primeOnboardingComplete(page);
  });

  test("prefills start and destination from URL params", async ({ page }) => {
    const from = encodeURIComponent("33301 Fort Lauderdale FL");
    const to = encodeURIComponent("98402 Tacoma WA");
    await page.goto(`/?from=${from}&to=${to}`);

    await expect(page.getByTestId("input-start-zip")).toHaveValue("33301 Fort Lauderdale FL");
    await expect(page.getByTestId("input-destination-zip")).toHaveValue("98402 Tacoma WA");
  });
});
