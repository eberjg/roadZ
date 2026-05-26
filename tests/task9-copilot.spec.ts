import { expect, test } from "@playwright/test";
import { primeReturningDriver } from "./helpers/onboarding";

test.describe("Task 9 — deployment and continuity", () => {
  test("health endpoint reports deployment diagnostics", async ({ request }) => {
    const response = await request.get("/api/health");
    const payload = (await response.json()) as {
      status: string;
      diagnostics: { routeForceFallback: boolean };
    };
    expect(payload.status).toMatch(/ok|degraded/);
    expect(payload.diagnostics).toBeTruthy();
  });

  test("reload restores vehicle profile and trip session", async ({ page }) => {
    await primeReturningDriver(page);
    await page.goto("/");
    await page.getByTestId("input-start-zip").fill("33301");
    await page.getByTestId("input-destination-zip").fill("98402");
    await page.getByTestId("btn-calculate-trip").click();
    await expect(page.getByTestId("fuel-card")).toBeVisible({ timeout: 15_000 });
    await page.getByTestId("trip-progress-slider").fill("120");
    await page.waitForFunction(() =>
      Boolean(window.localStorage.getItem("rc_active_trip_session")),
    );

    await page.reload();

    await expect(page.getByTestId("vehicle-summary-chip")).toContainText("Camry");
    await expect(page.getByTestId("trip-restored-banner")).toBeVisible();
    await expect(page.getByTestId("driver-copilot-banner")).toBeVisible();
    await expect(page.getByTestId("driver-copilot-progress")).toContainText("120");
  });
});
