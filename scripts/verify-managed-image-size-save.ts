import { chromium } from "@playwright/test";
import { createImage, deleteImage, listImages } from "../server/db";

const fileKey = `browser-image-sizing-${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
const existingImage = (await listImages("home", { includeHidden: true })).find((image) => !image.deletedAt);

if (!existingImage) {
  throw new Error("Expected a source image in the home collection for browser verification.");
}

await createImage({
  url: existingImage.url,
  fileKey,
  pageKey: "home",
  uploadedBy: null,
});

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.goto("http://localhost:3000/manage?admin", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "images", exact: true }).click();
  await page.getByRole("button", { name: "home", exact: true }).click();
  await page.getByTitle("Resize image").first().click();

  await page.getByText("resize image", { exact: true }).waitFor();
  await page.getByLabel("width (px)").fill("360");
  await page.getByRole("button", { name: "save size", exact: true }).click();
  await page.getByText("resize image", { exact: true }).waitFor({ state: "detached" });

  const resized = (await listImages("home", { includeHidden: true })).find((image) => image.fileKey === fileKey);
  if (!resized || resized.displayWidth !== 360 || !resized.displayHeight) {
    throw new Error(`Saved browser dimensions did not match the test fixture: ${JSON.stringify(resized)}`);
  }

  const publicPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await publicPage.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));
  await publicPage.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const publicImage = publicPage.locator(`.managed-page-image[data-display-width="360"][data-display-height="${resized.displayHeight}"]`);
  await publicImage.waitFor();
  const publicImageMetrics = await publicImage.evaluate((image) => ({
    width: Math.round(image.getBoundingClientRect().width),
    height: Math.round(image.getBoundingClientRect().height),
  }));

  if (publicImageMetrics.width !== 360 || publicImageMetrics.height !== resized.displayHeight) {
    throw new Error(`Public page dimensions did not match the saved image size: ${JSON.stringify(publicImageMetrics)}`);
  }

  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobilePage.addInitScript(() => sessionStorage.setItem("kimi-greeted", "yes"));
  await mobilePage.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const mobileImage = mobilePage.locator(`.managed-page-image[data-display-width="360"][data-display-height="${resized.displayHeight}"]`);
  await mobileImage.waitFor();
  const mobileImageMetrics = await mobileImage.evaluate((image) => ({
    width: Math.round(image.getBoundingClientRect().width),
    viewportWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  if (mobileImageMetrics.width > mobileImageMetrics.viewportWidth || mobileImageMetrics.scrollWidth > mobileImageMetrics.viewportWidth) {
    throw new Error(`Mobile public image overflowed the viewport: ${JSON.stringify(mobileImageMetrics)}`);
  }

  console.log(JSON.stringify({ id: resized.id, displayWidth: resized.displayWidth, displayHeight: resized.displayHeight, publicImageMetrics, mobileImageMetrics }));
} finally {
  await browser.close();
  const created = (await listImages("home", { includeHidden: true, includeDeleted: true })).find(
    (image) => image.fileKey === fileKey,
  );
  if (created) await deleteImage(created.id);
}

process.exit(0);
