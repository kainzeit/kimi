import { chromium } from "@playwright/test";
import { listArticles, permanentlyDeleteArticle } from "../server/db";

const marker = `A Whim titleless browser fixture ${Date.now()}`;
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.goto("http://localhost:3000/manage?admin", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "articles", exact: true }).click();
  await page.getByRole("button", { name: "a whim", exact: true }).click();
  await page.getByRole("button", { name: "+ new article", exact: true }).click();

  if ((await page.getByPlaceholder("title").count()) !== 0 || (await page.getByPlaceholder("slug (e.g., my-first-post)").count()) !== 0) {
    throw new Error("A Whim form still exposes title or slug inputs.");
  }

  await page.locator(".ProseMirror").fill(marker);
  await page.getByRole("button", { name: "publish", exact: true }).first().click();

  const created = (await listArticles("a-whim", { includeHidden: true })).find((article) => article.content.includes(marker));
  if (!created) throw new Error("A Whim titleless fixture was not saved.");

  const expectedDate = new Date(created.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  if (created.title !== expectedDate || !created.slug.startsWith("whim-")) {
    throw new Error(`A Whim internal title or slug was not generated as expected: ${JSON.stringify(created)}`);
  }

  const publicPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await publicPage.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));
  await publicPage.goto("http://localhost:3000/a-whim", { waitUntil: "networkidle" });
  const dateLink = publicPage.locator(`a[href="/a-whim/${created.slug}"]`).filter({ hasText: expectedDate });
  await dateLink.waitFor();
  await dateLink.click();
  await publicPage.waitForFunction((slug) => window.location.pathname === `/a-whim/${slug}`, created.slug);
  const detailHeading = await publicPage.locator("article h1").innerText();
  if (detailHeading !== expectedDate) {
    throw new Error(`A Whim detail heading did not use the date: ${detailHeading}`);
  }

  console.log(JSON.stringify({ slug: created.slug, title: created.title, heading: detailHeading }));
} finally {
  await browser.close();
  const fixture = (await listArticles("a-whim", { includeHidden: true, includeDeleted: true })).find((article) => article.content.includes(marker));
  if (fixture) await permanentlyDeleteArticle(fixture.id);
}

process.exit(0);
