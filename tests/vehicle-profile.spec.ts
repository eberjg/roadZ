import { expect, test } from "@playwright/test";
import { primeOnboardingComplete } from "./helpers/onboarding";

test.describe("Smart vehicle fuel estimate", () => {
  test.beforeEach(async ({ page }) => {
    await primeOnboardingComplete(page);
    await page.goto("/");
  });

  test("prefills MPG and gas from saved vehicle profile", async ({ page }) => {
    await expect(page.getByTestId("vehicle-summary-chip")).toBeVisible();
    await expect(page.getByTestId("input-vehicle-mpg")).toHaveValue("32");
    await expect(page.getByTestId("input-gas-price")).toHaveValue("3.85");
  });

  test("shows MPG estimate card on trip planner", async ({ page }) => {
    await expect(page.getByTestId("mpg-estimate-card")).toBeVisible();
    await expect(page.getByTestId("vehicle-estimate-mpg")).toContainText("32 MPG");
  });
});

test.describe("Vehicle profile wizard", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("rc_onboarding_complete", "true");
      window.localStorage.removeItem("rc_vehicle_profile_v2");
    });
    await page.goto("/");
  });

  test("estimates Lexus NX 300 highway MPG", async ({ page }) => {
    await expect(page.getByTestId("vehicle-profile-wizard")).toBeVisible();
    await page.getByTestId("wizard-vehicle-make").selectOption("Lexus");
    await page.getByTestId("wizard-vehicle-model").selectOption("NX 300");
    await page.getByTestId("wizard-vehicle-year").fill("2021");
    await page.getByTestId("wizard-vehicle-next").click();
    await expect(page.getByTestId("vehicle-estimate-mpg")).toContainText("28 MPG");
    await page.getByTestId("wizard-vehicle-save").click();
    await expect(page.getByTestId("app-dashboard")).toBeVisible();
  });
});
