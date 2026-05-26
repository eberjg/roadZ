import { expect, test } from "@playwright/test";
import { primeOnboardingComplete } from "./helpers/onboarding";
import { openCockpitTab, startCockpitTrip } from "./helpers/cockpit";

test.describe("Trip calculator", () => {
  test.beforeEach(async ({ page }) => {
    await primeOnboardingComplete(page);
  });
  test("calculates trip from ZIPs, MPG, and gas price", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("input-vehicle-mpg").fill("30");
    await page.getByTestId("input-gas-price").fill("4");
    await page.getByTestId("input-start-zip").fill("33301");
    await page.getByTestId("input-destination-zip").fill("98402");
    await page.getByTestId("btn-calculate-trip").click();
    await page.getByTestId("cockpit-layout").waitFor({ state: "visible", timeout: 15_000 });

    await expect(page.getByTestId("cockpit-layout")).toBeVisible();
    await expect(page.getByTestId("cockpit-trip-progress")).toContainText("3,300");
    await expect(page.getByTestId("cockpit-trip-route")).toContainText("98402");
    await openCockpitTab(page, "fuel");
    await expect(page.getByTestId("fuel-total-cost")).toContainText("$440.00");
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
    await startCockpitTrip(page);

    await expect(page.getByTestId("cockpit-layout")).toBeVisible();
    await expect(page.getByTestId("route-map")).toBeVisible();
  });
});
