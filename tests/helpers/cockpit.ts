import { expect, type Page } from "@playwright/test";
import { setTripFuelInputs } from "./tripFuel";

export type CockpitTab = "mission" | "fuel" | "ops" | "gps" | "safety";

export async function startCockpitTrip(page: Page, options?: { skipGoto?: boolean }) {
  if (!options?.skipGoto) {
    await page.goto("/");
  }
  await page.getByTestId("input-start-zip").fill("33301");
  await page.getByTestId("input-destination-zip").fill("98402");
  await setTripFuelInputs(page, { mpg: "30", gasPrice: "4" });
  await page.getByTestId("btn-calculate-trip").click();
  await expect(page.getByTestId("cockpit-layout")).toBeVisible({ timeout: 15_000 });
}

export async function openCockpitTab(page: Page, tab: CockpitTab) {
  await page.getByTestId(`cockpit-tab-${tab}`).click();
  await expect(page.getByTestId("cockpit-detail-panel")).toBeVisible({ timeout: 5_000 });
}

/** Ops progress slider is only enabled in manual tracker mode. */
export async function enableManualTripProgress(page: Page) {
  await openCockpitTab(page, "gps");
  const manualBtn = page.getByTestId("gps-manual-mode-btn");
  if (await manualBtn.isVisible()) {
    await manualBtn.click();
  }
  await openCockpitTab(page, "ops");
}
