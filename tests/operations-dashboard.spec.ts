import { expect, test } from "@playwright/test";

async function startTrip(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByTestId("input-start-zip").fill("33301");
  await page.getByTestId("input-destination-zip").fill("98402");
  await page.getByTestId("input-vehicle-mpg").fill("30");
  await page.getByTestId("input-gas-price").fill("4");
  await page.getByTestId("btn-calculate-trip").click();
  await expect(page.getByTestId("operational-dashboard")).toBeVisible({ timeout: 15_000 });
}

test.describe("Operational dashboard", () => {
  test("renders operational dashboard with progress", async ({ page }) => {
    await startTrip(page);

    await expect(page.getByTestId("trip-progress")).toBeVisible();
    await expect(page.getByTestId("trip-completion-percent")).toContainText("0%");
    await expect(page.getByTestId("trip-remaining-distance")).toContainText("3,300");
    await expect(page.getByTestId("operational-status")).toContainText("NORMAL");
  });

  test("updates progress calculations when slider moves", async ({ page }) => {
    await startTrip(page);

    await page.getByTestId("trip-progress-slider").fill("660");
    await expect(page.getByTestId("trip-completion-percent")).toContainText("20%");
    await expect(page.getByTestId("trip-session-duration")).toContainText("11 hr");
  });

  test("shows fatigue warnings on long driving session", async ({ page }) => {
    await startTrip(page);

    await page.getByTestId("trip-progress-slider").fill("1500");
    await expect(page.getByTestId("driver-status-level")).toContainText("CRITICAL");
    await expect(page.getByTestId("operational-alert-dangerous_fatigue")).toBeVisible();
  });

  test("renders trip timeline with stops and arrival", async ({ page }) => {
    await startTrip(page);

    await expect(page.getByTestId("trip-timeline")).toBeVisible();
    await expect(page.getByTestId("timeline-event-timeline-start")).toBeVisible();
    await expect(page.getByTestId("timeline-event-timeline-arrival")).toBeVisible();
    await expect(page.getByTestId("timeline-event-timeline-sleep")).toBeVisible();
  });

  test("renders operational alerts section", async ({ page }) => {
    await startTrip(page);
    await page.getByTestId("trip-progress-slider").fill("400");

    await expect(page.getByTestId("operational-alerts")).toBeVisible();
  });

  test("long-haul scenario shows multiple timeline stops", async ({ page }) => {
    await startTrip(page);
    await page.getByTestId("trip-progress-slider").fill("1500");

    await expect(page.getByTestId("timeline-event-timeline-stop-1")).toHaveClass(/emerald/);
    await expect(page.getByTestId("trip-remaining-distance")).toContainText("1,800");
  });

  test("renders operational UI on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await startTrip(page);

    await expect(page.getByTestId("operational-dashboard")).toBeVisible();
    await expect(page.getByTestId("driver-status")).toBeVisible();
    await expect(page.getByTestId("trip-timeline")).toBeVisible();
  });
});
