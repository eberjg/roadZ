import { expect, test } from "@playwright/test";
import { primeReturningDriver } from "./helpers/onboarding";
import { openCockpitTab, startCockpitTrip } from "./helpers/cockpit";

async function calculateSampleTrip(page: import("@playwright/test").Page) {
  await startCockpitTrip(page);
}

test.describe("Trip planner collapse", () => {
  test.beforeEach(async ({ page }) => {
    await primeReturningDriver(page);
  });

  test("collapses planner after trip is calculated", async ({ page }) => {
    await calculateSampleTrip(page);

    await expect(page.getByTestId("cockpit-layout")).toBeVisible();
    await expect(page.getByTestId("trip-planner")).toHaveCount(0);
    await expect(page.getByTestId("cockpit-trip-route")).toContainText("98402");
  });

  test("live tracker shows active trip route when planner is collapsed", async ({ page }) => {
    await calculateSampleTrip(page);
    await openCockpitTab(page, "gps");

    await expect(page.getByTestId("tracker-active-trip")).toBeVisible();
    await expect(page.getByTestId("tracker-trip-route")).toContainText("98402");
  });

  test("expands planner for a new trip plan", async ({ page }) => {
    await calculateSampleTrip(page);
    await page.getByTestId("cockpit-open-planner").click();

    await expect(page.getByTestId("trip-planner")).toBeVisible();
    await expect(page.getByTestId("btn-collapse-trip-planner")).toBeVisible();
  });

  test("back to trip collapses planner again", async ({ page }) => {
    await calculateSampleTrip(page);
    await page.getByTestId("cockpit-open-planner").click();
    await page.getByTestId("btn-collapse-trip-planner").click();

    await expect(page.getByTestId("cockpit-layout")).toBeVisible();
  });
});
