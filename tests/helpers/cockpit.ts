import { expect, type Page } from "@playwright/test";

export type CockpitTab = "mission" | "fuel" | "ops" | "gps";

export async function startCockpitTrip(page: Page, options?: { skipGoto?: boolean }) {
  if (!options?.skipGoto) {
    await page.goto("/");
  }
  await page.getByTestId("input-start-zip").fill("33301");
  await page.getByTestId("input-destination-zip").fill("98402");
  await page.getByTestId("input-vehicle-mpg").fill("30");
  await page.getByTestId("input-gas-price").fill("4");
  await page.getByTestId("btn-calculate-trip").click();
  await expect(page.getByTestId("cockpit-layout")).toBeVisible({ timeout: 15_000 });
}

export async function expandCockpitSheet(page: Page) {
  const toggle = page.getByTestId("cockpit-sheet-toggle");
  if ((await toggle.getAttribute("aria-expanded")) !== "true") {
    await toggle.click();
  }
}

export async function openCockpitTab(page: Page, tab: CockpitTab) {
  await page.getByTestId(`cockpit-tab-${tab}`).click();
  await expandCockpitSheet(page);
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
