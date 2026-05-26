import { expect, test } from "@playwright/test";
import { primeOnboardingComplete } from "./helpers/onboarding";
import { enableLiveGps } from "./helpers/gps";

import { startCockpitTrip } from "./helpers/cockpit";

async function startTrip(page: import("@playwright/test").Page) {
  await startCockpitTrip(page);
}

test.describe("Task 10 — Cockpit UX", () => {
  test.beforeEach(async ({ page }) => {
    await primeOnboardingComplete(page);
  });

  test("renders map-first cockpit layout after trip calculate", async ({ page }) => {
    await startTrip(page);
    await expect(page.getByTestId("cockpit-layout")).toBeVisible();
    await expect(page.getByTestId("cockpit-map-stage")).toBeVisible();
    await expect(page.getByTestId("route-map")).toHaveAttribute("data-variant", "immersive");
    await expect(page.getByTestId("cockpit-trip-strip")).toBeVisible();
    await expect(page.getByTestId("cockpit-bottom-sheet")).toBeVisible();
  });

  test("shows operational HUD overlays", async ({ page }) => {
    await startTrip(page);
    await expect(page.getByTestId("operational-hud")).toBeVisible();
    await expect(page.getByTestId("hud-top-panel")).toBeVisible();
    await expect(page.getByTestId("hud-bottom-panel")).toBeVisible();
    await expect(page.getByTestId("hud-efficiency-score")).toBeVisible();
    await expect(page.getByTestId("hud-live-mpg")).toBeVisible();
  });

  test("mobile viewport keeps map-first cockpit", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await startTrip(page);
    const mapStage = page.getByTestId("cockpit-map-stage");
    const box = await mapStage.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThan(200);
    }
    await expect(page.getByTestId("cockpit-bottom-sheet")).toBeVisible();
  });

  test("bottom sheet expands and shows vehicle intelligence", async ({ page }) => {
    await startTrip(page);
    await page.getByTestId("cockpit-sheet-toggle").click();
    await page.getByTestId("cockpit-tab-mission").click();
    await expect(page.getByTestId("vehicle-intelligence-panel")).toBeVisible();
    await expect(page.getByTestId("live-effective-mpg")).toBeVisible();
    await expect(page.getByTestId("live-efficiency-score")).toBeVisible();
  });

  test("dynamic MPG appears in HUD", async ({ page }) => {
    await startTrip(page);
    const mpgText = await page.getByTestId("hud-live-mpg").textContent();
    expect(mpgText?.trim().length).toBeGreaterThan(0);
    const scoreText = await page.getByTestId("hud-efficiency-score").textContent();
    expect(Number(scoreText)).toBeGreaterThan(0);
  });

  test("GPS tab and recovery from stale denied storage", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("rc_permission_state", "denied");
    });
    await page.addInitScript(() => {
      const geolocationMock: Geolocation = {
        clearWatch: () => {},
        getCurrentPosition: (success: PositionCallback) => {
          success({
            coords: {
              latitude: 26.12,
              longitude: -80.14,
              accuracy: 12,
              speed: 0,
              heading: 0,
              altitude: null,
              altitudeAccuracy: null,
            },
            timestamp: Date.now(),
          } as GeolocationPosition);
        },
        watchPosition: (success: PositionCallback) => {
          success({
            coords: {
              latitude: 26.12,
              longitude: -80.14,
              accuracy: 12,
              speed: 0,
              heading: 0,
              altitude: null,
              altitudeAccuracy: null,
            },
            timestamp: Date.now(),
          } as GeolocationPosition);
          return 1;
        },
      };
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: geolocationMock,
      });
    });
    await startTrip(page);
    await page.getByTestId("cockpit-tab-gps").click();
    await page.getByTestId("cockpit-sheet-toggle").click();
    await enableLiveGps(page);
    await expect(page.getByTestId("gps-permission")).toContainText("granted");
  });

  test("ops tab shows operational dashboard regression", async ({ page }) => {
    await startTrip(page);
    await page.getByTestId("cockpit-tab-ops").click();
    await page.getByTestId("cockpit-sheet-toggle").click();
    await expect(page.getByTestId("operational-dashboard")).toBeVisible();
    await expect(page.getByTestId("environmental-dashboard")).toBeVisible();
  });

  test("idle dashboard regression still shows planner cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("dashboard-title")).toHaveText("roadZ");
    await expect(page.getByTestId("route-card")).toBeVisible();
    await expect(page.getByTestId("fuel-card")).toBeVisible();
    await expect(page.getByTestId("trip-planner")).toBeVisible();
  });
});
