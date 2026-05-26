import { expect, test } from "@playwright/test";
import { primeOnboardingComplete } from "./helpers/onboarding";
import { openCockpitTab, startCockpitTrip } from "./helpers/cockpit";
import { openFamilySafetyPanel } from "./helpers/tripFuel";
import { etaDriftExceeded } from "../src/services/safety/etaMonitor";
import { formatSafetyMessage } from "../src/services/safety/smsRelay";

test.describe("Family safety relay", () => {
  test.beforeEach(async ({ page }) => {
    await primeOnboardingComplete(page);
    await page.goto("/");
  });

  test("add and remove trusted contact", async ({ page }) => {
    await openFamilySafetyPanel(page);
    await expect(page.getByTestId("family-safety-panel")).toBeVisible();
    await page.getByTestId("contact-name-input").fill("Alex");
    await page.getByTestId("contact-phone-input").fill("+15551234567");
    await page.getByTestId("contact-add-btn").click();
    await expect(page.getByTestId("contact-list")).toContainText("Alex");
    const item = page.locator("[data-testid^='contact-item-']").first();
    const removeId = await item.getAttribute("data-testid");
    const contactId = removeId?.replace("contact-item-", "") ?? "";
    await page.getByTestId(`contact-remove-${contactId}`).click();
    await expect(page.getByTestId("contact-list")).not.toContainText("Alex");
  });

  test("enable relay toggle and preview SMS", async ({ page }) => {
    await openFamilySafetyPanel(page);
    await page.getByTestId("safety-relay-toggle").check();
    await page.getByTestId("safety-driver-name").fill("Eber");
    await page.getByTestId("preview-event-started").click();
    await expect(page.getByTestId("broadcast-preview-body")).toContainText("Eber");
    await expect(page.getByTestId("broadcast-preview-body")).toContainText("Trip started");
    await expect(page.getByTestId("safety-relay-badge")).toContainText("Relay ON");
  });

  test("ETA drift logic triggers at 45 minutes", async () => {
    expect(etaDriftExceeded(300, 350, 45)).toBe(true);
    expect(etaDriftExceeded(300, 320, 45)).toBe(false);
  });

  test("arrival message preview", async () => {
    const body = formatSafetyMessage("arrival", {
      driverName: "Eber",
      startPlace: "Miami",
      destinationPlace: "Tacoma",
      currentPlaceLabel: "Tacoma",
      totalDistanceMiles: 3300,
      completedDistanceMiles: 3300,
      etaLabel: "0 min",
      fuelRangeMiles: 40,
      weatherRisk: "NORMAL",
      weatherSummary: "Clear",
      fatigueStatus: "NORMAL",
      operationalStatus: "NORMAL",
      nextStopName: null,
      isOvernightStop: false,
      gpsStale: false,
      tripStalled: false,
    });
    expect(body).toContain("Arrived safely");
    expect(body).toContain("Tacoma");
  });

  test("emergency warning state is visible when relay evaluates risk", async ({ page }) => {
    await openFamilySafetyPanel(page);
    await page.getByTestId("safety-relay-toggle").check();
    await page.getByTestId("safety-emergency-only-toggle").check();
    await expect(page.getByTestId("family-safety-panel")).toBeVisible();
    await expect(page.getByTestId("safety-status")).toBeVisible();
  });

  test("cockpit safety tab during active trip", async ({ page }) => {
    await startCockpitTrip(page);
    await openCockpitTab(page, "safety");
    await expect(page.getByTestId("family-safety-panel")).toBeVisible();
    await expect(page.getByTestId("broadcast-preview")).toBeVisible();
  });

  test("mobile safety panel layout", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openFamilySafetyPanel(page);
    await expect(page.getByTestId("family-safety-panel")).toBeVisible();
    await page.getByTestId("contact-name-input").fill("Sam");
    await page.getByTestId("contact-phone-input").fill("5559876543");
    await page.getByTestId("contact-add-btn").click();
    await expect(page.getByTestId("contact-list")).toContainText("Sam");
  });

  test("dashboard regression still loads", async ({ page }) => {
    await expect(page.getByTestId("dashboard-title")).toHaveText("roadZ");
    await expect(page.getByTestId("trip-planner")).toBeVisible();
  });
});
