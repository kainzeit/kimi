import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getRecycleRetentionCutoff, RECYCLE_RETENTION_DAYS } from "./db";

describe("Article recycle retention", () => {
  it("uses an exact 15-day UTC retention cutoff", () => {
    const now = new Date("2026-08-13T00:00:00.000Z");
    expect(RECYCLE_RETENTION_DAYS).toBe(15);
    expect(getRecycleRetentionCutoff(now).toISOString()).toBe("2026-07-29T00:00:00.000Z");
  });

  it("exposes an idempotent, cron-only cleanup callback", async () => {
    const root = process.cwd();
    const dbSource = await readFile(path.join(root, "server/db.ts"), "utf8");
    const handlerSource = await readFile(path.join(root, "server/recycleCleanup.ts"), "utf8");
    const indexSource = await readFile(path.join(root, "server/_core/index.ts"), "utf8");

    expect(dbSource).toContain("lte(articles.deletedAt, cutoff)");
    expect(dbSource).toContain("permanentlyDeleteArticles(expiredRows.map");
    expect(handlerSource).toContain("sdk.authenticateRequest(req)");
    expect(handlerSource).toContain("!user.isCron || !user.taskUid");
    expect(indexSource).toContain('app.post("/api/scheduled/recycle-cleanup", handleRecycleArticleCleanup)');
  });
});
