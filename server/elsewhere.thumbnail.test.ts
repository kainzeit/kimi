import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getFirstRichTextImageSrc } from "../client/src/lib/richtext-image";

describe("Elsewhere article thumbnail extraction", () => {
  it("returns the first image source in rich text HTML", () => {
    const html = '<p>before</p><p><img src="/manus-storage/first.jpg" width="220px" /></p><img src="/manus-storage/second.jpg" />';
    expect(getFirstRichTextImageSrc(html)).toBe("/manus-storage/first.jpg");
  });

  it("supports unquoted image sources and ignores entries without images", () => {
    expect(getFirstRichTextImageSrc('<img src=/manus-storage/photo.jpg>')).toBe("/manus-storage/photo.jpg");
    expect(getFirstRichTextImageSrc("<p>an image-free note</p>")).toBeNull();
  });

  it("renders Elsewhere entries as silent, clickable first-image thumbnails", async () => {
    const source = await readFile(path.join(process.cwd(), "client/src/pages/Elsewhere.tsx"), "utf8");

    expect(source).toContain("getFirstRichTextImageSrc(article.content)");
    expect(source).toContain('href={`/elsewhere/${article.slug}`}');
    expect(source).toContain('className="h-32 w-48');
    expect(source).not.toContain("getPreview(");
    expect(source).not.toContain("new Date(article.publishedAt)");
  });
});
