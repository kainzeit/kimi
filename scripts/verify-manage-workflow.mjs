import { chromium } from "@playwright/test";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.goto("http://localhost:3000/manage", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "articles", exact: true }).click();

  await page.getByText("+ new article", { exact: true }).waitFor();
  await page.getByText("export markdown", { exact: true }).waitFor();
  const selectionToggle = page.getByText("select all", { exact: true });

  const summary = {
    exportVisible: await page.getByText("export markdown", { exact: true }).count(),
    selectAllVisible: await selectionToggle.count(),
    previewButtons: await page.locator('button[title="Preview"]').count(),
  };

  if (!summary.exportVisible || !summary.selectAllVisible) {
    throw new Error(JSON.stringify(summary));
  }

  const downloadPromise = page.waitForEvent("download");
  await page.getByText("export markdown", { exact: true }).click();
  const download = await downloadPromise;
  summary.markdownDownload = download.suggestedFilename();
  if (!summary.markdownDownload.endsWith("-articles.md")) {
    throw new Error(JSON.stringify(summary));
  }

  if (summary.previewButtons > 0) {
    await page.locator('button[title="Preview"]').first().click();
    await page.getByText("close preview", { exact: false }).waitFor();
    await page.getByText("close preview", { exact: false }).click();
  }

  console.log(JSON.stringify(summary));
} finally {
  await browser.close();
}
