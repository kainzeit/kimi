import { chromium } from "@playwright/test";
import { listArticles, permanentlyDeleteArticle, softDeleteArticle } from "../server/db";

const existingWhim = (await listArticles("a-whim")).find((article) => !article.slug.startsWith("whim-"));
const existingImagination = (await listArticles("imagination"))[0];
const elsewhereMarker = `Elsewhere title contract ${Date.now()}`;
const elsewhereSlug = `elsewhere-title-contract-${Date.now().toString(36)}`;

if (!existingWhim || !existingImagination) {
  throw new Error("Expected existing published A Whim and Imagination entries for compatibility verification.");
}

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
let elsewhereFixtureId: number | undefined;

try {
  const managePage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await managePage.goto("http://localhost:3000/manage?admin", { waitUntil: "networkidle" });
  await managePage.getByRole("button", { name: "articles", exact: true }).click();
  await managePage.getByRole("button", { name: "elsewhere", exact: true }).click();
  await managePage.getByRole("button", { name: "+ new article", exact: true }).click();
  await managePage.getByPlaceholder("slug (e.g., my-first-post)").fill(elsewhereSlug);
  await managePage.getByPlaceholder("title").fill(elsewhereMarker);
  await managePage.locator(".ProseMirror").fill("Temporary validation entry for the Elsewhere title contract.");
  await managePage.getByRole("button", { name: "publish", exact: true }).first().click();
  await managePage.getByText(elsewhereMarker, { exact: true }).waitFor({ timeout: 10000 });

  const elsewhereFixture = (await listArticles("elsewhere", { includeHidden: true })).find((article) => article.slug === elsewhereSlug);
  if (!elsewhereFixture) throw new Error("Could not create the temporary Elsewhere validation entry.");
  elsewhereFixtureId = elsewhereFixture.id;

  const publicPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await publicPage.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));

  const whimDate = new Date(existingWhim.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  await publicPage.goto("http://localhost:3000/a-whim", { waitUntil: "networkidle" });
  const whimDateLink = publicPage.locator(`a[href="/a-whim/${existingWhim.slug}"]`).filter({ hasText: whimDate });
  await whimDateLink.waitFor();
  await whimDateLink.click();
  await publicPage.waitForFunction((slug) => window.location.pathname === `/a-whim/${slug}`, existingWhim.slug);
  const whimHeading = await publicPage.locator("article h1").innerText();

  await publicPage.goto("http://localhost:3000/imagination", { waitUntil: "networkidle" });
  const imaginationTitleLink = publicPage.locator(`a[href="/imagination/${existingImagination.slug}"]`).filter({ hasText: existingImagination.title });
  await imaginationTitleLink.waitFor();
  await imaginationTitleLink.click();
  await publicPage.waitForFunction((slug) => window.location.pathname === `/imagination/${slug}`, existingImagination.slug);
  const imaginationHeading = await publicPage.locator("article h1").innerText();

  await publicPage.goto("http://localhost:3000/elsewhere", { waitUntil: "networkidle" });
  const elsewhereTitleLink = publicPage.locator(`a[href="/elsewhere/${elsewhereSlug}"]`).filter({ hasText: elsewhereMarker });
  await elsewhereTitleLink.waitFor();
  const elsewhereListTypography = await elsewhereTitleLink.locator("h2").evaluate((element) => {
    const style = getComputedStyle(element);
    return { fontSize: style.fontSize, fontWeight: style.fontWeight };
  });
  await elsewhereTitleLink.click();
  await publicPage.waitForFunction((slug) => window.location.pathname === `/elsewhere/${slug}`, elsewhereSlug);
  const elsewhereHeading = await publicPage.locator("article h1").innerText();
  const elsewhereDetailTypography = await publicPage.locator("article h1").evaluate((element) => {
    const style = getComputedStyle(element);
    return { fontSize: style.fontSize, fontWeight: style.fontWeight };
  });

  for (const category of ["imagination", "elsewhere"]) {
    await managePage.getByRole("button", { name: category, exact: true }).click();
    await managePage.getByRole("button", { name: "+ new article", exact: true }).click();
    await managePage.getByPlaceholder("slug (e.g., my-first-post)").waitFor();
    await managePage.getByPlaceholder("title").waitFor();
    await managePage.getByRole("button", { name: "cancel", exact: true }).click();
  }

  if (
    whimHeading !== whimDate ||
    imaginationHeading !== existingImagination.title ||
    elsewhereHeading !== elsewhereMarker ||
    elsewhereListTypography.fontWeight === "400" ||
    elsewhereDetailTypography.fontWeight === "400"
  ) {
    throw new Error(JSON.stringify({ whimHeading, whimDate, imaginationHeading, imaginationTitle: existingImagination.title, elsewhereHeading, elsewhereMarker, elsewhereListTypography, elsewhereDetailTypography }));
  }

  console.log(JSON.stringify({ whimSlug: existingWhim.slug, whimHeading, imaginationSlug: existingImagination.slug, imaginationHeading, elsewhereSlug, elsewhereHeading, elsewhereListTypography, elsewhereDetailTypography }));
} finally {
  await browser.close();
  if (elsewhereFixtureId) {
    await softDeleteArticle(elsewhereFixtureId);
    await permanentlyDeleteArticle(elsewhereFixtureId);
  }
}

process.exit(0);
