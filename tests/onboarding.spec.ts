import { expect, test } from "@playwright/test";
import { primeOnboardingComplete, resetOnboardingState } from "./helpers/onboarding";

async function mockGeolocationGranted(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const geolocationMock: Geolocation = {
      clearWatch: () => {},
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
        return 1;
      },
    };
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: geolocationMock,
    });
  });
}

async function mockGeolocationDenied(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const geolocationMock: Geolocation = {
      clearWatch: () => {},
      getCurrentPosition: (_s, error: PositionErrorCallback) => {
        error?.({
          code: 1,
          message: "denied",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError);
      },
      watchPosition: () => 1,
    };
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: geolocationMock,
    });
  });
}

test.describe("First-launch onboarding", () => {
  test.beforeEach(async ({ page }) => {
    await resetOnboardingState(page);
  });

  test("shows welcome screen on first visit", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("onboarding-welcome")).toBeVisible();
    await expect(page.getByTestId("onboarding-welcome-continue")).toBeVisible();
  });

  test("walks through privacy to GPS permission", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("onboarding-welcome-continue").click();
    await expect(page.getByTestId("onboarding-privacy")).toBeVisible();
    await page.getByTestId("onboarding-privacy-continue").click();
    await expect(page.getByTestId("onboarding-permission")).toBeVisible();
    await expect(page.getByTestId("onboarding-enable-gps")).toBeVisible();
  });

  test("GPS permission success enters dashboard", async ({ page }) => {
    await mockGeolocationGranted(page);
    await page.goto("/");
    await page.getByTestId("onboarding-welcome-continue").click();
    await page.getByTestId("onboarding-privacy-continue").click();
    await page.getByTestId("onboarding-enable-gps").click();
    await expect(page.getByTestId("onboarding-permission-success")).toBeVisible();
    await page.getByTestId("onboarding-enter-dashboard").click();
    await expect(page.getByTestId("app-dashboard")).toBeVisible();
    await expect(page.getByTestId("dashboard-title")).toHaveText("Road Companion");
  });

  test("GPS permission denied shows recovery and manual mode", async ({ page }) => {
    await mockGeolocationDenied(page);
    await page.goto("/");
    await page.getByTestId("onboarding-welcome-continue").click();
    await page.getByTestId("onboarding-privacy-continue").click();
    await page.getByTestId("onboarding-enable-gps").click();
    await expect(page.getByTestId("onboarding-permission-denied")).toBeVisible();
    await page.getByTestId("onboarding-continue-manual").click();
    await expect(page.getByTestId("dashboard-title")).toBeVisible();
  });

  test("returning user skips onboarding", async ({ page }) => {
    await primeOnboardingComplete(page);
    await page.goto("/");
    await expect(page.getByTestId("onboarding-welcome")).toHaveCount(0);
    await expect(page.getByTestId("dashboard-title")).toBeVisible();
  });

  test("onboarding renders on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByTestId("onboarding-flow")).toBeVisible();
    await expect(page.getByTestId("onboarding-welcome")).toBeVisible();
  });
});

test.describe("Onboarding regression", () => {
  test.beforeEach(async ({ page }) => {
    await primeOnboardingComplete(page);
  });

  test("dashboard still renders after onboarding gate", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("trip-planner")).toBeVisible();
    await expect(page.getByTestId("route-card")).toBeVisible();
  });
});
