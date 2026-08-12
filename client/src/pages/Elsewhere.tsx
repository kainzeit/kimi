import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ManagedPageImage, type ManagedPageImageData } from "@/components/ManagedPageImage";
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
  const { data: images = [] } = trpc.images.list.useQuery({ pageKey: "elsewhere" });
  const sortedArticles = (articles || [])
    .map((article) => ({ ...article, imageSrc: getFirstRichTextImageSrc(article.content) }))
    .sort((first, second) => new Date(first.publishedAt).getTime() - new Date(second.publishedAt).getTime());
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
                    {article.imageSrc && (
                      <Link href={`/elsewhere/${article.slug}`} className="block w-fit max-w-full">
                        <img
                          src={article.imageSrc}
                          alt={article.title || "Elsewhere entry"}
                          className="elsewhere-thumbnail block h-[265px] w-auto max-w-full rounded object-contain transition-opacity hover:opacity-80"
                        />
                      </Link>
                    )}

                    <Link href={`/elsewhere/${article.slug}`}>
                      <time className="inline-block text-[11px] font-normal text-[#719199] leading-tight a-whim-date">
                        {formatEntryDate(article.publishedAt)}
                      </time>
                    </Link>

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

      {(images as any[]).length > 0 && (
        <div className="public-image-column flex flex-col gap-4 shrink-0">
          {(images as ManagedPageImageData[]).map((image) => (
            <ManagedPageImage key={image.id} image={image} fallbackHeight={189} />
          ))}
        </div>
      )}
    </div>
  );
}
