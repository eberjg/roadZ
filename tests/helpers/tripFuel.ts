import type { Page } from "@playwright/test";

/** Hidden inputs back trip fuel; Playwright needs force to fill them. */
export async function setTripFuelInputs(
  page: Page,
  options?: { mpg?: string; gasPrice?: string },
) {
  const mpg = page.getByTestId("input-vehicle-mpg");
  const gas = page.getByTestId("input-gas-price");
  if (options?.mpg !== undefined) {
    await mpg.fill(options.mpg);
  }
  if (options?.gasPrice !== undefined) {
    await gas.fill(options.gasPrice);
  }
}

export async function openFamilySafetyPanel(page: Page) {
  const details = page.getByTestId("family-safety-details");
  if ((await details.count()) === 0) {
    return;
  }
  if (!(await details.getAttribute("open"))) {
    await details.locator("summary").click();
  }
  await page.getByTestId("family-safety-panel").waitFor({ state: "visible" });
}
