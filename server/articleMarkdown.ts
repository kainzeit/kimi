export type MarkdownArticle = {
  title: string;
  slug: string;
  content: string;
  category: string;
  publishedAt: Date | string;
  isDraft?: number | boolean;
  isHidden?: number | boolean;
};

const categoryLabels: Record<string, string> = {
  "a-whim": "A Whim",
  imagination: "Imagination",
  elsewhere: "Elsewhere",
};

const decodeEntities = (value: string) => value
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'");

export function richTextToMarkdown(content: string) {
  if (!content.trim().startsWith("<")) return content.trim();

  const markdown = content
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<hr\s*\/?\s*>/gi, "\n\n---\n\n")
    .replace(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, "![$2]($1)")
    .replace(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi, "![]($1)")
    .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, "**$2**")
    .replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, "*$2*")
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n")
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "\n\n> $1\n\n")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1")
    .replace(/<\/(p|div|ul|ol)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "");

  return decodeEntities(markdown)
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

export function articlesToMarkdown(category: string, articles: MarkdownArticle[]) {
  const label = categoryLabels[category] ?? category;
  const exportedAt = new Date().toISOString();
  const entries = articles.map((article) => {
    const status = [article.isDraft ? "draft" : "published", article.isHidden ? "hidden" : "visible"].join(", ");
    const date = new Date(article.publishedAt).toISOString().slice(0, 10);
    return [
      `## ${article.title || date}`,
      "",
      `- slug: ${article.slug}`,
      `- date: ${date}`,
      `- status: ${status}`,
      "",
      richTextToMarkdown(article.content),
    ].join("\n");
  });

  return [`# ${label}`, "", `Exported: ${exportedAt}`, `Entries: ${articles.length}`, "", entries.join("\n\n---\n\n")].join("\n").trimEnd() + "\n";
}
