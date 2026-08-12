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

  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobile.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));
  await mobile.goto("http://localhost:3000/a-whim", { waitUntil: "networkidle" });
  await mobile.locator(".public-text-column h2").first().click();
  const mobileWhimDetailTypography = await mobile.locator("article h1").evaluate((element) => {
    const style = getComputedStyle(element);
    const body = element.closest("article")?.querySelector(".article-reading-content");
    return {
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      color: style.color,
      bodyFontSize: body ? getComputedStyle(body).fontSize : "",
    };
  });
  await mobile.screenshot({ path: "/home/ubuntu/screenshots/a-whim-detail-mobile.png", fullPage: true });

  await mobile.goto("http://localhost:3000/elsewhere", { waitUntil: "networkidle" });
  await mobile.locator(".elsewhere-thumbnail").first().click();
  const mobileElsewhereDetailTypography = await mobile.locator("article h1").evaluate((element) => {
    const style = getComputedStyle(element);
    return { fontSize: style.fontSize, fontWeight: style.fontWeight, color: style.color };
  });
  await mobile.screenshot({ path: "/home/ubuntu/screenshots/elsewhere-detail-mobile.png", fullPage: true });
  await mobile.close();

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
    whimListTypography.fontSize !== "11px" ||
    whimListTypography.fontWeight !== "400" ||
    whimListTypography.color !== "rgb(113, 145, 153)" ||
    whimDetailTypography.fontSize !== "11px" ||
    whimDetailTypography.fontWeight !== "400" ||
    mobileWhimDetailTypography.fontSize !== "12px" ||
    mobileWhimDetailTypography.fontWeight !== "400" ||
    mobileWhimDetailTypography.bodyFontSize !== "16px" ||
    mobileElsewhereDetailTypography.fontSize !== mobileWhimDetailTypography.fontSize ||
    mobileElsewhereDetailTypography.fontWeight !== mobileWhimDetailTypography.fontWeight ||
    mobileElsewhereDetailTypography.color !== mobileWhimDetailTypography.color ||
    whimDetailTypography.color !== "rgb(113, 145, 153)" ||
    imaginationListTypography.fontWeight === "400" ||
    imaginationDetailTypography.fontWeight === "400" ||
    (elsewhereListTypography && elsewhereListTypography.fontWeight === "400") ||
    (elsewhereDetailTypography && elsewhereDetailTypography.fontWeight === "400") ||
    whimListGap > 6 ||
    whimDetailGap > 14
  ) {
    throw new Error(JSON.stringify({ whimListTypography, whimDetailTypography, mobileWhimDetailTypography, mobileElsewhereDetailTypography, whimListGap, whimDetailGap, imaginationListTypography, imaginationDetailTypography, elsewhereListTypography, elsewhereDetailTypography }));
  }

  console.log(JSON.stringify({ whimListTypography, whimDetailTypography, mobileWhimDetailTypography, mobileElsewhereDetailTypography, whimListGap, whimDetailGap, imaginationListTypography, imaginationDetailTypography, elsewhereListTypography, elsewhereDetailTypography }));
} finally {
  await browser.close();
}

process.exit(0);
