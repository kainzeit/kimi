import { chromium } from "@playwright/test";

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });

try {
  await page.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  const menuButton = page.getByRole("button", { name: "Open navigation" });
  await menuButton.click();
  await page.getByRole("link", { name: "elsewhere", exact: true }).waitFor();

  await page.getByRole("link", { name: "a whim", exact: true }).click();
  await page.waitForURL(/\/a-whim$/);

  const menuClosedAfterNavigation = await page.getByRole("button", { name: "Open navigation" }).count() === 1;
  const listHasNoHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

  let articleLink = page.locator('main a[href^="/a-whim/"]').first();
  let articleCategory = "a-whim";

  if ((await articleLink.count()) !== 1) {
    for (const category of ["imagination", "elsewhere"]) {
      await page.goto(`http://localhost:3000/${category}`, { waitUntil: "networkidle" });
      const candidate = page.locator(`main a[href^="/${category}/"]`).first();
      if ((await candidate.count()) === 1) {
        articleLink = candidate;
        articleCategory = category;
        break;
      }
    }
  }

  if ((await articleLink.count()) !== 1) {
    throw new Error("Expected at least one published article for mobile detail-page verification.");
  }

  await articleLink.click();
  await page.waitForURL(new RegExp(`/${articleCategory}/.+`));
  await page.locator(".public-post-layout article").waitFor();

  const articleMetrics = await page.evaluate(() => {
    const article = document.querySelector(".public-post-layout article");
    if (!article) return null;
    return {
      articleWidth: Math.round(article.getBoundingClientRect().width),
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });

  const articleFitsViewport = Boolean(
    articleMetrics &&
      articleMetrics.articleWidth <= articleMetrics.viewportWidth &&
      articleMetrics.scrollWidth <= articleMetrics.viewportWidth
  );

  await page.screenshot({ path: "/home/ubuntu/mobile-article-verification.png", fullPage: true });

  if (!menuClosedAfterNavigation || !listHasNoHorizontalOverflow || !articleFitsViewport) {
    throw new Error(
      `Mobile verification failed: ${JSON.stringify({ menuClosedAfterNavigation, listHasNoHorizontalOverflow, articleMetrics })}`
    );
  }

  console.log(JSON.stringify({ menuClosedAfterNavigation, listHasNoHorizontalOverflow, articleCategory, articleMetrics }));
} finally {
  await browser.close();
}
