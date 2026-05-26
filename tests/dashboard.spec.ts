import { expect, test } from "@playwright/test";

test.describe("Road Companion dashboard", () => {
  test("shows title and all dashboard cards", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("dashboard-title")).toHaveText("Road Companion");
    await expect(page.getByTestId("route-card")).toBeVisible();
    await expect(page.getByTestId("fuel-card")).toBeVisible();
    await expect(page.getByTestId("stop-card")).toBeVisible();

    await expect(page.getByTestId("trip-planner")).toBeVisible();
    await expect(page.getByTestId("route-card")).toContainText("Route Summary");
    await expect(page.getByTestId("fuel-card")).toContainText("Fuel Intelligence");
    await expect(page.getByTestId("stop-card")).toContainText("Stop Recommendation");
  });
});
