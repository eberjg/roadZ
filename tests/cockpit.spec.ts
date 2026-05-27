import { expect, test } from "@playwright/test";
import { primeOnboardingComplete } from "./helpers/onboarding";
import { enableLiveGps } from "./helpers/gps";
import { openCockpitTab, startCockpitTrip } from "./helpers/cockpit";

test.describe("Task 11 — Futuristic map-first cockpit", () => {
  test.beforeEach(async ({ page }) => {
    await primeOnboardingComplete(page);
  });

  test("cockpit renders after trip calculation", async ({ page }) => {
    await startCockpitTrip(page);
    await expect(page.getByTestId("cockpit-layout")).toBeVisible();
    await expect(page.getByTestId("route-map")).toHaveAttribute("data-variant", "cockpit");
  });

  test("map occupies primary screen area", async ({ page }) => {
    await startCockpitTrip(page);
    const mapStage = page.getByTestId("cockpit-map-stage");
    const layout = page.getByTestId("cockpit-layout");
    const mapBox = await mapStage.boundingBox();
    const layoutBox = await layout.boundingBox();
    expect(mapBox).not.toBeNull();
    expect(layoutBox).not.toBeNull();
    if (mapBox && layoutBox) {
      expect(mapBox.height).toBeGreaterThan(layoutBox.height * 0.45);
    }
  });

  test("mission header and metrics strip visible", async ({ page }) => {
    await startCockpitTrip(page);
    await expect(page.getByTestId("cockpit-mission-header")).toBeVisible();
    await expect(page.getByTestId("cockpit-metrics-strip")).toBeVisible();
    await expect(page.getByTestId("cockpit-trip-route")).toBeVisible();
  });

  test("floating overlays visible", async ({ page }) => {
    await startCockpitTrip(page);
    await expect(page.getByTestId("cockpit-weather-overlay")).toBeVisible();
    await expect(page.getByTestId("cockpit-safety-overlay")).toBeVisible();
    await expect(page.getByTestId("cockpit-next-stop-overlay")).toBeVisible();
  });

  test("bottom live console and family strip visible", async ({ page }) => {
    await startCockpitTrip(page);
    await expect(page.getByTestId("cockpit-live-console")).toBeVisible();
    await expect(page.getByTestId("cockpit-family-strip")).toBeVisible();
    await expect(page.getByTestId("cockpit-tab-bar")).toBeVisible();
  });

  test("dynamic MPG in metrics strip", async ({ page }) => {
    await startCockpitTrip(page);
    await expect(page.getByTestId("hud-live-mpg")).toBeVisible();
    await expect(page.getByTestId("hud-efficiency-score")).toBeVisible();
  });

  test("tab opens detail panel without covering entire map", async ({ page }) => {
    await startCockpitTrip(page);
    await openCockpitTab(page, "mission");
    await expect(page.getByTestId("vehicle-intelligence-panel")).toBeVisible();
    await expect(page.getByTestId("cockpit-map-stage")).toBeVisible();
  });

  test("GPS tab and recovery from stale denied", async ({ page }) => {
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
    await startCockpitTrip(page);
    await openCockpitTab(page, "gps");
    await enableLiveGps(page);
    await expect(page.getByTestId("gps-permission")).toContainText("granted");
  });

  test("ops tab shows operational dashboard", async ({ page }) => {
    await startCockpitTrip(page);
    await openCockpitTab(page, "ops");
    await expect(page.getByTestId("operational-dashboard")).toBeVisible();
  });

  test("mobile viewport overlay layout does not severely overlap", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await startCockpitTrip(page);

    const weather = await page.getByTestId("cockpit-weather-overlay").boundingBox();
    const safety = await page.getByTestId("cockpit-safety-overlay").boundingBox();
    const map = await page.getByTestId("cockpit-map-stage").boundingBox();

    expect(weather).not.toBeNull();
    expect(safety).not.toBeNull();
    expect(map).not.toBeNull();

    if (weather && safety && map) {
      expect(weather.x + weather.width).toBeLessThan(safety.x + 2);
      const weatherBottom = weather.y + weather.height;
      const safetyBottom = safety.y + safety.height;
      expect(weatherBottom).toBeLessThan(safety.y + safety.height + 80);
      expect(Math.abs(weatherBottom - safetyBottom)).toBeLessThan(map.height * 0.35);
    }

    await expect(page.getByTestId("cockpit-live-console")).toBeVisible();
  });

  test("idle dashboard regression", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("dashboard-title")).toHaveText("roadZ");
    await expect(page.getByTestId("trip-planner")).toBeVisible();
  });

  test("map control buttons are wired", async ({ page }) => {
    await startCockpitTrip(page);
    await expect(page.getByTestId("cockpit-map-controls")).toBeVisible();
    await page.getByTestId("cockpit-map-zoom-in").click();
    await page.getByTestId("cockpit-map-zoom-out").click();
    await page.getByTestId("cockpit-recenter").click();
    await page.getByTestId("cockpit-map-north").click();
    await expect(page.getByTestId("route-map-you")).toBeVisible();
  });
});
