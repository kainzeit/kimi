import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

describe("A Whim titleless date-heading contract", () => {
  it("uses an internally generated slug and date title while hiding the editor title fields", async () => {
    const manageSource = await readFile(path.join(projectRoot, "client/src/pages/Manage.tsx"), "utf8");

    expect(manageSource).toContain('const isAWhimCategory = articleCategory === "a-whim"');
    expect(manageSource).toContain('const internalSlug = articleForm.slug || `whim-${articleForm.publishedAt.replaceAll("-", "")}-${Date.now().toString(36)}`');
    expect(manageSource).toContain('const internalTitle = isTitlelessArticleCategory ? formatWhimDate(articleForm.publishedAt) : articleForm.title.trim()');
    expect(manageSource).toContain('{!isAWhimCategory && (');
    expect(manageSource).toContain("this date will be the entry’s visible label");
  });

  it("uses the A Whim date as the clickable list title and article-detail heading", async () => {
    const listSource = await readFile(path.join(projectRoot, "client/src/pages/AWhim.tsx"), "utf8");
    const postSource = await readFile(path.join(projectRoot, "client/src/pages/Post.tsx"), "utf8");

    expect(listSource).toContain('href={`/a-whim/${article.slug}`}');
    expect(listSource).toContain("{formatWhimDate(article.publishedAt)}");
    expect(postSource).toContain("const isAWhim = !isImagination && !isElsewhere;");
    expect(postSource).toContain("{!isTitlelessEntry && (");
    expect(postSource).toContain("? new Date(article.publishedAt).toLocaleDateString");
  });

  it("uses body-sized, regular-weight typography for A Whim dates only", async () => {
    const listSource = await readFile(path.join(projectRoot, "client/src/pages/AWhim.tsx"), "utf8");
    const postSource = await readFile(path.join(projectRoot, "client/src/pages/Post.tsx"), "utf8");
    const manageSource = await readFile(path.join(projectRoot, "client/src/pages/Manage.tsx"), "utf8");
    const cssSource = await readFile(path.join(projectRoot, "client/src/index.css"), "utf8");

    expect(listSource).toContain('className="text-[11px] font-normal text-[#719199] nav-link inline-block mb-0 leading-tight a-whim-date"');
    expect(listSource).toContain('className="text-sm text-muted-foreground tracking-wide mt-1 leading-relaxed max-w-lg a-whim-preview"');
    expect(postSource).toContain('isTitlelessEntry ? "text-[11px] font-normal text-[#719199] leading-tight a-whim-date-heading" : "text-2xl font-bold"');
    expect(postSource).toContain('isAWhim ? "a-whim-post" : ""');
    expect(postSource).toContain('isTitlelessEntry ? "a-whim-title-row mb-6" : "mb-6"');
    expect(cssSource).toContain(".a-whim-title-row");
    expect(cssSource).toContain(".public-post-layout .a-whim-post h1.a-whim-date-heading");
    expect(cssSource).toContain("font-size: 0.75rem;");
    expect(manageSource).toContain('isTitleless ? "text-[11px] font-normal text-[#719199] leading-tight a-whim-date-heading" : "text-2xl font-bold"');
  });

  it("keeps a title-led workflow for Imagination while Elsewhere shares the date-record workflow", async () => {
    const manageSource = await readFile(path.join(projectRoot, "client/src/pages/Manage.tsx"), "utf8");
    const postSource = await readFile(path.join(projectRoot, "client/src/pages/Post.tsx"), "utf8");

    expect(manageSource).toContain('{!isTitlelessArticleCategory && (');
    expect(manageSource).toContain('placeholder="slug (e.g., my-first-post)"');
    expect(manageSource).toContain('placeholder="title"');
    expect(postSource).toContain(": article.title}");
  });
});
