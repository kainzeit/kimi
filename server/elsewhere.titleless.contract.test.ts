import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

describe("Elsewhere titleless entry contract", () => {
  it("hides the title field and derives an internal title from the selected date", async () => {
    const manageSource = await readFile(path.join(projectRoot, "client/src/pages/Manage.tsx"), "utf8");

    expect(manageSource).toContain('const isTitlelessArticleCategory = isAWhimCategory || articleCategory === "elsewhere"');
    expect(manageSource).toContain('const internalTitle = isTitlelessArticleCategory ? formatWhimDate(articleForm.publishedAt)');
    expect(manageSource).toContain('{!isTitlelessArticleCategory && (');
    expect(manageSource).toContain('this date will be the entry’s visible label; no separate title is needed.');
  });

  it("uses the date rather than the stored Elsewhere title on article detail pages", async () => {
    const postSource = await readFile(path.join(projectRoot, "client/src/pages/Post.tsx"), "utf8");

    expect(postSource).toContain("const isTitlelessEntry = isAWhim || isElsewhere;");
    expect(postSource).toContain("{isTitlelessEntry");
    expect(postSource).toContain("? new Date(article.publishedAt).toLocaleDateString");
  });
});
