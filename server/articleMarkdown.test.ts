import { describe, expect, it } from "vitest";
import { articlesToMarkdown, richTextToMarkdown } from "./articleMarkdown";

describe("article Markdown export", () => {
  it("converts rich text links, emphasis and images into portable Markdown", () => {
    const markdown = richTextToMarkdown('<p>A <a href="https://example.com">link</a>, <strong>note</strong>, and <img src="https://example.com/photo.jpg" alt="photo" /></p>');

    expect(markdown).toContain("[link](https://example.com)");
    expect(markdown).toContain("**note**");
    expect(markdown).toContain("![photo](https://example.com/photo.jpg)");
  });

  it("exports collection metadata and includes drafts and hidden-state metadata", () => {
    const markdown = articlesToMarkdown("elsewhere", [{
      title: "Coastline",
      slug: "coastline",
      category: "elsewhere",
      content: "<p>Salt air.</p>",
      publishedAt: new Date("2026-08-12T12:00:00Z"),
      isDraft: 1,
      isHidden: 1,
    }]);

    expect(markdown).toContain("# Elsewhere");
    expect(markdown).toContain("## Coastline");
    expect(markdown).toContain("- slug: coastline");
    expect(markdown).toContain("- status: draft, hidden");
    expect(markdown).toContain("Salt air.");
  });
});
