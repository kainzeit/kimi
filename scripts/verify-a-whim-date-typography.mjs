import { chromium } from "@playwright/test";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));

  await page.goto("http://localhost:3000/a-whim", { waitUntil: "networkidle" });
  const whimListDate = page.locator(".public-text-column h2").first();
  const whimListTypography = await whimListDate.evaluate((element) => {
    const style = getComputedStyle(element);
    return { fontSize: style.fontSize, fontWeight: style.fontWeight, color: style.color };
  });
  const whimPreview = page.locator(".a-whim-preview").first();
  const whimListGap = await page.evaluate(() => {
    const date = document.querySelector(".a-whim-date");
    const preview = document.querySelector(".a-whim-preview");
    if (!date || !preview) return 999;
    return preview.getBoundingClientRect().top - date.getBoundingClientRect().bottom;
  });
  await whimListDate.click();
  const whimDetailTypography = await page.locator("article h1").evaluate((element) => {
    const style = getComputedStyle(element);
    return { fontSize: style.fontSize, fontWeight: style.fontWeight, color: style.color };
  });
  const whimDetailGap = await page.evaluate(() => {
    const row = document.querySelector(".a-whim-title-row");
    const content = document.querySelector(".article-reading-content");
    if (!row || !content) return 999;
    return content.getBoundingClientRect().top - row.getBoundingClientRect().bottom;
  });

  await page.goto("http://localhost:3000/imagination", { waitUntil: "networkidle" });
  const imaginationListTitle = page.locator(".public-text-column h2").first();
  const imaginationListTypography = await imaginationListTitle.evaluate((element) => {
    const style = getComputedStyle(element);
    return { fontSize: style.fontSize, fontWeight: style.fontWeight, color: style.color };
  });
  await imaginationListTitle.click();
  const imaginationDetailTypography = await page.locator("article h1").evaluate((element) => {
    const style = getComputedStyle(element);
    return { fontSize: style.fontSize, fontWeight: style.fontWeight, color: style.color };
  });

  await page.goto("http://localhost:3000/elsewhere", { waitUntil: "networkidle" });
  const elsewhereListTitle = page.locator(".public-text-column h2").first();
  const hasElsewhereArticle = (await page.locator(".public-text-column h2").count()) > 0;
  const elsewhereListTypography = hasElsewhereArticle
    ? await elsewhereListTitle.evaluate((element) => {
        const style = getComputedStyle(element);
        return { fontSize: style.fontSize, fontWeight: style.fontWeight, color: style.color };
      })
    : null;
  const elsewhereDetailTypography = hasElsewhereArticle
    ? await (async () => {
        await elsewhereListTitle.click();
        return page.locator("article h1").evaluate((element) => {
          const style = getComputedStyle(element);
          return { fontSize: style.fontSize, fontWeight: style.fontWeight, color: style.color };
        });
      })()
    : null;

  if (
    whimListTypography.fontSize !== "10px" ||
    whimListTypography.fontWeight !== "400" ||
    whimListTypography.color === "rgb(35, 35, 35)" ||
    whimDetailTypography.fontSize !== "10px" ||
    whimDetailTypography.fontWeight !== "400" ||
    imaginationListTypography.fontWeight === "400" ||
    imaginationDetailTypography.fontWeight === "400" ||
    (elsewhereListTypography && elsewhereListTypography.fontWeight === "400") ||
    (elsewhereDetailTypography && elsewhereDetailTypography.fontWeight === "400") ||
    whimListGap > 6 ||
    whimDetailGap > 14
  ) {
    throw new Error(JSON.stringify({ whimListTypography, whimDetailTypography, whimListGap, whimDetailGap, imaginationListTypography, imaginationDetailTypography, elsewhereListTypography, elsewhereDetailTypography }));
  }

  console.log(JSON.stringify({ whimListTypography, whimDetailTypography, whimListGap, whimDetailGap, imaginationListTypography, imaginationDetailTypography, elsewhereListTypography, elsewhereDetailTypography }));
} finally {
  await browser.close();
}

process.exit(0);
