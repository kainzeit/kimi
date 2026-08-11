import { chromium } from "@playwright/test";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));
  await page.goto("http://localhost:3000/imagination", { waitUntil: "networkidle" });
  await page.locator('main a[href^="/imagination/"]').first().click();
  await page.waitForURL(/\/imagination\/.+/);

  const compact = page.getByRole("button", { name: "compact", exact: true });
  const comfortable = page.getByRole("button", { name: "comfortable", exact: true });
  await comfortable.waitFor();

  const comfortableLineHeight = await page.locator(".article-reading-content").evaluate((element) => getComputedStyle(element).lineHeight);
  await compact.click();
  const compactLineHeight = await page.locator(".article-reading-content").evaluate((element) => getComputedStyle(element).lineHeight);
  const compactPressed = await compact.getAttribute("aria-pressed");

  await page.reload({ waitUntil: "networkidle" });
  const persistedCompactPressed = await page.getByRole("button", { name: "compact", exact: true }).getAttribute("aria-pressed");

  if (comfortableLineHeight === compactLineHeight || compactPressed !== "true" || persistedCompactPressed !== "true") {
    throw new Error(JSON.stringify({ comfortableLineHeight, compactLineHeight, compactPressed, persistedCompactPressed }));
  }

  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobilePage.addInitScript(() => {
    sessionStorage.setItem("kimi-greeted", "yes");
    sessionStorage.setItem("kimi-reading-density", "comfortable");
  });
  await mobilePage.goto("http://localhost:3000/imagination", { waitUntil: "networkidle" });
  await mobilePage.locator('main a[href^="/imagination/"]').first().click();
  await mobilePage.waitForURL(/\/imagination\/.+/);
  await mobilePage.getByRole("button", { name: "comfortable", exact: true }).waitFor();
  const mobileMetrics = await mobilePage.locator(".article-reading-content").evaluate((element) => ({
    lineHeight: getComputedStyle(element).lineHeight,
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  if (mobileMetrics.scrollWidth > mobileMetrics.viewportWidth) {
    throw new Error(`Mobile reading density overflowed the viewport: ${JSON.stringify(mobileMetrics)}`);
  }

  console.log(JSON.stringify({ comfortableLineHeight, compactLineHeight, persistedCompactPressed, mobileMetrics }));
} finally {
  await browser.close();
}
