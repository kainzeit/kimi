import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

describe("A Whim titleless date-heading contract", () => {
  it("uses an internally generated slug and date title while hiding the editor title fields", async () => {
    const manageSource = await readFile(path.join(projectRoot, "client/src/pages/Manage.tsx"), "utf8");

    expect(manageSource).toContain('const isAWhimCategory = articleCategory === "a-whim"');
    expect(manageSource).toContain('const internalSlug = articleForm.slug || `whim-${articleForm.publishedAt.replaceAll("-", "")}-${Date.now().toString(36)}`');
    expect(manageSource).toContain('const internalTitle = isAWhimCategory ? formatWhimDate(articleForm.publishedAt) : articleForm.title.trim()');
    expect(manageSource).toContain('{!isAWhimCategory && (');
    expect(manageSource).toContain("this date will be the entry’s clickable title");
  });

  it("uses the A Whim date as the clickable list title and article-detail heading", async () => {
    const listSource = await readFile(path.join(projectRoot, "client/src/pages/AWhim.tsx"), "utf8");
    const postSource = await readFile(path.join(projectRoot, "client/src/pages/Post.tsx"), "utf8");

    expect(listSource).toContain('href={`/a-whim/${article.slug}`}');
    expect(listSource).toContain("{formatWhimDate(article.publishedAt)}");
    expect(postSource).toContain("const isAWhim = !isImagination && !isElsewhere;");
    expect(postSource).toContain("{!isAWhim && (");
    expect(postSource).toContain("? new Date(article.publishedAt).toLocaleDateString");
  });

  it("uses body-sized, regular-weight typography for A Whim dates only", async () => {
    const listSource = await readFile(path.join(projectRoot, "client/src/pages/AWhim.tsx"), "utf8");
    const postSource = await readFile(path.join(projectRoot, "client/src/pages/Post.tsx"), "utf8");
    const manageSource = await readFile(path.join(projectRoot, "client/src/pages/Manage.tsx"), "utf8");

    expect(listSource).toContain('className="text-xs font-normal nav-link inline-block mb-1"');
    expect(postSource).toContain('isAWhim ? "text-sm font-normal" : "text-2xl font-bold"');
    expect(manageSource).toContain('isAWhim ? "text-sm font-normal" : "text-2xl font-bold"');
  });

  it("keeps title-led workflows for Imagination and Elsewhere", async () => {
    const manageSource = await readFile(path.join(projectRoot, "client/src/pages/Manage.tsx"), "utf8");
    const postSource = await readFile(path.join(projectRoot, "client/src/pages/Post.tsx"), "utf8");

    expect(manageSource).toContain('{!isAWhimCategory && (');
    expect(manageSource).toContain('placeholder="slug (e.g., my-first-post)"');
    expect(manageSource).toContain('placeholder="title"');
    expect(postSource).toContain(": article.title}");
  });
});
