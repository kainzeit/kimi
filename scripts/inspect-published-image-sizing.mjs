import { chromium } from "@playwright/test";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));
  await page.goto("https://kimi.manus.space/", { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(3000);
  const managedImageCount = await page.locator(".managed-page-image").count();
  const pageTitle = await page.title();
  console.log(JSON.stringify({ pageTitle, managedImageCount }));
} finally {
  await browser.close();
}
