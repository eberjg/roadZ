import { expect, type Page } from "@playwright/test";

/** Enable live GPS — works whether permission was pre-granted or not. */
export async function enableLiveGps(page: Page) {
  const liveActive = page.getByTestId("gps-live-active");
  if ((await liveActive.count()) > 0) {
    await expect(page.getByTestId("tracker-mode")).toContainText("live");
    return;
  }

  const enableBtn = page.getByTestId("gps-enable-btn");
  if ((await enableBtn.count()) > 0 && (await enableBtn.isVisible())) {
    await enableBtn.click();
    await expect(page.getByTestId("gps-permission")).toContainText("granted", {
      timeout: 10_000,
    });
  } else {
    const liveBtn = page.getByTestId("gps-live-mode-btn");
    if ((await liveBtn.count()) > 0 && (await liveBtn.isVisible())) {
      await liveBtn.click();
    }
  }

  await expect(page.getByTestId("tracker-mode")).toContainText("live", { timeout: 10_000 });
}
