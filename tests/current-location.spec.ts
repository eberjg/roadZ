import { expect, test } from "@playwright/test";
import { primeOnboardingComplete } from "./helpers/onboarding";

test.describe("Use current location", () => {
  test.beforeEach(async ({ page }) => {
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
        watchPosition: () => 1,
      };
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: geolocationMock,
      });
    });
    await primeOnboardingComplete(page);
    await page.goto("/");
  });

  test("fills start from current location button", async ({ page }) => {
    await page.getByTestId("input-start-zip-use-location").click();
    await expect(page.getByTestId("input-start-zip")).toHaveValue(/Fort Lauderdale/i, {
      timeout: 10_000,
    });
  });
});
