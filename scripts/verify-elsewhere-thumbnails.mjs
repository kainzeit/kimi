import { chromium } from "@playwright/test";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));
  await page.goto("http://localhost:3000/elsewhere", { waitUntil: "networkidle" });

  const thumbnail = page.locator('a[href^="/elsewhere/"] img').first();
  await thumbnail.waitFor();
  const thumbnailSize = await thumbnail.evaluate((image) => ({ width: image.clientWidth, height: image.clientHeight }));
  const isCompactThumbnail = thumbnailSize.width > 0 && thumbnailSize.width <= 208
    && thumbnailSize.height > 0 && thumbnailSize.height <= 160;
  if (!isCompactThumbnail) throw new Error(JSON.stringify(thumbnailSize));

  await thumbnail.click();
  await page.waitForURL(/\/elsewhere\//);

  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobile.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));
  await mobile.goto("http://localhost:3000/elsewhere", { waitUntil: "networkidle" });
  await mobile.locator('a[href^="/elsewhere/"] img').first().waitFor();
  const mobileLayout = await mobile.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  await mobile.close();
  if (mobileLayout.scrollWidth > mobileLayout.viewport) throw new Error(JSON.stringify(mobileLayout));

  console.log(JSON.stringify({ thumbnailSize, route: new URL(page.url()).pathname, mobileLayout }));
} finally {
  await browser.close();
}
