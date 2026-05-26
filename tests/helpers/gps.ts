import { expect, type Page } from "@playwright/test";

/** Enable live GPS — works whether permission was pre-granted or not. */
export async function enableLiveGps(page: Page) {
  const trackerMode = page.getByTestId("tracker-mode");

  if ((await page.getByTestId("gps-live-active").count()) > 0) {
    await expect(trackerMode).toContainText("live");
    return;
  }

  await expect
    .poll(
      async () => {
        const permission = await page.getByTestId("gps-permission").textContent();
        if (permission?.includes("granted")) {
          return true;
        }
        const enableBtn = page.getByTestId("gps-enable-btn").first();
        if (await enableBtn.isVisible()) {
          await enableBtn.click();
        }
        return false;
      },
      { timeout: 10_000 },
    )
    .toBe(true);

  const liveActive = page.getByTestId("gps-live-active");
  if ((await liveActive.count()) === 0) {
    const liveBtn = page.getByTestId("gps-live-mode-btn");
    await expect(liveBtn).toBeVisible({ timeout: 5_000 });
    await liveBtn.click();
  }

  await expect(trackerMode).toContainText("live", { timeout: 10_000 });
}
