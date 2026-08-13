import { chromium } from "@playwright/test";
import { COOKIE_NAME } from "../shared/const.ts";
import { sdk } from "../server/_core/sdk.ts";

const ownerOpenId = process.env.OWNER_OPEN_ID;
if (!ownerOpenId) throw new Error("OWNER_OPEN_ID is required for the owner backup verification");

const sessionToken = await sdk.createSessionToken(ownerOpenId, { name: "Backup verification" });
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.addInitScript(({ cookieName, token }) => {
    sessionStorage.setItem("manus-cookie", `${cookieName}=${token}`);
  }, { cookieName: COOKIE_NAME, token: sessionToken });

  await page.goto("http://localhost:3000/manage", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "download backup", exact: true }).waitFor();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "download backup", exact: true }).click();
  const download = await downloadPromise;
  const filename = download.suggestedFilename();
  const downloadedPath = await download.path();
  const verificationArchivePath = "/home/ubuntu/backups/manage-button-backup-test.zip";
  await download.saveAs(verificationArchivePath);

  if (!/^kimi-complete-backup-.+\.zip$/.test(filename) || !downloadedPath) {
    throw new Error(JSON.stringify({ filename, downloadedPath }));
  }

  console.log(JSON.stringify({ filename, verificationArchivePath }));
} finally {
  await browser.close();
}
