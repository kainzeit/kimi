import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { ManagedPageImage, type ManagedPageImageData } from "@/components/ManagedPageImage";
import { Link } from "wouter";

/** Extract the first sentence/line of plain text from HTML or plain content */
function getPreview(content: string): string {
  let text = content;
  if (text.trim().startsWith("<")) {
    text = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  const match = text.match(/^(.{10,120}?[.!?。！？])/);
  if (match) return match[1];
  return text.slice(0, 100).trim() + (text.length > 100 ? "…" : "");
}

function formatWhimDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function AWhim() {
  const { data: articles, isLoading } = trpc.articles.list.useQuery({ category: "a-whim" });
  const { data: images = [] } = trpc.images.list.useQuery({ pageKey: "a-whim" });
  const [viewMode, setViewMode] = useState<"list" | "archive">("list");

  const whimArticles = articles || [];
  const archiveMap = new Map<string, typeof whimArticles>();

  if (viewMode === "archive") {
    for (const article of whimArticles) {
      const date = new Date(article.publishedAt);
      const yearMonth = date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
      const group = archiveMap.get(yearMonth) || [];
      group.push(article);
      archiveMap.set(yearMonth, group);
    }
  }

  return (
    <div className="public-content-layout">
      <div className="public-text-column flex-1 min-w-0">
        <div className="mb-8 flex items-center gap-3 text-xs tracking-wide text-muted-foreground">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "text-foreground font-semibold" : "hover:text-foreground transition"}
            aria-pressed={viewMode === "list"}
          >
            list
          </button>
          <button
            type="button"
            onClick={() => setViewMode("archive")}
            className={viewMode === "archive" ? "text-foreground font-semibold" : "hover:text-foreground transition"}
            aria-pressed={viewMode === "archive"}
          >
            archive
          </button>
        </div>

        {isLoading ? (
          <div className="flex py-12">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : whimArticles.length === 0 ? (
          <p className="text-base text-muted-foreground tracking-wide">nothing here yet.</p>
        ) : viewMode === "list" ? (
          <div className="space-y-8">
            {whimArticles.map((article) => (
              <div key={article.id}>
                <Link href={`/a-whim/${article.slug}`}>
                  <h2 className="text-[11px] font-normal text-[#719199] nav-link inline-block mb-0 leading-tight a-whim-date">
                    {formatWhimDate(article.publishedAt)}
                  </h2>
                </Link>
                {article.content && (
                  <p className="text-sm text-muted-foreground tracking-wide mt-1 leading-relaxed max-w-lg a-whim-preview">
                    {getPreview(article.content)}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {Array.from(archiveMap.entries()).map(([yearMonth, groupArticles]) => (
              <div key={yearMonth}>
                <h3 className="mb-4 text-sm font-semibold tracking-wide text-foreground">{yearMonth.toLowerCase()}</h3>
                <div className="space-y-3">
                  {groupArticles.map((article) => (
                    <div key={article.id} className="flex items-baseline gap-4">
                      <span className="w-8 shrink-0 text-xs text-muted-foreground">
                        {new Date(article.publishedAt).getDate().toString().padStart(2, "0")}
                      </span>
                      <Link href={`/a-whim/${article.slug}`}>
                        <span className="text-sm text-muted-foreground hover:text-foreground transition truncate max-w-sm block">
                          {getPreview(article.content || "")}
                        </span>
                      </Link>
                    </div>
                  ))}
                </div>
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
