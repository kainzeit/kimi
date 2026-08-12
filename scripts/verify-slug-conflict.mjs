import { chromium } from "@playwright/test";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.goto("http://localhost:3000/manage", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "articles", exact: true }).click();
  await page.getByRole("button", { name: "elsewhere", exact: true }).click();
  await page.getByText("+ new article", { exact: true }).click();

  await page.getByPlaceholder("slug (e.g., my-first-post)").fill("test3");
  await page.getByPlaceholder("title").fill("Duplicate test");
  await page.locator(".ProseMirror").fill("<p>Duplicate test content</p>");
  await page.getByRole("button", { name: "save as draft", exact: true }).click();

  const alert = page.getByRole("alert");
  await alert.waitFor();
  const message = await alert.textContent();
  if (!message?.includes("The link “test3” is already used")) throw new Error(message || "Missing duplicate-slug alert");
  if (message.includes("Failed query")) throw new Error("Raw database error leaked into Manage");

  console.log(JSON.stringify({ alert: message }));
} finally {
  await browser.close();
}
