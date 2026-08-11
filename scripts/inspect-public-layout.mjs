import { chromium } from "@playwright/test";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const homeImage = page.locator('.managed-page-image[data-display-width="346"][data-display-height="195"]');
  await homeImage.waitFor();
  const homeMetrics = await homeImage.evaluate((image) => ({
    width: Math.round(image.getBoundingClientRect().width),
    height: Math.round(image.getBoundingClientRect().height),
  }));

  await page.goto("http://localhost:3000/foyer", { waitUntil: "networkidle" });
  const foyerImage = page.locator('.managed-page-image[data-display-width="179"][data-display-height="262"]');
  await foyerImage.waitFor();
  const foyerMetrics = await foyerImage.evaluate((image) => ({
    width: Math.round(image.getBoundingClientRect().width),
    height: Math.round(image.getBoundingClientRect().height),
  }));

  await page.goto("http://localhost:3000/imagination", { waitUntil: "networkidle" });
  const article = page.locator('main a[href^="/imagination/"]').first();
  await article.click();
  await page.waitForURL(/\/imagination\/.+/);
  await page.locator(".public-post-layout article").waitFor();
  const articleTypography = await page.locator(".public-post-layout article").evaluate((articleElement) => {
    const body = articleElement.querySelector(".prose-content") ?? articleElement.querySelector("div");
    if (!body) return null;
    const paragraph = body.querySelector("p") ?? body;
    return {
      bodyClass: body.className,
      bodyLineHeight: getComputedStyle(body).lineHeight,
      paragraphLineHeight: getComputedStyle(paragraph).lineHeight,
    };
  });

  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobilePage.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));
  await mobilePage.goto("http://localhost:3000/imagination", { waitUntil: "networkidle" });
  await mobilePage.locator('main a[href^="/imagination/"]').first().click();
  await mobilePage.waitForURL(/\/imagination\/.+/);
  await mobilePage.locator(".public-post-layout article").waitFor();
  const mobileArticleTypography = await mobilePage.locator(".public-post-layout article").evaluate((articleElement) => {
    const body = articleElement.querySelector(".prose-content") ?? articleElement.querySelector("div");
    if (!body) return null;
    const paragraph = body.querySelector("p") ?? body;
    const paragraphStyles = getComputedStyle(paragraph);
    return {
      lineHeight: paragraphStyles.lineHeight,
      marginBottom: paragraphStyles.marginBottom,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });

  console.log(JSON.stringify({ homeMetrics, foyerMetrics, articleTypography, mobileArticleTypography }));
} finally {
  await browser.close();
}
