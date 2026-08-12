import { chromium } from "@playwright/test";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.goto("http://localhost:3000/manage", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "articles", exact: true }).click();
  await page.getByRole("button", { name: "elsewhere", exact: true }).click();
  await page.getByText("+ new article", { exact: true }).click();

  const titleInputs = await page.getByPlaceholder("title").count();
  const slugInputs = await page.getByPlaceholder("slug (e.g., my-first-post)").count();
  const dateHint = await page.getByText("this date will be the entry’s visible label; no separate title is needed.", { exact: true }).count();
  if (titleInputs !== 0 || slugInputs !== 1 || dateHint !== 1) {
    throw new Error(JSON.stringify({ titleInputs, slugInputs, dateHint }));
  }

  console.log(JSON.stringify({ titleInputs, slugInputs, dateHint }));
} finally {
  await browser.close();
}
