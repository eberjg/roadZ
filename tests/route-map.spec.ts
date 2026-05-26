import { expect, test } from "@playwright/test";
import { primeOnboardingComplete } from "./helpers/onboarding";
import { enableManualTripProgress, startCockpitTrip } from "./helpers/cockpit";
import { setTripFuelInputs } from "./helpers/tripFuel";

async function calculateSampleTrip(page: import("@playwright/test").Page) {
  await startCockpitTrip(page);
}

test.describe("Route map and live routing", () => {
  test.beforeEach(async ({ page }) => {
    await primeOnboardingComplete(page);
  });

  test("calculates route with distance and ETA visible", async ({ page }) => {
    await page.goto("/");
    await calculateSampleTrip(page);

    await expect(page.getByTestId("cockpit-trip-progress")).toContainText("3,300");
    await expect(page.getByTestId("hud-eta")).toContainText("55 hr");
  });

  test("renders route map with start and destination markers area", async ({ page }) => {
    await page.goto("/");
    await calculateSampleTrip(page);

    await expect(page.getByTestId("route-map")).toBeVisible();
    await expect(page.getByTestId("route-map-start")).toBeVisible();
    await expect(page.getByTestId("route-map-end")).toBeVisible();
    await expect(page.getByTestId("route-map-you")).toBeVisible();
  });

  test("shows you marker along route when progress moves", async ({ page }) => {
    await page.goto("/");
    await calculateSampleTrip(page);

    await enableManualTripProgress(page);
    const slider = page.getByTestId("trip-progress-slider");
    await slider.fill("500");
    await expect(page.getByTestId("route-map-position-label")).toContainText("500 mi along route");
    await expect(page.getByTestId("route-map-you")).toBeVisible();
  });

  test("shows loading state while route is calculated", async ({ page }) => {
    await page.route("**/api/route", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.continue();
    });

    await page.goto("/");
    await page.getByTestId("input-start-zip").fill("33301");
    await page.getByTestId("input-destination-zip").fill("98402");
    await setTripFuelInputs(page, { mpg: "30", gasPrice: "4" });
    await page.getByTestId("btn-calculate-trip").click();

    await expect(page.getByTestId("route-loading")).toBeVisible();
    await expect(page.getByTestId("cockpit-layout")).toBeVisible({ timeout: 15_000 });
  });

  test("shows error when start or destination is missing", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("input-start-zip").fill("");
    await page.getByTestId("input-destination-zip").fill("98402");
    await setTripFuelInputs(page, { mpg: "30", gasPrice: "4" });
    await page.getByTestId("btn-calculate-trip").click();

    await expect(page.getByTestId("trip-planner-error")).toContainText("start and destination");
  });

  test("renders route UI on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await calculateSampleTrip(page);

    await expect(page.getByTestId("route-map")).toBeVisible();
    await expect(page.getByTestId("hud-eta")).toBeVisible();
    await expect(page.getByTestId("cockpit-trip-progress")).toBeVisible();
  });
});
