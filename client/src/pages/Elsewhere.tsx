import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getFirstRichTextImageSrc } from "@/lib/richtext-image";
import { Link } from "wouter";

function getPreview(content: string): string {
  const text = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const sentence = text.match(/^(.{1,160}?[.!?。！？])/);
  return sentence?.[1] || text.slice(0, 140).trim() + (text.length > 140 ? "…" : "");
}

function formatEntryDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Elsewhere() {
  const { data: articles, isLoading } = trpc.articles.list.useQuery({ category: "elsewhere" });
  const sortedArticles = (articles || [])
    .map((article) => ({ ...article, imageSrc: getFirstRichTextImageSrc(article.content) }))
    .sort((first, second) => new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime());
  const entryRows = Array.from({ length: Math.ceil(sortedArticles.length / 2) }, (_, rowIndex) =>
    sortedArticles.slice(rowIndex * 2, rowIndex * 2 + 2),
  );

  return (
    <div className="public-content-layout">
      <div className="public-text-column flex-1 min-w-0">
        {isLoading ? (
          <div className="flex py-12">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : sortedArticles.length === 0 ? (
          <p className="text-base text-muted-foreground tracking-wide">nothing here yet.</p>
        ) : (
          <div className="elsewhere-grid max-w-4xl">
            {entryRows.map((row, rowIndex) => (
              <div className="elsewhere-grid-row" key={`elsewhere-row-${rowIndex}`}>
                {row.map((article) => (
                  <article key={article.id} className="elsewhere-entry space-y-3">
                    <Link href={`/elsewhere/${article.slug}`}>
                      <time className="inline-block text-[11px] font-normal text-[#719199] leading-tight a-whim-date">
                        {formatEntryDate(article.publishedAt)}
                      </time>
                    </Link>

                    {article.imageSrc && (
                      <Link href={`/elsewhere/${article.slug}`} className="block w-fit max-w-full">
                        <img
                          src={article.imageSrc}
                          alt={article.title || "Elsewhere entry"}
                          className="elsewhere-thumbnail block h-[302px] w-auto max-w-full rounded object-contain transition-opacity hover:opacity-80"
                        />
                      </Link>
                    )}

                    {article.content && (
                      <p className="max-w-md text-sm leading-relaxed tracking-wide text-muted-foreground">
                        {getPreview(article.content)}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
