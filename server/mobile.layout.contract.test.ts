import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

describe("Mobile public-site layout contract", () => {
  it("keeps the public navigation collapsible and closes it after navigation", async () => {
    const appSource = await readFile(path.join(projectRoot, "client/src/App.tsx"), "utf8");

    expect(appSource).toContain('useState(false)');
    expect(appSource).toContain('className={`site-sidebar ${mobileNavOpen ? "mobile-nav-open" : ""}`}');
    expect(appSource).toContain('aria-controls="primary-navigation"');
    expect(appSource).toContain('onClick={() => setMobileNavOpen(false)}');
    expect(appSource).toContain('if (event.key === "Escape") setMobileNavOpen(false)');
  });

  it("reserves no sidebar width for mobile article reading and prevents content overflow", async () => {
    const styles = await readFile(path.join(projectRoot, "client/src/index.css"), "utf8");

    expect(styles).toContain('.site-sidebar.mobile-nav-open .site-nav');
    expect(styles).toContain('.public-post-layout {\n    width: 100%;\n    max-width: none;');
    expect(styles).toContain('overflow-x: clip;');
    expect(styles).toContain('.public-post-layout .prose-content img');
    expect(styles).toContain('max-width: 100% !important;');
  });

  it("uses saved page-image dimensions on desktop and compact article line height", async () => {
    const imageComponent = await readFile(path.join(projectRoot, "client/src/components/ManagedPageImage.tsx"), "utf8");
    const postSource = await readFile(path.join(projectRoot, "client/src/pages/Post.tsx"), "utf8");
    const styles = await readFile(path.join(projectRoot, "client/src/index.css"), "utf8");

    expect(imageComponent).toContain('maxWidth: hasSavedSize ? "none" : "100%"');
    expect(imageComponent).toContain('objectFit: hasSavedSize ? "fill" : "contain"');
    expect(postSource).toContain("prose-content article-reading-content text-base tracking-wide");
    expect(styles).toContain("line-height: 1.625;");
  });

  it("provides remembered compact and comfortable article reading-density modes", async () => {
    const postSource = await readFile(path.join(projectRoot, "client/src/pages/Post.tsx"), "utf8");
    const styles = await readFile(path.join(projectRoot, "client/src/index.css"), "utf8");

    expect(postSource).toContain('const READING_DENSITY_STORAGE_KEY = "kimi-reading-density"');
    expect(postSource).toContain('sessionStorage.setItem(READING_DENSITY_STORAGE_KEY, readingDensity)');
    expect(postSource).toContain('aria-label="Reading density"');
    expect(postSource).toContain('onClick={() => setReadingDensity("compact")}');
    expect(postSource).toContain('onClick={() => setReadingDensity("comfortable")}');
    expect(styles).toContain(".article-density-compact .article-reading-content");
    expect(styles).toContain("line-height: 1.45;");
  });
});
