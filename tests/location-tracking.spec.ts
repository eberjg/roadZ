import { expect, test } from "@playwright/test";
import { primeOnboardingComplete, primeReturningDriver } from "./helpers/onboarding";
import { enableLiveGps } from "./helpers/gps";

async function mockGeolocation(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    type PositionLike = {
      coords: {
        latitude: number;
        longitude: number;
        accuracy: number;
        speed: number;
        heading: number | null;
      };
      timestamp: number;
    };

    let watchId = 0;
    const watchers = new Map<number, PositionCallback>();

    const geolocationMock: Geolocation = {
      clearWatch: (id: number) => {
        watchers.delete(id);
      },
      getCurrentPosition: (success: PositionCallback) => {
        success({
          coords: {
            latitude: 26.1224,
            longitude: -80.1373,
            accuracy: 15,
            speed: 0,
            heading: 0,
            altitude: null,
            altitudeAccuracy: null,
          },
          timestamp: Date.now(),
        } as GeolocationPosition);
      },
      watchPosition: (success: PositionCallback) => {
        watchId += 1;
        watchers.set(watchId, success);
        return watchId;
      },
    };

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: geolocationMock,
    });

    Object.defineProperty(navigator, "permissions", {
      configurable: true,
      value: {
        query: async () => ({ state: "granted" }),
      },
    });

    (window as Window & { __emitLocation?: (position: PositionLike) => void }).__emitLocation = (
      position: PositionLike,
    ) => {
      for (const callback of watchers.values()) {
        callback(position as unknown as GeolocationPosition);
      }
    };
  });
}

async function startTrip(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByTestId("input-start-zip").fill("33301");
  await page.getByTestId("input-destination-zip").fill("98402");
  await page.getByTestId("input-vehicle-mpg").fill("30");
  await page.getByTestId("input-gas-price").fill("4");
  await page.getByTestId("btn-calculate-trip").click();
  await expect(page.getByTestId("live-trip-tracker")).toBeVisible();
}

async function emitPosition(
  page: import("@playwright/test").Page,
  input: { lat: number; lng: number; speed: number; heading?: number; timestamp: number },
) {
  await page.evaluate((payload) => {
    const fn = (window as Window & { __emitLocation?: (position: unknown) => void }).__emitLocation;
    if (!fn) return;
    fn({
      coords: {
        latitude: payload.lat,
        longitude: payload.lng,
        accuracy: 10,
        speed: payload.speed,
        heading: payload.heading ?? 0,
      },
      timestamp: payload.timestamp,
    });
  }, input);
}

test.describe("Live GPS tracker", () => {
  test.beforeEach(async ({ page }) => {
    await primeOnboardingComplete(page);
  });

  test("requests GPS on Enable even when Permissions API says denied", async ({ page }) => {
    await mockGeolocation(page);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "permissions", {
        configurable: true,
        value: {
          query: async () => ({ state: "denied" }),
        },
      });
    });
    await startTrip(page);

    await enableLiveGps(page);
    await expect(page.getByTestId("gps-permission")).toContainText("granted");
    await expect(page.getByTestId("tracker-mode")).toContainText("live");
  });

  test("handles GPS permission flow and enters live mode", async ({ page }) => {
    await mockGeolocation(page);
    await startTrip(page);

    await enableLiveGps(page);
    await expect(page.getByTestId("gps-permission")).toContainText("granted");
    await expect(page.getByTestId("tracker-mode")).toContainText("live");
  });

  test("auto-progress updates from movement", async ({ page }) => {
    await mockGeolocation(page);
    await primeReturningDriver(page);
    await startTrip(page);
    await expect(page.getByTestId("tracker-mode")).toContainText("live");

    const now = Date.now();
    await emitPosition(page, {
      lat: 26.1224,
      lng: -80.1373,
      speed: 10,
      heading: 90,
      timestamp: now,
    });
    await emitPosition(page, {
      lat: 26.1724,
      lng: -80.1373,
      speed: 12,
      heading: 90,
      timestamp: now + 60_000,
    });

    await expect(page.getByTestId("movement-state")).toContainText("driving");
    await expect(page.getByTestId("trip-remaining-distance")).not.toContainText("3,300");
  });

  test("detects idle and rest states", async ({ page }) => {
    await mockGeolocation(page);
    await primeReturningDriver(page);
    await startTrip(page);
    await expect(page.getByTestId("tracker-mode")).toContainText("live");

    const now = Date.now();
    await emitPosition(page, { lat: 26.12, lng: -80.13, speed: 12, timestamp: now });
    await emitPosition(page, {
      lat: 26.12,
      lng: -80.13,
      speed: 0,
      timestamp: now + 11 * 60_000,
    });
    await expect(page.getByTestId("movement-state")).toContainText("idle");

    await emitPosition(page, {
      lat: 26.12,
      lng: -80.13,
      speed: 0,
      timestamp: now + 46 * 60_000,
    });
    await expect(page.getByTestId("movement-state")).toContainText("resting");
  });

  test("renders session timer metrics", async ({ page }) => {
    await mockGeolocation(page);
    await primeReturningDriver(page);
    await startTrip(page);
    await expect(page.getByTestId("tracker-mode")).toContainText("live");

    const now = Date.now();
    await emitPosition(page, { lat: 26.12, lng: -80.13, speed: 11, timestamp: now });
    await emitPosition(page, {
      lat: 26.13,
      lng: -80.13,
      speed: 11,
      timestamp: now + 5 * 60_000,
    });

    await expect(page.getByTestId("driving-session")).toBeVisible();
    await expect(page.getByTestId("session-active-drive")).not.toContainText("0 min");
  });

  test("manual fallback mode keeps slider control", async ({ page }) => {
    await mockGeolocation(page);
    await startTrip(page);
    await enableLiveGps(page);
    await page.getByTestId("gps-manual-mode-btn").click();

    await expect(page.getByTestId("tracker-mode")).toContainText("manual");
    await expect(page.getByTestId("trip-progress-slider")).toBeVisible();
  });

  test("location UI renders on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockGeolocation(page);
    await startTrip(page);
    await enableLiveGps(page);

    await expect(page.getByTestId("gps-status")).toBeVisible();
    await expect(page.getByTestId("movement-status")).toBeVisible();
    await expect(page.getByTestId("driving-session")).toBeVisible();
  });
});
