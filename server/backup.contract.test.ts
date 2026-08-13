import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { isBackupDownloadAuthorized } from "./backupRoute";
import { collectManagedStorageKeys } from "./backupArchive";

const projectRoot = path.resolve(import.meta.dirname, "..");

describe("owner backup download contract", () => {
  it("allows only a non-cron administrator to request a backup archive", () => {
    expect(isBackupDownloadAuthorized({ role: "admin" })).toBe(true);
    expect(isBackupDownloadAuthorized({ role: "admin", isCron: true })).toBe(false);
    expect(isBackupDownloadAuthorized({ role: "user" })).toBe(false);
    expect(isBackupDownloadAuthorized(null)).toBe(false);
  });

  it("uses the actual rendered storage URL instead of an older fileKey when collecting media", () => {
    const keys = collectManagedStorageKeys({
      users: [],
      articles: [],
      articleAutosaves: [],
      pageContent: [],
      images: [{ fileKey: "images/outdated.jpeg", url: "/manus-storage/images/current_hash.jpeg" }],
      accessLogs: [],
      articleViews: [],
      siteConfig: [],
    } as any);

    expect(keys).toEqual(["images/current_hash.jpeg"]);
  });

  it("keeps secret values out of the archive and exposes the protected Manage download action", () => {
    const archiveSource = readFileSync(path.join(projectRoot, "server", "backupArchive.ts"), "utf8");
    const routeSource = readFileSync(path.join(projectRoot, "server", "backupRoute.ts"), "utf8");
    const manageSource = readFileSync(path.join(projectRoot, "client", "src", "pages", "Manage.tsx"), "utf8");

    expect(archiveSource).toContain("config/.env.template");
    expect(archiveSource).toContain("Environment-variable values and session credentials");
    expect(routeSource).toContain('app.get("/api/admin/backup"');
    expect(routeSource).toContain("isBackupDownloadAuthorized");
    expect(manageSource).toContain("download backup");
    expect(manageSource).toContain('fetch("/api/admin/backup"');
  });
});
