import { chromium } from "@playwright/test";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));
  await page.goto("http://localhost:3000/elsewhere", { waitUntil: "networkidle" });

  const grid = page.locator(".elsewhere-grid");
  await grid.waitFor();
  const row = page.locator(".elsewhere-grid-row").first();
  await row.waitFor();
  const thumbnails = page.locator(".elsewhere-thumbnail");
  await thumbnails.first().waitFor();

  const desktopLayout = await page.evaluate(() => {
    const gridElement = document.querySelector(".elsewhere-grid");
    const rowElement = document.querySelector(".elsewhere-grid-row");
    const entries = Array.from(document.querySelectorAll(".elsewhere-grid-row:first-child .elsewhere-entry"));
    const images = Array.from(document.querySelectorAll(".elsewhere-thumbnail"));
    const dates = entries.map((entry) => entry.querySelector("time")?.textContent?.trim() || "");
    const centers = entries.map((entry) => {
      const rect = entry.getBoundingClientRect();
      return rect.left + rect.width / 2;
    });
    return {
      gridDirection: gridElement ? getComputedStyle(gridElement).flexDirection : "",
      rowColumns: rowElement ? getComputedStyle(rowElement).gridTemplateColumns : "",
      rowDirection: rowElement ? getComputedStyle(rowElement).direction : "",
      dates,
      centers,
      imageSizes: images.map((image) => ({ width: image.clientWidth, height: image.clientHeight })),
    };
  });

  if (desktopLayout.gridDirection !== "column-reverse") throw new Error(JSON.stringify(desktopLayout));
  if (desktopLayout.rowDirection !== "rtl") throw new Error(JSON.stringify(desktopLayout));
  if (desktopLayout.centers.length >= 2 && desktopLayout.centers[0] <= desktopLayout.centers[1]) {
    throw new Error(`Newest entry is not on the right: ${JSON.stringify(desktopLayout)}`);
  }
  if (desktopLayout.imageSizes.some(({ width, height }) => width <= 0 || height < 301 || height > 303)) {
    throw new Error(`Unexpected proportional thumbnail size: ${JSON.stringify(desktopLayout)}`);
  }
  await page.screenshot({ path: "/home/ubuntu/screenshots/elsewhere-grid-desktop.png", fullPage: true });

  await thumbnails.first().click();
  await page.waitForURL(/\/elsewhere\//);

  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobile.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));
  await mobile.goto("http://localhost:3000/elsewhere", { waitUntil: "networkidle" });
  await mobile.locator(".elsewhere-thumbnail").first().waitFor();
  const mobileLayout = await mobile.evaluate(() => {
    const grid = document.querySelector(".elsewhere-grid");
    const row = document.querySelector(".elsewhere-grid-row");
    return {
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      gridDirection: grid ? getComputedStyle(grid).flexDirection : "",
      rowColumns: row ? getComputedStyle(row).gridTemplateColumns : "",
      rowDirection: row ? getComputedStyle(row).direction : "",
    };
  });
  if (mobileLayout.scrollWidth > mobileLayout.viewport || mobileLayout.gridDirection !== "column") {
    throw new Error(JSON.stringify(mobileLayout));
  }
  await mobile.screenshot({ path: "/home/ubuntu/screenshots/elsewhere-grid-mobile.png", fullPage: true });
  await mobile.close();

  console.log(JSON.stringify({ desktopLayout, route: new URL(page.url()).pathname, mobileLayout }));
} finally {
  await browser.close();
}
