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

  test("estimates Lexus NX 300 highway MPG from EPA trim", async ({ page }) => {
    await expect(page.getByTestId("vehicle-profile-wizard")).toBeVisible();
    await page.getByTestId("wizard-vehicle-make").selectOption("Lexus");
    await page.getByTestId("wizard-vehicle-model").selectOption("NX 300");
    await page.getByTestId("wizard-vehicle-year").selectOption("2021");
    await expect(page.getByTestId("wizard-vehicle-trim")).not.toHaveValue("", { timeout: 10_000 });
    await page.getByTestId("wizard-vehicle-next").click();
    await expect(page.getByTestId("vehicle-estimate-mpg")).toContainText("28 MPG");
    await page.getByTestId("wizard-vehicle-save").click();
    await expect(page.getByTestId("app-dashboard")).toBeVisible();
  });

  test("catalog returns full EPA make list", async ({ request }) => {
    const response = await request.get("/api/vehicles/catalog?step=makes");
    const payload = (await response.json()) as { makes: string[]; makeCount: number };
    expect(payload.makeCount).toBeGreaterThan(100);
    expect(payload.makes).toContain("Toyota");
    expect(payload.makes).toContain("Lexus");
    expect(payload.makes).toContain("Ford");
  });

  test("trip planner shows vehicle selector with EPA catalog", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("rc_onboarding_complete", "true");
      window.localStorage.setItem(
        "rc_vehicle_profile_v2",
        JSON.stringify({
          make: "Toyota",
          model: "Camry",
          year: 2018,
          fuelType: "gas",
          profileComplete: true,
        }),
      );
    });
    await page.goto("/");
    await expect(page.getByTestId("vehicle-selector")).toBeVisible();
    await expect(page.getByTestId("wizard-vehicle-trim")).toBeVisible();
  });
});
