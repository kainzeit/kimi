import { chromium } from "@playwright/test";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));
  await page.goto("http://localhost:3000/a-whim", { waitUntil: "networkidle" });

  await page.goto("http://localhost:3000/a-whim", { waitUntil: "networkidle" });
  const aWhimDate = page.locator(".a-whim-date").first();
  const aWhimDateWave = await aWhimDate.count() > 0
    ? await aWhimDate.evaluate((element) => getComputedStyle(element, "::after").backgroundImage)
    : null;

  const navLink = page.locator(".nav-link").first();
  const navWave = await navLink.evaluate((element) => getComputedStyle(element, "::after").backgroundImage);

  const routes = ["/", "/foyer", "/a-whim", "/imagination", "/elsewhere", "/knock"];
  const navWaves = {};
  for (const route of routes) {
    await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
    const link = page.locator(".nav-link").first();
    if (await link.count() > 0) {
      navWaves[route] = await link.evaluate((el) => getComputedStyle(el, "::after").backgroundImage);
    }
  }

  await page.goto("http://localhost:3000/imagination/ny-dlc", { waitUntil: "networkidle" });
  const realArticleLink = await page.evaluate(() => {
    let el = document.querySelector(".prose-content a");
    if (!el) {
      const container = document.querySelector(".prose-content");
      if (container) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = "test link";
        p.appendChild(a);
        container.appendChild(p);
        el = a;
      }
    }
    if (!el) return null;
    const style = getComputedStyle(el);
    return {
      color: style.color,
      decoration: style.textDecorationLine,
    };
  });

  const result = { navWaves, aWhimDateWave, realArticleLink };
  const allNavsValid = Object.values(navWaves).every((w) => typeof w === "string" && w.includes("%23719199"));
  const aWhimWaveIsThin = typeof aWhimDateWave === "string" && aWhimDateWave.includes("stroke-width='1.35'");
  const navWaveKeepsStandardWeight = typeof navWave === "string" && navWave.includes("stroke-width='2.8'");
  if (!allNavsValid || !aWhimWaveIsThin || !navWaveKeepsStandardWeight || !realArticleLink || realArticleLink.color !== "rgb(113, 145, 153)" || realArticleLink.decoration !== "none") {
    throw new Error(JSON.stringify(result));
  }
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}

process.exit(0);
