import { chromium } from "@playwright/test";

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));
  await page.goto("http://localhost:3000/imagination", { waitUntil: "networkidle" });

  const sidebarMetrics = await page.evaluate(() => {
    const sidebar = document.querySelector(".site-sidebar");
    const nav = document.querySelector(".site-nav");
    const toggle = document.querySelector(".mobile-nav-toggle");
    if (!sidebar || !nav || !toggle) return null;

    const sidebarRect = sidebar.getBoundingClientRect();
    return {
      left: Math.round(sidebarRect.left),
      width: Math.round(sidebarRect.width),
      navDirection: getComputedStyle(nav).flexDirection,
      toggleDisplay: getComputedStyle(toggle).display,
    };
  });

  await page.screenshot({ path: "/home/ubuntu/desktop-sidebar-verification.png", fullPage: true });

  const desktopLayoutPreserved = Boolean(
    sidebarMetrics &&
      sidebarMetrics.left === 152 &&
      sidebarMetrics.width === 176 &&
      sidebarMetrics.navDirection === "column" &&
      sidebarMetrics.toggleDisplay === "none"
  );

  if (!desktopLayoutPreserved) {
    throw new Error(`Desktop sidebar verification failed: ${JSON.stringify(sidebarMetrics)}`);
  }

  console.log(JSON.stringify(sidebarMetrics));
} finally {
  await browser.close();
}
