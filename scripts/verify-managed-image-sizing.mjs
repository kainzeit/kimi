import { chromium } from "@playwright/test";

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.goto("http://localhost:3000/manage?admin", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "images", exact: true }).click();

  let foundResizeControl = false;
  for (const pageKey of ["home", "foyer", "a whim", "imagination", "elsewhere", "knock"]) {
    await page.getByRole("button", { name: pageKey, exact: true }).click();
    const resizeControl = page.getByTitle("Resize image").first();
    if ((await resizeControl.count()) === 1) {
      await resizeControl.click();
      foundResizeControl = true;
      break;
    }
  }

  if (!foundResizeControl) {
    throw new Error("Expected at least one managed image to expose the resize control.");
  }

  await page.getByText("resize image", { exact: true }).waitFor();
  await page.getByLabel("Drag to resize image").waitFor();
  await page.getByLabel("width (px)").waitFor();
  await page.getByLabel("height (px)").waitFor();
  const preview = page.locator('img[alt="Image size preview"]');
  await page.waitForTimeout(3000);
  const previewMetrics = await preview.evaluate((image) => ({
    src: image.currentSrc,
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    complete: image.complete,
  }));
  await page.screenshot({ path: "/home/ubuntu/manage-image-sizing-verification.png", fullPage: true });

  console.log(JSON.stringify({ resizePanelVisible: true, controlsVisible: true, previewMetrics }));
} finally {
  await browser.close();
}
