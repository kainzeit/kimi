import { chromium } from "@playwright/test";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));

  await page.goto("http://localhost:3000/a-whim", { waitUntil: "networkidle" });
  const whimListDate = page.locator(".public-text-column h2").first();
  const whimListTypography = await whimListDate.evaluate((element) => {
    const style = getComputedStyle(element);
    return { fontSize: style.fontSize, fontWeight: style.fontWeight };
  });
  await whimListDate.click();
  const whimDetailTypography = await page.locator("article h1").evaluate((element) => {
    const style = getComputedStyle(element);
    return { fontSize: style.fontSize, fontWeight: style.fontWeight };
  });

  await page.goto("http://localhost:3000/imagination", { waitUntil: "networkidle" });
  const imaginationListTitle = page.locator(".public-text-column h2").first();
  const imaginationListTypography = await imaginationListTitle.evaluate((element) => {
    const style = getComputedStyle(element);
    return { fontSize: style.fontSize, fontWeight: style.fontWeight };
  });
  await imaginationListTitle.click();
  const imaginationDetailTypography = await page.locator("article h1").evaluate((element) => {
    const style = getComputedStyle(element);
    return { fontSize: style.fontSize, fontWeight: style.fontWeight };
  });

  if (
    whimListTypography.fontSize !== "12px" ||
    whimListTypography.fontWeight !== "400" ||
    whimDetailTypography.fontSize !== "14px" ||
    whimDetailTypography.fontWeight !== "400" ||
    imaginationListTypography.fontWeight === "400" ||
    imaginationDetailTypography.fontWeight === "400"
  ) {
    throw new Error(JSON.stringify({ whimListTypography, whimDetailTypography, imaginationListTypography, imaginationDetailTypography }));
  }

  console.log(JSON.stringify({ whimListTypography, whimDetailTypography, imaginationListTypography, imaginationDetailTypography }));
} finally {
  await browser.close();
}

process.exit(0);
