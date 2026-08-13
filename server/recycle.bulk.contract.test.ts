import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Article recycle batch permanent deletion UI", () => {
  it("provides separate recycle selection, select-all, and explicit permanent-delete confirmation", async () => {
    const root = process.cwd();
    const manageSource = await readFile(path.join(root, "client/src/pages/Manage.tsx"), "utf8");
    const routerSource = await readFile(path.join(root, "server/routers.ts"), "utf8");

    expect(manageSource).toContain("selectedRecycleArticleIds");
    expect(manageSource).toContain("allDeletedArticlesSelected");
    expect(manageSource).toContain("select all");
    expect(manageSource).toContain("permanently delete selected");
    expect(manageSource).toContain("This cannot be undone.");
    expect(manageSource).toContain("15 days before automatic permanent removal");
    expect(routerSource).toContain("batchPermanentlyDelete");
  });
});
